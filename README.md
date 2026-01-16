# PixelForge API

A powerful, production-ready image processing API built with Node.js, Express, PostgreSQL, and Sharp. Features include user authentication, image transformations, caching, and quota management.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![License](https://img.shields.io/badge/license-ISC-blue)

## 🚀 Features

### Authentication & Security
- **Dual Authentication** - JWT tokens and API keys
- **User Management** - Registration, login, profile management
- **Rate Limiting** - Protection against brute force attacks
- **Password Hashing** - bcrypt with salt rounds
- **Quota System** - Configurable upload limits per user

### Image Processing
- **Upload** - Single and multiple image uploads
- **Transformations** - Resize, rotate, flip, blur, sharpen, color adjustments
- **Format Conversion** - JPEG, PNG, WebP, GIF
- **Presets** - Thumbnail, avatar, social media, and more
- **Caching** - Automatic caching of transformed images
- **Batch Processing** - Multiple transformations in one request

### Database
- **PostgreSQL** - Persistent storage for users and images
- **Image Ownership** - Track which user uploaded each image
- **Usage Analytics** - User statistics and quota tracking
- **Transformation History** - Cache hit tracking

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+ (or Docker)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/PixelForge.git
cd PixelForge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pixelforge
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 4. Set up PostgreSQL

**Option A: Using Docker (Recommended)**

```bash
docker run --name pixelforge-db \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=pixelforge \
  -p 5432:5432 \
  -d postgres:14
```

**Option B: Local PostgreSQL**

```bash
createdb pixelforge
```

### 5. Start the server

```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`

## 🐳 Docker Deployment

### Using Docker Compose (Easiest)

```bash
docker-compose up -d
```

This will start both the API and PostgreSQL database.

### Manual Docker Build

```bash
# Build the image
docker build -t pixelforge-api .

# Run the container
docker run -p 5000:5000 \
  -e DB_HOST=your_db_host \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_secret \
  pixelforge-api
```

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response includes `token` (JWT) and `api_key`.

### Image Upload

#### Upload Single Image
```http
POST /api/upload/single
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

image: <file>
```

Or with API key:
```http
POST /api/upload/single
X-API-Key: <api_key>
Content-Type: multipart/form-data

image: <file>
```

### Image Transformations

#### Resize Image
```http
GET /api/transform/:filename?width=500&height=300&fit=cover
```

#### Convert Format
```http
GET /api/transform/:filename?format=webp&quality=80
```

#### Apply Filters
```http
GET /api/transform/:filename?grayscale=true&blur=2
```

#### Use Preset
```http
GET /api/transform/:filename/preset/thumbnail
```

Available presets: `thumbnail`, `small`, `medium`, `large`, `avatar`, `social-media`, `profile-pic`

### User Management

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <jwt_token>
```

#### List User Images
```http
GET /api/user/images?limit=20&offset=0
Authorization: Bearer <jwt_token>
```

#### Get Statistics
```http
GET /api/user/stats
Authorization: Bearer <jwt_token>
```

## 🔑 Authentication Methods

The API supports two authentication methods:

1. **JWT Token** - Include in `Authorization: Bearer <token>` header
2. **API Key** - Include in `X-API-Key: <key>` header

Both methods provide the same level of access.

## 📊 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **Authentication** |
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/refresh` | No | Refresh JWT token |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/regenerate-key` | Yes | Generate new API key |
| **User Management** |
| GET | `/api/user/profile` | Yes | Get user profile |
| GET | `/api/user/images` | Yes | List user's images |
| GET | `/api/user/stats` | Yes | Get usage statistics |
| **Upload** |
| POST | `/api/upload/single` | Yes | Upload single image |
| POST | `/api/upload/multiple` | Yes | Upload multiple images |
| **Images** |
| GET | `/api/images/:filename` | No | Serve image file |
| DELETE | `/api/images/:filename` | Yes | Delete image (owner only) |
| **Transformations** |
| GET | `/api/transform/:filename` | No | Transform image |
| GET | `/api/transform/:filename/preset/:preset` | No | Apply preset |
| GET | `/api/transform/:filename/info` | No | Get image info |
| POST | `/api/transform/:filename/batch` | No | Batch transformations |

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Test authentication manually:

```bash
node test-auth.js
```

## 🌐 Deployment

### Railway.app

1. Create new project on Railway
2. Add PostgreSQL database
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Render.com

1. Create new Web Service
2. Add PostgreSQL database
3. Connect repository
4. Set environment variables
5. Deploy

### Fly.io

```bash
fly launch
fly postgres create
fly secrets set JWT_SECRET=your_secret
fly deploy
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guides.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | pixelforge |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `UPLOAD_DIR` | Upload directory | ./uploads |
| `MAX_FILE_SIZE` | Max file size (bytes) | 10485760 |

## 📁 Project Structure

```
PixelForge/
├── src/
│   ├── db/
│   │   └── database.js          # Database connection & schema
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT & API key auth
│   │   ├── upload.js            # Multer configuration
│   │   └── validate.js          # Input validation
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Image.js             # Image model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── user.js              # User management routes
│   │   ├── upload.js            # Upload routes
│   │   ├── images.js            # Image serving routes
│   │   └── transform.js         # Transformation routes
│   ├── services/
│   │   └── imageProcessor.js    # Image processing logic
│   └── server.js                # Express app setup
├── uploads/                      # Uploaded images
├── .env                          # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 👤 Author

Muyiwa Obaremi - [GitHub](https://github.com/muyi29)

## 🙏 Acknowledgments

- [Sharp](https://sharp.pixelplumbing.com/) - High-performance image processing
- [Express](https://expressjs.com/) - Web framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [JWT](https://jwt.io/) - Authentication
