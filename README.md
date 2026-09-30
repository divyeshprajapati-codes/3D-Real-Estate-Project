# Aurelia Estate — Scroll-Driven 3D House Tour

A luxury real-estate landing page where a photorealistic house walkthrough
plays frame-by-frame as the user scrolls — the same "scroll-scrubbing"
technique used on Apple/Tesla product pages. Pure HTML/CSS/JS, **no
framework, no build step, no npm required.** Open it in any code editor
and it runs.

## Files
```
scroll-tour-site/
├── index.html                     → main site (Aurelia Estate)
├── style.css                      → shared styling (luxury ink/brass/stone theme)
├── script.js                      → scroll-scrubbing engine (well commented)
├── assets/frames/                 → 240 frames for the main site's tour
│   └── frame_0001.jpg ... frame_0240.jpg
└── projects/
    └── arrival/                   → a second, self-contained listing page
        ├── index.html             → "The Arrival" — its own scroll tour + details
        └── assets/frames/         → 240 frames for THIS listing only
            └── frame_0001.jpg ... frame_0240.jpg
```

Each project keeps its own `assets/frames/` folder — nothing is shared or
duplicated across projects, and nothing is written outside this one
`scroll-tour-site/` folder anywhere on your machine.

## Adding another new listing (a third project, etc.)
1. Copy the whole `projects/arrival/` folder, rename it (e.g. `projects/lakeside/`).
2. Replace everything in its `assets/frames/` with the new video's extracted,
   watermark-removed frames.
3. Edit its `index.html` text (headline, overlay copy, price/stats).
4. Add a card/link to it from the main `index.html`, same pattern as the
   "Explore The Arrival" section.
No shared code needs to change — every project is fully self-contained.

## Run it locally
Any of these work — pick whichever your editor supports:

**Option A — VS Code**
Install the "Live Server" extension → right-click `index.html` → "Open with Live Server".

**Option B — Plain Python (works everywhere)**
```bash
cd scroll-tour-site
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Option C — Node**
```bash
npx serve .
```

> Opening `index.html` by double-clicking (file:// URL) mostly works too,
> but some browsers block local image loading over `file://` — a local
> server avoids that entirely, so use Option A or B if frames don't appear.

## Replacing the placeholder frames with your real 3D render
The 90 placeholder frames are just labeled color gradients so the site
works immediately out of the box. To use your actual luxury bungalow render:

1. In Blender / Unreal Engine / your renderer of choice, animate one
   continuous camera path through the house (aerial → entrance → living
   room → kitchen → bedroom → bathroom → backyard/pool).
2. Render it out as a numbered image sequence — **not a video file**:
   `frame_0001.jpg`, `frame_0002.jpg`, etc. (150–300 frames is a good range;
   more frames = smoother scrub, larger folder size).
3. Replace everything inside `assets/frames/` with your new sequence.
4. Open `script.js` and update two lines at the top:
   ```js
   const CONFIG = {
     FRAME_COUNT: 240,   // ← set this to your actual frame count
     FRAME_PATH: (i) => `assets/frames/frame_${String(i).padStart(4,'0')}.jpg`,
     ...
   };
   ```
5. Save — no other code changes needed. The scroll math, overlay fades,
   loader, and gallery all recalculate automatically from `FRAME_COUNT`.

## Adjusting the text overlays
In `index.html`, each `<div class="overlay" data-range="0.14,0.30">` block
shows itself while scroll progress is between those two numbers (0 = top of
tour, 1 = bottom). Move the numbers to match wherever your camera enters
each room in your new frame sequence.

## Adjusting tour length / scroll distance
In `style.css`:
```css
.tour-section{ height: 500vh; } /* increase for a longer, slower scrub */
```
More `vh` = more scroll distance = the same frames play out more gradually
(smoother-feeling scrub, especially with a large FRAME_COUNT).

## Performance notes
- Keep individual frames under ~150–250 KB each (JPG quality 75–85 is
  usually indistinguishable but a fraction of the size).
- For very large sequences (300+ frames), consider WebP instead of JPG —
  same visual quality, smaller files.
- The site preloads every frame before revealing the page (loader screen)
  so scrubbing never stutters waiting on network — this is the standard
  trade-off (short wait upfront, buttery smooth after).

## What's already built in
- Loading screen with real preload progress
- Scroll-scrubbed canvas tour (image-sequence method, not laggy video seeking)
- Scroll-synced text overlays per room
- Property details section with stats + price card
- Auto-generated photo gallery (samples frames from the tour)
- Contact/viewing-request form
- Fully responsive (mobile reduces scroll distance, stacks overlays)
- Respects `prefers-reduced-motion`
