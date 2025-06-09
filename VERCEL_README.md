# Vercel Deployment Guide

This guide explains how we've resolved the `libnss3.so` error during Vercel deployments.

## Summary of Changes

1. **Package.json Updates**:
   - Added `puppeteer-core@^10.1.0` to match chrome-aws-lambda requirements
   - Added `--legacy-peer-deps` flag to the install command in vercel.json
   - Created specialized build scripts for Vercel

2. **Custom Build Process**:
   - Created `scripts/vercel-build.js` to handle the build process
   - Added automatic dependency version detection
   - Implemented graceful fallback to static generation

3. **Fallback Mode**:
   - Added `USE_FALLBACK=1` option to skip browser-based rendering entirely
   - Created a pure static file approach that doesn't require Chrome

## How to Deploy

1. **Automatic Deployment (Recommended)**:
   Push to your GitHub repository and connect it to Vercel.

2. **Manual Deployment**:
   ```bash
   vercel
   ```

## Troubleshooting

If you encounter the `libnss3.so` error or other Chrome-related errors during deployment:

1. Make sure you're using the correct dependency versions:
   - chrome-aws-lambda@^10.1.0
   - puppeteer-core@^10.1.0 (for Vercel compatibility)

2. Try forcing fallback mode by setting an environment variable in Vercel:
   - Name: `USE_FALLBACK`
   - Value: `1`

3. Check the Vercel build logs for specific error messages

4. Refer to [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed documentation

## Testing Locally

Test the Vercel deployment process locally:

```bash
# Test full build with fallback mode
USE_FALLBACK=1 VERCEL=1 node scripts/vercel-build.js

# Test only static generation
USE_FALLBACK=1 VERCEL=1 npm run prerender:advanced
```
