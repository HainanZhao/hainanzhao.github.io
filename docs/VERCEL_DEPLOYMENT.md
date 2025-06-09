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

Additionally, there are strict version requirements between `chrome-aws-lambda` and `puppeteer-core`:

```
npm ERR! While resolving: chrome-aws-lambda@10.1.0
npm ERR! Found: puppeteer-core@24.10.0
npm ERR! Could not resolve dependency: peer puppeteer-core@"^10.1.0" from chrome-aws-lambda@10.1.0
```

### Our Multi-Tier Solution

We've implemented a robust approach to handle these challenges:

1. **Dependency Management**: We use package overrides to ensure `chrome-aws-lambda` gets the correct version of `puppeteer-core`.

2. **Automated Detection**: Our vercel-build script automatically detects compatibility issues.

3. **Serverless Chrome**: We try to use `chrome-aws-lambda`, which is designed for serverless environments.

4. **Graceful Fallback**: If the serverless approach fails, we fall back to a non-browser method that simply copies the index.html to each route directory.

5. **Environment Detection**: The system automatically detects when it's running on Vercel and adjusts its behavior accordingly.

## Deployment Process

The build process on Vercel follows these steps:

1. Our custom `vercel-build.js` script runs first, which:
   - Checks for dependency compatibility issues
   - Sets up the environment correctly
   - Handles any potential errors gracefully

2. Angular builds the application with production settings

3. The pre-rendering script runs, detecting the Vercel environment
   - It tries to use the serverless browser approach first
   - Falls back to static generation if needed

4. SEO files (sitemap.xml, robots.txt) are generated

## Vercel-Specific Configuration

The custom build script in `scripts/vercel-build.js` automates dependency version checks and provides a reliable build process.

### Install Script

In your `vercel.json`:

```json
"installCommand": "npm install --no-optional --no-shrinkwrap --no-package-lock",
```

### Build Command

In your `vercel.json`:

```json
"buildCommand": "npm run build:vercel",
```

This points to our custom script which handles all the complexity of browser dependencies.

## Testing Vercel Deployment Locally

You can test the Vercel deployment process locally:

```bash
# Test the full Vercel build process
node scripts/vercel-build.js

# Test only the fallback mode
npm run build:vercel:fallback

# Test with only environment variable
VERCEL=1 npm run prerender:advanced
```
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
