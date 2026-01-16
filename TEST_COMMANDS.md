# Test Authentication System

## Quick Test Commands

### 1. Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
```

### 2. Register New User
```powershell
$body = @{
    email = "demo@example.com"
    password = "demo123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### 3. Login
```powershell
$body = @{
    email = "demo@example.com"
    password = "demo123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.data.token
$apiKey = $response.data.user.api_key

Write-Host "Token: $token"
Write-Host "API Key: $apiKey"
```

### 4. Get User Profile (with JWT)
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers
```

### 5. Upload Image (with JWT)
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

# Create a test file first
$testImage = "C:\Users\hp\OneDrive\Pictures\Screenshots\img1.png"

$form = @{
    image = Get-Item -Path $testImage
}

Invoke-RestMethod -Uri "http://localhost:5000/api/upload/single" -Method POST -Headers $headers -Form $form
```

### 6. Upload Image (with API Key)
```powershell
$headers = @{
    "X-API-Key" = $apiKey
}

$form = @{
    image = Get-Item -Path $testImage
}

Invoke-RestMethod -Uri "http://localhost:5000/api/upload/single" -Method POST -Headers $headers -Form $form
```

### 7. Get User Images List
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/user/images" -Method GET -Headers $headers
```

### 8. Get User Stats
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/user/stats" -Method GET -Headers $headers
```

### 9. Delete Image (requires ownership)
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/images/FILENAME.jpg" -Method DELETE -Headers $headers
```

### 10. Test Without Auth (should fail)
```powershell
# This should return 401 Unauthorized
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/upload/single" -Method POST
} catch {
    Write-Host "Expected error: $_"
}
```
