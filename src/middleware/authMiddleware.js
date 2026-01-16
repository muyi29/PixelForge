import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Authenticate using JWT token or API key
export const authenticate = async (req, res, next) => {
    try {
        let user = null;

        // Check for JWT token in Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.userId);

                if (!user || !user.is_active) {
                    return res.status(401).json({
                        error: 'Invalid or expired token'
                    });
                }
            } catch (error) {
                return res.status(401).json({
                    error: 'Invalid or expired token'
                });
            }
        }

        // Check for API key in X-API-Key header
        const apiKey = req.headers['x-api-key'];
        if (!user && apiKey) {
            user = await User.findByApiKey(apiKey);

            if (!user) {
                return res.status(401).json({
                    error: 'Invalid API key'
                });
            }
        }

        // If no authentication method provided
        if (!user) {
            return res.status(401).json({
                error: 'Authentication required. Provide JWT token or API key'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            error: 'Authentication failed',
            message: error.message
        });
    }
};

// Optional authentication - doesn't fail if no auth provided
export const optionalAuth = async (req, res, next) => {
    try {
        let user = null;

        // Check for JWT token
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.userId);
            } catch (error) {
                // Silently fail for optional auth
            }
        }

        // Check for API key
        const apiKey = req.headers['x-api-key'];
        if (!user && apiKey) {
            user = await User.findByApiKey(apiKey);
        }

        // Attach user if found, otherwise continue without user
        if (user && user.is_active) {
            req.user = user;
        }

        next();

    } catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};

// Check if user has available quota
export const checkQuota = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        const hasQuota = await User.hasQuota(req.user.id);

        if (!hasQuota) {
            return res.status(429).json({
                error: 'Quota limit exceeded',
                quota_used: req.user.quota_used,
                quota_limit: req.user.quota_limit
            });
        }

        next();

    } catch (error) {
        console.error('Quota check error:', error);
        res.status(500).json({
            error: 'Failed to check quota',
            message: error.message
        });
    }
};

// Generate JWT token
export const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
    );
};

// Generate refresh token (longer expiry)
export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' } // Refresh token expires in 30 days
    );
};
