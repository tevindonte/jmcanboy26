/*
  Infinite Gradient 3D Carousel - Fixed Colors
  header1 magenta, header2 baby blue, header3 pink, header4 orange, header5 gray,
  header6 blue, header7 green, header8 purple, header9 magenta, header10 blue, header11 orange
*/

// Fixed gradient colors for each header (c1 = main, c2 = lighter accent)
const FIXED_COLORS = [
  { c1: [255, 0, 255], c2: [255, 100, 255] },      // 1 magenta
  { c1: [137, 207, 240], c2: [180, 230, 255] },    // 2 baby blue
  { c1: [255, 105, 180], c2: [255, 182, 193] },    // 3 pink
  { c1: [255, 165, 0], c2: [255, 200, 100] },      // 4 orange
  { c1: [128, 128, 128], c2: [180, 180, 180] },    // 5 gray
  { c1: [0, 102, 255], c2: [100, 150, 255] },      // 6 blue
  { c1: [34, 197, 94], c2: [100, 220, 150] },      // 7 green
  { c1: [139, 92, 246], c2: [180, 150, 255] },     // 8 purple
  { c1: [255, 0, 255], c2: [255, 100, 255] },      // 9 magenta
  { c1: [0, 102, 255], c2: [100, 150, 255] },      // 10 blue
  { c1: [255, 165, 0], c2: [255, 200, 100] },      // 11 orange
];

// Header image paths (relative to gradientslider - parent folder has header/)
const HEADER_IMAGES = [
  '../header/Header%20%281%29.png',
  '../header/Header%20%282%29.jpg',
  '../header/Header%20%283%29.jpg',
  '../header/Header%20%284%29.jpg',
  '../header/Header%20%285%29.jpg',
  '../header/Header%20%286%29.jpg',
  '../header/Header%20%287%29.jpg',
  '../header/Header%20%288%29.jpg',
  '../header/Header%20%289%29.jpg',
  '../header/Header%20%2810%29.jpg',
  '../header/Header%20%2811%29.jpg',
];

const FRICTION = 0.9;
const WHEEL_SENS = 0.6;
const DRAG_SENS = 1.0;
const MAX_ROTATION = 28;
const MAX_DEPTH = 140;
const MIN_SCALE = 0.92;
const SCALE_RANGE = 0.1;
const GAP = 28;

const stage = document.querySelector('.stage');
const cardsRoot = document.getElementById('cards');
const bgCanvas = document.getElementById('bg');
const bgCtx = bgCanvas?.getContext('2d', { alpha: false });
const loader = document.getElementById('loader');

let items = [];
let positions = [];
let activeIndex = -1;
let isEntering = true;
let CARD_W = 300;
let CARD_H = 400;
let STEP = CARD_W + GAP;
let TRACK = 0;
let SCROLL_X = 0;
let VW_HALF = window.innerWidth * 0.5;
let vX = 0;
let rafId = null;
let bgRAF = null;
let lastTime = 0;
let lastBgDraw = 0;

let gradPalette = FIXED_COLORS;
let gradCurrent = { r1: 255, g1: 0, b1: 255, r2: 255, g2: 100, b2: 255 };
let bgFastUntil = 0;

function mod(n, m) { return ((n % m) + m) % m; }

function createCards() {
  cardsRoot.innerHTML = '';
  items = [];
  const fragment = document.createDocumentFragment();

  FIXED_COLORS.forEach((pal, i) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.style.willChange = 'transform';
    card.style.background = `linear-gradient(135deg, rgb(${pal.c1.join(',')}), rgb(${pal.c2.join(',')}))`;
    const img = document.createElement('img');
    img.className = 'card__img';
    img.src = HEADER_IMAGES[i];
    img.alt = `Header ${i + 1}`;
    card.appendChild(img);
    fragment.appendChild(card);
    items.push({ el: card, x: i * STEP });
  });

  cardsRoot.appendChild(fragment);
}

function measure() {
  const sample = items[0]?.el;
  if (!sample) return;
  const r = sample.getBoundingClientRect();
  CARD_W = r.width || CARD_W;
  CARD_H = r.height || CARD_H;
  STEP = CARD_W + GAP;
  TRACK = items.length * STEP;
  items.forEach((it, i) => { it.x = i * STEP; });
  positions = new Float32Array(items.length);
}

function computeTransformComponents(screenX) {
  const norm = Math.max(-1, Math.min(1, screenX / VW_HALF));
  const absNorm = Math.abs(norm);
  const invNorm = 1 - absNorm;
  const ry = -norm * MAX_ROTATION;
  const tz = invNorm * MAX_DEPTH;
  const scale = MIN_SCALE + invNorm * SCALE_RANGE;
  return { norm, absNorm, invNorm, ry, tz, scale };
}

function transformForScreenX(screenX) {
  const { ry, tz, scale } = computeTransformComponents(screenX);
  return {
    transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
    z: tz,
  };
}

function updateCarouselTransforms() {
  const half = TRACK / 2;
  let closestIdx = -1;
  let closestDist = Infinity;

  for (let i = 0; i < items.length; i++) {
    let pos = items[i].x - SCROLL_X;
    if (pos < -half) pos += TRACK;
    if (pos > half) pos -= TRACK;
    positions[i] = pos;
    const dist = Math.abs(pos);
    if (dist < closestDist) {
      closestDist = dist;
      closestIdx = i;
    }
  }

  const prevIdx = (closestIdx - 1 + items.length) % items.length;
  const nextIdx = (closestIdx + 1) % items.length;

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const pos = positions[i];
    const norm = Math.max(-1, Math.min(1, pos / VW_HALF));
    const { transform, z } = transformForScreenX(pos);
    it.el.style.transform = transform;
    it.el.style.zIndex = String(1000 + Math.round(z));
    const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
    const blur = isCore ? 0 : 2 * Math.pow(Math.abs(norm), 1.1);
    it.el.style.filter = `blur(${blur.toFixed(2)}px)`;
  }

  if (closestIdx !== activeIndex) setActiveGradient(closestIdx);
}

function setActiveGradient(idx) {
  if (!bgCtx || idx < 0 || idx >= items.length || idx === activeIndex) return;
  activeIndex = idx;
  const pal = gradPalette[idx];
  const to = {
    r1: pal.c1[0], g1: pal.c1[1], b1: pal.c1[2],
    r2: pal.c2[0], g2: pal.c2[1], b2: pal.c2[2],
  };
  if (window.gsap) {
    bgFastUntil = performance.now() + 800;
    gsap.to(gradCurrent, { ...to, duration: 0.45, ease: 'power2.out' });
  } else {
    Object.assign(gradCurrent, to);
  }
}

function tick(t) {
  const dt = lastTime ? (t - lastTime) / 1000 : 0;
  lastTime = t;
  SCROLL_X = mod(SCROLL_X + vX * dt, TRACK);
  const decay = Math.pow(FRICTION, dt * 60);
  vX *= decay;
  if (Math.abs(vX) < 0.02) vX = 0;
  updateCarouselTransforms();
  rafId = requestAnimationFrame(tick);
}

function startCarousel() {
  if (rafId) cancelAnimationFrame(rafId);
  lastTime = 0;
  rafId = requestAnimationFrame((t) => {
    updateCarouselTransforms();
    tick(t);
  });
}

function resizeBG() {
  if (!bgCanvas || !bgCtx) return;
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const w = bgCanvas.clientWidth || stage.clientWidth;
  const h = bgCanvas.clientHeight || stage.clientHeight;
  const tw = Math.floor(w * dpr);
  const th = Math.floor(h * dpr);
  if (bgCanvas.width !== tw || bgCanvas.height !== th) {
    bgCanvas.width = tw;
    bgCanvas.height = th;
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function drawBackground() {
  if (!bgCanvas || !bgCtx) return;
  const now = performance.now();
  const minInterval = now < bgFastUntil ? 16 : 33;
  if (now - lastBgDraw < minInterval) {
    bgRAF = requestAnimationFrame(drawBackground);
    return;
  }
  lastBgDraw = now;
  resizeBG();
  const w = bgCanvas.clientWidth || stage.clientWidth;
  const h = bgCanvas.clientHeight || stage.clientHeight;
  bgCtx.fillStyle = '#0a0a0a';
  bgCtx.fillRect(0, 0, w, h);
  const time = now * 0.0002;
  const cx = w * 0.5;
  const cy = h * 0.5;
  const a1 = Math.min(w, h) * 0.35;
  const a2 = Math.min(w, h) * 0.28;
  const x1 = cx + Math.cos(time) * a1;
  const y1 = cy + Math.sin(time * 0.8) * a1 * 0.4;
  const x2 = cx + Math.cos(-time * 0.9 + 1.2) * a2;
  const y2 = cy + Math.sin(-time * 0.7 + 0.7) * a2 * 0.5;
  const r1 = Math.max(w, h) * 0.75;
  const r2 = Math.max(w, h) * 0.65;
  const g1 = bgCtx.createRadialGradient(x1, y1, 0, x1, y1, r1);
  g1.addColorStop(0, `rgba(${gradCurrent.r1},${gradCurrent.g1},${gradCurrent.b1},0.85)`);
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  bgCtx.fillStyle = g1;
  bgCtx.fillRect(0, 0, w, h);
  const g2 = bgCtx.createRadialGradient(x2, y2, 0, x2, y2, r2);
  g2.addColorStop(0, `rgba(${gradCurrent.r2},${gradCurrent.g2},${gradCurrent.b2},0.7)`);
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  bgCtx.fillStyle = g2;
  bgCtx.fillRect(0, 0, w, h);
  bgRAF = requestAnimationFrame(drawBackground);
}

function startBG() {
  if (!bgCanvas || !bgCtx) return;
  if (bgRAF) cancelAnimationFrame(bgRAF);
  bgRAF = requestAnimationFrame(drawBackground);
}

let dragging = false, lastX = 0, lastT = 0, lastDelta = 0, dragDistance = 0, pointerDownTarget = null;

stage.addEventListener('wheel', (e) => {
  if (isEntering) return;
  e.preventDefault();
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  vX += delta * WHEEL_SENS * 20;
}, { passive: false });

stage.addEventListener('dragstart', (e) => e.preventDefault());

stage.addEventListener('pointerdown', (e) => {
  if (isEntering) return;
  dragging = true;
  dragDistance = 0;
  pointerDownTarget = e.target.closest('.card');
  lastX = e.clientX;
  lastT = performance.now();
  lastDelta = 0;
  stage.setPointerCapture(e.pointerId);
  stage.classList.add('dragging');
});

stage.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const now = performance.now();
  const dx = e.clientX - lastX;
  const dt = Math.max(1, now - lastT) / 1000;
  SCROLL_X = mod(SCROLL_X - dx * DRAG_SENS, TRACK);
  lastDelta = dx / dt;
  lastX = e.clientX;
  lastT = now;
});

stage.addEventListener('pointerup', (e) => {
  if (!dragging) return;
  const wasClick = dragDistance < 12;
  dragging = false;
  stage.releasePointerCapture(e.pointerId);
  vX = -lastDelta * DRAG_SENS;
  stage.classList.remove('dragging');

  if (wasClick && pointerDownTarget) {
    const idx = items.findIndex((it) => it.el === pointerDownTarget);
    if (idx >= 0 && HEADER_IMAGES[idx]) {
      openLightbox(HEADER_IMAGES[idx]);
    }
  }
  pointerDownTarget = null;
});

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

function openLightbox(src) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = 'Full size view';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

lightbox?.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox?.classList.contains('is-open')) closeLightbox();
});

window.addEventListener('resize', () => {
  clearTimeout(window._resizeT);
  window._resizeT = setTimeout(() => {
    const prevStep = STEP || 1;
    const ratio = SCROLL_X / (items.length * prevStep);
    measure();
    VW_HALF = window.innerWidth * 0.5;
    SCROLL_X = mod(ratio * TRACK, TRACK);
    updateCarouselTransforms();
    resizeBG();
  }, 80);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (bgRAF) cancelAnimationFrame(bgRAF);
    bgRAF = null;
  } else {
    startCarousel();
    startBG();
  }
});

async function animateEntry(visibleCards) {
  await new Promise((r) => requestAnimationFrame(r));
  const tl = gsap.timeline();
  visibleCards.forEach(({ item, screenX }, idx) => {
    const state = { p: 0 };
    const { ry, tz, scale: baseScale } = computeTransformComponents(screenX);
    const START_SCALE = 0.92;
    const START_Y = 40;
    item.el.style.opacity = '0';
    item.el.style.transform = `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${START_SCALE}) translateY(${START_Y}px)`;
    tl.to(state, {
      p: 1,
      duration: 0.6,
      ease: 'power3.out',
      onUpdate: () => {
        const t = state.p;
        const currentScale = START_SCALE + (baseScale - START_SCALE) * t;
        const currentY = START_Y * (1 - t);
        item.el.style.opacity = t.toFixed(3);
        if (t >= 0.999) {
          item.el.style.transform = transformForScreenX(screenX).transform;
        } else {
          item.el.style.transform = `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${currentScale}) translateY(${currentY}px)`;
        }
      },
    }, idx * 0.05);
  });
  await new Promise((resolve) => { tl.eventCallback('onComplete', resolve); });
}

async function init() {
  createCards();
  measure();
  updateCarouselTransforms();
  stage.classList.add('carousel-mode');

  const half = TRACK / 2;
  let closestIdx = 0;
  let closestDist = Infinity;
  for (let i = 0; i < items.length; i++) {
    let pos = items[i].x - SCROLL_X;
    if (pos < -half) pos += TRACK;
    if (pos > half) pos -= TRACK;
    const d = Math.abs(pos);
    if (d < closestDist) { closestDist = d; closestIdx = i; }
  }
  setActiveGradient(closestIdx);

  resizeBG();
  if (bgCtx) {
    const w = bgCanvas.clientWidth || stage.clientWidth;
    const h = bgCanvas.clientHeight || stage.clientHeight;
    bgCtx.fillStyle = '#0a0a0a';
    bgCtx.fillRect(0, 0, w, h);
  }

  startBG();
  await new Promise((r) => setTimeout(r, 150));

  const viewportWidth = window.innerWidth;
  const visibleCards = [];
  for (let i = 0; i < items.length; i++) {
    let pos = items[i].x - SCROLL_X;
    if (pos < -half) pos += TRACK;
    if (pos > half) pos -= TRACK;
    const screenX = pos;
    if (Math.abs(screenX) < viewportWidth * 0.6) {
      visibleCards.push({ item: items[i], screenX, index: i });
    }
  }
  visibleCards.sort((a, b) => a.screenX - b.screenX);

  if (loader) loader.classList.add('loader--hide');
  await animateEntry(visibleCards);
  isEntering = false;
  startCarousel();
}

init();
