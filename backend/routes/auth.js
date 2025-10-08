import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { 
    generateToken, 
    generateRefreshToken, 
    verifyToken, 
    authenticate,
    createRateLimit 
} from '../middleware/auth.js';

const router = express.Router();

// Rate limiting for auth routes
const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 requests per 15 minutes
const loginRateLimit = createRateLimit(15 * 60 * 1000, 3); // 3 login attempts per 15 minutes

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', loginRateLimit, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate tokens
        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to user
        user.refreshTokens.push({
            token: refreshToken,
            createdAt: new Date()
        });

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Remove sensitive data from response
        const userResponse = user.toJSON();
        delete userResponse.refreshTokens;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                accessToken,
                refreshToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', authRateLimit, async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyToken(refreshToken);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Check if it's actually a refresh token
        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        // Find user and check if refresh token exists
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check if refresh token exists in user's tokens
        const tokenExists = user.refreshTokens.some(
            tokenObj => tokenObj.token === refreshToken
        );

        if (!tokenExists) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found or expired'
            });
        }

        // Generate new access token
        const newAccessToken = generateToken(user._id);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Token refresh failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const user = req.user;

        if (refreshToken) {
            // Remove specific refresh token
            await User.findByIdAndUpdate(user._id, {
                $pull: { refreshTokens: { token: refreshToken } }
            });
        } else {
            // Remove all refresh tokens (logout from all devices)
            await User.findByIdAndUpdate(user._id, {
                $set: { refreshTokens: [] }
            });
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password -refreshTokens')
            .lean();

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const updates = req.body;

        // Remove sensitive fields that shouldn't be updated via this route
        delete updates.password;
        delete updates.role;
        delete updates.isActive;
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

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password -refreshTokens');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: updatedUser }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
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
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get user with password
        const user = await User.findById(userId);
        
        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Clear all refresh tokens to force re-login on all devices
        user.refreshTokens = [];
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully. Please login again.'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (Public registration)
 * @access  Public
 */
router.post('/register', authRateLimit, async (req, res) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            phone
        } = req.body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, first name, and last name are required'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
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

        // Auto-generate unique employee ID
        let employeeId;
        let isUnique = false;
        let counter = 1;
        
        while (!isUnique) {
            employeeId = `EMP${String(counter).padStart(3, '0')}`;
            const existingUser = await User.findOne({ employeeId });
            if (!existingUser) {
                isUnique = true;
            } else {
                counter++;
            }
        }

        // Generate username from email (part before @)
        const username = email.split('@')[0].toLowerCase();

        // Create user with maintenance_staff role by default
        const user = new User({
            username,
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            role: 'maintenance_staff', // Default role for public registration
            phone,
            employeeId,
            isActive: true
        });

        await user.save();

        // Generate tokens for immediate login
        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to user
        user.refreshTokens.push({
            token: refreshToken,
            createdAt: new Date()
        });
        user.lastLogin = new Date();
        await user.save();

        // Remove sensitive data from response
        const userResponse = user.toJSON();

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: userResponse,
                accessToken,
                refreshToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
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

        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            
            let message = 'Duplicate value error';
            if (field === 'email') {
                message = 'Email already exists';
            } else if (field === 'username') {
                message = 'Username already exists';
            } else if (field === 'employeeId') {
                message = 'Employee ID already exists. Please try again.';
            }
            
            return res.status(400).json({
                success: false,
                message,
                errors: [{
                    field,
                    message
                }]
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed',
            errors: [],
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify if token is valid
 * @access  Public
 */
router.post('/verify-token', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        const decoded = verifyToken(token);
        
        // Find user to ensure they still exist and are active
        const user = await User.findById(decoded.userId).select('-password -refreshTokens');
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Token is valid but user not found or inactive'
            });
        }

        res.json({
            success: true,
            message: 'Token is valid',
            data: { user }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

export default router;
