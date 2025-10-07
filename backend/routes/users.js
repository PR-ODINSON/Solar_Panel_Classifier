import express from 'express';
import User from '../models/User.js';
import { authenticate, requireAdmin, createRateLimit } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting for user management
const userManagementRateLimit = createRateLimit(15 * 60 * 1000, 20); // 20 requests per 15 minutes

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', authenticate, requireAdmin, userManagementRateLimit, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            role,
            isActive,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        
        if (role) {
            query.role = role;
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -refreshTokens')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (Admin only)
 * @access  Private/Admin
 */
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            adminUsers,
            maintenanceUsers,
            recentUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.countDocuments({ role: 'admin', isActive: true }),
            User.countDocuments({ role: 'maintenance_staff', isActive: true }),
            User.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            })
        ]);

        res.json({
            success: true,
            data: {
                total: totalUsers,
                active: activeUsers,
                inactive: totalUsers - activeUsers,
                byRole: {
                    admin: adminUsers,
                    maintenance_staff: maintenanceUsers
                },
                recentlyCreated: recentUsers
            }
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private/Admin
 */
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -refreshTokens')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get user error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/users
 * @desc    Create new user (Admin only)
 * @access  Private/Admin
 */
router.post('/', authenticate, requireAdmin, userManagementRateLimit, async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            firstName,
            lastName,
            role = 'maintenance_staff',
            phone,
            department,
            employeeId
        } = req.body;

        // Validate required fields
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, password, first name, and last name are required'
            });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ 
            username: username.toLowerCase() 
        });
        
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ 
            email: email.toLowerCase() 
        });
        
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Check if employee ID already exists (if provided)
        if (employeeId) {
            const existingEmployeeId = await User.findOne({ employeeId });
            if (existingEmployeeId) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee ID already exists'
                });
            }
        }

        // Create user
        const user = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            role,
            phone,
            department,
            employeeId
        });

        await user.save();

        // Return user without sensitive data
        const userResponse = user.toJSON();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user: userResponse }
        });

    } catch (error) {
        console.error('Create user error:', error);
        
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
            message: 'Failed to create user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', authenticate, requireAdmin, userManagementRateLimit, async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;

        // Remove sensitive fields that shouldn't be updated via this route
        delete updates.password;
        delete updates.refreshTokens;

        // Validate email uniqueness if being updated
        if (updates.email) {
            const existingUser = await User.findOne({
                email: updates.email.toLowerCase(),
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Validate username uniqueness if being updated
        if (updates.username) {
            const existingUser = await User.findOne({
                username: updates.username.toLowerCase(),
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }
        }

        // Validate employee ID uniqueness if being updated
        if (updates.employeeId) {
            const existingUser = await User.findOne({
                employeeId: updates.employeeId,
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee ID already exists'
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password -refreshTokens');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user: updatedUser }
        });

    } catch (error) {
        console.error('Update user error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
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
            message: 'Failed to update user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/users/:id/password
 * @desc    Reset user password (Admin only)
 * @access  Private/Admin
 */
router.put('/:id/password', authenticate, requireAdmin, userManagementRateLimit, async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.params.id;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password is required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password
        user.password = newPassword;
        user.refreshTokens = []; // Clear all refresh tokens
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/users/:id/status
 * @desc    Toggle user active status (Admin only)
 * @access  Private/Admin
 */
router.put('/:id/status', authenticate, requireAdmin, userManagementRateLimit, async (req, res) => {
    try {
        const { isActive } = req.body;
        const userId = req.params.id;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be a boolean value'
            });
        }

        // Prevent admin from deactivating themselves
        if (req.user._id.toString() === userId && !isActive) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Clear refresh tokens if deactivating
        if (!isActive) {
            user.refreshTokens = [];
            await user.save();
        }

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: { user }
        });

    } catch (error) {
        console.error('Update user status error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, requireAdmin, userManagementRateLimit, async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent admin from deleting themselves
        if (req.user._id.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/users/maintenance-staff
 * @desc    Get all maintenance staff users (Admin only)
 * @access  Private/Admin
 */
router.get('/role/maintenance-staff', authenticate, requireAdmin, async (req, res) => {
    try {
        const maintenanceStaff = await User.find({
            role: 'maintenance_staff',
            isActive: true
        })
        .select('_id firstName lastName username email employeeId')
        .sort({ firstName: 1 })
        .lean();

        res.json({
            success: true,
            data: { users: maintenanceStaff }
        });

    } catch (error) {
        console.error('Get maintenance staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch maintenance staff',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
