# 🚧 Pothole Patrol - Project Summary

**ETHGlobal Buenos Aires 2025 Submission**

## 🎯 Project Overview

Pothole Patrol is a DeSci (Decentralized Science) application that transforms smartphones into AI-powered dashcams for crowdsourcing verified road damage reports. The system creates a Sybil-resistant, immutable Knowledge Graph of infrastructure health that researchers, governments, and AI models can trust.

### Tagline
**"DePIN for Road Quality. Verified by World ID. Anchored on Filecoin."**

---

## 🏆 Hackathon Tracks

### 1. World: Best Mini App ($6,500)
**Implementation:**
- Built as a World Mini App using MiniKit
- World ID verification for every report submission
- Prevents bot spam and ensures data integrity

**Key Files:**
- `src/lib/worldid.ts` - World ID integration
- `src/components/Dashcam.tsx` - Mini App with verification

### 2. Filecoin: Best Storage Innovation ($5,000)
**Implementation:**
- Lighthouse SDK integration for Filecoin storage
- Permanent, tamper-proof storage of verified reports
- IPFS CID tracking for all uploaded data

**Key Files:**
- `src/lib/filecoin.ts` - Lighthouse SDK integration
- `src/app/portal/page.tsx` - Publish to Filecoin functionality

### 3. Protocol Labs: Open Data & Research ($5,000)
**Implementation:**
- JSON-LD Knowledge Graph export
- Schema.org compliant data format
- Public API for researchers and AI models

**Key Files:**
- `src/types/report.ts` - JSON-LD types
- `src/app/portal/page.tsx` - Export functionality

---

## 🛠️ Technical Architecture

### Stack
- **Runtime**: Bun (Fast package management)
- **Framework**: Next.js 16 (App Router, Server Actions)
- **AI**: ONNX Runtime Web + YOLOv8n (Client-side inference)
- **Identity**: World MiniKit (Sybil-resistant verification)
- **Storage**: Lighthouse SDK (Filecoin storage onramp)
- **Map**: Mapbox GL JS
- **Styling**: Tailwind CSS

### Data Flow
1. **Edge (Mobile)**: Camera → YOLO Detection → World ID Verification
2. **Aggregation (Server)**: Report submission → API storage
3. **Curation (Portal)**: Admin review → Filecoin upload
4. **Knowledge Graph**: JSON-LD export → Public access

---

## 📁 Project Structure

```
pothole-patrol/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── dashcam/page.tsx         # Mobile dashcam Mini App
│   │   ├── portal/page.tsx          # Open Data Portal
│   │   ├── api/reports/route.ts     # API endpoints
│   │   └── layout.tsx               # Root layout
│   ├── components/
│   │   ├── Dashcam.tsx              # AI detection + World ID
│   │   ├── Map.tsx                  # Mapbox visualization
│   │   └── ReportCard.tsx           # Report display
│   ├── lib/
│   │   ├── ai-model.ts              # YOLO inference
│   │   ├── worldid.ts               # World ID integration
│   │   ├── filecoin.ts              # Lighthouse SDK
│   │   └── utils.ts                 # Utilities
│   └── types/
│       └── report.ts                # TypeScript types
├── public/
│   └── models/
│       └── README.md                # AI model instructions
├── README.md                        # Main documentation
├── SETUP_GUIDE.md                   # Setup instructions
├── DEPLOYMENT.md                    # Deployment guide
├── ENV_SETUP.md                     # Environment variables
└── package.json                     # Dependencies
```

---

## ✨ Key Features

### 1. AI-Powered Detection
- YOLOv8n running in browser via WASM
- Real-time pothole detection
- Confidence scoring
- Bounding box visualization

### 2. World ID Verification
- Sybil-resistant data collection
- Unique human verification
- Zero-knowledge proofs
- Privacy-preserving

### 3. Filecoin Storage
- Permanent data storage
- IPFS content addressing
- Decentralized infrastructure
- Tamper-proof records

### 4. Open Data Portal
- Interactive map visualization
- Report management
- JSON-LD export
- Public API access

### 5. Knowledge Graph
- Schema.org compliant
- Research-ready format
- AI training compatible
- Open access

---

## 🚀 Getting Started

### Quick Start
```bash
# Clone and install
git clone https://github.com/yourusername/pothole-patrol.git
cd pothole-patrol
bun install

# Set up environment variables
# Create .env.local with your API keys

# Run development server
bun dev
```

### Required API Keys
1. **World ID App ID** - [developer.worldcoin.org](https://developer.worldcoin.org/)
2. **Mapbox Token** - [mapbox.com](https://account.mapbox.com/)
3. **Lighthouse API Key** - [lighthouse.storage](https://lighthouse.storage/)

See `ENV_SETUP.md` for detailed instructions.

---

## 📊 Demo Flow

### 2-Minute Demo Script

**1. The Problem (10s)**
"Data about city infrastructure is closed, stale, and expensive. We're fixing this with Pothole Patrol."

**2. The Edge - Mobile View (45s)**
- Show phone running dashcam
- AI detects pothole in real-time
- User verifies with World ID
- Report submitted

**3. The Portal - Desktop View (45s)**
- Show incoming report on map
- Click "Publish to Filecoin"
- Pin turns green (immutable)
- Show IPFS CID

**4. The Research (20s)**
- Click "Export Knowledge Graph"
- Show JSON-LD format
- Explain open access for researchers

---

## 🎨 Design Decisions

### Why Client-Side AI?
- Privacy: No image data sent to servers
- Speed: Real-time detection
- Cost: No GPU server costs
- Offline: Works without internet (for detection)

### Why World ID?
- Sybil Resistance: One person = one vote
- Privacy: Zero-knowledge proofs
- Trust: Verified human data
- Adoption: World App has millions of users

### Why Filecoin?
- Permanence: Data stored forever
- Decentralization: No single point of failure
- Verifiability: IPFS content addressing
- Economics: Incentivized storage

### Why JSON-LD?
- Standards: Schema.org compliance
- Interoperability: Works with existing tools
- Semantics: Machine-readable metadata
- Research: Academic standard

---

## 🔮 Future Roadmap

### Phase 1: MVP (Hackathon) ✅
- AI detection
- World ID verification
- Filecoin storage
- Basic portal

### Phase 2: Production
- Database integration (PostgreSQL)
- User authentication
- Advanced analytics
- Mobile app (React Native)

### Phase 3: Scale
- Multi-city support
- Government partnerships
- API monetization
- DAO governance

### Phase 4: Ecosystem
- Developer API
- Data marketplace
- AI model training
- Research grants

---

## 📈 Impact Potential

### For Cities
- Real-time infrastructure monitoring
- Data-driven maintenance planning
- Cost reduction (predictive repairs)
- Citizen engagement

### For Researchers
- Open dataset for AI training
- Urban planning insights
- Infrastructure health studies
- Climate impact analysis

### For Citizens
- Report road issues easily
- Track repair progress
- Improve community safety
- Earn rewards (future)

---

## 🛡️ Security & Privacy

### Data Privacy
- Images processed locally (client-side AI)
- GPS coordinates only (no personal data)
- World ID uses zero-knowledge proofs
- IPFS hashes are public (by design)

### Sybil Resistance
- World ID verification required
- One person = one identity
- Prevents bot spam
- Ensures data quality

### Data Integrity
- Filecoin provides immutability
- IPFS content addressing
- Blockchain anchoring
- Cryptographic proofs

---

## 📚 Documentation

- **README.md** - Project overview and features
- **SETUP_GUIDE.md** - Complete setup instructions
- **DEPLOYMENT.md** - Deployment guide
- **ENV_SETUP.md** - Environment variables
- **PROJECT_SUMMARY.md** - This document

---

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

### Areas for Contribution
- Custom YOLO model training
- UI/UX improvements
- Database integration
- Mobile optimization
- Documentation

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👥 Team

Built with ❤️ at **ETHGlobal Buenos Aires 2025**

---

## 🔗 Links

- **GitHub**: [github.com/yourusername/pothole-patrol](https://github.com/yourusername/pothole-patrol)
- **Demo**: [pothole-patrol.vercel.app](https://pothole-patrol.vercel.app)
- **World ID**: [developer.worldcoin.org](https://developer.worldcoin.org/)
- **Filecoin**: [docs.filecoin.io](https://docs.filecoin.io/)
- **Lighthouse**: [lighthouse.storage](https://lighthouse.storage/)

---

**Total Potential Prize Money: $16,500**

🏆 World: Best Mini App - $6,500
💾 Filecoin: Best Storage Innovation - $5,000
🧪 Protocol Labs: Open Data & Research - $5,000
