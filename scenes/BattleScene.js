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
import BattleState from '../battle/BattleState.js';
import { ENEMIES } from '../battle/enemies.js';
import { VILLAGES } from '../battle/villages.js';
import { rollLoot } from '../battle/items.js';

const SPRITE_DEFS = {
  goblin:     { prefix: 'goblin',      sheets: { idle: createGoblinIdleSheet,      walk: createGoblinWalkSheet,      attack: createGoblinAttackSheet,      defend: createGoblinDefendSheet      } },
  orc:        { prefix: 'orc',         sheets: { idle: createOrcIdleSheet,          walk: createOrcWalkSheet,          attack: createOrcAttackSheet,          defend: createOrcDefendSheet          } },
  witch:      { prefix: 'witch',       sheets: { idle: createWitchIdleSheet,        walk: createWitchWalkSheet,        attack: createWitchAttackSheet,        defend: createWitchDefendSheet        } },
  gnoll:      { prefix: 'gnoll',       sheets: { idle: createGnollIdleSheet,        walk: createGnollWalkSheet,        attack: createGnollAttackSheet,        defend: createGnollDefendSheet        } },
  shadowLord: { prefix: 'shadow-lord', sheets: { idle: createShadowLordIdleSheet,   walk: createShadowLordWalkSheet,   attack: createShadowLordAttackSheet,   defend: createShadowLordDefendSheet   } },
};

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
    this._state           = null;
    this._hero            = null;
    this._enemy           = null;
    this._enemies         = [];
    this._heroBaseX       = 200;
    this._enemyBaseX      = 600;
    this._enemyBaseXs     = [500, 680];
    this._characterY      = 258;
    this._hpBg            = null;
    this._hpGhost         = null;
    this._hpFill          = null;
    this._heroHpText      = null;
    this._enemyHpTexts    = [];
    this._heroHpGhost     = 0;
    this._enemyHpGhost0   = 0;
    this._enemyHpGhost1   = 0;
    this._enemyTintActive = false;
    this._actionListener  = null;
    this._embers          = [];
    this._enemyConfig     = null;
    this._enemyPrefix     = 'goblin';
    this._villageId       = null;
    this._battleSeqIdx    = 0;
    this._battleSequence  = [];
  }

  preload() {
    const hero = {
      'hero-idle':   createHeroIdleSheet(),
      'hero-walk':   createHeroWalkSheet(),
      'hero-attack': createHeroAttackSheet(),
      'hero-heal':   createHeroHealSheet(),
      'hero-shield': createHeroShieldSheet(),
    };
    const allEnemySheets = {};
    for (const [spriteId, def] of Object.entries(SPRITE_DEFS)) {
      for (const [type, fn] of Object.entries(def.sheets)) {
        allEnemySheets[`${def.prefix}-${type}`] = fn();
      }
    }
    for (const [key, sheet] of Object.entries({ ...hero, ...allEnemySheets })) {
      if (this.textures.exists(key)) continue;
      this.textures.addSpriteSheet(key, sheet.canvas, {
        frameWidth:  sheet.frameWidth,
        frameHeight: sheet.frameHeight,
      });
    }
  }

  create() {
    // Garantit que les boutons HTML sont actifs à chaque début de combat,
    // même si animation-start avait été dispatché sans animation-end correspondant
    window.dispatchEvent(new CustomEvent('animation-end'));

    const ps          = window.playerState ?? null;
    this._villageId   = this.scene.settings.data?.villageId ?? 'hameau';
    this._battleSeqIdx = this.scene.settings.data?.seqIdx  ?? 0;
    const village     = VILLAGES[this._villageId];
    this._battleSequence = village ? village.battles : ['goblin'];
    const enemyId     = this._battleSequence[this._battleSeqIdx] ?? 'goblin';
    this._enemyConfig = ENEMIES[enemyId] ?? ENEMIES.goblin;
    this._enemyPrefix = SPRITE_DEFS[this._enemyConfig.sprite]?.prefix ?? 'goblin';

    this._state           = new BattleState(ps, this._enemyConfig);
    this._enemyTintActive = false;
    this._enemies         = [];
    this._enemy           = null;
    this._embers          = [];

    this._heroHpGhost   = this._state.heroMaxHp;
    if (this._state.isMulti) {
      this._enemyHpGhost0 = this._state.enemies[0].maxHp;
      this._enemyHpGhost1 = this._state.enemies[1].maxHp;
    } else {
      this._enemyHpGhost0 = this._state.enemyMaxHp;
      this._enemyHpGhost1 = 0;
    }

    this._drawBackground();
    this._registerAnimations();
    this._createSprites();
    this._createHpBars();
    this._spawnEmbers();
    this._listenPlayerAction();

    window.dispatchEvent(new CustomEvent('battle-message', { detail: { text: 'Choisissez une action...' } }));
  }

  update(time) {
    this._updateEmbers(time);
  }

  // ─── BACKGROUND ──────────────────────────────────────────────────────────────

  _drawBackground() {
    const g = this.add.graphics();
    const W = 800, H = 340;

    g.fillGradientStyle(0x060010, 0x060010, 0x1a0535, 0x0e0220, 1);
    g.fillRect(0, 0, W, 240);

    g.fillStyle(0xEEE4C8, 0.85);
    g.fillCircle(680, 52, 32);
    g.fillStyle(0x0c001c, 1);
    g.fillCircle(692, 46, 26);

    const stars = [
      [60,20],[120,8],[200,15],[300,6],[350,22],[450,10],[520,4],[570,18],
      [630,12],[720,24],[760,8],[100,30],[400,28],[560,30],
    ];
    g.fillStyle(0xFFFFFF, 0.7);
    stars.forEach(([sx, sy]) => g.fillCircle(sx, sy, 1));

    g.fillStyle(0x120330);
    [
      [[0,160],[150,70],[300,160]],
      [[160,160],[310,50],[460,160]],
      [[340,160],[490,60],[640,160]],
      [[560,160],[710,75],[800,160],[800,160],[0,160]],
    ].forEach(pts => {
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach(p => g.lineTo(p[0], p[1]));
      g.closePath(); g.fillPath();
    });

    g.fillStyle(0x1c0645);
    [
      [[0,195],[100,140],[220,195]],
      [[120,195],[260,120],[400,195]],
      [[300,195],[450,130],[600,195]],
      [[520,195],[660,145],[800,195],[800,200],[0,200]],
    ].forEach(pts => {
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach(p => g.lineTo(p[0], p[1]));
      g.closePath(); g.fillPath();
    });

    g.fillStyle(0x250850);
    [
      [[0,218],[80,175],[180,218]],
      [[100,218],[240,158],[380,218]],
      [[310,218],[460,162],[610,218]],
      [[560,218],[700,178],[800,218],[800,225],[0,225]],
    ].forEach(pts => {
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach(p => g.lineTo(p[0], p[1]));
      g.closePath(); g.fillPath();
    });

    g.fillGradientStyle(0x240055, 0x240055, 0x3d00aa, 0x240055, 1);
    g.fillRect(0, 218, W, 6);
    g.lineStyle(1, 0x7C3AED, 0.8);
    g.beginPath(); g.moveTo(0, 218); g.lineTo(W, 218); g.strokePath();

    g.fillGradientStyle(0x18083a, 0x18083a, 0x0e0520, 0x0e0520, 1);
    g.fillRect(0, 224, W, H - 224);

    g.lineStyle(1, 0x3d1080, 0.35);
    const vx = 400, vy = 200;
    for (let y = 234; y < H; y += 18) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.strokePath();
    }
    for (let i = 0; i <= 14; i++) {
      const fx = (i / 14) * W;
      const ratio = 0.28;
      const sx = vx + (fx - vx) * ratio;
      const sy = vy + (H - vy) * ratio;
      g.beginPath(); g.moveTo(sx, sy); g.lineTo(fx, H); g.strokePath();
    }

    g.lineStyle(1, 0x4a10a0, 0.3);
    g.strokeCircle(400, 290, 70);
    g.strokeCircle(400, 290, 55);
    g.lineStyle(1, 0x7C3AED, 0.15);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(400, 290);
      g.lineTo(400 + Math.cos(a) * 70, 290 + Math.sin(a) * 70);
      g.strokePath();
    }

    this._drawPillar(g, 28, 130);
    this._drawPillar(g, 744, 130);

    g.fillStyle(0xFF6600, 0.04); g.fillCircle(62, 178, 60);
    g.fillStyle(0xFF6600, 0.06); g.fillCircle(62, 178, 35);
    g.fillStyle(0xFF6600, 0.04); g.fillCircle(738, 178, 60);
    g.fillStyle(0xFF6600, 0.06); g.fillCircle(738, 178, 35);

    this._drawTorch(g, 54, 162);
    this._drawTorch(g, 730, 162);
  }

  _drawPillar(g, x, topY) {
    const w = 28, h = 95;
    g.fillStyle(0x000000, 0.4); g.fillRect(x + 4, topY + 4, w, h);
    g.fillStyle(0x1e0848);      g.fillRect(x, topY, w, h);
    g.fillStyle(0x3a1085, 0.6); g.fillRect(x + 2, topY, 4, h);
    g.fillStyle(0x2e0e6a);
    g.fillRect(x - 3, topY, w + 6, 8);
    g.fillRect(x - 3, topY + h - 6, w + 6, 6);
    g.lineStyle(1, 0x7C3AED, 0.4); g.strokeRect(x, topY, w, h);
  }

  _drawTorch(g, x, y) {
    g.fillStyle(0x5C3317); g.fillRect(x - 2, y, 4, 14);
    g.fillStyle(0xFF4400); g.fillTriangle(x - 5, y + 4, x + 5, y + 4, x, y - 8);
    g.fillStyle(0xFF8800); g.fillTriangle(x - 3, y + 3, x + 3, y + 3, x, y - 4);
    g.fillStyle(0xFFDD00); g.fillCircle(x, y, 3);
  }

  // ─── EMBERS ──────────────────────────────────────────────────────────────────

  _spawnEmbers() {
    for (let i = 0; i < 18; i++) this._embers.push(this._makeEmber(true));
  }

  _makeEmber(randomY = false) {
    const side = Math.random() < 0.5 ? 62 : 738;
    return {
      x: side + (Math.random() - 0.5) * 20,
      y: randomY ? 100 + Math.random() * 130 : 162,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(0.4 + Math.random() * 0.7),
      life: 0, maxLife: 80 + Math.random() * 120,
      size: 1 + Math.random() * 2,
      gfx: this.add.graphics(),
    };
  }

  _updateEmbers(time) {
    this._embers.forEach((e, i) => {
      e.x += e.vx; e.y += e.vy; e.life++;
      const ratio = e.life / e.maxLife;
      const alpha = ratio < 0.3 ? ratio / 0.3 : 1 - (ratio - 0.3) / 0.7;
      e.gfx.clear();
      if (alpha > 0.02) {
        e.gfx.fillStyle(ratio < 0.5 ? 0xFF8800 : 0xFF4400, Math.min(alpha * 0.9, 0.9));
        e.gfx.fillCircle(e.x, e.y, e.size * (1 - ratio * 0.5));
      }
      if (e.life >= e.maxLife) {
        e.gfx.destroy();
        this._embers[i] = this._makeEmber(false);
      }
    });
  }

  // ─── ANIMATIONS ──────────────────────────────────────────────────────────────

  _registerAnimations() {
    const defs = [
      { key: 'hero-idle',   frameRate: 4,  repeat: -1 },
      { key: 'hero-walk',   frameRate: 8,  repeat: -1 },
      { key: 'hero-attack', frameRate: 12, repeat:  0 },
      { key: 'hero-heal',   frameRate: 6,  repeat:  0 },
      { key: 'hero-shield', frameRate: 6,  repeat:  0 },
    ];
    for (const def of Object.values(SPRITE_DEFS)) {
      defs.push({ key: `${def.prefix}-idle`,   frameRate: 4,  repeat: -1 });
      defs.push({ key: `${def.prefix}-walk`,   frameRate: 8,  repeat: -1 });
      defs.push({ key: `${def.prefix}-attack`, frameRate: 12, repeat:  0 });
      defs.push({ key: `${def.prefix}-defend`, frameRate: 6,  repeat:  0 });
    }
    for (const { key, frameRate, repeat } of defs) {
      if (!this.anims.exists(key) && this.textures.exists(key)) {
        this.anims.create({ key, frames: this.anims.generateFrameNumbers(key), frameRate, repeat });
      }
    }
  }

  // ─── SPRITES ─────────────────────────────────────────────────────────────────

  _createSprites() {
    this._hero = this.add.sprite(this._heroBaseX, this._characterY, 'hero-idle');
    this._hero.play('hero-idle');

    const idleKey = `${this._enemyPrefix}-idle`;
    if (this._state.isMulti) {
      this._enemies = this._enemyBaseXs.map(x => {
        const s = this.add.sprite(x, this._characterY, idleKey);
        s.setFlipX(true);
        s.play(idleKey);
        return s;
      });
    } else {
      this._enemy = this.add.sprite(this._enemyBaseX, this._characterY, idleKey);
      this._enemy.setFlipX(true);
      this._enemy.play(idleKey);
    }
  }

  // ─── HP BARS ─────────────────────────────────────────────────────────────────

  _createHpBars() {
    this._hpBg    = this.add.graphics();
    this._hpGhost = this.add.graphics();
    this._hpFill  = this.add.graphics();

    this._drawHpBarBackgrounds();
    this._drawHpGhost();
    this._drawHpBarFills();

    const actIdx = this._battleSeqIdx + 1;
    const total  = this._battleSequence.length;
    this.add.text(10, 7, 'HÉROS', {
      fontSize: '11px', fontFamily: 'Russo One', color: '#E2E8F0', letterSpacing: 3,
    });

    if (this._state.isMulti) {
      const [e0, e1] = this._state.enemies;
      this.add.text(510, 7, e0.name, { fontSize: '9px', fontFamily: 'Russo One', color: '#E2E8F0', letterSpacing: 2 }).setOrigin(0.5, 0);
      this.add.text(700, 7, e1.name, { fontSize: '9px', fontFamily: 'Russo One', color: '#E2E8F0', letterSpacing: 2 }).setOrigin(0.5, 0);
      this._enemyHpTexts = [
        this.add.text(510, 37, '', { fontSize: '10px', fontFamily: 'Chakra Petch', color: '#94A3B8' }).setOrigin(0.5, 0),
        this.add.text(700, 37, '', { fontSize: '10px', fontFamily: 'Chakra Petch', color: '#94A3B8' }).setOrigin(0.5, 0),
      ];
    } else {
      this.add.text(790, 7, this._enemyConfig.name, {
        fontSize: '11px', fontFamily: 'Russo One', color: '#E2E8F0', letterSpacing: 3,
      }).setOrigin(1, 0);
      const t = this.add.text(784, 37, '', {
        fontSize: '10px', fontFamily: 'Chakra Petch', color: '#94A3B8',
      }).setOrigin(1, 0);
      this._enemyHpTexts = [t];
    }

    this._heroHpText = this.add.text(16, 37, '', {
      fontSize: '10px', fontFamily: 'Chakra Petch', color: '#94A3B8',
    });

    this.add.text(400, 14, 'VS', {
      fontSize: '16px', fontFamily: 'Russo One', color: '#7C3AED', letterSpacing: 4,
    }).setOrigin(0.5, 0);
    this.add.text(400, 32, `COMBAT ${actIdx} / ${total}`, {
      fontSize: '9px', fontFamily: 'Chakra Petch', color: '#6B7280', letterSpacing: 2,
    }).setOrigin(0.5, 0);

    this._updateHpBars();
  }

  _drawHpBarBackgrounds() {
    const g = this._hpBg;
    g.clear();
    g.fillStyle(0x000000, 0.7);
    g.fillRoundedRect(10, 20, 370, 20, 3);
    g.lineStyle(1, 0x4a1a8a, 0.8);
    g.strokeRoundedRect(10, 20, 370, 20, 3);

    if (this._state.isMulti) {
      for (const x of [420, 608]) {
        g.fillStyle(0x000000, 0.7);
        g.fillRoundedRect(x, 20, 178, 20, 3);
        g.lineStyle(1, 0x4a1a8a, 0.8);
        g.strokeRoundedRect(x, 20, 178, 20, 3);
      }
    } else {
      g.fillStyle(0x000000, 0.7);
      g.fillRoundedRect(420, 20, 370, 20, 3);
      g.lineStyle(1, 0x4a1a8a, 0.8);
      g.strokeRoundedRect(420, 20, 370, 20, 3);
    }
  }

  _drawHpGhost() {
    const g = this._hpGhost;
    g.clear();
    const heroR = this._heroHpGhost / this._state.heroMaxHp;
    if (heroR > 0) {
      g.fillStyle(0xFFB800, 0.35);
      g.fillRect(12, 22, Math.max(0, Math.floor(366 * heroR)), 16);
    }
    if (this._state.isMulti) {
      const [e0, e1] = this._state.enemies;
      const r0 = this._enemyHpGhost0 / e0.maxHp;
      const r1 = this._enemyHpGhost1 / e1.maxHp;
      if (r0 > 0) { const w = Math.floor(174 * r0); g.fillStyle(0xFFB800, 0.35); g.fillRect(422 + (174 - w), 22, w, 16); }
      if (r1 > 0) { const w = Math.floor(174 * r1); g.fillStyle(0xFFB800, 0.35); g.fillRect(610 + (174 - w), 22, w, 16); }
    } else {
      const r = this._enemyHpGhost0 / this._state.enemyMaxHp;
      if (r > 0) { const w = Math.floor(366 * r); g.fillStyle(0xFFB800, 0.35); g.fillRect(422 + (366 - w), 22, w, 16); }
    }
  }

  _getHpColor(ratio) {
    if (ratio > 0.5) return 0x22C55E;
    if (ratio > 0.25) return 0xF59E0B;
    return 0xEF4444;
  }

  _drawHpBarFills() {
    const g = this._hpFill;
    g.clear();
    const heroR = this._state.heroHp / this._state.heroMaxHp;
    const hw = Math.max(0, Math.floor(366 * heroR));
    if (hw > 0) {
      g.fillStyle(this._getHpColor(heroR)); g.fillRect(12, 22, hw, 16);
      g.fillStyle(0xFFFFFF, 0.12);          g.fillRect(12, 22, hw, 5);
    }
    if (this._state.isMulti) {
      for (let i = 0; i < 2; i++) {
        const e  = this._state.enemies[i];
        const bx = i === 0 ? 422 : 610;
        const bw = 174;
        const r  = e.hp / e.maxHp;
        const fw = Math.max(0, Math.floor(bw * r));
        if (fw > 0) {
          g.fillStyle(this._getHpColor(r)); g.fillRect(bx + (bw - fw), 22, fw, 16);
          g.fillStyle(0xFFFFFF, 0.12);      g.fillRect(bx + (bw - fw), 22, fw, 5);
        }
      }
    } else {
      const r  = this._state.enemyHp / this._state.enemyMaxHp;
      const ew = Math.max(0, Math.floor(366 * r));
      if (ew > 0) {
        g.fillStyle(this._getHpColor(r)); g.fillRect(422 + (366 - ew), 22, ew, 16);
        g.fillStyle(0xFFFFFF, 0.12);      g.fillRect(422 + (366 - ew), 22, ew, 5);
      }
    }
  }

  _updateHpBars() {
    // Ghost bar tweens
    if (this._heroHpGhost > this._state.heroHp) {
      this.time.delayedCall(200, () => {
        this.tweens.add({ targets: this, _heroHpGhost: this._state.heroHp, duration: 700, ease: 'Sine.easeOut', onUpdate: () => this._drawHpGhost() });
      });
    }
    if (this._state.isMulti) {
      if (this._enemyHpGhost0 > this._state.enemies[0].hp) {
        this.time.delayedCall(200, () => {
          this.tweens.add({ targets: this, _enemyHpGhost0: this._state.enemies[0].hp, duration: 700, ease: 'Sine.easeOut', onUpdate: () => this._drawHpGhost() });
        });
      }
      if (this._enemyHpGhost1 > this._state.enemies[1].hp) {
        this.time.delayedCall(200, () => {
          this.tweens.add({ targets: this, _enemyHpGhost1: this._state.enemies[1].hp, duration: 700, ease: 'Sine.easeOut', onUpdate: () => this._drawHpGhost() });
        });
      }
      this._enemyHpTexts[0]?.setText(`${this._state.enemies[0].hp} / ${this._state.enemies[0].maxHp}`);
      this._enemyHpTexts[1]?.setText(`${this._state.enemies[1].hp} / ${this._state.enemies[1].maxHp}`);
    } else {
      if (this._enemyHpGhost0 > this._state.enemyHp) {
        this.time.delayedCall(200, () => {
          this.tweens.add({ targets: this, _enemyHpGhost0: this._state.enemyHp, duration: 700, ease: 'Sine.easeOut', onUpdate: () => this._drawHpGhost() });
        });
      }
      this._enemyHpTexts[0]?.setText(`${this._state.enemyHp} / ${this._state.enemyMaxHp}`);
    }
    this._drawHpBarFills();
    this._heroHpText?.setText(`${this._state.heroHp} / ${this._state.heroMaxHp}`);
  }

  // ─── EFFECTS ─────────────────────────────────────────────────────────────────

  _explode(x, y) {
    const colors = [0xFF4400, 0xFF8800, 0xFFCC00, 0xFF2244, 0xFFFFFF];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist  = Phaser.Math.Between(28, 75);
      const gfx   = this.add.graphics();
      gfx.fillStyle(colors[Math.floor(Math.random() * colors.length)], 1);
      gfx.fillCircle(0, 0, Phaser.Math.FloatBetween(3, 8));
      gfx.x = x; gfx.y = y;
      this.tweens.add({
        targets: gfx,
        x: x + Math.cos(angle) * dist, y: y + Math.sin(angle) * dist - Phaser.Math.Between(5, 20),
        alpha: 0, scaleX: 0.2, scaleY: 0.2,
        duration: 280 + Math.random() * 220, ease: 'Sine.easeOut',
        onComplete: () => gfx.destroy(),
      });
    }
    const flash = this.add.graphics();
    flash.fillStyle(0xFFFFFF, 1); flash.fillCircle(x, y, 22); flash.setDepth(10);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 2.2, scaleY: 2.2, duration: 180, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });
  }

  _hitSpark(x, y) {
    const g = this.add.graphics(); g.setDepth(9);
    for (let i = 0; i < 8; i++) {
      const angle  = (i / 8) * Math.PI * 2;
      const len    = 18 + (i % 2) * 12;
      g.lineStyle(2, [0xFFFF44, 0xFF8800, 0xFFFFFF][i % 3], 1);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len); g.strokePath();
    }
    this.tweens.add({ targets: g, scaleX: 1.6, scaleY: 1.6, alpha: 0, duration: 220, ease: 'Cubic.easeOut', onComplete: () => g.destroy() });
  }

  _screenFlash(color = 0xFFFFFF, alpha = 0.25) {
    const o = this.add.graphics(); o.fillStyle(color, alpha); o.fillRect(0, 0, 800, 340); o.setDepth(20);
    this.tweens.add({ targets: o, alpha: 0, duration: 150, ease: 'Cubic.easeOut', onComplete: () => o.destroy() });
  }

  floatText(x, y, text, color = '#FFFFFF', big = false) {
    const t = this.add.text(x, y, text, {
      fontSize: big ? '32px' : '22px', fontFamily: 'Russo One',
      color, stroke: '#000000', strokeThickness: big ? 5 : 3,
    }).setOrigin(0.5, 1).setDepth(15);
    const dy = big ? 80 : 60;
    this.tweens.add({
      targets: t, y: y - dy, alpha: { from: 1, to: 0 },
      scaleX: big ? { from: 1.3, to: 0.8 } : 1,
      scaleY: big ? { from: 1.3, to: 0.8 } : 1,
      duration: big ? 900 : 700, ease: 'Sine.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  showMessage(text) {
    window.dispatchEvent(new CustomEvent('battle-message', { detail: { text } }));
  }

  _showPhase2Transition() {
    this._screenFlash(0x6600AA, 0.5);
    this.cameras.main.shake(300, 0.02);
    this.floatText(this._enemyBaseX, this._characterY - 60, 'PHASE 2 !', '#AA00FF', true);
    this.showMessage('Le Seigneur des Ombres entre en Phase 2 !');
  }

  _showOrcRage() {
    if (!this._enemy) return;
    this._screenFlash(0xFF0000, 0.3);
    this.floatText(this._enemyBaseX, this._characterY - 60, 'RAGE !', '#FF3300', true);
    this.showMessage("L'Orc entre en RAGE — attaque ×1.5 !");
    this._enemy.setTint(0xFF5500);
  }

  // ─── PLAYER INPUT ─────────────────────────────────────────────────────────────

  _listenPlayerAction() {
    if (this._actionListener) window.removeEventListener('player-action', this._actionListener);
    this._actionListener = (e) => this._onPlayerAction(e.detail.action);
    window.addEventListener('player-action', this._actionListener);
  }

  _onPlayerAction(action) {
    const msgs = { 'attack': 'Attaque !', 'double-slash': 'Double Slash !', 'shield': 'Bouclier du Guerrier !', 'heal': 'Soin !' };
    this.showMessage(msgs[action] || 'Action !');

    this.time.delayedCall(300, () => {
      this._executeHeroTurn(action, () => {
        if (this._state.isEnemyDead()) {
          this._onEnemyDefeated();
          return;
        }
        this._state.tickHeroTurn();
        this.time.delayedCall(450, () => this._executeEnemyTurn());
      });
    });
  }

  // ─── HERO TURN ────────────────────────────────────────────────────────────────

  _executeHeroTurn(action, cb) {
    window.dispatchEvent(new CustomEvent('animation-start'));

    if (action === 'attack') {
      const targetSprite = this._state.isMulti ? this._getTargetSprite() : this._enemy;
      const targetIdx    = this._state.isMulti ? this._getTargetIndex() : 0;
      this._animHeroAttack(targetSprite, () => {
        if (this._enemyTintActive) { targetSprite.clearTint(); this._enemyTintActive = false; }
        const result = this._state.heroAttack(targetIdx);
        const color  = result.blocked ? '#F59E0B' : '#EF4444';
        const text   = result.blocked ? `-${result.damage} BLOQUÉ` : `-${result.damage}`;
        this._explode(targetSprite.x, targetSprite.y - 20);
        this._hitSpark(targetSprite.x + 30, targetSprite.y - 30);
        this._screenFlash();
        this.floatText(targetSprite.x, targetSprite.y - 30, text, color);
        if (result.blocked) this.showMessage('Attaque bloquée !');
        if (result.phase2Triggered) this._showPhase2Transition();
        this._updateHpBars();
        this._checkGnollDeath(targetIdx);
        cb();
      });

    } else if (action === 'double-slash') {
      this._animHeroDoubleSlash(cb);

    } else if (action === 'shield') {
      this._animHeroShield(cb);

    } else { // heal
      this._animHeroHeal(() => {
        const result = this._state.heroHeal();
        if (result.blocked) {
          this.floatText(this._hero.x, this._hero.y - 30, 'BLOQUÉ !', '#F59E0B', true);
          this.showMessage('Soin bloqué par le Seigneur des Ombres !');
        } else {
          this.floatText(this._hero.x, this._hero.y - 30, `+${result.healed}`, '#22C55E', true);
        }
        this._updateHpBars();
        cb();
      });
    }
  }

  _getTargetIndex() {
    if (!this._state.isMulti) return 0;
    return this._state.enemies.findIndex(e => e.hp > 0);
  }

  _getTargetSprite() {
    const idx = this._getTargetIndex();
    return this._enemies[idx] ?? this._enemies[0];
  }

  _animHeroAttack(targetSprite, onImpact) {
    const hero  = this._hero;
    const baseX = this._heroBaseX;
    const targetX = targetSprite.x;

    hero.play('hero-walk');
    this.tweens.add({
      targets: hero, x: baseX + 90, duration: 180, ease: 'Sine.easeOut',
      onComplete: () => {
        hero.play('hero-attack');
        hero.once('animationcomplete-hero-attack', () => {
          targetSprite.setTint(0xff6666);
          this.cameras.main.shake(120, 0.012);
          this.time.delayedCall(80, () => targetSprite.clearTint());
          this.tweens.add({ targets: targetSprite, x: targetX + 20, duration: 70, yoyo: true, ease: 'Sine.easeOut' });
          onImpact();
          this.time.delayedCall(110, () => {
            hero.play('hero-walk');
            this.tweens.add({ targets: hero, x: baseX, duration: 160, ease: 'Sine.easeIn', onComplete: () => hero.play('hero-idle') });
          });
        });
      },
    });
  }

  _animHeroHeal(onHeal) {
    const hero = this._hero;
    hero.play('hero-heal');
    const glow = this.add.graphics();
    this.tweens.add({
      targets: { v: 0 }, v: 1, duration: 600, yoyo: true,
      onUpdate: (tween) => {
        const a = tween.getValue();
        glow.clear();
        glow.fillStyle(0x22C55E, 0.28 * a); glow.fillCircle(hero.x, hero.y, 55 * a + 20);
        glow.lineStyle(2, 0x22C55E, 0.5 * a); glow.strokeCircle(hero.x, hero.y, 55 * a + 20);
      },
      onComplete: () => { glow.destroy(); onHeal(); },
    });
    hero.once('animationcomplete-hero-heal', () => hero.play('hero-idle'));
  }

  _animHeroDoubleSlash(cb) {
    const targetIdx = this._getTargetIndex();
    const target    = this._state.isMulti ? this._enemies[targetIdx] : this._enemy;
    const targetX   = target.x;
    if (this._enemyTintActive) { target.clearTint(); this._enemyTintActive = false; }
    const hero = this._hero, baseX = this._heroBaseX;

    const doHit = (yOffset, tIdx, next) => {
      const tgt = this._state.isMulti ? this._enemies[tIdx] : this._enemy;
      hero.play('hero-attack');
      hero.once('animationcomplete-hero-attack', () => {
        tgt.setTint(0xff6666);
        this.cameras.main.shake(100, 0.01);
        this.time.delayedCall(70, () => tgt.clearTint());
        this.tweens.add({ targets: tgt, x: tgt.x + 14, duration: 65, yoyo: true });
        const result = this._state.heroAttack(tIdx);
        this._explode(tgt.x - 10, tgt.y - 20 + yOffset);
        this._hitSpark(tgt.x + 25, tgt.y - 25 + yOffset);
        this.floatText(tgt.x, tgt.y - 30 + yOffset, `-${result.damage}`, result.blocked ? '#F59E0B' : '#EF4444');
        if (result.phase2Triggered) this._showPhase2Transition();
        this._updateHpBars();
        this._checkGnollDeath(tIdx);
        next();
      });
    };

    hero.play('hero-walk');
    this.tweens.add({
      targets: hero, x: baseX + 90, duration: 180, ease: 'Sine.easeOut',
      onComplete: () => {
        doHit(0, targetIdx, () => {
          if (this._state.isEnemyDead()) {
            this._screenFlash();
            this.time.delayedCall(110, () => {
              hero.play('hero-walk');
              this.tweens.add({ targets: hero, x: baseX, duration: 160, ease: 'Sine.easeIn', onComplete: () => { hero.play('hero-idle'); cb(); } });
            });
            return;
          }
          // Second hit: target next alive enemy (or same)
          const tIdx2 = this._getTargetIndex();
          this.time.delayedCall(250, () => {
            doHit(-22, tIdx2, () => {
              this._screenFlash();
              this.time.delayedCall(110, () => {
                hero.play('hero-walk');
                this.tweens.add({ targets: hero, x: baseX, duration: 160, ease: 'Sine.easeIn', onComplete: () => { hero.play('hero-idle'); cb(); } });
              });
            });
          });
        });
      },
    });
  }

  _animHeroShield(cb) {
    const hero = this._hero;
    this._state.heroShield();
    hero.play('hero-shield');
    hero.setTint(0xAA88FF);
    const glow = this.add.graphics();
    this.tweens.add({
      targets: { v: 0 }, v: 1, duration: 500, yoyo: true,
      onUpdate: (tween) => {
        const a = tween.getValue();
        glow.clear();
        glow.fillStyle(0x7C3AED, 0.3 * a); glow.fillCircle(hero.x, hero.y, 58 * a + 20);
        glow.lineStyle(2, 0xA78BFA, 0.6 * a); glow.strokeCircle(hero.x, hero.y, 58 * a + 20);
      },
      onComplete: () => glow.destroy(),
    });
    hero.once('animationcomplete-hero-shield', () => { hero.play('hero-idle'); cb(); });
  }

  // ─── ENEMY TURN ───────────────────────────────────────────────────────────────

  _executeEnemyTurn() {
    const action = this._state.enemyAI();
    const name   = this._enemyConfig.name;

    this._state.tickEnemyTurn();

    // Notify ORC rage just activated
    if (this._state.orcRageActive && this._state._config.ai === 'orc') {
      const wasRaging = this._enemy?.getData('rageShown');
      if (!wasRaging) {
        this._enemy?.setData('rageShown', true);
        this._showOrcRage();
      }
    }

    // Notify heal block from Shadow Lord
    if (this._state.heroHealBlocked) {
      this.showMessage('Le Seigneur des Ombres scelle votre soin !');
      this.floatText(this._hero.x, this._hero.y - 30, 'SOIN SCELLÉ', '#7C3AED');
    }

    switch (action) {
      case 'curse':  this._doWitchCurse();  break;
      case 'regen':  this._doWitchRegen();  break;
      case 'defend': this._doEnemyDefend(); break;
      default:       this._doEnemyAttack(); break;
    }
  }

  _doEnemyAttack() {
    const name = this._enemyConfig.name;
    this.showMessage(`${name} attaque !`);

    if (this._state.isMulti) {
      this.time.delayedCall(300, () => this._doGnollsAttack());
    } else {
      this.time.delayedCall(380, () => {
        this._animEnemyAttack(this._enemy, this._enemyBaseX, () => {
          const results = this._state.enemyAttack();
          this._handleEnemyHitResult(results[0], this._enemy);
          // Shadow Lord double hit
          if (results.length > 1) {
            this.time.delayedCall(250, () => {
              this._explode(this._hero.x, this._hero.y - 20);
              this.floatText(this._hero.x, this._hero.y - 50, `-${results[1].damage}`, '#FF2244');
              this.floatText(this._hero.x + 20, this._hero.y - 30, 'DOUBLE !', '#FF6600');
              this._updateHpBars();
              if (this._state.isHeroDead()) { this.time.delayedCall(700, () => this._onHeroDefeated()); return; }
              window.dispatchEvent(new CustomEvent('animation-end'));
            });
          } else {
            if (this._state.isHeroDead()) { this.time.delayedCall(700, () => this._onHeroDefeated()); return; }
            window.dispatchEvent(new CustomEvent('animation-end'));
          }
        });
      });
    }
  }

  _doGnollsAttack() {
    // Identify alive gnolls BEFORE applying damage
    const aliveGnolls = this._state.enemies
      .map((e, i) => ({ i, sprite: this._enemies[i], wasAlive: e.hp > 0 }))
      .filter(g => g.wasAlive);

    if (!aliveGnolls.length) { window.dispatchEvent(new CustomEvent('animation-end')); return; }

    // Apply all damage once and store results indexed by alive order
    const results = this._state.enemyAttack();

    const animNext = (step) => {
      if (step >= aliveGnolls.length) {
        if (this._state.isHeroDead()) { this.time.delayedCall(700, () => this._onHeroDefeated()); return; }
        window.dispatchEvent(new CustomEvent('animation-end'));
        return;
      }
      const { i, sprite } = aliveGnolls[step];
      const result = results[step];
      this._animEnemyAttack(sprite, this._enemyBaseXs[i], () => {
        this._handleEnemyHitResult(result, sprite);
        if (this._state.isHeroDead()) { this.time.delayedCall(700, () => this._onHeroDefeated()); return; }
        this.time.delayedCall(350, () => animNext(step + 1));
      });
    };
    animNext(0);
  }

  _handleEnemyHitResult(result, fromSprite) {
    if (result.dodged) {
      this.showMessage('Esquivé !');
      this.floatText(this._hero.x, this._hero.y - 30, 'ESQUIVÉ', '#FFD700', true);
    } else {
      if (result.shieldBroken) {
        this.showMessage('Bouclier brisé !');
        this.floatText(this._hero.x, this._hero.y - 50, 'BOUCLIER BRISÉ !', '#FF4400');
        this._hero.clearTint();
      } else if (result.shieldAbsorbed) {
        this.showMessage(this._state.heroShieldActive ? 'Bouclier actif ! Dégâts réduits.' : 'Bouclier rompu !');
        this._explode(this._hero.x, this._hero.y - 20);
        this._hitSpark(this._hero.x - 30, this._hero.y - 30);
        this.floatText(this._hero.x, this._hero.y - 30, `-${result.damage}`, '#F59E0B');
        if (!this._state.heroShieldActive) this._hero.clearTint();
      } else {
        this._explode(this._hero.x, this._hero.y - 20);
        this._hitSpark(this._hero.x - 30, this._hero.y - 30);
        this._screenFlash();
        this.floatText(this._hero.x, this._hero.y - 30, `-${result.damage}`, '#EF4444');
      }
      if (result.defPierced) this.floatText(this._hero.x + 30, this._hero.y - 10, 'PERCE-DEF', '#AA44FF');
    }
    this._updateHpBars();
  }

  _doEnemyDefend() {
    const name = this._enemyConfig.name;
    this.showMessage(`${name} se protège !`);
    this.time.delayedCall(380, () => {
      const sprite = this._state.isMulti ? this._enemies[0] : this._enemy;
      this._animEnemyDefend(sprite, () => {
        this._state.enemyDefend();
        window.dispatchEvent(new CustomEvent('animation-end'));
      });
    });
  }

  _doWitchCurse() {
    this.showMessage('La Sorcière lance une Malédiction !');
    this.time.delayedCall(380, () => {
      const result = this._state.witchCurse();
      // Purple curse effect on hero
      const glow = this.add.graphics();
      this.tweens.add({
        targets: { v: 0 }, v: 1, duration: 600, yoyo: true,
        onUpdate: (tween) => {
          const a = tween.getValue();
          glow.clear();
          glow.fillStyle(0x6600AA, 0.25 * a);  glow.fillCircle(this._hero.x, this._hero.y, 60 * a + 20);
          glow.lineStyle(2, 0xAA00FF, 0.5 * a); glow.strokeCircle(this._hero.x, this._hero.y, 60 * a + 20);
        },
        onComplete: () => glow.destroy(),
      });
      this._hero.setTint(0xAA00FF);
      this.time.delayedCall(800, () => this._hero.clearTint());
      this.floatText(this._hero.x, this._hero.y - 30, 'MAUDIT !', '#AA00FF', true);
      this.showMessage(`Malédiction ! Attaques du héros à 60% pendant ${result.curseDuration} tours.`);
      window.dispatchEvent(new CustomEvent('animation-end'));
    });
  }

  _doWitchRegen() {
    this.showMessage('La Sorcière se régénère !');
    this.time.delayedCall(380, () => {
      const result = this._state.witchRegen();
      const glow = this.add.graphics();
      this.tweens.add({
        targets: { v: 0 }, v: 1, duration: 600, yoyo: true,
        onUpdate: (tween) => {
          const a = tween.getValue();
          glow.clear();
          glow.fillStyle(0x22C55E, 0.22 * a); glow.fillCircle(this._enemy.x, this._enemy.y, 50 * a + 20);
        },
        onComplete: () => glow.destroy(),
      });
      this.floatText(this._enemy.x, this._enemy.y - 30, `+${result.healed}`, '#22C55E', true);
      this._updateHpBars();
      window.dispatchEvent(new CustomEvent('animation-end'));
    });
  }

  _animEnemyAttack(sprite, baseX, onImpact) {
    const prefix = this._enemyPrefix;
    sprite.play(`${prefix}-walk`);
    this.tweens.add({
      targets: sprite, x: baseX - 90, duration: 180, ease: 'Sine.easeOut',
      onComplete: () => {
        sprite.play(`${prefix}-attack`);
        sprite.once(`animationcomplete-${prefix}-attack`, () => {
          this._hero.setTint(0xff6666);
          this.cameras.main.shake(180, 0.014);
          this.time.delayedCall(80, () => {
            if (this._state.heroShieldActive) this._hero.setTint(0xAA88FF);
            else this._hero.clearTint();
          });
          this.tweens.add({ targets: this._hero, x: this._heroBaseX - 18, duration: 75, yoyo: true, ease: 'Sine.easeOut' });
          onImpact();
          this.time.delayedCall(110, () => {
            sprite.play(`${prefix}-walk`);
            this.tweens.add({ targets: sprite, x: baseX, duration: 160, ease: 'Sine.easeIn', onComplete: () => sprite.play(`${prefix}-idle`) });
          });
        });
      },
    });
  }

  _animEnemyDefend(sprite, onDefend) {
    const prefix = this._enemyPrefix;
    sprite.play(`${prefix}-defend`);
    sprite.once(`animationcomplete-${prefix}-defend`, () => {
      sprite.setTint(0x88AAFF);
      sprite.play(`${prefix}-idle`);
      this._enemyTintActive = true;
      onDefend();
    });
  }

  _checkGnollDeath(targetIdx) {
    if (!this._state.isMulti) return;
    const gnoll  = this._state.enemies[targetIdx];
    if (!gnoll || gnoll.hp > 0) return;
    const sprite = this._enemies[targetIdx];
    if (sprite) this.tweens.add({ targets: sprite, alpha: 0, duration: 400, ease: 'Sine.easeOut' });
    if (this._state.gnollVengeanceActive) {
      const survivorIdx = this._state.enemies.findIndex(e => e.hp > 0);
      const survivor    = survivorIdx >= 0 ? this._enemies[survivorIdx] : null;
      if (survivor) {
        this.time.delayedCall(350, () => {
          this.floatText(survivor.x, this._characterY - 50, 'VENGEANCE !', '#FF6600', true);
          this.showMessage('Vengeance ! Le gnoll survivant gagne +12 ATK !');
          survivor.setTint(0xFF6600);
          this.time.delayedCall(800, () => survivor.clearTint());
        });
      }
    }
  }

  // ─── VICTORY / DEFEAT ────────────────────────────────────────────────────────

  _onEnemyDefeated() {
    const name = this._enemyConfig.name;
    this.showMessage(`${name} vaincu !`);

    this.time.delayedCall(1200, () => {
      const ps  = window.playerState;
      const exp = this._enemyConfig.exp ?? 0;
      const levelResult = ps ? ps.gainExp(exp) : { leveled: false, levels: [] };
      if (exp > 0) this.showMessage(`Vous gagnez ${exp} EXP !`);

      const proceed = () => {
        const nextIdx = this._battleSeqIdx + 1;
        if (nextIdx < this._battleSequence.length) {
          this.scene.start('BattleScene', {
            villageId: this._villageId,
            seqIdx:    nextIdx,
          });
        } else {
          const loot = ps ? this._generateLoot() : null;
          if (loot && ps) ps.addToInventory(loot);
          window.dispatchEvent(new CustomEvent('village-cleared', {
            detail: { villageId: this._villageId, loot },
          }));
        }
      };

      if (levelResult.leveled) {
        this.time.delayedCall(700, () => this._showLevelUp(levelResult.levels, proceed));
      } else {
        this.time.delayedCall(400, proceed);
      }
    });
  }

  _showLevelUp(levels, onDone) {
    if (!levels.length) { onDone(); return; }
    const { level, gains } = levels[0];

    this._screenFlash(0xFFD700, 0.45);
    this.cameras.main.shake(220, 0.016);
    this.floatText(400, 160, `NIVEAU ${level} !`, '#FFD700', true);

    const gainParts = [];
    if (gains.hp)  gainParts.push(`+${gains.hp} HP`);
    if (gains.atk) gainParts.push(`+${gains.atk} ATK`);
    if (gains.def) gainParts.push(`+${gains.def} DEF`);
    if (gains.spd) gainParts.push(`+${gains.spd} SPD`);
    if (gains.lck) gainParts.push(`+${gains.lck} LCK`);

    const gainText = this.add.text(400, 230, gainParts.join('   '), {
      fontSize: '13px', fontFamily: 'Chakra Petch', color: '#FFE680',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15).setAlpha(0);

    this.tweens.add({
      targets: gainText, alpha: 1, y: 215,
      duration: 350, ease: 'Sine.easeOut',
      onComplete: () => {
        this.time.delayedCall(1400, () => {
          this.tweens.add({
            targets: gainText, alpha: 0, duration: 300,
            onComplete: () => {
              gainText.destroy();
              if (levels.length > 1) {
                this._showLevelUp(levels.slice(1), onDone);
              } else {
                onDone();
              }
            },
          });
        });
      },
    });
  }

  _onHeroDefeated() {
    window.dispatchEvent(new CustomEvent('battle-end', {
      detail: { winner: 'enemy', villageId: this._villageId },
    }));
  }

  _generateLoot() {
    return rollLoot(window.playerState?.ownedIds() ?? []);
  }

  shutdown() {
    if (this._actionListener) {
      window.removeEventListener('player-action', this._actionListener);
      this._actionListener = null;
    }
  }
}
