#!/usr/bin/env node

/**
 * JavaScript-only prerendering solution
 * No browser dependencies - pure Node.js approach
 */

const fs = require('fs');
const path = require('path');

// Route definitions for the application
const ROUTES = [
  '',
  'about',
  'calculator',
  'json-visualizer',
  'regex-tester',
  'string-utils',
  'string-case-converter',
  'date-utils',
  'number-utils',
  'array-utils',
  'jwt-parser',
  'diff-viewer',
  'qr-code',
  'csv-to-sheets-formatter',
  'json-query',
  'iframe-performance',
  'utils-demo'
];

// Component metadata for SEO generation
const COMPONENT_METADATA = {
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
  },
  'json-visualizer': {
    title: 'JSON Visualizer - Debugi',
    description: 'Visualize and format JSON data with syntax highlighting and tree view.',
    keywords: 'json, visualizer, formatter, syntax highlighting'
  },
  'regex-tester': {
    title: 'Regex Tester - Debugi',
    description: 'Test and debug regular expressions with real-time matching and explanation.',
    keywords: 'regex, regular expressions, pattern matching, testing'
  },
  'string-utils': {
    title: 'String Utilities - Debugi',
    description: 'Comprehensive string manipulation tools for developers.',
    keywords: 'string utilities, text manipulation, encoding, decoding'
  },
  'string-case-converter': {
    title: 'Case Converter - Debugi',
    description: 'Convert text between different cases: camelCase, snake_case, kebab-case, and more.',
    keywords: 'case converter, camelCase, snake_case, kebab-case, text transformation'
  },
  'date-utils': {
    title: 'Date Utilities - Debugi',
    description: 'Date and time manipulation tools with timezone support and formatting options.',
    keywords: 'date utilities, time, timezone, formatting, timestamp'
  },
  'number-utils': {
    title: 'Number Utilities - Debugi',
    description: 'Number base conversion, formatting, and mathematical utilities.',
    keywords: 'number utilities, base conversion, formatting, mathematics'
  },
  'array-utils': {
    title: 'Array Utilities - Debugi',
    description: 'Array manipulation tools for sorting, filtering, and data processing.',
    keywords: 'array utilities, data processing, sorting, filtering'
  },
  'jwt-parser': {
    title: 'JWT Parser - Debugi',
    description: 'Decode and analyze JSON Web Tokens with header and payload inspection.',
    keywords: 'jwt, json web token, parser, decoder, authentication'
  },
  'diff-viewer': {
    title: 'Diff Viewer - Debugi',
    description: 'Compare text and code with side-by-side diff visualization.',
    keywords: 'diff viewer, text comparison, code comparison, version control'
  },
  'qr-code': {
    title: 'QR Code Generator - Debugi',
    description: 'Generate and decode QR codes with customization options.',
    keywords: 'qr code, generator, decoder, barcode'
  },
  'csv-to-sheets-formatter': {
    title: 'CSV to Sheets Formatter - Debugi',
    description: 'Format CSV data for Google Sheets with proper escaping and formatting.',
    keywords: 'csv, google sheets, formatter, data import'
  },
  'json-query': {
    title: 'JSON Query - Debugi',
    description: 'Query JSON data using JSONPath expressions and filters.',
    keywords: 'json query, jsonpath, data extraction, filtering'
  },
  'iframe-performance': {
    title: 'Iframe Performance - Debugi',
    description: 'Test and analyze iframe performance and loading behavior.',
    keywords: 'iframe, performance, testing, web development'
  },
  'utils-demo': {
    title: 'Utils Demo - Debugi',
    description: 'Interactive demonstration of all available developer utilities.',
    keywords: 'demo, utilities, developer tools, showcase'
  }
};

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