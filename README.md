# 🚧 Pothole Patrol

![Worldcoin](https://img.shields.io/badge/Verified_By-World_ID-000000?style=for-the-badge&logo=worldcoin&logoColor=white)
![Filecoin](https://img.shields.io/badge/Stored_On-Filecoin-0090FF?style=for-the-badge&logo=filecoin&logoColor=white)
![Protocol Labs](https://img.shields.io/badge/Open_Data-Protocol_Labs-16EFF3?style=for-the-badge&logo=ipfs&logoColor=black)
![Stack](https://img.shields.io/badge/Built_With-Bun_&_Next.js_16-fbf0df?style=for-the-badge&logo=bun&logoColor=black)
![AI](https://img.shields.io/badge/AI_Model-YOLOv8_WASM-FF6F00?style=for-the-badge&logo=pytorch&logoColor=white)

> **DePIN for Road Quality. Verified by World ID. Anchored on Filecoin.**

**Pothole Patrol** is a "DeSci" (Decentralized Science) application that crowdsources verified road damage reports. By turning any smartphone into an AI-powered dashcam, we create a Sybil-resistant, immutable **Knowledge Graph** of city infrastructure health that researchers, governments, and AI models can trust.

---

## 🏆 Hackathon Tracks & Implementations

This project is submitted for the following bounties at **ETHGlobal Buenos Aires**:

### 1. 🆔 World: Best Mini App ($6,500)
*   **Implementation:** Built as a **World Mini App** using `MiniKit`.
*   **Feature:** We utilize **World ID Verification** to sign every data payload.
*   **Why:** This ensures every pothole report comes from a unique human, preventing "data poisoning" and bot spam in our DePIN network.
*   *Code Loc:* `src/components/Dashcam.tsx` (MiniKit Verify Command).

### 2. 💾 Filecoin: Best Storage Innovation ($5,000)
*   **Implementation:** Integrated the **Lighthouse SDK** (`@lighthouse-web3/sdk`).
*   **Feature:** Verified reports are aggregated and uploaded to the **Filecoin network** via Lighthouse storage onramps.
*   **Why:** This provides permanent, tamper-proof storage for the "Proof of Damage" (images/video) without relying on centralized cloud providers.
*   *Code Loc:* `src/lib/filecoin.ts` (Storage logic).

### 3. 🧪 Protocol Labs: Open Data & Research ($5,000)
*   **Implementation:** Generated **JSON-LD** (Linked Data) schemas for every verified report.
*   **Feature:** Our "Open Data Portal" exports the dataset in a standardized format compliant with `Schema.org/CivicStructure`.
*   **Why:** We aren't just storing files; we are building a public **Knowledge Graph**. Researchers and City Planners can query this data frictionlessly to train AI models or plan repairs.
*   *Code Loc:* `src/app/portal/page.tsx` (JSON-LD Generation).

---

## ⚙️ How It Works

### 1. The Edge (Mobile Mini App)
Runs inside the World App. Uses **Client-Side AI (WASM)** to process video locally.
*   **Input:** Phone Camera (`getUserMedia`).
*   **Detection:** **YOLOv8n-Pothole** model runs via `onnxruntime-web`.
*   **Trigger:** When `Confidence > 0.6`, a snapshot is captured.
*   **Sign:** User signs the hash (`CID + GPS`) using **World ID**.

### 2. The Portal (Unified Dashboard)
A Next.js 16 dashboard for data curation and research.
*   **Ingest:** Receives signed reports from the Mini App.
*   **Publish:** Admin uses **Lighthouse SDK** to anchor data to Filecoin.
*   **Visualize:** Renders the city map with Green pins (Verified/Stored) vs Grey pins (Pending).
*   **Export:** Generates the Open Data Knowledge Graph.

---

## 🛠️ Tech Stack

*   **Runtime:** [Bun](https://bun.sh) (v1.1+)
*   **Framework:** [Next.js 16](https://nextjs.org) (App Router, Server Actions)
*   **Identity:** [World MiniKit](https://docs.world.org/mini-apps)
*   **AI:** [ONNX Runtime Web](https://github.com/microsoft/onnxruntime) + YOLOv8n
*   **Storage:** [Lighthouse SDK](https://lighthouse.storage/) (Filecoin Storage Onramp)
*   **Styling:** Tailwind CSS
*   **Map:** Mapbox GL JS

---

## 🚀 Getting Started

### Prerequisites
1.  **Bun** installed (`curl -fsSL https://bun.sh/install | bash`)
2.  **Lighthouse API Key** (from [lighthouse.storage](https://lighthouse.storage/))
3.  **World App Simulator** (for testing MiniKit)
4.  **Mapbox Access Token** (from [mapbox.com](https://mapbox.com))

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/pothole-patrol.git
cd pothole-patrol

# 2. Install dependencies (Lightning fast with Bun)
bun install

# 3. Set up Environment Variables
# Create a .env.local file with:
# NEXT_PUBLIC_WLD_APP_ID=your_world_app_id
# NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
# LIGHTHOUSE_API_KEY=your_lighthouse_api_key
```

### Running the App

```bash
# Run the development server
bun dev
```

Open `http://localhost:3000` in your browser.

### Testing with World App (Mobile)

To test the Mini App on your actual phone with World App, you need to expose your local server via HTTPS using **ngrok**:

#### Quick Setup

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok/ngrok/ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start ngrok tunnel:**
   ```bash
   # In a new terminal window
   ngrok http 3000
   ```

3. **Copy the HTTPS URL:**
   ```
   Forwarding: https://abc123.ngrok-free.app -> http://localhost:3000
   ```

4. **Update World App settings:**
   - Go to [developer.worldcoin.org](https://developer.worldcoin.org/)
   - Update your App URL to the ngrok HTTPS URL
   - Update Redirect URI to `https://abc123.ngrok-free.app/dashcam`

5. **Scan QR code with World App:**
   - Generate QR code with your App ID
   - Scan with World App
   - Your Mini App will open!

**📖 Full ngrok guide:** See [NGROK_SETUP.md](./NGROK_SETUP.md) for detailed instructions, troubleshooting, and best practices.

---

## 📊 The Open Data Schema

To satisfy the **Protocol Labs** requirement for usable research data, we export data in the following **JSON-LD** format:

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Buenos Aires Road Quality Index",
  "creator": "Pothole Patrol DAO",
  "variableMeasured": "Pothole Severity",
  "distribution": [
    {
      "@type": "DataDownload",
      "contentUrl": "ipfs://bafybeigdyrzt5sfp7udm7hu76ez7y4ei...", 
      "encodingFormat": "image/jpeg",
      "uploadDate": "2025-11-22T10:00:00Z",
      "verificationMethod": "WorldID-ZK-Proof"
    }
  ]
}
```

---

## 📁 Project Structure

```
pothole-patrol/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashcam/              # Mobile dashcam Mini App
│   │   ├── portal/               # Open Data Portal dashboard
│   │   └── api/                  # API routes for reports
│   ├── components/
│   │   ├── Dashcam.tsx           # AI detection + World ID
│   │   ├── Map.tsx               # Mapbox visualization
│   │   └── ReportCard.tsx        # Report display component
│   ├── lib/
│   │   ├── filecoin.ts           # Lighthouse SDK integration
│   │   ├── worldid.ts            # World ID verification
│   │   └── ai-model.ts           # YOLO inference logic
│   └── types/
│       └── report.ts             # TypeScript types
├── public/
│   └── models/
│       └── pothole.onnx          # YOLOv8n model
└── package.json
```

---

## 🎯 Demo Script (2 Minutes)

1.  **The Problem (10s):** "Data about city infrastructure is closed, stale, and expensive. We are fixing this with Pothole Patrol."
2.  **The Edge (Mobile View) (45s):**
    *   Show phone. "I am driving."
    *   Point at pothole image. **AI Detects.**
    *   "I verify I am human." **World ID Sign.**
    *   "Report Sent."
3.  **The Portal (Laptop View) (45s):**
    *   "Here is the Open Data Portal. We see the report incoming."
    *   **Click Publish.** "I am now bridging this data to the Filecoin network."
    *   **Show Map Update.** "The pin turns green. It is now immutable."
4.  **The Research (20s):**
    *   **Click Export.** Show the JSON-LD.
    *   "We have successfully created a verified, open-source knowledge graph for infrastructure that anyone can use."

---

## 📸 Screenshots

*(Add screenshots of your Map Dashboard and the World App Verify screen here)*

---

## 🔗 Resources

*   [World Mini Apps Documentation](https://docs.world.org/mini-apps)
*   [Filecoin Storage Documentation](https://docs.filecoin.io/builder-cookbook/data-storage/store-data)
*   [Lighthouse SDK GitHub](https://github.com/lighthouse-web3/lighthouse-package)
*   [YOLOv8 Documentation](https://docs.ultralytics.com/)
*   [File Coin LLM Docs](https://docs.filecoin.io/llms.txt)
*   [World LLM Docs](https://docs.world.org/llms-full.txt)

---

## 👥 Team

Built with ❤️ at **ETHGlobal Buenos Aires 2025**

---

## 📄 License

MIT License - see LICENSE file for details
