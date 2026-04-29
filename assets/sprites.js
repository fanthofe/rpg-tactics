// Flat Bold style — formes géométriques avec stroke noir épais

const HERO_FW = 72;
const HERO_FH = 96;
const GOB_FW  = 72;
const GOB_FH  = 84;
const SW = 2.5;      // stroke width
const OC = '#1A1A2E'; // outline color

function makeCanvas(frames, fw, fh) {
  const c = document.createElement('canvas');
  c.width  = fw * frames;
  c.height = fh;
  return c;
}

// Rounded rect path helper (compatible tous navigateurs)
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
  ctx.arcTo(x,     y,     x + r, y,          r);
  ctx.closePath();
}

// Rect arrondi rempli + contour
function box(ctx, x, y, w, h, r, fill, stroke = OC, sw = SW) {
  rrPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (sw > 0) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

// Cercle rempli + contour
function circ(ctx, cx, cy, r, fill, stroke = OC, sw = SW) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (sw > 0) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

// Polygone rempli + contour
function poly(ctx, pts, fill, stroke = OC, sw = SW) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (sw > 0) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

// Remplissage seul (sans contour)
function fill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ─── HERO ────────────────────────────────────────────────────────────────────

const HC = {
  skin:    '#FFCCBC',
  helmet:  '#E53935',
  helmetD: '#C62828',
  stripe:  '#FDD835',
  armor:   '#E53935',
  armorD:  '#B71C1C',
  cape:    '#7B1FA2',
  eye:     '#263238',
  mouth:   '#E57373',
  arm:     '#E53935',
  blade:   '#90A4AE',
  bladeH:  '#ECEFF1',
  guard:   '#FDD835',
  handle:  '#8D6E63',
  legs:    '#1565C0',
  legsD:   '#0D47A1',
  boots:   '#0D47A1',
  bootsD:  '#082E7A',
};

function drawHero(ctx, ox, oy, {
  bodyDY = 0,
  legLY = 0, legRY = 0,
  swordPos = 'normal',
  healGlow = 0,
} = {}) {
  const b = bodyDY;

  // Cape (derrière le corps)
  poly(ctx, [[ox+8, oy+36+b], [ox+0, oy+72+b], [ox+16, oy+66+b]], HC.cape);
  poly(ctx, [[ox+64,oy+36+b], [ox+72,oy+72+b], [ox+56, oy+66+b]], HC.cape);

  // Corps / armure
  box(ctx, ox+10, oy+34+b, 44, 34, 5, HC.armor);
  // Stripe dorée
  box(ctx, ox+10, oy+38+b, 44, 6,  2, HC.stripe, OC, 1.5);
  // Plastron
  box(ctx, ox+18, oy+46+b, 28, 17, 4, HC.armorD);

  // Bras gauche
  box(ctx, ox+1,  oy+34+b, 9,  28, 4, HC.arm);
  // Bras droit
  box(ctx, ox+62, oy+34+b, 9,  28, 4, HC.arm);

  // Épée
  if (swordPos === 'normal') {
    box(ctx, ox+63, oy+6+b,  7, 34, 3, HC.blade);
    box(ctx, ox+59, oy+28+b, 15, 6,  3, HC.guard);
    box(ctx, ox+64, oy+34+b, 5,  12, 2, HC.handle);
  } else if (swordPos === 'raised') {
    box(ctx, ox+60, oy+0,    7, 32, 3, HC.blade);
    box(ctx, ox+56, oy+20,   15, 6, 3, HC.guard);
    box(ctx, ox+61, oy+26,   5,  12, 2, HC.handle);
  } else if (swordPos === 'extended') {
    box(ctx, ox+54, oy+34+b, 20, 7,  3, HC.blade);
    box(ctx, ox+52, oy+30+b, 7,  15, 3, HC.guard);
    box(ctx, ox+54, oy+41+b, 6,  12, 2, HC.handle);
  } else if (swordPos === 'down') {
    box(ctx, ox+63, oy+36+b, 7, 34, 3, HC.blade);
    box(ctx, ox+59, oy+40+b, 15, 6, 3, HC.guard);
    box(ctx, ox+64, oy+46+b, 5,  12, 2, HC.handle);
  }

  // Tête
  box(ctx, ox+14, oy+4+b,  40, 28, 6, HC.skin);

  // Casque (par-dessus la tête)
  box(ctx, ox+12, oy+2+b,  44, 16, 7, HC.helmet);
  box(ctx, ox+10, oy+14+b, 48,  6, 3, HC.stripe, OC, 1.5);

  // Yeux
  box(ctx, ox+19, oy+14+b, 10, 10, 2, HC.eye);
  box(ctx, ox+41, oy+14+b, 10, 10, 2, HC.eye);
  fill(ctx, ox+20, oy+15+b,  4,  4, '#FFFFFF');
  fill(ctx, ox+42, oy+15+b,  4,  4, '#FFFFFF');

  // Bouche
  box(ctx, ox+22, oy+26+b, 22,  5, 2, HC.mouth);

  // Jambes
  const llY = oy + 68 + legLY;
  const rlY = oy + 68 + legRY;
  box(ctx, ox+12, llY, 19, 26, 5, HC.legs);
  box(ctx, ox+41, rlY, 19, 26, 5, HC.legs);

  // Bottes
  box(ctx, ox+9,  oy+88+legLY, 24, 10, 4, HC.boots);
  box(ctx, ox+39, oy+88+legRY, 24, 10, 4, HC.boots);

  // Glow soin
  if (healGlow > 0) {
    ctx.save();
    ctx.globalAlpha = healGlow * 0.45;
    ctx.fillStyle = '#00E676';
    ctx.beginPath();
    ctx.arc(ox + 36, oy + 50 + b, 44 * healGlow + 18, 0, Math.PI * 2);
    ctx.fill();
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

// ─── GOBLIN ───────────────────────────────────────────────────────────────────

const GC = {
  skin:    '#66BB6A',
  skinD:   '#43A047',
  ear:     '#388E3C',
  brow:    '#1B5E20',
  eye:     '#D32F2F',
  eyeD:    '#B71C1C',
  tooth:   '#F5F5F5',
  body:    '#43A047',
  bodyD:   '#2E7D32',
  arm:     '#66BB6A',
  leg:     '#2E7D32',
  legD:    '#1B5E20',
  club:    '#795548',
  clubH:   '#4E342E',
  nail:    '#FDD835',
  shield:  '#1565C0',
  shieldH: '#42A5F5',
};

function drawGoblin(ctx, ox, oy, {
  bodyDY = 0,
  legLY = 0, legRY = 0,
  armPos = 'normal',
  defending = false,
} = {}) {
  const b = bodyDY;

  // Oreilles pointues
  poly(ctx, [[ox+4, oy+28+b], [ox+12, oy+4+b], [ox+22, oy+26+b]], GC.ear);
  poly(ctx, [[ox+50,oy+26+b], [ox+60, oy+4+b], [ox+68, oy+28+b]], GC.ear);

  // Tête
  box(ctx, ox+8, oy+6+b, 56, 42, 10, GC.skin);

  // Sourcils (légèrement décalés pour exprimer la colère)
  box(ctx, ox+12, oy+14+b, 18, 6, 3, GC.brow, OC, 2);
  box(ctx, ox+42, oy+14+b, 18, 6, 3, GC.brow, OC, 2);

  // Yeux (grands et expressifs)
  circ(ctx, ox+26, oy+26+b, 9, GC.eye);
  circ(ctx, ox+46, oy+26+b, 9, GC.eye);
  fill(ctx,  ox+22, oy+21+b, 5, 5, '#FFFFFF');
  fill(ctx,  ox+42, oy+21+b, 5, 5, '#FFFFFF');

  // Bouche / dents
  box(ctx, ox+18, oy+38+b, 36, 14, 4, GC.brow);
  box(ctx, ox+22, oy+39+b, 9,  12, 2, GC.tooth, OC, 1.5);
  box(ctx, ox+41, oy+39+b, 9,  12, 2, GC.tooth, OC, 1.5);

  // Corps
  box(ctx, ox+12, oy+48+b, 48, 26, 6, GC.body);
  // Ventre
  box(ctx, ox+20, oy+54+b, 32, 14, 4, GC.bodyD);

  if (defending) {
    // Bras croisés
    box(ctx, ox+4,  oy+48+b, 12, 26, 4, GC.arm);
    box(ctx, ox+56, oy+48+b, 12, 26, 4, GC.arm);
    // Bouclier
    box(ctx, ox+16, oy+44+b, 40, 32, 6, GC.shield);
    box(ctx, ox+22, oy+50+b, 28, 20, 4, GC.shieldH, OC, 1.5);
    // Croix sur bouclier
    fill(ctx, ox+34, oy+50+b, 4, 20, '#FFFFFF');
    fill(ctx, ox+22, oy+58+b, 28, 4,  '#FFFFFF');
  } else if (armPos === 'normal') {
    // Bras gauche + massue
    box(ctx, ox+3,  oy+48+b, 10, 24, 4, GC.arm);
    // Massue (shaft)
    box(ctx, ox+1,  oy+20+b, 10, 32, 4, GC.club);
    // Tête massue
    box(ctx, ox+0,  oy+10+b, 14, 18, 5, GC.clubH);
    // Clous dorés
    circ(ctx, ox+7, oy+13+b, 3, GC.nail, OC, 1.5);
    circ(ctx, ox+7, oy+20+b, 3, GC.nail, OC, 1.5);
    circ(ctx, ox+7, oy+27+b, 3, GC.nail, OC, 1.5);
    // Bras droit
    box(ctx, ox+59, oy+48+b, 10, 24, 4, GC.arm);
  } else if (armPos === 'raised') {
    // Massue levée
    box(ctx, ox+3,  oy+34+b, 10, 14, 4, GC.arm);
    box(ctx, ox+1,  oy+4+b,  10, 34, 4, GC.club);
    box(ctx, ox+0,  oy+0+b,  14, 12, 5, GC.clubH);
    circ(ctx, ox+7, oy+3+b,  3, GC.nail, OC, 1.5);
    circ(ctx, ox+7, oy+9+b,  3, GC.nail, OC, 1.5);
    box(ctx, ox+59, oy+48+b, 10, 24, 4, GC.arm);
  } else if (armPos === 'impact') {
    // Massue abattue
    box(ctx, ox+1,  oy+48+b, 10, 20, 4, GC.arm);
    box(ctx, ox+0,  oy+52+b, 10, 20, 4, GC.club);
    box(ctx, ox+0,  oy+68+b, 14, 12, 5, GC.clubH);
    circ(ctx, ox+7, oy+70+b, 3, GC.nail, OC, 1.5);
    box(ctx, ox+59, oy+48+b, 10, 24, 4, GC.arm);
  }

  // Jambes
  const llY = oy + 72 + legLY;
  const rlY = oy + 72 + legRY;
  box(ctx, ox+16, llY, 16, 12, 4, GC.leg);
  box(ctx, ox+40, rlY, 16, 12, 4, GC.leg);
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
