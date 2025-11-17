# Building for S3 Production with Development Features

This guide explains how to build the application for S3 production deployment while allowing developers to use development features.

## Overview

The application uses a custom `isDevMode()` function that checks multiple sources to determine if development mode should be enabled:

1. **Build-time**: `NODE_ENV === 'development'`
2. **Runtime environment variable**: `NEXT_PUBLIC_ENABLE_DEV_MODE=true`
3. **URL parameter**: `?dev=true`
4. **LocalStorage**: `dev_mode=true` (persistent)

## Build Options

### Option 1: Production Build with Dev Mode Enabled (Recommended for Developers)

Build for production but enable dev features via environment variable:

```bash
npm run build:prod-dev
```

This builds with:
- `NODE_ENV=production` (optimized production build)
- `NEXT_PUBLIC_ENABLE_DEV_MODE=true` (enables dev features)

**Result**: Production-optimized build that bypasses authentication and date restrictions.

### Option 2: Standard Production Build

Standard production build (requires authentication):

```bash
npm run build
```

**Result**: Production build with all security features enabled.

### Option 3: Development Build

Development build (not for production):

```bash
npm run build:dev
```

**Result**: Development build with all dev features enabled.

## Enabling Dev Mode at Runtime

Even with a production build, developers can enable dev mode at runtime:

### Method 1: URL Parameter

Add `?dev=true` to the URL:
```
https://your-s3-bucket.s3.amazonaws.com/index.html?dev=true
```

### Method 2: LocalStorage (Persistent)

Open browser console and run:
```javascript
localStorage.setItem('dev_mode', 'true');
location.reload();
```

To disable:
```javascript
localStorage.removeItem('dev_mode');
location.reload();
```

### Method 3: Environment Variable at Build Time

Set `NEXT_PUBLIC_ENABLE_DEV_MODE=true` when building:
```bash
NEXT_PUBLIC_ENABLE_DEV_MODE=true npm run build
```

## What Dev Mode Enables

When dev mode is enabled, the following features are available:

1. **Authentication Bypass**: No need for `timestamp`, `user_id`, and `sign` headers
2. **Date Restriction Bypass**: Content accessible after December 31, 2025
3. **Development Features**: 
   - `devMaxSlide` configuration works
   - `devPauseOnSlide` configuration works
   - Console logging for native bridge functions
4. **Native Bridge Fallbacks**: Console logging instead of errors

## Deployment to S3

### Step 1: Build for Production with Dev Mode

```bash
npm run build:prod-dev
```

This creates an optimized production build in the `out/` directory.

### Step 2: Upload to S3

```bash
# Using AWS CLI
aws s3 sync out/ s3://your-bucket-name/ --delete

# Or using a deployment script
./deploy-to-s3.sh
```

### Step 3: Access with Dev Mode

Developers can access the deployed version with dev mode enabled:

**Option A**: Via URL parameter
```
https://your-bucket.s3.amazonaws.com/index.html?dev=true
```

**Option B**: Enable via console (persistent)
1. Open the deployed site
2. Open browser console
3. Run: `localStorage.setItem('dev_mode', 'true'); location.reload();`

## Production Deployment (Without Dev Mode)

For actual production deployment (end users), use the standard build:

```bash
npm run build
aws s3 sync out/ s3://your-production-bucket/ --delete
```

This build will:
- Require authentication headers
- Enforce date restrictions
- Not allow dev mode via URL parameter (unless explicitly enabled)

## Environment Variables

### Build-Time Variables

- `NODE_ENV`: Set to `production` for optimized builds
- `NEXT_PUBLIC_ENABLE_DEV_MODE`: Set to `true` to enable dev mode in production build

### Runtime Variables

- URL parameter: `?dev=true`
- LocalStorage: `dev_mode=true`

## Security Considerations

⚠️ **Important**: 

- Dev mode should **NOT** be enabled in production for end users
- The `build:prod-dev` script is intended for developer testing only
- For production, use the standard `build` command
- Consider adding IP whitelisting or other access controls for dev-enabled builds

## Troubleshooting

### Dev Mode Not Working

1. **Check URL parameter**: Ensure `?dev=true` is in the URL
2. **Check localStorage**: Verify `dev_mode` is set to `'true'` (string)
3. **Check build**: Ensure `NEXT_PUBLIC_ENABLE_DEV_MODE=true` was set during build
4. **Clear cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Authentication Still Required

If authentication is still required after enabling dev mode:

1. Check that `isDevMode()` returns `true` in browser console
2. Verify the auth check is using `isDevMode()` instead of `NODE_ENV`
3. Clear browser cache and reload

### Date Restriction Still Active

Same troubleshooting as authentication - ensure dev mode is properly enabled.

## Example Deployment Script

Create a `deploy-dev.sh` script:

```bash
#!/bin/bash

# Build for production with dev mode enabled
echo "Building for production with dev mode..."
npm run build:prod-dev

# Upload to S3
echo "Uploading to S3..."
aws s3 sync out/ s3://your-dev-bucket/ --delete

echo "Deployment complete!"
echo "Access at: https://your-dev-bucket.s3.amazonaws.com/index.html?dev=true"
```

Make it executable:
```bash
chmod +x deploy-dev.sh
```

Run it:
```bash
./deploy-dev.sh
```

