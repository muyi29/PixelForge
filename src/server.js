import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Swagger documentation
import { swaggerUi, swaggerSpec } from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PixelForge API Documentation'
}));

// API-only backend - no static files served

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PixelForge API is running',
    timestamp: new Date().toISOString(),
    docs: `${req.protocol}://${req.get('host')}/api-docs`
  });
});

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import uploadRoutes from './routes/upload.js';
import imageRoutes from './routes/images.js';
import transformRoutes from './routes/transform.js';
import rateLimit from 'express-rate-limit';

// Rate limiting for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later'
  }
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
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

import { initDatabase } from './db/database.js';

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database tables
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 PixelForge API running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();