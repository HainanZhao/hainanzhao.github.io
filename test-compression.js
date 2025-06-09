/**
 * Test script to validate compression and optimize file sizes
 * This script analyzes the size of pre-rendered files and tests various compression methods
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

// Configuration
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Helper functions
function formatSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function logCompressionInfo(title, original, compressed) {
  const ratio = ((1 - compressed / original) * 100).toFixed(2);
  console.log(`${title}: ${formatSize(original)} → ${formatSize(compressed)} (${ratio}% reduction)`);
}

// Get all HTML files in the dist directory recursively
function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file === 'index.html') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Analyze file size and compression
async function analyzeCompression() {
  console.log('🔍 Analyzing file compression for pre-rendered HTML files...\n');
  
  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ dist directory not found. Please run a build first.');
    process.exit(1);
  }
  
  // Get all HTML files
  const htmlFiles = getAllHtmlFiles(distPath);
  console.log(`Found ${htmlFiles.length} HTML files to analyze.`);
  
  // Calculate total size
  const sizesInfo = {
    original: 0,
    gzip: 0,
    brotli: 0
  };
  
  // Analyze each file
  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const originalSize = Buffer.byteLength(content, 'utf8');
    sizesInfo.original += originalSize;
    
    // Test gzip compression
    const gzipped = zlib.gzipSync(content);
    const gzipSize = gzipped.length;
    sizesInfo.gzip += gzipSize;
    
    // Test brotli compression
    const brotli = zlib.brotliCompressSync(content);
    const brotliSize = brotli.length;
    sizesInfo.brotli += brotliSize;
    
    // Log individual file info for larger files
    if (originalSize > 100 * 1024) { // Only log files larger than 100KB
      console.log(`\nFile: ${path.relative(distPath, file)}`);
      logCompressionInfo('Original', originalSize, originalSize);
      logCompressionInfo('Gzip', originalSize, gzipSize);
      logCompressionInfo('Brotli', originalSize, brotliSize);
    }
  }
  
  // Log summary
  console.log('\n📊 Summary for all HTML files:');
  console.log(`Total files: ${htmlFiles.length}`);
  console.log(`Total original size: ${formatSize(sizesInfo.original)}`);
  logCompressionInfo('Total with Gzip', sizesInfo.original, sizesInfo.gzip);
  logCompressionInfo('Total with Brotli', sizesInfo.original, sizesInfo.brotli);
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('1. Configure your server to use Brotli compression when available, with Gzip as fallback');
  console.log('2. Consider adding cache headers for static HTML files (Cache-Control: public, max-age=3600)');
  console.log('3. For Vercel deployments, compression is handled automatically');
}

// Run the analysis
analyzeCompression().catch(err => {
  console.error('Error during compression analysis:', err);
  process.exit(1);
});
