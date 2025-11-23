# Pothole Patrol - Style Guide & Design System

This document serves as the single source of truth for the visual identity and user interface design of Pothole Patrol.

## 1. Core Philosophy
**"Industrial Futurism"**
The design blends the raw, high-contrast aesthetic of construction safety (to signal utility and infrastructure) with the sleek, dark interfaces of modern Web3/AI tools (to signal technology and verification).

*   **Mode:** Dark Mode First (Essential for in-car dashcam usage to reduce glare/heat and save battery).
*   **Vibe:** Professional, utilitarian, urgent, and trustworthy.

## 2. Color Palette

### Primary Colors
*   **Asphalt Black** (`#0F1115`)
    *   *Usage:* Main background. Darker than standard dark gray to minimize screen light output while driving.
*   **Safety Yellow** (`#FFD600`)
    *   *Usage:* Primary Actions (CTAs), Active States, "Recording" indicators.
    *   *Tailwind:* `bg-yellow-400`
*   **Concrete Gray** (`#2D2F36`)
    *   *Usage:* Card backgrounds, secondary buttons, borders.
    *   *Tailwind:* `bg-gray-800`

### Functional Colors
*   **Signal Green** (`#00E676`)
    *   *Usage:* Verified states, successful uploads, high confidence scores.
*   **Alert Red** (`#FF3D00`)
    *   *Usage:* Errors, "Stop Recording" actions, low confidence warnings.
*   **World ID White** (`#FFFFFF`)
    *   *Usage:* Primary text, World ID branding elements.

## 3. Typography

### Primary Font: **Inter**
Used for UI elements, buttons, and readability.
*   **Weights:** Regular (400), Medium (500), Bold (700).

### Secondary Font: **JetBrains Mono** or **Roboto Mono**
Used for "machine" data: Coordinates, Hashes, Confidence Scores, Timestamps.
*   *Why:* Reinforces the "Data" and "Proof" aspect of DePIN.

## 4. Mobile Experience (Dashcam Specific)

### The "No-Bounce" Standard
To feel like a native app on iOS Safari:
*   **Viewport:** Locked. No rubber-banding or overscrolling.
*   **Touch:** Large touch targets (min 44px) for usage while mounted in a car.
*   **Layout:** Content fits 100% of the viewport height (`100dvh`).

## 5. UI Components

### Buttons
*   **Primary (Action):** Safety Yellow background, Black text, Bold uppercase label.
    *   `bg-[#FFD600] text-black font-bold rounded-xl active:scale-95 transition-transform`
*   **Secondary (Control):** Concrete Gray background, White text.
    *   `bg-[#2D2F36] text-white font-medium rounded-xl`

### Indicators
*   **Recording:** Pulsing Red or Yellow dot.
*   **Status Badges:** Pill-shaped, monospaced text, solid background colors.

### The "HUD" (Heads Up Display)
Overlays on the camera feed should be:
*   **Semi-transparent:** `bg-black/60 backdrop-blur-md`
*   **High Contrast:** White text with slight text-shadow for readability against any road background.
