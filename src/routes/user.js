import express from 'express';
import User from '../models/User.js';
import Image from '../models/Image.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/user/profile - Get user profile with stats
router.get('/profile', async (req, res) => {
    try {
        const stats = await User.getStats(req.user.id);

        res.json({
            success: true,
            data: {
                email: stats.email,
                quota_used: parseInt(stats.quota_used),
                quota_limit: parseInt(stats.quota_limit),
                quota_remaining: parseInt(stats.quota_limit) - parseInt(stats.quota_used),
                total_images: parseInt(stats.total_images),
                total_storage: parseInt(stats.total_storage),
                total_storage_formatted: formatBytes(parseInt(stats.total_storage)),
                created_at: stats.created_at
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

// GET /api/user/images - List user's images with pagination
router.get('/images', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const images = await Image.findByUser(req.user.id, limit, offset);
        const total = await Image.countByUser(req.user.id);

        // Format image URLs
        const formattedImages = images.map(img => ({
            id: img.id,
            filename: img.filename,
            original_name: img.original_name,
            size: img.file_size,
            size_formatted: formatBytes(img.file_size),
            width: img.width,
            height: img.height,
            format: img.format,
            mime_type: img.mime_type,
            created_at: img.created_at,
            url: `${req.protocol}://${req.get('host')}/api/images/${img.filename}`
        }));

        res.json({
            success: true,
            data: {
                images: formattedImages,
                pagination: {
                    total,
                    limit,
                    offset,
                    has_more: offset + limit < total
                }
            }
        });

    } catch (error) {
        console.error('Get images error:', error);
        res.status(500).json({
            error: 'Failed to get images',
            message: error.message
        });
    }
});

// GET /api/user/stats - Get detailed usage statistics
router.get('/stats', async (req, res) => {
    try {
        const userStats = await User.getStats(req.user.id);
        const imageStats = await Image.getUserStats(req.user.id);

        res.json({
            success: true,
            data: {
                quota: {
                    used: parseInt(userStats.quota_used),
                    limit: parseInt(userStats.quota_limit),
                    remaining: parseInt(userStats.quota_limit) - parseInt(userStats.quota_used),
                    percentage: ((parseInt(userStats.quota_used) / parseInt(userStats.quota_limit)) * 100).toFixed(2)
                },
                images: {
                    total: parseInt(imageStats.total_images) || 0,
                    total_size: parseInt(imageStats.total_size) || 0,
                    total_size_formatted: formatBytes(parseInt(imageStats.total_size) || 0),
                    avg_width: Math.round(parseFloat(imageStats.avg_width) || 0),
                    avg_height: Math.round(parseFloat(imageStats.avg_height) || 0)
                },
                account: {
                    email: userStats.email,
                    created_at: userStats.created_at
                }
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            error: 'Failed to get statistics',
            message: error.message
        });
    }
});

// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default router;
