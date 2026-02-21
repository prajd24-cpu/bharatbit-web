const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Orange B logo SVG with proper sizing
const createLogoSVG = (size, padding = 0) => {
  const viewSize = size - (padding * 2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#ffffff"/>
  <g transform="translate(${padding}, ${padding})">
    <svg width="${viewSize}" height="${viewSize}" viewBox="0 0 100 100">
      <text x="50" y="75" 
        font-family="Arial Black, Arial, sans-serif" 
        font-size="90" 
        font-weight="900"
        fill="#E95721" 
        text-anchor="middle">B</text>
    </svg>
  </g>
</svg>`;
};

// Create splash logo (larger with more padding)
const createSplashSVG = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <text x="100" y="145" 
    font-family="Arial Black, Arial, sans-serif" 
    font-size="160" 
    font-weight="900"
    fill="#E95721" 
    text-anchor="middle">B</text>
</svg>`;
};

async function generateIcons() {
  const assetsDir = path.join(__dirname, 'assets', 'images');
  
  // Ensure directory exists
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  try {
    // App Icon (1024x1024)
    console.log('Generating icon.png...');
    await sharp(Buffer.from(createLogoSVG(1024, 100)))
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));

    // Adaptive Icon for Android (1024x1024)
    console.log('Generating adaptive-icon.png...');
    await sharp(Buffer.from(createLogoSVG(1024, 200)))
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));

    // Favicon (48x48)
    console.log('Generating favicon.png...');
    await sharp(Buffer.from(createLogoSVG(48, 4)))
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));

    // Splash Icon (200x200)
    console.log('Generating splash-icon.png...');
    await sharp(Buffer.from(createSplashSVG()))
      .resize(200, 200)
      .png()
      .toFile(path.join(assetsDir, 'splash-icon.png'));

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
