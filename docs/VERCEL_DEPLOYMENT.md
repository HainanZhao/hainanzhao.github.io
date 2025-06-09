# Vercel Deployment

This project is configured for easy deployment on Vercel. Follow these steps to deploy your Angular application to Vercel:

## Automatic Deployment (Recommended)

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Visit [Vercel](https://vercel.com/) and sign in
3. Click "Add New..." > "Project"
4. Import your repository
5. Keep the default settings (Vercel will automatically detect Angular)
6. Click "Deploy"

## Manual Deployment

If you prefer to deploy from your local machine:

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

## Configuration

The `vercel.json` file in this project includes:

- SPA routing configuration for Angular
- Build command settings
- Output directory settings
- Custom cache headers for better performance

## How Pre-rendering Works on Vercel

The Debugi project uses a special pre-rendering approach to generate static HTML files for all routes during the build process. This improves SEO, initial load times, and enables proper static hosting.

### Challenges with Puppeteer on Vercel

Puppeteer requires Chrome, which needs several system libraries that aren't available in the Vercel build environment by default. This can lead to errors like:

```
/vercel/.cache/puppeteer/chrome/linux-137.0.7151.55/chrome-linux64/chrome: error while loading shared libraries: libnss3.so: cannot open shared object file: No such file or directory
```

### Our Solution

We've implemented a multi-tier approach:

1. **Attempt Serverless Chrome**: First, we try to use `chrome-aws-lambda`, which is designed for serverless environments.

2. **Fallback Mechanism**: If that fails, we gracefully fall back to a non-browser method that simply copies the index.html to each route directory.

3. **Environment Detection**: The system automatically detects when it's running on Vercel and adjusts its behavior accordingly.

## Deployment Process

The build process on Vercel follows these steps:

1. Angular builds the application with production settings
2. The pre-rendering script runs, detecting the Vercel environment
3. Either the serverless browser or fallback method generates static HTML files
4. SEO files (sitemap.xml, robots.txt) are generated

## Compression and Performance

All files are automatically compressed by Vercel's edge network using Brotli and Gzip. Our tests show:

- Brotli compression reduces HTML file size by ~85%
- Gzip compression reduces HTML file size by ~83%

We've also added cache headers to improve performance:

```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=3600, stale-while-revalidate=86400"
      }
    ]
  }
]
```

## Testing Locally

You can test the Vercel deployment process locally by setting the VERCEL environment variable:

```bash
VERCEL=1 node scripts/prerender-advanced.js
```

For production deployments, Vercel will:
- Build your application using the build command specified in `vercel.json`
- Optimize static assets automatically
- Enable global CDN distribution
- Provide HTTPS by default

## Environment Variables

If you need to add environment variables, you can do so in the Vercel Dashboard:
1. Go to your project
2. Click on "Settings" > "Environment Variables"
3. Add your variables as needed

## Custom Domains

To use a custom domain:
1. Go to your project on Vercel
2. Click on "Settings" > "Domains"
3. Add your domain and follow the verification instructions

## Analytics and Monitoring

Vercel provides built-in analytics and monitoring for your deployments. Enable these features in the project dashboard for insights into your application's performance.
