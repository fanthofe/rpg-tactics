// Arcane Knight vs Shadow Demon — dark fantasy / arcade redesign

const HERO_FW = 72;
const HERO_FH = 96;
const GOB_FW  = 72;
const GOB_FH  = 84;
const SW  = 2;
const OC  = '#000000';

function makeCanvas(frames, fw, fh) {
  const c = document.createElement('canvas');
  c.width  = fw * frames;
  c.height = fh;
  return c;
}

function rrPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

function box(ctx, x, y, w, h, r, fill, stroke = OC, sw = SW) {
  rrPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (sw > 0) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

function circ(ctx, cx, cy, r, fill, stroke = OC, sw = SW) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (sw > 0) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

function poly(ctx, pts, fill, stroke = OC, sw = SW) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (sw > 0) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

function fillR(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ─── HERO — The Arcane Knight ─────────────────────────────────────────────────

const HC = {
  armorDark:   '#0c0620',
  armorMid:    '#130930',
  armorDeep:   '#080414',
  trim:        '#7C3AED',
  trimBright:  '#A78BFA',
  trimDark:    '#4C1D95',
  ridge:       '#1a0a3a',
  capeOuter:   '#08031a',
  capeInner:   '#120828',
  visorBg:     '#000a18',
  visorGlow:   '#00CCFF',
  visorMid:    '#0088BB',
  eyeOuter:    '#00AADD',
  eyeInner:    '#00E5FF',
  eyeHot:      '#AAEEFF',
  blade:       '#90C4FF',
  bladeEdge:   '#D8EEFF',
  bladeGlow:   '#0066CC',
  guard:       '#7C3AED',
  guardBright: '#A78BFA',
  handle:      '#3a0a6a',
  pommel:      '#5C1A9E',
  boots:       '#06000f',
  bootTrim:    '#180a30',
};

function drawHero(ctx, ox, oy, {
  bodyDY = 0,
  legLY = 0, legRY = 0,
  swordPos = 'normal',
  healGlow = 0,
  shieldGlow = 0,
} = {}) {
  const b = bodyDY;

  // ── CAPE (drawn first, behind body) ──
  poly(ctx, [
    [ox+11, oy+36+b], [ox+2,  oy+78+b], [ox+18, oy+70+b],
  ], HC.capeOuter, HC.armorDeep, 1.5);
  poly(ctx, [
    [ox+61, oy+36+b], [ox+70, oy+78+b], [ox+54, oy+70+b],
  ], HC.capeOuter, HC.armorDeep, 1.5);
  // Cape inner sheen
  poly(ctx, [
    [ox+12, oy+38+b], [ox+5,  oy+72+b], [ox+16, oy+66+b],
  ], HC.capeInner, HC.capeInner, 0);
  poly(ctx, [
    [ox+60, oy+38+b], [ox+67, oy+72+b], [ox+56, oy+66+b],
  ], HC.capeInner, HC.capeInner, 0);

  // ── SHOULDER PADS ──
  box(ctx, ox+3,  oy+30+b, 14, 14, 4, HC.armorMid);
  box(ctx, ox+55, oy+30+b, 14, 14, 4, HC.armorMid);
  // Shoulder top trim (neon)
  box(ctx, ox+3,  oy+30+b, 14, 4, 2, HC.trim,  HC.trim,       1);
  box(ctx, ox+55, oy+30+b, 14, 4, 2, HC.trim,  HC.trim,       1);
  // Shoulder spike nub
  poly(ctx, [[ox+10,oy+28+b],[ox+7,oy+22+b],[ox+13,oy+28+b]], HC.trimDark);
  poly(ctx, [[ox+62,oy+28+b],[ox+59,oy+22+b],[ox+65,oy+28+b]], HC.trimDark);

  // ── BODY ──
  box(ctx, ox+10, oy+34+b, 44, 34, 5, HC.armorMid);
  // Chest segmentation lines
  box(ctx, ox+12, oy+46+b, 40, 3, 1, HC.ridge, HC.ridge, 0);
  box(ctx, ox+12, oy+54+b, 40, 3, 1, HC.ridge, HC.ridge, 0);
  // Center energy line
  ctx.save();
  ctx.shadowColor = HC.trim;
  ctx.shadowBlur  = 6;
  box(ctx, ox+33, oy+36+b, 6, 28, 2, HC.trim, HC.trimBright, 1);
  ctx.restore();
  // Trim dots on center line
  circ(ctx, ox+36, oy+40+b, 2, HC.trimBright, HC.trimBright, 0);
  circ(ctx, ox+36, oy+50+b, 2, HC.trimBright, HC.trimBright, 0);
  circ(ctx, ox+36, oy+60+b, 2, HC.trimBright, HC.trimBright, 0);

  // ── ARMS ──
  box(ctx, ox+1,  oy+42+b, 10, 22, 3, HC.armorDark);
  box(ctx, ox+61, oy+42+b, 10, 22, 3, HC.armorDark);
  // Gauntlets
  box(ctx, ox+0,  oy+60+b, 12, 8, 3, HC.armorDeep);
  box(ctx, ox+60, oy+60+b, 12, 8, 3, HC.armorDeep);
  // Gauntlet trim
  box(ctx, ox+0,  oy+60+b, 12, 2, 1, HC.trimDark, HC.trimDark, 0);
  box(ctx, ox+60, oy+60+b, 12, 2, 1, HC.trimDark, HC.trimDark, 0);

  // ── SWORD ──
  if (swordPos === 'normal') {
    // Blade glow aura
    ctx.save(); ctx.globalAlpha = 0.18;
    ctx.fillStyle = HC.bladeGlow;
    rrPath(ctx, ox+60, oy+4+b, 14, 36, 5); ctx.fill();
    ctx.restore();
    // Blade with glow
    ctx.save();
    ctx.shadowColor = HC.bladeGlow;
    ctx.shadowBlur  = 8;
    box(ctx, ox+64, oy+6+b, 5, 34, 2, HC.blade, HC.bladeEdge, 1);
    ctx.restore();
    // Blade bright edge
    fillR(ctx, ox+65, oy+6+b, 2, 34, HC.bladeEdge);
    // Guard
    box(ctx, ox+58, oy+28+b, 16, 6, 3, HC.guard, HC.guardBright, 1.5);
    circ(ctx, ox+66, oy+31+b, 3, HC.guardBright, HC.guardBright, 0);
    // Handle
    box(ctx, ox+63, oy+34+b, 5, 12, 2, HC.handle);
    // Pommel
    circ(ctx, ox+65, oy+47+b, 4, HC.pommel, HC.trim, 1.5);
  } else if (swordPos === 'raised') {
    ctx.save(); ctx.globalAlpha = 0.18;
    ctx.fillStyle = HC.bladeGlow;
    rrPath(ctx, ox+59, oy+0, 14, 34, 5); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.shadowColor = HC.bladeGlow;
    ctx.shadowBlur  = 8;
    box(ctx, ox+62, oy+0,  5, 32, 2, HC.blade, HC.bladeEdge, 1);
    ctx.restore();
    fillR(ctx, ox+63, oy+0, 2, 32, HC.bladeEdge);
    box(ctx, ox+57, oy+22, 16, 6, 3, HC.guard, HC.guardBright, 1.5);
    box(ctx, ox+62, oy+28, 5,  12, 2, HC.handle);
    circ(ctx, ox+64, oy+41, 4, HC.pommel, HC.trim, 1.5);
  } else if (swordPos === 'extended') {
    ctx.save(); ctx.globalAlpha = 0.18;
    ctx.fillStyle = HC.bladeGlow;
    rrPath(ctx, ox+54, oy+32+b, 20, 12, 4); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.shadowColor = HC.bladeGlow;
    ctx.shadowBlur  = 8;
    box(ctx, ox+55, oy+34+b, 20, 5, 2, HC.blade, HC.bladeEdge, 1);
    ctx.restore();
    box(ctx, ox+52, oy+30+b,  6, 15, 3, HC.guard, HC.guardBright, 1.5);
    box(ctx, ox+54, oy+41+b,  5, 12, 2, HC.handle);
  } else if (swordPos === 'down') {
    ctx.save(); ctx.globalAlpha = 0.18;
    ctx.fillStyle = HC.bladeGlow;
    rrPath(ctx, ox+60, oy+34+b, 14, 36, 5); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.shadowColor = HC.bladeGlow;
    ctx.shadowBlur  = 8;
    box(ctx, ox+64, oy+36+b, 5, 34, 2, HC.blade, HC.bladeEdge, 1);
    ctx.restore();
    fillR(ctx, ox+65, oy+36+b, 2, 34, HC.bladeEdge);
    box(ctx, ox+58, oy+40+b, 16, 6, 3, HC.guard, HC.guardBright, 1.5);
    box(ctx, ox+63, oy+46+b,  5, 12, 2, HC.handle);
    circ(ctx, ox+65, oy+59+b,  4, HC.pommel, HC.trim, 1.5);
  }

  // ── HEAD / HELMET ──
  // Helmet flanges
  box(ctx, ox+8,  oy+8+b,  10, 20, 3, HC.armorDeep);
  box(ctx, ox+54, oy+8+b,  10, 20, 3, HC.armorDeep);
  // Main helmet dome
  box(ctx, ox+12, oy+2+b,  44, 30, 7, HC.armorDark);
  // Top crest ridge
  box(ctx, ox+32, oy+2+b,  8, 14, 2, HC.ridge, HC.ridge, 0);
  box(ctx, ox+34, oy+2+b,  4, 14, 1, HC.trimDark, HC.trimDark, 0);
  // Lower jaw piece
  box(ctx, ox+14, oy+26+b, 40, 8, 3, HC.armorDeep);

  // ── VISOR ──
  // Background slit
  box(ctx, ox+14, oy+12+b, 40, 14, 3, HC.visorBg);
  // Outer visor glow (wide dim halo)
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle   = HC.visorMid;
  rrPath(ctx, ox+14, oy+12+b, 40, 14, 3); ctx.fill();
  ctx.restore();
  // Inner visor strip
  box(ctx, ox+16, oy+14+b, 36, 10, 2, '#001a2e', HC.visorMid, 1);

  // Left eye glow
  ctx.save();
  ctx.shadowColor = HC.visorGlow;
  ctx.shadowBlur  = 10;
  circ(ctx, ox+27, oy+19+b, 5, HC.eyeOuter,  HC.eyeOuter,  0);
  ctx.restore();
  circ(ctx, ox+27, oy+19+b, 3, HC.eyeInner,  HC.eyeInner,  0);
  circ(ctx, ox+27, oy+19+b, 1, HC.eyeHot,    HC.eyeHot,    0);

  // Right eye glow
  ctx.save();
  ctx.shadowColor = HC.visorGlow;
  ctx.shadowBlur  = 10;
  circ(ctx, ox+45, oy+19+b, 5, HC.eyeOuter,  HC.eyeOuter,  0);
  ctx.restore();
  circ(ctx, ox+45, oy+19+b, 3, HC.eyeInner,  HC.eyeInner,  0);
  circ(ctx, ox+45, oy+19+b, 1, HC.eyeHot,    HC.eyeHot,    0);

  // Visor border
  rrPath(ctx, ox+14, oy+12+b, 40, 14, 3);
  ctx.strokeStyle = HC.visorMid;
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  // ── LEGS ──
  const llY = oy + 68 + legLY;
  const rlY = oy + 68 + legRY;
  box(ctx, ox+13, llY, 18, 20, 4, HC.armorDark);
  box(ctx, ox+41, rlY, 18, 20, 4, HC.armorDark);
  // Knee guards
  ctx.save();
  ctx.shadowColor = HC.trim;
  ctx.shadowBlur  = 4;
  box(ctx, ox+13, llY +  7, 18, 7, 3, HC.trim, HC.trimBright, 1);
  box(ctx, ox+41, rlY +  7, 18, 7, 3, HC.trim, HC.trimBright, 1);
  ctx.restore();

  // ── BOOTS ──
  box(ctx, ox+10, oy+84+legLY, 22, 10, 3, HC.boots);
  box(ctx, ox+40, oy+84+legRY, 22, 10, 3, HC.boots);
  // Boot top trim
  box(ctx, ox+10, oy+84+legLY, 22, 3, 1, HC.bootTrim, HC.bootTrim, 0);
  box(ctx, ox+40, oy+84+legRY, 22, 3, 1, HC.bootTrim, HC.bootTrim, 0);

  // ── HEAL GLOW (green) ──
  if (healGlow > 0) {
    ctx.save();
    ctx.globalAlpha = healGlow * 0.45;
    ctx.fillStyle   = '#00E676';
    ctx.beginPath();
    ctx.arc(ox + 36, oy + 50 + b, 44 * healGlow + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── SHIELD GLOW (arcane purple) ──
  if (shieldGlow > 0) {
    ctx.save();
    const cx = ox + 36, cy = oy + 50 + b;
    const r  = 40 * shieldGlow + 22;
    const g  = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
    g.addColorStop(0,   `rgba(124,58,237,${shieldGlow * 0.6})`);
    g.addColorStop(0.6, `rgba(76,29,149,${shieldGlow * 0.3})`);
    g.addColorStop(1,   'rgba(76,29,149,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = shieldGlow * 0.9;
    ctx.shadowColor = HC.trim;
    ctx.shadowBlur  = 12;
    ctx.strokeStyle = HC.trimBright;
    ctx.lineWidth   = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

export function createHeroIdleSheet() {
  const frames = 4;
  const c = makeCanvas(frames, HERO_FW, HERO_FH);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [{ bodyDY:0 },{ bodyDY:1 },{ bodyDY:0 },{ bodyDY:1 }]
    .forEach((cfg, i) => drawHero(ctx, i * HERO_FW, 0, cfg));
  return { canvas: c, frameWidth: HERO_FW, frameHeight: HERO_FH, frameCount: frames };
}

export function createHeroWalkSheet() {
  const frames = 4;
  const c = makeCanvas(frames, HERO_FW, HERO_FH);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [{ legLY:3, legRY:-3 },{ legLY:0, legRY:0 },{ legLY:-3, legRY:3 },{ legLY:0, legRY:0 }]
    .forEach((cfg, i) => drawHero(ctx, i * HERO_FW, 0, cfg));
  return { canvas: c, frameWidth: HERO_FW, frameHeight: HERO_FH, frameCount: frames };
}

export function createHeroAttackSheet() {
  const frames = 5;
  const c = makeCanvas(frames, HERO_FW, HERO_FH);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [
    { swordPos:'raised',   bodyDY: 0 },
    { swordPos:'raised',   bodyDY:-2 },
    { swordPos:'normal',   bodyDY: 0 },
    { swordPos:'extended', bodyDY: 0 },
    { swordPos:'down',     bodyDY: 2 },
  ].forEach((cfg, i) => drawHero(ctx, i * HERO_FW, 0, cfg));
  return { canvas: c, frameWidth: HERO_FW, frameHeight: HERO_FH, frameCount: frames };
}

export function createHeroHealSheet() {
  const frames = 4;
  const c = makeCanvas(frames, HERO_FW, HERO_FH);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [0.2, 0.6, 1.0, 0.4].forEach((glow, i) =>
    drawHero(ctx, i * HERO_FW, 0, { swordPos: 'raised', healGlow: glow })
  );
  return { canvas: c, frameWidth: HERO_FW, frameHeight: HERO_FH, frameCount: frames };
}

export function createHeroShieldSheet() {
  const frames = 4;
  const c = makeCanvas(frames, HERO_FW, HERO_FH);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [0.25, 0.6, 1.0, 0.75].forEach((glow, i) =>
    drawHero(ctx, i * HERO_FW, 0, { swordPos: 'normal', shieldGlow: glow })
  );
  return { canvas: c, frameWidth: HERO_FW, frameHeight: HERO_FH, frameCount: frames };
}

// ─── GOBLIN — The Shadow Demon ────────────────────────────────────────────────

const GC = {
  skin:       '#1e0e06',
  skinLight:  '#3a1c0a',
  skinHigh:   '#522810',
  horn:       '#0c0804',
  hornLight:  '#201408',
  ear:        '#160a04',
  earInner:   '#2a1208',
  browColor:  '#080404',
  eyeBg:      '#080202',
  eyeRed:     '#FF3300',
  eyeOrange:  '#FF7700',
  eyeYellow:  '#FFAA00',
  toothColor: '#C8B880',
  body:       '#160a04',
  bodyLight:  '#2e1808',
  arm:        '#1e0e06',
  club:       '#1e1810',
  clubLight:  '#342e20',
  spike:      '#B8A068',
  nail:       '#FF4400',
  shield:     '#0a0820',
  shieldAccent: '#6D28D9',
};

function drawGoblin(ctx, ox, oy, {
  bodyDY = 0,
  legLY = 0, legRY = 0,
  armPos = 'normal',
  defending = false,
} = {}) {
  const b = bodyDY;

  // ── HORNS (behind head) ──
  // Left horn
  poly(ctx, [
    [ox+18, oy+6+b],
    [ox+15, oy+0+b],
    [ox+23, oy+0+b],
    [ox+26, oy+8+b],
  ], GC.horn, '#000000', 1.5);
  fillR(ctx, ox+18, oy+1+b, 3, 6, GC.hornLight);

  // Right horn
  poly(ctx, [
    [ox+54, oy+6+b],
    [ox+57, oy+0+b],
    [ox+49, oy+0+b],
    [ox+46, oy+8+b],
  ], GC.horn, '#000000', 1.5);
  fillR(ctx, ox+51, oy+1+b, 3, 6, GC.hornLight);

  // ── EARS ──
  poly(ctx, [[ox+4,oy+28+b],[ox+10,oy+6+b],[ox+22,oy+28+b]], GC.ear,      '#000000', 1.5);
  poly(ctx, [[ox+8,oy+26+b],[ox+14,oy+10+b],[ox+20,oy+26+b]], GC.earInner, GC.earInner, 0);
  poly(ctx, [[ox+68,oy+28+b],[ox+62,oy+6+b],[ox+50,oy+28+b]], GC.ear,      '#000000', 1.5);
  poly(ctx, [[ox+64,oy+26+b],[ox+58,oy+10+b],[ox+52,oy+26+b]], GC.earInner, GC.earInner, 0);

  // ── HEAD ──
  box(ctx, ox+10, oy+4+b, 52, 40, 8, GC.skin);
  // Cheekbone highlights
  box(ctx, ox+11, oy+18+b, 14, 14, 6, GC.skinHigh, GC.skinHigh, 0);
  box(ctx, ox+47, oy+18+b, 14, 14, 6, GC.skinHigh, GC.skinHigh, 0);

  // ── BROWS (angry V-shape) ──
  poly(ctx, [
    [ox+12, oy+15+b], [ox+30, oy+11+b],
    [ox+30, oy+16+b], [ox+12, oy+21+b],
  ], GC.browColor, '#000000', 1.5);
  poly(ctx, [
    [ox+60, oy+15+b], [ox+42, oy+11+b],
    [ox+42, oy+16+b], [ox+60, oy+21+b],
  ], GC.browColor, '#000000', 1.5);

  // ── EYES ──
  // Glow halo behind eyes
  ctx.save();
  ctx.shadowColor = GC.eyeOrange;
  ctx.shadowBlur  = 12;
  circ(ctx, ox+26, oy+28+b, 9, GC.eyeBg, '#000000', 1.5);
  circ(ctx, ox+46, oy+28+b, 9, GC.eyeBg, '#000000', 1.5);
  ctx.restore();
  // Iris layers (right eye)
  circ(ctx, ox+26, oy+28+b, 6, GC.eyeRed,    GC.eyeRed,    0);
  circ(ctx, ox+26, oy+28+b, 3, GC.eyeOrange, GC.eyeOrange, 0);
  circ(ctx, ox+26, oy+28+b, 1, GC.eyeYellow, GC.eyeYellow, 0);
  // Left eye
  circ(ctx, ox+46, oy+28+b, 6, GC.eyeRed,    GC.eyeRed,    0);
  circ(ctx, ox+46, oy+28+b, 3, GC.eyeOrange, GC.eyeOrange, 0);
  circ(ctx, ox+46, oy+28+b, 1, GC.eyeYellow, GC.eyeYellow, 0);

  // ── JAW / TEETH ──
  // Lower jaw protrudes
  box(ctx, ox+14, oy+36+b, 44, 14, 5, GC.skinLight);
  // Dark mouth cavity
  box(ctx, ox+18, oy+39+b, 36, 8,  3, '#0a0404');
  // Left fang (long)
  poly(ctx, [
    [ox+20, oy+39+b], [ox+20, oy+51+b],
    [ox+28, oy+48+b], [ox+28, oy+39+b],
  ], GC.toothColor, '#000000', 1);
  // Right fang (long)
  poly(ctx, [
    [ox+52, oy+39+b], [ox+52, oy+51+b],
    [ox+44, oy+48+b], [ox+44, oy+39+b],
  ], GC.toothColor, '#000000', 1);
  // Middle shorter teeth
  box(ctx, ox+31, oy+39+b, 7, 8,  1, GC.toothColor, '#000000', 1);
  box(ctx, ox+40, oy+39+b, 6, 6,  1, GC.toothColor, '#000000', 1);

  // ── BODY ──
  box(ctx, ox+12, oy+48+b, 48, 26, 6, GC.body);
  box(ctx, ox+20, oy+54+b, 32, 14, 5, GC.bodyLight);
  // War-scratch marks (red lines)
  ctx.save();
  ctx.strokeStyle = '#880800';
  ctx.lineWidth   = 1.5;
  ctx.globalAlpha = 0.75;
  ctx.beginPath(); ctx.moveTo(ox+26, oy+50+b); ctx.lineTo(ox+36, oy+62+b); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox+32, oy+50+b); ctx.lineTo(ox+42, oy+62+b); ctx.stroke();
  ctx.restore();

  // ── WEAPON / ARMS ──
  if (defending) {
    // Arms crossed
    box(ctx, ox+3,  oy+48+b, 12, 26, 4, GC.arm);
    box(ctx, ox+57, oy+48+b, 12, 26, 4, GC.arm);
    // Dark runic shield
    box(ctx, ox+16, oy+44+b, 40, 32, 6, GC.shield);
    box(ctx, ox+20, oy+48+b, 32, 24, 4, '#14082e');
    // Shield arcane rune (X-cross in purple)
    ctx.save();
    ctx.shadowColor = GC.shieldAccent;
    ctx.shadowBlur  = 6;
    ctx.strokeStyle = GC.shieldAccent;
    ctx.lineWidth   = 3;
    ctx.beginPath(); ctx.moveTo(ox+22, oy+50+b); ctx.lineTo(ox+50, oy+70+b); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox+50, oy+50+b); ctx.lineTo(ox+22, oy+70+b); ctx.stroke();
    ctx.restore();
    // Shield border glow
    rrPath(ctx, ox+16, oy+44+b, 40, 32, 6);
    ctx.strokeStyle = GC.shieldAccent;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

  } else if (armPos === 'normal') {
    // Left arm + club
    box(ctx, ox+2,  oy+48+b, 12, 26, 4, GC.arm);
    box(ctx, ox+0,  oy+18+b, 10, 34, 4, GC.club, '#000000', 1.5);
    // Club head
    box(ctx, ox+0,  oy+8+b,  16, 18, 5, GC.clubLight, '#000000', 1.5);
    // Top spike
    poly(ctx, [[ox+0,oy+8+b],[ox+8,oy+2+b],[ox+16,oy+8+b]], GC.spike, '#000000', 1);
    // Bone nails on club
    circ(ctx, ox+8, oy+14+b, 3, GC.spike,  '#000000', 1);
    circ(ctx, ox+8, oy+21+b, 3, GC.spike,  '#000000', 1);
    circ(ctx, ox+8, oy+28+b, 3, GC.nail,   '#000000', 1);
    // Right arm
    box(ctx, ox+58, oy+48+b, 12, 26, 4, GC.arm);

  } else if (armPos === 'raised') {
    box(ctx, ox+2,  oy+34+b, 12, 14, 4, GC.arm);
    box(ctx, ox+0,  oy+4+b,  10, 34, 4, GC.club, '#000000', 1.5);
    box(ctx, ox+0,  oy+0+b,  16, 14, 5, GC.clubLight, '#000000', 1.5);
    poly(ctx, [[ox+0,oy+0+b],[ox+8,oy+0+b-5],[ox+16,oy+0+b]], GC.spike, '#000000', 1);
    circ(ctx, ox+8, oy+5+b,  3, GC.spike, '#000000', 1);
    circ(ctx, ox+8, oy+12+b, 3, GC.nail,  '#000000', 1);
    box(ctx, ox+58, oy+48+b, 12, 26, 4, GC.arm);

  } else if (armPos === 'impact') {
    box(ctx, ox+1,  oy+48+b, 12, 22, 4, GC.arm);
    box(ctx, ox+0,  oy+52+b, 10, 22, 4, GC.club, '#000000', 1.5);
    box(ctx, ox+0,  oy+70+b, 16, 14, 5, GC.clubLight, '#000000', 1.5);
    poly(ctx, [[ox+0,oy+80+b],[ox+8,oy+86+b],[ox+16,oy+80+b]], GC.spike, '#000000', 1);
    circ(ctx, ox+8, oy+74+b, 3, GC.nail, '#000000', 1);
    box(ctx, ox+58, oy+48+b, 12, 26, 4, GC.arm);
  }

  // ── LEGS ──
  const llY = oy + 72 + legLY;
  const rlY = oy + 72 + legRY;
  box(ctx, ox+16, llY, 14, 12, 4, '#160a04');
  box(ctx, ox+42, rlY, 14, 12, 4, '#160a04');
  // Clawed feet
  poly(ctx, [
    [ox+12,llY+10],[ox+18,llY+12],[ox+24,llY+10],
    [ox+22,llY+14],[ox+14,llY+14],
  ], '#0e0602', '#000000', 1);
  poly(ctx, [
    [ox+38,rlY+10],[ox+44,rlY+12],[ox+50,rlY+10],
    [ox+48,rlY+14],[ox+40,rlY+14],
  ], '#0e0602', '#000000', 1);
  // Red nail tips
  circ(ctx, ox+14, llY+13, 2, GC.nail, GC.nail, 0);
  circ(ctx, ox+22, llY+13, 2, GC.nail, GC.nail, 0);
  circ(ctx, ox+40, rlY+13, 2, GC.nail, GC.nail, 0);
  circ(ctx, ox+48, rlY+13, 2, GC.nail, GC.nail, 0);
}

export function createGoblinIdleSheet() {
  const frames = 4;
  const c = makeCanvas(frames, GOB_FW, GOB_FH);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [{ bodyDY:0 },{ bodyDY:1 },{ bodyDY:0 },{ bodyDY:1 }]
    .forEach((cfg, i) => drawGoblin(ctx, i * GOB_FW, 0, cfg));
  return { canvas: c, frameWidth: GOB_FW, frameHeight: GOB_FH, frameCount: frames };
}

export function createGoblinWalkSheet() {
  const frames = 4;
  const c = makeCanvas(frames, GOB_FW, GOB_FH);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [{ legLY:3, legRY:-3 },{ legLY:0, legRY:0 },{ legLY:-3, legRY:3 },{ legLY:0, legRY:0 }]
    .forEach((cfg, i) => drawGoblin(ctx, i * GOB_FW, 0, cfg));
  return { canvas: c, frameWidth: GOB_FW, frameHeight: GOB_FH, frameCount: frames };
}

export function createGoblinAttackSheet() {
  const frames = 5;
  const c = makeCanvas(frames, GOB_FW, GOB_FH);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [
    { armPos:'normal' },
    { armPos:'raised' },
    { armPos:'raised', bodyDY:-2 },
    { armPos:'impact' },
    { armPos:'normal', bodyDY:2  },
  ].forEach((cfg, i) => drawGoblin(ctx, i * GOB_FW, 0, cfg));
  return { canvas: c, frameWidth: GOB_FW, frameHeight: GOB_FH, frameCount: frames };
}

export function createGoblinDefendSheet() {
  const frames = 3;
  const c = makeCanvas(frames, GOB_FW, GOB_FH);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawGoblin(ctx, i * GOB_FW, 0, { defending: true });
  return { canvas: c, frameWidth: GOB_FW, frameHeight: GOB_FH, frameCount: frames };
}

// ─── ORC BERSERKER ────────────────────────────────────────────────────────────

const ORC_FW = 72, ORC_FH = 96;

const ORCC = {
  skin:      '#3d4a20', skinDark:  '#2a3418', skinLight: '#526630',
  paint:     '#8B1010',
  iron:      '#2e2e30', ironDark:  '#1a1a1c', ironLight: '#5a5a5e',
  eye:       '#FF3300', eyeOrange: '#FF6600',
  axeShaft:  '#3a2a18',
  axeBlade:  '#3c3c40', axeEdge:   '#a0a0b0', axeBlood: '#8B0000',
  leather:   '#3a2010', tusk:      '#e0d890',
};

function drawOrc(ctx, ox, oy, {
  bodyDY = 0, legLY = 0, legRY = 0,
  axePos = 'normal', defending = false,
} = {}) {
  const b = bodyDY;

  // ── AXEHEAD (left, behind body) ──
  if (!defending) {
    const ay = axePos === 'raised' ? oy+0+b : oy+16+b;
    box(ctx, ox+2,  ay+2,  6, 40, 2, ORCC.axeShaft, '#000000', 1);
    box(ctx, ox+0,  ay,   20, 26, 3, ORCC.axeBlade,  '#000000', 1.5);
    box(ctx, ox+0,  ay,    4, 26, 1, ORCC.axeEdge,   ORCC.axeEdge, 0);
    fillR(ctx, ox+1, ay+12, 3,  8, ORCC.axeBlood);
    if (axePos === 'impact') {
      // Axe swung down
      box(ctx, ox+2, oy+44+b, 6, 28, 2, ORCC.axeShaft, '#000000', 1);
      box(ctx, ox+0, oy+62+b, 20, 18, 3, ORCC.axeBlade, '#000000', 1.5);
      box(ctx, ox+0, oy+62+b,  4, 18, 1, ORCC.axeEdge,  ORCC.axeEdge, 0);
    }
  }

  // ── HORNS ──
  poly(ctx, [[ox+20,oy+10+b],[ox+14,oy+0+b],[ox+24,oy+14+b]], ORCC.ironDark, '#000000', 1);
  poly(ctx, [[ox+52,oy+10+b],[ox+58,oy+0+b],[ox+48,oy+14+b]], ORCC.ironDark, '#000000', 1);

  // ── IRON HELM ──
  box(ctx, ox+16, oy+8+b, 40, 16, 4, ORCC.iron,     '#000000', 1.5);
  box(ctx, ox+16, oy+18+b,40,  5, 1, ORCC.ironDark, '#000000', 1);
  box(ctx, ox+22, oy+20+b,28,  3, 1, ORCC.ironLight, ORCC.ironLight, 0);

  // ── HEAD (lower face visible below helm) ──
  box(ctx, ox+16, oy+22+b, 40, 20, 3, ORCC.skin, '#000000', 1.5);
  // War paint diagonal slashes
  ctx.save();
  ctx.strokeStyle = ORCC.paint; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ox+24,oy+24+b); ctx.lineTo(ox+28,oy+34+b); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox+46,oy+24+b); ctx.lineTo(ox+42,oy+34+b); ctx.stroke();
  ctx.restore();
  // Glowing red eyes
  ctx.save();
  ctx.shadowColor = ORCC.eye; ctx.shadowBlur = 8;
  circ(ctx, ox+26, oy+26+b, 4, ORCC.ironDark, '#000000', 1);
  circ(ctx, ox+46, oy+26+b, 4, ORCC.ironDark, '#000000', 1);
  ctx.restore();
  circ(ctx, ox+26, oy+26+b, 3, ORCC.eye,       ORCC.eye, 0);
  circ(ctx, ox+46, oy+26+b, 3, ORCC.eye,       ORCC.eye, 0);
  circ(ctx, ox+26, oy+26+b, 1, ORCC.eyeOrange, ORCC.eyeOrange, 0);
  circ(ctx, ox+46, oy+26+b, 1, ORCC.eyeOrange, ORCC.eyeOrange, 0);
  // Tusks
  poly(ctx, [[ox+26,oy+38+b],[ox+23,oy+44+b],[ox+29,oy+40+b]], ORCC.tusk, '#000000', 1);
  poly(ctx, [[ox+46,oy+38+b],[ox+49,oy+44+b],[ox+43,oy+40+b]], ORCC.tusk, '#000000', 1);

  // ── NECK ──
  box(ctx, ox+26, oy+40+b, 20, 8, 2, ORCC.skinDark, '#000000', 1);

  // ── MASSIVE TORSO ──
  box(ctx, ox+10, oy+44+b, 52, 34, 5, ORCC.skinDark, '#000000', 1.5);
  // Muscle line
  ctx.save();
  ctx.strokeStyle = ORCC.skinLight; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(ox+36, oy+46+b); ctx.lineTo(ox+36, oy+74+b); ctx.stroke();
  ctx.restore();
  // Tribal X tattoo
  ctx.save();
  ctx.strokeStyle = ORCC.paint; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(ox+18,oy+52+b); ctx.lineTo(ox+34,oy+70+b); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox+34,oy+52+b); ctx.lineTo(ox+18,oy+70+b); ctx.stroke();
  ctx.restore();
  // Iron belt
  box(ctx, ox+10, oy+74+b, 52, 6, 2, ORCC.iron, '#000000', 1.5);

  // ── ARMS ──
  if (defending) {
    box(ctx, ox+0,  oy+44+b, 14, 30, 4, ORCC.skinDark, '#000000', 1.5);
    box(ctx, ox+58, oy+44+b, 14, 30, 4, ORCC.skinDark, '#000000', 1.5);
  } else {
    box(ctx, ox+0,  oy+48+b, 12, 26, 4, ORCC.skinDark, '#000000', 1.5);
    box(ctx, ox+60, oy+48+b, 12, 26, 4, ORCC.skinDark, '#000000', 1.5);
  }
  box(ctx, ox+0,  oy+68+b, 12, 8, 2, ORCC.leather, '#000000', 1);
  box(ctx, ox+60, oy+68+b, 12, 8, 2, ORCC.leather, '#000000', 1);

  // ── LEGS ──
  const llY = oy + 80 + legLY;
  const rlY = oy + 80 + legRY;
  box(ctx, ox+14, llY, 20, 14, 3, ORCC.skinDark, '#000000', 1.5);
  box(ctx, ox+38, rlY, 20, 14, 3, ORCC.skinDark, '#000000', 1.5);
  circ(ctx, ox+24, llY+5, 6, ORCC.iron, '#000000', 1.5);
  circ(ctx, ox+48, rlY+5, 6, ORCC.iron, '#000000', 1.5);
  box(ctx, ox+12, llY+10, 24, 10, 2, ORCC.ironDark, '#000000', 1);
  box(ctx, ox+36, rlY+10, 24, 10, 2, ORCC.ironDark, '#000000', 1);
}

export function createOrcIdleSheet() {
  const frames = 4, c = makeCanvas(frames, ORC_FW, ORC_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,1,0,1].forEach((dy, i) => drawOrc(ctx, i*ORC_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: ORC_FW, frameHeight: ORC_FH, frameCount: frames };
}
export function createOrcWalkSheet() {
  const frames = 4, c = makeCanvas(frames, ORC_FW, ORC_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [{legLY:3,legRY:-3},{},{legLY:-3,legRY:3},{}]
    .forEach((cfg, i) => drawOrc(ctx, i*ORC_FW, 0, cfg));
  return { canvas: c, frameWidth: ORC_FW, frameHeight: ORC_FH, frameCount: frames };
}
export function createOrcAttackSheet() {
  const frames = 5, c = makeCanvas(frames, ORC_FW, ORC_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [
    { axePos:'normal' },
    { axePos:'raised', bodyDY:-2 },
    { axePos:'raised', bodyDY:-3 },
    { axePos:'impact', bodyDY:2  },
    { axePos:'normal', bodyDY:1  },
  ].forEach((cfg, i) => drawOrc(ctx, i*ORC_FW, 0, cfg));
  return { canvas: c, frameWidth: ORC_FW, frameHeight: ORC_FH, frameCount: frames };
}
export function createOrcDefendSheet() {
  const frames = 3, c = makeCanvas(frames, ORC_FW, ORC_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawOrc(ctx, i*ORC_FW, 0, { defending: true });
  return { canvas: c, frameWidth: ORC_FW, frameHeight: ORC_FH, frameCount: frames };
}

// ─── SORCIÈRE DES CENDRES ────────────────────────────────────────────────────

const WIT_FW = 64, WIT_FH = 88;

const WITC = {
  robe:      '#252526', robeDark:  '#141415', robeMid:   '#323234',
  ash:       '#707070', ashLight:  '#909090',
  skin:      '#6a5a48', skinLight: '#8a7a60',
  hair:      '#e8e0d0', hairGrey:  '#b0a898',
  eye:       '#FF6600', eyeCore:   '#FFAA00',
  fire:      '#FF4400', fireBright:'#FFCC00',
  staff:     '#2a1a10', staffDark: '#1a100a',
  orb:       '#FF3300', orbGlow:   '#FF8800',
  skull:     '#c8c0a0',
};

function drawWitch(ctx, ox, oy, {
  bodyDY = 0, staffPos = 'normal', defending = false,
} = {}) {
  const b = bodyDY;

  // ── STAFF (left side) ──
  const staffY = staffPos === 'cast' ? oy+0+b : oy+4+b;
  box(ctx, ox+2, staffY, 5, 70, 2, WITC.staff, WITC.staffDark, 1);
  // Fire orb at top
  ctx.save();
  ctx.shadowColor = WITC.orbGlow; ctx.shadowBlur = 12;
  circ(ctx, ox+4, staffY+4, 8, WITC.orb, '#000000', 1);
  ctx.restore();
  circ(ctx, ox+4, staffY+4, 5, WITC.fire,    WITC.orb, 0);
  circ(ctx, ox+4, staffY+4, 3, WITC.fireBright, WITC.fireBright, 0);
  // Flames above orb
  poly(ctx, [[ox+0,staffY+2],[ox+4,staffY-6],[ox+8,staffY+2]], WITC.fire, WITC.fire, 0);
  poly(ctx, [[ox+1,staffY+1],[ox+4,staffY-4],[ox+7,staffY+1]], WITC.fireBright, WITC.fireBright, 0);

  // ── FLOWING HAIR (drawn behind head) ──
  // Side tufts
  poly(ctx, [[ox+16,oy+12+b],[ox+8, oy+4+b],[ox+20,oy+22+b]], WITC.hairGrey, WITC.hairGrey, 0);
  poly(ctx, [[ox+48,oy+12+b],[ox+56,oy+4+b],[ox+44,oy+22+b]], WITC.hairGrey, WITC.hairGrey, 0);
  // Main hair mass
  box(ctx, ox+14, oy+6+b, 36, 16, 4, WITC.hair, WITC.hairGrey, 1);

  // ── HEAD ──
  box(ctx, ox+18, oy+14+b, 28, 20, 4, WITC.skin, '#000000', 1.5);
  // Sunken eye sockets
  circ(ctx, ox+25, oy+22+b, 5, WITC.robeDark, '#000000', 1);
  circ(ctx, ox+39, oy+22+b, 5, WITC.robeDark, '#000000', 1);
  // Burning eyes with glow
  ctx.save();
  ctx.shadowColor = WITC.eye; ctx.shadowBlur = 10;
  circ(ctx, ox+25, oy+22+b, 3, WITC.eye,  WITC.eye,  0);
  circ(ctx, ox+39, oy+22+b, 3, WITC.eye,  WITC.eye,  0);
  ctx.restore();
  circ(ctx, ox+25, oy+22+b, 1.5, WITC.eyeCore, WITC.eyeCore, 0);
  circ(ctx, ox+39, oy+22+b, 1.5, WITC.eyeCore, WITC.eyeCore, 0);
  // Thin mouth
  ctx.save();
  ctx.strokeStyle = WITC.staffDark; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(ox+24,oy+30+b); ctx.lineTo(ox+40,oy+30+b); ctx.stroke();
  ctx.restore();

  // ── ROBE — upper (shoulders+chest) ──
  box(ctx, ox+12, oy+32+b, 40, 28, 4, WITC.robe,     '#000000', 1.5);
  box(ctx, ox+14, oy+34+b, 36, 24, 3, WITC.robeMid,  WITC.robe, 0);
  // Collar/neck
  box(ctx, ox+22, oy+30+b, 20, 8,  2, WITC.robeDark, '#000000', 1);
  // Skull clasp
  circ(ctx, ox+32, oy+36+b, 5, WITC.skull, '#000000', 1);
  circ(ctx, ox+32, oy+36+b, 2, WITC.robeDark, WITC.robeDark, 0);
  // Fire rune on chest
  ctx.save();
  ctx.strokeStyle = WITC.fire; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(ox+28,oy+44+b); ctx.lineTo(ox+32,oy+38+b); ctx.lineTo(ox+36,oy+44+b); ctx.stroke();
  ctx.restore();

  // ── ARMS (sleeves) ──
  box(ctx, ox+8,  oy+36+b, 8, 22, 3, WITC.robeDark, '#000000', 1);
  box(ctx, ox+48, oy+36+b, 8, 22, 3, WITC.robeDark, '#000000', 1);
  // Bony hands
  box(ctx, ox+7,  oy+56+b, 8, 6, 2, WITC.skin, '#000000', 1);
  box(ctx, ox+49, oy+56+b, 8, 6, 2, WITC.skin, '#000000', 1);

  // ── ROBE — lower (tattered hem) ──
  box(ctx, ox+14, oy+58+b, 36, 22, 3, WITC.robe, '#000000', 1.5);
  // Tattered torn hem
  poly(ctx, [[ox+14,oy+76+b],[ox+20,oy+88+b],[ox+26,oy+74+b]], WITC.robe, WITC.robe, 0);
  poly(ctx, [[ox+26,oy+74+b],[ox+32,oy+88+b],[ox+38,oy+74+b]], WITC.robeDark, WITC.robeDark, 0);
  poly(ctx, [[ox+38,oy+74+b],[ox+44,oy+88+b],[ox+50,oy+76+b]], WITC.robe, WITC.robe, 0);

  // ── ASH PARTICLES (floating around her) ──
  const ashPts = [[ox+10,oy+40],[ox+54,oy+38],[ox+8,oy+54],[ox+56,oy+62],[ox+12,oy+68],[ox+52,oy+52]];
  for (const [ax, ay] of ashPts) {
    circ(ctx, ax, ay+b, 1.5, WITC.ash, WITC.ash, 0);
  }
}

export function createWitchIdleSheet() {
  const frames = 4, c = makeCanvas(frames, WIT_FW, WIT_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,-1,0,-1].forEach((dy, i) => drawWitch(ctx, i*WIT_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: WIT_FW, frameHeight: WIT_FH, frameCount: frames };
}
export function createWitchWalkSheet() {
  const frames = 4, c = makeCanvas(frames, WIT_FW, WIT_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,-2,0,-2].forEach((dy, i) => drawWitch(ctx, i*WIT_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: WIT_FW, frameHeight: WIT_FH, frameCount: frames };
}
export function createWitchAttackSheet() {
  const frames = 5, c = makeCanvas(frames, WIT_FW, WIT_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [
    { staffPos:'normal' },
    { staffPos:'cast',   bodyDY:-2 },
    { staffPos:'cast',   bodyDY:-4 },
    { staffPos:'cast',   bodyDY:-2 },
    { staffPos:'normal', bodyDY:0  },
  ].forEach((cfg, i) => drawWitch(ctx, i*WIT_FW, 0, cfg));
  return { canvas: c, frameWidth: WIT_FW, frameHeight: WIT_FH, frameCount: frames };
}
export function createWitchDefendSheet() {
  const frames = 3, c = makeCanvas(frames, WIT_FW, WIT_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawWitch(ctx, i*WIT_FW, 0, { defending: true });
  return { canvas: c, frameWidth: WIT_FW, frameHeight: WIT_FH, frameCount: frames };
}

// ─── GNOLL ────────────────────────────────────────────────────────────────────

const GNL_FW = 60, GNL_FH = 80;

const GNLC = {
  fur:      '#7a5a20', furDark:  '#4a3810', furLight: '#9a7030',
  spot:     '#3a2808',
  muzzle:   '#6a4818', nose:     '#3a2010',
  eye:      '#aacc00', eyeDark:  '#668800',
  tooth:    '#e0d890', claw:     '#cc9900',
  weapon:   '#3a3020', weaponEdge:'#706050',
  bone:     '#c0b870',
  loin:     '#3a2010', loinDark: '#2a1808',
  ear:      '#7a5a20', earInner: '#9a6030',
};

function drawGnoll(ctx, ox, oy, {
  bodyDY = 0, legLY = 0, legRY = 0,
  armPos = 'normal', defending = false,
} = {}) {
  const b = bodyDY;

  // ── WEAPON (left side - crude bone hatchet) ──
  if (!defending && armPos !== 'raised-high') {
    const wy = armPos === 'impact' ? oy+46+b : oy+14+b;
    box(ctx, ox+2, wy, 5, 32, 2, GNLC.bone,   '#000000', 1);
    box(ctx, ox+0, wy, 14, 14, 2, GNLC.weapon, '#000000', 1.5);
    box(ctx, ox+0, wy, 4, 14, 1, GNLC.weaponEdge, GNLC.weaponEdge, 0);
  } else if (armPos === 'raised-high') {
    box(ctx, ox+2, oy+2+b, 5, 28, 2, GNLC.bone, '#000000', 1);
    box(ctx, ox+0, oy+0+b, 14, 12, 2, GNLC.weapon, '#000000', 1.5);
    box(ctx, ox+0, oy+0+b,  4, 12, 1, GNLC.weaponEdge, GNLC.weaponEdge, 0);
  }

  // ── POINTED EARS ──
  poly(ctx, [[ox+14,oy+6+b],[ox+8, oy+0+b],[ox+20,oy+10+b]], GNLC.ear,  '#000000', 1);
  poly(ctx, [[ox+44,oy+6+b],[ox+50,oy+0+b],[ox+38,oy+10+b]], GNLC.ear,  '#000000', 1);
  poly(ctx, [[ox+15,oy+8+b],[ox+10,oy+3+b],[ox+18,oy+10+b]], GNLC.earInner, GNLC.earInner, 0);
  poly(ctx, [[ox+43,oy+8+b],[ox+48,oy+3+b],[ox+40,oy+10+b]], GNLC.earInner, GNLC.earInner, 0);

  // ── HEAD (hyena - slightly elongated) ──
  box(ctx, ox+12, oy+6+b, 36, 18, 4, GNLC.fur,  '#000000', 1.5);
  // Muzzle
  box(ctx, ox+14, oy+14+b, 30, 14, 3, GNLC.muzzle, '#000000', 1.5);
  // Nose tip
  box(ctx, ox+18, oy+20+b, 8, 4, 2, GNLC.nose, '#000000', 1);
  // Fur spots on head
  circ(ctx, ox+18, oy+8+b,  3, GNLC.spot, GNLC.spot, 0);
  circ(ctx, ox+38, oy+8+b,  3, GNLC.spot, GNLC.spot, 0);
  circ(ctx, ox+28, oy+10+b, 2, GNLC.spot, GNLC.spot, 0);
  // Eyes
  ctx.save();
  ctx.shadowColor = GNLC.eye; ctx.shadowBlur = 6;
  circ(ctx, ox+20, oy+13+b, 4, '#1a1a0a', '#000000', 1);
  circ(ctx, ox+38, oy+13+b, 4, '#1a1a0a', '#000000', 1);
  ctx.restore();
  circ(ctx, ox+20, oy+13+b, 3, GNLC.eye,    GNLC.eye, 0);
  circ(ctx, ox+38, oy+13+b, 3, GNLC.eye,    GNLC.eye, 0);
  circ(ctx, ox+20, oy+13+b, 1, GNLC.eyeDark,GNLC.eyeDark, 0);
  circ(ctx, ox+38, oy+13+b, 1, GNLC.eyeDark,GNLC.eyeDark, 0);
  // Teeth
  poly(ctx, [[ox+20,oy+24+b],[ox+18,oy+30+b],[ox+22,oy+26+b]], GNLC.tooth, '#000000', 1);
  poly(ctx, [[ox+28,oy+24+b],[ox+26,oy+30+b],[ox+30,oy+26+b]], GNLC.tooth, '#000000', 1);

  // ── NECK + HUNCHED BODY ──
  box(ctx, ox+18, oy+28+b, 22, 8,  2, GNLC.furDark, '#000000', 1);
  box(ctx, ox+12, oy+34+b, 36, 30, 5, GNLC.furDark, '#000000', 1.5);
  // Fur spots on body
  circ(ctx, ox+22, oy+40+b, 3, GNLC.spot, GNLC.spot, 0);
  circ(ctx, ox+36, oy+38+b, 3, GNLC.spot, GNLC.spot, 0);
  circ(ctx, ox+28, oy+50+b, 2, GNLC.spot, GNLC.spot, 0);
  // Loincloth
  poly(ctx, [[ox+16,oy+60+b],[ox+30,oy+68+b],[ox+44,oy+60+b],[ox+42,oy+52+b],[ox+18,oy+52+b]],
    GNLC.loin, GNLC.loinDark, 1);

  // ── ARMS ──
  if (defending) {
    box(ctx, ox+6,  oy+34+b, 10, 26, 3, GNLC.furDark, '#000000', 1.5);
    box(ctx, ox+44, oy+34+b, 10, 26, 3, GNLC.furDark, '#000000', 1.5);
  } else if (armPos === 'raised-high' || armPos === 'impact') {
    box(ctx, ox+6,  oy+22+b, 10, 18, 3, GNLC.furDark, '#000000', 1.5);
    box(ctx, ox+44, oy+38+b, 10, 22, 3, GNLC.furDark, '#000000', 1.5);
  } else {
    box(ctx, ox+6,  oy+36+b, 10, 22, 3, GNLC.furDark, '#000000', 1.5);
    box(ctx, ox+44, oy+36+b, 10, 22, 3, GNLC.furDark, '#000000', 1.5);
  }
  // Clawed hands
  poly(ctx, [[ox+6,oy+56+b],[ox+4,oy+62+b],[ox+8,oy+58+b]], GNLC.claw, '#000000', 1);
  poly(ctx, [[ox+44,oy+56+b],[ox+48,oy+62+b],[ox+52,oy+58+b]], GNLC.claw, '#000000', 1);

  // ── LEGS (short, heavy) ──
  const llY = oy + 66 + legLY;
  const rlY = oy + 66 + legRY;
  box(ctx, ox+14, llY, 16, 14, 3, GNLC.furDark, '#000000', 1.5);
  box(ctx, ox+30, rlY, 16, 14, 3, GNLC.furDark, '#000000', 1.5);
  // Paws
  box(ctx, ox+12, llY+10, 20, 8, 2, GNLC.fur, '#000000', 1);
  box(ctx, ox+28, rlY+10, 20, 8, 2, GNLC.fur, '#000000', 1);
  circ(ctx, ox+14, llY+16, 2, GNLC.claw, GNLC.claw, 0);
  circ(ctx, ox+28, llY+16, 2, GNLC.claw, GNLC.claw, 0);
  circ(ctx, ox+32, rlY+16, 2, GNLC.claw, GNLC.claw, 0);
  circ(ctx, ox+46, rlY+16, 2, GNLC.claw, GNLC.claw, 0);
}

export function createGnollIdleSheet() {
  const frames = 4, c = makeCanvas(frames, GNL_FW, GNL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,1,0,1].forEach((dy, i) => drawGnoll(ctx, i*GNL_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: GNL_FW, frameHeight: GNL_FH, frameCount: frames };
}
export function createGnollWalkSheet() {
  const frames = 4, c = makeCanvas(frames, GNL_FW, GNL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [{legLY:3,legRY:-3},{},{legLY:-3,legRY:3},{}]
    .forEach((cfg, i) => drawGnoll(ctx, i*GNL_FW, 0, cfg));
  return { canvas: c, frameWidth: GNL_FW, frameHeight: GNL_FH, frameCount: frames };
}
export function createGnollAttackSheet() {
  const frames = 5, c = makeCanvas(frames, GNL_FW, GNL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [
    { armPos:'normal' },
    { armPos:'raised-high', bodyDY:-2 },
    { armPos:'raised-high', bodyDY:-3 },
    { armPos:'impact',      bodyDY:2  },
    { armPos:'normal',      bodyDY:1  },
  ].forEach((cfg, i) => drawGnoll(ctx, i*GNL_FW, 0, cfg));
  return { canvas: c, frameWidth: GNL_FW, frameHeight: GNL_FH, frameCount: frames };
}
export function createGnollDefendSheet() {
  const frames = 3, c = makeCanvas(frames, GNL_FW, GNL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawGnoll(ctx, i*GNL_FW, 0, { defending: true });
  return { canvas: c, frameWidth: GNL_FW, frameHeight: GNL_FH, frameCount: frames };
}

// ─── SEIGNEUR DES OMBRES ──────────────────────────────────────────────────────

const SLD_FW = 96, SLD_FH = 120;

const SLDC = {
  void:      '#7C3AED', voidBright:'#A855F7', voidDim:   '#3D0A8A',
  armor:     '#0a0018', armorDark: '#060010', armorDeep: '#040008',
  crown:     '#0e0020', crownEdge: '#1a0034',
  eye:       '#AA00FF', eyeCore:   '#DD88FF',
  blade:     '#0a001a', bladePurple:'#6D00CC', bladeEdge: '#AA44FF',
  tendril:   '#180030', tendrilBright:'#3a0060',
  cloak:     '#080014', cloakEdge: '#12001e',
};

function drawShadowLord(ctx, ox, oy, {
  bodyDY = 0, bladePos = 'normal', defending = false,
} = {}) {
  const b = bodyDY;

  // ── SHADOW TENDRILS (at base, drawn first) ──
  const tendrilPts = [
    [[ox+16,oy+100+b],[ox+8, oy+116+b],[ox+22,oy+102+b]],
    [[ox+30,oy+102+b],[ox+24,oy+118+b],[ox+36,oy+104+b]],
    [[ox+48,oy+102+b],[ox+48,oy+120+b],[ox+54,oy+104+b]],
    [[ox+64,oy+100+b],[ox+70,oy+116+b],[ox+60,oy+102+b]],
    [[ox+78,oy+100+b],[ox+84,oy+116+b],[ox+72,oy+102+b]],
  ];
  for (const pts of tendrilPts) poly(ctx, pts, SLDC.tendril, SLDC.tendrilBright, 1);

  // ── FLOWING CLOAK (behind body) ──
  poly(ctx, [[ox+18,oy+60+b],[ox+6, oy+108+b],[ox+30,oy+100+b]], SLDC.cloak, SLDC.cloakEdge, 1);
  poly(ctx, [[ox+78,oy+60+b],[ox+90,oy+108+b],[ox+66,oy+100+b]], SLDC.cloak, SLDC.cloakEdge, 1);
  box(ctx, ox+18, oy+60+b, 60, 48, 4, SLDC.cloak, SLDC.cloakEdge, 1);

  // ── SHADOW BLADES ──
  const leftBladeY  = bladePos === 'strike' ? oy+54+b : oy+40+b;
  const rightBladeY = bladePos === 'strike' ? oy+54+b : oy+40+b;
  // Left blade
  ctx.save();
  ctx.shadowColor = SLDC.void; ctx.shadowBlur = 10;
  box(ctx, ox+2, leftBladeY,  10, 60, 2, SLDC.blade,      '#000000', 1.5);
  box(ctx, ox+2, leftBladeY,   3, 60, 1, SLDC.bladeEdge,  SLDC.bladeEdge, 0);
  poly(ctx, [[ox+2,leftBladeY],[ox+12,leftBladeY],[ox+7,leftBladeY-10]], SLDC.bladePurple, '#000000', 1);
  // Right blade
  box(ctx, ox+84, rightBladeY, 10, 60, 2, SLDC.blade,     '#000000', 1.5);
  box(ctx, ox+93, rightBladeY,  3, 60, 1, SLDC.bladeEdge, SLDC.bladeEdge, 0);
  poly(ctx, [[ox+84,rightBladeY],[ox+94,rightBladeY],[ox+89,rightBladeY-10]], SLDC.bladePurple, '#000000', 1);
  ctx.restore();

  // ── PAULDRONS (massive shoulders) ──
  box(ctx, ox+4,  oy+36+b, 24, 28, 6, SLDC.armor,    '#000000', 1.5);
  box(ctx, ox+68, oy+36+b, 24, 28, 6, SLDC.armor,    '#000000', 1.5);
  // Shoulder spikes
  poly(ctx, [[ox+4, oy+36+b],[ox+12,oy+24+b],[ox+20,oy+36+b]], SLDC.armorDark, '#000000', 1);
  poly(ctx, [[ox+76,oy+36+b],[ox+84,oy+24+b],[ox+92,oy+36+b]], SLDC.armorDark, '#000000', 1);
  // Void trim on shoulders
  ctx.save();
  ctx.shadowColor = SLDC.void; ctx.shadowBlur = 6;
  box(ctx, ox+4,  oy+36+b, 24, 3, 1, SLDC.void, SLDC.void, 0);
  box(ctx, ox+68, oy+36+b, 24, 3, 1, SLDC.void, SLDC.void, 0);
  ctx.restore();

  // ── CROWN OF VOID SPIKES ──
  const spikeXs = [ox+28, ox+38, ox+48, ox+58, ox+68];
  const spikeHs = [18,    24,    28,    24,    18];
  ctx.save();
  ctx.shadowColor = SLDC.voidDim; ctx.shadowBlur = 8;
  for (let s = 0; s < spikeXs.length; s++) {
    const sx = spikeXs[s], sh = spikeHs[s];
    poly(ctx, [[sx,oy+20+b],[sx+6,oy+20-sh+b],[sx+12,oy+20+b]], SLDC.crown, SLDC.crownEdge, 1);
  }
  ctx.restore();
  // Crown band
  box(ctx, ox+24, oy+16+b, 48, 10, 3, SLDC.crown, SLDC.crownEdge, 1.5);
  ctx.save();
  ctx.shadowColor = SLDC.void; ctx.shadowBlur = 4;
  box(ctx, ox+24, oy+16+b, 48, 3,  2, SLDC.voidDim, SLDC.void, 1);
  ctx.restore();

  // ── HEAD ──
  box(ctx, ox+26, oy+22+b, 44, 24, 4, SLDC.armorDark, '#000000', 1.5);
  // Void eye slits
  ctx.save();
  ctx.shadowColor = SLDC.eye; ctx.shadowBlur = 14;
  box(ctx, ox+30, oy+30+b, 12, 6, 2, SLDC.eye,  SLDC.eye, 0);
  box(ctx, ox+54, oy+30+b, 12, 6, 2, SLDC.eye,  SLDC.eye, 0);
  ctx.restore();
  box(ctx, ox+32, oy+31+b,  8, 4, 1, SLDC.eyeCore, SLDC.eyeCore, 0);
  box(ctx, ox+56, oy+31+b,  8, 4, 1, SLDC.eyeCore, SLDC.eyeCore, 0);

  // ── TORSO ──
  box(ctx, ox+22, oy+44+b, 52, 44, 5, SLDC.armor, '#000000', 1.5);
  // Torso armor plates
  box(ctx, ox+24, oy+50+b, 48, 3,  1, SLDC.armorDark, SLDC.armorDark, 0);
  box(ctx, ox+24, oy+60+b, 48, 3,  1, SLDC.armorDark, SLDC.armorDark, 0);
  box(ctx, ox+24, oy+70+b, 48, 3,  1, SLDC.armorDark, SLDC.armorDark, 0);
  // VOID ENERGY CORE (glowing chest) ──
  ctx.save();
  ctx.shadowColor = SLDC.voidBright; ctx.shadowBlur = 18;
  circ(ctx, ox+48, oy+58+b, 10, SLDC.voidDim, SLDC.void, 1.5);
  ctx.restore();
  circ(ctx, ox+48, oy+58+b,  7, SLDC.void,      SLDC.voidBright, 1);
  circ(ctx, ox+48, oy+58+b,  4, SLDC.voidBright, SLDC.voidBright, 0);
  // Void lines radiating from core
  ctx.save();
  ctx.strokeStyle = SLDC.voidDim; ctx.lineWidth = 1;
  for (let a = 0; a < 4; a++) {
    const angle = a * Math.PI / 4 + Math.PI / 8;
    ctx.beginPath();
    ctx.moveTo(ox+48 + Math.cos(angle)*10, oy+58+b + Math.sin(angle)*10);
    ctx.lineTo(ox+48 + Math.cos(angle)*18, oy+58+b + Math.sin(angle)*18);
    ctx.stroke();
  }
  ctx.restore();

  // ── ARMS ──
  box(ctx, ox+8,  oy+44+b, 16, 36, 4, SLDC.armor, '#000000', 1.5);
  box(ctx, ox+72, oy+44+b, 16, 36, 4, SLDC.armor, '#000000', 1.5);
  // Gauntlets
  box(ctx, ox+6,  oy+74+b, 18, 8, 3, SLDC.armorDark, '#000000', 1.5);
  box(ctx, ox+72, oy+74+b, 18, 8, 3, SLDC.armorDark, '#000000', 1.5);
  ctx.save();
  ctx.shadowColor = SLDC.void; ctx.shadowBlur = 4;
  box(ctx, ox+6,  oy+74+b, 18, 2, 1, SLDC.voidDim, SLDC.void, 0);
  box(ctx, ox+72, oy+74+b, 18, 2, 1, SLDC.voidDim, SLDC.void, 0);
  ctx.restore();
}

export function createShadowLordIdleSheet() {
  const frames = 4, c = makeCanvas(frames, SLD_FW, SLD_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,-1,0,-1].forEach((dy, i) => drawShadowLord(ctx, i*SLD_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: SLD_FW, frameHeight: SLD_FH, frameCount: frames };
}
export function createShadowLordWalkSheet() {
  const frames = 4, c = makeCanvas(frames, SLD_FW, SLD_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,-2,0,-2].forEach((dy, i) => drawShadowLord(ctx, i*SLD_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: SLD_FW, frameHeight: SLD_FH, frameCount: frames };
}
export function createShadowLordAttackSheet() {
  const frames = 5, c = makeCanvas(frames, SLD_FW, SLD_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [
    { bladePos:'normal' },
    { bladePos:'normal', bodyDY:-2 },
    { bladePos:'strike', bodyDY:-4 },
    { bladePos:'strike', bodyDY:2  },
    { bladePos:'normal', bodyDY:0  },
  ].forEach((cfg, i) => drawShadowLord(ctx, i*SLD_FW, 0, cfg));
  return { canvas: c, frameWidth: SLD_FW, frameHeight: SLD_FH, frameCount: frames };
}
export function createShadowLordDefendSheet() {
  const frames = 3, c = makeCanvas(frames, SLD_FW, SLD_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawShadowLord(ctx, i*SLD_FW, 0, { defending: true });
  return { canvas: c, frameWidth: SLD_FW, frameHeight: SLD_FH, frameCount: frames };
}
