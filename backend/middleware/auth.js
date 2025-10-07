import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT token
export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
};

// Verify JWT token
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        
        // Check if it's a refresh token (should not be used for API access)
        if (decoded.type === 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type. Please use access token.'
            });
        }

        // Find user
        const user = await User.findById(decoded.userId).select('-password -refreshTokens');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is valid but user not found.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication failed.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Authorization middleware - check if user has required role
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
                required: roles,
                current: req.user.role
            });
        }

        next();
    };
};

// Check if user is admin
export const requireAdmin = authorize('admin');

// Check if user is maintenance staff or admin
export const requireMaintenanceOrAdmin = authorize('maintenance_staff', 'admin');

// Optional authentication - attach user if token is valid, but don't require it
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // No token provided, continue without user
        }

        const token = authHeader.substring(7);
        
        if (!token) {
            return next(); // No token provided, continue without user
        }

        // Verify token
        const decoded = verifyToken(token);
        
        // Skip refresh tokens
        if (decoded.type === 'refresh') {
            return next();
        }

        // Find user
        const user = await User.findById(decoded.userId).select('-password -refreshTokens');
        
        if (user && user.isActive) {
            req.user = user;
        }
        
        next();
    } catch (error) {
        // If token is invalid, just continue without user
        next();
    }
};

// Middleware to check if user owns resource or is admin
export const requireOwnershipOrAdmin = (resourceUserField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // Admin can access everything
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user owns the resource
        const resourceUserId = req.params[resourceUserField] || req.body[resourceUserField];
        
        if (req.user._id.toString() !== resourceUserId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own resources.'
            });
        }

        next();
    };
};

// Rate limiting helper
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old entries
        for (const [ip, timestamps] of requests.entries()) {
            const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
            if (validTimestamps.length === 0) {
                requests.delete(ip);
            } else {
                requests.set(ip, validTimestamps);
            }
        }
        
        // Get current requests for this IP
        const currentRequests = requests.get(key) || [];
        const validRequests = currentRequests.filter(timestamp => timestamp > windowStart);
        
        if (validRequests.length >= max) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
        
        // Add current request
        validRequests.push(now);
        requests.set(key, validRequests);
        
        // Set rate limit headers
        res.set({
            'X-RateLimit-Limit': max,
            'X-RateLimit-Remaining': Math.max(0, max - validRequests.length),
            'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
        });
        
        next();
    };
};

// Validate request body middleware
export const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        
        next();
    };
};

export default {
    authenticate,
    authorize,
    requireAdmin,
    requireMaintenanceOrAdmin,
    optionalAuth,
    requireOwnershipOrAdmin,
    generateToken,
    generateRefreshToken,
    verifyToken,
    createRateLimit,
    validateRequest
};
