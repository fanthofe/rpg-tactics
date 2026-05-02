import {
  createHeroIdleSheet, createHeroWalkSheet,
  createHeroAttackSheet, createHeroHealSheet, createHeroShieldSheet,
  createGoblinIdleSheet, createGoblinWalkSheet,
  createGoblinAttackSheet, createGoblinDefendSheet,
} from '../assets/sprites.js';
import BattleState from '../battle/BattleState.js';
import { rollLoot } from '../battle/items.js';

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
    this._state          = null;
    this._hero           = null;
    this._goblin         = null;
    this._heroBaseX      = 200;
    this._goblinBaseX    = 600;
    this._characterY     = 290;
    this._hpBg           = null;
    this._hpFill         = null;
    this._heroHpText     = null;
    this._goblinHpText   = null;
    this._msgText        = null;
    this._goblinTintActive = false;
    this._actionListener = null;
  }

  preload() {
    const sheets = {
      'hero-idle':    createHeroIdleSheet(),
      'hero-walk':    createHeroWalkSheet(),
      'hero-attack':  createHeroAttackSheet(),
      'hero-heal':    createHeroHealSheet(),
      'hero-shield':  createHeroShieldSheet(),
      'goblin-idle':  createGoblinIdleSheet(),
      'goblin-walk':  createGoblinWalkSheet(),
      'goblin-attack':createGoblinAttackSheet(),
      'goblin-defend':createGoblinDefendSheet(),
    };
    Object.entries(sheets).forEach(([key, sheet]) => {
      if (this.textures.exists(key)) return;
      this.textures.addSpriteSheet(key, sheet.canvas, {
        frameWidth:  sheet.frameWidth,
        frameHeight: sheet.frameHeight,
      });
    });
  }

  create() {
    this._state            = new BattleState(window.playerState ?? null);
    this._goblinTintActive = false;

    this._drawBackground();
    this._registerAnimations();
    this._createSprites();
    this._createHpBars();
    this._listenPlayerAction();

    window.dispatchEvent(new CustomEvent('battle-message', { detail: { text: 'Choisissez une action...' } }));
  }

  // ─── BACKGROUND ──────────────────────────────────────────────────────────────

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
    g.fillTriangle(660, 320, 780, 185, 800, 320);
    g.fillRect(0, 300, W, 20);

    g.fillStyle(0x2a0840);
    g.fillTriangle(0, 320, 80, 240, 160, 320);
    g.fillTriangle(140, 320, 260, 210, 380, 320);
    g.fillTriangle(300, 320, 430, 200, 560, 320);
    g.fillTriangle(500, 320, 630, 225, 760, 320);
    g.fillTriangle(680, 320, 760, 235, 800, 320);
    g.fillRect(0, 305, W, 15);

    g.fillGradientStyle(0x3a7a30, 0x3a7a30, 0x1e4a18, 0x1e4a18, 1);
    g.fillRect(0, 320, W, H - 320);
    g.fillStyle(0x52a840);
    g.fillRect(0, 318, W, 8);

    this._drawTree(g, 30,  240);
    this._drawTree(g, 80,  210);
    this._drawTree(g, 10,  260);
    this._drawTree(g, 690, 245);
    this._drawTree(g, 740, 215);
    this._drawTree(g, 760, 260);
  }

  _drawTree(g, x, y) {
    const T = 3;
    g.fillStyle(0x5C3317);
    g.fillRect(x + 4*T, y + 10*T, 2*T, 6*T);
    g.fillStyle(0x1E5A20);
    g.fillRect(x,       y +  7*T, 10*T, 5*T);
    g.fillStyle(0x267A2A);
    g.fillRect(x + T,   y +  3*T,  8*T, 5*T);
    g.fillStyle(0x2E9634);
    g.fillRect(x + 2*T, y,         6*T, 5*T);
  }

  // ─── ANIMATIONS ──────────────────────────────────────────────────────────────

  _registerAnimations() {
    [
      { key: 'hero-idle',     frameRate:  4, repeat: -1 },
      { key: 'hero-walk',     frameRate:  8, repeat: -1 },
      { key: 'hero-attack',   frameRate: 12, repeat:  0 },
      { key: 'hero-heal',     frameRate:  6, repeat:  0 },
      { key: 'hero-shield',   frameRate:  6, repeat:  0 },
      { key: 'goblin-idle',   frameRate:  4, repeat: -1 },
      { key: 'goblin-walk',   frameRate:  8, repeat: -1 },
      { key: 'goblin-attack', frameRate: 12, repeat:  0 },
      { key: 'goblin-defend', frameRate:  6, repeat:  0 },
    ].forEach(({ key, frameRate, repeat }) => {
      if (!this.anims.exists(key)) {
        this.anims.create({ key, frames: this.anims.generateFrameNumbers(key), frameRate, repeat });
      }
    });
  }

  // ─── SPRITES ─────────────────────────────────────────────────────────────────

  _createSprites() {
    this._hero = this.add.sprite(this._heroBaseX, this._characterY, 'hero-idle');
    this._hero.play('hero-idle');

    this._goblin = this.add.sprite(this._goblinBaseX, this._characterY, 'goblin-idle');
    this._goblin.setFlipX(true);
    this._goblin.play('goblin-idle');
  }

  // ─── HP BARS ─────────────────────────────────────────────────────────────────

  _createHpBars() {
    this._hpBg   = this.add.graphics();
    this._hpFill = this.add.graphics();
    this._drawHpBarBackgrounds();
    this._drawHpBarFills();

    this._heroHpText = this.add.text(218, 22, '', {
      fontSize: '13px', color: '#E8D4A0', fontFamily: 'Courier New',
    }).setOrigin(1, 0);

    this._goblinHpText = this.add.text(582, 22, '', {
      fontSize: '13px', color: '#E8D4A0', fontFamily: 'Courier New',
    });

    this._updateHpBars();
  }

  _drawHpBarBackgrounds() {
    const g = this._hpBg;
    g.clear();
    // Héros (gauche)
    g.fillStyle(0x000000, 0.6);
    g.fillRoundedRect(10, 12, 210, 22, 4);
    g.lineStyle(1, 0x8B6914, 1);
    g.strokeRoundedRect(10, 12, 210, 22, 4);
    // Gobelin (droite)
    g.fillStyle(0x000000, 0.6);
    g.fillRoundedRect(580, 12, 210, 22, 4);
    g.lineStyle(1, 0x8B6914, 1);
    g.strokeRoundedRect(580, 12, 210, 22, 4);
  }

  _getHpColor(ratio) {
    if (ratio > 0.5) return 0x2ECC71;
    if (ratio > 0.25) return 0xE67E22;
    return 0xE74C3C;
  }

  _drawHpBarFills() {
    const g = this._hpFill;
    g.clear();
    const heroR   = this._state.heroHp   / this._state.heroMaxHp;
    const goblinR = this._state.goblinHp / this._state.goblinMaxHp;
    g.fillStyle(this._getHpColor(heroR));
    g.fillRect(12, 14, Math.max(0, Math.floor(206 * heroR)), 18);
    const gobW = Math.max(0, Math.floor(206 * goblinR));
    g.fillStyle(this._getHpColor(goblinR));
    g.fillRect(582 + (206 - gobW), 14, gobW, 18);
  }

  _updateHpBars() {
    this._drawHpBarFills();
    this._heroHpText.setText(`${this._state.heroHp}/${this._state.heroMaxHp}`);
    this._goblinHpText.setText(`${this._state.goblinHp}/${this._state.goblinMaxHp}`);
  }

  // ─── FLOATING TEXT + MESSAGES ─────────────────────────────────────────────────

  floatText(x, y, text, color = '#FFFFFF') {
    const t = this.add.text(x, y, text, {
      fontSize: '22px', fontFamily: 'Courier New', fontStyle: 'bold',
      color, stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1);

    this.tweens.add({
      targets: t,
      y: y - 60,
      alpha: { from: 1, to: 0 },
      duration: 700,
      ease: 'Sine.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  showMessage(text) {
    window.dispatchEvent(new CustomEvent('battle-message', { detail: { text } }));

    if (this._msgText) { this._msgText.destroy(); this._msgText = null; }
    this._msgText = this.add.text(400, 195, text, {
      fontSize: '18px', fontFamily: 'Courier New',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 4,
      backgroundColor: '#00000090', padding: { x: 14, y: 8 },
    }).setOrigin(0.5);

    this.time.delayedCall(1200, () => {
      if (!this._msgText) return;
      this.tweens.add({
        targets: this._msgText,
        alpha: 0,
        duration: 300,
        onComplete: () => { if (this._msgText) { this._msgText.destroy(); this._msgText = null; } },
      });
    });
  }

  // ─── PLAYER INPUT ─────────────────────────────────────────────────────────────

  _listenPlayerAction() {
    if (this._actionListener) {
      window.removeEventListener('player-action', this._actionListener);
    }
    this._actionListener = (e) => this._onPlayerAction(e.detail.action);
    window.addEventListener('player-action', this._actionListener);
  }

  _onPlayerAction(action) {
    const msgs = {
      'attack':       'Vous attaquez !',
      'double-slash': '⚔⚔ Double Slash !',
      'shield':       '🛡 Bouclier du Guerrier !',
      'heal':         'Vous vous soignez !',
    };
    this.showMessage(msgs[action] || 'Action !');

    this.time.delayedCall(350, () => {
      this._executeHeroTurn(action, () => {
        if (this._state.isGoblinDead()) {
          this.showMessage('Le Gobelin est vaincu !');
          this.time.delayedCall(1200, () => {
            const loot = window.playerState ? this._generateLoot() : null;
            if (loot) window.playerState.addToInventory(loot);
            this.scene.start('MenuScene', loot ? { loot } : {});
          });
          return;
        }
        this.time.delayedCall(450, () => this._executeGoblinTurn());
      });
    });
  }

  // ─── HERO TURN ────────────────────────────────────────────────────────────────

  _executeHeroTurn(action, cb) {
    window.dispatchEvent(new CustomEvent('animation-start'));

    if (action === 'attack') {
      this._animHeroAttack(() => {
        if (this._goblinTintActive) {
          this._goblin.clearTint();
          this._goblinTintActive = false;
        }
        const result = this._state.heroAttack();
        const text   = result.blocked ? `🛡 -${result.damage}` : `-${result.damage}`;
        const color  = result.blocked ? '#E67E22' : '#E74C3C';
        if (result.blocked) this.showMessage('Attaque bloquée ! Dégâts réduits.');
        this.floatText(this._goblin.x, this._goblin.y - 30, text, color);
        this._updateHpBars();
        cb();
      });
    } else if (action === 'double-slash') {
      this._animHeroDoubleSlash(cb);
    } else if (action === 'shield') {
      this._animHeroShield(cb);
    } else {
      this._animHeroHeal(() => {
        const result = this._state.heroHeal();
        this.floatText(this._hero.x, this._hero.y - 30, `+${result.healed}`, '#2ECC71');
        this._updateHpBars();
        cb();
      });
    }
  }

  _animHeroAttack(onImpact) {
    const hero   = this._hero;
    const goblin = this._goblin;
    const baseX  = this._heroBaseX;

    hero.play('hero-walk');
    this.tweens.add({
      targets: hero, x: baseX + 80,
      duration: 200, ease: 'Sine.easeOut',
      onComplete: () => {
        hero.play('hero-attack');
        hero.once('animationcomplete-hero-attack', () => {
          goblin.setTint(0xffffff);
          this.time.delayedCall(80, () => goblin.clearTint());

          this.tweens.add({
            targets: goblin, x: this._goblinBaseX + 15,
            duration: 80, yoyo: true, ease: 'Sine.easeOut',
          });

          onImpact();

          this.time.delayedCall(120, () => {
            hero.play('hero-walk');
            this.tweens.add({
              targets: hero, x: baseX,
              duration: 180, ease: 'Sine.easeIn',
              onComplete: () => hero.play('hero-idle'),
            });
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
      targets: { v: 0 }, v: 1,
      duration: 600, yoyo: true,
      onUpdate: (tween) => {
        const a = tween.getValue();
        glow.clear();
        glow.fillStyle(0x00FF88, 0.3 * a);
        glow.fillCircle(hero.x, hero.y, 50 * a + 20);
      },
      onComplete: () => { glow.destroy(); onHeal(); },
    });

    hero.once('animationcomplete-hero-heal', () => hero.play('hero-idle'));
  }

  _animHeroDoubleSlash(cb) {
    if (this._goblinTintActive) {
      this._goblin.clearTint();
      this._goblinTintActive = false;
    }

    const hero   = this._hero;
    const goblin = this._goblin;
    const baseX  = this._heroBaseX;

    const doHit = (yOffset, next) => {
      hero.play('hero-attack');
      hero.once('animationcomplete-hero-attack', () => {
        goblin.setTint(0xffffff);
        this.time.delayedCall(80, () => goblin.clearTint());
        this.tweens.add({ targets: goblin, x: this._goblinBaseX + 12, duration: 70, yoyo: true });

        const result = this._state.heroAttack();
        const text   = result.blocked ? `🛡 -${result.damage}` : `-${result.damage}`;
        const color  = result.blocked ? '#E67E22' : '#E74C3C';
        this.floatText(goblin.x, goblin.y - 30 + yOffset, text, color);
        this._updateHpBars();
        next();
      });
    };

    hero.play('hero-walk');
    this.tweens.add({
      targets: hero, x: baseX + 80,
      duration: 200, ease: 'Sine.easeOut',
      onComplete: () => {
        doHit(0, () => {
          if (this._state.isGoblinDead()) {
            this.time.delayedCall(120, () => {
              hero.play('hero-walk');
              this.tweens.add({
                targets: hero, x: baseX, duration: 180, ease: 'Sine.easeIn',
                onComplete: () => { hero.play('hero-idle'); cb(); },
              });
            });
            return;
          }
          this.time.delayedCall(260, () => {
            doHit(-20, () => {
              this.time.delayedCall(120, () => {
                hero.play('hero-walk');
                this.tweens.add({
                  targets: hero, x: baseX, duration: 180, ease: 'Sine.easeIn',
                  onComplete: () => { hero.play('hero-idle'); cb(); },
                });
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
    hero.setTint(0xF0C040);

    const glow = this.add.graphics();
    this.tweens.add({
      targets: { v: 0 }, v: 1,
      duration: 500, yoyo: true,
      onUpdate: (tween) => {
        const a = tween.getValue();
        glow.clear();
        glow.fillStyle(0xF0C040, 0.35 * a);
        glow.fillCircle(hero.x, hero.y, 55 * a + 20);
      },
      onComplete: () => glow.destroy(),
    });

    hero.once('animationcomplete-hero-shield', () => {
      hero.play('hero-idle');
      cb();
    });
  }

  // ─── GOBLIN TURN ─────────────────────────────────────────────────────────────

  _executeGoblinTurn() {
    const action = this._state.goblinAI();

    if (action === 'attack') {
      this.showMessage('Le Gobelin attaque !');
      this.time.delayedCall(400, () => {
        this._animGoblinAttack(() => {
          const result = this._state.goblinAttack();
          if (result.dodged) {
            this.showMessage('💨 Esquivé !');
            this.floatText(this._hero.x, this._hero.y - 30, 'Esquivé !', '#FFCA28');
          } else if (result.shieldAbsorbed) {
            const msg = this._state.heroShieldActive
              ? '🛡 Bouclier actif ! Dégâts réduits.'
              : '🛡 Bouclier rompu ! Dégâts réduits.';
            this.showMessage(msg);
            this.floatText(this._hero.x, this._hero.y - 30, `🛡 -${result.damage}`, '#F0C040');
            if (!this._state.heroShieldActive) this._hero.clearTint();
          } else {
            this.floatText(this._hero.x, this._hero.y - 30, `-${result.damage}`, '#E74C3C');
          }
          this._updateHpBars();

          if (this._state.isHeroDead()) {
            this.time.delayedCall(700, () =>
              window.dispatchEvent(new CustomEvent('battle-end', { detail: { winner: 'goblin' } }))
            );
            return;
          }
          window.dispatchEvent(new CustomEvent('animation-end'));
        });
      });
    } else {
      this.showMessage('Le Gobelin se protège !');
      this.time.delayedCall(400, () => {
        this._animGoblinDefend(() => {
          this._state.goblinDefend();
          window.dispatchEvent(new CustomEvent('animation-end'));
        });
      });
    }
  }

  _animGoblinAttack(onImpact) {
    const goblin = this._goblin;
    const hero   = this._hero;
    const baseX  = this._goblinBaseX;

    goblin.play('goblin-walk');
    this.tweens.add({
      targets: goblin, x: baseX - 80,
      duration: 200, ease: 'Sine.easeOut',
      onComplete: () => {
        goblin.play('goblin-attack');
        goblin.once('animationcomplete-goblin-attack', () => {
          hero.setTint(0xffffff);
          this.time.delayedCall(80, () => {
            if (this._state.heroShieldActive) hero.setTint(0xF0C040);
            else hero.clearTint();
          });

          this.tweens.add({
            targets: hero, x: this._heroBaseX - 15,
            duration: 80, yoyo: true, ease: 'Sine.easeOut',
          });

          this.cameras.main.shake(150, 0.005);
          onImpact();

          this.time.delayedCall(120, () => {
            goblin.play('goblin-walk');
            this.tweens.add({
              targets: goblin, x: baseX,
              duration: 180, ease: 'Sine.easeIn',
              onComplete: () => goblin.play('goblin-idle'),
            });
          });
        });
      },
    });
  }

  _generateLoot() {
    return rollLoot(window.playerState?.ownedIds() ?? []);
  }

  _animGoblinDefend(onDefend) {
    const goblin = this._goblin;
    goblin.play('goblin-defend');
    goblin.once('animationcomplete-goblin-defend', () => {
      goblin.setTint(0x88AAFF);
      goblin.play('goblin-idle');
      this._goblinTintActive = true;
      onDefend();
    });
  }
}
