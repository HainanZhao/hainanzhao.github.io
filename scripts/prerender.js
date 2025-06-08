#!/usr/bin/env node

/**
 * Custom Static Site Generation (SSG) for Debugi
 * Pre-renders all Angular routes to static HTML files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  distPath: path.join(__dirname, '../dist'),
  indexPath: path.join(__dirname, '../dist/index.html'),
  routesPath: path.join(__dirname, '../src/app/app.routes.ts'),
  baseUrl: 'http://localhost:4200', // Local server for pre-rendering
  timeout: 30000, // 30 seconds timeout
};

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
 * Install required dependencies
 */
function ensureDependencies() {
  const requiredDeps = ['express', 'puppeteer'];
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
  );
  
  if (missingDeps.length > 0) {
    console.log(`📦 Installing required dependencies: ${missingDeps.join(', ')}`);
    try {
      execSync(`npm install --save-dev ${missingDeps.join(' ')}`, { 
        stdio: 'inherit', 
        cwd: path.join(__dirname, '..') 
      });
    } catch (error) {
      console.error('✗ Failed to install dependencies:', error.message);
      process.exit(1);
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
    
    // Extract routes
    const routes = extractRoutes();
    
    // For now, let's just copy the main index.html to each route directory
    // This provides basic SSG structure for static hosting
    console.log('\n📁 Creating static route directories...\n');
    
    const indexContent = fs.readFileSync(CONFIG.indexPath, 'utf8');
    const fixedIndexContent = fixAssetReferences(indexContent);
    
    // Fix the root index.html first
    fs.writeFileSync(CONFIG.indexPath, fixedIndexContent, 'utf8');
    console.log('✓ Fixed root index.html asset references');
    
    for (const route of routes) {
      if (route === '/') continue; // Skip root
      
      const routePath = route.substring(1); // Remove leading slash
      const outputDir = path.join(CONFIG.distPath, routePath);
      
      // Create directory
      fs.mkdirSync(outputDir, { recursive: true });
      
      // Copy fixed index.html
      const outputFile = path.join(outputDir, 'index.html');
      fs.writeFileSync(outputFile, fixedIndexContent, 'utf8');
      
      console.log(`✓ Created static route: ${route} -> ${outputFile}`);
    }
    
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

module.exports = { main, extractRoutes, prerenderRoute };
