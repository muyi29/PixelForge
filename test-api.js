import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000';

// Change this to your image path
const IMAGE_PATH = 'C:\\Users\\hp\\OneDrive\\Pictures\\Screenshots\\img1.png';

async function testAPI() {
  console.log('🚀 Testing PixelForge API...\n');

  try {
    // Step 1: Upload image
    console.log('📤 Step 1: Uploading image...');
    
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(IMAGE_PATH);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    formData.append('image', blob, path.basename(IMAGE_PATH));

    const uploadResponse = await fetch(`${API_URL}/api/upload/single`, {
      method: 'POST',
      body: formData
    });

    const uploadResult = await uploadResponse.json();
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    console.log('✅ Upload successful!');
    console.log(`   Filename: ${uploadResult.data.filename}`);
    console.log(`   Original URL: ${uploadResult.data.url}\n`);

    const filename = uploadResult.data.filename;

    // Step 2: Test transformations
    console.log('🎨 Step 2: Testing transformations...\n');

    const tests = [
      {
        name: 'Resize to 500x300',
        url: `${API_URL}/api/transform/${filename}?width=500&height=300`
      },
      {
        name: 'Convert to WebP',
        url: `${API_URL}/api/transform/${filename}?format=webp&quality=80`
      },
      {
        name: 'Grayscale filter',
        url: `${API_URL}/api/transform/${filename}?grayscale=true`
      },
      {
        name: 'Thumbnail preset',
        url: `${API_URL}/api/transform/${filename}/preset/thumbnail`
      },
      {
        name: 'Image info',
        url: `${API_URL}/api/transform/${filename}/info`
      }
    ];

    for (const test of tests) {
      const response = await fetch(test.url);
      
      if (test.name === 'Image info') {
        const info = await response.json();
        console.log(`✅ ${test.name}:`);
        console.log(`   Format: ${info.data.format}`);
        console.log(`   Size: ${info.data.width}x${info.data.height}`);
        console.log(`   File size: ${info.data.sizeFormatted}\n`);
      } else {
        console.log(`✅ ${test.name}: ${test.url}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Cache: ${response.headers.get('X-Cache')}\n`);
      }
    }

    // Step 3: Test batch processing
    console.log('📦 Step 3: Testing batch processing...\n');

    const batchResponse = await fetch(`${API_URL}/api/transform/${filename}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transformations: [
          { width: 200, format: 'webp' },
          { width: 500, format: 'jpeg', quality: 90 },
          { grayscale: true, width: 400 }
        ]
      })
    });

    const batchResult = await batchResponse.json();
    console.log('✅ Batch processing complete!');
    console.log(`   Processed: ${batchResult.data.length} transformations\n`);

    console.log('🎉 All tests passed!');
    console.log('\n📝 You can now open these URLs in your browser:');
    tests.forEach(test => {
      if (test.name !== 'Image info') {
        console.log(`   ${test.url}`);
      }
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testAPI();