#!/usr/bin/env node

/**
 * Advanced Static Site Generation (SSG) for Debugi
 * Pre-renders Angular routes to static HTML using Puppeteer
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const CONFIG = {
  distPath: path.join(__dirname, '../dist'),
  indexPath: path.join(__dirname, '../dist/index.html'),
  routesPath: path.join(__dirname, '../src/app/app.routes.ts'),
  baseUrl: 'http://localhost:4200',
  timeout: 15000,
};

/**
 * Extract routes from Angular routes file
 */
function extractRoutes() {
  try {
    const routesContent = fs.readFileSync(CONFIG.routesPath, 'utf8');
    
    // Extract route paths using regex - more specific pattern
    const routeMatches = routesContent.match(/path:\s*['"]([^'"]+)['"]/g);
    
    if (!routeMatches) {
      console.warn('No routes found in app.routes.ts');
      return ['/'];
    }
    
    const routes = routeMatches
      .map(match => {
        const pathMatch = match.match(/path:\s*['"]([^'"]+)['"]/);
        return pathMatch ? pathMatch[1] : null;
      })
      .filter(route => route && route !== '' && !route.includes('**') && !route.includes(':'))
      .map(route => `/${route}`);
    
    // Add home route
    if (!routes.includes('/')) {
      routes.unshift('/');
    }
    
    console.log(`✓ Found ${routes.length} routes to pre-render:`);
    routes.forEach(route => console.log(`  - ${route}`));
    
    return [...new Set(routes)]; // Remove duplicates
    
  } catch (error) {
    console.error('Error reading routes file:', error.message);
    return ['/'];
  }
}

/**
 * Check if the Angular app is built
 */
function ensureAppIsBuilt() {
  if (!fs.existsSync(CONFIG.indexPath)) {
    console.log('📦 Angular app not built. Please run "npm run build" first.');
    process.exit(1);
  }
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
 * Fix asset references in HTML to use correct hashed filenames
 */
function fixAssetReferences(html) {
  // Find actual asset files in dist directory
  const distFiles = fs.readdirSync(CONFIG.distPath);
  
  // Find the actual hashed CSS file
  const actualCssFile = distFiles.find(file => file.startsWith('styles-') && file.endsWith('.css'));
  const actualJsFile = distFiles.find(file => file.startsWith('main-') && file.endsWith('.js'));
  const actualPolyfillsFile = distFiles.find(file => file.startsWith('polyfills-') && file.endsWith('.js'));
  
  let fixedHtml = html;
  
  // Fix CSS reference
  if (actualCssFile) {
    fixedHtml = fixedHtml.replace(
      /href="styles\.css"/g, 
      `href="${actualCssFile}"`
    );
  }
  
  // Fix main JS reference
  if (actualJsFile) {
    fixedHtml = fixedHtml.replace(
      /src="main\.js"/g, 
      `src="${actualJsFile}"`
    );
  }
  
  // Fix polyfills JS reference
  if (actualPolyfillsFile) {
    fixedHtml = fixedHtml.replace(
      /src="polyfills\.js"/g, 
      `src="${actualPolyfillsFile}"`
    );
  }
  
  // Remove development-only script tags (Vite client)
  fixedHtml = fixedHtml.replace(
    /<script type="module" src="\/@vite\/client"><\/script>/g, 
    ''
  );
  
  // Ensure theme class is applied to prevent flash
  // Apply dark theme class to both html and body elements
  
  // Fix HTML element - remove any existing theme-dark classes first, then add once
  fixedHtml = fixedHtml.replace(/class="[^"]*theme-dark[^"]*"/gi, '');
  fixedHtml = fixedHtml.replace(
    /<html([^>]*?)>/gi,
    (match, attributes) => {
      // Remove any existing class attribute and add our theme class
      let cleanAttributes = attributes.replace(/\s*class="[^"]*"/gi, '');
      return `<html${cleanAttributes} class="theme-dark">`;
    }
  );
  
  // Fix BODY element - remove any existing theme-dark classes first, then add once
  fixedHtml = fixedHtml.replace(
    /<body([^>]*?)>/gi,
    (match, attributes) => {
      // Remove any existing class attribute and add our theme class
      let cleanAttributes = attributes.replace(/\s*class="[^"]*"/gi, '');
      return `<body${cleanAttributes} class="theme-dark">`;
    }
  );
  
  return fixedHtml;
}

/**
 * Pre-render a single route
 */
async function prerenderRoute(route) {
  const puppeteer = require('puppeteer');
  
  try {
    console.log(`🔄 Pre-rendering: ${route}`);
    
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to the route
    const url = `${CONFIG.baseUrl}${route === '/' ? '' : route}`;
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout 
    });
    
    // Wait for Angular to render
    await page.waitForSelector('app-root', { timeout: 5000 });
    
    // Wait a bit more for dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get the rendered HTML
    const html = await page.content();
    
    await browser.close();
    
    // Fix asset references to use correct hashed filenames
    const fixedHtml = fixAssetReferences(html);
    
    // Create directory structure if needed
    const routePath = route === '/' ? '' : route.substring(1);
    const outputDir = routePath ? path.join(CONFIG.distPath, routePath) : CONFIG.distPath;
    
    if (routePath) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the HTML file
    const outputFile = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputFile, fixedHtml, 'utf8');
    
    console.log(`✓ Pre-rendered: ${route} -> ${outputFile}`);
    
  } catch (error) {
    console.error(`✗ Failed to pre-render ${route}:`, error.message);
    
    // Fallback: create basic static route
    const routePath = route === '/' ? '' : route.substring(1);
    if (routePath) {
      const outputDir = path.join(CONFIG.distPath, routePath);
      fs.mkdirSync(outputDir, { recursive: true });
      
      const fallbackContent = fs.readFileSync(CONFIG.indexPath, 'utf8');
      const fixedFallbackContent = fixAssetReferences(fallbackContent);
      const outputFile = path.join(outputDir, 'index.html');
      fs.writeFileSync(outputFile, fixedFallbackContent, 'utf8');
      
      console.log(`📄 Created fallback route: ${route} -> ${outputFile}`);
    }
  }
}

/**
 * Pre-render all routes
 */
async function prerenderAllRoutes(routes) {
  console.log(`\n🚀 Starting pre-rendering of ${routes.length} routes...\n`);
  
  try {
    // Pre-render each route sequentially
    for (const route of routes) {
      await prerenderRoute(route);
    }
    
    // Also fix the root index.html file
    console.log('🔧 Fixing root index.html asset references...');
    const rootIndexPath = path.join(CONFIG.distPath, 'index.html');
    if (fs.existsSync(rootIndexPath)) {
      const rootContent = fs.readFileSync(rootIndexPath, 'utf8');
      const fixedRootContent = fixAssetReferences(rootContent);
      fs.writeFileSync(rootIndexPath, fixedRootContent, 'utf8');
      console.log('✓ Fixed root index.html');
    }
    
    console.log(`\n✅ Successfully processed all ${routes.length} routes!`);
    
  } catch (error) {
    console.error('\n✗ Pre-rendering failed:', error.message);
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
    
    // Pre-render all routes
    await prerenderAllRoutes(routes);
    
    console.log('\n🎉 Advanced Static Site Generation completed successfully!');
    console.log('📁 All routes have been pre-rendered to static HTML files.');
    console.log('🚀 Your site is now ready for static hosting with improved SEO!');
    
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
