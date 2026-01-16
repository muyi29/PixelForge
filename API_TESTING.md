# PixelForge API - Testing Endpoints

Complete guide to testing all API endpoints with example requests.

## 🚀 Quick Start

### Base URL
```
Local: http://localhost:5000
Production: https://your-domain.com
```

### API Documentation
Interactive Swagger documentation available at:
```
http://localhost:5000/api-docs
```

---

## 📝 Authentication Endpoints

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**PowerShell:**
```powershell
$body = @{
    email = "demo@example.com"
    password = "demo123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST -Body $body -ContentType "application/json"

# Save token and API key for later use
$token = $response.data.token
$apiKey = $response.data.user.api_key

Write-Host "Token: $token"
Write-Host "API Key: $apiKey"
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123456"}'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "demo@example.com",
      "api_key": "a1b2c3d4e5f6...",
      "quota_limit": 100,
      "quota_used": 0,
      "created_at": "2026-01-16T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**PowerShell:**
```powershell
$body = @{
    email = "demo@example.com"
    password = "demo123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST -Body $body -ContentType "application/json"

$token = $response.data.token
$apiKey = $response.data.user.api_key
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123456"}'
```

---

### 3. Get Current User Profile

**Endpoint:** `GET /api/auth/me`

**PowerShell:**
```powershell
$headers = @{ "Authorization" = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
    -Method GET -Headers $headers
```

**cURL:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Refresh JWT Token

**Endpoint:** `POST /api/auth/refresh`

**PowerShell:**
```powershell
$body = @{ refreshToken = $refreshToken } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/refresh" `
    -Method POST -Body $body -ContentType "application/json"
```

---

### 5. Regenerate API Key

**Endpoint:** `POST /api/auth/regenerate-key`

**PowerShell:**
```powershell
$headers = @{ "Authorization" = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/regenerate-key" `
    -Method POST -Headers $headers
```

---

## 📤 Upload Endpoints

### 6. Upload Single Image (with JWT)

**Endpoint:** `POST /api/upload/single`

**PowerShell:**
```powershell
$headers = @{ "Authorization" = "Bearer $token" }
$imagePath = "C:\path\to\your\image.jpg"

$form = @{
    image = Get-Item -Path $imagePath
}

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/upload/single" `
    -Method POST -Headers $headers -Form $form

# Save filename for later use
$filename = $response.data.filename
Write-Host "Uploaded: $filename"
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

---

### 7. Upload Single Image (with API Key)

**PowerShell:**
```powershell
$headers = @{ "X-API-Key" = $apiKey }
$imagePath = "C:\path\to\your\image.jpg"

$form = @{
    image = Get-Item -Path $imagePath
}

Invoke-RestMethod -Uri "http://localhost:5000/api/upload/single" `
    -Method POST -Headers $headers -Form $form
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/upload/single \
  -H "X-API-Key: YOUR_API_KEY" \
  -F "image=@/path/to/image.jpg"
```

---

### 8. Upload Multiple Images

**Endpoint:** `POST /api/upload/multiple`

**PowerShell:**
```powershell
$headers = @{ "Authorization" = "Bearer $token" }

$form = @{
    images = @(
        Get-Item "C:\path\to\image1.jpg"
        Get-Item "C:\path\to\image2.jpg"
        Get-Item "C:\path\to\image3.jpg"
    )
}

Invoke-RestMethod -Uri "http://localhost:5000/api/upload/multiple" `
    -Method POST -Headers $headers -Form $form
```

---

## 🖼️ Image Endpoints

### 9. Get Image

**Endpoint:** `GET /api/images/:filename`

**PowerShell:**
```powershell
# View in browser or download
Start-Process "http://localhost:5000/api/images/$filename"

# Or download
Invoke-WebRequest -Uri "http://localhost:5000/api/images/$filename" `
    -OutFile "downloaded-image.jpg"
```

**cURL:**
```bash
# Download image
curl -O http://localhost:5000/api/images/FILENAME.jpg
```

---

### 10. Delete Image

**Endpoint:** `DELETE /api/images/:filename`

**PowerShell:**
```powershell
$headers = @{ "Authorization" = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:5000/api/images/$filename" `
    -Method DELETE -Headers $headers
```

**cURL:**
```bash
curl -X DELETE http://localhost:5000/api/images/FILENAME.jpg \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 Transformation Endpoints

### 11. Resize Image

**Endpoint:** `GET /api/transform/:filename?width=500&height=300`

**PowerShell:**
```powershell
$url = "http://localhost:5000/api/transform/$filename?width=500&height=300&fit=cover"
Start-Process $url
```

**cURL:**
```bash
curl "http://localhost:5000/api/transform/FILENAME.jpg?width=500&height=300" \
  -o resized.jpg
```

---

### 12. Convert Format

**Endpoint:** `GET /api/transform/:filename?format=webp&quality=80`

**PowerShell:**
```powershell
$url = "http://localhost:5000/api/transform/$filename?format=webp&quality=80"
Invoke-WebRequest -Uri $url -OutFile "converted.webp"
```

---

### 13. Apply Filters

**Endpoint:** `GET /api/transform/:filename?grayscale=true&blur=2`

**PowerShell:**
```powershell
# Grayscale
$url = "http://localhost:5000/api/transform/$filename?grayscale=true"

# Blur
$url = "http://localhost:5000/api/transform/$filename?blur=5"

# Sharpen
$url = "http://localhost:5000/api/transform/$filename?sharpen=true"

# Multiple filters
$url = "http://localhost:5000/api/transform/$filename?grayscale=true&blur=2&sharpen=true"

Start-Process $url
```

---

### 14. Color Adjustments

**Endpoint:** `GET /api/transform/:filename?brightness=1.2&saturation=1.5`

**PowerShell:**
```powershell
$url = "http://localhost:5000/api/transform/$filename?brightness=1.2&saturation=1.5&hue=90"
Start-Process $url
```

---

### 15. Rotate and Flip

**Endpoint:** `GET /api/transform/:filename?rotate=90&flip=true`

**PowerShell:**
```powershell
# Rotate 90 degrees
$url = "http://localhost:5000/api/transform/$filename?rotate=90"

# Flip vertically
$url = "http://localhost:5000/api/transform/$filename?flip=true"

# Flop horizontally
$url = "http://localhost:5000/api/transform/$filename?flop=true"

Start-Process $url
```

---

### 16. Use Preset

**Endpoint:** `GET /api/transform/:filename/preset/:presetName`

**Available Presets:**
- `thumbnail` - 150x150, cover fit
- `small` - 400px wide
- `medium` - 800px wide
- `large` - 1200px wide
- `avatar` - 200x200, WebP
- `social-media` - 1200x630, JPEG
- `profile-pic` - 500x500, WebP

**PowerShell:**
```powershell
# Thumbnail
$url = "http://localhost:5000/api/transform/$filename/preset/thumbnail"

# Social media
$url = "http://localhost:5000/api/transform/$filename/preset/social-media"

Start-Process $url
```

**cURL:**
```bash
curl "http://localhost:5000/api/transform/FILENAME.jpg/preset/thumbnail" \
  -o thumbnail.jpg
```

---

### 17. Get Image Info

**Endpoint:** `GET /api/transform/:filename/info`

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/transform/$filename/info"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "format": "jpeg",
    "width": 1920,
    "height": 1080,
    "space": "srgb",
    "channels": 3,
    "depth": "uchar",
    "density": 72,
    "hasAlpha": false,
    "size": 1024000,
    "sizeFormatted": "1000 KB"
  }
}
```

---

### 18. Batch Transformations

**Endpoint:** `POST /api/transform/:filename/batch`

**PowerShell:**
```powershell
$body = @{
    transformations = @(
        @{ width = 200; format = "webp" }
        @{ width = 500; format = "jpeg"; quality = 90 }
        @{ grayscale = $true; width = 400 }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5000/api/transform/$filename/batch" `
    -Method POST -Body $body -ContentType "application/json"
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/transform/FILENAME.jpg/batch \
  -H "Content-Type: application/json" \
  -d '{
    "transformations": [
      {"width": 200, "format": "webp"},
      {"width": 500, "format": "jpeg", "quality": 90},
      {"grayscale": true, "width": 400}
    ]
  }'
```

---

## 👤 User Management Endpoints

### 19. Get User Profile with Stats

**Endpoint:** `GET /api/user/profile`

**PowerShell:**
```powershell
$headers = @{ "Authorization" = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:5000/api/user/profile" `
    -Method GET -Headers $headers
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "demo@example.com",
    "quota_used": 5,
    "quota_limit": 100,
    "quota_remaining": 95,
    "total_images": 5,
    "total_storage": 5120000,
    "total_storage_formatted": "5 MB",
    "created_at": "2026-01-16T10:00:00.000Z"
  }
}
```

---

### 20. List User Images (Paginated)

**Endpoint:** `GET /api/user/images?limit=20&offset=0`

**PowerShell:**
```powershell
$headers = @{ "Authorization" = "Bearer $token" }

# First page (20 images)
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/user/images?limit=20&offset=0" `
    -Method GET -Headers $headers

# Second page
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/user/images?limit=20&offset=20" `
    -Method GET -Headers $headers

# Display results
$response.data.images | Format-Table filename, size_formatted, created_at
```

---

### 21. Get Detailed Statistics

**Endpoint:** `GET /api/user/stats`

**PowerShell:**
```powershell
$headers = @{ "Authorization" = "Bearer $token" }

$stats = Invoke-RestMethod -Uri "http://localhost:5000/api/user/stats" `
    -Method GET -Headers $headers

Write-Host "Quota Used: $($stats.data.quota.used)/$($stats.data.quota.limit)"
Write-Host "Total Images: $($stats.data.images.total)"
Write-Host "Total Storage: $($stats.data.images.total_size_formatted)"
```

---

## 🧪 Complete Test Workflow

Here's a complete workflow to test all major features:

```powershell
# 1. Register user
$registerBody = @{
    email = "test@example.com"
    password = "test123456"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/auth/register" `
    -Method POST -Body $registerBody -ContentType "application/json"

$token = $registerResponse.data.token
$apiKey = $registerResponse.data.user.api_key

Write-Host "✅ Registered user"
Write-Host "Token: $token"
Write-Host "API Key: $apiKey"

# 2. Upload image
$headers = @{ "Authorization" = "Bearer $token" }
$imagePath = "C:\path\to\image.jpg"

$uploadResponse = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/upload/single" `
    -Method POST -Headers $headers -Form @{ image = Get-Item $imagePath }

$filename = $uploadResponse.data.filename
Write-Host "✅ Uploaded image: $filename"

# 3. Get image info
$info = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/transform/$filename/info"

Write-Host "✅ Image info: $($info.data.width)x$($info.data.height)"

# 4. Transform image
$transformUrl = "http://localhost:5000/api/transform/$filename?width=500&format=webp"
Invoke-WebRequest -Uri $transformUrl -OutFile "transformed.webp"
Write-Host "✅ Transformed image saved"

# 5. Get user stats
$stats = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/user/stats" `
    -Method GET -Headers $headers

Write-Host "✅ User stats: $($stats.data.images.total) images, $($stats.data.images.total_size_formatted)"

# 6. List images
$images = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/user/images" `
    -Method GET -Headers $headers

Write-Host "✅ Found $($images.data.pagination.total) images"

# 7. Delete image
Invoke-RestMethod `
    -Uri "http://localhost:5000/api/images/$filename" `
    -Method DELETE -Headers $headers

Write-Host "✅ Deleted image"

Write-Host "`n🎉 All tests passed!"
```

---

## 🔍 Transformation Parameters Reference

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `width` | integer | Target width in pixels | `?width=500` |
| `height` | integer | Target height in pixels | `?height=300` |
| `fit` | string | Resize fit mode: cover, contain, fill, inside, outside | `?fit=cover` |
| `format` | string | Output format: jpeg, png, webp, gif | `?format=webp` |
| `quality` | integer | Quality 1-100 | `?quality=80` |
| `grayscale` | boolean | Convert to grayscale | `?grayscale=true` |
| `blur` | float | Blur sigma (0.3-1000) | `?blur=5` |
| `sharpen` | boolean | Sharpen image | `?sharpen=true` |
| `rotate` | integer | Rotation angle in degrees | `?rotate=90` |
| `flip` | boolean | Flip vertically | `?flip=true` |
| `flop` | boolean | Flip horizontally | `?flop=true` |
| `brightness` | float | Brightness multiplier | `?brightness=1.2` |
| `saturation` | float | Saturation multiplier | `?saturation=1.5` |
| `hue` | integer | Hue rotation in degrees | `?hue=90` |

---

## 📊 Response Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded or quota exceeded |
| 500 | Internal Server Error | Server error |

---

## 🛠️ Troubleshooting

### Authentication Errors

```powershell
# Test if token is valid
$headers = @{ "Authorization" = "Bearer $token" }
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Headers $headers
    Write-Host "✅ Token is valid"
} catch {
    Write-Host "❌ Token is invalid or expired"
}
```

### Upload Errors

```powershell
# Check quota
$stats = Invoke-RestMethod -Uri "http://localhost:5000/api/user/stats" -Headers $headers
if ($stats.data.quota.remaining -eq 0) {
    Write-Host "❌ Quota exceeded"
}
```

---

## 📚 Additional Resources

- **Swagger UI:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/health
- **README:** [README.md](./README.md)
- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
