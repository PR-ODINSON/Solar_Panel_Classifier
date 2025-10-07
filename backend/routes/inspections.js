import express from 'express';
import Inspection from '../models/Inspection.js';
import Panel from '../models/Panel.js';
import { authenticate, requireMaintenanceOrAdmin, requireAdmin, createRateLimit } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting
const inspectionRateLimit = createRateLimit(15 * 60 * 1000, 30); // 30 requests per 15 minutes

/**
 * @route   GET /api/inspections
 * @desc    Get all inspections with filtering and pagination
 * @access  Private
 */
router.get('/', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            priority,
            inspector,
            panel,
            overallRating,
            sortBy = 'inspectionDate',
            sortOrder = 'desc',
            search
        } = req.query;

        // Build query
        const query = {};
        
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (inspector) query.inspector = inspector;
        if (panel) query.panel = panel;
        if (overallRating) query.overallRating = overallRating;
        
        if (search) {
            query.$or = [
                { inspectionId: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        // For non-admin users, only show their own inspections
        if (req.user.role !== 'admin') {
            query.inspector = req.user._id;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [inspections, total] = await Promise.all([
            Inspection.find(query)
                .populate('panel', 'panelId serialNumber location.site status')
                .populate('inspector', 'firstName lastName username')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Inspection.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                inspections,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get inspections error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inspections',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/inspections/stats
 * @desc    Get inspection statistics
 * @access  Private
 */
router.get('/stats', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { inspector: req.user._id };

        const [
            totalInspections,
            completedInspections,
            pendingInspections,
            criticalInspections,
            overdueInspections
        ] = await Promise.all([
            Inspection.countDocuments(query),
            Inspection.countDocuments({ ...query, status: 'completed' }),
            Inspection.countDocuments({ ...query, status: { $in: ['scheduled', 'in_progress'] } }),
            Inspection.countDocuments({ ...query, priority: 'critical' }),
            Inspection.countDocuments({
                ...query,
                nextInspectionDate: { $lt: new Date() },
                status: { $ne: 'completed' }
            })
        ]);

        // Get inspection counts by rating
        const ratingStats = await Inspection.aggregate([
            { $match: query },
            { $group: { _id: '$overallRating', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                total: totalInspections,
                completed: completedInspections,
                pending: pendingInspections,
                critical: criticalInspections,
                overdue: overdueInspections,
                byRating: ratingStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('Get inspection stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inspection statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/inspections/:id
 * @desc    Get inspection by ID
 * @access  Private
 */
router.get('/:id', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const query = { _id: req.params.id };
        
        // For non-admin users, only allow access to their own inspections
        if (req.user.role !== 'admin') {
            query.inspector = req.user._id;
        }

        const inspection = await Inspection.findOne(query)
            .populate('panel', 'panelId serialNumber manufacturer model location status')
            .populate('inspector', 'firstName lastName username email')
            .lean();

        if (!inspection) {
            return res.status(404).json({
                success: false,
                message: 'Inspection not found'
            });
        }

        res.json({
            success: true,
            data: { inspection }
        });

    } catch (error) {
        console.error('Get inspection error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid inspection ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch inspection',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/inspections
 * @desc    Create new inspection
 * @access  Private
 */
router.post('/', authenticate, requireMaintenanceOrAdmin, inspectionRateLimit, async (req, res) => {
    try {
        const inspectionData = {
            ...req.body
        };

        // Set inspector only if not provided (for AI-based inspections)
        if (!inspectionData.inspector) {
            inspectionData.inspector = req.user._id;
        }

        // Generate inspection ID if not provided
        if (!inspectionData.inspectionId) {
            // Use timestamp + random number to ensure uniqueness
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            inspectionData.inspectionId = `INS${timestamp}${random}`;
        }

        // Verify panel exists if provided
        if (inspectionData.panel) {
            const panel = await Panel.findById(inspectionData.panel);
            if (!panel) {
                return res.status(400).json({
                    success: false,
                    message: 'Panel not found'
                });
            }
        }

        // Verify panels array if provided
        if (inspectionData.panels && inspectionData.panels.length > 0) {
            const panels = await Panel.find({ _id: { $in: inspectionData.panels } });
            if (panels.length !== inspectionData.panels.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more panels not found'
                });
            }
        }

        const inspection = new Inspection(inspectionData);
        await inspection.save();

        // Populate the response
        await inspection.populate('panel', 'panelId serialNumber location.site');
        await inspection.populate('inspector', 'firstName lastName username');

        res.status(201).json({
            success: true,
            message: 'Inspection created successfully',
            data: { inspection }
        });

    } catch (error) {
        console.error('Create inspection error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Inspection ID already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create inspection',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/inspections/:id
 * @desc    Update inspection
 * @access  Private
 */
router.put('/:id', authenticate, requireMaintenanceOrAdmin, inspectionRateLimit, async (req, res) => {
    try {
        const query = { _id: req.params.id };
        
        // For non-admin users, only allow updating their own inspections
        if (req.user.role !== 'admin') {
            query.inspector = req.user._id;
        }

        const updates = req.body;
        
        // Don't allow changing inspector unless admin
        if (req.user.role !== 'admin') {
            delete updates.inspector;
        }

        const inspection = await Inspection.findOneAndUpdate(
            query,
            updates,
            { new: true, runValidators: true }
        )
        .populate('panel', 'panelId serialNumber location.site')
        .populate('inspector', 'firstName lastName username');

        if (!inspection) {
            return res.status(404).json({
                success: false,
                message: 'Inspection not found'
            });
        }

        res.json({
            success: true,
            message: 'Inspection updated successfully',
            data: { inspection }
        });

    } catch (error) {
        console.error('Update inspection error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid inspection ID'
            });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update inspection',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   DELETE /api/inspections/:id
 * @desc    Delete inspection (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        // Only admin can delete inspections
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can delete inspections'
            });
        }

        const inspection = await Inspection.findByIdAndDelete(req.params.id);

        if (!inspection) {
            return res.status(404).json({
                success: false,
                message: 'Inspection not found'
            });
        }

        res.json({
            success: true,
            message: 'Inspection deleted successfully'
        });

    } catch (error) {
        console.error('Delete inspection error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid inspection ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete inspection',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/inspections/overdue
 * @desc    Get overdue inspections
 * @access  Private
 */
router.get('/status/overdue', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const query = {
            nextInspectionDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        };

        // For non-admin users, only show their own inspections
        if (req.user.role !== 'admin') {
            query.inspector = req.user._id;
        }

        const overdueInspections = await Inspection.find(query)
            .populate('panel', 'panelId serialNumber location.site status')
            .populate('inspector', 'firstName lastName username')
            .sort({ nextInspectionDate: 1 })
            .lean();

        res.json({
            success: true,
            data: { inspections: overdueInspections }
        });

    } catch (error) {
        console.error('Get overdue inspections error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch overdue inspections',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/inspections/critical
 * @desc    Get critical inspections
 * @access  Private
 */
router.get('/priority/critical', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const query = {
            $or: [
                { priority: 'critical' },
                { overallRating: 'critical' },
                { healthScore: { $lt: 30 } }
            ]
        };

        // For non-admin users, only show their own inspections
        if (req.user.role !== 'admin') {
            query.inspector = req.user._id;
        }

        const criticalInspections = await Inspection.find(query)
            .populate('panel', 'panelId serialNumber location.site status')
            .populate('inspector', 'firstName lastName username')
            .sort({ inspectionDate: -1 })
            .lean();

        res.json({
            success: true,
            data: { inspections: criticalInspections }
        });

    } catch (error) {
        console.error('Get critical inspections error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch critical inspections',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   DELETE /api/inspections/:id
 * @desc    Delete inspection and related defects
 * @access  Admin only
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const inspectionId = req.params.id;
        
        // Check if inspection exists
        const inspection = await Inspection.findById(inspectionId);
        if (!inspection) {
            return res.status(404).json({
                success: false,
                message: 'Inspection not found'
            });
        }

        // Delete related defects first
        const Defect = (await import('../models/Defect.js')).default;
        await Defect.deleteMany({ inspection: inspectionId });

        // Delete the inspection
        await Inspection.findByIdAndDelete(inspectionId);

        res.json({
            success: true,
            message: 'Inspection and related defects deleted successfully'
        });

    } catch (error) {
        console.error('Delete inspection error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid inspection ID'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete inspection',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
