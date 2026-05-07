import { VILLAGES, MAP_START } from '../battle/villages.js';
import { ENEMIES } from '../battle/enemies.js';
import { ITEMS } from '../battle/items.js';
import { createHeroIdleSheet } from '../assets/sprites.js';
import MenuUI from '../ui/MenuUI.js';

const NODE_R = 20;
const DIFF_STARS = [
  '★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★',
  '★★★★★', '★★★★★', '★★★★★', '★★★★★', '★★★★★',
];

export default class WorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldMapScene' });
    this._menuUI    = null;
    this._heroSpr   = null;
    this._pathGfx   = null;
    this._nodeGfx   = null;
    this._nodeZones = {};
    this._animating = false;
  }

  preload() {
    const sheet = createHeroIdleSheet();
    if (!this.textures.exists('hero-idle')) {
      this.textures.addSpriteSheet('hero-idle', sheet.canvas, {
        frameWidth: sheet.frameWidth, frameHeight: sheet.frameHeight,
      });
    }
  }

  create(data = {}) {
    const ps = window.playerState;

    if (data.clearedVillage) ps.clearVillage(data.clearedVillage);

    this._drawBackground();
    this._pathGfx = this.add.graphics();
    this._nodeGfx = this.add.graphics();
    this._drawPaths();
    this._drawNodes();
    this._createHero();
    this._setupUI();

    if (data.loot) {
      this._showLoot(data.loot, () => {
        if (data.clearedVillage) this._openVillagePanel(data.clearedVillage);
      });
    } else if (data.clearedVillage) {
      this.time.delayedCall(300, () => this._openVillagePanel(data.clearedVillage));
    }

    window.dispatchEvent(new CustomEvent('animation-end'));
  }

  // ── Background ─────────────────────────────────────────────────────────────

  _drawBackground() {
    const g = this.add.graphics();
    const W = 800, H = 450;

    g.fillGradientStyle(0x05100a, 0x05100a, 0x080818, 0x080818, 1);
    g.fillRect(0, 0, W, H);

    const bands = [
      { x: 0,   w: 230, color: 0x0d2a0d, alpha: 0.55 },
      { x: 230, w: 100, color: 0x0a1a3a, alpha: 0.55 },
      { x: 330, w: 210, color: 0x2a1a0a, alpha: 0.45 },
      { x: 540, w: 110, color: 0x1a2a3a, alpha: 0.55 },
      { x: 650, w: 150, color: 0x1a0a2a, alpha: 0.65 },
    ];
    for (const b of bands) {
      g.fillStyle(b.color, b.alpha);
      g.fillRect(b.x, 0, b.w, H);
    }

    g.lineStyle(1, 0x3a3a5a, 0.25);
    g.strokeRect(0, 0, W, H);

    g.lineStyle(1, 0xffffff, 0.04);
    for (const bx of [230, 330, 540, 650]) {
      g.beginPath(); g.moveTo(bx, 0); g.lineTo(bx, H); g.strokePath();
    }
  }

  // ── Paths ──────────────────────────────────────────────────────────────────

  _drawPaths() {
    const ps = window.playerState;
    const g  = this._pathGfx;
    g.clear();

    const drawn = new Set();
    for (const [id, v] of Object.entries(VILLAGES)) {
      for (const nid of v.connections) {
        const key = [id, nid].sort().join('|');
        if (drawn.has(key)) continue;
        drawn.add(key);
        const nv      = VILLAGES[nid];
        const unlocked = ps.isVillageUnlocked(id) && ps.isVillageUnlocked(nid);
        g.lineStyle(2.5, unlocked ? 0x4a8aff : 0x2a2a4a, unlocked ? 0.5 : 0.3);
        if (!unlocked) {
          this._drawDashedLine(g, v.pos.x, v.pos.y, nv.pos.x, nv.pos.y, 6, 5);
        } else {
          g.beginPath();
          g.moveTo(v.pos.x, v.pos.y);
          g.lineTo(nv.pos.x, nv.pos.y);
          g.strokePath();
        }
      }
    }
  }

  _drawDashedLine(g, x1, y1, x2, y2, dashLen, gapLen) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len, ny = dy / len;
    let pos = 0;
    let drawing = true;
    while (pos < len) {
      const segLen = Math.min(drawing ? dashLen : gapLen, len - pos);
      if (drawing) {
        g.beginPath();
        g.moveTo(x1 + nx * pos, y1 + ny * pos);
        g.lineTo(x1 + nx * (pos + segLen), y1 + ny * (pos + segLen));
        g.strokePath();
      }
      pos += segLen;
      drawing = !drawing;
    }
  }

  // ── Nodes ──────────────────────────────────────────────────────────────────

  _drawNodes() {
    const ps = window.playerState;
    const g  = this._nodeGfx;
    g.clear();

    Object.values(this._nodeZones).forEach(z => z.destroy());
    this._nodeZones = {};

    for (const [id, v] of Object.entries(VILLAGES)) {
      const { x, y }  = v.pos;
      const unlocked  = ps.isVillageUnlocked(id);
      const cleared   = ps.clearedVillages.has(id);
      const isCurrent = ps.currentVillage === id;
      const alpha     = unlocked ? 1 : 0.4;

      let fill   = unlocked ? 0x0d2e5a : 0x111122;
      let stroke = unlocked ? 0x4a8aff : 0x2a2a3a;
      if (isCurrent) { fill = 0x2a0d6a; stroke = 0xa064ff; }

      g.fillStyle(fill, alpha);
      g.fillCircle(x, y, NODE_R);
      g.lineStyle(2, stroke, alpha);
      g.strokeCircle(x, y, NODE_R);

      if (cleared) {
        g.lineStyle(2, 0x22C55E, 0.7);
        g.strokeCircle(x, y, NODE_R + 4);
      }

      const existing = this.children.list.filter(c =>
        c.type === 'Text' && c.getData('nodeId') === id
      );
      if (existing.length === 0) {
        this.add.text(x, y, v.icon, {
          fontSize: '14px',
        }).setOrigin(0.5).setAlpha(unlocked ? 1 : 0.35).setData('nodeId', id);

        this.add.text(x, y + NODE_R + 8, v.name, {
          fontSize: '8px', fontFamily: 'Chakra Petch', color: '#8a9aaa',
        }).setOrigin(0.5, 0).setAlpha(unlocked ? 1 : 0.35).setData('nodeId', id);
      }

      if (unlocked) {
        const zone = this.add.zone(x, y, NODE_R * 2 + 10, NODE_R * 2 + 10)
          .setInteractive({ cursor: 'pointer' });
        zone.on('pointerdown', () => this._onNodeClick(id));
        this._nodeZones[id] = zone;
      }
    }
  }

  // ── Hero sprite ────────────────────────────────────────────────────────────

  _createHero() {
    if (!this.anims.exists('hero-idle')) {
      this.anims.create({
        key: 'hero-idle', frames: this.anims.generateFrameNumbers('hero-idle'),
        frameRate: 4, repeat: -1,
      });
    }
    const { x, y } = VILLAGES[window.playerState.currentVillage].pos;
    this._heroSpr = this.add.sprite(x, y - NODE_R - 12, 'hero-idle')
      .setScale(0.32)
      .setDepth(10);
    this._heroSpr.play('hero-idle');
  }

  // ── UI setup ───────────────────────────────────────────────────────────────

  _setupUI() {
    const equipBtn = document.getElementById('btn-map-equip');
    equipBtn.classList.add('visible');
    this._menuUI = new MenuUI(window.playerState);

    equipBtn.onclick = () => this._menuUI.show();
    document.getElementById('btn-close-menu').onclick = () => this._menuUI.hide();

    document.getElementById('btn-close-village').onclick = () => this._closeVillagePanel();
    document.getElementById('btn-fight-village').onclick = () => this._startBattle();

    document.getElementById('ui-overlay').style.display = 'none';
  }

  shutdown() {
    document.getElementById('btn-map-equip')?.classList.remove('visible');
    this._closeVillagePanel();
    if (this._menuUI) this._menuUI.hide();
    Object.values(this._nodeZones).forEach(z => z.destroy());
    this._nodeZones = {};
  }

  // ── Node click & navigation ────────────────────────────────────────────────

  _onNodeClick(villageId) {
    if (this._animating) return;
    const ps = window.playerState;

    if (villageId === ps.currentVillage) {
      this._openVillagePanel(villageId);
      return;
    }

    const current = VILLAGES[ps.currentVillage];
    if (!current.connections.includes(villageId)) return;
    if (!ps.isVillageUnlocked(villageId)) return;

    this._closeVillagePanel();
    this._navigateTo(villageId);
  }

  _navigateTo(villageId) {
    this._animating = true;
    const target = VILLAGES[villageId];
    const hero   = this._heroSpr;

    this.tweens.add({
      targets: hero,
      x: target.pos.x,
      y: target.pos.y - NODE_R - 12,
      duration: 320,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        window.playerState.currentVillage = villageId;
        this._animating = false;
        this._refreshNodes();
        this._openVillagePanel(villageId);
      },
    });
  }

  _refreshNodes() {
    this._drawPaths();
    this.children.list
      .filter(c => c.type === 'Text' && c.getData('nodeId'))
      .forEach(c => c.destroy());
    this._drawNodes();
  }

  // ── Village panel ──────────────────────────────────────────────────────────

  _openVillagePanel(villageId) {
    const ps      = window.playerState;
    const village = VILLAGES[villageId];
    if (!village) return;

    const cleared    = ps.clearedVillages.has(villageId);
    const playable   = village.battles.every(id => ENEMIES[id] !== undefined);
    const diffStars  = DIFF_STARS[Math.min(village.diff - 1, DIFF_STARS.length - 1)];
    const battleCount = village.battles.length;

    document.getElementById('village-panel-icon').textContent    = village.icon;
    document.getElementById('village-panel-name').textContent    = village.name;
    document.getElementById('village-panel-diff').textContent    = diffStars;
    document.getElementById('village-panel-battles').textContent =
      `${battleCount} combat${battleCount > 1 ? 's' : ''}`;
    document.getElementById('village-panel-status').textContent  =
      cleared ? '✓ Terminé' : '';

    const btn = document.getElementById('btn-fight-village');
    if (!playable) {
      btn.textContent = 'Bientôt disponible';
      btn.className   = 'soon';
    } else {
      btn.textContent = cleared ? 'Rejouer' : 'Combattre';
      btn.className   = '';
    }
    btn.dataset.villageId = villageId;

    document.getElementById('village-panel').classList.add('visible');
  }

  _closeVillagePanel() {
    document.getElementById('village-panel').classList.remove('visible');
  }

  _startBattle() {
    const villageId = document.getElementById('btn-fight-village').dataset.villageId;
    if (!villageId) return;
    const village = VILLAGES[villageId];
    if (!village) return;
    if (!village.battles.every(id => ENEMIES[id] !== undefined)) return;

    this._closeVillagePanel();
    if (this._menuUI) this._menuUI.hide();
    document.getElementById('btn-map-equip').classList.remove('visible');
    document.getElementById('ui-overlay').style.display = '';

    this.scene.start('BattleScene', { villageId, seqIdx: 0 });
  }

  // ── Loot display ───────────────────────────────────────────────────────────

  _showLoot(itemId, onClose) {
    const item = ITEMS[itemId];
    if (!item) { if (onClose) onClose(); return; }

    const statText = Object.entries(item.stats)
      .map(([k, v]) => `+${v} ${k.toUpperCase()}`).join('  ');

    document.getElementById('loot-icon').textContent  = item.icon;
    document.getElementById('loot-name').textContent  = item.name;
    const rarityEl = document.getElementById('loot-rarity');
    rarityEl.textContent = item.rarity;
    rarityEl.className   = `rarity-${item.rarity}`;
    document.getElementById('loot-stats').textContent = statText;

    document.getElementById('loot-overlay').classList.add('visible');
    document.getElementById('btn-loot-continue').onclick = () => {
      document.getElementById('loot-overlay').classList.remove('visible');
      if (onClose) onClose();
    };
  }
}
