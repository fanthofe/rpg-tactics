export default class PrologueScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PrologueScene' });
    this._snowflakes = [];
    this._ended      = false;
  }

  create() {
    this._drawBackground();
    this._initSnow();
    this._initWolves();
    this._initUI();
    this._playCinematic();
  }

  // ── Décor ──────────────────────────────────────────────────────────────────

  _drawBackground() {
    const W = 800, H = 450;
    const g = this.add.graphics();

    // Ciel nuit-bleutée
    g.fillGradientStyle(0x03020C, 0x03020C, 0x080420, 0x080420, 1);
    g.fillRect(0, 0, W, H);

    // Étoiles (seed fixe)
    const rand = s => { const x = Math.sin(s) * 10000; return x - Math.floor(x); };
    for (let i = 0; i < 70; i++) {
      const sx = rand(i * 3.7) * W;
      const sy = rand(i * 5.3) * H * 0.55;
      const a  = 0.2 + rand(i * 11.1) * 0.55;
      g.fillStyle(0xCCDDFF, a);
      g.fillCircle(sx, sy, rand(i * 7) > 0.9 ? 1.5 : 1);
    }

    // Montagnes lointaines (silhouettes — Skövann)
    g.fillStyle(0x0B0830, 1);
    g.fillTriangle(530, 290, 610, 175, 700, 290);
    g.fillTriangle(590, 290, 675, 158, 760, 290);
    g.fillTriangle(460, 290, 530, 192, 610, 290);

    // Halo sacré de Skövann
    const halo = this.add.graphics();
    halo.fillStyle(0x99AAFF, 0.07);
    halo.fillCircle(640, 230, 100);
    halo.fillStyle(0x99AAFF, 0.04);
    halo.fillCircle(640, 230, 150);

    // Montagnes proches (plus sombres)
    g.fillStyle(0x060420, 1);
    g.fillTriangle(280, 300, 360, 218, 440, 300);
    g.fillTriangle(180, 300, 255, 235, 330, 300);
    g.fillTriangle(-10, 300, 70, 248, 150, 300);

    // Horizon + sol enneigé
    g.fillGradientStyle(0x7788BB, 0x7788BB, 0x3344AA, 0x3344AA, 1);
    g.fillRect(0, 296, W, 4);
    g.fillGradientStyle(0xC8D8F0, 0xC8D8F0, 0x9AAAD8, 0x9AAAD8, 0.92);
    g.fillRect(0, 300, W, H - 300);

    // Congères
    g.fillStyle(0xDDEEFF, 0.55);
    g.fillEllipse(90,  312, 200, 28);
    g.fillEllipse(390, 316, 160, 22);
    g.fillEllipse(690, 310, 190, 26);

    // Sapins silhouettes
    const tree = (x, h, sc = 1) => {
      g.fillStyle(0x050318, 0.92);
      g.fillTriangle(x, 300 - h * sc, x - 14 * sc, 300, x + 14 * sc, 300);
      g.fillTriangle(x, 300 - h * 0.65 * sc, x - 17 * sc, 300 - h * 0.28 * sc, x + 17 * sc, 300 - h * 0.28 * sc);
    };
    tree(55,  60, 1.2); tree(115, 50); tree(168, 68, 0.85);
    tree(672, 54, 0.75); tree(715, 64, 0.95);
  }

  _initSnow() {
    const rand = () => Math.random();
    for (let i = 0; i < 45; i++) {
      const f = this.add.graphics();
      const r = 0.7 + rand() * 1.3;
      f.fillStyle(0xFFFFFF, 0.5 + rand() * 0.4);
      f.fillCircle(0, 0, r);
      f.x = rand() * 800;
      f.y = rand() * 310;
      f._vy    = 0.25 + rand() * 0.45;
      f._vx    = (rand() - 0.5) * 0.25;
      f._alpha = f.alpha;
      this._snowflakes.push(f);
    }
  }

  // ── Loups ──────────────────────────────────────────────────────────────────

  _initWolves() {
    this._kael   = this.add.graphics();
    this._aldric = this.add.graphics();
    this._walkFrame = 0;

    // Positions hors-écran gauche au départ
    this._kael.x   = -90;
    this._aldric.x = -200;
    this._kael.y   = this._aldric.y = 0;

    this._redrawWolves(0);
  }

  _drawWolf(g, opts = {}) {
    const {
      color    = 0xDDEEFF,
      stripe   = 0x556677,
      legColor = 0xAABBCC,
      scale    = 1.0,
      phase    = 0,        // 0 ou 1 — cycle de marche
      eyeColor = 0xFFCC44,
      bobY     = 0,
    } = opts;

    g.clear();

    const s  = scale;
    const by = bobY;

    // ── QUEUE ──
    g.fillStyle(color, 1);
    g.fillEllipse(-8 * s, 285 + by, 22 * s, 13 * s);
    g.fillEllipse(-18 * s, 278 + by, 16 * s, 11 * s);

    // ── CORPS ──
    g.fillStyle(color, 1);
    g.fillEllipse(22 * s, 291 + by, 52 * s, 30 * s);

    // Marque dorsale (Kael uniquement)
    if (stripe !== 0) {
      g.fillStyle(stripe, 0.65);
      g.fillEllipse(22 * s, 285 + by, 44 * s, 9 * s);
    }

    // ── COU ──
    g.fillStyle(color, 1);
    g.fillEllipse(40 * s, 280 + by, 19 * s, 23 * s);

    // ── TÊTE ──
    g.fillStyle(color, 1);
    g.fillEllipse(48 * s, 268 + by, 24 * s, 20 * s);

    // Museau
    g.fillStyle(legColor, 1);
    g.fillEllipse(60 * s, 274 + by, 15 * s, 11 * s);

    // Truffe
    g.fillStyle(0x221122, 1);
    g.fillCircle(66 * s, 273 + by, 2 * s);

    // ── OREILLES ──
    g.fillStyle(color, 1);
    g.fillTriangle(41 * s, 263 + by, 37 * s, 253 + by, 46 * s, 261 + by);
    g.fillTriangle(49 * s, 261 + by, 46 * s, 251 + by, 54 * s, 260 + by);

    // ── ŒIL ──
    g.fillStyle(eyeColor, 0.9);
    g.fillCircle(55 * s, 267 + by, 2.5 * s);
    g.fillStyle(0x000000, 1);
    g.fillCircle(55 * s, 267 + by, 1.2 * s);

    // ── PATTES (cycle de marche à 2 frames) ──
    const lp = phase;
    const offsets = lp === 0
      ? [0, 4, -4, 0]   // [avant-gauche, avant-droite, arrière-gauche, arrière-droite]
      : [4, 0, 0, -4];

    g.fillStyle(legColor, 1);
    // Pattes avant
    g.fillRect(28 * s, 303 + by + offsets[0], 7 * s, 15 * s);
    g.fillRect(37 * s, 303 + by + offsets[1], 7 * s, 15 * s);
    // Pattes arrière
    g.fillRect( 5 * s, 303 + by + offsets[2], 7 * s, 15 * s);
    g.fillRect(14 * s, 303 + by + offsets[3], 7 * s, 15 * s);
  }

  _redrawWolves(frame) {
    const bob = Math.sin(frame * 0.15) * 1.5;

    // Kael — blanc neige, marque charbon
    this._drawWolf(this._kael, {
      color:    0xDCECFF,
      stripe:   0x445566,
      legColor: 0xAABBCC,
      scale:    1.0,
      phase:    frame % 2,
      eyeColor: 0xFFCC44,
      bobY:     bob,
    });

    // Aldric (père) — gris-argent, plus grand
    this._drawWolf(this._aldric, {
      color:    0x8899AA,
      stripe:   0,
      legColor: 0x607080,
      scale:    1.18,
      phase:    (frame + 1) % 2,
      eyeColor: 0xFFAA22,
      bobY:     -bob,
    });
  }

  // ── UI & sous-titres ───────────────────────────────────────────────────────

  _initUI() {
    // Bandes letterbox
    const barT = this.add.graphics().setDepth(10);
    barT.fillStyle(0x000000, 1);
    barT.fillRect(0, 0, 800, 48);

    const barB = this.add.graphics().setDepth(10);
    barB.fillStyle(0x000000, 1);
    barB.fillRect(0, 402, 800, 48);

    // Texte sous-titre
    this._sub = this.add.text(400, 418, '', {
      fontSize:        '13px',
      fontFamily:      'Chakra Petch',
      color:           '#C8D8EE',
      stroke:          '#000000',
      strokeThickness: 3,
      align:           'center',
    }).setOrigin(0.5, 0.5).setDepth(11).setAlpha(0);

    // Bouton Passer
    this._skipBtn = this.add.text(772, 24, 'Passer ▶', {
      fontSize:   '11px',
      fontFamily: 'Chakra Petch',
      color:      '#667788',
    }).setOrigin(1, 0.5).setDepth(12).setInteractive({ useHandCursor: true });

    this._skipBtn.on('pointerover', () => this._skipBtn.setColor('#AABBCC'));
    this._skipBtn.on('pointerout',  () => this._skipBtn.setColor('#667788'));
    this._skipBtn.on('pointerdown', () => this._endCinematic());

    // Overlay de fondu (par-dessus tout)
    this._fade = this.add.graphics().setDepth(20);
    this._fade.fillStyle(0x000000, 1);
    this._fade.fillRect(0, 0, 800, 450);
  }

  // ── Helpers séquençage ─────────────────────────────────────────────────────

  _wait(ms) {
    return new Promise(r => this.time.delayedCall(ms, r));
  }

  _fadeTo(alpha, duration) {
    return new Promise(r => {
      this.tweens.add({ targets: this._fade, alpha, duration, onComplete: r });
    });
  }

  _moveTo(sprite, x, duration, ease = 'Sine.easeInOut') {
    return new Promise(r => {
      this.tweens.add({ targets: sprite, x, duration, ease, onComplete: r });
    });
  }

  _showSub(text, hold = 2800) {
    return new Promise(r => {
      this._sub.setText(text).setAlpha(0);
      this.tweens.add({
        targets: this._sub, alpha: 1, duration: 350,
        onComplete: () => {
          this.time.delayedCall(hold, () => {
            this.tweens.add({
              targets: this._sub, alpha: 0, duration: 350, onComplete: r,
            });
          });
        },
      });
    });
  }

  // ── Cinématique ────────────────────────────────────────────────────────────

  async _playCinematic() {
    // Fondu entrant
    await this._fadeTo(0, 1400);
    if (this._ended) return;

    // Les deux loups entrent depuis la gauche
    this._moveTo(this._aldric, 80,  2600, 'Sine.easeOut');
    await this._moveTo(this._kael,   175, 2600, 'Sine.easeOut');
    if (this._ended) return;

    await this._wait(400);
    await this._showSub('Skövann.\nLe lieu sacré des loups.', 2600);
    if (this._ended) return;

    // Ils avancent pendant la ligne suivante
    this._moveTo(this._aldric, 200, 3500, 'Linear');
    this._moveTo(this._kael,   300, 3500, 'Linear');
    await this._showSub('Chaque année, les tribus élisent\ncelui qui parlera aux ancêtres.', 3000);
    if (this._ended) return;

    // Le père s'arrête, se tourne légèrement
    await this._wait(600);
    await this._showSub('"Kael. Les ancêtres t\'ont choisi."', 2600);
    if (this._ended) return;

    await this._wait(500);
    await this._showSub('"Je sais que tu n\'es pas prêt."', 2400);
    if (this._ended) return;

    // Silence
    await this._wait(1400);
    await this._showSub('"Personne ne l\'est jamais."', 2800);
    if (this._ended) return;

    await this._wait(800);

    // Ils repartent ensemble vers Skövann (fond lumineux)
    this._moveTo(this._aldric, 540, 5000, 'Sine.easeIn');
    this._moveTo(this._kael,   640, 5000, 'Sine.easeIn');

    await this._wait(2200);
    if (this._ended) return;

    // Fondu au noir
    await this._fadeTo(1, 2200);
    if (this._ended) return;

    // Titre
    const title = this.add.text(400, 195, 'SKÖVANN', {
      fontSize:        '38px',
      fontFamily:      'Russo One',
      color:           '#AABBDD',
      stroke:          '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(21).setAlpha(0);

    const sub2 = this.add.text(400, 245, 'La Clairière des Premiers', {
      fontSize:        '14px',
      fontFamily:      'Chakra Petch',
      color:           '#667788',
      stroke:          '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(21).setAlpha(0);

    await new Promise(r => {
      this.tweens.add({ targets: title, alpha: 1, duration: 900, onComplete: r });
    });
    await new Promise(r => {
      this.tweens.add({ targets: sub2, alpha: 0.8, duration: 700, onComplete: r });
    });

    await this._wait(2400);

    await new Promise(r => {
      this.tweens.add({ targets: [title, sub2], alpha: 0, duration: 700, onComplete: r });
    });

    this._endCinematic();
  }

  _endCinematic() {
    if (this._ended) return;
    this._ended = true;
    this._skipBtn.disableInteractive();

    const veil = this.add.graphics().setDepth(30);
    veil.fillStyle(0x000000, 1);
    veil.fillRect(0, 0, 800, 450);
    veil.setAlpha(this._fade.alpha ?? 0);

    this.tweens.add({
      targets: veil, alpha: 1, duration: 600,
      onComplete: () => this.scene.start('WorldMapScene'),
    });
  }

  // ── Boucle de mise à jour ──────────────────────────────────────────────────

  update() {
    // Neige
    for (const f of this._snowflakes) {
      f.y += f._vy;
      f.x += f._vx;
      if (f.y > 315) { f.y = -4; f.x = Math.random() * 800; }
      if (f.x < 0 || f.x > 800) f.x = Math.random() * 800;
    }

    // Cycle de marche (1 pas toutes les 280 ms)
    const frame = Math.floor(this.time.now / 280);
    if (frame !== this._lastFrame) {
      this._lastFrame = frame;
      this._redrawWolves(frame);
    }
  }
}
