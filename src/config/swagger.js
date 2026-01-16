import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PixelForge API',
            version: '1.0.0',
            description: 'A powerful image processing API with authentication, transformations, and caching',
            contact: {
                name: 'API Support',
                email: 'support@pixelforge.com'
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            },
            {
                url: 'https://your-production-url.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'Enter your API key'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        api_key: { type: 'string', example: '64-character-hex-string' },
                        quota_limit: { type: 'integer', example: 100 },
                        quota_used: { type: 'integer', example: 5 },
                        is_active: { type: 'boolean', example: true },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Image: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        filename: { type: 'string', example: 'image-1234567890.jpg' },
                        original_name: { type: 'string', example: 'photo.jpg' },
                        size: { type: 'integer', example: 1024000 },
                        width: { type: 'integer', example: 1920 },
                        height: { type: 'integer', example: 1080 },
                        format: { type: 'string', example: 'jpeg' },
                        mime_type: { type: 'string', example: 'image/jpeg' },
                        url: { type: 'string', example: 'http://localhost:5000/api/images/image-1234567890.jpg' },
                        uploadedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Error message' },
                        message: { type: 'string', example: 'Detailed error description' }
                    }
                }
            }
        },
        tags: [
            { name: 'Authentication', description: 'User authentication endpoints' },
            { name: 'User Management', description: 'User profile and statistics' },
            { name: 'Upload', description: 'Image upload endpoints' },
            { name: 'Images', description: 'Image serving and management' },
            { name: 'Transformations', description: 'Image transformation endpoints' }
        ]
    },
    apis: ['./src/routes/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
