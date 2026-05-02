import {
  createHeroIdleSheet, createHeroWalkSheet,
  createHeroAttackSheet, createHeroHealSheet, createHeroShieldSheet,
  createGoblinIdleSheet, createGoblinWalkSheet,
  createGoblinAttackSheet, createGoblinDefendSheet,
} from '../assets/sprites.js';
import MenuUI from '../ui/MenuUI.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this._menuUI        = null;
    this._startListener = null;
  }

  preload() {
    const sheets = {
      'hero-idle':     createHeroIdleSheet(),
      'hero-walk':     createHeroWalkSheet(),
      'hero-attack':   createHeroAttackSheet(),
      'hero-heal':     createHeroHealSheet(),
      'hero-shield':   createHeroShieldSheet(),
      'goblin-idle':   createGoblinIdleSheet(),
      'goblin-walk':   createGoblinWalkSheet(),
      'goblin-attack': createGoblinAttackSheet(),
      'goblin-defend': createGoblinDefendSheet(),
    };
    Object.entries(sheets).forEach(([key, sheet]) => {
      if (this.textures.exists(key)) return;
      this.textures.addSpriteSheet(key, sheet.canvas, {
        frameWidth:  sheet.frameWidth,
        frameHeight: sheet.frameHeight,
      });
    });
  }

  create(data = {}) {
    this._drawBackground();

    if (!this.anims.exists('hero-idle')) {
      this.anims.create({
        key: 'hero-idle',
        frames: this.anims.generateFrameNumbers('hero-idle'),
        frameRate: 4,
        repeat: -1,
      });
    }

    this._hero = this.add.sprite(180, 230, 'hero-idle');
    this._hero.play('hero-idle');

    this._menuUI = new MenuUI(window.playerState);
    this._menuUI.show();

    if (data.loot) {
      this._menuUI.showLoot(data.loot);
    }

    this._startListener = () => {
      this._menuUI.hide();
      this.scene.start('BattleScene');
    };
    window.addEventListener('start-battle', this._startListener);
  }

  shutdown() {
    if (this._startListener) {
      window.removeEventListener('start-battle', this._startListener);
      this._startListener = null;
    }
    if (this._menuUI) this._menuUI.hide();
  }

  _drawBackground() {
    const g = this.add.graphics();
    const W = 800, H = 450;

    g.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x6a3080, 0xe8703a, 1);
    g.fillRect(0, 0, W, 320);

    g.fillStyle(0x3a1050);
    g.fillTriangle(0, 320, 120, 180, 240, 320);
    g.fillTriangle(80, 320, 220, 150, 360, 320);
    g.fillTriangle(200, 320, 350, 170, 500, 320);
    g.fillTriangle(350, 320, 480, 140, 620, 320);
    g.fillTriangle(520, 320, 650, 165, 780, 320);
    g.fillRect(0, 300, W, 20);

    g.fillStyle(0x2a0840);
    g.fillTriangle(0, 320, 80, 240, 160, 320);
    g.fillTriangle(140, 320, 260, 210, 380, 320);
    g.fillTriangle(300, 320, 430, 200, 560, 320);
    g.fillTriangle(500, 320, 630, 225, 760, 320);
    g.fillRect(0, 305, W, 15);

    g.fillGradientStyle(0x3a7a30, 0x3a7a30, 0x1e4a18, 0x1e4a18, 1);
    g.fillRect(0, 320, W, H - 320);
    g.fillStyle(0x52a840);
    g.fillRect(0, 318, W, 8);
  }
}
