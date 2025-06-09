#!/usr/bin/env node

/**
 * JavaScript-only prerendering solution
 * No browser dependencies - pure Node.js approach
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract routes from Angular routes file
 */
function extractRoutesFromAppRoutes() {
  const routesPath = path.join(__dirname, '../src/app/app.routes.ts');
  
  if (!fs.existsSync(routesPath)) {
    console.warn('⚠️ app.routes.ts not found, using fallback routes');
    return [''];
  }
  
  const routesContent = fs.readFileSync(routesPath, 'utf8');
  const routes = [''];  // Always include home route
  
  // Extract path definitions using regex, excluding redirectTo paths
  const pathMatches = routesContent.match(/{\s*path:\s*['"`]([^'"`]+)['"`][^}]*}/g);
  if (pathMatches) {
    pathMatches.forEach(match => {
      // Skip redirect routes
      if (match.includes('redirectTo')) {
        return;
      }
      
      const pathMatch = match.match(/path:\s*['"`]([^'"`]+)['"`]/);
      if (pathMatch && pathMatch[1] && pathMatch[1] !== '') {
        routes.push(pathMatch[1]);
      }
    });
  }
  
  return routes;
}

/**
 * Extract metadata from search service
 */
function extractMetadataFromSearchService() {
  const searchServicePath = path.join(__dirname, '../src/app/shared/services/search.service.ts');
  
  if (!fs.existsSync(searchServicePath)) {
    console.warn('⚠️ search.service.ts not found, using fallback metadata');
    return getDefaultMetadata();
  }
  
  const searchContent = fs.readFileSync(searchServicePath, 'utf8');
  const metadata = {};
  
  // Add default home page metadata
  metadata[''] = {
    title: 'Debugi - Developer Utilities',
    description: 'Comprehensive developer tools and utilities for debugging, testing, and development workflows.',
    keywords: 'developer tools, utilities, debugging, testing, web development'
  };
  
  // Extract searchable items to build route metadata
  // Match complete objects between { and }
  const objectPattern = /{\s*id:\s*['"`][^'"`]+['"`][^}]*}/gs;
  const itemMatches = searchContent.match(objectPattern);
  
  if (itemMatches) {
    itemMatches.forEach(itemMatch => {
      try {
        // Extract route, title, description, and keywords from each item
        const routeMatch = itemMatch.match(/route:\s*['"`]\/([^'"`]*?)['"`]/);
        const titleMatch = itemMatch.match(/title:\s*['"`]([^'"`]+?)['"`]/);
        const descriptionMatch = itemMatch.match(/description:\s*['"`]((?:[^'"`\\]|\\.)*?)['"`]/);
        const keywordsMatch = itemMatch.match(/keywords:\s*\[([\s\S]*?)\]/);
        
        if (routeMatch && titleMatch && descriptionMatch) {
          const route = routeMatch[1];
          const title = titleMatch[1];
          const description = descriptionMatch[1];
          
          // Extract keywords array
          let keywords = '';
          if (keywordsMatch) {
            const keywordString = keywordsMatch[1];
            const keywordMatches = keywordString.match(/['"`]([^'"`]+?)['"`]/g);
            if (keywordMatches) {
              keywords = keywordMatches.map(k => k.replace(/['"`]/g, '')).join(', ');
            }
          }
          
          // Only update if we don't already have metadata for this route or if this is a more comprehensive entry
          if (!metadata[route] || title.includes('Utils') || title.includes('Generator') || title.includes('Converter')) {
            metadata[route] = {
              title: `${title} - Debugi`,
              description: description.replace(/\\'/g, "'").replace(/\\"/g, '"'), // Unescape quotes
              keywords: keywords || title.toLowerCase().split(' ').join(', ')
            };
          }
        }
      } catch (error) {
        // Skip malformed items
        console.warn(`⚠️ Skipping malformed search item: ${error.message}`);
      }
    });
  }
  
  return metadata;
}

/**
 * Fallback metadata in case files are not accessible
 */
function getDefaultMetadata() {
  return {
    '': {
      title: 'Debugi - Developer Utilities',
      description: 'Comprehensive developer tools and utilities for debugging, testing, and development workflows.',
      keywords: 'developer tools, utilities, debugging, testing, web development'
    },
    'about': {
      title: 'About - Debugi',
      description: 'Learn about Debugi and its comprehensive suite of developer utilities.',
      keywords: 'about, developer tools, debugi'
    },
    'calculator': {
      title: 'Calculator - Debugi',
      description: 'Advanced calculator with programmer features including binary, hex, and decimal conversions.',
      keywords: 'calculator, binary, hex, decimal, programmer calculator'
    }
  };
}

// Dynamic route and metadata extraction
const ROUTES = extractRoutesFromAppRoutes();
const COMPONENT_METADATA = extractMetadataFromSearchService();

async function prerenderRoutes() {
  console.log('🔄 Starting JavaScript-only prerendering...');
  
  const distPath = path.join(__dirname, '../dist');
  const indexPath = path.join(distPath, 'index.html');
  
  // Check if the build exists
  if (!fs.existsSync(indexPath)) {
    throw new Error('Built Angular app not found. Run build first.');
  }
  
  // Read the base index.html
  const baseHtml = fs.readFileSync(indexPath, 'utf8');
  console.log('✅ Base HTML template loaded');
  
  let generatedFiles = 0;
  
  // Generate prerendered files for each route
  for (const route of ROUTES) {
    try {
      const routePath = route === '' ? 'index' : route;
      const metadata = COMPONENT_METADATA[route] || COMPONENT_METADATA[''];
      
      // Generate enhanced HTML with metadata
      const enhancedHtml = generateEnhancedHtml(baseHtml, metadata, route);
      
      // Create directory structure if needed
      if (route !== '') {
        const routeDir = path.join(distPath, route);
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        fs.writeFileSync(path.join(routeDir, 'index.html'), enhancedHtml);
      } else {
        // Update the main index.html
        fs.writeFileSync(indexPath, enhancedHtml);
      }
      
      generatedFiles++;
      console.log(`✅ Generated: /${route}`);
    } catch (error) {
      console.warn(`⚠️ Failed to generate route /${route}:`, error.message);
    }
  }
  
  console.log(`🎉 JavaScript-only prerendering completed! Generated ${generatedFiles} files`);
  return generatedFiles;
}

function generateEnhancedHtml(baseHtml, metadata, route) {
  let html = baseHtml;
  
  // Update title
  html = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${metadata.title}</title>`
  );
  
  // Add or update meta description
  const descriptionMeta = `<meta name="description" content="${metadata.description}">`;
  if (html.includes('name="description"')) {
    html = html.replace(
      /<meta name="description"[^>]*>/i,
      descriptionMeta
    );
  } else {
    html = html.replace(
      '</head>',
      `  ${descriptionMeta}\n</head>`
    );
  }
  
  // Add keywords meta tag
  const keywordsMeta = `<meta name="keywords" content="${metadata.keywords}">`;
  if (!html.includes('name="keywords"')) {
    html = html.replace(
      '</head>',
      `  ${keywordsMeta}\n</head>`
    );
  }
  
  // Add Open Graph tags
  const ogTags = [
    `<meta property="og:title" content="${metadata.title}">`,
    `<meta property="og:description" content="${metadata.description}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="https://debugi.com/${route}">`,
    `<meta property="og:site_name" content="Debugi">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${metadata.title}">`,
    `<meta name="twitter:description" content="${metadata.description}">`
  ].join('\n  ');
  
  html = html.replace(
    '</head>',
    `  ${ogTags}\n</head>`
  );
  
  // Add canonical URL
  const canonical = `<link rel="canonical" href="https://debugi.com/${route}">`;
  html = html.replace(
    '</head>',
    `  ${canonical}\n</head>`
  );
  
  // Add structured data for the home page
  if (route === '') {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Debugi",
      "description": metadata.description,
      "url": "https://debugi.com",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };
    
    const structuredDataScript = `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`;
    html = html.replace(
      '</head>',
      `  ${structuredDataScript}\n</head>`
    );
  }
  
  // Add route-specific preloading hints
  if (route !== '') {
    const preloadHint = `<link rel="prefetch" href="/${route}">`;
    html = html.replace(
      '</head>',
      `  ${preloadHint}\n</head>`
    );
  }
  
  return html;
}

// Run if called directly
if (require.main === module) {
  prerenderRoutes()
    .then((count) => {
      console.log(`✅ Prerendering completed successfully! Generated ${count} files`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Prerendering failed:', error.message);
      process.exit(1);
    });
}

module.exports = { prerenderRoutes, generateEnhancedHtml, ROUTES, COMPONENT_METADATA };