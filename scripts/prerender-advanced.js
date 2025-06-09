#!/usr/bin/env node

/**
 * Advanced Static Site Generation (SSG) for Debugi
 * Pre-renders Angular routes to static HTML using Puppeteer
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const {
  DEFAULT_CONFIG,
  extractRoutes: extractRoutesUtil,
  ensureAppIsBuilt: ensureAppIsBuiltUtil,
  initializeBrowser,
  setupPage,
  navigateAndWait,
  writeRouteFile,
  createFallbackRoute,
  fixRootIndexFile
} = require('./shared/prerender-utils');

const CONFIG = {
  ...DEFAULT_CONFIG,
  timeout: 15000,
};

/**
 * Extract routes from Angular routes file
 */
function extractRoutes() {
  return extractRoutesUtil(CONFIG.routesPath);
}

/**
 * Check if the Angular app is built
 */
function ensureAppIsBuilt() {
  ensureAppIsBuiltUtil(CONFIG.indexPath);
}

/**
 * Start Angular dev server in the background
 */
function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Angular dev server...');
    
    const server = spawn('npm', ['run', 'start'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    server.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Local:') && output.includes('4200')) {
        console.log('✓ Angular dev server is ready');
        resolve(server);
      }
    });
    
    server.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      if (errorOutput.includes('Error') && !errorOutput.includes('WARNING')) {
        reject(new Error(`Server failed to start: ${errorOutput}`));
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 30000);
  });
}

/**
 * Pre-render a single route with improved error handling
 */
async function prerenderRoute(route) {
  let browser;
  try {
    console.log(`🔄 Pre-rendering: ${route}`);
    browser = await initializeBrowser();
    const page = await setupPage(browser);
    const url = `${CONFIG.baseUrl}${route === '/' ? '' : route}`;
    await navigateAndWait(page, url, CONFIG.timeout);
    const html = await page.content();
    await browser.close();
    writeRouteFile(route, html, CONFIG.distPath);
    return { success: true, route };
  } catch (error) {
    console.error(`✗ Failed to pre-render ${route}:`, error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error(`  Could not close browser: ${closeError.message}`);
      }
    }
    // Create fallback route but don't fail the entire process
    try {
      createFallbackRoute(route, CONFIG.indexPath, CONFIG.distPath);
      return { success: false, route, fallbackCreated: true };
    } catch (fallbackError) {
      console.error(`  Could not create fallback for ${route}: ${fallbackError.message}`);
      return { success: false, route, fallbackCreated: false };
    }
  }
}

/**
 * Pre-render all routes in parallel
 */
async function prerenderAllRoutes(routes) {
  console.log(`\n🚀 Starting parallel pre-rendering of ${routes.length} routes...\n`);
  
  try {
    // Set a limit on concurrent pre-rendering to prevent overloading
    const MAX_CONCURRENT = 5; // Adjust based on your machine's capabilities
    
    // Keep track of successful and failed routes
    const results = {
      success: 0,
      failure: 0,
      fallback: 0
    };
    
    // Process routes in batches
    for (let i = 0; i < routes.length; i += MAX_CONCURRENT) {
      const batch = routes.slice(i, i + MAX_CONCURRENT);
      const batchPromises = batch.map(route => prerenderRoute(route));
      
      // Wait for current batch to complete before starting next batch
      const batchResults = await Promise.all(batchPromises);
      
      // Update results
      batchResults.forEach(result => {
        if (result.success) {
          results.success++;
        } else if (result.fallbackCreated) {
          results.fallback++;
        } else {
          results.failure++;
        }
      });
      
      // Log progress
      const completed = Math.min(i + MAX_CONCURRENT, routes.length);
      console.log(`📊 Progress: ${completed}/${routes.length} routes processed (${Math.round(completed/routes.length*100)}%)`);
    }
    
    // Fix the root index.html last
    fixRootIndexFile(CONFIG.distPath);
    
    console.log(`\n✅ Successfully processed all ${routes.length} routes in parallel!`);
    console.log(`📈 Results: ${results.success} successful, ${results.fallback} fallbacks created, ${results.failure} failed`);
    
  } catch (error) {
    console.error('\n✗ Parallel pre-rendering failed:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Advanced Static Site Generation (SSG) for Debugi...\n');
  
  let server = null;
  
  try {
    // Ensure the app is built
    ensureAppIsBuilt();
    
    // Extract routes
    const routes = extractRoutes();
    
    // Start dev server
    server = await startDevServer();
    
    // Wait a bit more for full startup
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Pre-render all routes in parallel
    await prerenderAllRoutes(routes);
    
    console.log('\n🎉 Advanced Static Site Generation completed successfully!');
    console.log('📁 All routes have been pre-rendered to static HTML files in parallel.');
    console.log('🚀 Your site is now ready for static hosting with improved SEO and performance!');
    
  } catch (error) {
    console.error('\n💥 Advanced Static Site Generation failed:', error.message);
    console.log('\n🔄 Falling back to basic static route structure...');
    
    // Fallback to basic static generation
    try {
      const routes = extractRoutes();
      const indexContent = fs.readFileSync(CONFIG.indexPath, 'utf8');
      
      for (const route of routes) {
        if (route === '/') continue;
        
        const routePath = route.substring(1);
        const outputDir = path.join(CONFIG.distPath, routePath);
        
        fs.mkdirSync(outputDir, { recursive: true });
        const outputFile = path.join(outputDir, 'index.html');
        fs.writeFileSync(outputFile, indexContent, 'utf8');
        
        console.log(`📄 Created fallback route: ${route} -> ${outputFile}`);
      }
      
      console.log('\n✅ Basic static structure created successfully!');
    } catch (fallbackError) {
      console.error('💥 Fallback also failed:', fallbackError.message);
      process.exit(1);
    }
  } finally {
    // Stop the dev server
    if (server) {
      console.log('\n🛑 Stopping Angular dev server...');
      server.kill('SIGTERM');
      
      // Give it time to shut down gracefully
      setTimeout(() => {
        if (!server.killed) {
          server.kill('SIGKILL');
        }
      }, 3000);
    }
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, extractRoutes, prerenderRoute };
