# 📹 WiFi Dashcam Integration Guide

## Overview

Pothole Patrol now supports connecting to external WiFi dashcams, allowing professional drivers to use their existing dashcam hardware instead of holding their phone while driving.

---

## Features

### ✅ Dual Video Sources
- **Phone Camera** - Use your phone's front or back camera
- **WiFi Dashcam** - Connect to network-enabled dashcams

### ✅ Network Streaming Support
- **HLS Streams** (.m3u8) - HTTP Live Streaming
- **MJPEG Streams** - Motion JPEG over HTTP
- **Direct Video URLs** - MP4, WebM, etc.

### ✅ Connection Monitoring
- **Dashcam Status** - Connected/Disconnected indicator
- **Internet Status** - Online/Offline indicator
- **Auto-detection** - Checks connectivity every 10 seconds

### ✅ Seamless Switching
- Switch between phone camera and WiFi dashcam
- Maintain camera settings when switching back
- No app restart required

---

## How It Works

### User Flow

1. **Open Dashcam** → Camera auto-starts (phone camera by default)
2. **Click Camera Icon** (top-right) → Source selector opens
3. **Select "WiFi Dashcam"** → Input field appears
4. **Enter Dashcam URL** → e.g., `http://192.168.1.1:8080/video.m3u8`
5. **Click "Connect"** → Stream starts
6. **Monitor Status** → See connection badges
7. **Capture & Report** → Works same as phone camera

### UI Components

```
┌─────────────────────────────────────┐
│  Status Badges        [📷] [🔄]     │  ← Top Bar
│                                     │
│                                     │
│         📹 Video Stream             │
│                                     │
│                                     │
│  🟢 WiFi Dashcam                    │  ← Source Badge
│  🟢 Connected  🟢 Online            │  ← Connection Status
└─────────────────────────────────────┘
```

---

## Supported Dashcam Brands

### Tested Compatible Dashcams

#### 1. **BlackVue** (DR900X, DR750X)
- **Protocol:** HLS
- **URL Format:** `http://192.168.1.1:8080/blackvue_live.m3u8`
- **WiFi:** Direct WiFi or Cloud
- **Notes:** Excellent HLS support

#### 2. **Garmin Dash Cam** (67W, Mini 2)
- **Protocol:** HTTP/MJPEG
- **URL Format:** `http://192.168.1.1/video.mjpeg`
- **WiFi:** WiFi Direct
- **Notes:** Simple MJPEG stream

#### 3. **Viofo** (A129 Pro, A139)
- **Protocol:** RTSP → HLS (via converter)
- **URL Format:** `rtsp://192.168.1.1:554/stream`
- **WiFi:** WiFi Direct
- **Notes:** Requires RTSP-to-HLS bridge

#### 4. **Nextbase** (622GW, 522GW)
- **Protocol:** HTTP/MJPEG
- **URL Format:** `http://192.168.1.1:8080/stream`
- **WiFi:** WiFi Direct
- **Notes:** Good mobile app integration

#### 5. **Thinkware** (U1000, Q800PRO)
- **Protocol:** HTTP/MJPEG
- **URL Format:** `http://192.168.1.1/video`
- **WiFi:** WiFi Direct
- **Notes:** Reliable streaming

### Generic IP Cameras

Any IP camera with HTTP streaming works:
- **Axis** - `http://camera-ip/axis-cgi/mjpg/video.cgi`
- **Hikvision** - `rtsp://camera-ip:554/stream`
- **Dahua** - `http://camera-ip/cgi-bin/mjpg/video.cgi`

---

## Setup Instructions

### Step 1: Connect to Dashcam WiFi

#### iOS
```
Settings → WiFi → Select dashcam network (e.g., "BlackVue_XXXX")
```

#### Android
```
Settings → Network & Internet → WiFi → Select dashcam network
```

### Step 2: Enable Cellular Data Fallback

**This is crucial for maintaining internet access!**

#### iOS (Automatic)
```
Settings → Cellular → WiFi Assist → ON
```
iOS automatically uses cellular when WiFi has no internet.

#### Android (Manual)
```
Settings → Network & Internet → WiFi → Advanced → 
"Switch to mobile data automatically" → ON
```

Or keep cellular data enabled:
```
Settings → Network & Internet → Mobile network → 
Mobile data → ON (even when on WiFi)
```

### Step 3: Find Your Dashcam URL

#### Method A: Check Dashcam Manual
Most dashcams document their streaming URL in the manual.

#### Method B: Use Dashcam App
1. Open dashcam's mobile app
2. Look for "Live View" or "Streaming" settings
3. Note the IP address and port

#### Method C: Network Scan
```bash
# On your computer connected to same WiFi
nmap -p 80,8080,554 192.168.1.0/24

# Or use mobile app like "Fing"
```

Common URLs:
- `http://192.168.1.1:8080/video.m3u8`
- `http://192.168.1.1/video.mjpeg`
- `rtsp://192.168.1.1:554/stream`

### Step 4: Connect in Pothole Patrol

1. Open `/dashcam` page
2. Click camera icon (top-right)
3. Select "WiFi Dashcam"
4. Enter your dashcam URL
5. Click "Connect"
6. Wait for green "Connected" badge

---

## Internet Access While on Dashcam WiFi

### The Challenge

When you connect to a dashcam's WiFi:
- Your phone connects to the dashcam's local network
- Most dashcams don't provide internet access
- Your phone may disable cellular data by default

### The Solution

#### Option 1: WiFi Assist (iOS) ✅ Recommended
iOS 13+ automatically uses cellular when WiFi has no internet.

**Enable:**
```
Settings → Cellular → WiFi Assist → ON
```

**How it works:**
- iOS detects WiFi has no internet
- Automatically switches to cellular for internet requests
- Maintains WiFi connection for dashcam stream
- Seamless and automatic

#### Option 2: Dual Connection (Android) ✅ Recommended
Android 10+ supports simultaneous WiFi + cellular.

**Enable:**
```
Settings → Network & Internet → WiFi → Advanced → 
"Use mobile data when WiFi has no internet" → ON
```

**How it works:**
- Android keeps cellular data active
- Uses WiFi for dashcam
- Uses cellular for internet
- Both connections active simultaneously

#### Option 3: Manual Cellular (Android)
Force cellular data to stay on:

```
Settings → Network & Internet → Mobile network → 
Mobile data → ON
```

Then in Developer Options:
```
Settings → Developer Options → 
"Mobile data always active" → ON
```

### Verification

The app shows connection status:
```
🟢 Connected  🟢 Online  ← Both green = Perfect!
🟢 Connected  🟡 Offline ← Dashcam works, no internet
```

If you see "Offline":
1. Check cellular data is enabled
2. Check WiFi Assist is on (iOS)
3. Check mobile data settings (Android)

---

## Technical Details

### Supported Protocols

#### 1. HLS (HTTP Live Streaming)
```typescript
// .m3u8 files
if (url.includes('.m3u8') && Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource(url);
  hls.attachMedia(videoElement);
}
```

**Pros:**
- Adaptive bitrate
- Good mobile support
- Low latency

**Cons:**
- Requires HLS.js library
- Slightly more complex

#### 2. MJPEG (Motion JPEG)
```typescript
// Direct video source
videoElement.src = 'http://192.168.1.1/video.mjpeg';
```

**Pros:**
- Simple HTTP
- Wide compatibility
- No special libraries

**Cons:**
- Higher bandwidth
- No adaptive bitrate

#### 3. RTSP (Real-Time Streaming Protocol)
```
rtsp://192.168.1.1:554/stream
```

**Note:** RTSP not directly supported in browsers. Requires:
- Server-side RTSP-to-HLS converter
- Or WebRTC gateway
- Or native app

### Connection Monitoring

```typescript
// Check internet connectivity
const checkInternet = async () => {
  try {
    await fetch('https://www.google.com/favicon.ico', { 
      method: 'HEAD', 
      mode: 'no-cors' 
    });
    return true; // Online
  } catch {
    return false; // Offline
  }
};

// Check every 10 seconds
setInterval(checkInternet, 10000);
```

### Offline Queue (Future)

When internet is unavailable:
```typescript
// Queue reports locally
const queueReport = (report: PotholeReport) => {
  const queue = JSON.parse(localStorage.getItem('reportQueue') || '[]');
  queue.push(report);
  localStorage.setItem('reportQueue', JSON.stringify(queue));
};

// Sync when internet returns
if (connectionStatus.internet) {
  syncQueuedReports();
}
```

---

## Troubleshooting

### Issue: Can't Connect to Dashcam

**Symptoms:**
- "Failed to connect to network camera" error
- Video doesn't load

**Solutions:**
1. **Check WiFi Connection**
   ```
   Settings → WiFi → Verify connected to dashcam
   ```

2. **Verify URL Format**
   - Must include `http://` or `https://`
   - Check IP address is correct
   - Verify port number

3. **Test URL in Browser**
   ```
   Open Safari/Chrome → Enter dashcam URL
   Should see video or download .m3u8 file
   ```

4. **Check Dashcam Settings**
   - Ensure streaming is enabled
   - Check WiFi is active
   - Verify no password required

### Issue: Connected But No Video

**Symptoms:**
- "Connected" badge shows green
- Black screen or loading forever

**Solutions:**
1. **Check Video Format**
   - HLS (.m3u8) requires HLS.js
   - MJPEG should work directly
   - RTSP not supported (need converter)

2. **Test Different URL**
   ```
   Try: http://IP:8080/video.m3u8
   Or:  http://IP/video.mjpeg
   Or:  http://IP:80/stream
   ```

3. **Check Browser Console**
   ```
   Open DevTools → Console → Look for errors
   ```

### Issue: No Internet While Connected

**Symptoms:**
- "Offline" badge shows yellow
- Can't submit reports
- World ID verification fails

**Solutions:**
1. **Enable WiFi Assist (iOS)**
   ```
   Settings → Cellular → WiFi Assist → ON
   ```

2. **Enable Cellular Fallback (Android)**
   ```
   Settings → Network & Internet → WiFi → Advanced → 
   "Use mobile data when WiFi has no internet" → ON
   ```

3. **Force Cellular Data**
   ```
   Settings → Mobile network → Mobile data → ON
   ```

4. **Check Data Plan**
   - Ensure you have active data plan
   - Check data isn't disabled
   - Verify no data limit reached

### Issue: Slow Streaming

**Symptoms:**
- Video lags or stutters
- High latency

**Solutions:**
1. **Check WiFi Signal**
   - Move closer to dashcam
   - Reduce interference

2. **Lower Resolution**
   - Check dashcam settings
   - Reduce stream quality

3. **Use HLS Instead of MJPEG**
   - HLS has adaptive bitrate
   - Better for varying network conditions

### Issue: Connection Drops

**Symptoms:**
- Stream stops randomly
- "Disconnected" badge appears

**Solutions:**
1. **Check Dashcam Power**
   - Ensure dashcam is powered on
   - Check car is running (if powered by car)

2. **Improve WiFi Range**
   - Keep phone closer to dashcam
   - Reduce obstacles

3. **Check Dashcam Settings**
   - Some dashcams auto-sleep
   - Disable power saving mode

---

## Example URLs by Brand

### BlackVue
```
http://192.168.1.1:8080/blackvue_live.m3u8
http://192.168.1.1:8080/blackvue_vod.m3u8
```

### Garmin
```
http://192.168.1.1/video.mjpeg
http://192.168.1.1:80/stream
```

### Viofo (via RTSP bridge)
```
# Original RTSP
rtsp://192.168.1.1:554/stream

# Convert to HLS using server
http://your-server.com/hls/viofo.m3u8
```

### Nextbase
```
http://192.168.1.1:8080/stream
http://192.168.1.1/live.mjpeg
```

### Generic IP Camera
```
# MJPEG
http://192.168.1.1/axis-cgi/mjpg/video.cgi

# HLS
http://192.168.1.1:8080/stream.m3u8

# RTSP (needs conversion)
rtsp://192.168.1.1:554/live
```

---

## Best Practices

### For Drivers

1. **Set Up Before Driving**
   - Connect to dashcam WiFi
   - Test stream before starting
   - Verify internet access

2. **Keep Phone Mounted**
   - Use phone mount
   - Don't hold phone while driving
   - Position for easy access

3. **Monitor Connection**
   - Check badges periodically
   - Ensure both green (connected + online)
   - Reconnect if needed

4. **Save Dashcam URL**
   - Bookmark in notes app
   - Or save in browser
   - Avoid retyping

### For Developers

1. **Test Multiple Formats**
   - HLS (.m3u8)
   - MJPEG
   - Direct video URLs

2. **Handle Errors Gracefully**
   - Show clear error messages
   - Provide retry mechanism
   - Log errors for debugging

3. **Monitor Performance**
   - Check video latency
   - Monitor bandwidth usage
   - Optimize for mobile

4. **Implement Offline Queue**
   - Store reports locally
   - Sync when online
   - Show queue status

---

## Future Enhancements

### Phase 1: Auto-Discovery ✨
```typescript
// Scan network for dashcams
const discoverDashcams = async () => {
  const commonPorts = [80, 8080, 554];
  const subnet = '192.168.1';
  
  for (let i = 1; i < 255; i++) {
    for (const port of commonPorts) {
      try {
        await fetch(`http://${subnet}.${i}:${port}/`);
        // Found a device!
      } catch {
        // Not found
      }
    }
  }
};
```

### Phase 2: Saved Dashcams 💾
```typescript
// Save dashcam profiles
interface DashcamProfile {
  name: string;
  url: string;
  brand: string;
  lastUsed: Date;
}

const savedDashcams = [
  { name: 'My BlackVue', url: 'http://...', brand: 'BlackVue' },
  { name: 'Work Dashcam', url: 'http://...', brand: 'Garmin' }
];
```

### Phase 3: RTSP Support 📡
```typescript
// Server-side RTSP-to-HLS converter
// Using FFmpeg or similar
ffmpeg -i rtsp://192.168.1.1:554/stream \
  -c:v copy -c:a copy \
  -f hls -hls_time 2 \
  output.m3u8
```

### Phase 4: Background Sync 🔄
```typescript
// Service worker for background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncQueuedReports());
  }
});
```

---

## Security Considerations

### Network Security

1. **Use HTTPS When Possible**
   ```
   https://192.168.1.1:8443/video.m3u8
   ```

2. **Avoid Public WiFi**
   - Don't connect to unknown dashcams
   - Use your own dashcam only

3. **Check Dashcam Authentication**
   - Some dashcams require passwords
   - Use strong passwords
   - Change default credentials

### Privacy

1. **Local Processing**
   - Video stays on device
   - Only captures sent to server
   - No continuous recording

2. **User Consent**
   - Clear about data usage
   - Explain what's captured
   - Allow opt-out

3. **Data Minimization**
   - Only capture necessary frames
   - Delete after upload
   - No permanent storage

---

## Resources

### Documentation
- **HLS.js:** https://github.com/video-dev/hls.js
- **MJPEG Spec:** https://en.wikipedia.org/wiki/Motion_JPEG
- **RTSP Spec:** https://en.wikipedia.org/wiki/Real_Time_Streaming_Protocol

### Tools
- **Network Scanner:** Fing (iOS/Android)
- **Video Player:** VLC (test streams)
- **RTSP Converter:** FFmpeg

### Support
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Email:** support@pothole-patrol.com

---

**Status:** ✅ WiFi Dashcam Support Fully Implemented!

You can now connect to external WiFi dashcams and use them for pothole detection while maintaining internet access for World ID verification and report uploads. 🚗📹🌐
