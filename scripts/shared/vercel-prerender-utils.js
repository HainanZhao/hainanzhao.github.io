/**
 * Serverless-friendly pre-rendering utilities for Vercel environment
 * Uses chrome-aws-lambda instead of standard puppeteer
 */

const fs = require('fs');
const path = require('path');
const { DEFAULT_CONFIG, fixAssetReferences, applyThemeClasses } = require('./prerender-utils');

/**
 * Initialize a browser using chrome-aws-lambda (serverless-friendly)
 */
async function initializeServerlessBrowser() {
  try {
    // Dynamically import chrome-aws-lambda and puppeteer-core
    // This is done dynamically to avoid issues when running locally
    const chromium = require('chrome-aws-lambda');
    
    // Try to use the compatible puppeteer-core version first
    let puppeteer;
    try {
      // This should match the version required by chrome-aws-lambda
      puppeteer = require('puppeteer-core');
      console.log('✓ Using compatible puppeteer-core with chrome-aws-lambda');
    } catch (err) {
      console.error('❗ Error loading puppeteer-core:', err.message);
      throw err;
    }
    
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1200, height: 800 },
      executablePath: await chromium.executablePath,
      headless: true,
    });
    
    console.log('✓ Successfully initialized serverless browser with chrome-aws-lambda');
    return browser;
  } catch (error) {
    console.error('Failed to initialize serverless browser:', error.message);
    console.log('Falling back to static file generation without rendering...');
    throw error;
  }
}

/**
 * Create static HTML files for all routes without using a browser
 * This is a fallback method when puppeteer cannot be used
 */
async function createStaticRoutesWithoutRendering(routes, distPath = DEFAULT_CONFIG.distPath) {
  console.log('\n📄 Creating static routes without rendering...\n');
  
  // Read the base index.html file
  const indexPath = path.join(distPath, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const fixedContent = fixAssetReferences(indexContent, distPath);
  
  // Apply theme classes
  const themedContent = applyThemeClasses(fixedContent);
  
  // Write back the fixed index.html
  fs.writeFileSync(indexPath, themedContent, 'utf8');
  console.log('✓ Fixed root index.html');
  
  // Create directories and files for each route
  for (const route of routes) {
    if (route === '/') continue; // Skip root
    
    const routePath = route.substring(1); // Remove leading slash
    const outputDir = path.join(distPath, routePath);
    
    // Create directory
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Copy fixed index.html
    const outputFile = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputFile, themedContent, 'utf8');
    
    console.log(`✓ Created static route: ${route} -> ${outputFile}`);
  }
  
  return true;
}

/**
 * Check if running in a Vercel build environment
 */
function isVercelEnvironment() {
  return process.env.VERCEL === '1' || process.env.NOW_BUILDER === '1';
}

module.exports = {
  initializeServerlessBrowser,
  createStaticRoutesWithoutRendering,
  isVercelEnvironment
};
