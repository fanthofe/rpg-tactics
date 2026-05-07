import PlayerState from '../battle/PlayerState.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    this._drawBackground();
    this._setupOverlay();
  }

  _drawBackground() {
    const g = this.add.graphics();
    const W = 800, H = 450;

    g.fillGradientStyle(0x080818, 0x080818, 0x0a0020, 0x0a0020, 1);
    g.fillRect(0, 0, W, H);

    // Étoiles aléatoires — seed fixe pour reproductibilité
    const rand = (seed) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    for (let i = 0; i < 80; i++) {
      const x     = rand(i * 3.1) * W;
      const y     = rand(i * 7.3) * H;
      const alpha = 0.2 + rand(i * 13.7) * 0.6;
      const size  = rand(i * 5.9) > 0.85 ? 1.5 : 1;
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(x, y, size);
    }
  }

  _setupOverlay() {
    const hasSave = PlayerState.tryLoad() !== null;

    const titleEl    = document.getElementById('title-screen');
    const btnContinue = document.getElementById('btn-continue');
    const noSaveEl   = document.getElementById('btn-no-save');
    const btnNew     = document.getElementById('btn-new-game');

    titleEl.classList.add('visible');

    if (hasSave) {
      btnContinue.classList.add('has-save');
      noSaveEl.style.display = 'none';
    } else {
      btnContinue.classList.remove('has-save');
      noSaveEl.style.display = '';
    }

    btnNew.onclick = () => {
      window.playerState.resetProgress();
      window.playerState.save();
      this.scene.start('WorldMapScene');
    };

    if (hasSave) {
      btnContinue.onclick = () => {
        const data = PlayerState.tryLoad();
        if (data) window.playerState.loadFromData(data);
        this.scene.start('WorldMapScene');
      };
    }
  }

  shutdown() {
    document.getElementById('title-screen')?.classList.remove('visible');
  }
}
