# Product Requirements Document (PRD)
## Pothole Patrol - DePIN for Road Quality

**Version:** 1.0  
**Last Updated:** November 22, 2025  
**Target Event:** ETHGlobal Buenos Aires 2025  
**Team:** VDuda  

---

## 1. Executive Summary

### 1.1 Vision
Transform smartphones into AI-powered dashcams that crowdsource verified road damage reports, creating a Sybil-resistant, immutable Knowledge Graph of infrastructure health that researchers, governments, and AI models can trust.

### 1.2 Problem Statement
- **Closed Data**: City infrastructure data is locked behind government databases
- **Stale Information**: Road damage reports are outdated by months
- **Expensive Collection**: Traditional surveying costs millions annually
- **No Verification**: Existing crowdsourcing platforms suffer from spam and fake reports
- **Inaccessible to Research**: Data is not in research-ready formats

### 1.3 Solution
A World ID-verified, Filecoin-anchored DePIN network that:
1. Uses client-side AI for privacy-preserving pothole detection
2. Verifies each report with World ID (one human = one vote)
3. Stores verified data permanently on Filecoin
4. Exports data as JSON-LD Knowledge Graphs for research

### 1.4 Target Prizes
- **World: Best Mini App** ($6,500) - Native World App integration with World ID verification
- **Filecoin: Best Storage Innovation** ($5,000) - Permanent, decentralized storage via Lighthouse SDK
- **Protocol Labs: Open Data & Research** ($5,000) - JSON-LD Knowledge Graph export

**Total Prize Pool:** $16,500

---

## 2. Product Overview

### 2.1 Core Value Propositions

#### For Citizens
- Report road damage in seconds while driving
- No manual form filling - AI detects potholes automatically
- Privacy-preserving (images processed locally)
- Contribute to public infrastructure improvement

#### For Cities
- Real-time infrastructure monitoring
- Data-driven maintenance planning
- Cost reduction through predictive repairs
- Citizen engagement and transparency

#### For Researchers
- Open dataset for AI training
- Urban planning insights
- Infrastructure health studies
- Climate impact analysis

#### For Developers
- Public API for building applications
- Research-ready data format
- Decentralized, tamper-proof storage

---

## 3. Technical Architecture

### 3.1 Technology Stack

#### Frontend
- **Framework:** Next.js 16 (App Router, React 19)
- **Runtime:** Bun (fast package management)
- **Styling:** Tailwind CSS v4
- **UI Components:** Custom components with Lucide icons
- **Map:** Mapbox GL JS
- **AI:** ONNX Runtime Web + YOLOv8n (WASM)

#### Identity & Verification
- **World ID:** MiniKit SDK v1.9.8
- **Verification:** Incognito Actions (Cloud-based)
- **Signal Generation:** Ethers.js v6

#### Storage
- **Decentralized:** Lighthouse SDK v0.4.3 (Filecoin)
- **Temporary:** In-memory (hackathon) / PostgreSQL (production)
- **Content Addressing:** IPFS CIDs

#### Data Format
- **Export:** JSON-LD (Schema.org compliant)
- **API:** RESTful JSON endpoints

### 3.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        EDGE LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Mobile Device (World App)                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │  Camera    │→ │ YOLO AI    │→ │ World ID   │     │   │
│  │  │  Stream    │  │ Detection  │  │ Verify     │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    AGGREGATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js Server (API Routes)                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │  Report    │→ │ Validate   │→ │ Store      │     │   │
│  │  │  Endpoint  │  │ Proof      │  │ Temp DB    │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CURATION LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Admin Portal                                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │  Review    │→ │ Publish to │→ │ Mark       │     │   │
│  │  │  Reports   │  │ Filecoin   │  │ Immutable  │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Open Data Portal                                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │  JSON-LD   │→ │ Public     │→ │ Research   │     │   │
│  │  │  Export    │  │ API        │  │ Access     │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Data Flow

1. **Capture** (Edge)
   - User opens dashcam in World App
   - Camera stream starts
   - YOLO model runs inference locally (WASM)
   - Pothole detected with confidence score

2. **Verify** (Edge → Cloud)
   - User clicks "Report Pothole"
   - World ID verification triggered
   - Incognito Action: `report-pothole`
   - Signal: `hash(lat, lng, timestamp)`
   - Proof returned to app

3. **Submit** (Edge → Server)
   - App sends report to API
   - Payload: image, location, detection, proof
   - Server validates World ID proof
   - Report stored with status: `pending`

4. **Review** (Portal)
   - Admin views reports on map
   - Grey pins = pending
   - Click to review details
   - Verify image and location

5. **Publish** (Portal → Filecoin)
   - Admin clicks "Publish to Filecoin"
   - Image uploaded via Lighthouse SDK
   - Metadata uploaded as JSON
   - CID stored in report
   - Pin turns green = immutable

6. **Export** (Portal → Research)
   - Click "Export Knowledge Graph"
   - Generate JSON-LD dataset
   - Schema.org compliant format
   - Download or API access

---

## 4. Feature Specifications

### 4.1 Landing Page

**Purpose:** Showcase features and drive adoption

**Components:**
- Hero section with tagline
- Feature cards (AI Detection, World ID, Filecoin, Open Data)
- Prize track badges
- Call-to-action buttons
- Tech stack showcase

**User Actions:**
- Navigate to Dashcam
- Navigate to Portal
- Learn about the project

### 4.2 Mobile Dashcam (World Mini App)

**Purpose:** Capture and verify pothole reports

**Requirements:**
- ✅ Must run inside World App
- ✅ Must use MiniKit SDK
- ✅ Must verify with World ID
- ✅ Must be mobile-first
- ✅ Must process images locally

**Features:**

#### Camera Access
- Request camera permission
- Display live video stream
- Capture frame on detection
- Handle permission errors

#### AI Detection
- Load YOLOv8n ONNX model
- Run inference on video frames
- Display bounding boxes
- Show confidence scores
- Threshold: 60% minimum

#### World ID Verification
- Initialize MiniKit with App ID
- Generate unique signal per report
- Trigger verify command
- Handle success/error responses
- Display verification status

#### Report Submission
- Collect GPS coordinates
- Capture timestamp
- Bundle detection data
- Send to API endpoint
- Show success/error feedback

**UI Components:**
- Camera preview (full screen)
- Detection overlay (bounding box)
- Confidence badge
- "Start Detection" button
- "Report Pothole" button
- Status messages
- Loading states

**Error Handling:**
- Camera permission denied
- World ID verification failed
- Network errors
- API errors
- Model loading errors

### 4.3 Admin Portal

**Purpose:** Review, curate, and publish verified reports

**Requirements:**
- ✅ Desktop-optimized layout
- ✅ Interactive map visualization
- ✅ Report management
- ✅ Filecoin publishing
- ✅ JSON-LD export

**Features:**

#### Map Visualization
- Mapbox GL JS integration
- Custom markers (grey = pending, green = published)
- Click to select report
- Zoom to location
- Cluster markers at high zoom

#### Report List
- Sidebar with all reports
- Filter by status (pending, verified, published)
- Sort by date
- Search by location
- Click to view details

#### Report Details
- Image preview
- Location (lat/lng + address)
- Detection confidence
- World ID verification badge
- Timestamp
- Status
- Filecoin CID (if published)

#### Actions
- **Publish to Filecoin**
  - Upload image via Lighthouse SDK
  - Upload metadata as JSON
  - Store CID in report
  - Update status to `published`
  - Change pin color to green

- **Export Knowledge Graph**
  - Generate JSON-LD dataset
  - Include all published reports
  - Schema.org compliant
  - Download as file

#### Statistics
- Total reports
- Pending reports
- Published reports
- Average confidence score

### 4.4 API Endpoints

#### POST /api/reports
**Purpose:** Submit new pothole report

**Request Body:**
```json
{
  "timestamp": 1700000000000,
  "location": {
    "latitude": -34.6037,
    "longitude": -58.3816,
    "address": "Buenos Aires, Argentina"
  },
  "image": {
    "dataUrl": "data:image/jpeg;base64,..."
  },
  "detection": {
    "confidence": 0.85,
    "boundingBox": {
      "x": 100,
      "y": 150,
      "width": 200,
      "height": 180
    }
  },
  "worldId": {
    "proof": "...",
    "merkle_root": "...",
    "nullifier_hash": "...",
    "verification_level": "orb"
  }
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "uuid-here"
}
```

**Validation:**
- Verify World ID proof on server
- Check required fields
- Validate coordinates
- Validate confidence score (0-1)

#### GET /api/reports
**Purpose:** Retrieve all reports

**Query Params:**
- `status` (optional): pending | verified | published
- `limit` (optional): number of reports
- `offset` (optional): pagination

**Response:**
```json
{
  "reports": [...],
  "total": 42
}
```

#### PUT /api/reports/:id
**Purpose:** Update report (publish to Filecoin)

**Request Body:**
```json
{
  "filecoin": {
    "cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "uploadDate": "2025-11-22T20:00:00Z"
  },
  "status": "published"
}
```

---

## 5. World ID Integration (MiniKit)

### 5.1 Setup Requirements

**Developer Portal:**
1. Create app at [developer.worldcoin.org](https://developer.worldcoin.org/)
2. Create Incognito Action: `report-pothole`
3. Set action description: "Verify unique human for pothole report"
4. Set max verifications: Unlimited (or limit per user)
5. Copy App ID: `app_xxxxxxxxxx`

**Environment Variables:**
```bash
NEXT_PUBLIC_WLD_APP_ID=app_xxxxxxxxxx
APP_ID=app_xxxxxxxxxx  # For server-side verification
```

### 5.2 Implementation Details

#### Client-Side (MiniKit)

**Initialize MiniKit:**
```tsx
// src/app/layout.tsx
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <MiniKitProvider>
        <body>{children}</body>
      </MiniKitProvider>
    </html>
  )
}
```

**Check if running in World App:**
```tsx
import { MiniKit } from '@worldcoin/minikit-js'

if (MiniKit.isInstalled()) {
  // Running in World App
} else {
  // Running in browser
}
```

**Verify with World ID:**
```tsx
import { MiniKit, VerifyCommandInput, VerificationLevel } from '@worldcoin/minikit-js'

const verifyPayload: VerifyCommandInput = {
  action: 'report-pothole',
  signal: generateSignal(latitude, longitude, timestamp),
  verification_level: VerificationLevel.Orb
}

const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)

if (finalPayload.status === 'error') {
  // Handle error
  return
}

// Send proof to backend for verification
const response = await fetch('/api/verify', {
  method: 'POST',
  body: JSON.stringify({
    payload: finalPayload,
    action: 'report-pothole',
    signal: verifyPayload.signal
  })
})
```

#### Server-Side (Verification)

**Verify Proof:**
```tsx
// src/app/api/verify/route.ts
import { verifyCloudProof, ISuccessResult } from '@worldcoin/minikit-js'

export async function POST(req: Request) {
  const { payload, action, signal } = await req.json()
  const app_id = process.env.APP_ID as `app_${string}`
  
  const verifyRes = await verifyCloudProof(
    payload as ISuccessResult,
    app_id,
    action,
    signal
  )
  
  if (verifyRes.success) {
    // Verification successful
    return Response.json({ success: true })
  } else {
    // Verification failed
    return Response.json({ success: false, error: verifyRes.error }, { status: 400 })
  }
}
```

### 5.3 Signal Generation

**Purpose:** Create unique signal per report to prevent replay attacks

**Implementation:**
```tsx
import { ethers } from 'ethers'

function generateSignal(
  latitude: number,
  longitude: number,
  timestamp: number
): string {
  const data = `${latitude.toFixed(6)}-${longitude.toFixed(6)}-${timestamp}`
  return ethers.id(data) // Keccak256 hash
}
```

**Why this works:**
- Unique per location + time
- Prevents duplicate reports
- Cryptographically secure
- Deterministic (same input = same output)

### 5.4 Best Practices

✅ **Always verify proofs on the server** - Never trust client-side verification  
✅ **Use unique signals** - Prevent replay attacks  
✅ **Handle errors gracefully** - User may cancel verification  
✅ **Check MiniKit.isInstalled()** - Provide fallback for browser users  
✅ **Use VerificationLevel.Orb** - Highest security (requires Orb verification)  
✅ **Store nullifier_hash** - Prevent same user from verifying twice with same action  

---

## 6. Filecoin Integration (Lighthouse SDK)

### 6.1 Setup Requirements

**API Key:**
1. Visit [lighthouse.storage](https://lighthouse.storage/)
2. Create account
3. Generate API key
4. Copy key

**Environment Variables:**
```bash
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 6.2 Implementation Details

#### Upload Image
```tsx
import lighthouse from '@lighthouse-web3/sdk'

async function uploadToFilecoin(file: File, apiKey: string): Promise<string> {
  const uploadResponse = await lighthouse.upload([file], apiKey)
  
  if (!uploadResponse?.data?.Hash) {
    throw new Error('Upload failed: No CID returned')
  }
  
  return uploadResponse.data.Hash // IPFS CID
}
```

#### Upload Metadata
```tsx
async function uploadMetadataToFilecoin(
  metadata: object,
  apiKey: string
): Promise<string> {
  const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: 'application/json'
  })
  
  const file = new File([jsonBlob], `metadata-${Date.now()}.json`, {
    type: 'application/json'
  })
  
  const uploadResponse = await lighthouse.upload([file], apiKey)
  return uploadResponse.data.Hash
}
```

#### Retrieve from IPFS
```tsx
function getIPFSUrl(cid: string): string {
  return `https://gateway.lighthouse.storage/ipfs/${cid}`
}
```

### 6.3 Data Permanence

**Why Filecoin?**
- Permanent storage (data stored forever)
- Decentralized (no single point of failure)
- Verifiable (IPFS content addressing)
- Incentivized (storage providers earn FIL)

**Storage Deal Flow:**
1. Upload to Lighthouse (storage onramp)
2. Lighthouse creates storage deals with miners
3. Data replicated across multiple miners
4. CID returned for retrieval
5. Data accessible via IPFS gateways

---

## 7. Open Data & JSON-LD

### 7.1 JSON-LD Schema

**Purpose:** Create research-ready, machine-readable Knowledge Graph

**Schema.org Compliance:**
```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Pothole Patrol - Verified Road Damage Reports",
  "description": "Crowdsourced, World ID-verified pothole reports stored on Filecoin",
  "creator": {
    "@type": "Organization",
    "name": "Pothole Patrol",
    "url": "https://github.com/VDuda/pothole-patrol"
  },
  "datePublished": "2025-11-22",
  "license": "https://creativecommons.org/publicdomain/zero/1.0/",
  "variableMeasured": "Road surface damage (potholes)",
  "distribution": [
    {
      "@type": "DataDownload",
      "contentUrl": "https://gateway.lighthouse.storage/ipfs/bafybeigdyrzt...",
      "encodingFormat": "image/jpeg",
      "uploadDate": "2025-11-22T20:00:00Z",
      "verificationMethod": "World ID (Orb)",
      "location": {
        "@type": "GeoCoordinates",
        "latitude": -34.6037,
        "longitude": -58.3816
      },
      "additionalProperty": {
        "@type": "PropertyValue",
        "name": "AI Confidence",
        "value": 0.85
      }
    }
  ]
}
```

### 7.2 Export Functionality

**Implementation:**
```tsx
function exportKnowledgeGraph(reports: PotholeReport[]) {
  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Pothole Patrol - Verified Road Damage Reports',
    creator: 'Pothole Patrol',
    variableMeasured: 'Road surface damage',
    distribution: reports
      .filter(r => r.status === 'published')
      .map(r => ({
        '@type': 'DataDownload',
        contentUrl: getIPFSUrl(r.filecoin.cid),
        encodingFormat: 'image/jpeg',
        uploadDate: r.filecoin.uploadDate,
        verificationMethod: 'World ID (Orb)',
        location: {
          '@type': 'GeoCoordinates',
          latitude: r.location.latitude,
          longitude: r.location.longitude
        }
      }))
  }
  
  const blob = new Blob([JSON.stringify(dataset, null, 2)], {
    type: 'application/ld+json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pothole-patrol-${Date.now()}.jsonld`
  a.click()
}
```

### 7.3 Research Use Cases

**AI Model Training:**
- Labeled pothole images
- GPS coordinates for geographic analysis
- Confidence scores for quality filtering
- Verified human annotations (World ID)

**Urban Planning:**
- Infrastructure health mapping
- Maintenance prioritization
- Budget allocation
- Trend analysis over time

**Climate Research:**
- Correlation with weather patterns
- Seasonal damage analysis
- Climate impact on infrastructure

**Public Policy:**
- Transparency in infrastructure spending
- Citizen engagement metrics
- Data-driven decision making

---

## 8. User Flows

### 8.1 Report Pothole (Mobile)

1. User opens World App
2. Navigates to Pothole Patrol Mini App
3. Clicks "Open Dashcam"
4. Grants camera permission
5. Points camera at road while driving
6. AI detects pothole (green badge appears)
7. User clicks "Report Pothole"
8. World ID verification drawer opens
9. User confirms verification
10. Report submitted
11. Success message displayed

**Time to complete:** ~30 seconds

### 8.2 Publish Report (Desktop)

1. Admin opens Portal
2. Views map with pending reports (grey pins)
3. Clicks on a report
4. Reviews image and details
5. Verifies World ID badge
6. Clicks "Publish to Filecoin"
7. Upload progress shown
8. CID displayed
9. Pin turns green
10. Report marked as immutable

**Time to complete:** ~15 seconds per report

### 8.3 Export Knowledge Graph (Desktop)

1. Admin opens Portal
2. Clicks "Export Knowledge Graph"
3. JSON-LD file generated
4. File downloads automatically
5. Admin can share with researchers

**Time to complete:** ~5 seconds

---

## 9. Success Metrics

### 9.1 Hackathon Demo Metrics

**Technical:**
- ✅ Build succeeds without errors
- ✅ All features functional
- ✅ World ID verification works
- ✅ Filecoin upload succeeds
- ✅ JSON-LD export valid

**User Experience:**
- ✅ Camera loads < 2 seconds
- ✅ AI detection < 1 second per frame
- ✅ Report submission < 5 seconds
- ✅ Filecoin upload < 30 seconds

**Demo:**
- ✅ 2-minute demo script practiced
- ✅ Backup screenshots ready
- ✅ All API keys configured
- ✅ Mobile + desktop tested

### 9.2 Production Metrics (Future)

**Adoption:**
- Daily active users
- Reports submitted per day
- Reports published to Filecoin
- Knowledge Graph downloads

**Quality:**
- Average AI confidence score
- World ID verification rate
- Report approval rate
- User retention

**Impact:**
- Cities using the data
- Research papers citing dataset
- Infrastructure repairs completed
- Cost savings for municipalities

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI model too large | Slow loading | Use YOLOv8n (smallest variant) |
| Camera permission denied | Can't capture | Clear error message + instructions |
| World ID verification fails | Can't submit | Retry mechanism + error handling |
| Filecoin upload slow | Poor UX | Loading indicator + async upload |
| IPFS gateway down | Can't retrieve | Multiple gateway fallbacks |

### 10.2 Product Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Fake reports | Data quality | World ID verification required |
| Spam submissions | Database bloat | Rate limiting + admin review |
| Privacy concerns | User trust | Client-side AI + no personal data |
| Low adoption | No data | Gamification + rewards (future) |
| Regulatory issues | Legal problems | Open data + no PII collected |

### 10.3 Demo Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Internet failure | Can't demo | Backup video recording |
| API keys expired | Features broken | Check before demo |
| Mobile battery dies | Can't show dashcam | Charge beforehand + backup phone |
| Build fails | Can't deploy | Test build multiple times |
| Judges don't understand | Low score | Clear 2-minute script |

---

## 11. Future Roadmap

### Phase 1: MVP (Hackathon) ✅
- AI detection
- World ID verification
- Filecoin storage
- Basic portal
- JSON-LD export

### Phase 2: Production (Q1 2026)
- PostgreSQL database
- User authentication
- Advanced analytics
- Mobile app (React Native)
- Multiple AI models

### Phase 3: Scale (Q2 2026)
- Multi-city support
- Government partnerships
- API monetization
- DAO governance
- Token rewards

### Phase 4: Ecosystem (Q3 2026)
- Developer API
- Data marketplace
- AI model training service
- Research grants program
- Smart city integrations

---

## 12. Appendix

### 12.1 Key Dependencies

```json
{
  "@worldcoin/minikit-js": "^1.9.8",
  "@lighthouse-web3/sdk": "^0.4.3",
  "onnxruntime-web": "^1.23.2",
  "mapbox-gl": "^3.16.0",
  "ethers": "^6.15.0",
  "next": "16.0.3",
  "react": "19.2.0"
}
```

### 12.2 Environment Variables

```bash
# World ID
NEXT_PUBLIC_WLD_APP_ID=app_xxxxxxxxxx
APP_ID=app_xxxxxxxxxx

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxx

# Lighthouse (Filecoin)
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 12.3 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/reports` | GET | List all reports |
| `/api/reports` | POST | Submit new report |
| `/api/reports/:id` | PUT | Update report |
| `/api/verify` | POST | Verify World ID proof |

### 12.4 File Structure

```
pothole-patrol/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── dashcam/page.tsx         # Mobile dashcam
│   │   ├── portal/page.tsx          # Admin portal
│   │   ├── api/
│   │   │   ├── reports/route.ts     # Report CRUD
│   │   │   └── verify/route.ts      # World ID verification
│   │   └── layout.tsx               # Root layout with MiniKitProvider
│   ├── components/
│   │   ├── Dashcam.tsx              # Camera + AI + World ID
│   │   ├── Map.tsx                  # Mapbox visualization
│   │   └── ReportCard.tsx           # Report display
│   ├── lib/
│   │   ├── ai-model.ts              # YOLO inference
│   │   ├── worldid.ts               # World ID helpers
│   │   ├── filecoin.ts              # Lighthouse SDK
│   │   └── utils.ts                 # Utilities
│   └── types/
│       └── report.ts                # TypeScript types
├── public/
│   └── models/
│       └── pothole.onnx             # AI model (not in repo)
├── PRD.md                           # This document
├── README.md                        # Project overview
├── SETUP_GUIDE.md                   # Setup instructions
├── DEPLOYMENT.md                    # Deployment guide
└── package.json                     # Dependencies
```

### 12.5 References

- **World ID Docs:** https://docs.world.org/llms-full.txt
- **MiniKit SDK:** https://github.com/worldcoin/minikit-js
- **Lighthouse Docs:** https://docs.lighthouse.storage/
- **Filecoin Docs:** https://docs.filecoin.io/
- **Schema.org:** https://schema.org/Dataset
- **YOLO:** https://github.com/ultralytics/ultralytics

---

**Document Status:** ✅ Complete  
**Last Review:** November 22, 2025  
**Next Review:** Post-hackathon
