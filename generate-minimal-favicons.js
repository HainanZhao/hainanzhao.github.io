const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateMinimalFavicons() {
  const svgBuffer = fs.readFileSync('favicon-minimal.svg');
  
  // Sizes for different favicon formats
  const sizes = [16, 32, 48, 64, 128, 256, 512];
  
  console.log('Generating minimal favicons...');
  
  // Generate PNG favicons
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join('public', `favicon-${size}x${size}.png`));
    console.log(`Generated favicon-${size}x${size}.png`);
  }
  
  // Generate ICO favicon (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join('public', 'favicon.ico'));
  console.log('Generated favicon.ico');
  
  // Apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join('public', 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
  
  // Android Chrome icons
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join('public', 'android-chrome-192x192.png'));
  console.log('Generated android-chrome-192x192.png');
  
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join('public', 'android-chrome-512x512.png'));
  console.log('Generated android-chrome-512x512.png');
  
  console.log('All minimal favicons generated successfully!');
}

generateMinimalFavicons().catch(console.error);
