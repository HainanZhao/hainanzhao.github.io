#!/usr/bin/env node

/**
 * Vercel-specific build script
 * This script handles the special case of running on Vercel's build environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set Vercel environment variable
process.env.VERCEL = '1';

// Main function
async function main() {
  console.log('🚀 Starting Vercel-specific build process...');
  
  try {
    // Check for dependencies
    await checkDependencies();
    
    // Handle platform-specific setup
    await setupPlatform();
    
    // Run the build
    console.log('📦 Building Angular app for Vercel deployment...');
    execSync('npm run build:vercel:base', { stdio: 'inherit' });
    
    // Always use JavaScript-only prerendering (no browser required)
    console.log('🔄 Running JavaScript-only pre-rendering...');
    execSync('node scripts/prerender-js-only.js', { stdio: 'inherit' });
    
    // Generate SEO files
    console.log('🔍 Generating SEO files...');
    execSync('node scripts/generate-seo.js', { stdio: 'inherit' });
    
    console.log('✅ Vercel build completed successfully!');
  } catch (error) {
    console.error('❌ Vercel build failed:', error.message);
    process.exit(1);
  }
}

// Check and handle dependency issues - simplified for JS-only approach
async function checkDependencies() {
  console.log('🔧 Using JavaScript-based static generation (no browser required)');
  
  // Always use fallback mode for Vercel to avoid Chrome dependency issues
  process.env.USE_FALLBACK = '1';
  
  // Check for required Node.js modules only
  try {
    // Verify basic dependencies that don't require native binaries
    require('fs');
    require('path');
    console.log('✅ Basic dependencies available');
    
    // Check if we have the built Angular app
    const distPath = path.join(__dirname, '../dist/debugi');
    const indexPath = path.join(distPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      console.log('✅ Built Angular app found');
    } else {
      console.log('⚠️ Angular app not built yet - will be built during process');
    }
    
  } catch (error) {
    console.warn('⚠️ Basic dependency check failed:', error.message);
    throw new Error('Missing required Node.js dependencies');
  }
}

// Setup platform-specific requirements
async function setupPlatform() {
  // Detect platform
  const platform = process.platform;
  console.log(`🖥️ Detected platform: ${platform}`);
  
  // Handle esbuild platform requirements
  try {
    // Try to require esbuild to check if it's properly installed
    require('esbuild');
    console.log('✅ esbuild is installed and accessible');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' || error.message.includes('could not be found')) {
      console.log('⚠️ esbuild not found, installing platform-specific version...');
      
      // Install esbuild for the current platform
      try {
        execSync('npm install esbuild --no-save', { stdio: 'inherit' });
        console.log('✅ Successfully installed esbuild');
      } catch (installError) {
        console.error('❌ Failed to install esbuild:', installError.message);
        throw new Error('Failed to install required build dependencies');
      }
    } else {
      console.error('❌ Unexpected esbuild error:', error.message);
      throw error;
    }
  }
  
  // Additional platform-specific setup can be added here
  if (platform === 'linux') {
    try {
      // Ensure linux-specific packages are available
      execSync('npm install @esbuild/linux-x64 --no-save', { stdio: 'inherit' });
      console.log('✅ Installed Linux-specific dependencies');
    } catch (error) {
      console.warn('⚠️ Failed to install Linux-specific dependencies:', error.message);
      // Continue anyway as the main esbuild install might have handled this
    }
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
