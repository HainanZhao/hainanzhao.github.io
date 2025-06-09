# GitHub Pages Deployment Guide

This guide explains how to deploy the Debugi project to GitHub Pages using our lightweight build process that avoids timeouts.

## Why Use a Lightweight Build for GitHub Pages?

While our standard build process improves SEO and initial load times, it causes issues with GitHub Pages:

1. The pre-rendering and complex SEO generation are resource-intensive and can time out during GitHub Actions builds
2. GitHub Pages has limited build minutes and resources compared to dedicated hosting
3. For a developer tools application like Debugi, reliability is more important than SEO optimization

## Deployment Process Improvements

We've created a lightweight build process that:

1. **Skips Pre-rendering**: Removes the browser-based pre-rendering step entirely
2. **Simplifies SEO Generation**: Creates basic SEO files without complex processing
3. **Ensures SPA Routing**: Maintains proper client-side routing through custom 404.html handling

### Automatic Deployment with GitHub Actions

The GitHub Actions workflow uses our lightweight build process:

```yaml
- name: Build Angular application
  run: |
    # Use our lightweight GitHub Pages build script
    npm run build:gh-pages:lightweight
```

### Manual Deployment

To manually deploy to GitHub Pages:

```bash
# Run the lightweight GitHub Pages build script
npm run build:gh-pages:lightweight

# Push the dist folder to the gh-pages branch
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

## How the Lightweight Build Works

The `scripts/github-pages-build.js` script:

1. Builds the Angular app without pre-rendering
2. Creates simplified SEO files directly (not using the complex generator)
3. Sets up the SPA routing with 404.html redirection
4. Completes in a fraction of the time of the full build

## How Routing Works

For GitHub Pages, we use a special approach for client-side routing:

1. A custom 404.html page that redirects to the main application
2. A script in index.html that handles the redirected URL parameters
3. This approach allows Angular routing to work correctly without server configuration

## Testing Locally

To test the GitHub Pages build locally:

```bash
# Run the lightweight GitHub Pages build script
npm run build:gh-pages:lightweight

# Serve the dist folder
npx http-server dist
```

Then navigate to http://localhost:8080 to test the application.

## Troubleshooting

If you encounter issues with the GitHub Pages deployment:

1. **Build Timeouts**: If timeouts still occur, check the GitHub Actions logs for specific errors
2. **Routing Issues**: Make sure the 404.html file is properly generated
3. **Missing Pages**: Check that routes are correctly configured in Angular
