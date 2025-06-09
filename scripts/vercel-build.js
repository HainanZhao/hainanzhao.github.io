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
    if (process.env.USE_FALLBACK === '1') {
      console.log('ℹ️ Using fallback build mode...');
      execSync('npm run build:vercel:base', { stdio: 'inherit' });
    } else {
      execSync('npm run build:vercel:base', { stdio: 'inherit' });
      
      // Run the prerender with Vercel optimizations
      console.log('🔄 Running pre-rendering with Vercel optimizations...');
      execSync('node scripts/prerender-advanced.js', { stdio: 'inherit', env: { ...process.env, VERCEL: '1' } });
    }
    
    // Generate SEO files
    console.log('🔍 Generating SEO files...');
    execSync('node scripts/generate-seo.js', { stdio: 'inherit' });
    
    console.log('✅ Vercel build completed successfully!');
  } catch (error) {
    console.error('❌ Vercel build failed:', error.message);
    process.exit(1);
  }
}

// Check and handle dependency issues
function checkDependencies() {
  try {
    // Try to require chrome-aws-lambda to see if it works
    require('chrome-aws-lambda');
    console.log('✅ chrome-aws-lambda is installed and accessible');
  } catch (error) {
    console.warn('⚠️ chrome-aws-lambda could not be loaded, using fallback mode');
    process.env.USE_FALLBACK = '1';
  }
  
  try {
    // Make sure puppeteer-core is the compatible version
    const puppeteerCorePath = require.resolve('puppeteer-core');
    const packageJsonPath = path.join(path.dirname(puppeteerCorePath), '..', 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      console.log(`📊 Using puppeteer-core version: ${packageJson.version}`);
      
      // Check if version is compatible with chrome-aws-lambda
      const versionNumber = packageJson.version.split('.');
      const majorVersion = parseInt(versionNumber[0]);
      
      if (majorVersion > 10) {
        console.warn('⚠️ puppeteer-core version is too new for chrome-aws-lambda, using fallback mode');
        process.env.USE_FALLBACK = '1';
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not check puppeteer-core version:', error.message);
    process.env.USE_FALLBACK = '1';
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
