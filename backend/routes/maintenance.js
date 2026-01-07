import express from 'express';
import MaintenanceTask from '../models/MaintenanceTask.js';
import Panel from '../models/Panel.js';
import User from '../models/User.js';
import { authenticate, requireMaintenanceOrAdmin, requireAdmin, createRateLimit } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting
const maintenanceRateLimit = createRateLimit(15 * 60 * 1000, 30); // 30 requests per 15 minutes

/**
 * @route   GET /api/maintenance
 * @desc    Get all maintenance tasks with filtering and pagination
 * @access  Private
 */
router.get('/', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            priority,
            type,
            category,
            assignedTo,
            createdBy,
            site,
            sortBy = 'scheduledDate',
            sortOrder = 'desc',
            search
        } = req.query;

        // Build query
        const query = {};
        
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (type) query.type = type;
        if (category) query.category = category;
        if (assignedTo) query.assignedTo = assignedTo;
        if (createdBy) query.createdBy = createdBy;
        if (site) query['location.site'] = site;
        
        if (search) {
            query.$or = [
                { taskId: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // For non-admin users, show tasks they created or are assigned to
        if (req.user.role !== 'admin') {
            const userFilter = {
                $or: [
                    { createdBy: req.user._id },
                    { assignedTo: req.user._id },
                    { assignedTeam: req.user._id }
                ]
            };
            
            // If there's already a $or in the query (from search), combine them
            if (query.$or) {
                query.$and = [
                    { $or: query.$or },
                    userFilter
                ];
                delete query.$or;
            } else {
                Object.assign(query, userFilter);
            }
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [tasks, total] = await Promise.all([
            MaintenanceTask.find(query)
                .populate('panel', 'panelId serialNumber location.site status')
                .populate('panels', 'panelId serialNumber location.site status')
                .populate('createdBy', 'firstName lastName username')
                .populate('assignedTo', 'firstName lastName username')
                .populate('assignedTeam', 'firstName lastName username')
                .populate('relatedDefect', 'defectId defectType severity')
                .populate('relatedInspection', 'inspectionId inspectionDate')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            MaintenanceTask.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                tasks,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get maintenance tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch maintenance tasks',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/maintenance/stats
 * @desc    Get maintenance task statistics
 * @access  Private
 */
router.get('/stats', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        let query = {};
        
        // For non-admin users, filter by their involvement
        if (req.user.role !== 'admin') {
            query.$or = [
                { createdBy: req.user._id },
                { assignedTo: req.user._id },
                { assignedTeam: req.user._id }
            ];
        }

        const [
            totalTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks,
            overdueTasks,
            highPriorityTasks
        ] = await Promise.all([
            MaintenanceTask.countDocuments(query),
            MaintenanceTask.countDocuments({ ...query, status: 'pending' }),
            MaintenanceTask.countDocuments({ ...query, status: 'in_progress' }),
            MaintenanceTask.countDocuments({ ...query, status: 'completed' }),
            MaintenanceTask.findOverdue().countDocuments(query),
            MaintenanceTask.findHighPriority().countDocuments(query)
        ]);

        // Get task counts by type
        const typeStats = await MaintenanceTask.aggregate([
            { $match: query },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        // Get task counts by priority
        const priorityStats = await MaintenanceTask.aggregate([
            { $match: query },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                total: totalTasks,
                pending: pendingTasks,
                inProgress: inProgressTasks,
                completed: completedTasks,
                overdue: overdueTasks,
                highPriority: highPriorityTasks,
                byType: typeStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                byPriority: priorityStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('Get maintenance stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch maintenance statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/maintenance/:id
 * @desc    Get maintenance task by ID
 * @access  Private
 */
router.get('/:id', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        let query = { _id: req.params.id };
        
        // For non-admin users, only allow access to tasks they're involved with
        if (req.user.role !== 'admin') {
            query.$or = [
                { createdBy: req.user._id },
                { assignedTo: req.user._id },
                { assignedTeam: req.user._id }
            ];
        }

        const task = await MaintenanceTask.findOne(query)
            .populate('panel', 'panelId serialNumber manufacturer model location status')
            .populate('panels', 'panelId serialNumber manufacturer model location status')
            .populate('createdBy', 'firstName lastName username email')
            .populate('assignedTo', 'firstName lastName username email')
            .populate('assignedTeam', 'firstName lastName username email')
            .populate('relatedDefect', 'defectId defectType severity status')
            .populate('relatedInspection', 'inspectionId inspectionDate overallRating')
            .populate('notes.author', 'firstName lastName username')
            .populate('progress.updatedBy', 'firstName lastName username')
            .lean();

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance task not found'
            });
        }

        res.json({
            success: true,
            data: { task }
        });

    } catch (error) {
        console.error('Get maintenance task error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch maintenance task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/maintenance
 * @desc    Create new maintenance task
 * @access  Private
 */
router.post('/', authenticate, requireMaintenanceOrAdmin, maintenanceRateLimit, async (req, res) => {
    try {
        const taskData = {
            ...req.body,
            createdBy: req.user._id
        };

        // Generate task ID if not provided
        if (!taskData.taskId) {
            const count = await MaintenanceTask.countDocuments();
            taskData.taskId = `MT${String(count + 1).padStart(6, '0')}`;
        }

        // Verify panel(s) exist
        if (taskData.panel) {
            const panel = await Panel.findById(taskData.panel);
            if (!panel) {
                return res.status(400).json({
                    success: false,
                    message: 'Panel not found'
                });
            }
        }

        if (taskData.panels && taskData.panels.length > 0) {
            const panels = await Panel.find({ _id: { $in: taskData.panels } });
            if (panels.length !== taskData.panels.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more panels not found'
                });
            }
        }

        // Verify assigned user exists
        if (taskData.assignedTo) {
            const assignedUser = await User.findById(taskData.assignedTo);
            if (!assignedUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Assigned user not found'
                });
            }
        }

        const task = new MaintenanceTask(taskData);
        await task.save();

        // Populate the response
        await task.populate('panel', 'panelId serialNumber location.site');
        await task.populate('panels', 'panelId serialNumber location.site');
        await task.populate('createdBy', 'firstName lastName username');
        if (task.assignedTo) {
            await task.populate('assignedTo', 'firstName lastName username');
        }

        res.status(201).json({
            success: true,
            message: 'Maintenance task created successfully',
            data: { task }
        });

    } catch (error) {
        console.error('Create maintenance task error:', error);
        
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
                message: 'Task ID already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create maintenance task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/maintenance/:id
 * @desc    Update maintenance task
 * @access  Private
 */
router.put('/:id', authenticate, requireMaintenanceOrAdmin, maintenanceRateLimit, async (req, res) => {
    try {
        let query = { _id: req.params.id };
        
        // For non-admin users, only allow updating tasks they're involved with
        if (req.user.role !== 'admin') {
            query.$or = [
                { createdBy: req.user._id },
                { assignedTo: req.user._id },
                { assignedTeam: req.user._id }
            ];
        }

        const updates = req.body;
        
        // Maintenance staff cannot change status, priority, or assignment - only admin can
        if (req.user.role !== 'admin') {
            delete updates.createdBy;
            delete updates.status;
            delete updates.priority;
            delete updates.assignedTo;
            delete updates.assignedTeam;
        }

        // Update progress timestamp
        if (updates.progress) {
            updates['progress.lastUpdated'] = new Date();
            updates['progress.updatedBy'] = req.user._id;
        }

        const task = await MaintenanceTask.findOneAndUpdate(
            query,
            updates,
            { new: true, runValidators: true }
        )
        .populate('panel', 'panelId serialNumber location.site')
        .populate('panels', 'panelId serialNumber location.site')
        .populate('createdBy', 'firstName lastName username')
        .populate('assignedTo', 'firstName lastName username')
        .populate('assignedTeam', 'firstName lastName username');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance task not found'
            });
        }

        res.json({
            success: true,
            message: 'Maintenance task updated successfully',
            data: { task }
        });

    } catch (error) {
        console.error('Update maintenance task error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
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
            message: 'Failed to update maintenance task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/maintenance/:id/notes
 * @desc    Add note to maintenance task
 * @access  Private
 */
router.post('/:id/notes', authenticate, requireMaintenanceOrAdmin, maintenanceRateLimit, async (req, res) => {
    try {
        const { text, type = 'general' } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Note text is required'
            });
        }

        let query = { _id: req.params.id };
        
        // For non-admin users, only allow adding notes to tasks they're involved with
        if (req.user.role !== 'admin') {
            query.$or = [
                { createdBy: req.user._id },
                { assignedTo: req.user._id },
                { assignedTeam: req.user._id }
            ];
        }

        const task = await MaintenanceTask.findOneAndUpdate(
            query,
            {
                $push: {
                    notes: {
                        text,
                        type,
                        author: req.user._id,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        )
        .populate('notes.author', 'firstName lastName username');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance task not found'
            });
        }

        res.json({
            success: true,
            message: 'Note added successfully',
            data: { task }
        });

    } catch (error) {
        console.error('Add maintenance task note error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
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
 * @route   PUT /api/maintenance/:id/status
 * @desc    Update maintenance task status
 * @access  Private
 */
router.put('/:id/status', authenticate, requireMaintenanceOrAdmin, maintenanceRateLimit, async (req, res) => {
    try {
        // Only admins can change task status
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can change task status'
            });
        }

        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const validStatuses = ['pending', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        let query = { _id: req.params.id };

        const task = await MaintenanceTask.findOneAndUpdate(
            query,
            { status },
            { new: true, runValidators: true }
        )
        .populate('assignedTo', 'firstName lastName username');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task status updated successfully',
            data: { task }
        });

    } catch (error) {
        console.error('Update task status error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update task status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/maintenance/overdue
 * @desc    Get overdue maintenance tasks
 * @access  Private
 */
router.get('/status/overdue', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        let baseQuery = {};
        
        // For non-admin users, filter by their involvement
        if (req.user.role !== 'admin') {
            baseQuery.$or = [
                { createdBy: req.user._id },
                { assignedTo: req.user._id },
                { assignedTeam: req.user._id }
            ];
        }

        const overdueTasks = await MaintenanceTask.findOverdue()
            .find(baseQuery)
            .populate('panel', 'panelId serialNumber location.site status')
            .populate('assignedTo', 'firstName lastName username')
            .populate('createdBy', 'firstName lastName username')
            .sort({ dueDate: 1 })
            .lean();

        res.json({
            success: true,
            data: { tasks: overdueTasks }
        });

    } catch (error) {
        console.error('Get overdue tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch overdue tasks',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/maintenance/high-priority
 * @desc    Get high priority maintenance tasks
 * @access  Private
 */
router.get('/priority/high', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        let baseQuery = {};
        
        // For non-admin users, filter by their involvement
        if (req.user.role !== 'admin') {
            baseQuery.$or = [
                { createdBy: req.user._id },
                { assignedTo: req.user._id },
                { assignedTeam: req.user._id }
            ];
        }

        const highPriorityTasks = await MaintenanceTask.findHighPriority()
            .find(baseQuery)
            .populate('panel', 'panelId serialNumber location.site status')
            .populate('assignedTo', 'firstName lastName username')
            .populate('createdBy', 'firstName lastName username')
            .sort({ scheduledDate: 1 })
            .lean();

        res.json({
            success: true,
            data: { tasks: highPriorityTasks }
        });

    } catch (error) {
        console.error('Get high priority tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch high priority tasks',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   DELETE /api/maintenance/:id
 * @desc    Delete maintenance task (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const task = await MaintenanceTask.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance task not found'
            });
        }

        res.json({
            success: true,
            message: 'Maintenance task deleted successfully'
        });

    } catch (error) {
        console.error('Delete maintenance task error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete maintenance task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/maintenance/:id/observations
 * @desc    Add observation to a maintenance task
 * @access  Private
 */
router.post('/:id/observations', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const { text, images } = req.body;

        // Validate at least one field is provided
        if (!text && (!images || images.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'At least text or images must be provided for observation'
            });
        }

        const task = await MaintenanceTask.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance task not found'
            });
        }

        // Check if user has permission (assigned to task or admin)
        if (req.user.role !== 'admin' && 
            task.assignedTo?.toString() !== req.user._id.toString() &&
            !task.assignedTeam?.some(member => member.toString() === req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to add observations to this task'
            });
        }

        // Create observation object
        const observation = {
            text: text || '',
            images: images || [],
            author: req.user._id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Add observation to task
        task.observations.push(observation);
        await task.save();

        // Populate the observation with author details
        await task.populate('observations.author', 'firstName lastName username');

        res.status(201).json({
            success: true,
            message: 'Observation added successfully',
            data: {
                observation: task.observations[task.observations.length - 1]
            }
        });

    } catch (error) {
        console.error('Add observation error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to add observation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/maintenance/:id/observations
 * @desc    Get all observations for a maintenance task
 * @access  Private
 */
router.get('/:id/observations', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const task = await MaintenanceTask.findById(req.params.id)
            .populate('observations.author', 'firstName lastName username')
            .lean();

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance task not found'
            });
        }

        // Check if user has permission (assigned to task or admin)
        if (req.user.role !== 'admin' && 
            task.assignedTo?.toString() !== req.user._id.toString() &&
            task.createdBy?.toString() !== req.user._id.toString() &&
            !task.assignedTeam?.some(member => member.toString() === req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view observations for this task'
            });
        }

        res.json({
            success: true,
            data: {
                observations: task.observations || []
            }
        });

    } catch (error) {
        console.error('Get observations error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch observations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/maintenance/:id/observations/:observationId
 * @desc    Update an observation
 * @access  Private
 */
router.put('/:id/observations/:observationId', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const { text, images } = req.body;

        const task = await MaintenanceTask.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance task not found'
            });
        }

        const observation = task.observations.id(req.params.observationId);

        if (!observation) {
            return res.status(404).json({
                success: false,
                message: 'Observation not found'
            });
        }

        // Check if user is the author or admin
        if (req.user.role !== 'admin' && observation.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own observations'
            });
        }

        // Update observation fields
        if (text !== undefined) observation.text = text;
        if (images !== undefined) observation.images = images;
        observation.updatedAt = new Date();

        await task.save();
        await task.populate('observations.author', 'firstName lastName username');

        res.json({
            success: true,
            message: 'Observation updated successfully',
            data: { observation }
        });

    } catch (error) {
        console.error('Update observation error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update observation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   DELETE /api/maintenance/:id/observations/:observationId
 * @desc    Delete an observation
 * @access  Private
 */
router.delete('/:id/observations/:observationId', authenticate, requireMaintenanceOrAdmin, async (req, res) => {
    try {
        const task = await MaintenanceTask.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance task not found'
            });
        }

        const observation = task.observations.id(req.params.observationId);

        if (!observation) {
            return res.status(404).json({
                success: false,
                message: 'Observation not found'
            });
        }

        // Check if user is the author or admin
        if (req.user.role !== 'admin' && observation.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own observations'
            });
        }

        observation.deleteOne();
        await task.save();

        res.json({
            success: true,
            message: 'Observation deleted successfully'
        });

    } catch (error) {
        console.error('Delete observation error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Failed to delete observation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
