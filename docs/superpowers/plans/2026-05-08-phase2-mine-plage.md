# Phase 2 — Mine & Plage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre les villages Mine (5 combats) et Plage Pirate (4 combats) jouables en ajoutant 9 ennemis avec mécaniques uniques.

**Architecture:** Chaque ennemi ajoute une entrée dans `enemies.js`, un sprite dans `sprites.js`, une IA dans `BattleState.js`, et des handlers visuels dans `BattleScene.js`. Le système multi-ennemi existant supporte exactement 2 ennemis — cave_bat utilisera donc 2 chauves-souris.

**Tech Stack:** Phaser.js v3.60, canvas 2D API, modules ES natifs. Aucun test automatisé — vérification manuelle dans le navigateur.

---

## Fichiers concernés

| Fichier | Action |
|---------|--------|
| `battle/villages.js` | Modifier `mine.battles` (5 ids) et `plage.battles` (4 ids) |
| `battle/enemies.js` | Ajouter 9 entrées |
| `assets/sprites.js` | Ajouter 6 familles de sprites (cave_bat, cave_dwarf/miner, cave_troll/king, pirate_grunt, pirate_quartermaster, pirate_captain) |
| `battle/BattleState.js` | Nouveaux états, 6 méthodes IA privées, 4 méthodes d'attaque, mise à jour tickHeroTurn |
| `scenes/BattleScene.js` | Nouveaux imports, SPRITE_DEFS, 7 handlers visuels, contre-attaque dans heroAttack |

---

### Task 1: Données — villages.js + enemies.js

**Files:**
- Modify: `battle/villages.js`
- Modify: `battle/enemies.js`

- [ ] **Step 1 : Mettre à jour mine.battles et plage.battles dans `battle/villages.js`**

Remplacer :
```js
mine: {
  id: 'mine', name: 'Mine', icon: '⛏',
  pos: { x: 175, y: 60 }, diff: 2,
  parent: 'foret',
  battles: ['cave_dwarf', 'cave_troll'],
  connections: ['foret'],
},
plage: {
  id: 'plage', name: 'Plage pirate', icon: '⚓',
  pos: { x: 280, y: 160 }, diff: 3,
  parent: 'foret',
  battles: ['pirate_grunt', 'pirate_captain'],
  connections: ['foret', 'temple'],
},
```

Par :
```js
mine: {
  id: 'mine', name: 'Mine', icon: '⛏',
  pos: { x: 175, y: 60 }, diff: 2,
  parent: 'foret',
  battles: ['cave_bat', 'cave_dwarf', 'cave_miner', 'cave_troll', 'cave_troll_king'],
  connections: ['foret'],
},
plage: {
  id: 'plage', name: 'Plage pirate', icon: '⚓',
  pos: { x: 280, y: 160 }, diff: 3,
  parent: 'foret',
  battles: ['pirate_grunt', 'pirate_crew', 'pirate_quartermaster', 'pirate_captain'],
  connections: ['foret', 'temple'],
},
```

- [ ] **Step 2 : Ajouter les 9 entrées dans `battle/enemies.js`**

Ajouter après la dernière entrée (`shadowLord`) et avant le `export const BATTLE_SEQUENCE` :

```js
  // ── Mine ────────────────────────────────────────────────────
  cave_bat: {
    id: 'cave_bat', name: 'NUÉE DE CHAUVES-SOURIS', sprite: 'cave_bat',
    multi: true,
    enemies: [
      { name: 'CHAUVE-SOURIS α', hp: 55, atkMin: 10, atkMax: 16 },
      { name: 'CHAUVE-SOURIS β', hp: 50, atkMin:  8, atkMax: 14 },
    ],
    ai: 'cave_bat',
    dodgeBonus: 0.18,
    exp: 30,
  },
  cave_dwarf: {
    id: 'cave_dwarf', name: 'NAIN DES MINES', sprite: 'cave_dwarf',
    hp: 145, atkMin: 16, atkMax: 24,
    ai: 'cave_dwarf',
    counterCycle: 3,
    counterReflect: 0.50,
    exp: 40,
  },
  cave_miner: {
    id: 'cave_miner', name: 'MINEUR EXPLOSIF', sprite: 'cave_miner',
    hp: 160, atkMin: 14, atkMax: 22,
    ai: 'cave_miner',
    explosionCountdown: 3,
    explosionDamage: 60,
    exp: 45,
  },
  cave_troll: {
    id: 'cave_troll', name: 'TROLL DES CAVERNES', sprite: 'cave_troll',
    hp: 240, atkMin: 20, atkMax: 32,
    ai: 'cave_troll',
    regenPerTurn: 12,
    heavyBlowCycle: 3,
    exp: 55,
  },
  cave_troll_king: {
    id: 'cave_troll_king', name: 'ROI TROLL', sprite: 'cave_troll_king',
    hp: 310, atkMin: 26, atkMax: 40,
    ai: 'cave_troll_king',
    regenPerTurn: 18,
    quakeCycle: 3,
    quakeDamage: 40,
    phase2Threshold: 155,
    phase2AtkMult: 1.5,
    exp: 75,
  },
  // ── Plage ────────────────────────────────────────────────────
  pirate_grunt: {
    id: 'pirate_grunt', name: 'BOUCANIER', sprite: 'pirate_grunt',
    hp: 155, atkMin: 18, atkMax: 28,
    ai: 'pirate_grunt',
    pillageAtkBonus: 8,
    pillageMaxStacks: 3,
    exp: 42,
  },
  pirate_crew: {
    id: 'pirate_crew', name: 'ÉQUIPAGE PIRATE', sprite: 'pirate_grunt',
    multi: true,
    enemies: [
      { name: 'CORSAIRE ROUGE', hp: 130, atkMin: 16, atkMax: 24 },
      { name: 'CORSAIRE NOIR',  hp: 125, atkMin: 16, atkMax: 24 },
    ],
    ai: 'pirate_crew',
    vengeanceAtkBonus: 20,
    exp: 58,
  },
  pirate_quartermaster: {
    id: 'pirate_quartermaster', name: 'QUARTIER-MAÎTRE', sprite: 'pirate_quartermaster',
    hp: 200, atkMin: 22, atkMax: 34,
    ai: 'pirate_quartermaster',
    poisonDamage: 8,
    exp: 62,
  },
  pirate_captain: {
    id: 'pirate_captain', name: 'CAPITAINE FLIBUSTIER', sprite: 'pirate_captain',
    hp: 230, atkMin: 24, atkMax: 36,
    ai: 'pirate_captain',
    cannonballCycle: 3,
    cannonballDamage: 55,
    exp: 70,
  },
```

- [ ] **Step 3 : Vérifier la syntaxe**

```bash
node --check battle/enemies.js && node --check battle/villages.js
```
Expected: aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add battle/villages.js battle/enemies.js
git commit -m "feat: add 9 enemy entries for Mine and Plage villages"
```

---

### Task 2: Sprites — cave_bat

**Files:**
- Modify: `assets/sprites.js` (ajouter après les constantes SLD_*)

- [ ] **Step 1 : Ajouter les constantes et la fonction drawBat après la dernière fonction ShadowLord**

À la fin de `assets/sprites.js`, ajouter :

```js
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
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check assets/sprites.js
```
Expected: aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add assets/sprites.js
git commit -m "feat: add cave_bat sprite (4 animations)"
```

---

### Task 3: Sprites — cave_dwarf + cave_miner

**Files:**
- Modify: `assets/sprites.js`

- [ ] **Step 1 : Ajouter drawDwarf et les 8 sheets (dwarf + miner)**

À la fin de `assets/sprites.js`, après les fonctions cave_bat, ajouter :

```js
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
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check assets/sprites.js
```

- [ ] **Step 3 : Commit**

```bash
git add assets/sprites.js
git commit -m "feat: add cave_dwarf and cave_miner sprites (shared draw function)"
```

---

### Task 4: Sprites — cave_troll + cave_troll_king

**Files:**
- Modify: `assets/sprites.js`

- [ ] **Step 1 : Ajouter drawTroll et les 8 sheets**

À la fin de `assets/sprites.js`, ajouter :

```js
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
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check assets/sprites.js
```

- [ ] **Step 3 : Commit**

```bash
git add assets/sprites.js
git commit -m "feat: add cave_troll and cave_troll_king sprites (shared draw function)"
```

---

### Task 5: Sprites — pirate_grunt, pirate_quartermaster, pirate_captain

**Files:**
- Modify: `assets/sprites.js`

- [ ] **Step 1 : Ajouter drawPirate et les 12 sheets (grunt, quartermaster, captain)**

À la fin de `assets/sprites.js`, ajouter :

```js
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
  qm:     '#3A4A2A', qmD:    '#1E2810',   // quartermaster coat
  cap:    '#7A1A1A', capD:   '#4A0A0A',   // captain coat
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
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check assets/sprites.js
```

- [ ] **Step 3 : Commit**

```bash
git add assets/sprites.js
git commit -m "feat: add pirate_grunt, pirate_quartermaster, pirate_captain sprites"
```

---

### Task 6: BattleScene — imports + SPRITE_DEFS

**Files:**
- Modify: `scenes/BattleScene.js` (lignes 1–25 : imports + SPRITE_DEFS)

- [ ] **Step 1 : Ajouter les imports des nouvelles fonctions de sprites**

Remplacer le bloc d'imports en haut de `scenes/BattleScene.js` :

```js
import {
  createHeroIdleSheet, createHeroWalkSheet,
  createHeroAttackSheet, createHeroHealSheet, createHeroShieldSheet,
  createGoblinIdleSheet, createGoblinWalkSheet,
  createGoblinAttackSheet, createGoblinDefendSheet,
  createOrcIdleSheet, createOrcWalkSheet, createOrcAttackSheet, createOrcDefendSheet,
  createWitchIdleSheet, createWitchWalkSheet, createWitchAttackSheet, createWitchDefendSheet,
  createGnollIdleSheet, createGnollWalkSheet, createGnollAttackSheet, createGnollDefendSheet,
  createShadowLordIdleSheet, createShadowLordWalkSheet,
  createShadowLordAttackSheet, createShadowLordDefendSheet,
} from '../assets/sprites.js';
```

Par :

```js
import {
  createHeroIdleSheet, createHeroWalkSheet,
  createHeroAttackSheet, createHeroHealSheet, createHeroShieldSheet,
  createGoblinIdleSheet, createGoblinWalkSheet,
  createGoblinAttackSheet, createGoblinDefendSheet,
  createOrcIdleSheet, createOrcWalkSheet, createOrcAttackSheet, createOrcDefendSheet,
  createWitchIdleSheet, createWitchWalkSheet, createWitchAttackSheet, createWitchDefendSheet,
  createGnollIdleSheet, createGnollWalkSheet, createGnollAttackSheet, createGnollDefendSheet,
  createShadowLordIdleSheet, createShadowLordWalkSheet,
  createShadowLordAttackSheet, createShadowLordDefendSheet,
  createCaveBatIdleSheet, createCaveBatWalkSheet,
  createCaveBatAttackSheet, createCaveBatDefendSheet,
  createCaveDwarfIdleSheet, createCaveDwarfWalkSheet,
  createCaveDwarfAttackSheet, createCaveDwarfDefendSheet,
  createCaveMinerIdleSheet, createCaveMinerWalkSheet,
  createCaveMinerAttackSheet, createCaveMinerDefendSheet,
  createCaveTrollIdleSheet, createCaveTrollWalkSheet,
  createCaveTrollAttackSheet, createCaveTrollDefendSheet,
  createCaveTrollKingIdleSheet, createCaveTrollKingWalkSheet,
  createCaveTrollKingAttackSheet, createCaveTrollKingDefendSheet,
  createPirateGruntIdleSheet, createPirateGruntWalkSheet,
  createPirateGruntAttackSheet, createPirateGruntDefendSheet,
  createPirateQuartermasterIdleSheet, createPirateQuartermasterWalkSheet,
  createPirateQuartermasterAttackSheet, createPirateQuartermasterDefendSheet,
  createPirateCaptainIdleSheet, createPirateCaptainWalkSheet,
  createPirateCaptainAttackSheet, createPirateCaptainDefendSheet,
} from '../assets/sprites.js';
```

- [ ] **Step 2 : Étendre SPRITE_DEFS**

Remplacer le bloc `const SPRITE_DEFS = { ... };` par :

```js
const SPRITE_DEFS = {
  goblin:               { prefix: 'goblin',                sheets: { idle: createGoblinIdleSheet,               walk: createGoblinWalkSheet,               attack: createGoblinAttackSheet,               defend: createGoblinDefendSheet               } },
  orc:                  { prefix: 'orc',                   sheets: { idle: createOrcIdleSheet,                  walk: createOrcWalkSheet,                  attack: createOrcAttackSheet,                  defend: createOrcDefendSheet                  } },
  witch:                { prefix: 'witch',                 sheets: { idle: createWitchIdleSheet,                walk: createWitchWalkSheet,                attack: createWitchAttackSheet,                defend: createWitchDefendSheet                } },
  gnoll:                { prefix: 'gnoll',                 sheets: { idle: createGnollIdleSheet,                walk: createGnollWalkSheet,                attack: createGnollAttackSheet,                defend: createGnollDefendSheet                } },
  shadowLord:           { prefix: 'shadow-lord',           sheets: { idle: createShadowLordIdleSheet,           walk: createShadowLordWalkSheet,           attack: createShadowLordAttackSheet,           defend: createShadowLordDefendSheet           } },
  cave_bat:             { prefix: 'cave-bat',              sheets: { idle: createCaveBatIdleSheet,              walk: createCaveBatWalkSheet,              attack: createCaveBatAttackSheet,              defend: createCaveBatDefendSheet              } },
  cave_dwarf:           { prefix: 'cave-dwarf',            sheets: { idle: createCaveDwarfIdleSheet,            walk: createCaveDwarfWalkSheet,            attack: createCaveDwarfAttackSheet,            defend: createCaveDwarfDefendSheet            } },
  cave_miner:           { prefix: 'cave-miner',            sheets: { idle: createCaveMinerIdleSheet,            walk: createCaveMinerWalkSheet,            attack: createCaveMinerAttackSheet,            defend: createCaveMinerDefendSheet            } },
  cave_troll:           { prefix: 'cave-troll',            sheets: { idle: createCaveTrollIdleSheet,            walk: createCaveTrollWalkSheet,            attack: createCaveTrollAttackSheet,            defend: createCaveTrollDefendSheet            } },
  cave_troll_king:      { prefix: 'cave-troll-king',       sheets: { idle: createCaveTrollKingIdleSheet,        walk: createCaveTrollKingWalkSheet,        attack: createCaveTrollKingAttackSheet,        defend: createCaveTrollKingDefendSheet        } },
  pirate_grunt:         { prefix: 'pirate-grunt',          sheets: { idle: createPirateGruntIdleSheet,          walk: createPirateGruntWalkSheet,          attack: createPirateGruntAttackSheet,          defend: createPirateGruntDefendSheet          } },
  pirate_quartermaster: { prefix: 'pirate-quartermaster',  sheets: { idle: createPirateQuartermasterIdleSheet,  walk: createPirateQuartermasterWalkSheet,  attack: createPirateQuartermasterAttackSheet,  defend: createPirateQuartermasterDefendSheet  } },
  pirate_captain:       { prefix: 'pirate-captain',        sheets: { idle: createPirateCaptainIdleSheet,        walk: createPirateCaptainWalkSheet,        attack: createPirateCaptainAttackSheet,        defend: createPirateCaptainDefendSheet        } },
};
```

- [ ] **Step 3 : Vérifier la syntaxe**

```bash
node --check scenes/BattleScene.js
```

- [ ] **Step 4 : Commit**

```bash
git add scenes/BattleScene.js
git commit -m "feat: register 8 new sprite families in BattleScene SPRITE_DEFS"
```

---

### Task 7: BattleState — IA Mine (cave_bat, cave_dwarf, cave_miner, cave_troll, cave_troll_king)

**Files:**
- Modify: `battle/BattleState.js`

- [ ] **Step 1 : Ajouter les nouveaux états dans le constructeur**

Dans le `constructor()`, après `this._healBlockCounter = 0;`, ajouter :

```js
    // Cave Dwarf
    this.dwarfCounterActive = false;
    this._dwarfTurnCounter  = 0;

    // Cave Miner
    this._minerCountdown    = 0;

    // Cave Troll / King
    this._trollTurnCounter  = 0;
```

- [ ] **Step 2 : Ajouter les cases dans enemyAI()**

Dans `enemyAI()`, avant `default:`, ajouter :

```js
      case 'cave_bat':        return 'attack';
      case 'cave_dwarf':      return this._caveDwarfAI();
      case 'cave_miner':      return this._caveMinerAI();
      case 'cave_troll':      return this._caveTrollAI();
      case 'cave_troll_king': return this._caveTrollKingAI();
```

- [ ] **Step 3 : Ajouter les cases dans enemyAttack()**

Dans `enemyAttack()`, avant `default:`, ajouter :

```js
      case 'cave_bat':        return this._gnollsDoAttack();
      case 'cave_dwarf':      return [this._basicEnemyAttack()];
      case 'cave_miner':      return [this._basicEnemyAttack()];
      case 'cave_troll':      return [this._trollDoAttack()];
      case 'cave_troll_king': return [this._trollDoAttack()];
```

- [ ] **Step 4 : Ajouter les méthodes IA privées**

Après `_shadowLordAI()`, ajouter :

```js
  _caveDwarfAI() {
    this._dwarfTurnCounter++;
    if (this._dwarfTurnCounter % (this._config.counterCycle ?? 3) === 0) {
      this.dwarfCounterActive = true;
      return 'counterAttack';
    }
    return 'attack';
  }

  _caveMinerAI() {
    this._minerCountdown++;
    if (this._minerCountdown >= (this._config.explosionCountdown ?? 3)) {
      this._minerCountdown = 0;
      return 'explosion';
    }
    return 'attack';
  }

  _caveTrollAI() {
    this._trollTurnCounter++;
    if (this._trollTurnCounter % (this._config.heavyBlowCycle ?? 3) === 0) return 'heavyBlow';
    return 'attack';
  }

  _caveTrollKingAI() {
    if (!this.phase2Active && this.enemyHp <= (this._config.phase2Threshold ?? 155)) {
      this.phase2Active        = true;
      this.phase2JustTriggered = true;
      return 'phase2';
    }
    this._trollTurnCounter++;
    if (this._trollTurnCounter % (this._config.quakeCycle ?? 3) === 0) return 'quake';
    return 'attack';
  }
```

- [ ] **Step 5 : Ajouter _trollDoAttack() et les méthodes publiques explosion() et trollQuake()**

Après `_gnollsDoAttack()`, ajouter :

```js
  _trollDoAttack() {
    const cfg     = this._config;
    const mult    = this.phase2Active ? (cfg.phase2AtkMult ?? 1.5) : 1;
    const range   = cfg.atkMax - cfg.atkMin;
    const raw     = cfg.atkMin + Math.floor(Math.random() * (range + 1));
    const result  = this._applyDamageToHero(Math.floor(raw * mult));
    const regen   = cfg.regenPerTurn ?? 0;
    const healed  = Math.min(regen, this.enemyMaxHp - this.enemyHp);
    this.enemyHp += healed;
    result.trollRegen = healed;
    return result;
  }

  explosion() {
    const dmg  = this._config.explosionDamage ?? 60;
    this.heroHp = Math.max(0, this.heroHp - dmg);
    return { damage: dmg };
  }

  trollQuake() {
    const dmg         = this._config.quakeDamage ?? 40;
    const shieldBroken = this.heroShieldActive;
    this.heroShieldActive = false;
    this.heroShieldTurns  = 0;
    this.heroHp = Math.max(0, this.heroHp - dmg);
    return { damage: dmg, shieldBroken };
  }
```

- [ ] **Step 6 : Gérer la contre-attaque du nain dans heroAttack()**

Dans `heroAttack()`, après `const cfg = enemyConfig ?? ENEMIES.goblin;` → non, c'est dans le constructeur. Dans `heroAttack(targetIndex = 0)`, ajouter la vérification du counter au début de la méthode, avant le calcul des dégâts :

```js
  heroAttack(targetIndex = 0) {
    // Cave dwarf counter: hero deals 0 damage, takes reflected damage
    if (this.dwarfCounterActive) {
      this.dwarfCounterActive = false;
      const reflected = Math.floor(this._heroAtk * (this._config.counterReflect ?? 0.5));
      this.heroHp = Math.max(0, this.heroHp - reflected);
      return { damage: 0, rawDamage: 0, blocked: false, crit: false, targetIndex, counterReflected: reflected };
    }
    // ... reste de la méthode inchangé
```

Concrètement, ajouter ces 5 lignes au tout début du corps de `heroAttack()`, avant `const raw = ...`.

- [ ] **Step 7 : Vérifier la syntaxe**

```bash
node --check battle/BattleState.js
```

- [ ] **Step 8 : Commit**

```bash
git add battle/BattleState.js
git commit -m "feat: BattleState IA for mine enemies (cave_bat, cave_dwarf, cave_miner, cave_troll, cave_troll_king)"
```

---

### Task 8: BattleState — IA Plage (pirate_grunt, pirate_crew, pirate_quartermaster, pirate_captain) + poison tick

**Files:**
- Modify: `battle/BattleState.js`

- [ ] **Step 1 : Ajouter les états plage dans le constructeur**

Dans le constructeur, après `this._trollTurnCounter = 0;`, ajouter :

```js
    // Pirate Grunt
    this.pillageStacks      = 0;

    // Pirate Quartermaster
    this.heroPoisoned       = false;
    this.heroPoisonDamage   = 0;

    // Pirate Captain
    this._captainTurnCounter = 0;
```

- [ ] **Step 2 : Ajouter les cases plage dans enemyAI()**

Dans `enemyAI()`, après les cases mine, ajouter :

```js
      case 'pirate_grunt':         return 'attack';
      case 'pirate_crew':          return 'attack';
      case 'pirate_quartermaster': return this._pirateQmAI();
      case 'pirate_captain':       return this._pirateCaptainAI();
```

- [ ] **Step 3 : Ajouter les cases plage dans enemyAttack()**

Dans `enemyAttack()`, après les cases mine, ajouter :

```js
      case 'pirate_grunt':         return [this._pirateGruntDoAttack()];
      case 'pirate_crew':          return this._gnollsDoAttack();
      case 'pirate_quartermaster': return [this._basicEnemyAttack()];
      case 'pirate_captain':       return [this._basicEnemyAttack()];
```

- [ ] **Step 4 : Ajouter les méthodes IA privées plage**

Après `_caveTrollKingAI()`, ajouter :

```js
  _pirateQmAI() {
    if (!this.heroPoisoned) {
      this.heroPoisoned     = true;
      this.heroPoisonDamage = this._config.poisonDamage ?? 8;
      return 'poison';
    }
    if (!this.canEnemyDefend()) return 'attack';
    return Math.random() < 0.7 ? 'attack' : 'defend';
  }

  _pirateCaptainAI() {
    this._captainTurnCounter++;
    if (this._captainTurnCounter % (this._config.cannonballCycle ?? 3) === 0) return 'cannonball';
    if (!this.canEnemyDefend()) return 'attack';
    return Math.random() < 0.75 ? 'attack' : 'defend';
  }
```

- [ ] **Step 5 : Ajouter _pirateGruntDoAttack() et cannonball()**

Après `_trollDoAttack()`, ajouter :

```js
  _pirateGruntDoAttack() {
    const cfg   = this._config;
    const bonus = this.pillageStacks * (cfg.pillageAtkBonus ?? 8);
    const range = cfg.atkMax - cfg.atkMin;
    const raw   = cfg.atkMin + Math.floor(Math.random() * (range + 1)) + bonus;
    const result = this._applyDamageToHero(raw);
    if (!result.dodged && this.pillageStacks < (cfg.pillageMaxStacks ?? 3)) {
      this.pillageStacks++;
      result.pillaged = true;
    }
    return result;
  }

  cannonball() {
    const dmg  = this._config.cannonballDamage ?? 55;
    this.heroHp = Math.max(0, this.heroHp - dmg);
    return { damage: dmg };
  }
```

- [ ] **Step 6 : Ajouter le tick poison dans tickHeroTurn()**

Dans `tickHeroTurn()`, ajouter à la fin :

```js
    if (this.heroPoisoned && this.heroPoisonDamage > 0) {
      this.heroHp = Math.max(0, this.heroHp - this.heroPoisonDamage);
    }
```

- [ ] **Step 7 : Vérifier la syntaxe**

```bash
node --check battle/BattleState.js
```

- [ ] **Step 8 : Commit**

```bash
git add battle/BattleState.js
git commit -m "feat: BattleState IA for plage enemies (pirate_grunt, pirate_crew, pirate_quartermaster, pirate_captain) + poison tick"
```

---

### Task 9: BattleScene — handlers visuels Mine

**Files:**
- Modify: `scenes/BattleScene.js`

- [ ] **Step 1 : Ajouter les cases dans _executeEnemyTurn()**

Dans `_executeEnemyTurn()`, dans le `switch (action)`, avant `default:`, ajouter :

```js
      case 'counterAttack': this._doDwarfCounter();    break;
      case 'explosion':     this._doMinerExplosion();  break;
      case 'heavyBlow':     this._doTrollHeavyBlow();  break;
      case 'quake':         this._doTrollQuake();       break;
      case 'phase2':
        if (this._state._config.ai === 'cave_troll_king') { this._doTrollKingPhase2(); break; }
        this._showPhase2Transition(); break;
```

- [ ] **Step 2 : Ajouter les handlers visuels mine**

Après `_doWitchRegen()`, ajouter :

```js
  _doDwarfCounter() {
    this.showMessage('ARMURE DE ROC — contre-attaque annoncée !');
    const sprite = this._enemy;
    const g = this.add.graphics();
    this.tweens.add({
      targets: { v: 0 }, v: 1, duration: 500, yoyo: true,
      onUpdate: (tw) => {
        const a = tw.getValue();
        g.clear();
        g.fillStyle(0xC0C0C0, 0.3 * a);
        g.fillCircle(sprite.x, sprite.y, 50 * a + 20);
        g.lineStyle(3, 0xD4C060, 0.8 * a);
        g.strokeCircle(sprite.x, sprite.y, 50 * a + 20);
      },
      onComplete: () => g.destroy(),
    });
    this.floatText(sprite.x, sprite.y - 40, 'ARMURE DE ROC', '#D4C060', true);
    this.time.delayedCall(600, () => window.dispatchEvent(new CustomEvent('animation-end')));
  }

  _doMinerExplosion() {
    this.showMessage('Le Mineur allume la mèche !');
    const sprite = this._enemy;
    this.time.delayedCall(400, () => {
      const result = this._state.explosion();
      this.cameras.main.shake(300, 0.04);
      const g = this.add.graphics();
      this.tweens.add({
        targets: { v: 0 }, v: 1, duration: 350, yoyo: true,
        onUpdate: (tw) => {
          const a = tw.getValue();
          g.clear();
          g.fillStyle(0xFF6600, 0.55 * a); g.fillCircle(this._hero.x, this._hero.y, 80 * a);
          g.fillStyle(0xFF2200, 0.35 * a); g.fillCircle(this._hero.x, this._hero.y, 110 * a);
        },
        onComplete: () => g.destroy(),
      });
      this.floatText(this._hero.x, this._hero.y - 40, `BOOM ! -${result.damage}`, '#FF6600', true);
      this._screenFlash();
      this._updateHpBars();
      if (this._state.isHeroDead()) { this.time.delayedCall(700, () => this._onHeroDefeated()); return; }
      window.dispatchEvent(new CustomEvent('animation-end'));
    });
  }

  _doTrollHeavyBlow() {
    this.showMessage(`${this._enemyConfig.name} charge une frappe lourde !`);
    this.time.delayedCall(300, () => {
      this._animEnemyAttack(this._enemy, this._enemyBaseX, () => {
        const results = this._state.enemyAttack();
        const result  = results[0];
        this.cameras.main.shake(200, 0.025);
        this._handleEnemyHitResult(result, this._enemy);
        if (result.trollRegen > 0) this.floatText(this._enemy.x, this._enemy.y - 50, `+${result.trollRegen} REG`, '#22C55E');
        this.floatText(this._hero.x, this._hero.y - 55, 'FRAPPE LOURDE !', '#FF8800', true);
        if (this._state.isHeroDead()) { this.time.delayedCall(700, () => this._onHeroDefeated()); return; }
        window.dispatchEvent(new CustomEvent('animation-end'));
      });
    });
  }

  _doTrollQuake() {
    this.showMessage('SÉISME — le sol tremble !');
    this.cameras.main.shake(350, 0.035);
    this.time.delayedCall(300, () => {
      const result = this._state.trollQuake();
      const g = this.add.graphics();
      this.tweens.add({
        targets: { v: 0 }, v: 1, duration: 400, yoyo: true,
        onUpdate: (tw) => {
          const a = tw.getValue();
          g.clear();
          g.fillStyle(0x884400, 0.4 * a);
          g.fillRect(0, 260, 800, 100);
          g.lineStyle(3, 0xAA6622, 0.6 * a);
          g.strokeRect(0, 260, 800, 100);
        },
        onComplete: () => g.destroy(),
      });
      if (result.shieldBroken) {
        this.showMessage('SÉISME — bouclier brisé !');
        this._hero.clearTint();
        this.floatText(this._hero.x, this._hero.y - 50, 'BOUCLIER BRISÉ !', '#FF4400');
      }
      this.floatText(this._hero.x, this._hero.y - 30, `-${result.damage}`, '#FF8800', true);
      this._updateHpBars();
      if (this._state.isHeroDead()) { this.time.delayedCall(700, () => this._onHeroDefeated()); return; }
      window.dispatchEvent(new CustomEvent('animation-end'));
    });
  }

  _doTrollKingPhase2() {
    this.showMessage('LE ROI TROLL EST EN RAGE !');
    const sprite = this._enemy;
    const g = this.add.graphics();
    this.tweens.add({
      targets: { v: 0 }, v: 1, duration: 600, yoyo: true,
      onUpdate: (tw) => {
        const a = tw.getValue();
        g.clear();
        g.fillStyle(0xFF2200, 0.3 * a); g.fillCircle(sprite.x, sprite.y, 70 * a);
        g.lineStyle(3, 0xFF4400, 0.7 * a); g.strokeCircle(sprite.x, sprite.y, 70 * a);
      },
      onComplete: () => { g.destroy(); this._doEnemyAttack(); },
    });
    this.floatText(sprite.x, sprite.y - 50, 'PHASE 2 !', '#FF2200', true);
    this.cameras.main.shake(200, 0.02);
  }
```

- [ ] **Step 3 : Gérer la contre-attaque dans _executeHeroTurn()**

Dans `_executeHeroTurn()`, dans la branche `if (action === 'attack')`, après `const result = this._state.heroAttack(targetIdx);`, ajouter :

```js
        if (result.counterReflected !== undefined) {
          this.showMessage('ARMURE DE ROC — attaque renvoyée !');
          this.floatText(targetSprite.x, targetSprite.y - 30, 'IMMUNISÉ', '#D4C060', true);
          this.floatText(this._hero.x, this._hero.y - 30, `-${result.counterReflected}`, '#EF4444');
          this._updateHpBars();
          if (this._state.isHeroDead()) { this.time.delayedCall(700, () => this._onHeroDefeated()); return; }
          cb();
          return;
        }
```

Ajouter ce bloc juste après `const result = this._state.heroAttack(targetIdx);` et avant `const color = ...`.

- [ ] **Step 4 : Vérifier la syntaxe**

```bash
node --check scenes/BattleScene.js
```

- [ ] **Step 5 : Commit**

```bash
git add scenes/BattleScene.js
git commit -m "feat: BattleScene visual handlers for mine enemies (counter, explosion, heavyBlow, quake, phase2)"
```

---

### Task 10: BattleScene — handlers visuels Plage + regen troll dans attaque normale

**Files:**
- Modify: `scenes/BattleScene.js`

- [ ] **Step 1 : Ajouter les cases plage dans _executeEnemyTurn()**

Dans `_executeEnemyTurn()`, dans le `switch (action)`, après les cases mine, ajouter :

```js
      case 'poison':     this._doPiratePoison();     break;
      case 'cannonball': this._doPirateCannonball();  break;
```

- [ ] **Step 2 : Ajouter l'affichage regen troll dans _doEnemyAttack()**

Dans `_doEnemyAttack()`, dans la branche `else` (ennemi simple, pas multi), après `this._handleEnemyHitResult(results[0], this._enemy);`, ajouter :

```js
              if (results[0].trollRegen > 0) {
                this.floatText(this._enemy.x, this._enemy.y - 50, `+${results[0].trollRegen} REG`, '#22C55E');
              }
```

- [ ] **Step 3 : Ajouter les handlers visuels plage**

Après `_doTrollKingPhase2()`, ajouter :

```js
  _doPiratePoison() {
    this.showMessage('Le Quartier-Maître empoisonne votre lame !');
    this.time.delayedCall(300, () => {
      this._animEnemyAttack(this._enemy, this._enemyBaseX, () => {
        const g = this.add.graphics();
        this.tweens.add({
          targets: { v: 0 }, v: 1, duration: 500, yoyo: true,
          onUpdate: (tw) => {
            const a = tw.getValue();
            g.clear();
            g.fillStyle(0x22AA22, 0.3 * a); g.fillCircle(this._hero.x, this._hero.y, 55 * a + 15);
            g.lineStyle(2, 0x44CC44, 0.6 * a); g.strokeCircle(this._hero.x, this._hero.y, 55 * a + 15);
          },
          onComplete: () => g.destroy(),
        });
        this._hero.setTint(0x44CC44);
        this.time.delayedCall(800, () => this._hero.clearTint());
        this.floatText(this._hero.x, this._hero.y - 35, 'EMPOISONNÉ !', '#44CC44', true);
        this.showMessage(`Poison actif — ${this._state.heroPoisonDamage} dégâts par tour.`);
        window.dispatchEvent(new CustomEvent('animation-end'));
      });
    });
  }

  _doPirateCannonball() {
    this.showMessage('BOULET DE CANON !');
    this.time.delayedCall(400, () => {
      const result = this._state.cannonball();
      this.cameras.main.shake(250, 0.03);
      const g = this.add.graphics();
      this.tweens.add({
        targets: { v: 0 }, v: 1, duration: 300, yoyo: true,
        onUpdate: (tw) => {
          const a = tw.getValue();
          g.clear();
          g.fillStyle(0xFF2222, 0.45 * a); g.fillCircle(this._hero.x, this._hero.y, 70 * a);
          g.lineStyle(4, 0xFF6666, 0.7 * a); g.strokeCircle(this._hero.x, this._hero.y, 70 * a);
        },
        onComplete: () => g.destroy(),
      });
      this._screenFlash();
      this.floatText(this._hero.x, this._hero.y - 40, `BOULET ! -${result.damage}`, '#FF4444', true);
      this._updateHpBars();
      if (this._state.isHeroDead()) { this.time.delayedCall(700, () => this._onHeroDefeated()); return; }
      window.dispatchEvent(new CustomEvent('animation-end'));
    });
  }
```

- [ ] **Step 4 : Afficher le poison tick dans _executeHeroTurn()**

Le tick poison est déclenché dans `tickHeroTurn()` (BattleState) qui est appelé après chaque tour héros dans `_onPlayerAction()`. Il faut afficher le dégât visuellement.

Dans `_onPlayerAction()`, après `this._state.tickHeroTurn();`, ajouter :

```js
        if (this._state.heroPoisoned && this._state.heroPoisonDamage > 0) {
          this.floatText(this._hero.x, this._hero.y - 30, `-${this._state.heroPoisonDamage} ☠`, '#44CC44');
          this._updateHpBars();
          if (this._state.isHeroDead()) { this.time.delayedCall(700, () => this._onHeroDefeated()); return; }
        }
```

- [ ] **Step 5 : Afficher le stacking pillage pour pirate_grunt**

Dans `_doEnemyAttack()`, branche non-multi, après `this._handleEnemyHitResult(results[0], this._enemy);`, ajouter :

```js
              if (results[0].pillaged) {
                this.floatText(this._enemy.x, this._enemy.y - 50, `PILLAGE ×${this._state.pillageStacks}`, '#FF9900');
              }
```

- [ ] **Step 6 : Vérifier la syntaxe**

```bash
node --check scenes/BattleScene.js
```

- [ ] **Step 7 : Commit**

```bash
git add scenes/BattleScene.js
git commit -m "feat: BattleScene visual handlers for plage enemies (poison, cannonball, pillage, troll regen)"
```

---

### Task 11: Smoke test navigateur

**Files:** aucun

- [ ] **Step 1 : Lancer le jeu**

Ouvrir `index.html` dans le navigateur (via serveur local ou file://). Vérifier :
- L'écran titre s'affiche ✓
- Nouvelle partie → carte du monde ✓

- [ ] **Step 2 : Tester la Mine (5 combats)**

Sur la carte, aller à Forêt (compléter), puis Mine. Vérifier dans l'ordre :
1. **cave_bat** : sprites chauves-souris visibles, attaquent en multi (2 barres HP), meurent normalement
2. **cave_dwarf** : tous les 3 tours, message "ARMURE DE ROC", attaquer ce tour → dégâts réfléchis, 0 dégâts infligés
3. **cave_miner** : compteur explosion visible après 3 tours ennemi → explosion ~60 dégâts bruts
4. **cave_troll** : régénération affichée (+12 REG) chaque tour, frappe lourde tous les 3 tours
5. **cave_troll_king** : idem troll + séisme + transition phase 2 à ~50% HP

- [ ] **Step 3 : Tester la Plage (4 combats)**

1. **pirate_grunt** : chaque coup qui touche → stacking pillage affiché (×1, ×2, ×3)
2. **pirate_crew** : multi (2 corsaires), vengeance si l'un meurt
3. **pirate_quartermaster** : tour 1 = poison appliqué (vert), chaque tour héros = -8 HP ☠
4. **pirate_captain** : tous les 3 tours = boulet de canon, dégâts garantis indépendamment du bouclier

- [ ] **Step 4 : Vérifier absence d'erreurs console**

Aucune erreur JavaScript dans la console du navigateur.
