import WorldMapScene from './scenes/WorldMapScene.js';
import TitleScene    from './scenes/TitleScene.js';
import BattleScene   from './scenes/BattleScene.js';
import BattleUI      from './ui/BattleUI.js';
import PlayerState   from './battle/PlayerState.js';

window.playerState = new PlayerState();

const config = {
  type:            Phaser.AUTO,
  width:           800,
  height:          450,
  parent:          'game-container',
  backgroundColor: '#06000f',
  pixelArt:        true,
  roundPixels:     true,
  scene:           [TitleScene, WorldMapScene, BattleScene],
};

window.game     = new Phaser.Game(config);
window.battleUI = new BattleUI();

// ── Village cleared (héros a gagné tous les combats du village) ────────────
window.addEventListener('village-cleared', (e) => {
  const { villageId, loot } = e.detail;
  window.game.scene.getScene('BattleScene').scene.start('WorldMapScene', {
    clearedVillage: villageId,
    loot: loot ?? null,
  });
});

// ── Battle end (défaite) ───────────────────────────────────────────────────
window.addEventListener('battle-end', (e) => {
  if (e.detail?.winner === 'hero' && e.detail?.allCleared) {
    window._allBattlesCleared = true;
  }
});

// ── Replay button ─────────────────────────────────────────────────────────
document.getElementById('replay-btn').addEventListener('click', () => {
  window.battleUI.hideEndScreen();
  if (window._allBattlesCleared) {
    window._allBattlesCleared = false;
    window.playerState.resetProgress();
    window.game.scene.getScene('BattleScene').scene.start('WorldMapScene');
  } else {
    const villageId = window.playerState.currentVillage;
    document.getElementById('ui-overlay').style.display = '';
    window.game.scene.getScene('BattleScene').scene.start('BattleScene', {
      villageId, seqIdx: 0,
    });
  }
});

// ── Menu button (retour à la carte) ───────────────────────────────────────
document.getElementById('menu-btn').addEventListener('click', () => {
  window.battleUI.hideEndScreen();
  document.getElementById('ui-overlay').style.display = 'none';
  window.game.scene.getScene('BattleScene').scene.start('WorldMapScene');
});
