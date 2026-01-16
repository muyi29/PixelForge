import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import Image from '../models/Image.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/images/:filename - Serve original image
router.get('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    // Send the file
    res.sendFile(imagePath);

  } catch (error) {
    console.error('Image serving error:', error);
    res.status(500).json({
      error: 'Failed to serve image',
      message: error.message
    });
  }
});

// DELETE /api/images/:filename - Delete image (requires authentication and ownership)
router.delete('/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;

    // Find image in database
    const imageRecord = await Image.findByFilename(filename);

    if (!imageRecord) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    // Check ownership
    if (imageRecord.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'You do not have permission to delete this image'
      });
    }

    const imagePath = path.join(__dirname, '../../uploads', filename);

    // Delete file from filesystem
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete from database
    await Image.deleteByFilename(filename);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      message: error.message
    });
  }
});

export default router;
