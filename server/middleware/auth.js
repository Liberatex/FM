const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const authMiddleware = {
  // Verify JWT token
  verifyToken: async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      logger.security('Token verification failed:', error.message);
      throw new Error('Invalid token');
    }
  },

  // Main authentication middleware
  authenticate: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Verify token
      const decoded = await authMiddleware.verifyToken(token);
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      
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

      // Check if account is locked
      if (user.isLocked()) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts'
        });
      }

      // Add user to request object
      req.user = user;
      req.userId = user._id;
      
      // Update last activity
      user.lastLogin = new Date();
      await user.save();
      
      next();
    } catch (error) {
      logger.security('Authentication failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  },

  // Optional authentication (doesn't fail if no token)
  optionalAuth: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = await authMiddleware.verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive && !user.isLocked()) {
          req.user = user;
          req.userId = user._id;
        }
      }
      
      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  },

  // Role-based authorization
  authorize: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    };
  },

  // Rate limiting for authentication endpoints
  authRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Check if user has specific permissions
  hasPermission: (permission) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has the required permission
      if (!req.user.permissions || !req.user.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    };
  },

  // Validate user ownership of resource
  validateOwnership: (resourceModel) => {
    return async (req, res, next) => {
      try {
        const resourceId = req.params.id || req.params.userId;
        
        if (!resourceId) {
          return res.status(400).json({
            success: false,
            message: 'Resource ID required'
          });
        }

        const resource = await resourceModel.findById(resourceId);
        
        if (!resource) {
          return res.status(404).json({
            success: false,
            message: 'Resource not found'
          });
        }

        // Check if user owns the resource or is admin
        if (resource.userId.toString() !== req.userId.toString() && req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }

        req.resource = resource;
        next();
      } catch (error) {
        logger.error('Ownership validation error:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    };
  },

  // Refresh token validation
  validateRefreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      req.user = user;
      req.userId = user._id;
      next();
    } catch (error) {
      logger.security('Refresh token validation failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }
};

module.exports = authMiddleware; 