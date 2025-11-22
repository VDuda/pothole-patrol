# 🚀 Pothole Patrol - Complete Setup Guide

This guide will help you get Pothole Patrol running locally for development and demo purposes.

## Prerequisites

- **Bun** v1.1+ installed ([Install Bun](https://bun.sh))
- **Node.js** v18+ (for compatibility)
- Modern web browser (Chrome/Edge recommended for WASM support)
- Mobile device or World App Simulator for testing World ID

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/pothole-patrol.git
cd pothole-patrol

# Install dependencies with Bun
bun install
```

## Step 2: Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy from template
cp ENV_SETUP.md .env.local
```

Then edit `.env.local` with your API keys:

```env
NEXT_PUBLIC_WLD_APP_ID=app_staging_xxxxx
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91ciIsImEiOiJjbHh4eHh4In0.xxxxx
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=xxxxx.xxxxx-xxxxx-xxxxx
```

### Getting API Keys

#### World ID (Required for verification)
1. Go to [World Developer Portal](https://developer.worldcoin.org/)
2. Create new app
3. Set action: `report-pothole`
4. Copy App ID

#### Mapbox (Required for map display)
1. Go to [Mapbox](https://account.mapbox.com/)
2. Sign up/Login
3. Copy default public token

#### Lighthouse (Required for Filecoin uploads)
1. Go to [Lighthouse Storage](https://lighthouse.storage/)
2. Create account
3. Generate API key from dashboard

## Step 3: Add AI Model

Download or train a YOLOv8n ONNX model for pothole detection:

```bash
# Quick start: Use demo model (general object detection)
cd public/models
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx -O pothole.onnx
cd ../..
```

For production, train a custom pothole detection model (see `public/models/README.md`).

## Step 4: Run Development Server

```bash
# Start the dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Set Up Ngrok (For Mobile Testing)

To test the Mini App on your phone with World App, you need HTTPS. Use ngrok to expose your local server:

```bash
# Install ngrok
brew install ngrok/ngrok/ngrok

# In a NEW terminal window (keep bun dev running)
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`) and:
1. Update your World App settings at [developer.worldcoin.org](https://developer.worldcoin.org/)
2. Set App URL to your ngrok URL
3. Set Redirect URI to `https://abc123.ngrok-free.app/dashcam`

**📖 See [NGROK_SETUP.md](./NGROK_SETUP.md) for detailed instructions.**

## Step 6: Test the Application

### Testing the Dashcam (Desktop Browser)
1. Navigate to `/dashcam`
2. Allow camera permissions
3. Point camera at road/pothole images
4. Click "Start Detection"
5. When pothole detected, click "Report Pothole"

### Testing World ID (World App on Mobile)
1. Install [World App](https://worldcoin.org/download) on mobile
2. Scan QR code with your ngrok URL
3. Open the Mini App in World App
4. Complete verification flow
5. Submit report

### Testing the Portal (Desktop)
1. Navigate to `/portal`
2. View incoming reports on the map
3. Click "Publish to Filecoin" on verified reports
4. Export Knowledge Graph as JSON-LD

## Project Structure

```
pothole-patrol/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashcam/page.tsx      # Mobile dashcam
│   │   ├── portal/page.tsx       # Admin portal
│   │   └── api/reports/route.ts  # API endpoints
│   ├── components/
│   │   ├── Dashcam.tsx           # AI detection component
│   │   ├── Map.tsx               # Mapbox integration
│   │   └── ReportCard.tsx        # Report display
│   ├── lib/
│   │   ├── ai-model.ts           # YOLO inference
│   │   ├── worldid.ts            # World ID integration
│   │   └── filecoin.ts           # Lighthouse SDK
│   └── types/
│       └── report.ts             # TypeScript types
├── public/
│   └── models/
│       └── pothole.onnx          # AI model (add manually)
└── package.json
```

## Troubleshooting

### Camera not working
- Ensure HTTPS or localhost (camera requires secure context)
- Check browser permissions
- Try different browser (Chrome recommended)

### WASM/ONNX errors
- Check browser console for specific errors
- Ensure model file exists at `/public/models/pothole.onnx`
- Try clearing browser cache

### World ID not working
- Ensure you're using World App or Simulator
- Check App ID is correct in `.env.local`
- Verify action name matches: `report-pothole`

### Map not loading
- Verify Mapbox token in `.env.local`
- Check browser console for API errors
- Ensure token has proper permissions

### Filecoin upload failing
- Verify Lighthouse API key
- Check network connection
- Ensure file size is reasonable (<10MB)

## Development Tips

### Hot Reload
The dev server supports hot reload. Changes to components will reflect immediately.

### API Testing
Test the API directly:
```bash
# Get all reports
curl http://localhost:3000/api/reports

# Submit a test report
curl -X POST http://localhost:3000/api/reports \
  -F 'report={"id":"test-1","timestamp":1234567890,...}' \
  -F 'image=@test.jpg'
```

### Database
Currently uses in-memory storage. For production, replace with:
- PostgreSQL + Prisma
- MongoDB
- Supabase

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel
```

### Environment Variables
Add all `.env.local` variables to your deployment platform.

## Next Steps

1. **Train Custom Model**: Use real pothole images for better accuracy
2. **Add Database**: Replace in-memory storage with persistent DB
3. **Enhance UI**: Add more visualizations and analytics
4. **Mobile Optimization**: Improve mobile UX
5. **World ID Integration**: Test with real World App

## Support

- **Documentation**: See README.md
- **Issues**: Open GitHub issue
- **Hackathon**: Ask mentors at ETHGlobal Buenos Aires

---

Built with ❤️ for ETHGlobal Buenos Aires 2025
