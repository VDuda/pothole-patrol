# 🎯 ETHGlobal Buenos Aires - Hackathon Checklist

## 📋 Pre-Demo Checklist

### Environment Setup
- [ ] All API keys configured in `.env.local`
- [ ] World ID App created and configured
- [ ] Mapbox token active
- [ ] Lighthouse API key active
- [ ] YOLO model downloaded to `public/models/pothole.onnx`

### Testing
- [ ] `bun dev` runs without errors
- [ ] Landing page loads correctly
- [ ] Dashcam page opens camera
- [ ] AI detection works (test with sample images)
- [ ] World ID verification flow tested
- [ ] Portal map displays correctly
- [ ] Filecoin upload tested
- [ ] JSON-LD export works

### Deployment
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Production build successful
- [ ] Live URL accessible
- [ ] HTTPS working (required for camera)

### Demo Preparation
- [ ] Sample pothole images prepared
- [ ] Mobile device charged
- [ ] Laptop charged
- [ ] Stable internet connection
- [ ] Backup screenshots ready
- [ ] Demo script practiced

---

## 🎤 2-Minute Demo Script

### Opening (10 seconds)
**Say:** "Hi! I'm [name] and this is Pothole Patrol - DePIN for Road Quality."

**Show:** Landing page on laptop

**Key Point:** "We're solving the problem of closed, stale infrastructure data."

---

### Part 1: The Edge (45 seconds)

**Say:** "Let me show you how it works. I'm now a driver with the dashcam app."

**Do:**
1. Open `/dashcam` on mobile
2. Click "Start Camera"
3. Point at pothole image
4. Click "Start Detection"
5. Wait for detection (green badge appears)
6. Click "Report Pothole"
7. Complete World ID verification
8. Show "Report submitted" message

**Key Points:**
- "AI runs locally in the browser using WASM"
- "World ID verifies I'm a unique human"
- "This prevents bot spam in our DePIN network"

---

### Part 2: The Portal (45 seconds)

**Say:** "Now let's see the admin portal where reports are curated."

**Do:**
1. Switch to laptop
2. Show `/portal` page
3. Point to new report in sidebar (grey pin)
4. Click on the report card
5. Show World ID verified badge
6. Click "Publish to Filecoin"
7. Wait for upload
8. Show green pin on map
9. Show IPFS CID

**Key Points:**
- "Reports are aggregated here"
- "We publish verified data to Filecoin"
- "Green pins are immutable, permanent records"

---

### Part 3: The Knowledge Graph (20 seconds)

**Say:** "Finally, this is what makes us eligible for the Protocol Labs prize."

**Do:**
1. Click "Export Knowledge Graph"
2. Open downloaded JSON file
3. Show JSON-LD structure

**Key Points:**
- "Schema.org compliant format"
- "Open access for researchers"
- "Ready for AI model training"

---

### Closing (10 seconds)

**Say:** "Pothole Patrol creates a verified, open-source knowledge graph of infrastructure that anyone can use. Thank you!"

**Show:** Landing page with prize tracks

---

## 🏆 Prize Track Talking Points

### World: Best Mini App
**Why we qualify:**
- Built as World Mini App using MiniKit
- World ID verification on every report
- Prevents Sybil attacks in DePIN network
- Mobile-first experience

**Code to show:** `src/lib/worldid.ts`, `src/components/Dashcam.tsx`

### Filecoin: Best Storage Innovation
**Why we qualify:**
- Lighthouse SDK integration
- Permanent storage of verified reports
- IPFS content addressing
- Decentralized infrastructure

**Code to show:** `src/lib/filecoin.ts`, publish functionality in Portal

### Protocol Labs: Open Data & Research
**Why we qualify:**
- JSON-LD Knowledge Graph export
- Schema.org compliance
- Public API for researchers
- Open access data

**Code to show:** JSON-LD export, `src/types/report.ts`

---

## 🐛 Common Issues & Fixes

### Camera Not Working
**Issue:** "Camera permission denied"
**Fix:** Use HTTPS (Vercel provides this automatically)

### World ID Not Working
**Issue:** "Verification failed"
**Fix:** Check App ID in `.env.local`, ensure action name is `report-pothole`

### Map Not Loading
**Issue:** Blank map
**Fix:** Verify Mapbox token, check browser console

### AI Model Error
**Issue:** "Failed to load model"
**Fix:** Ensure `pothole.onnx` exists in `public/models/`

### Filecoin Upload Fails
**Issue:** "Upload failed"
**Fix:** Verify Lighthouse API key, check file size (<10MB)

---

## 📱 Backup Plan

If live demo fails:

### Plan A: Use Recorded Video
- Have screen recording ready
- Show all features working
- Explain what's happening

### Plan B: Show Screenshots
- Landing page
- Dashcam with detection
- World ID verification
- Portal with map
- JSON-LD export

### Plan C: Code Walkthrough
- Show architecture diagram
- Walk through key files
- Explain technical decisions

---

## 🎯 Judge Questions - Prepared Answers

### "How does this scale?"
**Answer:** "We use client-side AI to avoid server costs. Filecoin provides decentralized storage that scales naturally. For the database, we'd use PostgreSQL with read replicas."

### "What about data quality?"
**Answer:** "World ID ensures one person = one identity. We have confidence thresholds on AI detection. Admins review before publishing to Filecoin."

### "Why not use a centralized database?"
**Answer:** "Centralized data can be censored, lost, or manipulated. Filecoin provides permanent, tamper-proof storage. IPFS makes data verifiable."

### "How do you prevent fake reports?"
**Answer:** "World ID verification prevents Sybil attacks. AI confidence scoring filters low-quality detections. Admin review adds human oversight."

### "What's the business model?"
**Answer:** "Open data is free. We could monetize premium API access, analytics dashboards, or government partnerships. For now, it's a public good."

---

## 📊 Key Metrics to Mention

- **Client-side AI**: 0 server costs for inference
- **World ID**: Millions of verified users
- **Filecoin**: Permanent storage (vs. AWS expiring data)
- **Open Data**: Accessible to all researchers
- **Real-time**: Detection happens instantly

---

## 🎨 Visual Aids

### Architecture Diagram
```
[Phone Camera] → [YOLO AI] → [World ID] → [API]
                                              ↓
[Researchers] ← [JSON-LD] ← [Portal] ← [Database]
                                ↓
                          [Filecoin]
```

### Data Flow
```
1. Detect (Edge)
2. Verify (World ID)
3. Submit (API)
4. Review (Portal)
5. Publish (Filecoin)
6. Export (JSON-LD)
```

---

## ✅ Final Check (5 minutes before demo)

- [ ] Laptop charged and connected to power
- [ ] Phone charged
- [ ] Internet connection stable
- [ ] All tabs open and ready
- [ ] Demo script reviewed
- [ ] Backup materials ready
- [ ] Confident and ready to present!

---

## 🚀 Good Luck!

You've built something amazing. Now go show it to the judges!

**Remember:**
- Speak clearly and confidently
- Make eye contact
- Show enthusiasm
- Handle questions gracefully
- Have fun!

**You got this! 🎉**
