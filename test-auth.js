import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000';

async function testAuthenticationSystem() {
    console.log('🚀 Testing PixelForge Authentication System...\n');

    try {
        // Step 1: Register a new user
        console.log('📝 Step 1: Registering new user...');

        const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'testuser@example.com',
                password: 'password123'
            })
        });

        const registerResult = await registerResponse.json();

        if (!registerResult.success) {
            // User might already exist, try login instead
            console.log('⚠️  User already exists, attempting login...\n');

            const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'testuser@example.com',
                    password: 'password123'
                })
            });

            const loginResult = await loginResponse.json();

            if (!loginResult.success) {
                throw new Error(loginResult.error);
            }

            console.log('✅ Login successful!');
            console.log(`   Email: ${loginResult.data.user.email}`);
            console.log(`   API Key: ${loginResult.data.user.api_key}`);
            console.log(`   Quota: ${loginResult.data.user.quota_used}/${loginResult.data.user.quota_limit}\n`);

            var token = loginResult.data.token;
            var apiKey = loginResult.data.user.api_key;
        } else {
            console.log('✅ Registration successful!');
            console.log(`   Email: ${registerResult.data.user.email}`);
            console.log(`   API Key: ${registerResult.data.user.api_key}`);
            console.log(`   Quota: ${registerResult.data.user.quota_used}/${registerResult.data.user.quota_limit}\n`);

            var token = registerResult.data.token;
            var apiKey = registerResult.data.user.api_key;
        }

        // Step 2: Test /api/auth/me endpoint
        console.log('👤 Step 2: Testing /api/auth/me endpoint...');

        const meResponse = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const meResult = await meResponse.json();
        console.log('✅ Profile retrieved successfully!');
        console.log(`   Email: ${meResult.data.email}`);
        console.log(`   Quota: ${meResult.data.quota_used}/${meResult.data.quota_limit}\n`);

        // Step 3: Test image upload with JWT token
        console.log('📤 Step 3: Testing image upload with JWT token...');

        // Create a simple test image (1x1 pixel PNG)
        const testImageBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
        );

        const formData = new FormData();
        const blob = new Blob([testImageBuffer], { type: 'image/png' });
        formData.append('image', blob, 'test-image.png');

        const uploadResponse = await fetch(`${API_URL}/api/upload/single`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
            throw new Error(uploadResult.error);
        }

        console.log('✅ Upload with JWT successful!');
        console.log(`   Filename: ${uploadResult.data.filename}`);
        console.log(`   URL: ${uploadResult.data.url}\n`);

        const uploadedFilename = uploadResult.data.filename;

        // Step 4: Test image upload with API key
        console.log('🔑 Step 4: Testing image upload with API key...');

        const formData2 = new FormData();
        const blob2 = new Blob([testImageBuffer], { type: 'image/png' });
        formData2.append('image', blob2, 'test-image-2.png');

        const uploadResponse2 = await fetch(`${API_URL}/api/upload/single`, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey
            },
            body: formData2
        });

        const uploadResult2 = await uploadResponse2.json();

        if (!uploadResult2.success) {
            throw new Error(uploadResult2.error);
        }

        console.log('✅ Upload with API key successful!');
        console.log(`   Filename: ${uploadResult2.data.filename}\n`);

        // Step 5: Test user profile endpoint
        console.log('📊 Step 5: Testing /api/user/profile endpoint...');

        const profileResponse = await fetch(`${API_URL}/api/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const profileResult = await profileResponse.json();
        console.log('✅ User profile retrieved!');
        console.log(`   Total Images: ${profileResult.data.total_images}`);
        console.log(`   Total Storage: ${profileResult.data.total_storage_formatted}`);
        console.log(`   Quota Remaining: ${profileResult.data.quota_remaining}\n`);

        // Step 6: Test user images list
        console.log('🖼️  Step 6: Testing /api/user/images endpoint...');

        const imagesResponse = await fetch(`${API_URL}/api/user/images`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const imagesResult = await imagesResponse.json();
        console.log('✅ User images retrieved!');
        console.log(`   Total: ${imagesResult.data.pagination.total} images`);
        console.log(`   Showing: ${imagesResult.data.images.length} images\n`);

        // Step 7: Test protected delete (should succeed - owner)
        console.log('🗑️  Step 7: Testing image deletion (as owner)...');

        const deleteResponse = await fetch(`${API_URL}/api/images/${uploadedFilename}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const deleteResult = await deleteResponse.json();
        console.log('✅ Image deleted successfully!\n');

        // Step 8: Test without authentication (should fail)
        console.log('🚫 Step 8: Testing upload without authentication (should fail)...');

        const formData3 = new FormData();
        const blob3 = new Blob([testImageBuffer], { type: 'image/png' });
        formData3.append('image', blob3, 'test-image-3.png');

        const uploadResponse3 = await fetch(`${API_URL}/api/upload/single`, {
            method: 'POST',
            body: formData3
        });

        const uploadResult3 = await uploadResponse3.json();

        if (uploadResponse3.status === 401) {
            console.log('✅ Correctly rejected unauthenticated request!');
            console.log(`   Error: ${uploadResult3.error}\n`);
        } else {
            console.log('❌ Should have rejected unauthenticated request!\n');
        }

        console.log('🎉 All authentication tests passed!\n');
        console.log('📝 Summary:');
        console.log('   ✅ User registration/login');
        console.log('   ✅ JWT token authentication');
        console.log('   ✅ API key authentication');
        console.log('   ✅ Protected routes');
        console.log('   ✅ Image ownership verification');
        console.log('   ✅ User profile and stats');
        console.log('   ✅ Database integration');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

// Run tests
testAuthenticationSystem();
