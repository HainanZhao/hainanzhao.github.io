#!/usr/bin/env node

/**
 * SEO Files Generator for Debugi
 * Generates both sitemap.xml and robots.txt dynamically
 */

const sitemapGenerator = require('./generate-sitemap');
const robotsGenerator = require('./generate-robots');

/**
 * Main function to generate all SEO files
 */
function main() {
  console.log('🔧 Starting SEO files generation...');
  console.log('=====================================');
  
  try {
    // Generate sitemap.xml
    sitemapGenerator.main();
    console.log('');
    
    // Generate robots.txt
    robotsGenerator.main();
    console.log('');
    
    console.log('🎉 All SEO files generated successfully!');
    console.log('📋 Generated files:');
    console.log('   • sitemap.xml');
    console.log('   • robots.txt');
    
  } catch (error) {
    console.error('❌ Error generating SEO files:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
