import express from 'express';
import Defect from '../models/Defect.js';
import Panel from '../models/Panel.js';
import { authenticate, requireMaintenanceOrAdmin, createRateLimit } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting
const defectRateLimit = createRateLimit(15 * 60 * 1000, 30); // 30 requests per 15 minutes

/**
 * @route   GET /api/defects
 * @desc    Get all defects with filtering and pagination
 * @access  Private
 */
router.get('/', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            severity,
            priority,
            defectType,
            assignedTo,
            panel,
            sortBy = 'detectedDate',
            sortOrder = 'desc',
            search
        } = req.query;

        // Build query
        const query = {};
        
        if (status) query.status = status;
        if (severity) query.severity = severity;
        if (priority) query.priority = priority;
        if (defectType) query.defectType = defectType;
        if (assignedTo) query.assignedTo = assignedTo;
        if (panel) query.panel = panel;
        
        if (search) {
            query.$or = [
                { defectId: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.description': { $regex: search, $options: 'i' } }
            ];
        }

        // For non-admin users, show defects they reported or are assigned to
        if (req.user.role !== 'admin') {
            query.$or = [
                { reportedBy: req.user._id },
                { assignedTo: req.user._id }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [defects, total] = await Promise.all([
            Defect.find(query)
                .populate('panel', 'panelId serialNumber location.site status')
                .populate('reportedBy', 'firstName lastName username')
                .populate('assignedTo', 'firstName lastName username')
                .populate('inspection', 'inspectionId inspectionDate')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Defect.countDocuments(query)
        ]);


        res.json({
            success: true,
            data: {
                defects,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get defects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch defects',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/defects/stats
 * @desc    Get defect statistics
 * @access  Private
 */
router.get('/stats', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        let query = {};
        
        // For non-admin users, filter by their involvement
        if (req.user.role !== 'admin') {
            query.$or = [
                { reportedBy: req.user._id },
                { assignedTo: req.user._id }
            ];
        }

        const [
            totalDefects,
            openDefects,
            resolvedDefects,
            criticalDefects,
            overdueDefects
        ] = await Promise.all([
            Defect.countDocuments(query),
            Defect.countDocuments({ ...query, status: 'open' }),
            Defect.countDocuments({ ...query, status: 'resolved' }),
            Defect.countDocuments({ ...query, severity: 'critical' }),
            Defect.findOverdue().countDocuments(query)
        ]);

        // Get defect counts by type
        const typeStats = await Defect.aggregate([
            { $match: query },
            { $group: { _id: '$defectType', count: { $sum: 1 } } }
        ]);

        // Get defect counts by severity
        const severityStats = await Defect.aggregate([
            { $match: query },
            { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                total: totalDefects,
                open: openDefects,
                resolved: resolvedDefects,
                critical: criticalDefects,
                overdue: overdueDefects,
                byType: typeStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                bySeverity: severityStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('Get defect stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch defect statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/defects/:id
 * @desc    Get defect by ID
 * @access  Private
 */
router.get('/:id', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        let query = { _id: req.params.id };
        
        // For non-admin users, only allow access to defects they're involved with
        if (req.user.role !== 'admin') {
            console.log('Non-admin user accessing defect:', {
                userId: req.user._id,
                username: req.user.username,
                defectId: req.params.id
            });
            query.$or = [
                { reportedBy: req.user._id },
                { assignedTo: req.user._id }
            ];
            console.log('Query for defect access:', JSON.stringify(query, null, 2));
        }

        const defect = await Defect.findOne(query)
            .populate('panel', 'panelId serialNumber manufacturer model location status')
            .populate('reportedBy', 'firstName lastName username email')
            .populate('assignedTo', 'firstName lastName username email')
            .populate('inspection', 'inspectionId inspectionDate overallRating')
            .populate('resolution.resolvedBy', 'firstName lastName username')
            .populate('resolution.verifiedBy', 'firstName lastName username')
            .populate('notes.author', 'firstName lastName username')
            .lean();

        console.log('Defect found:', defect ? {
            defectId: defect.defectId,
            assignedTo: defect.assignedTo,
            reportedBy: defect.reportedBy
        } : 'No defect found');

        if (!defect) {
            return res.status(404).json({
                success: false,
                message: 'Defect not found'
            });
        }

        res.json({
            success: true,
            data: { defect }
        });

    } catch (error) {
        console.error('Get defect error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid defect ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch defect',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/defects
 * @desc    Create new defect
 * @access  Private
 */
router.post('/', authenticate, requireMaintenanceOrAdmin, defectRateLimit, async (req, res) => {
    try {
        const defectData = {
            ...req.body
        };

        // Set reportedBy only if not provided (for AI-detected defects)
        if (!defectData.reportedBy) {
            defectData.reportedBy = req.user._id;
        }

        // Generate defect ID if not provided
        if (!defectData.defectId) {
            const count = await Defect.countDocuments();
            defectData.defectId = `DEF${String(count + 1).padStart(6, '0')}`;
        }

        // Verify panel exists if provided
        if (defectData.panel) {
            const panel = await Panel.findById(defectData.panel);
            if (!panel) {
                return res.status(400).json({
                    success: false,
                    message: 'Panel not found'
                });
            }
        }

        const defect = new Defect(defectData);
        await defect.save();

        // Populate the response
        await defect.populate('panel', 'panelId serialNumber location.site');
        await defect.populate('reportedBy', 'firstName lastName username');
        if (defect.assignedTo) {
            await defect.populate('assignedTo', 'firstName lastName username');
        }

        res.status(201).json({
            success: true,
            message: 'Defect created successfully',
            data: { defect }
        });

    } catch (error) {
        console.error('Create defect error:', error);
        
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
                message: 'Defect ID already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create defect',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/defects/:id
 * @desc    Update defect
 * @access  Private
 */
router.put('/:id', authenticate, requireMaintenanceOrAdmin, defectRateLimit, async (req, res) => {
    try {
        let query = { _id: req.params.id };
        
        // For non-admin users, only allow updating defects they're involved with
        if (req.user.role !== 'admin') {
            query.$or = [
                { reportedBy: req.user._id },
                { assignedTo: req.user._id }
            ];
        }

        const updates = req.body;
        
        // Don't allow changing reporter unless admin
        if (req.user.role !== 'admin') {
            delete updates.reportedBy;
        }

        const defect = await Defect.findOneAndUpdate(
            query,
            updates,
            { new: true, runValidators: true }
        )
        .populate('panel', 'panelId serialNumber location.site')
        .populate('reportedBy', 'firstName lastName username')
        .populate('assignedTo', 'firstName lastName username');

        if (!defect) {
            return res.status(404).json({
                success: false,
                message: 'Defect not found'
            });
        }

        res.json({
            success: true,
            message: 'Defect updated successfully',
            data: { defect }
        });

    } catch (error) {
        console.error('Update defect error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid defect ID'
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
            message: 'Failed to update defect',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/defects/:id/notes
 * @desc    Add note to defect
 * @access  Private
 */
router.post('/:id/notes', authenticate, requireMaintenanceOrAdmin, defectRateLimit, async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Note text is required'
            });
        }

        let query = { _id: req.params.id };
        
        // For non-admin users, only allow adding notes to defects they're involved with
        if (req.user.role !== 'admin') {
            query.$or = [
                { reportedBy: req.user._id },
                { assignedTo: req.user._id }
            ];
        }

        const defect = await Defect.findOneAndUpdate(
            query,
            {
                $push: {
                    notes: {
                        text,
                        author: req.user._id,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        )
        .populate('notes.author', 'firstName lastName username');

        if (!defect) {
            return res.status(404).json({
                success: false,
                message: 'Defect not found'
            });
        }

        res.json({
            success: true,
            message: 'Note added successfully',
            data: { defect }
        });

    } catch (error) {
        console.error('Add defect note error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid defect ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to add note',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/defects/critical
 * @desc    Get critical defects
 * @access  Private
 */
router.get('/priority/critical', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        let query = {
            $or: [
                { severity: 'critical' },
                { priority: 'critical' }
            ],
            status: { $nin: ['resolved', 'closed'] }
        };

        // For non-admin users, filter by their involvement
        if (req.user.role !== 'admin') {
            query.$and = [
                query,
                {
                    $or: [
                        { reportedBy: req.user._id },
                        { assignedTo: req.user._id }
                    ]
                }
            ];
        }

        const criticalDefects = await Defect.find(query)
            .populate('panel', 'panelId serialNumber location.site status')
            .populate('reportedBy', 'firstName lastName username')
            .populate('assignedTo', 'firstName lastName username')
            .sort({ detectedDate: -1 })
            .lean();

        res.json({
            success: true,
            data: { defects: criticalDefects }
        });

    } catch (error) {
        console.error('Get critical defects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch critical defects',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/defects/overdue
 * @desc    Get overdue defects
 * @access  Private
 */
router.get('/status/overdue', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        let baseQuery = {};
        
        // For non-admin users, filter by their involvement
        if (req.user.role !== 'admin') {
            baseQuery.$or = [
                { reportedBy: req.user._id },
                { assignedTo: req.user._id }
            ];
        }

        const overdueDefects = await Defect.findOverdue()
            .find(baseQuery)
            .populate('panel', 'panelId serialNumber location.site status')
            .populate('reportedBy', 'firstName lastName username')
            .populate('assignedTo', 'firstName lastName username')
            .sort({ detectedDate: 1 })
            .lean();

        res.json({
            success: true,
            data: { defects: overdueDefects }
        });

    } catch (error) {
        console.error('Get overdue defects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch overdue defects',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
