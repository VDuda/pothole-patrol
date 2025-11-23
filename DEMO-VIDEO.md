# 🎬 Pothole Patrol - Demo Video Script

**Target Time:** 2-3 Minutes  
**Goal:** Showcase "The Waze of Road Quality" — Verified, Immutable, and AI-Powered.  
**Setup:** Mirror iPhone to Mac using QuickTime. Have browser open to `localhost:3000/portal`.

---

## 1. The Hook (0:00 - 0:30)
**Visual:** Start with the **Landing Page** on your big screen.

**Narrator:**
"Our city infrastructure is crumbling, but the data to fix it is closed, stale, and expensive. Today, we are launching **Pothole Patrol**—a DePIN network that transforms any smartphone into an AI-powered, autonomous infrastructure monitor."

"We combine three layers of trust: **Edge AI** for privacy, **World ID** for human verification, and **Filecoin** for immutable history."

---

## 2. The Edge Node (Mobile View) (0:30 - 1:15)
**Visual:** Switch to **Mirrored iPhone View**. Show the **Dashcam** interface.

**Narrator:**
"Let's start at the Edge. I'm a driver in Buenos Aires."

**Action:**
1.  Tap **Settings (Gear Icon)** in top-right.
2.  Point out **"AI Model Status: Ready"**.
3.  Briefly show the **"Rewards Wallet"** input (where you'd earn tokens).
4.  Close Settings.

**Narrator:**
"The AI model runs locally via WebAssembly. No video stream ever leaves my device—preserving my privacy."

**Action:**
1.  Tap **ENABLE CAMERA** (if not already on).
2.  Tap **START PATROL**.
3.  **The Demo:** Point your phone at a secondary screen playing a "Pothole Driving Video".
4.  *Watch the yellow boxes appear and the counter increment.*

**Narrator:**
"As I drive, the neural network detects damage in real-time. It filters out false positives and logs GPS coordinates with a 20-millisecond inference time."

---

## 3. The Verification (World ID) (1:15 - 1:45)
**Visual:** Still on iPhone.

**Action:**
1.  Tap **STOP PATROL**.
2.  The **"Patrol Complete"** summary modal appears.
3.  Tap the **"Potholes"** card (with the arrow).
4.  **Review Screen:** Scroll through the captured images. Delete one to show curation.
5.  Tap **Back**.

**Narrator:**
"This is the critical DePIN moment. In a standard network, bots could spam fake data. Here, I review my session, and then I verify."

**Action:**
1.  Tap **VERIFY & UPLOAD BATCH**.
2.  *World ID verification happens (drawer opens).*
3.  **Success Alert:** "Patrol Uploaded! CID: bafy..."

**Narrator:**
"I sign the *entire session* with my World ID. One tap verifies that a unique human was physically present. The data is then bundled and anchored onto Filecoin."

---

## 4. The Knowledge Graph (Portal View) (1:45 - 2:15)
**Visual:** Switch to Browser Tab: **Open Data Portal** (`/portal`).

**Narrator:**
"Now, let's look at the Global State. This is the **Open Data Portal**."

**Action:**
1.  Refresh the page.
2.  Zoom into **Buenos Aires** (your seeded location).
3.  Show the cluster of markers.

**Narrator:**
"Here are the verified reports. Green means immutable, Blue means verified. This isn't just points on a map—it's a research-grade dataset."

**Action:**
1.  **Click a Marker:** Show the popup.
2.  Highlight the **Image** (evidence) and **Precise GPS**.
3.  Point to **"Storage: Filecoin"** link.

**Narrator:**
"Every data point contains the photographic evidence, the precise GPS coordinates, and the cryptographic proof of the specific human who found it."

---

## 5. The Close (2:15 - 2:30)
**Visual:** Click **"Export Knowledge Graph"** button.

**Narrator:**
"Finally, we close the loop. Cities and researchers can export this entire dataset as a standardized JSON-LD Knowledge Graph."

"Pothole Patrol isn't just an app; it's a transparent, immutable ledger of our physical world. Built for ETHGlobal. Thank you."

---

## 💡 Pro Tips
*   **Pre-load:** Open the Dashcam 1 minute before recording so the AI model is cached.
*   **Video:** Use a high-contrast road video for the detection demo.
*   **History:** If live detection is tricky, use the **History** tab in Settings to show a "previous successful run".
