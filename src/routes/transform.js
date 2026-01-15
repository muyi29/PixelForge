import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import imageProcessor from '../services/imageProcessor.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/transform/:filename - Transform image on-the-fly
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../../uploads', filename);

    // Check if original image exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    // Get transformation parameters from query string
    const transformOptions = {
      width: req.query.width,
      height: req.query.height,
      fit: req.query.fit,
      format: req.query.format,
      quality: req.query.quality,
      grayscale: req.query.grayscale,
      blur: req.query.blur,
      sharpen: req.query.sharpen,
      rotate: req.query.rotate,
      flip: req.query.flip,
      flop: req.query.flop,
      brightness: req.query.brightness,
      saturation: req.query.saturation,
      hue: req.query.hue
    };

    // Remove undefined values
    Object.keys(transformOptions).forEach(key => {
      if (transformOptions[key] === undefined) {
        delete transformOptions[key];
      }
    });

    // Transform image
    const result = await imageProcessor.transform(imagePath, transformOptions);

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    if (result.cached) {
      res.setHeader('X-Cache', 'HIT');
    } else {
      res.setHeader('X-Cache', 'MISS');
    }

    // Send transformed image
    res.sendFile(result.path);

  } catch (error) {
    console.error('Transform error:', error);
    res.status(500).json({
      error: 'Failed to transform image',
      message: error.message
    });
  }
});

// GET /api/transform/:filename/preset/:presetName - Apply preset
router.get('/:filename/preset/:presetName', async (req, res) => {
  try {
    const { filename, presetName } = req.params;
    const imagePath = path.join(__dirname, '../../uploads', filename);

    // Check if original image exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    // Apply preset
    const result = await imageProcessor.applyPreset(imagePath, presetName);

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    if (result.cached) {
      res.setHeader('X-Cache', 'HIT');
    } else {
      res.setHeader('X-Cache', 'MISS');
    }

    // Send transformed image
    res.sendFile(result.path);

  } catch (error) {
    console.error('Preset error:', error);
    res.status(500).json({
      error: 'Failed to apply preset',
      message: error.message
    });
  }
});

// GET /api/transform/:filename/info - Get image information
router.get('/:filename/info', async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../../uploads', filename);

    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    // Get image info
    const info = await imageProcessor.getImageInfo(imagePath);

    res.json({
      success: true,
      data: info
    });

  } catch (error) {
    console.error('Info error:', error);
    res.status(500).json({
      error: 'Failed to get image info',
      message: error.message
    });
  }
});

// POST /api/transform/:filename/batch - Batch transform with multiple options
router.post('/:filename/batch', async (req, res) => {
  try {
    const { filename } = req.params;
    const { transformations } = req.body; // Array of transformation configs
    const imagePath = path.join(__dirname, '../../uploads', filename);

    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    if (!Array.isArray(transformations) || transformations.length === 0) {
      return res.status(400).json({
        error: 'transformations must be a non-empty array'
      });
    }

    // Process all transformations
    const results = await Promise.all(
      transformations.map(async (options, index) => {
        try {
          const result = await imageProcessor.transform(imagePath, options);
          return {
            index,
            success: true,
            url: `${req.protocol}://${req.get('host')}/api/transform/${filename}?${new URLSearchParams(options).toString()}`,
            metadata: result.metadata,
            cached: result.cached
          };
        } catch (error) {
          return {
            index,
            success: false,
            error: error.message
          };
        }
      })
    );

    res.json({
      success: true,
      message: `Processed ${results.length} transformations`,
      data: results
    });

  } catch (error) {
    console.error('Batch transform error:', error);
    res.status(500).json({
      error: 'Failed to process batch transformations',
      message: error.message
    });
  }
});

export default router;