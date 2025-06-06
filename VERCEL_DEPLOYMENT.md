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

## Production Deployments

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
