import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API-only backend - no static files served

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PixelForge API is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
import uploadRoutes from './routes/upload.js';
import imageRoutes from './routes/images.js';
import transformRoutes from './routes/transform.js';

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/transform', transformRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PixelForge API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});