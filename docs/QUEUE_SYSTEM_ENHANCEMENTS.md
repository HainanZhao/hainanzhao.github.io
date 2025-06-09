# Dynamic Queue System Enhancements

## Overview of Improvements

We've significantly enhanced the parallel pre-rendering system by implementing a fully dynamic queue system with resource awareness and detailed progress tracking.

## Key Enhancements

1. **True Dynamic Queue Processing**
   - Immediate task pickup when any render job completes
   - Optimal parallel processing that maintains concurrency limits
   - No more batch-based limitations

2. **Resource-Aware Scheduling**
   - Monitors CPU usage and free memory
   - Automatically pauses queue processing when system resources are constrained
   - Resumes processing when resources become available
   - Configurable thresholds via environment variables

3. **Detailed Progress Tracking**
   - Comprehensive statistics on successful, failed, and fallback routes
   - Estimated time remaining calculations
   - Clear progress percentage and counts
   - Route-level timing information

4. **Error Handling and Recovery**
   - Robust error tracking at multiple levels
   - Automatic creation of fallback routes
   - Stall detection with potential recovery
   - Detailed error reporting with timing information

5. **Configurability**
   - Environment variable driven configuration
   - Support for limiting routes for testing
   - Verbose mode for debugging
   - Customizable timeouts and wait periods

6. **Documentation**
   - Comprehensive documentation of the system
   - Environment variable reference
   - Performance tuning guidelines
   - Troubleshooting section

## Implementation Details

The core of the dynamic queue system revolves around these key components:

1. **Queue Management**: Maintains a list of routes to be processed.
2. **Active Task Tracking**: Keeps track of currently running tasks.
3. **Resource Monitoring**: Periodically checks system resources.
4. **Task Processor**: Picks up new tasks as soon as resources allow.
5. **Reporting System**: Provides detailed progress information.

## Performance Improvements

The new system provides several performance advantages:

1. **Higher Throughput**: Faster processing by immediately starting new tasks.
2. **Resource Optimization**: Adapts to available system resources.
3. **Better Reliability**: Less likely to crash due to resource exhaustion.
4. **Improved Visibility**: Clear progress tracking helps predict completion.

## Example Usage

```bash
# Process all routes with default settings
npm run prerender:advanced

# Process with custom configuration
npm run prerender:advanced:config

# Process only specific routes for testing
ROUTES=/,/about npm run prerender:advanced

# Process with higher concurrency on powerful systems
MAX_CONCURRENT=8 npm run prerender:advanced
```
