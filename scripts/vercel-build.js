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
    // Check for puppeteer-core version issues
    checkDependencies();
    
    // Run the build
    console.log('📦 Building Angular app for production...');
    execSync('npm run build:prod', { stdio: 'inherit' });
    
    // Run the prerender with fallback option
    console.log('🔄 Running pre-rendering with Vercel optimizations...');
    execSync('node scripts/prerender-advanced.js', { stdio: 'inherit', env: { ...process.env, VERCEL: '1' } });
    
    // Generate SEO files
    console.log('🔍 Generating SEO files...');
    execSync('npm run seo:generate', { stdio: 'inherit' });
    
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

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
