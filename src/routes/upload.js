import express from 'express';
import upload from '../middleware/upload.js';
import { authenticate, checkQuota } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Image from '../models/Image.js';
import sharp from 'sharp';
import path from 'path';

const router = express.Router();

// POST /api/upload/single - Single image upload (requires authentication)
router.post('/single', authenticate, checkQuota, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // Get image metadata using Sharp
    const metadata = await sharp(req.file.path).metadata();

    // Save image to database
    const imageRecord = await Image.create({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    });

    // Increment user quota
    await User.incrementQuota(req.user.id);

    const imageData = {
      id: imageRecord.id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      uploadedAt: imageRecord.created_at,
      url: `${req.protocol}://${req.get('host')}/api/images/${req.file.filename}`
    };

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: imageData
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to process uploaded image',
      message: error.message
    });
  }
});

// POST /api/upload/multiple - Multiple images upload (requires authentication)
router.post('/multiple', authenticate, checkQuota, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded'
      });
    }

    // Check if user has enough quota for all files
    const hasQuota = await User.hasQuota(req.user.id);
    if (!hasQuota) {
      return res.status(429).json({
        error: 'Insufficient quota for multiple uploads'
      });
    }

    const imagesData = await Promise.all(
      req.files.map(async (file) => {
        const metadata = await sharp(file.path).metadata();

        // Save to database
        const imageRecord = await Image.create({
          userId: req.user.id,
          filename: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        });

        // Increment quota for each upload
        await User.incrementQuota(req.user.id);

        return {
          id: imageRecord.id,
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          uploadedAt: imageRecord.created_at,
          url: `${req.protocol}://${req.get('host')}/api/images/${file.filename}`
        };
      })
    );

    res.status(201).json({
      success: true,
      message: `${imagesData.length} images uploaded successfully`,
      data: imagesData
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      error: 'Failed to process uploaded images',
      message: error.message
    });
  }
});

export default router;
