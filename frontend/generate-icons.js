const sharp = require('sharp');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets', 'images');
const logoPath = path.join(assetsDir, 'logo-original.png');

async function generateIcons() {
  try {
    // App Icon (1024x1024) - resize the logo with padding on white background
    console.log('Generating icon.png (1024x1024)...');
    await sharp(logoPath)
      .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));

    // Adaptive Icon for Android (1024x1024) - with more padding
    console.log('Generating adaptive-icon.png (1024x1024)...');
    await sharp(logoPath)
      .resize(800, 800, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: 112,
        bottom: 112,
        left: 112,
        right: 112,
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));

    // Favicon (48x48)
    console.log('Generating favicon.png (48x48)...');
    await sharp(logoPath)
      .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));

    // Splash Icon (200x200)
    console.log('Generating splash-icon.png (200x200)...');
    await sharp(logoPath)
      .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(assetsDir, 'splash-icon.png'));

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
