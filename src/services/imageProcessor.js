import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

class ImageProcessor {
  constructor() {
    this.cacheDir = path.join(process.cwd(), 'uploads', 'cache');
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  // Generate cache key from transformation parameters
  generateCacheKey(filename, transformParams) {
    const paramString = JSON.stringify(transformParams);
    const hash = crypto.createHash('md5').update(paramString).digest('hex');
    const ext = transformParams.format || path.extname(filename).slice(1);
    return `${path.parse(filename).name}-${hash}.${ext}`;
  }

  // Check if cached version exists
  getCachedImage(cacheKey) {
    const cachePath = path.join(this.cacheDir, cacheKey);
    if (fs.existsSync(cachePath)) {
      return cachePath;
    }
    return null;
  }

  // Main transformation method
  async transform(imagePath, options = {}) {
    try {
      const {
        width,
        height,
        fit = 'cover', // cover, contain, fill, inside, outside
        format,
        quality = 80,
        grayscale = false,
        blur,
        sharpen = false,
        rotate,
        flip = false,
        flop = false,
        brightness,
        saturation,
        hue
      } = options;

      // Generate cache key
      const cacheKey = this.generateCacheKey(path.basename(imagePath), options);
      
      // Check cache
      const cachedPath = this.getCachedImage(cacheKey);
      if (cachedPath) {
        return {
          path: cachedPath,
          cached: true
        };
      }

      // Start Sharp pipeline
      let pipeline = sharp(imagePath);

      // Get original metadata
      const metadata = await pipeline.metadata();

      // Resize
      if (width || height) {
        const resizeOptions = {
          width: width ? parseInt(width) : null,
          height: height ? parseInt(height) : null,
          fit: fit,
          withoutEnlargement: true
        };
        pipeline = pipeline.resize(resizeOptions);
      }

      // Rotate
      if (rotate) {
        pipeline = pipeline.rotate(parseInt(rotate));
      }

      // Flip/Flop
      if (flip) {
        pipeline = pipeline.flip();
      }
      if (flop) {
        pipeline = pipeline.flop();
      }

      // Color adjustments
      if (brightness || saturation || hue) {
        const modulations = {};
        if (brightness) modulations.brightness = parseFloat(brightness);
        if (saturation) modulations.saturation = parseFloat(saturation);
        if (hue) modulations.hue = parseInt(hue);
        pipeline = pipeline.modulate(modulations);
      }

      // Grayscale
      if (grayscale === 'true' || grayscale === true) {
        pipeline = pipeline.grayscale();
      }

      // Blur
      if (blur) {
        pipeline = pipeline.blur(parseFloat(blur));
      }

      // Sharpen
      if (sharpen === 'true' || sharpen === true) {
        pipeline = pipeline.sharpen();
      }

      // Format conversion
      const outputFormat = format || metadata.format;
      if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
        pipeline = pipeline.jpeg({ quality: parseInt(quality) });
      } else if (outputFormat === 'png') {
        pipeline = pipeline.png({ quality: parseInt(quality) });
      } else if (outputFormat === 'webp') {
        pipeline = pipeline.webp({ quality: parseInt(quality) });
      } else if (outputFormat === 'gif') {
        pipeline = pipeline.gif();
      }

      // Save to cache
      const outputPath = path.join(this.cacheDir, cacheKey);
      await pipeline.toFile(outputPath);

      // Get output metadata
      const outputMetadata = await sharp(outputPath).metadata();

      return {
        path: outputPath,
        cached: false,
        metadata: {
          format: outputMetadata.format,
          width: outputMetadata.width,
          height: outputMetadata.height,
          size: fs.statSync(outputPath).size,
          originalSize: metadata.size,
          compressionRatio: ((1 - (fs.statSync(outputPath).size / metadata.size)) * 100).toFixed(2) + '%'
        }
      };

    } catch (error) {
      throw new Error(`Image transformation failed: ${error.message}`);
    }
  }

  // Preset transformations
  async applyPreset(imagePath, presetName) {
    const presets = {
      thumbnail: {
        width: 150,
        height: 150,
        fit: 'cover',
        quality: 80
      },
      small: {
        width: 400,
        quality: 85
      },
      medium: {
        width: 800,
        quality: 85
      },
      large: {
        width: 1200,
        quality: 90
      },
      avatar: {
        width: 200,
        height: 200,
        fit: 'cover',
        format: 'webp',
        quality: 90
      },
      'social-media': {
        width: 1200,
        height: 630,
        fit: 'cover',
        format: 'jpeg',
        quality: 85
      },
      'profile-pic': {
        width: 500,
        height: 500,
        fit: 'cover',
        format: 'webp',
        quality: 90
      }
    };

    const preset = presets[presetName];
    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    return this.transform(imagePath, preset);
  }

  // Get image info
  async getImageInfo(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      const stats = fs.statSync(imagePath);

      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        size: stats.size,
        sizeFormatted: this.formatBytes(stats.size)
      };
    } catch (error) {
      throw new Error(`Failed to get image info: ${error.message}`);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export default new ImageProcessor();