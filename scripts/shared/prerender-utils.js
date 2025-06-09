#!/usr/bin/env node

/**
 * Shared utilities for Static Site Generation (SSG)
 * Common functions used by both basic and advanced prerender scripts
 */

const fs = require('fs');
const path = require('path');

// Default configuration shared across all prerender scripts
const DEFAULT_CONFIG = {
  distPath: path.join(__dirname, '../../dist'),
  indexPath: path.join(__dirname, '../../dist/index.html'),
  routesPath: path.join(__dirname, '../../src/app/app.routes.ts'),
  baseUrl: 'http://localhost:4200',
  timeout: 15000,
};

// Puppeteer browser configuration
const BROWSER_CONFIG = {
  headless: 'new',
  args: [
    '--no-sandbox', 
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-web-security'
  ]
};

// Page configuration for consistent rendering
const PAGE_CONFIG = {
  viewport: { width: 1200, height: 800 },
  waitOptions: {
    waitUntil: 'networkidle2',
    timeout: 15000
  }
};

/**
 * Extract routes from Angular routes file
 */
function extractRoutes(routesPath = DEFAULT_CONFIG.routesPath) {
  try {
    const routesContent = fs.readFileSync(routesPath, 'utf8');
    
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
function ensureAppIsBuilt(indexPath = DEFAULT_CONFIG.indexPath) {
  if (!fs.existsSync(indexPath)) {
    console.log('📦 Angular app not built. Please run "npm run build" first.');
    process.exit(1);
  }
}

/**
 * Fix asset references in HTML to use correct hashed filenames
 */
function fixAssetReferences(html, distPath = DEFAULT_CONFIG.distPath) {
  // Find actual asset files in dist directory
  const distFiles = fs.readdirSync(distPath);
  
  // Find the actual hashed files
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
  
  // Apply theme classes to prevent flash
  fixedHtml = applyThemeClasses(fixedHtml);
  
  return fixedHtml;
}

/**
 * Apply theme classes to HTML and body elements to prevent flash
 */
function applyThemeClasses(html) {
  let fixedHtml = html;
  
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
 * Create output directory structure for a route
 */
function createRouteDirectory(route, distPath = DEFAULT_CONFIG.distPath) {
  const routePath = route === '/' ? '' : route.substring(1);
  const outputDir = routePath ? path.join(distPath, routePath) : distPath;
  
  if (routePath) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  return { routePath, outputDir };
}

/**
 * Write pre-rendered HTML to file
 */
function writeRouteFile(route, html, distPath = DEFAULT_CONFIG.distPath) {
  const { outputDir } = createRouteDirectory(route, distPath);
  const outputFile = path.join(outputDir, 'index.html');
  const fixedHtml = fixAssetReferences(html, distPath);
  
  fs.writeFileSync(outputFile, fixedHtml, 'utf8');
  console.log(`✓ Pre-rendered: ${route} -> ${outputFile}`);
  
  return outputFile;
}

/**
 * Create fallback route when pre-rendering fails
 */
function createFallbackRoute(route, indexPath = DEFAULT_CONFIG.indexPath, distPath = DEFAULT_CONFIG.distPath) {
  const routePath = route === '/' ? '' : route.substring(1);
  
  if (routePath) {
    const outputDir = path.join(distPath, routePath);
    fs.mkdirSync(outputDir, { recursive: true });
    
    const fallbackContent = fs.readFileSync(indexPath, 'utf8');
    const fixedFallbackContent = fixAssetReferences(fallbackContent, distPath);
    const outputFile = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputFile, fixedFallbackContent, 'utf8');
    
    console.log(`📄 Created fallback route: ${route} -> ${outputFile}`);
    return outputFile;
  }
  
  return null;
}

/**
 * Fix root index.html file
 */
function fixRootIndexFile(distPath = DEFAULT_CONFIG.distPath) {
  console.log('🔧 Fixing root index.html asset references...');
  const rootIndexPath = path.join(distPath, 'index.html');
  
  if (fs.existsSync(rootIndexPath)) {
    const rootContent = fs.readFileSync(rootIndexPath, 'utf8');
    const fixedRootContent = fixAssetReferences(rootContent, distPath);
    fs.writeFileSync(rootIndexPath, fixedRootContent, 'utf8');
    console.log('✓ Fixed root index.html');
    return true;
  }
  
  return false;
}

/**
 * Initialize Puppeteer browser with consistent configuration
 */
async function initializeBrowser() {
  const puppeteer = require('puppeteer');
  return await puppeteer.launch(BROWSER_CONFIG);
}

/**
 * Setup page with consistent configuration
 */
async function setupPage(browser) {
  const page = await browser.newPage();
  await page.setViewport(PAGE_CONFIG.viewport);
  return page;
}

/**
 * Navigate to route and wait for rendering
 */
async function navigateAndWait(page, url, timeout = DEFAULT_CONFIG.timeout) {
  await page.goto(url, { 
    waitUntil: PAGE_CONFIG.waitOptions.waitUntil,
    timeout: timeout
  });
  
  // Wait for Angular to render
  await page.waitForSelector('app-root', { timeout: 5000 });
  
  // Wait a bit more for dynamic content
  await new Promise(resolve => setTimeout(resolve, 3000));
}

/**
 * Create basic static routes (fallback method)
 */
function createBasicStaticRoutes(routes, indexPath = DEFAULT_CONFIG.indexPath, distPath = DEFAULT_CONFIG.distPath) {
  console.log('\n📁 Creating basic static route directories...\n');
  
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const fixedIndexContent = fixAssetReferences(indexContent, distPath);
  
  // Fix the root index.html first
  fs.writeFileSync(indexPath, fixedIndexContent, 'utf8');
  console.log('✓ Fixed root index.html asset references');
  
  for (const route of routes) {
    if (route === '/') continue; // Skip root
    
    const routePath = route.substring(1); // Remove leading slash
    const outputDir = path.join(distPath, routePath);
    
    // Create directory
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Copy fixed index.html
    const outputFile = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputFile, fixedIndexContent, 'utf8');
    
    console.log(`✓ Created static route: ${route} -> ${outputFile}`);
  }
}

/**
 * Install required dependencies if missing
 */
function ensureDependencies(requiredDeps = ['puppeteer']) {
  const packagePath = path.join(__dirname, '../../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
  );
  
  if (missingDeps.length > 0) {
    console.log(`📦 Installing required dependencies: ${missingDeps.join(', ')}`);
    const { execSync } = require('child_process');
    
    try {
      execSync(`npm install --save-dev ${missingDeps.join(' ')}`, { 
        stdio: 'inherit', 
        cwd: path.join(__dirname, '../..') 
      });
    } catch (error) {
      console.error('✗ Failed to install dependencies:', error.message);
      process.exit(1);
    }
  }
}

module.exports = {
  DEFAULT_CONFIG,
  BROWSER_CONFIG,
  PAGE_CONFIG,
  extractRoutes,
  ensureAppIsBuilt,
  fixAssetReferences,
  applyThemeClasses,
  createRouteDirectory,
  writeRouteFile,
  createFallbackRoute,
  fixRootIndexFile,
  initializeBrowser,
  setupPage,
  navigateAndWait,
  createBasicStaticRoutes,
  ensureDependencies
};