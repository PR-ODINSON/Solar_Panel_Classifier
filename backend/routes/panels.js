import express from 'express';
import Panel from '../models/Panel.js';
import { authenticate, requireMaintenanceOrAdmin, createRateLimit } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting
const panelRateLimit = createRateLimit(15 * 60 * 1000, 50); // 50 requests per 15 minutes

/**
 * @route   GET /api/panels
 * @desc    Get all panels with filtering and pagination
 * @access  Private
 */
router.get('/', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            site,
            sortBy = 'panelId',
            sortOrder = 'asc',
            search
        } = req.query;

        // Build query
        const query = {};
        
        if (status) query.status = status;
        if (site) query['location.site'] = site;
        
        if (search) {
            query.$or = [
                { panelId: { $regex: search, $options: 'i' } },
                { serialNumber: { $regex: search, $options: 'i' } },
                { manufacturer: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [panels, total] = await Promise.all([
            Panel.find(query)
                .populate('assignedTechnician', 'firstName lastName username')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Panel.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                panels,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get panels error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch panels',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/panels/stats
 * @desc    Get panel statistics
 * @access  Private
 */
router.get('/stats', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const [
            totalPanels,
            activePanels,
            inactivePanels,
            maintenancePanels,
            defectivePanels
        ] = await Promise.all([
            Panel.countDocuments(),
            Panel.countDocuments({ status: 'active' }),
            Panel.countDocuments({ status: 'inactive' }),
            Panel.countDocuments({ status: 'maintenance' }),
            Panel.countDocuments({ status: 'defective' })
        ]);

        // Get panel counts by site
        const siteStats = await Panel.aggregate([
            { $group: { _id: '$location.site', count: { $sum: 1 } } }
        ]);

        // Get average health score
        const healthStats = await Panel.aggregate([
            { $group: { _id: null, avgHealth: { $avg: '$healthScore' } } }
        ]);

        res.json({
            success: true,
            data: {
                total: totalPanels,
                active: activePanels,
                inactive: inactivePanels,
                maintenance: maintenancePanels,
                defective: defectivePanels,
                averageHealth: healthStats[0]?.avgHealth || 0,
                bySite: siteStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('Get panel stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch panel statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/panels/:id
 * @desc    Get panel by ID
 * @access  Private
 */
router.get('/:id', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const panel = await Panel.findById(req.params.id)
            .populate('assignedTechnician', 'firstName lastName username email')
            .lean();

        if (!panel) {
            return res.status(404).json({
                success: false,
                message: 'Panel not found'
            });
        }

        res.json({
            success: true,
            data: { panel }
        });

    } catch (error) {
        console.error('Get panel error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid panel ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch panel',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/panels
 * @desc    Create new panel
 * @access  Private (Admin only)
 */
router.post('/', authenticate, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const panel = new Panel(req.body);
        await panel.save();

        // Populate the response
        await panel.populate('assignedTechnician', 'firstName lastName username');

        res.status(201).json({
            success: true,
            message: 'Panel created successfully',
            data: { panel }
        });

    } catch (error) {
        console.error('Create panel error:', error);
        
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
                message: 'Panel ID or serial number already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create panel',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/panels/:id
 * @desc    Update panel
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, panelRateLimit, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const panel = await Panel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        .populate('assignedTechnician', 'firstName lastName username');

        if (!panel) {
            return res.status(404).json({
                success: false,
                message: 'Panel not found'
            });
        }

        res.json({
            success: true,
            message: 'Panel updated successfully',
            data: { panel }
        });

    } catch (error) {
        console.error('Update panel error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid panel ID'
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
            message: 'Failed to update panel',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/panels/site/:site
 * @desc    Get panels by site
 * @access  Private
 */
router.get('/site/:site', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const panels = await Panel.find({ 'location.site': req.params.site })
            .populate('assignedTechnician', 'firstName lastName username')
            .sort({ panelId: 1 })
            .lean();

        res.json({
            success: true,
            data: { panels }
        });

    } catch (error) {
        console.error('Get panels by site error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch panels by site',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/panels/needing-inspection
 * @desc    Get panels needing inspection
 * @access  Private
 */
router.get('/status/needing-inspection', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const panels = await Panel.findNeedingInspection()
            .populate('assignedTechnician', 'firstName lastName username')
            .sort({ nextInspectionDate: 1 })
            .lean();

        res.json({
            success: true,
            data: { panels }
        });

    } catch (error) {
        console.error('Get panels needing inspection error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch panels needing inspection',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
