import { createKaelSheet, createSuraSheet, createVaelSheet } from '../assets/wolfSprites.js';
import { WOLVES, POSITION_LABELS } from '../battle/WolfData.js';
import PackState from '../battle/PackState.js';
import { VILLAGES } from '../battle/villages.js';
import { ENEMIES } from '../battle/enemies.js';

// Canvas layout constants
const W  = 800;
const H  = 450;
const UI_H = 114; // HTML overlay height
const BATTLE_H = H - UI_H; // 336px — usable canvas area

// Wolf sprite positions (center x, y in canvas coords)
const WOLF_POS = [
  { x: 90,  y: 88  }, // alpha
  { x: 90,  y: 196 }, // beta
  { x: 90,  y: 304 }, // omega
];
const ENEMY_POS = { x: 650, y: 168 };

const WOLF_ANIM_COLORS = {
  kael: { idle: 0x60A5FA, attack: 0xF43F5E },
  sura: { idle: 0xFBBF24, attack: 0xF43F5E },
  vael: { idle: 0xC4B5FD, attack: 0xF43F5E },
};

const FORMATION_COOLDOWN = 25000; // ms
const WOLF_ORDER = ['kael', 'sura', 'vael'];

export default class WolfBattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WolfBattleScene' });
  }

  init(data) {
    this._villageId  = data.villageId;
    this._seqIdx     = data.seqIdx ?? 0;
    this._formation  = data.formation ?? { alpha: 'kael', beta: 'sura', omega: 'vael' };
    this._pack       = null;
    this._battleOver = false;
    this._activeWolf = null; // wolfId of the wolf currently selected for input
    this._formationCooldown = 0; // ms remaining
    this._floaters   = []; // floating damage/XP texts
    this._levelUpQueue = []; // pending { wolfId, level } to display
  }

  // ── Asset loading ──────────────────────────────────────────────────────────

  preload() {
    if (!this.textures.exists('wolf-kael')) {
      const s = createKaelSheet();
      this.textures.addSpriteSheet('wolf-kael', s.canvas, { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
    }
    if (!this.textures.exists('wolf-sura')) {
      const s = createSuraSheet();
      this.textures.addSpriteSheet('wolf-sura', s.canvas, { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
    }
    if (!this.textures.exists('wolf-vael')) {
      const s = createVaelSheet();
      this.textures.addSpriteSheet('wolf-vael', s.canvas, { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
    }
  }

  create() {
    this._registerAnims();

    const village   = VILLAGES[this._villageId];
    const enemyId   = village?.battles?.[this._seqIdx] ?? 'goblin';
    const enemyCfg  = ENEMIES[enemyId] ?? ENEMIES.goblin;

    this._pack = new PackState(window.wolfState, this._formation, enemyCfg);

    this._drawBackground();
    this._createWolfSprites();
    this._createEnemySprite(enemyCfg);
    this._statusGfx = this.add.graphics();
    this._msgText   = this._createMsg();
    this._createFloaterContainer();
    this._createStatusTexts();

    this._showMessage(`${enemyCfg.name} apparaît !`);
    this._setupInput();
    this._syncUI();

    // Show wolf UI overlay
    document.getElementById('wolf-ui-overlay').style.display = 'flex';
    document.getElementById('ui-overlay').style.display = 'none';
  }

  // ── Animations ─────────────────────────────────────────────────────────────

  _registerAnims() {
    const defs = [
      { key: 'wolf-kael-idle',   texture: 'wolf-kael', frames: [0, 1], rate: 1.5, repeat: -1 },
      { key: 'wolf-kael-attack', texture: 'wolf-kael', frames: [2, 3], rate: 8,   repeat: 0  },
      { key: 'wolf-kael-defend', texture: 'wolf-kael', frames: [4],    rate: 1,   repeat: -1 },
      { key: 'wolf-sura-idle',   texture: 'wolf-sura', frames: [0, 1], rate: 2,   repeat: -1 },
      { key: 'wolf-sura-attack', texture: 'wolf-sura', frames: [2, 3], rate: 10,  repeat: 0  },
      { key: 'wolf-sura-defend', texture: 'wolf-sura', frames: [4],    rate: 1,   repeat: -1 },
      { key: 'wolf-vael-idle',   texture: 'wolf-vael', frames: [0, 1], rate: 1.8, repeat: -1 },
      { key: 'wolf-vael-attack', texture: 'wolf-vael', frames: [2, 3], rate: 9,   repeat: 0  },
      { key: 'wolf-vael-defend', texture: 'wolf-vael', frames: [4],    rate: 1,   repeat: -1 },
    ];
    for (const d of defs) {
      if (!this.anims.exists(d.key)) {
        this.anims.create({
          key:       d.key,
          frames:    d.frames.map(f => ({ key: d.texture, frame: f })),
          frameRate: d.rate,
          repeat:    d.repeat,
        });
      }
    }
  }

  // ── Scene objects ──────────────────────────────────────────────────────────

  _drawBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x06000f, 0x06000f, 0x0d1a3a, 0x0d1a3a, 1);
    g.fillRect(0, 0, W, BATTLE_H);

    // Snow ground
    g.fillStyle(0xC8DCF0, 0.12);
    g.fillRect(0, BATTLE_H - 40, W, 40);
    g.fillStyle(0xD8E8F8, 0.08);
    g.fillRect(0, BATTLE_H - 55, W, 18);

    // Separator line: combat area vs HTML overlay
    g.lineStyle(2, 0x7C3AED, 0.5);
    g.lineBetween(0, BATTLE_H, W, BATTLE_H);

    // Left panel background (wolf side)
    g.fillStyle(0x06000f, 0.4);
    g.fillRect(0, 0, 180, BATTLE_H);
    g.lineStyle(1, 0x7C3AED, 0.2);
    g.lineBetween(180, 0, 180, BATTLE_H);

    // Snow particles
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * W;
      const y = Math.random() * BATTLE_H;
      const r = Math.random() * 1.5 + 0.3;
      g.fillStyle(0xFFFFFF, Math.random() * 0.25 + 0.05);
      g.fillCircle(x, y, r);
    }
  }

  _createWolfSprites() {
    this._wolfSprites = {};
    this._wolfLabels  = {};

    const posKeys = ['alpha', 'beta', 'omega'];
    posKeys.forEach((pos, i) => {
      const wolfId = this._formation[pos];
      const p      = WOLF_POS[i];

      const spr = this.add.sprite(p.x, p.y, `wolf-${wolfId}`);
      spr.play(`wolf-${wolfId}-idle`);
      spr.setScale(1.1);

      // Position label above sprite
      this.add.text(p.x, p.y - 50, POSITION_LABELS[pos].toUpperCase(), {
        fontFamily: "'Chakra Petch', monospace",
        fontSize: '8px', color: '#475569', letterSpacing: 2,
      }).setOrigin(0.5, 1);

      // Wolf name
      const nameLabel = this.add.text(p.x, p.y - 42, WOLVES[wolfId].name, {
        fontFamily: "'Russo One', sans-serif",
        fontSize: '10px', color: '#E2E8F0', letterSpacing: 1,
      }).setOrigin(0.5, 1);

      this._wolfSprites[wolfId] = spr;
      this._wolfLabels[wolfId]  = nameLabel;
    });
  }

  _createEnemySprite(cfg) {
    // Enemy is a colored rectangle placeholder (will be improved with enemy sprites)
    const g = this.add.graphics();
    g.fillStyle(0x2a1020, 0.9);
    g.fillRect(ENEMY_POS.x - 45, ENEMY_POS.y - 55, 90, 110);
    g.lineStyle(2, 0xF43F5E, 0.7);
    g.strokeRect(ENEMY_POS.x - 45, ENEMY_POS.y - 55, 90, 110);

    this._enemyGfx = g;
    this._enemyNameText = this.add.text(ENEMY_POS.x, ENEMY_POS.y - 70, cfg.name, {
      fontFamily: "'Russo One', sans-serif",
      fontSize: '11px', color: '#F87171', letterSpacing: 2,
    }).setOrigin(0.5, 1);
  }

  _createMsg() {
    return this.add.text(W / 2, BATTLE_H - 18, '', {
      fontFamily: "'Chakra Petch', monospace",
      fontSize: '12px', color: '#E2E8F0', letterSpacing: 2,
    }).setOrigin(0.5, 1);
  }

  _createFloaterContainer() {
    this._floaterGroup = this.add.group();
  }

  // Pre-create HP text objects (updated each frame, never recreated)
  _createStatusTexts() {
    this._hpTexts = {};
    this._eHpText = null;

    const posKeys = ['alpha', 'beta', 'omega'];
    posKeys.forEach((pos, i) => {
      const wolfId = this._formation[pos];
      const p      = WOLF_POS[i];
      this._hpTexts[wolfId] = this.add.text(p.x, p.y - 56, '', {
        fontFamily: 'monospace', fontSize: '7px', color: '#94A3B8',
      }).setOrigin(0.5, 1).setDepth(5);
    });

    this._eHpText = this.add.text(ENEMY_POS.x, ENEMY_POS.y - 64, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#F87171',
    }).setOrigin(0.5, 1).setDepth(5);
  }

  // ── Main loop ──────────────────────────────────────────────────────────────

  update(time, delta) {
    if (this._battleOver) return;

    // Formation cooldown
    if (this._formationCooldown > 0) {
      this._formationCooldown = Math.max(0, this._formationCooldown - delta);
      this._updateFormationBtn();
    }

    // Tick ATB
    const { readyWolves, readyEnemies } = this._pack.tickATB(delta);

    // Enemy acts immediately when ready
    for (const eid of readyEnemies) {
      this._resolveEnemyAction(eid);
      if (this._battleOver) return;
    }

    // Auto-select first ready wolf if none active or active no longer ready
    const activeReady = this._activeWolf
      && this._pack.wolves[this._activeWolf]?.alive
      && this._pack.wolves[this._activeWolf]?.atb >= 100;
    if (!activeReady) {
      const ready = this._pack.getReadyWolves();
      if (ready.length > 0) this._setActiveWolf(ready[0]);
      else if (this._activeWolf) this._setActiveWolf(null);
    }

    // Update status bars and floaters
    this._drawStatus();
    this._tickFloaters(delta);
  }

  // ── ATB / Status drawing ───────────────────────────────────────────────────

  _drawStatus() {
    const g = this._statusGfx;
    g.clear();

    const posKeys  = ['alpha', 'beta', 'omega'];
    posKeys.forEach((pos, i) => {
      const wolfId = this._formation[pos];
      const wolf   = this._pack.wolves[wolfId];
      const p      = WOLF_POS[i];
      const barX   = p.x - 38;
      const barW   = 76;

      // HP bar
      const hpY = p.y - 54;
      g.fillStyle(0x111827, 1);
      g.fillRect(barX, hpY, barW, 6);
      const hpRatio = Math.max(0, wolf.hp / wolf.maxHp);
      const hpColor = hpRatio > 0.5 ? 0x22C55E : hpRatio > 0.25 ? 0xFBBF24 : 0xF43F5E;
      g.fillStyle(hpColor, 1);
      g.fillRect(barX, hpY, Math.round(barW * hpRatio), 6);

      // HP numbers (pre-created text object)
      this._hpTexts[wolfId]?.setText(`${wolf.hp}/${wolf.maxHp}`);

      // ATB bar
      const atbY = p.y - 46;
      g.fillStyle(0x0f172a, 1);
      g.fillRect(barX, atbY, barW, 4);
      const atbColor = wolf.atb >= 100 ? 0xA78BFA : 0x7C3AED;
      g.fillStyle(atbColor, wolf.atb >= 100 ? 1 : 0.7);
      g.fillRect(barX, atbY, Math.round(barW * wolf.atb / 100), 4);

      // ATB full pulse
      if (wolf.atb >= 100) {
        g.lineStyle(1, 0xA78BFA, 0.6);
        g.strokeRect(barX, atbY, barW, 4);
      }

      // Active wolf highlight
      if (wolfId === this._activeWolf && wolf.atb >= 100) {
        g.lineStyle(2, 0xA78BFA, 0.8);
        g.strokeRect(p.x - 42, p.y - 44, 84, 92);
      }

      // Dead wolf overlay
      if (!wolf.alive) {
        g.fillStyle(0x000000, 0.6);
        g.fillRect(p.x - 42, p.y - 44, 84, 92);
      }
    });

    // Enemy HP bar
    const enemy   = this._pack.enemies[0];
    const eBarX   = ENEMY_POS.x - 50;
    const eBarW   = 100;
    const eHpY    = ENEMY_POS.y - 62;
    g.fillStyle(0x111827, 1);
    g.fillRect(eBarX, eHpY, eBarW, 7);
    const eRatio = Math.max(0, enemy.hp / enemy.maxHp);
    g.fillStyle(0xF43F5E, 1);
    g.fillRect(eBarX, eHpY, Math.round(eBarW * eRatio), 7);

    // Enemy ATB bar
    const eAtbY = eHpY + 9;
    g.fillStyle(0x0f172a, 1);
    g.fillRect(eBarX, eAtbY, eBarW, 4);
    g.fillStyle(0xF97316, 0.8);
    g.fillRect(eBarX, eAtbY, Math.round(eBarW * enemy.atb / 100), 4);

    // HP text for enemy (pre-created)
    this._eHpText?.setText(`${enemy.hp}/${enemy.maxHp}`);
  }

  // ── Enemy resolution ───────────────────────────────────────────────────────

  _resolveEnemyAction(eid) {
    const result = this._pack.enemyAct(eid);
    if (!result) return;

    const { targetId, damage, wolfDied } = result;
    const wolf = this._pack.wolves[targetId];

    // Flash the wolf sprite red
    const spr = this._wolfSprites[targetId];
    if (spr) {
      this.tweens.add({
        targets: spr, alpha: 0.3, duration: 80, yoyo: true, repeat: 2,
        onComplete: () => spr.setAlpha(wolfDied ? 0.35 : 1),
      });
    }

    this._spawnFloater(
      WOLF_POS[this._getPositionIndex(targetId)].x,
      WOLF_POS[this._getPositionIndex(targetId)].y - 30,
      `-${damage}`, '#F43F5E'
    );

    const eName = this._pack.enemies[eid].name;
    this._showMessage(`${eName} attaque ${WOLVES[targetId].name} — ${damage} dégâts !${wolfDied ? ' ☠' : ''}`);

    if (wolfDied && spr) {
      spr.play(`wolf-${targetId}-defend`);
      spr.setAlpha(0.3);
    }

    if (this._pack.isPackDead()) {
      this._endBattle('enemy');
    }
    this._syncUI();
  }

  // ── Wolf action resolution ─────────────────────────────────────────────────

  _handleAttack() {
    if (!this._activeWolf) return;
    const wolf = this._pack.wolves[this._activeWolf];
    if (!wolf.alive || wolf.atb < 100) return;

    const spr = this._wolfSprites[this._activeWolf];
    if (spr) {
      spr.play(`wolf-${this._activeWolf}-attack`);
      spr.once('animationcomplete', () => {
        if (wolf.alive) spr.play(`wolf-${this._activeWolf}-idle`);
      });
    }

    const result = this._pack.wolfAttack(this._activeWolf, 0);
    if (!result) return;

    const { damage, crit, died, xpResult } = result;

    // Shake enemy
    if (this._enemyGfx) {
      this.tweens.add({
        targets: this._enemyGfx, x: 4, duration: 40,
        yoyo: true, repeat: 3, onComplete: () => this._enemyGfx.setX(0),
      });
    }

    this._spawnFloater(ENEMY_POS.x, ENEMY_POS.y - 60, `${crit ? '★' : ''}-${damage}`,
      crit ? '#FBBF24' : '#FFFFFF');

    const wName = WOLVES[this._activeWolf].name;
    this._showMessage(`${wName} attaque — ${damage} dégâts !${crit ? ' CRITIQUE !' : ''}`);

    if (died) {
      this._onEnemyDied(xpResult);
    }

    this._setActiveWolf(null);
    this._syncUI();
  }

  _handleDefend() {
    if (!this._activeWolf) return;
    const wolf = this._pack.wolves[this._activeWolf];
    if (!wolf.alive || wolf.atb < 100) return;

    this._pack.wolfDefend(this._activeWolf);

    const spr = this._wolfSprites[this._activeWolf];
    if (spr) spr.play(`wolf-${this._activeWolf}-defend`);

    const wName = WOLVES[this._activeWolf].name;
    this._showMessage(`${wName} se défend — dégâts réduits de 50% !`);

    this._setActiveWolf(null);
    this._syncUI();

    // Return to idle after 600ms
    this.time.delayedCall(600, () => {
      if (wolf.alive) spr?.play(`wolf-${this._activeWolf}-idle`);
    });
  }

  _handleTab() {
    const ready  = this._pack.getReadyWolves();
    if (ready.length < 2) return;
    const cur    = ready.indexOf(this._activeWolf);
    const next   = ready[(cur + 1) % ready.length];
    this._setActiveWolf(next);
  }

  // ── Enemy death & XP ──────────────────────────────────────────────────────

  _onEnemyDied(xpResult) {
    // Hide enemy
    this._enemyGfx.setVisible(false);
    this._enemyNameText.setVisible(false);

    this._showMessage('Ennemi vaincu !');

    if (!xpResult) {
      this._checkBattleEnd();
      return;
    }

    // Distribute XP
    const posKeys = ['alpha', 'beta', 'omega'];
    for (const [id, xp] of Object.entries(xpResult.xpGains)) {
      const wolfIdx = posKeys.findIndex(pos => this._formation[pos] === id);
      const py      = wolfIdx >= 0 ? WOLF_POS[wolfIdx].y : 80;

      this._spawnFloater(WOLF_POS[wolfIdx >= 0 ? wolfIdx : 0].x, py - 60, `+${xp} XP`, '#A78BFA');

      const levelResult = window.wolfState.gainExp(id, xp);

      if (levelResult.leveled) {
        for (const lvl of levelResult.levels) {
          // HP was already restored inside gainExp
          this._pack.wolves[id].maxHp = window.wolfState.wolves[id].baseStats.hp;
          this._pack.wolves[id].hp    = this._pack.wolves[id].maxHp;

          // Kill bonus gauge charge
          if (id === xpResult.killWolf) {
            this._pack.applyKillGaugeBonus(id);
          }

          this._spawnFloater(
            WOLF_POS[wolfIdx >= 0 ? wolfIdx : 0].x,
            py - 90,
            `⬆ Niv. ${lvl.level} !`, '#22C55E'
          );

          this._showMessage(`${WOLVES[id].name} passe au niveau ${lvl.level} ! PV restaurés !`);
        }
      }
    }

    this.time.delayedCall(800, () => this._checkBattleEnd());
  }

  _checkBattleEnd() {
    if (this._pack.isAllEnemiesDead()) {
      this._advanceBattle();
    }
  }

  _advanceBattle() {
    const village = VILLAGES[this._villageId];
    const nextSeq = this._seqIdx + 1;

    // Persist wolf HP with recovery
    for (const id of WOLF_ORDER) {
      const w = this._pack.wolves[id];
      window.wolfState.persistCombatHp(id, w.hp, w.maxHp);
    }
    window.wolfState.save();

    if (village?.battles && nextSeq < village.battles.length) {
      // Next fight in the same village
      this.time.delayedCall(1200, () => {
        document.getElementById('wolf-ui-overlay').style.display = 'none';
        this.scene.start('FormationScene', {
          villageId: this._villageId,
          seqIdx:    nextSeq,
        });
      });
    } else {
      this._endBattle('pack');
    }
  }

  _endBattle(winner) {
    if (this._battleOver) return;
    this._battleOver = true;
    document.getElementById('wolf-ui-overlay').style.display = 'none';

    if (winner === 'pack') {
      window.wolfState.clearVillage(this._villageId);
      window.dispatchEvent(new CustomEvent('village-cleared', {
        detail: { villageId: this._villageId, loot: null },
      }));
    } else {
      this._showMessage('La meute est tombée...');
      this.time.delayedCall(1500, () => {
        window.dispatchEvent(new CustomEvent('battle-end', {
          detail: { winner: 'enemy', allCleared: false },
        }));
      });
    }
  }

  // ── Formation in-combat ────────────────────────────────────────────────────

  _openFormationSwap() {
    if (this._formationCooldown > 0) return;
    this._formationCooldown = FORMATION_COOLDOWN;

    // Show inline formation panel (re-use FormationScene layout via overlay)
    document.getElementById('wolf-ui-overlay').style.display = 'none';
    this.scene.launch('FormationScene', {
      villageId: this._villageId,
      seqIdx:    this._seqIdx,
      formation: { ...this._formation },
    });
  }

  // ── Input ──────────────────────────────────────────────────────────────────

  _setupInput() {
    const el = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
    el('btn-wolf-attack',    () => this._handleAttack());
    el('btn-wolf-defend',    () => this._handleDefend());
    el('btn-wolf-tab',       () => this._handleTab());
    el('btn-wolf-formation', () => this._openFormationSwap());

    // Tab key
    this.input.keyboard?.on('keydown-TAB', (e) => { e.preventDefault(); this._handleTab(); });
  }

  // ── UI sync ────────────────────────────────────────────────────────────────

  _setActiveWolf(wolfId) {
    this._activeWolf = wolfId;
    this._syncUI();
  }

  _syncUI() {
    const ready = this._pack.getReadyWolves();
    const active = this._activeWolf && this._pack.wolves[this._activeWolf]?.alive
      && this._pack.wolves[this._activeWolf]?.atb >= 100
      ? this._activeWolf
      : (ready[0] ?? null);

    this._activeWolf = active;

    // Active wolf label
    const nameEl = document.getElementById('wolf-active-name');
    if (nameEl) {
      if (active) {
        const pos = this._pack.getPosition(active);
        nameEl.textContent = `⟶  ${WOLVES[active].name.toUpperCase()}  —  ${POSITION_LABELS[pos]?.toUpperCase() ?? ''}`;
        nameEl.style.color = active === 'kael' ? '#BAE6FD' : active === 'sura' ? '#FDE68A' : '#DDD6FE';
      } else {
        nameEl.textContent = '…';
        nameEl.style.color = '#4B5563';
      }
    }

    const canAct = !!active;
    this._setBtn('btn-wolf-attack', canAct);
    this._setBtn('btn-wolf-defend', canAct);
    this._setBtn('btn-wolf-tab',    ready.length > 1);
    this._updateFormationBtn();

    // Tab count badge
    const tabEl = document.getElementById('btn-wolf-tab');
    if (tabEl && ready.length > 1) tabEl.textContent = `⇄ Tab (${ready.length} prêts)`;
    else if (tabEl) tabEl.textContent = '⇄ Tab';
  }

  _setBtn(id, enabled) {
    const el = document.getElementById(id);
    if (el) el.disabled = !enabled;
  }

  _updateFormationBtn() {
    const el = document.getElementById('btn-wolf-formation');
    if (!el) return;
    if (this._formationCooldown > 0) {
      const secs = Math.ceil(this._formationCooldown / 1000);
      el.textContent = `⟲ Formation (${secs}s)`;
      el.disabled = true;
    } else {
      el.textContent = '⟲ Formation';
      el.disabled = false;
    }
  }

  // ── Floaters ───────────────────────────────────────────────────────────────

  _spawnFloater(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontFamily: "'Russo One', sans-serif",
      fontSize:   '14px',
      color,
      stroke:     '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(20);

    this.tweens.add({
      targets:  t,
      y:        y - 36,
      alpha:    0,
      duration: 1200,
      ease:     'Quad.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  _tickFloaters() {
    // Handled by tweens
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _showMessage(text) {
    this._msgText.setText(text);
  }

  _getPositionIndex(wolfId) {
    const posKeys = ['alpha', 'beta', 'omega'];
    return posKeys.findIndex(pos => this._formation[pos] === wolfId);
  }

  // Cleanup HTML UI on scene shutdown
  shutdown() {
    document.getElementById('wolf-ui-overlay').style.display = 'none';
    this.input.keyboard?.off('keydown-TAB');
  }
}
