const https = require('https');
const fs = require('fs');
const path = require('path');

const sampleImages = [
  {
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
    filename: 'sample1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop',
    filename: 'sample2.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop',
    filename: 'sample3.jpg'
  }
];

const uploadDir = path.join(__dirname, 'uploads', 'properties');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(uploadDir, filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

async function downloadAllImages() {
  try {
    for (const image of sampleImages) {
      await downloadImage(image.url, image.filename);
    }
    console.log('✅ All sample images downloaded successfully');
  } catch (error) {
    console.error('❌ Error downloading images:', error);
  }
}

downloadAllImages(); 