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

// ── CAVE BAT ─────────────────────────────────────────────────────────────────
const BAT_FW = 48, BAT_FH = 40;
const BATC = {
  wing:  '#2A1A3A', wingD: '#0A0010',
  body:  '#3A2A4A', bodyD: '#1A0A2A',
  eye:   '#FF2222',
  fang:  '#E8D4A0',
  claw:  '#1A0A2A',
};

function drawBat(ctx, ox, oy, { frame = 0, attacking = false, defending = false } = {}) {
  const flap = (!defending && !attacking) ? (frame % 2 === 0 ? 4 : 0) : 0;
  const wSpread = defending ? 4 : attacking ? 18 : 12 + flap;

  // Wings left
  poly(ctx, [
    [ox + 24, oy + 22],
    [ox + 24 - wSpread - 4, oy + 10 - flap],
    [ox + 24 - wSpread - 10, oy + 26],
    [ox + 20, oy + 28],
  ], BATC.wing, BATC.wingD);

  // Wings right
  poly(ctx, [
    [ox + 24, oy + 22],
    [ox + 24 + wSpread + 4, oy + 10 - flap],
    [ox + 24 + wSpread + 10, oy + 26],
    [ox + 28, oy + 28],
  ], BATC.wing, BATC.wingD);

  // Body
  circ(ctx, ox + 24, oy + 22, 8, BATC.body, BATC.bodyD);

  // Head
  circ(ctx, ox + 24, oy + 14, 6, BATC.body, BATC.bodyD);

  // Ears
  poly(ctx, [[ox + 20, oy + 10], [ox + 17, oy + 3], [ox + 23, oy + 10]], BATC.wingD, BATC.wingD);
  poly(ctx, [[ox + 28, oy + 10], [ox + 31, oy + 3], [ox + 25, oy + 10]], BATC.wingD, BATC.wingD);

  // Eyes
  circ(ctx, ox + 21, oy + 13, 2.5, BATC.eye);
  circ(ctx, ox + 27, oy + 13, 2.5, BATC.eye);

  // Fangs
  fillR(ctx, ox + 22, oy + 18, 2, 4, BATC.fang);
  fillR(ctx, ox + 26, oy + 18, 2, 4, BATC.fang);
}

export function createCaveBatIdleSheet() {
  const frames = 4, c = makeCanvas(frames, BAT_FW, BAT_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawBat(ctx, i * BAT_FW, 0, { frame: i });
  return { canvas: c, frameWidth: BAT_FW, frameHeight: BAT_FH, frameCount: frames };
}

export function createCaveBatWalkSheet() {
  const frames = 4, c = makeCanvas(frames, BAT_FW, BAT_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawBat(ctx, i * BAT_FW, 0, { frame: i });
  return { canvas: c, frameWidth: BAT_FW, frameHeight: BAT_FH, frameCount: frames };
}

export function createCaveBatAttackSheet() {
  const frames = 4, c = makeCanvas(frames, BAT_FW, BAT_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawBat(ctx, i * BAT_FW, 0, { frame: i, attacking: i >= 2 });
  return { canvas: c, frameWidth: BAT_FW, frameHeight: BAT_FH, frameCount: frames };
}

export function createCaveBatDefendSheet() {
  const frames = 3, c = makeCanvas(frames, BAT_FW, BAT_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawBat(ctx, i * BAT_FW, 0, { defending: true });
  return { canvas: c, frameWidth: BAT_FW, frameHeight: BAT_FH, frameCount: frames };
}

// ── CAVE DWARF / MINER ────────────────────────────────────────────────────────
const DWF_FW = 64, DWF_FH = 80;
const DWFC = {
  armor:  '#5A6A7A', armorD: '#3A4A5A',
  skin:   '#C87840', skinD:  '#A85820',
  beard:  '#8A5A2A', beardD: '#5A3A10',
  helm:   '#4A5A6A', helmD:  '#2A3A4A',
  pick:   '#909090', pickD:  '#5A5A5A',
  pickH:  '#6A4A2A',
  tnt:    '#CC2222', tntD:   '#881111',
  fuse:   '#FF8800',
};

function drawDwarf(ctx, ox, oy, { frame = 0, walking = false, attacking = false, defending = false, miner = false } = {}) {
  const bobY = walking ? (frame % 2 === 0 ? 1 : -1) : 0;
  const oy2  = oy + bobY;

  // Legs (very short)
  box(ctx, ox + 17, oy2 + 58, 12, 18, 2, DWFC.armor, DWFC.armorD);
  box(ctx, ox + 35, oy2 + 58, 12, 18, 2, DWFC.armor, DWFC.armorD);

  // Wide torso
  box(ctx, ox + 10, oy2 + 28, 44, 32, 3, DWFC.armor, DWFC.armorD);

  // Left arm
  box(ctx, ox + 2, oy2 + 30, 12, 24, 2, DWFC.armor, DWFC.armorD);

  // Right arm (raised on attack)
  const armY = attacking ? oy2 + 18 : oy2 + 30;
  box(ctx, ox + 50, armY, 12, 24, 2, DWFC.armor, DWFC.armorD);

  // Head
  box(ctx, ox + 16, oy2 + 8, 32, 24, 4, DWFC.skin, DWFC.skinD);

  // Helmet
  box(ctx, ox + 13, oy2 + 4, 38, 14, 3, DWFC.helm, DWFC.helmD);
  // Helmet horns
  box(ctx, ox + 6, oy2 + 6, 9, 6, 1, DWFC.helm, DWFC.helmD);
  box(ctx, ox + 49, oy2 + 6, 9, 6, 1, DWFC.helm, DWFC.helmD);

  // Eyes
  circ(ctx, ox + 24, oy2 + 20, 3, '#FF5500');
  circ(ctx, ox + 40, oy2 + 20, 3, '#FF5500');

  // Beard
  box(ctx, ox + 16, oy2 + 26, 32, 8, 3, DWFC.beard, DWFC.beardD);

  if (miner) {
    // TNT strapped to belt
    box(ctx, ox + 22, oy2 + 48, 9, 12, 2, DWFC.tnt, DWFC.tntD);
    fillR(ctx, ox + 25, oy2 + 44, 3, 6, DWFC.fuse);
    // Text 'TNT' implied by red block
    // Short pickaxe handle
    box(ctx, ox + 50, armY + 4, 4, 20, 1, DWFC.pickH, '#4A3010');
    box(ctx, ox + 44, armY + 2, 16, 5, 2, DWFC.pick, DWFC.pickD);
  } else {
    // Pickaxe
    const px = defending ? ox + 48 : ox + 50;
    box(ctx, px, armY + 2, 4, 22, 1, DWFC.pickH, '#4A3010');
    box(ctx, px - 6, armY, 18, 6, 2, DWFC.pick, DWFC.pickD);
  }
}

export function createCaveDwarfIdleSheet() {
  const frames = 4, c = makeCanvas(frames, DWF_FW, DWF_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDwarf(ctx, i * DWF_FW, 0, { frame: i });
  return { canvas: c, frameWidth: DWF_FW, frameHeight: DWF_FH, frameCount: frames };
}
export function createCaveDwarfWalkSheet() {
  const frames = 4, c = makeCanvas(frames, DWF_FW, DWF_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDwarf(ctx, i * DWF_FW, 0, { frame: i, walking: true });
  return { canvas: c, frameWidth: DWF_FW, frameHeight: DWF_FH, frameCount: frames };
}
export function createCaveDwarfAttackSheet() {
  const frames = 4, c = makeCanvas(frames, DWF_FW, DWF_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDwarf(ctx, i * DWF_FW, 0, { frame: i, attacking: i >= 2 });
  return { canvas: c, frameWidth: DWF_FW, frameHeight: DWF_FH, frameCount: frames };
}
export function createCaveDwarfDefendSheet() {
  const frames = 3, c = makeCanvas(frames, DWF_FW, DWF_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDwarf(ctx, i * DWF_FW, 0, { defending: true });
  return { canvas: c, frameWidth: DWF_FW, frameHeight: DWF_FH, frameCount: frames };
}

export function createCaveMinerIdleSheet() {
  const frames = 4, c = makeCanvas(frames, DWF_FW, DWF_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDwarf(ctx, i * DWF_FW, 0, { frame: i, miner: true });
  return { canvas: c, frameWidth: DWF_FW, frameHeight: DWF_FH, frameCount: frames };
}
export function createCaveMinerWalkSheet() {
  const frames = 4, c = makeCanvas(frames, DWF_FW, DWF_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDwarf(ctx, i * DWF_FW, 0, { frame: i, walking: true, miner: true });
  return { canvas: c, frameWidth: DWF_FW, frameHeight: DWF_FH, frameCount: frames };
}
export function createCaveMinerAttackSheet() {
  const frames = 4, c = makeCanvas(frames, DWF_FW, DWF_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDwarf(ctx, i * DWF_FW, 0, { frame: i, attacking: i >= 2, miner: true });
  return { canvas: c, frameWidth: DWF_FW, frameHeight: DWF_FH, frameCount: frames };
}
export function createCaveMinerDefendSheet() {
  const frames = 3, c = makeCanvas(frames, DWF_FW, DWF_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDwarf(ctx, i * DWF_FW, 0, { defending: true, miner: true });
  return { canvas: c, frameWidth: DWF_FW, frameHeight: DWF_FH, frameCount: frames };
}

// ── CAVE TROLL / TROLL KING ───────────────────────────────────────────────────
const TRL_FW = 80, TRL_FH = 96;
const TRLC = {
  skin:  '#5A7A4A', skinD: '#3A5A2A',
  cloth: '#4A3A2A', clothD:'#2A1A0A',
  nail:  '#8A8A3A', nailD: '#5A5A1A',
  eye:   '#FF8800',
  rock:  '#6A6A6A', rockD: '#4A4A4A',
  crown: '#8A7A5A', crownD:'#5A5040',
};

function drawTroll(ctx, ox, oy, { frame = 0, walking = false, attacking = false, defending = false, king = false } = {}) {
  const bobY  = walking ? (frame % 2 === 0 ? 2 : -2) : 0;
  const oy2   = oy + bobY + (king ? -8 : 0);
  const armY  = attacking ? oy2 + 16 : oy2 + 30;

  // Legs
  box(ctx, ox + 12, oy2 + 68, 18, 24, 3, TRLC.skin, TRLC.skinD);
  box(ctx, ox + 50, oy2 + 68, 18, 24, 3, TRLC.skin, TRLC.skinD);

  // Cloth
  box(ctx, ox + 10, oy2 + 52, 60, 20, 2, TRLC.cloth, TRLC.clothD);

  // Massive torso
  box(ctx, ox + 6, oy2 + 26, 68, 38, 6, TRLC.skin, TRLC.skinD);

  // Arms
  box(ctx, ox + 0, armY, 16, 38, 4, TRLC.skin, TRLC.skinD);
  box(ctx, ox + 64, armY, 16, 38, 4, TRLC.skin, TRLC.skinD);

  // Fists
  circ(ctx, ox + 8,  armY + 36, 10, TRLC.skin, TRLC.skinD);
  circ(ctx, ox + 72, armY + 36, 10, TRLC.skin, TRLC.skinD);

  // Claws
  for (let i = 0; i < 3; i++) {
    fillR(ctx, ox + 2 + i * 5, armY + 43, 3, 6, TRLC.nail);
    fillR(ctx, ox + 65 + i * 5, armY + 43, 3, 6, TRLC.nail);
  }

  // Head
  box(ctx, ox + 14, oy2 + 4, 52, 30, 6, TRLC.skin, TRLC.skinD);

  // Heavy brow
  box(ctx, ox + 12, oy2 + 4, 56, 12, 3, TRLC.skinD, TRLC.skinD);

  // Eyes
  circ(ctx, ox + 26, oy2 + 18, 5, '#FFA500');
  circ(ctx, ox + 26, oy2 + 18, 3, TRLC.eye);
  circ(ctx, ox + 54, oy2 + 18, 5, '#FFA500');
  circ(ctx, ox + 54, oy2 + 18, 3, TRLC.eye);

  // Tusks
  poly(ctx, [[ox+26,oy2+30],[ox+22,oy2+38],[ox+28,oy2+30]], '#E8D4A0', TRLC.skinD);
  poly(ctx, [[ox+54,oy2+30],[ox+58,oy2+38],[ox+52,oy2+30]], '#E8D4A0', TRLC.skinD);

  // King crown (rocky)
  if (king) {
    box(ctx, ox + 12, oy2 + 2, 56, 6, 0, TRLC.rock, TRLC.rockD);
    for (let i = 0; i < 4; i++) {
      box(ctx, ox + 14 + i * 14, oy2 - 6, 10, 10, 1, TRLC.rock, TRLC.rockD);
    }
    // Gem in center of crown
    circ(ctx, ox + 40, oy2 - 1, 4, '#FF4444', '#AA0000');
  }
}

export function createCaveTrollIdleSheet() {
  const frames = 4, c = makeCanvas(frames, TRL_FW, TRL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawTroll(ctx, i * TRL_FW, 0, { frame: i });
  return { canvas: c, frameWidth: TRL_FW, frameHeight: TRL_FH, frameCount: frames };
}
export function createCaveTrollWalkSheet() {
  const frames = 4, c = makeCanvas(frames, TRL_FW, TRL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawTroll(ctx, i * TRL_FW, 0, { frame: i, walking: true });
  return { canvas: c, frameWidth: TRL_FW, frameHeight: TRL_FH, frameCount: frames };
}
export function createCaveTrollAttackSheet() {
  const frames = 4, c = makeCanvas(frames, TRL_FW, TRL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawTroll(ctx, i * TRL_FW, 0, { frame: i, attacking: i >= 2 });
  return { canvas: c, frameWidth: TRL_FW, frameHeight: TRL_FH, frameCount: frames };
}
export function createCaveTrollDefendSheet() {
  const frames = 3, c = makeCanvas(frames, TRL_FW, TRL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawTroll(ctx, i * TRL_FW, 0, { defending: true });
  return { canvas: c, frameWidth: TRL_FW, frameHeight: TRL_FH, frameCount: frames };
}

export function createCaveTrollKingIdleSheet() {
  const frames = 4, c = makeCanvas(frames, TRL_FW, TRL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawTroll(ctx, i * TRL_FW, 0, { frame: i, king: true });
  return { canvas: c, frameWidth: TRL_FW, frameHeight: TRL_FH, frameCount: frames };
}
export function createCaveTrollKingWalkSheet() {
  const frames = 4, c = makeCanvas(frames, TRL_FW, TRL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawTroll(ctx, i * TRL_FW, 0, { frame: i, walking: true, king: true });
  return { canvas: c, frameWidth: TRL_FW, frameHeight: TRL_FH, frameCount: frames };
}
export function createCaveTrollKingAttackSheet() {
  const frames = 4, c = makeCanvas(frames, TRL_FW, TRL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawTroll(ctx, i * TRL_FW, 0, { frame: i, attacking: i >= 2, king: true });
  return { canvas: c, frameWidth: TRL_FW, frameHeight: TRL_FH, frameCount: frames };
}
export function createCaveTrollKingDefendSheet() {
  const frames = 3, c = makeCanvas(frames, TRL_FW, TRL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawTroll(ctx, i * TRL_FW, 0, { defending: true, king: true });
  return { canvas: c, frameWidth: TRL_FW, frameHeight: TRL_FH, frameCount: frames };
}

// ── PIRATES ───────────────────────────────────────────────────────────────────
const PIR_FW = 64, PIR_FH = 84;
const PIRC = {
  cloth:  '#2A1E3A', clothD: '#150E1E',
  skin:   '#C8A070', skinD:  '#A87850',
  band:   '#CC2222', bandD:  '#881111',
  sword:  '#8A9AAA', swordD: '#5A6A7A',
  belt:   '#5A4020', beltD:  '#3A2810',
  boot:   '#1E1008', bootD:  '#0A0400',
  gold:   '#C8A820', goldD:  '#8A6810',
  qm:     '#3A4A2A', qmD:    '#1E2810',
  cap:    '#7A1A1A', capD:   '#4A0A0A',
  hat:    '#1A1010', hatD:   '#0A0808',
};

function drawPirate(ctx, ox, oy, { frame = 0, walking = false, attacking = false, defending = false, quartermaster = false, captain = false } = {}) {
  const bobY = walking ? (frame % 2 === 0 ? 1 : -1) : 0;
  const oy2  = oy + bobY;
  const coat = captain ? PIRC.cap : quartermaster ? PIRC.qm : PIRC.cloth;
  const coatD = captain ? PIRC.capD : quartermaster ? PIRC.qmD : PIRC.clothD;
  const armY  = attacking ? oy2 + 28 : oy2 + 36;

  // Legs
  box(ctx, ox + 16, oy2 + 58, 12, 22, 2, coat, coatD);
  box(ctx, ox + 36, oy2 + 58, 12, 22, 2, coat, coatD);
  // Boots
  box(ctx, ox + 14, oy2 + 72, 14, 8, 2, PIRC.boot, PIRC.bootD);
  box(ctx, ox + 36, oy2 + 72, 14, 8, 2, PIRC.boot, PIRC.bootD);

  // Body
  box(ctx, ox + 13, oy2 + 32, 38, 28, 3, coat, coatD);

  // Belt
  box(ctx, ox + 11, oy2 + 55, 42, 6, 1, PIRC.belt, PIRC.beltD);
  box(ctx, ox + 28, oy2 + 54, 8, 8, 1, PIRC.gold, PIRC.goldD);

  // Captain epaulettes
  if (captain) {
    box(ctx, ox + 8,  oy2 + 32, 10, 7, 2, PIRC.gold, PIRC.goldD);
    box(ctx, ox + 46, oy2 + 32, 10, 7, 2, PIRC.gold, PIRC.goldD);
  }

  // Left arm
  box(ctx, ox + 4, oy2 + 36, 12, 20, 2, PIRC.skin, PIRC.skinD);

  // Right arm (sword arm)
  box(ctx, ox + 48, armY, 12, 20, 2, PIRC.skin, PIRC.skinD);

  // Head
  box(ctx, ox + 18, oy2 + 10, 28, 24, 4, PIRC.skin, PIRC.skinD);

  if (captain) {
    // Large tricorne hat
    box(ctx, ox + 9,  oy2 + 2, 46, 12, 3, PIRC.hat, PIRC.hatD);
    box(ctx, ox + 5,  oy2 + 8, 54, 6,  1, PIRC.hat, PIRC.hatD);
    // Feather
    poly(ctx, [[ox+52,oy2+2],[ox+60,oy2-6],[ox+55,oy2+4],[ox+49,oy2+4]], '#CC4422', '#882211');
    // Gold hat band
    box(ctx, ox + 9, oy2 + 10, 46, 3, 0, PIRC.gold, PIRC.goldD);
  } else if (quartermaster) {
    // Bicorne hat
    box(ctx, ox + 12, oy2 + 2, 40, 10, 2, PIRC.hat, PIRC.hatD);
    box(ctx, ox + 8,  oy2 + 7, 48, 6,  1, PIRC.hat, PIRC.hatD);
  } else {
    // Bandana
    box(ctx, ox + 16, oy2 + 10, 32, 10, 3, PIRC.band, PIRC.bandD);
    box(ctx, ox + 44, oy2 + 8,  8,  6,  2, PIRC.band, PIRC.bandD);
  }

  // Eyes
  circ(ctx, ox + 25, oy2 + 22, 3, '#180A00');
  circ(ctx, ox + 39, oy2 + 22, 3, '#180A00');

  // Stubble
  box(ctx, ox + 20, oy2 + 28, 24, 4, 1, '#7A5A3A', '#5A3A1A', 1);

  // Weapon
  if (quartermaster) {
    // Poisoned dagger (green tip)
    const dx = attacking ? ox + 52 : ox + 54;
    box(ctx, dx, armY + 4, 3, 18, 1, PIRC.swordD, PIRC.swordD);
    box(ctx, dx - 4, armY + 2, 11, 4,  1, PIRC.sword, PIRC.swordD);
    box(ctx, dx, armY + 18, 3, 6,  1, '#44AA22', '#226611');
  } else if (captain) {
    // Long sword
    const sx = attacking ? ox + 50 : ox + 52;
    box(ctx, sx, armY + 2, 4, 28, 1, PIRC.swordD, PIRC.swordD);
    box(ctx, sx - 5, armY, 14, 4, 1, PIRC.sword,  PIRC.swordD);
  } else {
    // Curved cutlass
    const sx = attacking ? ox + 50 : ox + 52;
    box(ctx, sx, armY + 2, 4, 22, 1, PIRC.sword,  PIRC.swordD);
    box(ctx, sx - 4, armY, 12, 4, 1, PIRC.sword,  PIRC.swordD);
    // Curve tip
    box(ctx, sx - 2, armY + 22, 4, 4, 1, PIRC.sword, PIRC.swordD);
  }
}

export function createPirateGruntIdleSheet() {
  const frames = 4, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { frame: i });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}
export function createPirateGruntWalkSheet() {
  const frames = 4, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { frame: i, walking: true });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}
export function createPirateGruntAttackSheet() {
  const frames = 4, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { frame: i, attacking: i >= 2 });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}
export function createPirateGruntDefendSheet() {
  const frames = 3, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { defending: true });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}

export function createPirateQuartermasterIdleSheet() {
  const frames = 4, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { frame: i, quartermaster: true });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}
export function createPirateQuartermasterWalkSheet() {
  const frames = 4, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { frame: i, walking: true, quartermaster: true });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}
export function createPirateQuartermasterAttackSheet() {
  const frames = 4, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { frame: i, attacking: i >= 2, quartermaster: true });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}
export function createPirateQuartermasterDefendSheet() {
  const frames = 3, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { defending: true, quartermaster: true });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}

export function createPirateCaptainIdleSheet() {
  const frames = 4, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { frame: i, captain: true });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}
export function createPirateCaptainWalkSheet() {
  const frames = 4, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { frame: i, walking: true, captain: true });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}
export function createPirateCaptainAttackSheet() {
  const frames = 4, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { frame: i, attacking: i >= 2, captain: true });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}
export function createPirateCaptainDefendSheet() {
  const frames = 3, c = makeCanvas(frames, PIR_FW, PIR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawPirate(ctx, i * PIR_FW, 0, { defending: true, captain: true });
  return { canvas: c, frameWidth: PIR_FW, frameHeight: PIR_FH, frameCount: frames };
}

// ── CHEVALIER MAUDIT ──────────────────────────────────────────────────────────
const CKN_FW = 72, CKN_FH = 88;
const CKNC = {
  plate:  '#160A24', plateM: '#20103A', plateD: '#0A0514',
  trim:   '#440088', trimB:  '#6600BB', trimG:  '#8822DD',
  eye:    '#CC00FF', eyeC:   '#FF88FF',
  sword:  '#6A6870', swordD: '#3A3840', swordE: '#AAAACC',
  boot:   '#080010',
};

function drawCursedKnight(ctx, ox, oy, {
  bodyDY = 0, swordPos = 'normal', defending = false,
} = {}) {
  const b = bodyDY;

  // Sword (left side, behind body)
  if (!defending) {
    const sy = swordPos === 'raised' ? oy + 0 + b : oy + 14 + b;
    box(ctx, ox + 4, sy + 4, 5, 44, 1, CKNC.swordD, OC, 1);
    box(ctx, ox + 3, sy + 4, 3, 44, 0, CKNC.swordE, CKNC.swordE, 0);
    box(ctx, ox + 0, sy + 2, 13, 5, 2, CKNC.plate,  CKNC.plateD, 1);
    ctx.save(); ctx.shadowColor = CKNC.trimB; ctx.shadowBlur = 10;
    fillR(ctx, ox + 5, sy + 4, 3, 44, CKNC.trim);
    ctx.restore();
  }

  // Legs
  box(ctx, ox + 16, oy + 68 + b, 16, 18, 3, CKNC.plate, CKNC.plateD, 1);
  box(ctx, ox + 40, oy + 68 + b, 16, 18, 3, CKNC.plate, CKNC.plateD, 1);
  box(ctx, ox + 14, oy + 78 + b, 20,  8, 2, CKNC.boot,  OC, 1);
  box(ctx, ox + 38, oy + 78 + b, 20,  8, 2, CKNC.boot,  OC, 1);

  // Body
  box(ctx, ox + 10, oy + 36 + b, 52, 34, 5, CKNC.plate, CKNC.plateD, 1.5);
  // Chest rune
  ctx.save(); ctx.shadowColor = CKNC.trimB; ctx.shadowBlur = 10;
  circ(ctx, ox + 36, oy + 52 + b, 8, CKNC.plateM, CKNC.trimB, 2);
  circ(ctx, ox + 36, oy + 52 + b, 4, CKNC.trim,   CKNC.trimG, 0);
  ctx.restore();
  box(ctx, ox + 12, oy + 48 + b, 48, 2, 0, CKNC.plateD, CKNC.plateD, 0);
  box(ctx, ox + 12, oy + 60 + b, 48, 2, 0, CKNC.plateD, CKNC.plateD, 0);
  box(ctx, ox + 10, oy + 66 + b, 52, 5, 2, CKNC.plateD, OC, 1);

  // Shoulder pads + spikes
  box(ctx, ox +  2, oy + 32 + b, 14, 12, 3, CKNC.plateM, CKNC.plateD, 1);
  box(ctx, ox + 56, oy + 32 + b, 14, 12, 3, CKNC.plateM, CKNC.plateD, 1);
  poly(ctx, [[ox+9,  oy+30+b],[ox+6,  oy+22+b],[ox+12, oy+30+b]], CKNC.plateD, OC, 1);
  poly(ctx, [[ox+63, oy+30+b],[ox+66, oy+22+b],[ox+60, oy+30+b]], CKNC.plateD, OC, 1);

  // Arms
  box(ctx, ox +  0, oy + 40 + b, 12, 26, 3, CKNC.plate, CKNC.plateD, 1);
  box(ctx, ox + 60, oy + 40 + b, 12, 26, 3, CKNC.plate, CKNC.plateD, 1);
  box(ctx, ox +  0, oy + 62 + b, 12,  8, 2, CKNC.plateD, OC, 1);
  box(ctx, ox + 60, oy + 62 + b, 12,  8, 2, CKNC.plateD, OC, 1);

  // Helmet
  box(ctx, ox + 14, oy + 10 + b, 44, 28, 4, CKNC.plate, CKNC.plateD, 1.5);
  box(ctx, ox + 18, oy + 22 + b, 36,  8, 1, CKNC.trim,  CKNC.plateD, 1);
  ctx.save(); ctx.shadowColor = CKNC.eye; ctx.shadowBlur = 12;
  circ(ctx, ox + 28, oy + 26 + b, 3, CKNC.eye,  CKNC.eye,  0);
  circ(ctx, ox + 44, oy + 26 + b, 3, CKNC.eye,  CKNC.eye,  0);
  ctx.restore();
  circ(ctx, ox + 28, oy + 26 + b, 2, CKNC.eyeC, CKNC.eyeC, 0);
  circ(ctx, ox + 44, oy + 26 + b, 2, CKNC.eyeC, CKNC.eyeC, 0);
  poly(ctx, [[ox+26, oy+10+b],[ox+36, oy+2+b],[ox+46, oy+10+b]], CKNC.plateM, CKNC.plateD, 1);
}

export function createCursedKnightIdleSheet() {
  const frames = 4, c = makeCanvas(frames, CKN_FW, CKN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,1,0,1].forEach((dy, i) => drawCursedKnight(ctx, i * CKN_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: CKN_FW, frameHeight: CKN_FH, frameCount: frames };
}
export function createCursedKnightWalkSheet() {
  const frames = 4, c = makeCanvas(frames, CKN_FW, CKN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [{bodyDY:2},{bodyDY:0},{bodyDY:2},{bodyDY:0}].forEach((cfg, i) => drawCursedKnight(ctx, i * CKN_FW, 0, cfg));
  return { canvas: c, frameWidth: CKN_FW, frameHeight: CKN_FH, frameCount: frames };
}
export function createCursedKnightAttackSheet() {
  const frames = 4, c = makeCanvas(frames, CKN_FW, CKN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [
    { swordPos: 'normal' },
    { swordPos: 'raised', bodyDY: -2 },
    { swordPos: 'raised', bodyDY: -3 },
    { swordPos: 'normal', bodyDY:  2 },
  ].forEach((cfg, i) => drawCursedKnight(ctx, i * CKN_FW, 0, cfg));
  return { canvas: c, frameWidth: CKN_FW, frameHeight: CKN_FH, frameCount: frames };
}
export function createCursedKnightDefendSheet() {
  const frames = 3, c = makeCanvas(frames, CKN_FW, CKN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawCursedKnight(ctx, i * CKN_FW, 0, { defending: true });
  return { canvas: c, frameWidth: CKN_FW, frameHeight: CKN_FH, frameCount: frames };
}

// ── BÊTE DE LA JUNGLE ────────────────────────────────────────────────────────
const JB_FW = 80, JB_FH = 72;
const JBC = {
  fur:    '#1C2210', furM:  '#2E3818', furD:   '#0E1208',
  spot:   '#0A1008',
  muzzle: '#242E12',
  eye:    '#CCAA00', eyeC:  '#FFDD22',
  claw:   '#C4BC88', clawD: '#8C8460',
  fang:   '#DED896',
};

function drawJungleBeast(ctx, ox, oy, {
  frame = 0, walking = false, attacking = false,
} = {}) {
  const bobY = walking ? (frame % 2 === 0 ? 2 : -1) : 0;
  const oy2  = oy + bobY;

  // Tail
  poly(ctx, [[ox+68,oy2+38],[ox+80,oy2+32],[ox+78,oy2+44]], JBC.fur,  JBC.furD, 1);
  poly(ctx, [[ox+68,oy2+38],[ox+76,oy2+46],[ox+72,oy2+50]], JBC.furD, JBC.furD, 1);

  // Body (hunched, wide)
  box(ctx, ox + 14, oy2 + 24, 54, 32, 10, JBC.furM, JBC.furD, 1.5);
  circ(ctx, ox + 28, oy2 + 30, 4, JBC.spot, JBC.spot, 0);
  circ(ctx, ox + 52, oy2 + 28, 3, JBC.spot, JBC.spot, 0);
  circ(ctx, ox + 42, oy2 + 44, 4, JBC.spot, JBC.spot, 0);
  circ(ctx, ox + 22, oy2 + 46, 3, JBC.spot, JBC.spot, 0);

  // Forelegs / arms
  const armY = attacking ? oy2 + 16 : oy2 + 26;
  box(ctx, ox +  4, armY, 14, 26, 4, JBC.fur, JBC.furD, 1);
  box(ctx, ox + 62, armY, 14, 26, 4, JBC.fur, JBC.furD, 1);
  for (let i = 0; i < 3; i++) {
    fillR(ctx, ox +  5 + i * 4, armY + 24, 3, 6, JBC.claw);
    fillR(ctx, ox + 63 + i * 4, armY + 24, 3, 6, JBC.claw);
  }

  // Hind legs
  const ll = walking && frame % 2 === 0 ? oy2 + 48 : oy2 + 50;
  const rl = walking && frame % 2 === 1 ? oy2 + 48 : oy2 + 50;
  box(ctx, ox + 20, ll, 14, 18, 3, JBC.fur, JBC.furD, 1);
  box(ctx, ox + 46, rl, 14, 18, 3, JBC.fur, JBC.furD, 1);
  box(ctx, ox + 18, ll + 14, 18, 6, 2, JBC.furD, OC, 1);
  box(ctx, ox + 44, rl + 14, 18, 6, 2, JBC.furD, OC, 1);

  // Head
  const hx = attacking ? ox + 2 : ox + 10;
  box(ctx, hx,     oy2 + 4,  38, 28, 6, JBC.furM,   JBC.furD, 1.5);
  box(ctx, hx + 6, oy2 + 16, 26, 14, 5, JBC.muzzle, JBC.furD, 1);
  poly(ctx, [[hx+10,oy2+26],[hx+ 8,oy2+34],[hx+13,oy2+27]], JBC.fang, JBC.furD, 1);
  poly(ctx, [[hx+28,oy2+26],[hx+30,oy2+34],[hx+25,oy2+27]], JBC.fang, JBC.furD, 1);
  ctx.save(); ctx.shadowColor = JBC.eyeC; ctx.shadowBlur = 8;
  circ(ctx, hx +  9, oy2 + 12, 5, JBC.eye,  JBC.eye,  0);
  circ(ctx, hx + 29, oy2 + 12, 5, JBC.eye,  JBC.eye,  0);
  ctx.restore();
  circ(ctx, hx +  9, oy2 + 12, 3, JBC.eyeC, JBC.eyeC, 0);
  circ(ctx, hx + 29, oy2 + 12, 3, JBC.eyeC, JBC.eyeC, 0);
  poly(ctx, [[hx+ 4,oy2+4],[hx+ 0,oy2-4],[hx+10,oy2+6]], JBC.fur, JBC.furD, 1);
  poly(ctx, [[hx+34,oy2+4],[hx+38,oy2-4],[hx+28,oy2+6]], JBC.fur, JBC.furD, 1);
}

export function createJungleBeastIdleSheet() {
  const frames = 4, c = makeCanvas(frames, JB_FW, JB_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawJungleBeast(ctx, i * JB_FW, 0, { frame: i });
  return { canvas: c, frameWidth: JB_FW, frameHeight: JB_FH, frameCount: frames };
}
export function createJungleBeastWalkSheet() {
  const frames = 4, c = makeCanvas(frames, JB_FW, JB_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawJungleBeast(ctx, i * JB_FW, 0, { frame: i, walking: true });
  return { canvas: c, frameWidth: JB_FW, frameHeight: JB_FH, frameCount: frames };
}
export function createJungleBeastAttackSheet() {
  const frames = 4, c = makeCanvas(frames, JB_FW, JB_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawJungleBeast(ctx, i * JB_FW, 0, { frame: i, attacking: i >= 2 });
  return { canvas: c, frameWidth: JB_FW, frameHeight: JB_FH, frameCount: frames };
}
export function createJungleBeastDefendSheet() {
  const frames = 3, c = makeCanvas(frames, JB_FW, JB_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawJungleBeast(ctx, i * JB_FW, 0, {});
  return { canvas: c, frameWidth: JB_FW, frameHeight: JB_FH, frameCount: frames };
}

// ── SQUELETTE MAUDIT ─────────────────────────────────────────────────────────
const SKL_FW = 64, SKL_FH = 88;
const SKLC = {
  bone:   '#D4C890', boneM:  '#B8AC70', boneD:  '#786C30',
  eye:    '#FF6600', eyeC:   '#FFAA00',
  joint:  '#8C8050',
  hollow: '#120A00',
  sword:  '#A09060', swordD: '#706030', swordE: '#D8C880',
  armor:  '#7A7060', armorD: '#4A4030',
};

function drawSkeleton(ctx, ox, oy, {
  bodyDY = 0, swordPos = 'normal', defending = false,
} = {}) {
  const b = bodyDY;

  // Sword (left side)
  if (!defending) {
    const sy = swordPos === 'raised' ? oy + 2 + b : oy + 16 + b;
    box(ctx, ox + 4, sy,     4, 40, 1, SKLC.swordD, OC, 1);
    box(ctx, ox + 3, sy,     2, 40, 0, SKLC.swordE, SKLC.swordE, 0);
    box(ctx, ox + 0, sy - 2, 12,  5, 1, SKLC.armor,  SKLC.armorD, 1);
  }

  // Legs — femur
  box(ctx, ox + 16, oy + 62 + b, 10, 18, 2, SKLC.bone, SKLC.boneD, 1);
  box(ctx, ox + 38, oy + 62 + b, 10, 18, 2, SKLC.bone, SKLC.boneD, 1);
  circ(ctx, ox + 21, oy + 62 + b, 5, SKLC.joint, SKLC.boneD, 1);
  circ(ctx, ox + 43, oy + 62 + b, 5, SKLC.joint, SKLC.boneD, 1);
  // Tibia
  box(ctx, ox + 18, oy + 74 + b, 8, 14, 1, SKLC.bone, SKLC.boneD, 1);
  box(ctx, ox + 38, oy + 74 + b, 8, 14, 1, SKLC.bone, SKLC.boneD, 1);

  // Pelvis
  box(ctx, ox + 12, oy + 58 + b, 40, 8, 2, SKLC.bone, SKLC.boneD, 1);

  // Ribcage
  box(ctx, ox + 16, oy + 34 + b, 32, 26, 3, SKLC.bone, SKLC.boneD, 1.5);
  for (let r = 0; r < 3; r++) {
    box(ctx, ox + 16, oy + 36 + r * 8 + b, 32, 2, 0, SKLC.boneD, SKLC.boneD, 0);
  }
  box(ctx, ox + 28, oy + 34 + b, 8, 26, 1, SKLC.boneM, SKLC.boneD, 1);

  // Shoulder joints
  circ(ctx, ox + 16, oy + 36 + b, 5, SKLC.joint, SKLC.boneD, 1);
  circ(ctx, ox + 48, oy + 36 + b, 5, SKLC.joint, SKLC.boneD, 1);

  // Arms — humerus
  box(ctx, ox +  6, oy + 38 + b, 8, 18, 2, SKLC.bone, SKLC.boneD, 1);
  box(ctx, ox + 50, oy + 38 + b, 8, 18, 2, SKLC.bone, SKLC.boneD, 1);
  circ(ctx, ox + 10, oy + 54 + b, 4, SKLC.joint, SKLC.boneD, 1);
  circ(ctx, ox + 54, oy + 54 + b, 4, SKLC.joint, SKLC.boneD, 1);
  // Forearm
  box(ctx, ox +  6, oy + 56 + b, 8, 14, 1, SKLC.bone, SKLC.boneD, 1);
  box(ctx, ox + 50, oy + 56 + b, 8, 14, 1, SKLC.bone, SKLC.boneD, 1);

  // Skull — cranium
  box(ctx, ox + 16, oy + 8 + b, 32, 26, 8, SKLC.bone, SKLC.boneD, 1.5);
  box(ctx, ox + 14, oy + 26 + b,  8, 10, 2, SKLC.bone, SKLC.boneD, 1);
  box(ctx, ox + 42, oy + 26 + b,  8, 10, 2, SKLC.bone, SKLC.boneD, 1);
  // Eye sockets
  circ(ctx, ox + 24, oy + 20 + b, 6, SKLC.hollow, OC, 1.5);
  circ(ctx, ox + 40, oy + 20 + b, 6, SKLC.hollow, OC, 1.5);
  ctx.save(); ctx.shadowColor = SKLC.eyeC; ctx.shadowBlur = 8;
  circ(ctx, ox + 24, oy + 20 + b, 3, SKLC.eye,  SKLC.eye,  0);
  circ(ctx, ox + 40, oy + 20 + b, 3, SKLC.eye,  SKLC.eye,  0);
  ctx.restore();
  circ(ctx, ox + 24, oy + 20 + b, 2, SKLC.eyeC, SKLC.eyeC, 0);
  circ(ctx, ox + 40, oy + 20 + b, 2, SKLC.eyeC, SKLC.eyeC, 0);
  // Nasal cavity
  box(ctx, ox + 28, oy + 26 + b, 8, 5, 1, SKLC.hollow, OC, 1);
  // Teeth
  for (let t = 0; t < 6; t++) {
    box(ctx, ox + 17 + t * 5, oy + 32 + b, 4, 4, 1, SKLC.bone, SKLC.boneD, 1);
  }
}

export function createSkeletonIdleSheet() {
  const frames = 4, c = makeCanvas(frames, SKL_FW, SKL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,1,0,1].forEach((dy, i) => drawSkeleton(ctx, i * SKL_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: SKL_FW, frameHeight: SKL_FH, frameCount: frames };
}
export function createSkeletonWalkSheet() {
  const frames = 4, c = makeCanvas(frames, SKL_FW, SKL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [{bodyDY:2},{bodyDY:0},{bodyDY:2},{bodyDY:0}].forEach((cfg, i) => drawSkeleton(ctx, i * SKL_FW, 0, cfg));
  return { canvas: c, frameWidth: SKL_FW, frameHeight: SKL_FH, frameCount: frames };
}
export function createSkeletonAttackSheet() {
  const frames = 4, c = makeCanvas(frames, SKL_FW, SKL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [
    { swordPos: 'normal' },
    { swordPos: 'raised', bodyDY: -2 },
    { swordPos: 'raised', bodyDY: -3 },
    { swordPos: 'normal', bodyDY:  2 },
  ].forEach((cfg, i) => drawSkeleton(ctx, i * SKL_FW, 0, cfg));
  return { canvas: c, frameWidth: SKL_FW, frameHeight: SKL_FH, frameCount: frames };
}
export function createSkeletonDefendSheet() {
  const frames = 3, c = makeCanvas(frames, SKL_FW, SKL_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawSkeleton(ctx, i * SKL_FW, 0, { defending: true });
  return { canvas: c, frameWidth: SKL_FW, frameHeight: SKL_FH, frameCount: frames };
}

// ── LICHE ANCIENNE ───────────────────────────────────────────────────────────
const LCH_FW = 64, LCH_FH = 96;
const LCHC = {
  robe:   '#0A0A14', robeM:  '#121220', robeD:  '#060608',
  bone:   '#C0B880', boneD:  '#908860',
  eye:    '#00CC88', eyeC:   '#00FFAA',
  staff:  '#1A1008', staffD: '#0A0804',
  orb:    '#003A1A', orbG:   '#00AA55', orbB:   '#00FF88',
  decay:  '#1A3A12', decayB: '#44AA33',
  skull:  '#C4BC80', skullD: '#948C50',
  hollow: '#080A04',
};

function drawLich(ctx, ox, oy, {
  bodyDY = 0, staffPos = 'normal', defending = false,
} = {}) {
  const b = bodyDY;

  // Staff (left side)
  const staffY = staffPos === 'cast' ? oy + 0 + b : oy + 4 + b;
  box(ctx, ox + 3, staffY, 5, 72, 2, LCHC.staff, LCHC.staffD, 1);
  ctx.save(); ctx.shadowColor = LCHC.orbG; ctx.shadowBlur = 14;
  circ(ctx, ox + 5, staffY + 5, 9, LCHC.orb, OC, 1);
  ctx.restore();
  circ(ctx, ox + 5, staffY + 5, 6, LCHC.orbG, LCHC.orb, 0);
  circ(ctx, ox + 5, staffY + 5, 3, LCHC.orbB, LCHC.orbB, 0);
  poly(ctx, [[ox+1,staffY+4],[ox+5,staffY-4],[ox+9,staffY+4]], LCHC.orbG, LCHC.orbG, 0);
  poly(ctx, [[ox+2,staffY+3],[ox+5,staffY-2],[ox+8,staffY+3]], LCHC.orbB, LCHC.orbB, 0);

  // Tattered robe bottom
  poly(ctx, [[ox+14,oy+60+b],[ox+ 8,oy+92+b],[ox+24,oy+82+b]], LCHC.robeD, LCHC.robeD, 0);
  poly(ctx, [[ox+50,oy+60+b],[ox+56,oy+92+b],[ox+40,oy+82+b]], LCHC.robeD, LCHC.robeD, 0);
  poly(ctx, [[ox+22,oy+62+b],[ox+18,oy+94+b],[ox+32,oy+80+b]], LCHC.robe,  LCHC.robeD, 0);
  poly(ctx, [[ox+42,oy+62+b],[ox+46,oy+94+b],[ox+34,oy+80+b]], LCHC.robe,  LCHC.robeD, 0);
  box(ctx, ox + 24, oy + 62 + b, 16, 30, 0, LCHC.robeM, LCHC.robeD, 0);

  // Body robe
  box(ctx, ox + 12, oy + 34 + b, 40, 30, 5, LCHC.robeM, LCHC.robeD, 1.5);
  ctx.save(); ctx.shadowColor = LCHC.orbG; ctx.shadowBlur = 8;
  circ(ctx, ox + 32, oy + 50 + b, 7, LCHC.orb,  LCHC.orbG, 1.5);
  circ(ctx, ox + 32, oy + 50 + b, 4, LCHC.orbG, LCHC.orbB, 0);
  ctx.restore();
  box(ctx, ox + 12, oy + 46 + b, 40, 2, 0, LCHC.decay,  LCHC.decayB, 0);
  box(ctx, ox + 12, oy + 58 + b, 40, 2, 0, LCHC.decay,  LCHC.decayB, 0);

  // Arms (bony)
  box(ctx, ox +  4, oy + 38 + b, 10, 22, 2, LCHC.bone, LCHC.boneD, 1);
  box(ctx, ox + 50, oy + 38 + b, 10, 22, 2, LCHC.bone, LCHC.boneD, 1);
  for (let i = 0; i < 3; i++) {
    fillR(ctx, ox +  5 + i * 2, oy + 58 + b, 2, 5, LCHC.boneD);
    fillR(ctx, ox + 51 + i * 2, oy + 58 + b, 2, 5, LCHC.boneD);
  }

  // Cowl
  box(ctx, ox + 12, oy + 8 + b, 40, 10, 5, LCHC.robeD, OC, 1);
  poly(ctx, [[ox+12,oy+8+b],[ox+ 0,oy+4+b],[ox+18,oy+14+b]], LCHC.robeD, OC, 1);
  poly(ctx, [[ox+52,oy+8+b],[ox+64,oy+4+b],[ox+46,oy+14+b]], LCHC.robeD, OC, 1);

  // Skull face
  box(ctx, ox + 14, oy + 14 + b, 36, 22, 5, LCHC.skull, LCHC.skullD, 1.5);
  circ(ctx, ox + 24, oy + 22 + b, 6, LCHC.hollow, OC, 1.5);
  circ(ctx, ox + 40, oy + 22 + b, 6, LCHC.hollow, OC, 1.5);
  ctx.save(); ctx.shadowColor = LCHC.eyeC; ctx.shadowBlur = 12;
  circ(ctx, ox + 24, oy + 22 + b, 4, LCHC.eye,  LCHC.eye,  0);
  circ(ctx, ox + 40, oy + 22 + b, 4, LCHC.eye,  LCHC.eye,  0);
  ctx.restore();
  circ(ctx, ox + 24, oy + 22 + b, 2, LCHC.eyeC, LCHC.eyeC, 0);
  circ(ctx, ox + 40, oy + 22 + b, 2, LCHC.eyeC, LCHC.eyeC, 0);
  box(ctx, ox + 28, oy + 26 + b, 8, 5, 1, LCHC.hollow, OC, 1);
  for (let t = 0; t < 5; t++) {
    box(ctx, ox + 16 + t * 6, oy + 32 + b, 4, 4, 1, LCHC.skull, LCHC.skullD, 1);
  }
}

export function createLichIdleSheet() {
  const frames = 4, c = makeCanvas(frames, LCH_FW, LCH_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,1,0,1].forEach((dy, i) => drawLich(ctx, i * LCH_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: LCH_FW, frameHeight: LCH_FH, frameCount: frames };
}
export function createLichWalkSheet() {
  const frames = 4, c = makeCanvas(frames, LCH_FW, LCH_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [{bodyDY:1},{bodyDY:-1},{bodyDY:1},{bodyDY:0}].forEach((cfg, i) => drawLich(ctx, i * LCH_FW, 0, cfg));
  return { canvas: c, frameWidth: LCH_FW, frameHeight: LCH_FH, frameCount: frames };
}
export function createLichAttackSheet() {
  const frames = 4, c = makeCanvas(frames, LCH_FW, LCH_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [
    { staffPos: 'normal' },
    { staffPos: 'cast', bodyDY: -2 },
    { staffPos: 'cast', bodyDY: -3 },
    { staffPos: 'normal', bodyDY: 2 },
  ].forEach((cfg, i) => drawLich(ctx, i * LCH_FW, 0, cfg));
  return { canvas: c, frameWidth: LCH_FW, frameHeight: LCH_FH, frameCount: frames };
}
export function createLichDefendSheet() {
  const frames = 3, c = makeCanvas(frames, LCH_FW, LCH_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawLich(ctx, i * LCH_FW, 0, { defending: true });
  return { canvas: c, frameWidth: LCH_FW, frameHeight: LCH_FH, frameCount: frames };
}

// ── TROLL DU GIVRE ────────────────────────────────────────────────────────────
const FTR_FW = 80, FTR_FH = 96;
const FTRC = {
  skin:  '#4A7A90', skinD: '#2A5A70', skinL: '#6A9AB0',
  ice:   '#AADDFF', iceD:  '#88BBDD',
  eye:   '#00CCFF', eyeC:  '#AAEEFF',
  rock:  '#4A6878', rockD: '#2A4858',
  nail:  '#C8E8FF',
};

function drawFrostTroll(ctx, ox, oy, {
  frame = 0, walking = false, attacking = false, defending = false,
} = {}) {
  const bobY = walking ? (frame % 2 === 0 ? 2 : -1) : 0;
  const oy2  = oy + bobY;
  const armY = attacking ? oy2 + 24 : oy2 + 36;

  // Legs
  box(ctx, ox + 14, oy2 + 66, 20, 28, 4, FTRC.skin,  FTRC.skinD, 1.5);
  box(ctx, ox + 46, oy2 + 66, 20, 28, 4, FTRC.skin,  FTRC.skinD, 1.5);
  box(ctx, ox + 12, oy2 + 86, 24, 10, 2, FTRC.skinD, OC, 1);
  box(ctx, ox + 44, oy2 + 86, 24, 10, 2, FTRC.skinD, OC, 1);
  for (let i = 0; i < 3; i++) {
    fillR(ctx, ox + 14 + i * 6, oy2 + 94, 4, 6, FTRC.nail);
    fillR(ctx, ox + 46 + i * 6, oy2 + 94, 4, 6, FTRC.nail);
  }

  // Body
  box(ctx, ox + 10, oy2 + 36, 60, 34, 6, FTRC.skin, FTRC.skinD, 1.5);
  // Ice crystals on body
  ctx.save(); ctx.shadowColor = FTRC.eye; ctx.shadowBlur = 8;
  poly(ctx, [[ox+22,oy2+38],[ox+18,oy2+30],[ox+26,oy2+38]], FTRC.ice,  FTRC.iceD, 1);
  poly(ctx, [[ox+56,oy2+40],[ox+52,oy2+32],[ox+60,oy2+40]], FTRC.ice,  FTRC.iceD, 1);
  poly(ctx, [[ox+38,oy2+42],[ox+35,oy2+34],[ox+41,oy2+42]], FTRC.iceD, FTRC.eye,  1);
  ctx.restore();

  // Arms
  box(ctx, ox +  0, armY, 14, 30, 4, FTRC.skin, FTRC.skinD, 1.5);
  box(ctx, ox + 66, armY, 14, 30, 4, FTRC.skin, FTRC.skinD, 1.5);
  for (let i = 0; i < 3; i++) {
    fillR(ctx, ox + 2 + i * 4, armY + 28, 3, 6, FTRC.nail);
    fillR(ctx, ox + 67 + i * 4, armY + 28, 3, 6, FTRC.nail);
  }

  // Head
  box(ctx, ox + 14, oy2 + 4, 52, 34, 6, FTRC.skin, FTRC.skinD, 1.5);
  box(ctx, ox + 12, oy2 + 4, 56, 12, 3, FTRC.skinD, FTRC.skinD, 0);
  // Ice crown
  ctx.save(); ctx.shadowColor = FTRC.eye; ctx.shadowBlur = 6;
  box(ctx, ox + 12, oy2 + 2, 56, 6, 0, FTRC.rock, FTRC.rockD, 1);
  for (let i = 0; i < 4; i++) box(ctx, ox + 14 + i * 14, oy2 - 6, 10, 10, 1, FTRC.ice, FTRC.eye, 1);
  ctx.restore();
  // Eyes
  circ(ctx, ox + 28, oy2 + 18, 5, '#003344');
  circ(ctx, ox + 52, oy2 + 18, 5, '#003344');
  ctx.save(); ctx.shadowColor = FTRC.eyeC; ctx.shadowBlur = 10;
  circ(ctx, ox + 28, oy2 + 18, 3, FTRC.eye,  FTRC.eye,  0);
  circ(ctx, ox + 52, oy2 + 18, 3, FTRC.eye,  FTRC.eye,  0);
  ctx.restore();
  // Tusks
  poly(ctx, [[ox+26,oy2+32],[ox+22,oy2+40],[ox+28,oy2+32]], FTRC.ice,  FTRC.iceD, 1);
  poly(ctx, [[ox+54,oy2+32],[ox+58,oy2+40],[ox+52,oy2+32]], FTRC.ice,  FTRC.iceD, 1);
}

export function createFrostTrollIdleSheet() {
  const frames = 4, c = makeCanvas(frames, FTR_FW, FTR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawFrostTroll(ctx, i * FTR_FW, 0, { frame: i });
  return { canvas: c, frameWidth: FTR_FW, frameHeight: FTR_FH, frameCount: frames };
}
export function createFrostTrollWalkSheet() {
  const frames = 4, c = makeCanvas(frames, FTR_FW, FTR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawFrostTroll(ctx, i * FTR_FW, 0, { frame: i, walking: true });
  return { canvas: c, frameWidth: FTR_FW, frameHeight: FTR_FH, frameCount: frames };
}
export function createFrostTrollAttackSheet() {
  const frames = 4, c = makeCanvas(frames, FTR_FW, FTR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawFrostTroll(ctx, i * FTR_FW, 0, { frame: i, attacking: i >= 2 });
  return { canvas: c, frameWidth: FTR_FW, frameHeight: FTR_FH, frameCount: frames };
}
export function createFrostTrollDefendSheet() {
  const frames = 3, c = makeCanvas(frames, FTR_FW, FTR_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawFrostTroll(ctx, i * FTR_FW, 0, { defending: true });
  return { canvas: c, frameWidth: FTR_FW, frameHeight: FTR_FH, frameCount: frames };
}

// ── SORCIÈRE DE GLACE ─────────────────────────────────────────────────────────
const IW_FW = 64, IW_FH = 88;
const IWC = {
  robe:   '#0E1E34', robeD:  '#060E1C', robeM:  '#1A2E48',
  hair:   '#E8F0FF', hairG:  '#A8C0E0',
  skin:   '#8090A8', skinL:  '#A0B0C8',
  eye:    '#00AAFF', eyeC:   '#88DDFF',
  staff:  '#1A2030', staffD: '#0C1020',
  orb:    '#0044AA', orbG:   '#0088FF', orbB:   '#88CCFF',
  ice:    '#AADDFF', iceD:   '#6699CC',
};

function drawIceWitch(ctx, ox, oy, {
  bodyDY = 0, staffPos = 'normal', defending = false,
} = {}) {
  const b = bodyDY;
  const staffY = staffPos === 'cast' ? oy + 0 + b : oy + 4 + b;

  // Staff + ice orb
  box(ctx, ox + 2, staffY, 5, 70, 2, IWC.staff, IWC.staffD, 1);
  ctx.save(); ctx.shadowColor = IWC.orbG; ctx.shadowBlur = 14;
  circ(ctx, ox + 4, staffY + 4, 8, IWC.orb, OC, 1);
  ctx.restore();
  circ(ctx, ox + 4, staffY + 4, 5, IWC.orbG, IWC.orb, 0);
  circ(ctx, ox + 4, staffY + 4, 3, IWC.orbB, IWC.orbB, 0);
  // Ice shards around orb
  poly(ctx, [[ox+0,staffY+2],[ox+4,staffY-6],[ox+8,staffY+2]], IWC.ice, IWC.iceD, 0);
  poly(ctx, [[ox-2,staffY+6],[ox+4,staffY-2],[ox+10,staffY+6]], IWC.iceD, IWC.eye, 0);

  // Hair (behind head)
  poly(ctx, [[ox+16,oy+12+b],[ox+8, oy+2+b],[ox+22,oy+22+b]], IWC.hairG, IWC.hairG, 0);
  poly(ctx, [[ox+48,oy+12+b],[ox+56,oy+2+b],[ox+42,oy+22+b]], IWC.hairG, IWC.hairG, 0);
  box(ctx, ox + 14, oy + 6 + b, 36, 14, 4, IWC.hair, IWC.hairG, 1);

  // Head
  box(ctx, ox + 18, oy + 14 + b, 28, 20, 4, IWC.skin, OC, 1.5);
  // Eyes
  ctx.save(); ctx.shadowColor = IWC.eyeC; ctx.shadowBlur = 8;
  circ(ctx, ox + 26, oy + 22 + b, 4, IWC.eye,  IWC.eye,  0);
  circ(ctx, ox + 38, oy + 22 + b, 4, IWC.eye,  IWC.eye,  0);
  ctx.restore();
  circ(ctx, ox + 26, oy + 22 + b, 2, IWC.eyeC, IWC.eyeC, 0);
  circ(ctx, ox + 38, oy + 22 + b, 2, IWC.eyeC, IWC.eyeC, 0);
  // Ice crown
  ctx.save(); ctx.shadowColor = IWC.eye; ctx.shadowBlur = 6;
  for (let i = 0; i < 3; i++) {
    poly(ctx, [[ox+22+i*10,oy+14+b],[ox+24+i*10,oy+8+b],[ox+28+i*10,oy+14+b]], IWC.ice, IWC.eye, 1);
  }
  ctx.restore();

  // Body robe
  box(ctx, ox + 12, oy + 34 + b, 40, 34, 5, IWC.robeM, IWC.robeD, 1.5);
  // Ice crystal on chest
  ctx.save(); ctx.shadowColor = IWC.eye; ctx.shadowBlur = 8;
  poly(ctx, [[ox+29,oy+46+b],[ox+32,oy+38+b],[ox+35,oy+46+b],[ox+32,oy+54+b]], IWC.ice, IWC.eye, 1.5);
  ctx.restore();
  // Robe trim
  box(ctx, ox + 12, oy + 46 + b, 40, 2, 0, IWC.iceD, IWC.eye, 0);
  box(ctx, ox + 12, oy + 60 + b, 40, 2, 0, IWC.iceD, IWC.eye, 0);
  // Robe bottom
  poly(ctx, [[ox+12,oy+68+b],[ox+6, oy+88+b],[ox+20,oy+80+b]], IWC.robeD, IWC.robeD, 0);
  poly(ctx, [[ox+52,oy+68+b],[ox+58,oy+88+b],[ox+44,oy+80+b]], IWC.robeD, IWC.robeD, 0);
  box(ctx, ox + 22, oy + 66 + b, 20, 24, 0, IWC.robeM, IWC.robeD, 0);

  // Arms
  box(ctx, ox + 4,  oy + 38 + b, 10, 22, 2, IWC.skin, OC, 1);
  box(ctx, ox + 50, oy + 38 + b, 10, 22, 2, IWC.skin, OC, 1);
}

export function createIceWitchIdleSheet() {
  const frames = 4, c = makeCanvas(frames, IW_FW, IW_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,1,0,1].forEach((dy, i) => drawIceWitch(ctx, i * IW_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: IW_FW, frameHeight: IW_FH, frameCount: frames };
}
export function createIceWitchWalkSheet() {
  const frames = 4, c = makeCanvas(frames, IW_FW, IW_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [{bodyDY:1},{bodyDY:-1},{bodyDY:1},{bodyDY:0}].forEach((cfg, i) => drawIceWitch(ctx, i * IW_FW, 0, cfg));
  return { canvas: c, frameWidth: IW_FW, frameHeight: IW_FH, frameCount: frames };
}
export function createIceWitchAttackSheet() {
  const frames = 4, c = makeCanvas(frames, IW_FW, IW_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [
    { staffPos: 'normal' }, { staffPos: 'cast', bodyDY: -2 },
    { staffPos: 'cast', bodyDY: -3 }, { staffPos: 'normal', bodyDY: 2 },
  ].forEach((cfg, i) => drawIceWitch(ctx, i * IW_FW, 0, cfg));
  return { canvas: c, frameWidth: IW_FW, frameHeight: IW_FH, frameCount: frames };
}
export function createIceWitchDefendSheet() {
  const frames = 3, c = makeCanvas(frames, IW_FW, IW_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawIceWitch(ctx, i * IW_FW, 0, { defending: true });
  return { canvas: c, frameWidth: IW_FW, frameHeight: IW_FH, frameCount: frames };
}

// ── CHEVALIER FANTÔME ────────────────────────────────────────────────────────
const GHK_FW = 72, GHK_FH = 88;
const GHKC = {
  plate:  '#4A5060', plateM: '#5A6070', plateD: '#2A3040',
  glow:   '#AABBFF', glowB:  '#DDEEFF',
  eye:    '#88AAFF', eyeC:   '#CCDDFF',
  ecto:   '#8090B0', ectoD:  '#606880',
  sword:  '#9090A8', swordD: '#606070', swordE: '#D0D0E8',
  boot:   '#2A3040',
};

function drawGhostKnight(ctx, ox, oy, {
  bodyDY = 0, swordPos = 'normal', defending = false, phase2 = false,
} = {}) {
  const b   = bodyDY;
  const alp = phase2 ? 1.0 : 0.78;
  ctx.save(); ctx.globalAlpha = alp;

  // Sword (left, behind body)
  if (!defending) {
    const sy = swordPos === 'raised' ? oy + 0 + b : oy + 14 + b;
    box(ctx, ox + 4, sy + 4, 5, 44, 1, GHKC.swordD, OC, 1);
    box(ctx, ox + 3, sy + 4, 3, 44, 0, GHKC.swordE, GHKC.swordE, 0);
    box(ctx, ox + 0, sy + 2, 13, 5, 2, GHKC.plate,  GHKC.plateD, 1);
    ctx.save(); ctx.shadowColor = GHKC.glow; ctx.shadowBlur = 12;
    fillR(ctx, ox + 5, sy + 4, 3, 44, GHKC.ecto);
    ctx.restore();
  }

  // Ectoplasm wisps (ethereal effect)
  if (!phase2) {
    ctx.save(); ctx.globalAlpha = 0.35;
    circ(ctx, ox + 36, oy + 80 + b, 14, GHKC.glow, GHKC.glow, 0);
    circ(ctx, ox + 20, oy + 75 + b, 8,  GHKC.glow, GHKC.glow, 0);
    circ(ctx, ox + 52, oy + 72 + b, 6,  GHKC.glow, GHKC.glow, 0);
    ctx.restore();
  }

  // Legs
  box(ctx, ox + 16, oy + 66 + b, 16, 20, 3, GHKC.plate, GHKC.plateD, 1);
  box(ctx, ox + 40, oy + 66 + b, 16, 20, 3, GHKC.plate, GHKC.plateD, 1);
  box(ctx, ox + 14, oy + 78 + b, 20,  8, 2, GHKC.boot,  OC, 1);
  box(ctx, ox + 38, oy + 78 + b, 20,  8, 2, GHKC.boot,  OC, 1);

  // Body
  box(ctx, ox + 10, oy + 36 + b, 52, 32, 5, GHKC.plate, GHKC.plateD, 1.5);
  ctx.save(); ctx.shadowColor = GHKC.glow; ctx.shadowBlur = 10;
  circ(ctx, ox + 36, oy + 52 + b, 7, GHKC.ecto, GHKC.glowB, 1.5);
  ctx.restore();
  box(ctx, ox + 12, oy + 48 + b, 48, 2, 0, GHKC.plateD, GHKC.plateD, 0);
  box(ctx, ox + 12, oy + 60 + b, 48, 2, 0, GHKC.plateD, GHKC.plateD, 0);
  box(ctx, ox + 10, oy + 64 + b, 52, 5, 2, GHKC.plateD, OC, 1);

  // Shoulders
  box(ctx, ox +  2, oy + 32 + b, 14, 12, 3, GHKC.plateM, GHKC.plateD, 1);
  box(ctx, ox + 56, oy + 32 + b, 14, 12, 3, GHKC.plateM, GHKC.plateD, 1);

  // Arms
  box(ctx, ox +  0, oy + 40 + b, 12, 26, 3, GHKC.plate,  GHKC.plateD, 1);
  box(ctx, ox + 60, oy + 40 + b, 12, 26, 3, GHKC.plate,  GHKC.plateD, 1);
  box(ctx, ox +  0, oy + 62 + b, 12,  8, 2, GHKC.plateD, OC, 1);
  box(ctx, ox + 60, oy + 62 + b, 12,  8, 2, GHKC.plateD, OC, 1);

  // Helmet
  box(ctx, ox + 14, oy + 10 + b, 44, 28, 4, GHKC.plate, GHKC.plateD, 1.5);
  box(ctx, ox + 18, oy + 22 + b, 36,  8, 1, GHKC.ecto,  GHKC.plateD, 1);
  ctx.save(); ctx.shadowColor = GHKC.eyeC; ctx.shadowBlur = 14;
  circ(ctx, ox + 28, oy + 26 + b, 3, GHKC.eye,  GHKC.eye,  0);
  circ(ctx, ox + 44, oy + 26 + b, 3, GHKC.eye,  GHKC.eye,  0);
  ctx.restore();
  circ(ctx, ox + 28, oy + 26 + b, 2, GHKC.eyeC, GHKC.eyeC, 0);
  circ(ctx, ox + 44, oy + 26 + b, 2, GHKC.eyeC, GHKC.eyeC, 0);
  poly(ctx, [[ox+26,oy+10+b],[ox+36,oy+2+b],[ox+46,oy+10+b]], GHKC.plateM, GHKC.plateD, 1);

  ctx.restore();
}

export function createGhostKnightIdleSheet() {
  const frames = 4, c = makeCanvas(frames, GHK_FW, GHK_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,1,0,1].forEach((dy, i) => drawGhostKnight(ctx, i * GHK_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: GHK_FW, frameHeight: GHK_FH, frameCount: frames };
}
export function createGhostKnightWalkSheet() {
  const frames = 4, c = makeCanvas(frames, GHK_FW, GHK_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [{bodyDY:2},{bodyDY:0},{bodyDY:2},{bodyDY:0}].forEach((cfg, i) => drawGhostKnight(ctx, i * GHK_FW, 0, cfg));
  return { canvas: c, frameWidth: GHK_FW, frameHeight: GHK_FH, frameCount: frames };
}
export function createGhostKnightAttackSheet() {
  const frames = 4, c = makeCanvas(frames, GHK_FW, GHK_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [
    { swordPos: 'normal' }, { swordPos: 'raised', bodyDY: -2 },
    { swordPos: 'raised', bodyDY: -3 }, { swordPos: 'normal', bodyDY: 2 },
  ].forEach((cfg, i) => drawGhostKnight(ctx, i * GHK_FW, 0, cfg));
  return { canvas: c, frameWidth: GHK_FW, frameHeight: GHK_FH, frameCount: frames };
}
export function createGhostKnightDefendSheet() {
  const frames = 3, c = makeCanvas(frames, GHK_FW, GHK_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawGhostKnight(ctx, i * GHK_FW, 0, { defending: true });
  return { canvas: c, frameWidth: GHK_FW, frameHeight: GHK_FH, frameCount: frames };
}

// ── COMTE VAMPIRE ─────────────────────────────────────────────────────────────
const VAM_FW = 64, VAM_FH = 96;
const VAMC = {
  cape:   '#100010', capeM:  '#1A041A', capeD:  '#080008',
  suit:   '#1A0A1A', suitD:  '#0C040C',
  skin:   '#C8C0B8', skinD:  '#A8A098',
  eye:    '#CC0000', eyeC:   '#FF4444',
  fang:   '#F0EAE0',
  cravat: '#AA0000',
  hair:   '#080008',
  boot:   '#060006',
};

function drawVampire(ctx, ox, oy, {
  bodyDY = 0, capeOpen = false, defending = false,
} = {}) {
  const b = bodyDY;

  // Cape (behind body, flowing)
  poly(ctx, [[ox+8, oy+32+b],[ox+0, oy+90+b],[ox+22,oy+78+b]], VAMC.capeM, VAMC.capeD, 0);
  poly(ctx, [[ox+56,oy+32+b],[ox+64,oy+90+b],[ox+42,oy+78+b]], VAMC.capeM, VAMC.capeD, 0);
  if (capeOpen) {
    poly(ctx, [[ox+4, oy+34+b],[ox-4, oy+88+b],[ox+18,oy+74+b]], VAMC.cape, VAMC.capeD, 0);
    poly(ctx, [[ox+60,oy+34+b],[ox+68,oy+88+b],[ox+46,oy+74+b]], VAMC.cape, VAMC.capeD, 0);
  }

  // Legs
  box(ctx, ox + 18, oy + 66 + b, 12, 24, 2, VAMC.suit, VAMC.suitD, 1);
  box(ctx, ox + 34, oy + 66 + b, 12, 24, 2, VAMC.suit, VAMC.suitD, 1);
  box(ctx, ox + 16, oy + 82 + b, 16,  8, 2, VAMC.boot, OC, 1);
  box(ctx, ox + 32, oy + 82 + b, 16,  8, 2, VAMC.boot, OC, 1);

  // Body / suit
  box(ctx, ox + 14, oy + 34 + b, 36, 34, 4, VAMC.suit, VAMC.suitD, 1.5);
  // White shirt / cravat
  box(ctx, ox + 24, oy + 34 + b, 16, 20, 2, '#E8E0D8', '#C0B8B0', 1);
  ctx.save(); ctx.shadowColor = VAMC.eye; ctx.shadowBlur = 4;
  box(ctx, ox + 28, oy + 36 + b, 8, 14, 1, VAMC.cravat, '#880000', 1);
  ctx.restore();

  // Cape collar (on top of body)
  poly(ctx, [[ox+14,oy+32+b],[ox+10,oy+24+b],[ox+22,oy+36+b]], VAMC.cape, VAMC.capeD, 1);
  poly(ctx, [[ox+50,oy+32+b],[ox+54,oy+24+b],[ox+42,oy+36+b]], VAMC.cape, VAMC.capeD, 1);

  // Arms
  box(ctx, ox +  4, oy + 36 + b, 12, 26, 2, VAMC.suit, VAMC.suitD, 1);
  box(ctx, ox + 48, oy + 36 + b, 12, 26, 2, VAMC.suit, VAMC.suitD, 1);
  box(ctx, ox +  4, oy + 58 + b, 12,  8, 2, VAMC.skin, VAMC.skinD, 1);
  box(ctx, ox + 48, oy + 58 + b, 12,  8, 2, VAMC.skin, VAMC.skinD, 1);

  // Head
  box(ctx, ox + 16, oy + 8 + b, 32, 26, 5, VAMC.skin, VAMC.skinD, 1.5);
  // Hair
  box(ctx, ox + 14, oy + 8 + b, 36, 10, 4, VAMC.hair, '#000', 1);
  // Widow's peak
  poly(ctx, [[ox+28,oy+8+b],[ox+32,oy+2+b],[ox+36,oy+8+b]], VAMC.hair, OC, 1);
  // Eyes
  ctx.save(); ctx.shadowColor = VAMC.eyeC; ctx.shadowBlur = 8;
  circ(ctx, ox + 25, oy + 20 + b, 4, VAMC.eye,  VAMC.eye,  0);
  circ(ctx, ox + 39, oy + 20 + b, 4, VAMC.eye,  VAMC.eye,  0);
  ctx.restore();
  circ(ctx, ox + 25, oy + 20 + b, 2, VAMC.eyeC, VAMC.eyeC, 0);
  circ(ctx, ox + 39, oy + 20 + b, 2, VAMC.eyeC, VAMC.eyeC, 0);
  // Mouth + fangs
  box(ctx, ox + 22, oy + 28 + b, 20, 4, 1, VAMC.skinD, VAMC.skinD, 0);
  poly(ctx, [[ox+26,oy+28+b],[ox+24,oy+34+b],[ox+28,oy+29+b]], VAMC.fang, VAMC.skinD, 1);
  poly(ctx, [[ox+38,oy+28+b],[ox+40,oy+34+b],[ox+36,oy+29+b]], VAMC.fang, VAMC.skinD, 1);
}

export function createVampireIdleSheet() {
  const frames = 4, c = makeCanvas(frames, VAM_FW, VAM_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [0,1,0,1].forEach((dy, i) => drawVampire(ctx, i * VAM_FW, 0, { bodyDY: dy }));
  return { canvas: c, frameWidth: VAM_FW, frameHeight: VAM_FH, frameCount: frames };
}
export function createVampireWalkSheet() {
  const frames = 4, c = makeCanvas(frames, VAM_FW, VAM_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [{bodyDY:1},{bodyDY:-1},{bodyDY:1},{bodyDY:0}].forEach((cfg, i) => drawVampire(ctx, i * VAM_FW, 0, cfg));
  return { canvas: c, frameWidth: VAM_FW, frameHeight: VAM_FH, frameCount: frames };
}
export function createVampireAttackSheet() {
  const frames = 4, c = makeCanvas(frames, VAM_FW, VAM_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  [
    {}, { capeOpen: true, bodyDY: -2 },
    { capeOpen: true, bodyDY: -3 }, { bodyDY: 2 },
  ].forEach((cfg, i) => drawVampire(ctx, i * VAM_FW, 0, cfg));
  return { canvas: c, frameWidth: VAM_FW, frameHeight: VAM_FH, frameCount: frames };
}
export function createVampireDefendSheet() {
  const frames = 3, c = makeCanvas(frames, VAM_FW, VAM_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawVampire(ctx, i * VAM_FW, 0, { defending: true });
  return { canvas: c, frameWidth: VAM_FW, frameHeight: VAM_FH, frameCount: frames };
}

// ── DÉMONS (GUERRIER & SEIGNEUR) ──────────────────────────────────────────────
const DMN_FW = 80, DMN_FH = 100;
const DMNC = {
  skin:   '#8A1A0A', skinD:  '#5A0A00', skinL:  '#AA3020',
  armor:  '#2A0808', armorM: '#3A1010', armorD: '#180404',
  fire:   '#FF4400', fireB:  '#FF8800', fireBr: '#FFCC00',
  eye:    '#FF2200', eyeC:   '#FF8844',
  horn:   '#1A0808', hornD:  '#0A0404',
  sword:  '#6A4820', swordD: '#3A2010', swordE: '#FF6600',
  wing:   '#280408', wingD:  '#180204',
  crown:  '#4A0808', crownG: '#AA2020',
  boot:   '#1A0408',
};

function drawDemon(ctx, ox, oy, {
  frame = 0, walking = false, attacking = false, defending = false, lord = false,
} = {}) {
  const bobY = walking ? (frame % 2 === 0 ? 2 : -1) : 0;
  const oy2  = oy + bobY;
  const bodyW = lord ? 60 : 52;
  const bodyX = lord ? ox + 10 : ox + 14;
  const armY  = attacking ? oy2 + 28 : oy2 + 38;

  // Wings (lord only, behind body)
  if (lord) {
    poly(ctx, [[ox+10,oy2+36],[ox-10,oy2+14],[ox+4, oy2+60]], DMNC.wing, DMNC.wingD, 1);
    poly(ctx, [[ox+70,oy2+36],[ox+90,oy2+14],[ox+76,oy2+60]], DMNC.wing, DMNC.wingD, 1);
    poly(ctx, [[ox+10,oy2+36],[ox-6, oy2+18],[ox+2, oy2+58]], DMNC.wingD, DMNC.wingD, 0);
    poly(ctx, [[ox+70,oy2+36],[ox+86,oy2+18],[ox+78,oy2+58]], DMNC.wingD, DMNC.wingD, 0);
  }

  // Legs
  box(ctx, bodyX + 4,  oy2 + 68, 18, 28, 4, DMNC.skin, DMNC.skinD, 1.5);
  box(ctx, bodyX + 30, oy2 + 68, 18, 28, 4, DMNC.skin, DMNC.skinD, 1.5);
  box(ctx, bodyX + 2,  oy2 + 86, 22, 10, 2, DMNC.boot, OC, 1);
  box(ctx, bodyX + 28, oy2 + 86, 22, 10, 2, DMNC.boot, OC, 1);

  // Body
  box(ctx, bodyX, oy2 + 36, bodyW, 34, 6, DMNC.skin, DMNC.skinD, 1.5);
  // Armor plates
  box(ctx, bodyX + 4, oy2 + 38, bodyW - 8, 26, 3, DMNC.armor, DMNC.armorD, 1);
  ctx.save(); ctx.shadowColor = DMNC.fire; ctx.shadowBlur = 8;
  circ(ctx, ox + 40, oy2 + 52, 8, DMNC.armorM, DMNC.fire, 2);
  circ(ctx, ox + 40, oy2 + 52, 5, DMNC.fire,   DMNC.fireB, 0);
  ctx.restore();
  box(ctx, bodyX, oy2 + 64, bodyW, 6, 2, DMNC.armorD, OC, 1);

  // Arms (large)
  box(ctx, ox +  2, armY, 14, 28, 4, DMNC.skin, DMNC.skinD, 1.5);
  box(ctx, ox + 64, armY, 14, 28, 4, DMNC.skin, DMNC.skinD, 1.5);
  // Armor bracers
  box(ctx, ox +  2, armY + 14, 14, 8, 2, DMNC.armor, DMNC.armorD, 1);
  box(ctx, ox + 64, armY + 14, 14, 8, 2, DMNC.armor, DMNC.armorD, 1);

  // Flaming sword (right side)
  const swX = attacking ? ox + 60 : ox + 62;
  box(ctx, swX, armY + 4, 5, 36, 1, DMNC.sword,  DMNC.swordD, 1);
  box(ctx, swX - 5, armY, 15, 6,  1, DMNC.swordD, DMNC.swordD, 1);
  ctx.save(); ctx.shadowColor = DMNC.fire; ctx.shadowBlur = 12;
  box(ctx, swX + 1, armY + 4, 3, 36, 0, DMNC.fire, DMNC.fire, 0);
  for (let f = 0; f < 4; f++) {
    poly(ctx, [[swX+1,armY+8+f*8],[swX+3,armY+4+f*8],[swX+5,armY+8+f*8]], DMNC.fireB, DMNC.fireB, 0);
  }
  ctx.restore();

  // Shoulder pads
  box(ctx, ox +  4, oy2 + 32, 16, 12, 3, DMNC.armorM, DMNC.armorD, 1);
  box(ctx, ox + 60, oy2 + 32, 16, 12, 3, DMNC.armorM, DMNC.armorD, 1);
  // Shoulder spikes
  poly(ctx, [[ox+12, oy2+30],[ox+8,  oy2+22],[ox+16, oy2+30]], DMNC.skinD, OC, 1);
  poly(ctx, [[ox+68, oy2+30],[ox+72, oy2+22],[ox+64, oy2+30]], DMNC.skinD, OC, 1);

  // Head
  box(ctx, ox + 18, oy2 + 8, 44, 28, 5, DMNC.skin, DMNC.skinD, 1.5);
  // Horns
  poly(ctx, [[ox+22,oy2+8],[ox+14,oy2-8],[ox+28,oy2+10]], DMNC.horn, DMNC.hornD, 1);
  poly(ctx, [[ox+58,oy2+8],[ox+66,oy2-8],[ox+52,oy2+10]], DMNC.horn, DMNC.hornD, 1);
  if (lord) {
    poly(ctx, [[ox+30,oy2+6],[ox+24,oy2-4],[ox+36,oy2+8]], DMNC.horn, DMNC.hornD, 1);
    poly(ctx, [[ox+50,oy2+6],[ox+56,oy2-4],[ox+44,oy2+8]], DMNC.horn, DMNC.hornD, 1);
  }
  // Eyes
  ctx.save(); ctx.shadowColor = DMNC.eyeC; ctx.shadowBlur = 10;
  circ(ctx, ox + 28, oy2 + 20, 5, DMNC.eye,  DMNC.eye,  0);
  circ(ctx, ox + 52, oy2 + 20, 5, DMNC.eye,  DMNC.eye,  0);
  ctx.restore();
  circ(ctx, ox + 28, oy2 + 20, 3, DMNC.eyeC, DMNC.eyeC, 0);
  circ(ctx, ox + 52, oy2 + 20, 3, DMNC.eyeC, DMNC.eyeC, 0);
  // Maw
  box(ctx, ox + 26, oy2 + 28, 28, 6, 2, DMNC.skinD, OC, 1);
  for (let t = 0; t < 5; t++) {
    poly(ctx, [[ox+27+t*5,oy2+28],[ox+28+t*5,oy2+34],[ox+31+t*5,oy2+28]], DMNC.eyeC, DMNC.skinD, 1);
  }
  // Lord crown
  if (lord) {
    box(ctx, ox + 16, oy2 + 6, 48, 6, 1, DMNC.crown, DMNC.crownG, 1);
    ctx.save(); ctx.shadowColor = DMNC.fire; ctx.shadowBlur = 6;
    for (let i = 0; i < 3; i++) box(ctx, ox + 20 + i * 16, oy2, 10, 8, 1, DMNC.crownG, DMNC.fire, 1);
    ctx.restore();
  }
}

export function createDemonWarriorIdleSheet() {
  const frames = 4, c = makeCanvas(frames, DMN_FW, DMN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDemon(ctx, i * DMN_FW, 0, { frame: i });
  return { canvas: c, frameWidth: DMN_FW, frameHeight: DMN_FH, frameCount: frames };
}
export function createDemonWarriorWalkSheet() {
  const frames = 4, c = makeCanvas(frames, DMN_FW, DMN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDemon(ctx, i * DMN_FW, 0, { frame: i, walking: true });
  return { canvas: c, frameWidth: DMN_FW, frameHeight: DMN_FH, frameCount: frames };
}
export function createDemonWarriorAttackSheet() {
  const frames = 4, c = makeCanvas(frames, DMN_FW, DMN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDemon(ctx, i * DMN_FW, 0, { frame: i, attacking: i >= 2 });
  return { canvas: c, frameWidth: DMN_FW, frameHeight: DMN_FH, frameCount: frames };
}
export function createDemonWarriorDefendSheet() {
  const frames = 3, c = makeCanvas(frames, DMN_FW, DMN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDemon(ctx, i * DMN_FW, 0, { defending: true });
  return { canvas: c, frameWidth: DMN_FW, frameHeight: DMN_FH, frameCount: frames };
}

export function createDemonLordIdleSheet() {
  const frames = 4, c = makeCanvas(frames, DMN_FW, DMN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDemon(ctx, i * DMN_FW, 0, { frame: i, lord: true });
  return { canvas: c, frameWidth: DMN_FW, frameHeight: DMN_FH, frameCount: frames };
}
export function createDemonLordWalkSheet() {
  const frames = 4, c = makeCanvas(frames, DMN_FW, DMN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDemon(ctx, i * DMN_FW, 0, { frame: i, walking: true, lord: true });
  return { canvas: c, frameWidth: DMN_FW, frameHeight: DMN_FH, frameCount: frames };
}
export function createDemonLordAttackSheet() {
  const frames = 4, c = makeCanvas(frames, DMN_FW, DMN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDemon(ctx, i * DMN_FW, 0, { frame: i, attacking: i >= 2, lord: true });
  return { canvas: c, frameWidth: DMN_FW, frameHeight: DMN_FH, frameCount: frames };
}
export function createDemonLordDefendSheet() {
  const frames = 3, c = makeCanvas(frames, DMN_FW, DMN_FH);
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawDemon(ctx, i * DMN_FW, 0, { defending: true, lord: true });
  return { canvas: c, frameWidth: DMN_FW, frameHeight: DMN_FH, frameCount: frames };
}
