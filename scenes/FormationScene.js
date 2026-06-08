import { WOLVES, POSITION_LABELS } from '../battle/WolfData.js';

const POSITIONS = ['alpha', 'beta', 'omega'];
const WOLF_IDS  = ['kael', 'sura', 'vael'];

const C = {
  bg:      0x06000f,
  panel:   0x0e0825,
  border:  0x7C3AED,
  text:    0xE2E8F0,
  muted:   0x94A3B8,
  gold:    0xFFB800,
  accent:  0xF43F5E,
  green:   0x22C55E,
  kael:    0xBAE6FD, // ice blue
  sura:    0xFBBF24, // amber
  vael:    0xC4B5FD, // violet
};

const WOLF_COLORS = { kael: C.kael, sura: C.sura, vael: C.vael };

export default class FormationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FormationScene' });
    this._villageId  = null;
    this._seqIdx     = 0;
    this._formation  = { alpha: 'kael', beta: 'sura', omega: 'vael' };
    this._rows       = {};
    this._gfx        = null;
  }

  init(data) {
    this._villageId = data.villageId;
    this._seqIdx    = data.seqIdx ?? 0;
    // Start from saved formation
    const saved = window.wolfState?.lastFormation;
    if (saved) this._formation = { ...saved };
  }

  create() {
    this._drawBackground();
    this._drawTitle();
    this._gfx = this.add.graphics();
    this._buildRows();
    this._drawRows();
    this._buildFightButton();
    this._buildHints();
  }

  // ── Background ─────────────────────────────────────────────────────────────

  _drawBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x06000f, 0x06000f, 0x0e0428, 0x0e0428, 1);
    g.fillRect(0, 0, 800, 450);

    // Snow particles
    const snowGfx = this.add.graphics();
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 450;
      const r = Math.random() * 1.5 + 0.5;
      snowGfx.fillStyle(0xFFFFFF, Math.random() * 0.4 + 0.1);
      snowGfx.fillCircle(x, y, r);
    }

    // Top border line
    g.lineStyle(2, C.border, 0.8);
    g.strokeRect(1, 1, 798, 448);
  }

  _drawTitle() {
    this.add.text(400, 22, 'FORMATION DE MEUTE', {
      fontFamily: "'Russo One', sans-serif",
      fontSize:   '18px',
      color:      '#A78BFA',
      letterSpacing: 6,
    }).setOrigin(0.5, 0.5);

    this.add.text(400, 44, 'Assignez chaque loup à une position avant le combat', {
      fontFamily: "'Chakra Petch', monospace",
      fontSize:   '11px',
      color:      '#64748B',
      letterSpacing: 2,
    }).setOrigin(0.5, 0.5);

    // Separator
    const g = this.add.graphics();
    g.lineStyle(1, C.border, 0.4);
    g.lineBetween(40, 56, 760, 56);
  }

  // ── Rows ───────────────────────────────────────────────────────────────────

  _buildRows() {
    // Row Y positions for each position
    const rowY = { alpha: 120, beta: 220, omega: 320 };

    for (const pos of POSITIONS) {
      const y = rowY[pos];

      // Position label
      const posLabel = this.add.text(60, y, POSITION_LABELS[pos].toUpperCase(), {
        fontFamily: "'Russo One', sans-serif",
        fontSize:   '15px',
        color:      '#7C3AED',
        letterSpacing: 4,
      }).setOrigin(0.5, 0.5);

      // Role description
      const roleText = { alpha: '1er tour — Commande', beta: '2e tour — Attaque', omega: '3e tour — Support' };
      this.add.text(60, y + 18, roleText[pos], {
        fontFamily: "'Chakra Petch', monospace",
        fontSize:   '9px',
        color:      '#475569',
        letterSpacing: 1,
      }).setOrigin(0.5, 0.5);

      // Left arrow button
      const btnLeft = this.add.text(190, y, '◀', {
        fontFamily: 'monospace', fontSize: '20px', color: '#7C3AED',
      }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

      // Wolf name label
      const wolfName = this.add.text(290, y, '', {
        fontFamily: "'Russo One', sans-serif",
        fontSize:   '16px',
        color:      '#E2E8F0',
        letterSpacing: 2,
      }).setOrigin(0.5, 0.5);

      // Right arrow button
      const btnRight = this.add.text(390, y, '▶', {
        fontFamily: 'monospace', fontSize: '20px', color: '#7C3AED',
      }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

      // Wolf stats text
      const statsText = this.add.text(500, y, '', {
        fontFamily: "'Chakra Petch', monospace",
        fontSize:   '10px',
        color:      '#94A3B8',
        letterSpacing: 1,
      }).setOrigin(0, 0.5);

      // Natural position indicator
      const natLabel = this.add.text(680, y, '', {
        fontFamily: "'Chakra Petch', monospace",
        fontSize:   '10px',
        color:      '#22C55E',
        letterSpacing: 1,
      }).setOrigin(0.5, 0.5);

      btnLeft.on('pointerover',  () => btnLeft.setStyle({ color: '#A78BFA' }));
      btnLeft.on('pointerout',   () => btnLeft.setStyle({ color: '#7C3AED' }));
      btnLeft.on('pointerdown',  () => { this._cycleWolf(pos, -1); this._drawRows(); });

      btnRight.on('pointerover', () => btnRight.setStyle({ color: '#A78BFA' }));
      btnRight.on('pointerout',  () => btnRight.setStyle({ color: '#7C3AED' }));
      btnRight.on('pointerdown', () => { this._cycleWolf(pos, +1); this._drawRows(); });

      this._rows[pos] = { wolfName, statsText, natLabel, posLabel, y };
    }
  }

  _drawRows() {
    this._gfx.clear();
    const rowY = { alpha: 120, beta: 220, omega: 320 };

    for (const pos of POSITIONS) {
      const wolfId = this._formation[pos];
      const wolf   = WOLVES[wolfId];
      const row    = this._rows[pos];
      const y      = rowY[pos];
      const col    = WOLF_COLORS[wolfId];
      const colHex = '#' + col.toString(16).padStart(6, '0');

      // Row background
      this._gfx.lineStyle(1.5, col, 0.6);
      this._gfx.strokeRoundedRect(130, y - 30, 590, 56, 6);
      this._gfx.fillStyle(col, 0.06);
      this._gfx.fillRoundedRect(130, y - 30, 590, 56, 6);

      // Wolf name
      row.wolfName.setText(wolf.name).setStyle({ color: colHex });

      // Stats
      const s = wolf.baseStats;
      row.statsText.setText(
        `HP ${s.hp}  ATK ${s.atk}  DEF ${s.def}  SPD ${s.spd}  LCK ${s.lck}`
      );

      // Natural position
      const isNat = wolf.naturalPos === pos;
      row.natLabel.setText(isNat ? '★ Position naturelle' : '').setStyle({
        color: isNat ? '#22C55E' : '#94A3B8',
      });

      // SPD bar (visualize ATB fill speed)
      const barX  = 500;
      const barW  = 130;
      const barY  = y + 12;
      this._gfx.fillStyle(0x1a1a2e, 1);
      this._gfx.fillRect(barX, barY, barW, 5);
      this._gfx.fillStyle(col, 0.9);
      this._gfx.fillRect(barX, barY, Math.round(barW * s.spd / 15), 5);
      this.add.text(barX, barY - 10, 'ATB', {
        fontFamily: "'Chakra Petch', monospace",
        fontSize: '7px', color: '#475569',
      });
    }

    // Duplicate warning
    const wolves = Object.values(this._formation);
    const hasDupe = wolves.length !== new Set(wolves).size;
    if (hasDupe) {
      this._gfx.fillStyle(C.accent, 0.15);
      this._gfx.fillRoundedRect(200, 385, 400, 28, 4);
      this._gfx.lineStyle(1, C.accent, 0.7);
      this._gfx.strokeRoundedRect(200, 385, 400, 28, 4);
      if (!this._dupeWarning) {
        this._dupeWarning = this.add.text(400, 399, 'Chaque loup doit occuper une position différente', {
          fontFamily: "'Chakra Petch', monospace",
          fontSize: '10px', color: '#F43F5E', letterSpacing: 1,
        }).setOrigin(0.5, 0.5);
      }
      this._dupeWarning.setVisible(true);
    } else {
      this._dupeWarning?.setVisible(false);
    }
  }

  _cycleWolf(pos, dir) {
    const current = this._formation[pos];
    const idx     = WOLF_IDS.indexOf(current);
    let next      = WOLF_IDS[(idx + dir + WOLF_IDS.length) % WOLF_IDS.length];

    // Prevent duplicates: keep cycling until no duplicate
    let tries = 0;
    while (tries < 3) {
      const others = POSITIONS.filter(p => p !== pos).map(p => this._formation[p]);
      if (!others.includes(next)) break;
      next = WOLF_IDS[(WOLF_IDS.indexOf(next) + dir + WOLF_IDS.length) % WOLF_IDS.length];
      tries++;
    }
    this._formation[pos] = next;
  }

  // ── Fight button ───────────────────────────────────────────────────────────

  _buildFightButton() {
    const g = this.add.graphics();

    const btnX = 310, btnY = 410, btnW = 180, btnH = 38;

    const drawBtn = (hover) => {
      g.clear();
      g.fillStyle(hover ? 0x8B5CF6 : 0x7C3AED, 1);
      g.fillRoundedRect(btnX, btnY, btnW, btnH, 4);
      g.lineStyle(1.5, hover ? 0xA78BFA : 0x7C3AED, 1);
      g.strokeRoundedRect(btnX, btnY, btnW, btnH, 4);
    };

    drawBtn(false);

    const label = this.add.text(btnX + btnW / 2, btnY + btnH / 2, 'COMBATTRE', {
      fontFamily: "'Russo One', sans-serif",
      fontSize:   '15px',
      color:      '#FFFFFF',
      letterSpacing: 3,
    }).setOrigin(0.5, 0.5);

    const zone = this.add.zone(btnX, btnY, btnW, btnH).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    zone.on('pointerover',  () => { drawBtn(true);  label.setStyle({ color: '#FFFFFF' }); });
    zone.on('pointerout',   () => { drawBtn(false); label.setStyle({ color: '#FFFFFF' }); });
    zone.on('pointerdown',  () => this._startBattle());
  }

  _buildHints() {
    // Bottom hint
    this.add.text(400, 448, 'Les loups en position naturelle remplissent leur ATB 20% plus vite', {
      fontFamily: "'Chakra Petch', monospace",
      fontSize:   '9px', color: '#374151', letterSpacing: 1,
    }).setOrigin(0.5, 1);
  }

  _startBattle() {
    const wolves = Object.values(this._formation);
    if (wolves.length !== new Set(wolves).size) return; // duplicates

    if (window.wolfState) {
      window.wolfState.lastFormation = { ...this._formation };
      window.wolfState.save();
    }

    this.scene.start('WolfBattleScene', {
      villageId:  this._villageId,
      seqIdx:     this._seqIdx,
      formation:  { ...this._formation },
    });
  }
}
