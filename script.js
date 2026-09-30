/* ==========================================================================
   AURELIA ESTATE — Scroll-Driven 3D Tour Engine
   ==========================================================================
   HOW THIS WORKS
   - We preload a sequence of images (frames) into memory.
   - As the user scrolls through #tour, we compute a 0→1 progress value.
   - That progress picks a frame index, which we draw onto a <canvas>.
   - This is the same technique Apple/Tesla use on product pages — it scrubs
     far smoother than seeking an actual <video> element in the browser.

   TO USE YOUR OWN REAL RENDERED FRAMES
   1. Export your Blender/UE5 camera animation as a sequence of JPG/WEBP
      images (e.g. 150–300 frames, 1920x1080).
   2. Name them frame_0001.jpg, frame_0002.jpg ... sequentially.
   3. Drop them into /assets/frames/ (replacing the placeholder ones).
   4. Update FRAME_COUNT and FRAME_PATH below to match.
   That's it — nothing else in this file needs to change.
   ========================================================================== */

const CONFIG = {
  FRAME_COUNT: 240,                      // total number of frames in the sequence
  FRAME_PATH: (i) => `assets/frames/frame_${String(i).padStart(4,'0')}.jpg`,
  GALLERY_SAMPLE_EVERY: 24,              // pick 1 frame every N for the gallery grid
};

const canvas = document.getElementById('tourCanvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
const loaderPct = document.getElementById('loaderPct');
const tourSection = document.getElementById('tour');
const overlays = Array.from(document.querySelectorAll('.overlay'));
const scrollCue = document.getElementById('scrollCue');
const galleryGrid = document.getElementById('galleryGrid');

let frames = [];
let loadedCount = 0;
let currentFrameIndex = -1;

/* ---------- 1. Resize canvas to fill viewport crisply ---------- */
function resizeCanvas(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (frames[currentFrameIndex]) drawFrame(frames[currentFrameIndex]);
}
window.addEventListener('resize', resizeCanvas);

/* ---------- 2. Preload all frames, update loader ---------- */
function preloadFrames(){
  return new Promise((resolve) => {
    for (let i = 1; i <= CONFIG.FRAME_COUNT; i++){
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        const pct = Math.round((loadedCount / CONFIG.FRAME_COUNT) * 100);
        loaderFill.style.width = pct + '%';
        loaderPct.textContent = pct + '%';
        if (loadedCount === CONFIG.FRAME_COUNT) resolve();
      };
      img.src = CONFIG.FRAME_PATH(i);
      frames[i - 1] = img;
    }
  });
}

/* ---------- 3. Draw a frame onto canvas, cover-fit like CSS object-fit:cover ---------- */
function drawFrame(img){
  if (!img || !img.width) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const ir = img.width / img.height;
  const vr = vw / vh;
  let dw, dh, dx, dy;
  if (vr > ir){ dw = vw; dh = vw / ir; dx = 0; dy = (vh - dh) / 2; }
  else { dh = vh; dw = vh * ir; dy = 0; dx = (vw - dw) / 2; }
  ctx.clearRect(0, 0, vw, vh);
  ctx.drawImage(img, dx, dy, dw, dh);
}

/* ---------- 4. Scroll → frame index + overlay opacity ---------- */
let ticking = false;

function updateOnScroll(){
  const rect = tourSection.getBoundingClientRect();
  const sectionHeight = tourSection.offsetHeight - window.innerHeight;
  // progress: 0 at top of section, 1 at bottom
  let progress = -rect.top / sectionHeight;
  progress = Math.min(1, Math.max(0, progress));

  const frameIdx = Math.min(
    CONFIG.FRAME_COUNT - 1,
    Math.floor(progress * (CONFIG.FRAME_COUNT - 1))
  );

  if (frameIdx !== currentFrameIndex && frames[frameIdx]){
    currentFrameIndex = frameIdx;
    drawFrame(frames[frameIdx]);
  }

  // overlay fade in/out by scroll-percentage range
  overlays.forEach(el => {
    const [start, end] = el.dataset.range.split(',').map(Number);
    const visible = progress >= start && progress <= end;
    el.classList.toggle('visible', visible);
  });

  // hide scroll cue once user has started scrolling
  scrollCue.classList.toggle('hide', progress > 0.03);

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking){
    requestAnimationFrame(updateOnScroll);
    ticking = true;
  }
}, { passive: true });

/* ---------- 5. Populate gallery from a sample of tour frames ---------- */
/* Guarded: not every page has a #galleryGrid section (e.g. shorter listing
   pages) — skip quietly instead of throwing, which would otherwise stop
   the whole init() sequence and leave the loader stuck on screen forever. */
function populateGallery(){
  if (!galleryGrid) return;
  for (let i = 1; i <= CONFIG.FRAME_COUNT; i += CONFIG.GALLERY_SAMPLE_EVERY){
    const img = document.createElement('img');
    img.src = CONFIG.FRAME_PATH(i);
    img.loading = 'lazy';
    img.alt = 'Property — interior view';
    galleryGrid.appendChild(img);
  }
}

/* ---------- 6. Boot sequence ---------- */
(async function init(){
  try {
    resizeCanvas();
    populateGallery();
    await preloadFrames();
    drawFrame(frames[0]);
    updateOnScroll();
  } catch (err){
    // Never let an unexpected error leave the loader stuck on screen —
    // log it for debugging and reveal the page anyway.
    console.error('Tour init error:', err);
  } finally {
    setTimeout(() => loader && loader.classList.add('hidden'), 300);
  }
})();
