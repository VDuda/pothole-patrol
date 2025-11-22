# 🚀 Deployment Guide

This guide covers deploying Pothole Patrol to production for the ETHGlobal Buenos Aires hackathon demo.

## Quick Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications and is perfect for hackathon demos.

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Pothole Patrol"

# Create a new repository on GitHub and push
git remote add origin https://github.com/yourusername/pothole-patrol.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `bun run build`
   - **Output Directory**: `.next`

### Step 3: Add Environment Variables

In the Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_WLD_APP_ID=your_world_app_id
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key
```

### Step 4: Deploy

Click "Deploy" and wait for the build to complete. Your app will be live at `https://your-project.vercel.app`

---

## Alternative: Deploy to Netlify

### Step 1: Install Netlify CLI

```bash
bun add -g netlify-cli
```

### Step 2: Build the Project

```bash
bun run build
```

### Step 3: Deploy

```bash
netlify deploy --prod
```

Follow the prompts to connect your GitHub repository and configure the deployment.

---

## Environment Variables Checklist

Before deploying, ensure you have:

- ✅ **World ID App ID**: From [developer.worldcoin.org](https://developer.worldcoin.org/)
- ✅ **Mapbox Token**: From [mapbox.com](https://account.mapbox.com/)
- ✅ **Lighthouse API Key**: From [lighthouse.storage](https://lighthouse.storage/)

---

## Post-Deployment Setup

### 1. Test the Deployment

Visit your deployed URL and test:
- ✅ Landing page loads
- ✅ Dashcam page loads (may need HTTPS for camera)
- ✅ Portal page loads with map

### 2. Configure World App

1. Go to [World Developer Portal](https://developer.worldcoin.org/)
2. Update your app settings:
   - **Redirect URI**: `https://your-project.vercel.app/dashcam`
   - **App URL**: `https://your-project.vercel.app`

### 3. Test World ID Integration

1. Open World App on your phone
2. Navigate to your Mini App
3. Test the verification flow

### 4. Add the AI Model

The YOLO model is not included in the repository. You need to:

1. Upload `pothole.onnx` to your deployment
2. Or host it on a CDN and update the model path in `src/lib/ai-model.ts`

**Quick solution for demo:**
```typescript
// In src/lib/ai-model.ts, update the model path:
export async function initializeModel(
  modelPath: string = 'https://your-cdn.com/pothole.onnx'
): Promise<void> {
  // ...
}
```

---

## Performance Optimization

### Enable Edge Runtime (Optional)

For faster API responses, enable Edge Runtime:

```typescript
// In src/app/api/reports/route.ts
export const runtime = 'edge';
```

### Enable Image Optimization

Vercel automatically optimizes images. No additional configuration needed.

### Enable Caching

Add caching headers to API routes:

```typescript
export async function GET(request: NextRequest) {
  // ...
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
```

---

## Monitoring & Analytics

### Vercel Analytics

Enable Vercel Analytics in your dashboard for:
- Page views
- Performance metrics
- User demographics

### Error Tracking

Add Sentry for error tracking:

```bash
bun add @sentry/nextjs
```

Configure in `next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Your Next.js config
});
```

---

## Troubleshooting

### Build Fails

**Issue**: TypeScript errors during build
**Solution**: Run `bun run build` locally first to catch errors

**Issue**: Missing environment variables
**Solution**: Ensure all `NEXT_PUBLIC_*` variables are set in Vercel

### Camera Not Working

**Issue**: Camera requires HTTPS
**Solution**: Vercel provides HTTPS by default. Ensure you're using the `https://` URL

### Map Not Loading

**Issue**: Mapbox token invalid
**Solution**: Verify token in Vercel environment variables

### World ID Not Working

**Issue**: Redirect URI mismatch
**Solution**: Update World App settings with your Vercel URL

---

## Demo Day Checklist

Before your demo:

- ✅ Test all features on the deployed URL
- ✅ Prepare sample pothole images for demo
- ✅ Test World ID verification flow
- ✅ Verify Filecoin uploads work
- ✅ Test JSON-LD export
- ✅ Have backup screenshots ready
- ✅ Test on mobile device
- ✅ Ensure stable internet connection

---

## Scaling for Production

If you want to scale beyond the hackathon:

### 1. Add Database

Replace in-memory storage with PostgreSQL:

```bash
bun add @prisma/client
bun add -D prisma
```

### 2. Add Authentication

Implement admin authentication:

```bash
bun add next-auth
```

### 3. Add Rate Limiting

Prevent abuse:

```bash
bun add @upstash/ratelimit
```

### 4. Add CDN

Host AI model and images on CDN:
- Cloudflare R2
- AWS S3 + CloudFront
- Vercel Blob Storage

---

## Support

For deployment issues during the hackathon:
- Check Vercel logs in the dashboard
- Review Next.js build output
- Ask ETHGlobal mentors for help

Good luck with your demo! 🚀
