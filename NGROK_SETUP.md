# 🌐 Ngrok Setup Guide

## Why Ngrok?

World App Mini Apps require HTTPS to function properly. When developing locally, you need to expose your local server to the internet with HTTPS. Ngrok provides this by creating a secure tunnel to your localhost.

**Use Cases:**
- Testing World ID verification on mobile
- Testing camera access (requires HTTPS)
- Testing the full Mini App experience
- Debugging on actual devices

---

## Quick Start

### 1. Install Ngrok

**macOS (Homebrew):**
```bash
brew install ngrok/ngrok/ngrok
```

**Linux (Snap):**
```bash
snap install ngrok
```

**Windows (Chocolatey):**
```bash
choco install ngrok
```

**Or download directly:**
Visit [ngrok.com/download](https://ngrok.com/download)

### 2. Sign Up & Get Auth Token

1. Create free account at [ngrok.com](https://ngrok.com)
2. Go to [dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Copy your authtoken

### 3. Configure Ngrok

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 4. Start Your Development Server

```bash
bun dev
```

Your app will run on `http://localhost:3000`

### 5. Start Ngrok Tunnel

In a **new terminal window**:

```bash
ngrok http 3000
```

You'll see output like:

```
ngrok                                                                    

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### 6. Use the HTTPS URL

Copy the `https://` URL (e.g., `https://abc123.ngrok-free.app`)

This is your public URL that World App can access!

---

## Testing with World App

### 1. Update World App Configuration

Go to [developer.worldcoin.org](https://developer.worldcoin.org/) and update your app settings:

**App URL:**
```
https://abc123.ngrok-free.app
```

**Redirect URI:**
```
https://abc123.ngrok-free.app/dashcam
```

### 2. Generate QR Code

Visit your ngrok URL in a browser:
```
https://abc123.ngrok-free.app
```

Or use the World App QR code generator with your App ID.

### 3. Scan with World App

1. Open World App on your phone
2. Scan the QR code
3. Your Mini App will open in World App
4. Test all features!

---

## Development Workflow

### Terminal Setup

**Terminal 1 - Development Server:**
```bash
cd /home/vovk/hackathons/pothole-patrol
bun dev
```

**Terminal 2 - Ngrok Tunnel:**
```bash
ngrok http 3000
```

**Terminal 3 - Git/Commands:**
```bash
# Available for other commands
```

### Hot Reload

- Changes to your code will hot-reload automatically
- Ngrok tunnel stays active
- No need to restart ngrok when you make code changes
- Just refresh the page in World App

---

## Ngrok Web Interface

Ngrok provides a web interface at `http://127.0.0.1:4040`

**Features:**
- View all HTTP requests
- Inspect request/response headers
- Replay requests
- Debug API calls
- Monitor traffic

**Access it:**
```bash
open http://127.0.0.1:4040
```

---

## Environment Variables

When using ngrok, update your `.env.local`:

```bash
# Your ngrok URL (update when ngrok restarts)
NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app

# World ID
NEXT_PUBLIC_WLD_APP_ID=app_xxxxxxxxxx
APP_ID=app_xxxxxxxxxx

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxx

# Lighthouse (Filecoin)
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## Common Issues & Solutions

### Issue: Ngrok URL Changes on Restart

**Problem:** Free ngrok URLs are random and change each time you restart ngrok.

**Solutions:**

1. **Use a static domain (Paid Plan):**
   ```bash
   ngrok http 3000 --domain=your-static-domain.ngrok-free.app
   ```

2. **Update World App settings each time:**
   - Copy new ngrok URL
   - Update in Developer Portal
   - Generate new QR code

3. **Use ngrok config file:**
   ```yaml
   # ~/.ngrok2/ngrok.yml
   tunnels:
     pothole-patrol:
       proto: http
       addr: 3000
   ```
   
   Then run:
   ```bash
   ngrok start pothole-patrol
   ```

### Issue: "ERR_NGROK_108" or "ERR_NGROK_3200"

**Problem:** Authtoken not configured or invalid.

**Solution:**
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Issue: Camera Not Working

**Problem:** Camera requires HTTPS, but ngrok URL is HTTP.

**Solution:** Always use the `https://` URL from ngrok, not the `http://` one.

### Issue: World ID Verification Fails

**Problem:** Redirect URI mismatch.

**Solution:**
1. Check Developer Portal settings
2. Ensure redirect URI matches ngrok URL exactly
3. Include `/dashcam` path if needed

### Issue: Slow Performance

**Problem:** Ngrok free tier can be slow.

**Solutions:**
- Use a region closer to you: `ngrok http 3000 --region=us`
- Upgrade to paid plan for better performance
- Use Vercel for production deployment

### Issue: "Tunnel not found"

**Problem:** Ngrok tunnel expired (free tier has 2-hour limit).

**Solution:**
- Restart ngrok
- Upgrade to paid plan for unlimited sessions

---

## Ngrok Alternatives

If you need alternatives to ngrok:

### 1. **Cloudflare Tunnel**
```bash
cloudflared tunnel --url http://localhost:3000
```

### 2. **LocalTunnel**
```bash
npx localtunnel --port 3000
```

### 3. **Serveo**
```bash
ssh -R 80:localhost:3000 serveo.net
```

### 4. **Vercel Dev**
```bash
vercel dev
```

---

## Production Deployment

**For hackathon demo, deploy to Vercel instead of using ngrok:**

```bash
# Deploy to Vercel
vercel

# Or connect GitHub repo in Vercel dashboard
```

Vercel provides:
- ✅ Permanent HTTPS URL
- ✅ Automatic deployments
- ✅ Environment variables
- ✅ Better performance
- ✅ No tunneling needed

---

## Ngrok Commands Cheat Sheet

```bash
# Start tunnel
ngrok http 3000

# Start with custom subdomain (paid)
ngrok http 3000 --subdomain=pothole-patrol

# Start with specific region
ngrok http 3000 --region=us

# Start with custom domain (paid)
ngrok http 3000 --domain=your-domain.ngrok-free.app

# View web interface
open http://127.0.0.1:4040

# Check version
ngrok version

# Update ngrok
ngrok update

# View config
ngrok config check

# View authtoken
ngrok config check | grep authtoken
```

---

## Security Considerations

### ⚠️ Important Notes

1. **Don't commit ngrok URLs** - They're temporary and change
2. **Don't share ngrok URLs publicly** - Anyone can access your local server
3. **Use environment variables** - Never hardcode URLs
4. **Stop ngrok when done** - Don't leave tunnels open unnecessarily
5. **Monitor the web interface** - Check for unexpected traffic

### Best Practices

- ✅ Use ngrok only for development/testing
- ✅ Deploy to Vercel for production
- ✅ Keep ngrok sessions short
- ✅ Use authentication if needed
- ✅ Monitor traffic in web interface

---

## Debugging Tips

### View Logs

**Ngrok logs:**
```bash
# Ngrok shows all requests in terminal
# Or view in web interface at http://127.0.0.1:4040
```

**Next.js logs:**
```bash
# Terminal 1 shows Next.js server logs
# Check for errors here
```

### Test Endpoints

**Test API endpoint:**
```bash
curl https://abc123.ngrok-free.app/api/reports
```

**Test with browser:**
```
https://abc123.ngrok-free.app
```

### Inspect Traffic

1. Open ngrok web interface: `http://127.0.0.1:4040`
2. Click on any request
3. View headers, body, response
4. Replay requests for debugging

---

## Quick Reference

### Start Development

```bash
# Terminal 1
bun dev

# Terminal 2
ngrok http 3000

# Copy the https:// URL and use it for testing
```

### Update World App

1. Copy ngrok HTTPS URL
2. Go to developer.worldcoin.org
3. Update App URL and Redirect URI
4. Save changes
5. Test in World App

### Stop Everything

```bash
# Terminal 1: Ctrl+C (stop Next.js)
# Terminal 2: Ctrl+C (stop ngrok)
```

---

## Resources

- **Ngrok Docs:** https://ngrok.com/docs
- **Ngrok Dashboard:** https://dashboard.ngrok.com
- **World ID Docs:** https://docs.world.org
- **Next.js Docs:** https://nextjs.org/docs

---

**Status:** Ready for local development with World App! 🚀
