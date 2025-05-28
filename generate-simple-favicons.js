const sharp = require('sharp');
const fs = require('fs');

async function generateSimpleFavicons() {
  console.log('Starting simple favicon generation...');
  
  try {
    // Check if favicon-simple.svg exists
    console.log('Checking for favicon-simple.svg...');
    if (!fs.existsSync('./favicon-simple.svg')) {
      console.error('❌ favicon-simple.svg not found in current directory');
      console.log('Current directory:', process.cwd());
      console.log('Files in current directory:', fs.readdirSync('.').filter(f => f.endsWith('.svg')));
      throw new Error('favicon-simple.svg not found');
    }
    
    const svgBuffer = fs.readFileSync('./favicon-simple.svg');
    console.log('✓ Simple SVG file loaded, size:', svgBuffer.length, 'bytes');
    
    // Ensure public directory exists
    if (!fs.existsSync('./public')) {
      console.log('Creating public directory...');
      fs.mkdirSync('./public');
    }
    
    // Generate the main favicon.ico (32x32) as PNG
    console.log('Generating main favicon...');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile('./public/favicon.ico');
    
    console.log('✓ Generated favicon.ico (32x32 PNG)');
    
    // Generate multiple PNG sizes - focusing on small sizes for clarity
    const sizes = [16, 32, 48, 64, 128, 256];
    
    for (const size of sizes) {
      console.log(`Generating ${size}x${size} PNG...`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(`./public/favicon-${size}x${size}.png`);
      
      console.log(`✓ Generated favicon-${size}x${size}.png`);
    }
    
    // Generate Apple touch icon (180x180)
    console.log('Generating Apple touch icon...');
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile('./public/apple-touch-icon.png');
    
    console.log('✓ Generated apple-touch-icon.png');
    
    // Generate Android chrome icons
    console.log('Generating Android chrome icons...');
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile('./public/android-chrome-192x192.png');
    
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile('./public/android-chrome-512x512.png');
    
    console.log('✓ Generated Android chrome icons');
    
    console.log('\n🎉 All simple favicons generated successfully!');
    console.log('📝 The new favicon features a simple "D" letter that will be clearly visible at all sizes.');
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

generateSimpleFavicons();
