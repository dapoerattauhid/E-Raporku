# Cloudflare Pages Deployment Guide

## Prerequisites
- GitHub account with E-Raporku repository
- Cloudflare account
- Supabase API credentials

## Deployment Steps

### 1. Connect Repository to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Select **Connect to Git**
4. Authorize GitHub and select repository: `dapoerattauhid/E-Raporku`
5. Click **Begin setup**

### 2. Configure Build Settings

In the build configuration page, set:

- **Framework preset**: `None` (or `Vite` if available)
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node.js version**: `22.16.0` or later

### 3. Add Environment Variables

Before deploying, add these environment variables in **Settings** → **Environment variables**:

```
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
```

Get these values from your Supabase project:
- **Project Settings** → **API**

### 4. Deploy

Click **Save and Deploy**. Cloudflare Pages will:
1. Clone your repository
2. Run `npm run build`
3. Deploy files from `dist/` folder

### 5. Verify Deployment

- Check deployment status in Cloudflare Pages dashboard
- Visit your Pages URL to test the application
- All routes will be served from `index.html` (SPA routing handled by `_redirects`)

## Project Configuration

- **Build output**: `dist/`
- **SPA Routing**: Configured in `public/_redirects`
- **Security headers**: Configured in `public/_headers`
- **Build optimization**: Configured in `vite.config.ts` with code splitting

## Environment Files

- `public/_redirects` - Routes all traffic to index.html for React Router
- `public/_headers` - Sets security headers for all responses
- `vite.config.ts` - Optimized build configuration with chunk splitting

## Notes

- The app uses React Router for navigation
- Backend API calls go to Supabase
- All static assets are cached with long TTL (1 year)
- Security headers prevent XSS, clickjacking, and other common attacks

## Troubleshooting

### Build fails with module not found
- Ensure all dependencies are in `package.json`
- Check that environment variables are properly set

### Routes not working
- Verify `_redirects` file exists in `public/` folder
- Check that React Router is properly configured

### API calls fail
- Verify Supabase environment variables are set
- Check Supabase CORS settings if needed
