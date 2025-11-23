# Pothole Patrol - Gemini Agent Overview

This document provides a high-level summary of the Pothole Patrol project, intended for a Gemini agent or a new developer to quickly understand the project's purpose, architecture, and key components.

## 1. Project Purpose

Pothole Patrol is a Decentralized Science (DeSci) application designed to crowdsource verified road damage reports. It utilizes smartphones as AI-powered dashcams to create a Sybil-resistant and immutable Knowledge Graph of city infrastructure health. This data is valuable for researchers, governments, and AI models.

**Problem Solved:** Addresses the issues of closed, stale, and expensive-to-collect infrastructure data, while also solving the problem of unverified, spam-filled data in existing crowdsourcing platforms.

## 2. Core Technologies

- **Frontend:** Next.js 16 (App Router) with React 19 and Tailwind CSS.
- **Runtime:** Bun
- **AI/ML:** YOLOv8n model running client-side via ONNX Runtime Web (WASM).
- **Identity & Verification:** World ID's MiniKit for Sybil-resistant user verification.
- **Decentralized Storage:** Filecoin via the Lighthouse SDK for permanent, tamper-proof data storage.
- **Data Portability:** JSON-LD for creating a research-ready, open Knowledge Graph.
- **Mapping:** Mapbox GL JS for data visualization.

## 3. Key Features

- **AI-Powered Dashcam:** A mobile-first web app that uses the phone's camera to automatically detect potholes in real-time.
- **World ID Verification:** Every report is signed and verified by a unique human using World ID, preventing data poisoning.
- **Open Data Portal:** A dashboard for viewing, curating, and exporting the collected data.
- **Immutable Storage:** Verified reports are published to the Filecoin network, ensuring data permanence and integrity.
- **Knowledge Graph Export:** Data can be exported in a standardized JSON-LD format, compliant with Schema.org.

## 4. How to Get Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/pothole-patrol.git
    cd pothole-patrol
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file and populate it with the necessary API keys for World ID, Mapbox, and Lighthouse. See `ENV_SETUP.md` for details.

4.  **Run the development server:**
    ```bash
    bun dev
    ```

## 5. Important Files

- **`README.md`:** The main project documentation.
- **`PRD.md`:** The detailed Product Requirements Document.
- **`PROJECT_SUMMARY.md`:** A summary of the project for the hackathon.
- **`IMPLEMENTATION_STATUS.md`:** The implementation status of the project.
- **`src/app/dashcam/page.tsx`:** The mobile dashcam interface.
- **`src/app/portal/page.tsx`:** The admin and open data portal.
- **`src/lib/ai-model.ts`:** The client-side AI logic.
- **`src/lib/worldid.ts`:** The World ID integration logic.
- **`src/lib/filecoin.ts`:** The Filecoin/Lighthouse integration logic.

This overview should provide a solid foundation for understanding the Pothole Patrol project. For more in-depth information, please refer to the detailed documentation linked above.
