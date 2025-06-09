#!/usr/bin/env node

/**
 * Advanced Static Site Generation (SSG) for Debugi
 * Pre-renders Angular routes to static HTML using Puppeteer
 */

// Load environment variables from .env.prerender file if present
try {
  require('dotenv').config({ path: '.env.prerender' });
  console.log('📄 Loaded configuration from .env.prerender');
} catch (error) {
  console.log('ℹ️ No .env.prerender configuration found, using defaults');
}

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
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

// Import Vercel-specific utilities
const {
  initializeServerlessBrowser,
  createStaticRoutesWithoutRendering,
  isVercelEnvironment
} = require('./shared/vercel-prerender-utils');

const CONFIG = {
  ...DEFAULT_CONFIG,
  timeout: 15000,
  // Resource management config
  maxConcurrent: process.env.MAX_CONCURRENT ? parseInt(process.env.MAX_CONCURRENT) : 5,
  maxCpuPercent: process.env.MAX_CPU_PERCENT ? parseInt(process.env.MAX_CPU_PERCENT) : 85, 
  checkResourcesInterval: 5000, // ms
};

/**
 * Check system resources and returns true if rendering should pause
 */
function shouldPauseRendering() {
  // Skip resource check if disabled
  if (process.env.DISABLE_RESOURCE_CHECK === '1') return false;
  
  try {
    // Get CPU load averages (1, 5, 15 minute averages)
    const cpus = os.cpus().length;
    const loadAvg = os.loadavg()[0]; // 1 minute average
    
    // Calculate percentage of CPU capacity being used
    // 100% means all cores are at 100% usage
    const cpuPercentage = (loadAvg / cpus) * 100;
    
    if (cpuPercentage > CONFIG.maxCpuPercent) {
      console.log(`⚠️ High CPU usage detected (${cpuPercentage.toFixed(1)}%), pausing new renders`);
      return true;
    }
    
    // Get free memory percentage
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const freeMemPercentage = (freeMem / totalMem) * 100;
    
    if (freeMemPercentage < 15) {
      console.log(`⚠️ Low memory detected (${freeMemPercentage.toFixed(1)}% free), pausing new renders`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn(`⚠️ Error checking system resources: ${error.message}`);
    return false; // Don't pause on error checking resources
  }
}

/**
 * Extract routes from Angular routes file
 */
function extractRoutes() {
  const routes = extractRoutesUtil(CONFIG.routesPath);
  
  // Allow limiting routes via env var for testing
  if (process.env.ROUTE_LIMIT) {
    const limit = parseInt(process.env.ROUTE_LIMIT);
    if (!isNaN(limit) && limit > 0) {
      console.log(`⚠️ Limiting to first ${limit} routes for testing`);
      return routes.slice(0, limit);
    }
  }
  
  // Allow specifying specific routes via env var for testing
  if (process.env.ROUTES) {
    const specificRoutes = process.env.ROUTES.split(',').map(r => r.trim());
    if (specificRoutes.length > 0) {
      const filteredRoutes = routes.filter(route => specificRoutes.includes(route));
      console.log(`⚠️ Filtering to ${filteredRoutes.length} specific routes: ${filteredRoutes.join(', ')}`);
      return filteredRoutes;
    }
  }
  
  return routes;
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
 * Pre-render a single route with improved error handling and reporting
 */
async function prerenderRoute(route) {
  let browser;
  let startTime = Date.now();
  
  try {
    console.log(`🔄 Pre-rendering: ${route}`);
    browser = await initializeBrowser();
    const page = await setupPage(browser);
    
    // Set up error handling on the page
    page.on('error', error => {
      console.error(`⚠️ Page error on ${route}:`, error.message);
    });
    page.on('pageerror', error => {
      console.error(`⚠️ Page JS error on ${route}:`, error.message);
    });
    
    // Enable request interception if debug is needed
    // await page.setRequestInterception(true);
    // page.on('request', request => {
    //   console.log(`Request: ${request.url()}`);
    //   request.continue();
    // });
    
    const url = `${CONFIG.baseUrl}${route === '/' ? '' : route}`;
    await navigateAndWait(page, url, CONFIG.timeout);
    const html = await page.content();
    
    // Log network requests that failed (only in verbose mode)
    if (process.env.VERBOSE === '1') {
      const client = await page.target().createCDPSession();
      const logs = await client.send('Network.getResponseBody');
      const failedRequests = logs.filter(log => log.status >= 400);
      if (failedRequests.length > 0) {
        console.log(`  ⚠️ ${failedRequests.length} failed network requests on ${route}`);
      }
    }
    
    await browser.close();
    browser = null;
    
    writeRouteFile(route, html, CONFIG.distPath);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Rendered ${route} in ${duration}s`);
    
    return { success: true, route, duration };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`❌ Failed to pre-render ${route} after ${duration}s:`, error.message);
    
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error(`  Could not close browser: ${closeError.message}`);
      }
    }
    
    // Create fallback route but don't fail the entire process
    try {
      console.log(`⚠️ Creating fallback for ${route}...`);
      createFallbackRoute(route, CONFIG.indexPath, CONFIG.distPath);
      return { success: false, route, fallbackCreated: true, duration, error: error.message };
    } catch (fallbackError) {
      console.error(`💥 Could not create fallback for ${route}: ${fallbackError.message}`);
      return { success: false, route, fallbackCreated: false, duration, error: error.message };
    }
  }
}

/**
 * Pre-render all routes in parallel using an improved dynamic queue system
 */
async function prerenderAllRoutes(routes) {
  console.log(`\n🚀 Starting parallel pre-rendering of ${routes.length} routes...\n`);
  
  try {
    // Keep track of successful and failed routes
    const results = {
      success: 0,
      failure: 0,
      fallback: 0,
      total: routes.length,
      completed: 0,
      startTime: Date.now(),
      completedRoutes: [],
      failedRoutes: []
    };
    
    // Max concurrent tasks - adjust based on your machine's capabilities
    const MAX_CONCURRENT = 5;
    
    // Queue of routes to process
    const queue = [...routes];
    
    // Active tasks tracking
    const activeTasks = new Map(); // Map of route -> Promise
    const pending = new Set(); // Routes currently being processed
    
    // Create function to calculate estimated time remaining
    const getTimeEstimate = () => {
      const elapsed = (Date.now() - results.startTime) / 1000; // seconds
      const completed = results.completed;
      if (completed === 0) return 'calculating...';
      
      const avgTimePerRoute = elapsed / completed;
      const remaining = results.total - completed;
      const estimatedSecondsLeft = avgTimePerRoute * remaining;
      
      if (estimatedSecondsLeft < 60) {
        return `~${Math.round(estimatedSecondsLeft)} seconds`;
      } else if (estimatedSecondsLeft < 3600) {
        return `~${Math.round(estimatedSecondsLeft / 60)} minutes`;
      } else {
        const hours = Math.floor(estimatedSecondsLeft / 3600);
        const minutes = Math.round((estimatedSecondsLeft % 3600) / 60);
        return `~${hours}h ${minutes}m`;
      }
    };
    
    // Progress logging function
    const logProgress = (force = false) => {
      if (force || results.completed % 5 === 0 || results.completed === results.total) {
        const percent = Math.round(results.completed / results.total * 100);
        const activeCount = pending.size;
        const timeLeft = getTimeEstimate();
        
        console.log(
          `📊 Progress: ${results.completed}/${results.total} routes (${percent}%) | ` +
          `✅ ${results.success} success | ⚠️ ${results.fallback} fallback | ❌ ${results.failure} failed | ` +
          `🔄 ${activeCount} active | ⏱️ ${timeLeft} remaining`
        );
      }
    };
    
    // Function to process the next item in the queue
    const processNextFromQueue = async () => {
      if (queue.length === 0) return null;
      
      // Check if we should pause due to high system load
      if (shouldPauseRendering() && pending.size > 0) {
        console.log(`🛑 Pausing queue processing due to high system load (${pending.size} tasks still running)`);
        // Return a promise that resolves after a delay
        return new Promise(resolve => setTimeout(() => {
          console.log('▶️ Resuming queue processing after pause');
          resolve(processNextFromQueue());
        }, CONFIG.checkResourcesInterval));
      }
      
      const route = queue.shift();
      pending.add(route);
      
      const promise = (async () => {
        try {
          const result = await prerenderRoute(route);
          
          // Update results
          if (result.success) {
            results.success++;
            results.completedRoutes.push(route);
          } else if (result.fallbackCreated) {
            results.fallback++;
            results.completedRoutes.push(route);
          } else {
            results.failure++;
            results.failedRoutes.push(route);
          }
          
          results.completed++;
          logProgress();
          
        } catch (error) {
          console.error(`💥 Unexpected error processing ${route}:`, error.message);
          results.failure++;
          results.failedRoutes.push(route);
          results.completed++;
          logProgress();
        } finally {
          // Cleanup and start next item
          pending.delete(route);
          activeTasks.delete(route);
          
          // Immediately try to start next task
          processNextFromQueue();
        }
      })();
      
      // Store the promise
      activeTasks.set(route, promise);
      return promise;
    };
    
    // Start initial batch of tasks
    console.log(`🔄 Starting initial batch of ${Math.min(CONFIG.maxConcurrent, queue.length)} tasks...`);
    const initialPromises = [];
    for (let i = 0; i < Math.min(CONFIG.maxConcurrent, queue.length); i++) {
      initialPromises.push(processNextFromQueue());
    }
    
    // Log initial state
    logProgress(true);
    
    // Wait for all tasks to complete by checking at regular intervals
    const waitForAllTasks = async () => {
      let previousQueueLength = queue.length;
      let previousPendingSize = pending.size;
      let stuckCounter = 0;
      
      while (pending.size > 0 || queue.length > 0) {
        // Check if we're making progress
        if (previousQueueLength === queue.length && previousPendingSize === pending.size) {
          stuckCounter++;
          if (stuckCounter >= 3) {
            console.log(`⚠️ Processing appears stalled (${pending.size} pending, ${queue.length} queued). Checking for issues...`);
            
            if (pending.size > 0) {
              console.log('🔄 Current pending routes:');
              [...pending].forEach(route => console.log(`  - ${route}`));
            }
            
            // If truly stuck for too long, try restarting one task
            if (stuckCounter >= 5 && pending.size > 0) {
              console.log('🔄 Attempting to restart a stalled task...');
              const stuckRoute = [...pending][0];
              
              // Log but don't actually restart for now - this could be implemented
              // with browser timeouts instead if needed
              console.log(`⚠️ Task for route ${stuckRoute} may be stuck`);
              
              stuckCounter = 0; // Reset counter after attempting recovery
            }
          }
        } else {
          stuckCounter = 0; // Reset counter if we're making progress
        }
        
        previousQueueLength = queue.length;
        previousPendingSize = pending.size;
        
        // Update if queue is nearly empty
        if (queue.length < CONFIG.maxConcurrent && pending.size < CONFIG.maxConcurrent) {
          logProgress(true);
        }
        
        // Wait for some tasks to complete or timeout
        await Promise.race([
          ...activeTasks.values().map(p => p.catch(() => {})), // Catch to prevent unhandled rejections
          new Promise(resolve => setTimeout(resolve, 5000)) // Check every 5 seconds
        ]);
      }
    };
    
    await waitForAllTasks();
    
    // Ensure all promises are settled
    if (activeTasks.size > 0) {
      console.log(`⏳ Waiting for final ${activeTasks.size} tasks to complete...`);
      await Promise.allSettled([...activeTasks.values()]);
    }
    
    // Fix the root index.html last
    fixRootIndexFile(CONFIG.distPath);
    
    // Calculate total time
    const totalTimeSeconds = Math.round((Date.now() - results.startTime) / 1000);
    const minutes = Math.floor(totalTimeSeconds / 60);
    const seconds = totalTimeSeconds % 60;
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    
    console.log(`\n✅ Successfully processed all ${routes.length} routes with dynamic parallel execution!`);
    console.log(`📈 Results: ${results.success} successful, ${results.fallback} fallbacks created, ${results.failure} failed`);
    console.log(`⏱️ Total time: ${timeDisplay} (avg ${(totalTimeSeconds / routes.length).toFixed(2)}s per route)`);
    
    // Log any failed routes
    if (results.failedRoutes.length > 0) {
      console.log(`\n⚠️ Failed routes (${results.failedRoutes.length}):`);
      results.failedRoutes.forEach(route => console.log(`  - ${route}`));
    }
    
    } catch (error) {
    console.error('\n💥 Parallel pre-rendering failed:', error.message);
    
    if (results && results.failedRoutes && results.failedRoutes.length > 0) {
      console.log(`\n⚠️ Failed routes (${results.failedRoutes.length}):`);
      results.failedRoutes.forEach(route => console.log(`  - ${route}`));
    }
    
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Advanced Static Site Generation (SSG) for Debugi...\n');
  const startTime = Date.now();
  let server = null;
  
  try {
    // Ensure the app is built
    ensureAppIsBuilt();
    
    // Extract routes
    console.log('📋 Extracting routes from Angular configuration...');
    const routes = extractRoutes();
    console.log(`✅ Found ${routes.length} routes to pre-render\n`);
    
    // Check if running in Vercel environment
    if (isVercelEnvironment()) {
      console.log('⚡ Detected Vercel environment - using serverless approach');
      
      try {
        // Try to use chrome-aws-lambda
        console.log('🌐 Initializing serverless browser...');
        const browser = await initializeServerlessBrowser();
        console.log('✅ Serverless browser initialized successfully');
        
        // TODO: Use the browser for pre-rendering in Vercel
        await browser.close();
        console.log('✅ Serverless browser closed successfully');
      } catch (serverlessError) {
        console.log('💡 Serverless browser failed, falling back to static generation');
        console.error('  Error details:', serverlessError.message);
        
        // Use the no-browser fallback
        await createStaticRoutesWithoutRendering(routes, CONFIG.distPath);
        
        const totalTimeSeconds = Math.round((Date.now() - startTime) / 1000);
        const minutes = Math.floor(totalTimeSeconds / 60);
        const seconds = totalTimeSeconds % 60;
        const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        
        console.log(`\n🎉 Static Site Generation completed in ${timeDisplay}!`);
        console.log('📁 All routes have been set up for static hosting.');
        return; // Exit early since we're done
      }
    }
    
    // Regular environment approach (local machine or CI with full capabilities)
    
    // Start dev server
    console.log('🚀 Starting Angular dev server...');
    server = await startDevServer();
    
    // Wait a bit more for full startup
    console.log('⏳ Waiting for server to fully initialize...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Pre-render all routes in parallel
    await prerenderAllRoutes(routes);
    
    const totalTimeSeconds = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTimeSeconds / 60);
    const seconds = totalTimeSeconds % 60;
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    
    console.log(`\n🎉 Advanced Static Site Generation completed in ${timeDisplay}!`);
    console.log('📁 All routes have been pre-rendered to static HTML files in parallel.');
    console.log('🚀 Your site is now ready for static hosting with improved SEO and performance!');
    
  } catch (error) {
    console.error('\n💥 Advanced Static Site Generation failed:', error.message);
    console.log('\n🔄 Falling back to basic static route structure...');
    
    // Fallback to basic static generation
    try {
      const routes = extractRoutes();
      await createStaticRoutesWithoutRendering(routes, CONFIG.distPath);
      
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
