import express from 'express';
import User from '../models/User.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';
import { authenticate, generateToken, generateRefreshToken } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', validateRegister, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                error: 'User with this email already exists'
            });
        }

        // Create new user
        const user = await User.create(email, password);

        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    api_key: user.api_key,
                    quota_limit: user.quota_limit,
                    quota_used: user.quota_used,
                    created_at: user.created_at
                },
                token,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Failed to register user',
            message: error.message
        });
    }
});

// POST /api/auth/login - Login user
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                error: 'Account is deactivated'
            });
        }

        // Verify password
        const isValidPassword = await User.verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    api_key: user.api_key,
                    quota_limit: user.quota_limit,
                    quota_used: user.quota_used
                },
                token,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Failed to login',
            message: error.message
        });
    }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                error: 'Invalid refresh token'
            });
        }

        // Generate new access token
        const newToken = generateToken(decoded.userId);

        res.json({
            success: true,
            data: {
                token: newToken
            }
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            error: 'Invalid or expired refresh token',
            message: error.message
        });
    }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                api_key: user.api_key,
                quota_limit: user.quota_limit,
                quota_used: user.quota_used,
                is_active: user.is_active,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Failed to get user profile',
            message: error.message
        });
    }
});

// POST /api/auth/regenerate-key - Regenerate API key
router.post('/regenerate-key', authenticate, async (req, res) => {
    try {
        const user = await User.regenerateApiKey(req.user.id);

        res.json({
            success: true,
            message: 'API key regenerated successfully',
            data: {
                api_key: user.api_key
            }
        });

    } catch (error) {
        console.error('API key regeneration error:', error);
        res.status(500).json({
            error: 'Failed to regenerate API key',
            message: error.message
        });
    }
});

export default router;
