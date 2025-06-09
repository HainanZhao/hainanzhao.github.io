# Advanced Pre-rendering System

This document explains the advanced pre-rendering system used for static site generation (SSG) in the Debugi project.

## Overview

The pre-rendering system converts Angular routes into static HTML files for improved SEO, performance, and compatibility with static hosting services like Vercel.

## Features

- **Dynamic Queue System**: Efficiently pre-renders routes in parallel with intelligent scheduling
- **Resource-Aware Processing**: Monitors CPU and memory to avoid overloading the system
- **Fallback Generation**: Creates fallback routes if pre-rendering fails
- **Detailed Progress Reporting**: Provides comprehensive status updates during rendering
- **Error Handling**: Robust error handling with detailed reporting
- **Environment-Specific Behavior**: Adapts to local or serverless environments (e.g., Vercel)
- **Configurable**: Can be customized via environment variables

## Usage

### Basic Usage

```bash
# Build the Angular app first
npm run build

# Run the pre-renderer
node scripts/prerender-advanced.js
```

### Environment Variables

You can customize the pre-rendering process by setting environment variables. Create a `.env.prerender` file based on the provided template:

```
# Maximum number of concurrent rendering processes
MAX_CONCURRENT=5

# Maximum CPU percentage before pausing new renders (0-100)
MAX_CPU_PERCENT=85

# Disable resource checking completely (1 to disable, 0 to enable)
DISABLE_RESOURCE_CHECK=0

# Enable verbose logging (1 to enable, 0 to disable)
VERBOSE=0

# Rendering timeout in milliseconds
RENDER_TIMEOUT=15000

# Wait for network idle timeout in milliseconds
NETWORK_IDLE_TIMEOUT=5000

# Wait time after page load in milliseconds
POST_LOAD_WAIT=3000
```

Then load these environment variables before running the script:

```bash
# Linux/Mac
export $(cat .env.prerender | xargs) && node scripts/prerender-advanced.js

# Windows (PowerShell)
foreach($line in Get-Content .env.prerender) { if ($line -and !$line.StartsWith("#")) { $var = $line.Split('=', 2); [Environment]::SetEnvironmentVariable($var[0], $var[1]) } }; node scripts/prerender-advanced.js
```

## How It Works

1. **Route Extraction**: Analyzes Angular routes configuration to identify all valid routes
2. **Dev Server**: Starts an Angular dev server for dynamic content
3. **Dynamic Queue**: Processes routes in parallel up to a configurable limit
4. **Resource Monitoring**: Pauses queue processing if system load gets too high
5. **Result Tracking**: Keeps detailed statistics on successful, failed, and fallback routes

## Technical Details

### The Dynamic Queue System

Unlike a simple batch-based parallel system, the dynamic queue immediately starts a new task whenever a previous one completes, maintaining optimal concurrency while adapting to system resources:

```javascript
// When a task completes:
1. Update statistics
2. Remove from active tasks
3. Check system resources
4. If resources available, immediately start next task from queue
```

This approach maximizes throughput by ensuring the system is always working at optimal capacity without overloading.

### Resource-Aware Processing

The system periodically checks CPU and memory usage:

```javascript
function shouldPauseRendering() {
  // Get CPU load averages
  const cpus = os.cpus().length;
  const loadAvg = os.loadavg()[0]; // 1 minute average
  
  // Calculate percentage of CPU capacity being used 
  const cpuPercentage = (loadAvg / cpus) * 100;
  
  return cpuPercentage > CONFIG.maxCpuPercent;
}
```

If resources are constrained, the system will temporarily pause adding new tasks to the queue while allowing existing tasks to complete.

## Vercel Deployment

When running in a Vercel environment, the system adapts by:

1. Detecting the Vercel environment
2. Attempting to use chrome-aws-lambda for serverless browsing
3. Falling back to static generation without rendering if needed

## Troubleshooting

If pre-rendering fails for specific routes:

1. Check the console output for specific route failures
2. Increase timeouts for complex pages
3. Try reducing the MAX_CONCURRENT value
4. Check for JavaScript errors in the Angular application

## Performance Tuning

- **High-end systems**: Increase MAX_CONCURRENT to 8-10 and MAX_CPU_PERCENT to 90
- **Low-resource environments**: Reduce MAX_CONCURRENT to 2-3 and MAX_CPU_PERCENT to 70
- **Vercel deployments**: Keep MAX_CONCURRENT at 5 or lower to avoid resource constraints
