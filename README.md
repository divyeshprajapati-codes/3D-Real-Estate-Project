# Aurelia Estate — Scroll-Driven 3D House Tour

A luxury real-estate landing page where a photorealistic house walkthrough plays frame-by-frame as the user scrolls. Pure HTML/CSS/JS, **no framework, no build step, no npm required.**

## High-Performance Canvas Frame Engine Architecture
The animation uses an optimized HTML5 Canvas frame-sequence system with progressive streaming:
- **Instant Initial Startup**: Preloads only the first 4 frames at startup (< 500ms initial load time).
- **Direction-Aware Rolling Preload Buffer**: Tracks scroll direction and prioritizes downloading frames in the user's travel path (~30 frames forward, ~10 frames backward).
- **Concurrency Rate Limiting**: Caps simultaneous network requests at 6 to prevent network saturation.
- **0ms Latency Non-Blocking Scroll**: If an exact frame is currently loading during fast scrolling, the canvas immediately draws the nearest cached neighbor with zero animation freeze or stutter.
- **requestAnimationFrame**: Decoupled rendering ensures 60fps smooth scrubbing without unnecessary repaints.
- **Memory-Safe Caching**: Tracks frame states (`LOADING`, `LOADED`, `ERROR`) in a Map structure to avoid duplicate requests or memory bloat.

## Files
```
scroll-tour-site/
├── index.html                     → main site (Aurelia Estate)
├── style.css                      → shared styling (luxury ink/brass/stone theme)
├── script.js                      → progressive Canvas frame engine
├── assets/
│   ├── frames/                    → 240 rendered tour frames (frame_0001.jpg ... frame_0240.jpg)
│   └── gallery/                   → curated showcase images (lazy loaded)
└── projects/
    └── arrival/                   → a second listing page
        └── index.html             → "The Arrival" — its own scroll tour + details
```

## Run it locally
Any of these work:

**Option A — VS Code**
Install the "Live Server" extension → right-click `index.html` → "Open with Live Server".

**Option B — Plain Python**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Option C — Node**
```bash
npx serve .
```

## Adjusting the text overlays
In `index.html`, each `<div class="overlay" data-range="0.14,0.30">` block shows itself while scroll progress is between those two numbers (0 = top of tour, 1 = bottom). Move the numbers to match wherever the camera enters each room in the frame sequence.

## Adjusting tour length / scroll distance
In `style.css`:
```css
.tour-section { height: 500vh; } /* increase for a longer, slower scrub */
```
More `vh` = more scroll distance = the frames play out more gradually.
