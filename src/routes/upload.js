import express from 'express';
import upload from '../middleware/upload.js';
import sharp from 'sharp';
import path from 'path';

const router = express.Router();

// POST /api/upload - Single image upload
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // Get image metadata using Sharp
    const metadata = await sharp(req.file.path).metadata();

    const imageData = {
      id: req.file.filename.split('.')[0], // Use filename without extension as ID
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      uploadedAt: new Date().toISOString(),
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

// POST /api/upload/multiple - Multiple images upload
router.post('/multiple', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded'
      });
    }

    const imagesData = await Promise.all(
      req.files.map(async (file) => {
        const metadata = await sharp(file.path).metadata();
        
        return {
          id: file.filename.split('.')[0],
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          uploadedAt: new Date().toISOString(),
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