#!/usr/bin/env node

/**
 * Dynamic Robots.txt Generator for Debugi
 * Generates robots.txt with sitemap reference
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://debugi.com',
  outputPath: path.join(__dirname, '../dist/robots.txt'),
  allowAllBots: true,
  crawlDelay: null // Set to a number if you want to add crawl delay
};

/**
 * Generates robots.txt content
 */
function generateRobotsContent() {
  const content = [];
  
  // User-agent directive
  content.push('User-agent: *');
  
  // Allow or disallow all
  if (CONFIG.allowAllBots) {
    content.push('Allow: /');
  } else {
    content.push('Disallow: /');
  }
  
  // Add crawl delay if specified
  if (CONFIG.crawlDelay) {
    content.push(`Crawl-delay: ${CONFIG.crawlDelay}`);
  }
  
  // Add blank line before sitemap
  content.push('');
  
  // Sitemap reference
  content.push(`Sitemap: ${CONFIG.baseUrl}/sitemap.xml`);
  
  return content.join('\n') + '\n';
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
 * Writes robots.txt to file
 */
function writeRobots(robotsContent) {
  try {
    ensureOutputDirectory();
    fs.writeFileSync(CONFIG.outputPath, robotsContent, 'utf8');
    console.log(`✓ Robots.txt generated successfully: ${CONFIG.outputPath}`);
  } catch (error) {
    console.error('✗ Error writing robots.txt:', error.message);
    process.exit(1);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🤖 Starting robots.txt generation...');
  console.log(`📍 Base URL: ${CONFIG.baseUrl}`);
  
  // Generate robots.txt content
  const robotsContent = generateRobotsContent();
  
  // Write to file
  writeRobots(robotsContent);
  
  console.log('✅ Robots.txt generation completed successfully!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, generateRobotsContent };
