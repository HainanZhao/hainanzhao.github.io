# GitHub Pages Deployment

This project is configured for deployment on GitHub Pages with proper SPA routing support.

## Files Created for GitHub Pages Support

1. **`public/404.html`** - Custom 404 page that redirects to index.html while preserving the route
2. **`public/.nojekyll`** - Prevents Jekyll processing on GitHub Pages
3. **Updated `src/index.html`** - Added redirect handler script and correct base href
4. **New build script in `package.json`** - `npm run build:gh-pages`

## How It Works

1. When a user visits a direct route like `/debugi/calculator`, GitHub Pages serves the 404.html file
2. The 404.html script redirects to `/debugi/?/calculator`
3. The index.html script detects the `?/` parameter and restores the proper route
4. Angular router takes over and renders the correct component

## Deployment

1. Build the project for GitHub Pages:
   ```bash
   npm run build:gh-pages
   ```

2. Deploy the contents of `dist/browser/` to your GitHub Pages repository

3. The app will work correctly with direct URL access and page reloads

## Base Href

The app is configured with `base href="/debugi/"` for deployment to `https://username.github.io/debugi/`

If deploying to a different path, update:
- The base href in `src/index.html` and `public/404.html`
- The paths in the redirect scripts
- The build command in `package.json`
