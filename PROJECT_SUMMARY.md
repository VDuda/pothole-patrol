# 🚧 Pothole Patrol - Project Summary

**ETHGlobal Buenos Aires 2025 Submission**

## 🎯 Project Overview

Pothole Patrol is a **DePIN (Decentralized Physical Infrastructure Network)** application that transforms smartphones into autonomous, AI-powered infrastructure monitors. By leveraging **DeSci (Decentralized Science)** principles, we are crowdsourcing the world's most accurate, verified, and open Knowledge Graph of road quality.

### Tagline
**"The Waze of Road Quality: DePIN Verified by World ID, Anchored on Filecoin."**

---

## 🏆 Hackathon Tracks

### 1. World: Best Mini App ($6,500)
**Implementation:**
- Native World App integration via MiniKit.
- **Sybil-Resistant Sensing:** Ensuring every data point comes from a unique human-verified session, preventing data poisoning attacks common in DePIN networks.

### 2. Filecoin: Best Storage Innovation ($5,000)
**Implementation:**
- **Immutable History:** Verified reports are anchored permanently on Filecoin via the Lighthouse SDK.
- Creates a censorship-resistant, historical ledger of infrastructure neglect and repair.

### 3. Protocol Labs: Open Data & Research ($5,000)
**Implementation:**
- **DeSci Knowledge Graph:** Data is exported in standardized JSON-LD format (Schema.org compliant), making it instantly usable for academic research, urban planning AI models, and government transparency.

---

## 🛠️ Technical Architecture

### Stack
- **Runtime**: Bun
- **Framework**: Next.js 16 (App Router)
- **Edge AI**: ONNX Runtime Web (WASM) + Fine-Tuned YOLOv8
- **Identity**: World ID MiniKit (Proof of Personhood)
- **Storage Layer**: Filecoin via Lighthouse SDK
- **Visuals**: Mapbox GL JS + Industrial Futurism UI

### The DePIN Flywheel
1.  **Sense (Edge)**: Driver's phone runs local AI to detect potholes (Passive Mode).
2.  **Verify (Identity)**: Driver signs the "Patrol Session" with World ID (One-tap batch verification).
3.  **Anchor (Storage)**: Data is cryptographically hashed and stored on Filecoin.
4.  **Utilize (Open Data)**: Cities and Researchers consume the Open Knowledge Graph to fix roads.

---

## ✨ Key Features

### 🧠 Edge AI Inference
- **Privacy First:** Runs entirely in the browser via WebAssembly (WASM). No video stream ever leaves the user's device.
- **Custom Model:** Fine-tuned YOLOv8 model achieving >95% accuracy on pothole detection.
- **High Performance:** 20ms inference time on modern mobile devices.

### 🆔 Proof of Physical Work
- Uses World ID to bind physical world actions (driving/detecting) to a verified human identity.
- Solves the "fake sensor" problem in DePIN networks.

### 📦 Open Knowledge Graph
- Automatically generates a semantic web of infrastructure data.
- API-ready for smart city integrations and autonomous vehicle navigation systems.

---

## 🚀 Getting Started

### Quick Start
```bash
git clone https://github.com/yourusername/pothole-patrol.git
cd pothole-patrol
bun install
bun dev
```

### Environment
Requires keys for World ID, Mapbox, and Lighthouse Storage. See `ENV_SETUP.md`.

---

## 🔮 Future Roadmap

### Phase 1: Foundation (Hackathon) ✅
- Mobile Edge AI Dashcam
- World ID Session Verification
- Filecoin Archival
- Open Data Portal

### Phase 2: Tokenomics (DePIN)
- **Drive-to-Earn:** Reward users with tokens for covering unmapped/stale road segments.
- **Quality Staking:** Users stake tokens to validate others' reports (slashing for false data).

### Phase 3: Governance (DAO)
- Community voting on which neighborhoods to prioritize for data collection.
- Proposal system for funding road repairs using protocol treasury.

---

## 👥 Team

Built with ❤️ for **ETHGlobal Buenos Aires 2025**