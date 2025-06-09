#!/usr/bin/env node

/**
 * GitHub Pages Deployment Script
 * Simplified deployment process without pre-rendering for GitHub Pages
 * 
 * This script bypasses the resource-intensive SEO generation to prevent build timeouts
 * on GitHub Actions runners with limited resources.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting GitHub Pages build process (lightweight version)...');
  
  try {
    // Run just the Angular build without SEO generation
    console.log('📦 Building Angular app for production (skipping SEO generation)...');
    execSync('npm run lint && ng build --configuration production', { stdio: 'inherit' });
    
    // Generate basic SEO files manually instead of using the full generator
    console.log('📄 Creating minimal SEO files...');
    createBasicSeoFiles();
    
    // Create a basic _redirects file for GitHub Pages
    createRedirectsFile();
    
    console.log('✅ GitHub Pages build completed successfully!');
    console.log('📁 The build is ready for GitHub Pages without pre-rendering or complex SEO generation.');
  } catch (error) {
    console.error('❌ GitHub Pages build failed:', error.message);
    process.exit(1);
  }
}

/**
 * Create basic sitemap.xml and robots.txt files
 * This is a simplified version to avoid the resource-intensive full SEO generation
 */
function createBasicSeoFiles() {
  const distPath = path.join(__dirname, '../dist');
  
  // Ensure the dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist directory not found. Build may have failed.');
    return;
  }
  
  // Create a basic sitemap.xml
  const sitemapPath = path.join(distPath, 'sitemap.xml');
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://debugi.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://debugi.com/calculator</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://debugi.com/string-utils</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://debugi.com/qr-code</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://debugi.com/json-visualizer</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://debugi.com/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
  
  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log('✓ Created basic sitemap.xml');
  
  // Create a basic robots.txt
  const robotsPath = path.join(distPath, 'robots.txt');
  const robotsContent = `# robots.txt for Debugi.com
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://debugi.com/sitemap.xml`;
  
  fs.writeFileSync(robotsPath, robotsContent);
  console.log('✓ Created basic robots.txt');
}

/**
 * Create a _redirects file for GitHub Pages
 * This helps with SPA routing on GitHub Pages
 */
function createRedirectsFile() {
  const distPath = path.join(__dirname, '../dist');
  const redirectsPath = path.join(distPath, '_redirects');
  
  console.log('📝 Creating _redirects file for GitHub Pages...');
  
  // Ensure the dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist directory not found. Build may have failed.');
    return;
  }
  
  // Create a 404.html file that redirects to index.html
  const notFoundPath = path.join(distPath, '404.html');
  const notFoundContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // Single Page Apps for GitHub Pages
    // MIT License
    // https://github.com/rafgraph/spa-github-pages
    (function() {
      // This script takes the current URL and converts the path and query
      // string into just a query string, and then redirects the browser
      // to the new URL with only a query string and hash fragment
      var pathSegmentsToKeep = 0;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    })();
  </script>
</head>
<body>
  <p>Redirecting to the homepage...</p>
</body>
</html>
  `;
  
  fs.writeFileSync(notFoundPath, notFoundContent);
  console.log('✓ Created 404.html for GitHub Pages routing');
  
  // Update index.html to handle the redirect
  const indexPath = path.join(distPath, 'index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Add the redirect script to handle GitHub Pages routing
  if (!indexContent.includes('Single Page Apps for GitHub Pages')) {
    const scriptToAdd = `
  <!-- Start Single Page Apps for GitHub Pages -->
  <script type="text/javascript">
    // Single Page Apps for GitHub Pages
    // MIT License
    // https://github.com/rafgraph/spa-github-pages
    (function(l) {
      if (l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location))
  </script>
  <!-- End Single Page Apps for GitHub Pages -->`;
    
    indexContent = indexContent.replace('</head>', scriptToAdd + '\n</head>');
    fs.writeFileSync(indexPath, indexContent);
    console.log('✓ Updated index.html with GitHub Pages routing script');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
