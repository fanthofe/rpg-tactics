// Procedural wolf sprites — Kael, Sûra, Vael
// Each spritesheet: 5 frames × 80×80 px
// Frames: [0] idle-A  [1] idle-B  [2] attack-A  [3] attack-B  [4] defend

const FW = 80;
const FH = 80;

function makeCanvas(frames) {
  const c = document.createElement('canvas');
  c.width  = FW * frames;
  c.height = FH;
  return c;
}

function poly(ctx, pts, fill, stroke = '#000', sw = 1.5) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (sw > 0) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

function circ(ctx, cx, cy, r, fill, stroke = '#000', sw = 1.5) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (sw > 0) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

// ── Core wolf drawing ─────────────────────────────────────────────────────────
// Wolf faces RIGHT (enemies are to the right).
// ox, oy = top-left of the 80×80 frame.
// opts:
//   bob      — head vertical offset (positive = up)
//   lungeX   — head horizontal offset (positive = right)
//   crouch   — body/legs crouch amount (positive = lower body)
//   jawOpen  — jaw gap in pixels (0 = closed)

function drawWolf(ctx, ox, oy, p, opts = {}) {
  const { bob = 0, lungeX = 0, crouch = 0, jawOpen = 0 } = opts;

  const bx = ox + 30; // body center X
  const by = oy + 52 - crouch; // body center Y

  // ── TAIL ─────────────────────────────────────────────────────────────────
  ctx.save();
  ctx.strokeStyle = p.body;
  ctx.lineWidth   = 7;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(bx - 14, by - 6);
  ctx.quadraticCurveTo(bx - 30, by - 22, bx - 20, by - 36 + bob * 0.4);
  ctx.stroke();
  // Tail tip highlight
  ctx.strokeStyle = p.earInner;
  ctx.lineWidth   = 3;
  ctx.beginPath();
  ctx.moveTo(bx - 25, by - 30 + bob * 0.4);
  ctx.quadraticCurveTo(bx - 30, by - 28, bx - 20, by - 36 + bob * 0.4);
  ctx.stroke();
  ctx.restore();

  // ── BACK LEGS ────────────────────────────────────────────────────────────
  const legH = 15 - crouch;
  // right back leg (behind)
  ctx.fillStyle = p.legDark;
  ctx.fillRect(bx - 16, by + 10, 7, legH);
  ctx.fillStyle = p.paw;
  ctx.fillRect(bx - 17, by + 10 + legH, 10, 4);
  // left back leg
  ctx.fillStyle = p.leg;
  ctx.fillRect(bx - 8, by + 11, 6, legH - 1);
  ctx.fillStyle = p.paw;
  ctx.fillRect(bx - 9, by + 10 + legH, 9, 4);

  // ── BODY ─────────────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.ellipse(bx, by, 20, 13, -0.08, 0, Math.PI * 2);
  ctx.fillStyle   = p.body;
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  // Charcoal bands (Kael)
  if (p.bands) {
    ctx.save();
    ctx.strokeStyle = p.bands;
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    for (const dx of [-6, 4]) {
      ctx.beginPath();
      ctx.moveTo(bx + dx, by - 11);
      ctx.lineTo(bx + dx, by + 11);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Rust highlights (Sûra — body patches)
  if (p.rustPatch) {
    ctx.save();
    ctx.fillStyle = p.rustPatch;
    ctx.beginPath();
    ctx.ellipse(bx - 4, by - 4, 6, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── FRONT LEGS ───────────────────────────────────────────────────────────
  ctx.fillStyle = p.legDark;
  ctx.fillRect(bx + 8, by + 10, 7, legH);
  ctx.fillStyle = p.paw;
  ctx.fillRect(bx + 7, by + 10 + legH, 10, 4);
  ctx.fillStyle = p.leg;
  ctx.fillRect(bx + 15, by + 11, 6, legH - 1);
  ctx.fillStyle = p.paw;
  ctx.fillRect(bx + 14, by + 10 + legH, 9, 4);

  // ── NECK ─────────────────────────────────────────────────────────────────
  poly(ctx, [
    [bx + 11, by - 11],
    [bx + 20, by - 3],
    [bx + 18, by + 5],
    [bx + 9,  by + 1],
  ], p.body, '#111', 1);

  // ── HEAD ─────────────────────────────────────────────────────────────────
  const hx = ox + 56 + lungeX;
  const hy = oy + 40 - bob - crouch * 0.4;

  circ(ctx, hx, hy, 13, p.head, '#111', 1.5);

  // ── EARS ─────────────────────────────────────────────────────────────────
  poly(ctx, [[hx - 4, hy - 9], [hx + 1, hy - 22], [hx + 7, hy - 9]], p.ear,      '#111', 1);
  poly(ctx, [[hx - 2, hy - 10],[hx + 1, hy - 18], [hx + 5, hy - 10]], p.earInner, null,  0);
  poly(ctx, [[hx + 5, hy - 9], [hx + 10, hy - 21],[hx + 16, hy - 9]], p.ear,      '#111', 1);
  poly(ctx, [[hx + 7, hy - 10],[hx + 10, hy - 17],[hx + 14, hy - 10]], p.earInner, null,  0);

  // ── SNOUT ────────────────────────────────────────────────────────────────
  const jy = jawOpen > 0 ? -jawOpen * 0.4 : 0;
  // Upper jaw
  ctx.fillStyle   = p.snout;
  ctx.beginPath();
  ctx.roundRect(hx + 8, hy - 3 + jy, 16, 7, 3);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth   = 1;
  ctx.stroke();
  // Lower jaw (open only)
  if (jawOpen > 0) {
    ctx.fillStyle = p.snout;
    ctx.beginPath();
    ctx.roundRect(hx + 9, hy + 4 + jawOpen * 0.3, 13, 5, 2);
    ctx.fill();
    ctx.stroke();
    // teeth
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(hx + 11, hy + 4, 3, 2);
    ctx.fillRect(hx + 17, hy + 4, 3, 2);
    // Tongue hint
    ctx.fillStyle = '#E07070';
    ctx.beginPath();
    ctx.ellipse(hx + 15, hy + 7 + jawOpen * 0.2, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── NOSE ─────────────────────────────────────────────────────────────────
  circ(ctx, hx + 23, hy + 1 + jy, 3, p.nose, '#000', 1);
  // Nose shine
  ctx.fillStyle = '#FFFFFF44';
  ctx.beginPath();
  ctx.arc(hx + 22, hy, 1, 0, Math.PI * 2);
  ctx.fill();

  // ── EYES ─────────────────────────────────────────────────────────────────
  // Right eye (near side)
  circ(ctx, hx + 4, hy - 1, 3.5, p.eyeRight, '#111', 1);
  circ(ctx, hx + 5, hy - 1, 1.8, '#000', null, 0);
  ctx.fillStyle = '#FFFFFF55';
  ctx.beginPath();
  ctx.arc(hx + 3, hy - 2, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Left eye (far side, slightly smaller)
  circ(ctx, hx + 9, hy - 2, 3, p.eyeLeft, '#111', 1);
  circ(ctx, hx + 10, hy - 2, 1.5, '#000', null, 0);

  // Vael heterochromia glow on left eye
  if (p.eyeLeftGlow) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    circ(ctx, hx + 9, hy - 2, 5, p.eyeLeftGlow, null, 0);
    ctx.restore();
  }
}

// ── Per-wolf palette factories ────────────────────────────────────────────────

function kaelPalette() {
  return {
    body: '#E0E0E0', head: '#D8D8D8', snout: '#C4C4C4',
    leg: '#CCCCCC', legDark: '#B0B0B0', paw: '#909090',
    ear: '#CCCCCC', earInner: '#E8A8A8',
    nose: '#1A1A1A', bands: '#242424',
    eyeRight: '#F59E0B', eyeLeft: '#F59E0B',
    rustPatch: null, eyeLeftGlow: null,
  };
}

function suraPalette() {
  return {
    body: '#1E1E1E', head: '#242424', snout: '#2C2C2C',
    leg: '#1A1A1A', legDark: '#141414', paw: '#0E0E0E',
    ear: '#1C1C1C', earInner: '#7C3509',
    nose: '#080808', bands: null,
    eyeRight: '#D97706', eyeLeft: '#D97706',
    rustPatch: '#4A2008', eyeLeftGlow: null,
  };
}

function vaelPalette() {
  return {
    body: '#9CA3AF', head: '#9FA6B2', snout: '#8B9099',
    leg: '#878E97', legDark: '#707880', paw: '#606870',
    ear: '#9CA3AF', earInner: '#B8A898',
    nose: '#1A1A1A', bands: null,
    eyeRight: '#F59E0B', eyeLeft: '#D1D5DB',
    rustPatch: null, eyeLeftGlow: '#C4B5FD',
  };
}

// ── Spritesheet builders ──────────────────────────────────────────────────────

function buildWolfSheet(palette) {
  const c   = makeCanvas(5);
  const ctx = c.getContext('2d');

  // [0] idle-A — neutral standing
  drawWolf(ctx, 0, 0, palette);

  // [1] idle-B — subtle breath (head 2px up, tail tip up)
  drawWolf(ctx, FW, 0, palette, { bob: 2 });

  // [2] attack-A — lunge forward
  drawWolf(ctx, FW * 2, 0, palette, { lungeX: 6, bob: 2 });

  // [3] attack-B — jaw snapping
  drawWolf(ctx, FW * 3, 0, palette, { lungeX: 8, bob: 3, jawOpen: 5 });

  // [4] defend — crouched, head down
  drawWolf(ctx, FW * 4, 0, palette, { crouch: 6, bob: -3 });

  return { canvas: c, frameWidth: FW, frameHeight: FH };
}

export function createKaelSheet() { return buildWolfSheet(kaelPalette()); }
export function createSuraSheet()  { return buildWolfSheet(suraPalette()); }
export function createVaelSheet()  { return buildWolfSheet(vaelPalette()); }
