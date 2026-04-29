const S = 3;
const FW_HERO = 20;
const FH_HERO = 30;
const FW_GOB  = 24;
const FH_GOB  = 24;

function r(ctx, lx, ly, lw, lh, color) {
  ctx.fillStyle = color;
  ctx.fillRect(lx * S, ly * S, lw * S, lh * S);
}

function makeCanvas(frames, fw, fh) {
  const c = document.createElement('canvas');
  c.width  = fw * S * frames;
  c.height = fh * S;
  return c;
}

// ─── HERO ────────────────────────────────────────────────────────────────────

const H = {
  hair: '#5C3317', hairH: '#7A4A28',
  skin: '#FDBCB4', eye: '#2C1810', mouth: '#C9967E',
  shirt: '#2E86DE', shirtD: '#1A6AB8',
  belt: '#8B5E3C',
  pants: '#34495E', pantsD: '#2C3E50',
  boot: '#4A2C17', bootH: '#6B4226',
  sword: '#BDC3C7', swordH: '#FFFFFF',
  guard: '#F39C12', handle: '#6B4226',
};

function drawHeroBase(ctx, ox, { bodyDY = 0, legLL = 0, legRL = 0, swordAngle = 'normal' } = {}) {
  const by = bodyDY;

  // Cheveux
  r(ctx, ox+3, 0+by, 11, 3, H.hair);
  r(ctx, ox+4, 0+by, 5,  1, H.hairH);

  // Tête
  r(ctx, ox+3, 2+by, 11, 6, H.skin);
  r(ctx, ox+3, 7+by, 11, 1, H.mouth);

  // Yeux
  r(ctx, ox+5,  4+by, 2, 2, H.eye);
  r(ctx, ox+10, 4+by, 2, 2, H.eye);
  r(ctx, ox+5,  4+by, 1, 1, '#FFFFFF');
  r(ctx, ox+10, 4+by, 1, 1, '#FFFFFF');

  // Corps
  r(ctx, ox+2, 8+by, 13, 7, H.shirt);
  r(ctx, ox+2, 8+by,  2, 7, H.shirtD);
  r(ctx, ox+13,8+by,  2, 7, H.shirtD);

  // Bras gauche + main
  r(ctx, ox+0, 8+by, 2, 6, H.shirt);
  r(ctx, ox+0, 13+by, 2, 2, H.skin);

  // Bras droit + main
  r(ctx, ox+15, 8+by, 2, 6, H.shirt);
  r(ctx, ox+15, 13+by, 2, 2, H.skin);

  // Ceinture
  r(ctx, ox+2, 15+by, 13, 2, H.belt);

  // Épée
  if (swordAngle === 'normal') {
    r(ctx, ox+17, 3+by, 2, 4, H.handle);
    r(ctx, ox+16, 7+by, 4, 1, H.guard);
    r(ctx, ox+17, 8+by, 2, 8, H.sword);
    r(ctx, ox+17, 8+by, 1, 8, H.swordH);
  } else if (swordAngle === 'raised') {
    r(ctx, ox+16, 0+by, 2, 4, H.handle);
    r(ctx, ox+15, 4+by, 4, 1, H.guard);
    r(ctx, ox+16, 5+by, 2, 8, H.sword);
    r(ctx, ox+16, 5+by, 1, 8, H.swordH);
  } else if (swordAngle === 'extended') {
    r(ctx, ox+17, 9+by,  2, 4, H.handle);
    r(ctx, ox+17, 8+by,  2, 2, H.guard);
    r(ctx, ox+19, 9+by,  8, 2, H.sword);
    r(ctx, ox+19, 9+by,  8, 1, H.swordH);
  } else if (swordAngle === 'down') {
    r(ctx, ox+17, 12+by, 2, 4, H.handle);
    r(ctx, ox+16, 16+by, 4, 1, H.guard);
    r(ctx, ox+17, 17+by, 2, 7, H.sword);
    r(ctx, ox+17, 17+by, 1, 7, H.swordH);
  }

  // Jambe gauche
  const llY = 17 + legLL + by;
  r(ctx, ox+2, llY,   5, 7, H.pants);
  r(ctx, ox+2, llY,   2, 7, H.pantsD);
  r(ctx, ox+2, llY+7, 6, 3, H.boot);
  r(ctx, ox+2, llY+7, 2, 3, H.bootH);

  // Jambe droite
  const rlY = 17 + legRL + by;
  r(ctx, ox+10, rlY,   5, 7, H.pants);
  r(ctx, ox+12, rlY,   2, 7, H.pantsD);
  r(ctx, ox+10, rlY+7, 6, 3, H.boot);
  r(ctx, ox+10, rlY+7, 2, 3, H.bootH);
}

export function createHeroIdleSheet() {
  const frames = 4;
  const c = makeCanvas(frames, FW_HERO, FH_HERO);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [{ bodyDY:0 },{ bodyDY:1 },{ bodyDY:0 },{ bodyDY:1 }]
    .forEach((cfg, i) => drawHeroBase(ctx, i * FW_HERO, cfg));
  return { canvas: c, frameWidth: FW_HERO * S, frameHeight: FH_HERO * S, frameCount: frames };
}

export function createHeroWalkSheet() {
  const frames = 4;
  const c = makeCanvas(frames, FW_HERO, FH_HERO);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [{ legLL:1, legRL:-1 },{ legLL:0, legRL:0 },{ legLL:-1, legRL:1 },{ legLL:0, legRL:0 }]
    .forEach((cfg, i) => drawHeroBase(ctx, i * FW_HERO, cfg));
  return { canvas: c, frameWidth: FW_HERO * S, frameHeight: FH_HERO * S, frameCount: frames };
}

export function createHeroAttackSheet() {
  const frames = 5;
  const c = makeCanvas(frames, FW_HERO, FH_HERO);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [
    { swordAngle:'raised',   bodyDY: 0 },
    { swordAngle:'raised',   bodyDY:-1 },
    { swordAngle:'normal',   bodyDY: 0 },
    { swordAngle:'extended', bodyDY: 0 },
    { swordAngle:'down',     bodyDY: 1 },
  ].forEach((cfg, i) => drawHeroBase(ctx, i * FW_HERO, cfg));
  return { canvas: c, frameWidth: FW_HERO * S, frameHeight: FH_HERO * S, frameCount: frames };
}

export function createHeroHealSheet() {
  const frames = 4;
  const c = makeCanvas(frames, FW_HERO, FH_HERO);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const glowAlphas = [0.2, 0.5, 0.7, 0.3];
  for (let i = 0; i < frames; i++) {
    const ox = i * FW_HERO;
    drawHeroBase(ctx, ox, { swordAngle: 'raised' });
    ctx.save();
    ctx.globalAlpha = glowAlphas[i];
    ctx.fillStyle = '#00FF88';
    ctx.beginPath();
    ctx.arc((ox + 9) * S, 14 * S, 14 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  return { canvas: c, frameWidth: FW_HERO * S, frameHeight: FH_HERO * S, frameCount: frames };
}

// ─── GOBLIN ───────────────────────────────────────────────────────────────────

const G = {
  skin: '#2ECC71', skinD: '#1FA35A',
  ear: '#27AE60',
  eye: '#E74C3C', eyeH: '#FF6B6B',
  tooth: '#F0F0F0',
  body: '#27AE60', bodyD: '#1A8A4A',
  arm: '#2ECC71',
  leg: '#1A7A40', legD: '#115230',
  club: '#6B4226', clubH: '#8B5E3C', clubHead: '#5C3317',
};

function drawGoblinBase(ctx, ox, { bodyDY = 0, legLL = 0, legRL = 0, armAngle = 'normal', defending = false } = {}) {
  const by = bodyDY;

  // Oreilles
  r(ctx, ox+0,  2+by, 4, 8, G.ear);
  r(ctx, ox+20, 2+by, 4, 8, G.ear);

  // Tête
  r(ctx, ox+3,  0+by, 18, 10, G.skin);
  r(ctx, ox+3,  8+by, 18,  2, G.skinD);

  // Yeux
  r(ctx, ox+5,  3+by, 4, 4, G.eye);
  r(ctx, ox+15, 3+by, 4, 4, G.eye);
  r(ctx, ox+5,  3+by, 2, 2, G.eyeH);
  r(ctx, ox+15, 3+by, 2, 2, G.eyeH);

  // Dents
  r(ctx, ox+8,  8+by, 2, 3, G.tooth);
  r(ctx, ox+11, 8+by, 2, 3, G.tooth);
  r(ctx, ox+14, 8+by, 2, 3, G.tooth);

  // Corps
  r(ctx, ox+4,  10+by, 16, 8, G.body);
  r(ctx, ox+4,  10+by,  3, 8, G.bodyD);

  if (defending) {
    r(ctx, ox+1,  10+by, 5, 8, G.arm);
    r(ctx, ox+18, 10+by, 5, 8, G.arm);
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#3498DB';
    ctx.fillRect((ox+3)*S, (9+by)*S, 18*S, 10*S);
    ctx.restore();
  } else if (armAngle === 'normal') {
    r(ctx, ox+1,  10+by, 3, 8, G.arm);
    r(ctx, ox+0,  5+by,  2, 6, G.club);
    r(ctx, ox+0,  4+by,  4, 3, G.clubHead);
    r(ctx, ox+20, 10+by, 3, 8, G.arm);
  } else if (armAngle === 'raised') {
    r(ctx, ox+1, 6+by,  3, 12, G.arm);
    r(ctx, ox+0, 0+by,  2,  7, G.club);
    r(ctx, ox+0, 0+by,  4,  3, G.clubHead);
    r(ctx, ox+20, 10+by, 3, 8, G.arm);
  } else if (armAngle === 'impact') {
    r(ctx, ox+1, 14+by, 3, 6, G.arm);
    r(ctx, ox+0, 16+by, 2, 4, G.club);
    r(ctx, ox+0, 18+by, 4, 4, G.clubHead);
    r(ctx, ox+20, 10+by, 3, 8, G.arm);
  }

  // Jambe gauche
  const llY = 18 + legLL + by;
  r(ctx, ox+5,  llY, 5, 6, G.leg);
  r(ctx, ox+5,  llY, 2, 6, G.legD);

  // Jambe droite
  const rlY = 18 + legRL + by;
  r(ctx, ox+14, rlY, 5, 6, G.leg);
  r(ctx, ox+16, rlY, 2, 6, G.legD);
}

export function createGoblinIdleSheet() {
  const frames = 4;
  const c = makeCanvas(frames, FW_GOB, FH_GOB);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [{ bodyDY:0 },{ bodyDY:1 },{ bodyDY:0 },{ bodyDY:1 }]
    .forEach((cfg, i) => drawGoblinBase(ctx, i * FW_GOB, cfg));
  return { canvas: c, frameWidth: FW_GOB * S, frameHeight: FH_GOB * S, frameCount: frames };
}

export function createGoblinWalkSheet() {
  const frames = 4;
  const c = makeCanvas(frames, FW_GOB, FH_GOB);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [{ legLL:1, legRL:-1 },{ legLL:0, legRL:0 },{ legLL:-1, legRL:1 },{ legLL:0, legRL:0 }]
    .forEach((cfg, i) => drawGoblinBase(ctx, i * FW_GOB, cfg));
  return { canvas: c, frameWidth: FW_GOB * S, frameHeight: FH_GOB * S, frameCount: frames };
}

export function createGoblinAttackSheet() {
  const frames = 5;
  const c = makeCanvas(frames, FW_GOB, FH_GOB);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  [
    { armAngle:'normal' },
    { armAngle:'raised' },
    { armAngle:'raised', bodyDY:-1 },
    { armAngle:'impact' },
    { armAngle:'normal', bodyDY: 1 },
  ].forEach((cfg, i) => drawGoblinBase(ctx, i * FW_GOB, cfg));
  return { canvas: c, frameWidth: FW_GOB * S, frameHeight: FH_GOB * S, frameCount: frames };
}

export function createGoblinDefendSheet() {
  const frames = 3;
  const c = makeCanvas(frames, FW_GOB, FH_GOB);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) drawGoblinBase(ctx, i * FW_GOB, { defending: true });
  return { canvas: c, frameWidth: FW_GOB * S, frameHeight: FH_GOB * S, frameCount: frames };
}
