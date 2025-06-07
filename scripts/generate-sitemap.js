#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator for Debugi
 * Generates sitemap.xml based on Angular routes configuration
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://debugi.com',
  outputPath: path.join(__dirname, '../dist/sitemap.xml'),
  lastmod: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
  changefreq: 'monthly'
};

// Route configuration with priorities and metadata
const ROUTE_CONFIG = {
  '/': {
    priority: '1.0',
    changefreq: 'monthly',
    title: 'Home - Developer Tools & Utilities'
  },
  '/calculator': {
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Calculator - Math Expressions & Functions'
  },
  '/string-utils': {
    priority: '0.9',
    changefreq: 'monthly',
    title: 'String Utilities - Transform & Manipulate Text'
  },
  '/qr-code': {
    priority: '0.8',
    changefreq: 'monthly',
    title: 'QR Code Generator - Create QR Codes'
  },
  '/csv-formatter': {
    priority: '0.8',
    changefreq: 'monthly',
    title: 'CSV Formatter - Data Processing Tool'
  },
  '/date-utils': {
    priority: '0.8',
    changefreq: 'monthly',
    title: 'Date Utilities - Time & Date Tools'
  },
  '/number-utils': {
    priority: '0.7',
    changefreq: 'monthly',
    title: 'Number Utilities - Numeric Operations'
  },
  '/array-utils': {
    priority: '0.7',
    changefreq: 'monthly',
    title: 'Array Utilities - Data Structure Tools'
  },
  '/json-visualizer': {
    priority: '0.8',
    changefreq: 'monthly',
    title: 'JSON Visualizer - Format & Validate JSON'
  },
  '/regex-tester': {
    priority: '0.7',
    changefreq: 'monthly',
    title: 'Regex Tester - Regular Expression Tool'
  },
  '/iframe-performance': {
    priority: '0.6',
    changefreq: 'monthly',
    title: 'Iframe Performance - Web Performance Testing'
  },
  '/json-query': {
    priority: '0.7',
    changefreq: 'monthly',
    title: 'JSON Query - SQL for JSON Data'
  }
};

/**
 * Reads Angular routes from app.routes.ts and extracts route paths
 */
function extractRoutesFromFile() {
  try {
    const routesFilePath = path.join(__dirname, '../src/app/app.routes.ts');
    const routesContent = fs.readFileSync(routesFilePath, 'utf8');
    
    // Extract routes using regex
    const routeMatches = routesContent.match(/path:\s*['"`]([^'"`]+)['"`]/g);
    
    if (!routeMatches) {
      console.warn('No routes found in app.routes.ts, using default configuration');
      return Object.keys(ROUTE_CONFIG);
    }
    
    const extractedRoutes = routeMatches
      .map(match => {
        const pathMatch = match.match(/['"`]([^'"`]+)['"`]/);
        return pathMatch ? pathMatch[1] : null;
      })
      .filter(route => route && route !== '' && !route.includes('**'))
      .map(route => route === '' ? '/' : `/${route}`);
    
    // Add home route if not present
    if (!extractedRoutes.includes('/')) {
      extractedRoutes.unshift('/');
    }
    
    console.log(`✓ Extracted ${extractedRoutes.length} routes from app.routes.ts`);
    return extractedRoutes;
    
  } catch (error) {
    console.error('Error reading routes file:', error.message);
    console.log('Using fallback route configuration');
    return Object.keys(ROUTE_CONFIG);
  }
}

/**
 * Generates XML sitemap content
 */
function generateSitemapXML(routes) {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  const xmlFooter = '</urlset>\n';

  const urlEntries = routes.map(route => {
    const config = ROUTE_CONFIG[route] || {
      priority: '0.5',
      changefreq: 'monthly',
      title: `${route.replace('/', '').replace('-', ' ')} Tool`
    };

    const url = route === '/' ? CONFIG.baseUrl : `${CONFIG.baseUrl}${route}`;
    
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${CONFIG.lastmod}</lastmod>
    <changefreq>${config.changefreq}</changefreq>
    <priority>${config.priority}</priority>
  </url>`;
  }).join('\n\n');

  return xmlHeader + '\n' + urlEntries + '\n\n' + xmlFooter;
}

/**
 * Ensures the output directory exists
 */
function ensureOutputDirectory() {
  const outputDir = path.dirname(CONFIG.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✓ Created output directory: ${outputDir}`);
  }
}

/**
 * Writes sitemap to file
 */
function writeSitemap(sitemapContent) {
  try {
    ensureOutputDirectory();
    fs.writeFileSync(CONFIG.outputPath, sitemapContent, 'utf8');
    console.log(`✓ Sitemap generated successfully: ${CONFIG.outputPath}`);
    console.log(`✓ Generated ${sitemapContent.match(/<url>/g)?.length || 0} URL entries`);
  } catch (error) {
    console.error('✗ Error writing sitemap:', error.message);
    process.exit(1);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Starting dynamic sitemap generation...');
  console.log(`📍 Base URL: ${CONFIG.baseUrl}`);
  console.log(`📅 Last Modified: ${CONFIG.lastmod}`);
  
  // Extract routes from Angular configuration
  const routes = extractRoutesFromFile();
  
  // Generate sitemap XML
  const sitemapContent = generateSitemapXML(routes);
  
  // Write to file
  writeSitemap(sitemapContent);
  
  console.log('✅ Dynamic sitemap generation completed successfully!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, generateSitemapXML, extractRoutesFromFile };
