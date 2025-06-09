#!/usr/bin/env node

/**
 * Custom Static Site Generation (SSG) for Debugi
 * Pre-renders all Angular routes to static HTML files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  DEFAULT_CONFIG,
  extractRoutes,
  fixAssetReferences,
  ensureDependencies,
  createBasicStaticRoutes
} = require('./shared/prerender-utils');

// Local configuration with higher timeout for this script
const CONFIG = {
  ...DEFAULT_CONFIG,
  timeout: 30000, // 30 seconds timeout
};

/**
 * Check if the Angular app is built and build it if necessary
 */
function ensureAppIsBuilt() {
  if (!fs.existsSync(CONFIG.indexPath)) {
    console.log('📦 Building Angular app first...');
    try {
      execSync('npm run build:no-lint', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    } catch (error) {
      console.error('✗ Failed to build Angular app:', error.message);
      process.exit(1);
    }
  }
}







/**
 * Start a local HTTP server to serve the built app
 */
function startLocalServer() {
  const express = require('express');
  const app = express();
  const port = 4200;
  
  // Serve static files from dist directory
  app.use(express.static(CONFIG.distPath));
  
  // Handle all routes by serving index.html (Angular routing)
  app.get('*', (req, res) => {
    res.sendFile(CONFIG.indexPath);
  });
  
  const server = app.listen(port, () => {
    console.log(`✓ Local server started at http://localhost:${port}`);
  });
  
  return server;
}

/**
 * Pre-render a single route
 */
async function prerenderRoute(route) {
  const puppeteer = require('puppeteer');
  
  try {
    console.log(`🔄 Pre-rendering: ${route}`);
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to the route
    const url = `${CONFIG.baseUrl}${route === '/' ? '' : route}`;
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout 
    });
    
    // Wait for Angular to finish rendering
    await page.waitForFunction(() => {
      return window.document.readyState === 'complete';
    });
    
    // Additional wait for dynamic content
    await page.waitForTimeout(2000);
    
    // Get the rendered HTML
    const html = await page.content();
    
    await browser.close();
    
    // Create directory structure if needed
    const routePath = route === '/' ? '' : route;
    const outputDir = path.join(CONFIG.distPath, routePath);
    
    if (routePath) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the HTML file
    const outputFile = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputFile, html, 'utf8');
    
    console.log(`✓ Pre-rendered: ${route} -> ${outputFile}`);
    
  } catch (error) {
    console.error(`✗ Failed to pre-render ${route}:`, error.message);
    throw error;
  }
}

/**
 * Pre-render all routes
 */
async function prerenderAllRoutes(routes, server) {
  console.log(`\n🚀 Starting pre-rendering of ${routes.length} routes...\n`);
  
  try {
    // Pre-render each route sequentially to avoid overwhelming the server
    for (const route of routes) {
      await prerenderRoute(route);
    }
    
    console.log(`\n✅ Successfully pre-rendered all ${routes.length} routes!`);
    
  } catch (error) {
    console.error('\n✗ Pre-rendering failed:', error.message);
    throw error;
  } finally {
    // Close the server
    if (server) {
      server.close();
      console.log('✓ Local server stopped');
    }
  }
}



/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Static Site Generation (SSG) for Debugi...\n');
  
  try {
    // Install dependencies if needed
    ensureDependencies();
    
    // Ensure the app is built
    ensureAppIsBuilt();
    
    // Extract routes using shared utility
    const routes = extractRoutes(CONFIG.routesPath);
    
    // Create basic static routes using shared utility
    await createBasicStaticRoutes(routes, CONFIG.distPath, CONFIG.indexPath);
    
    console.log('\n🎉 Static Site Generation completed successfully!');
    console.log('📁 All routes have been set up for static hosting.');
    console.log('💡 Note: This creates basic static structure. For full pre-rendering, consider using Angular Universal.');
    
  } catch (error) {
    console.error('\n💥 Static Site Generation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
