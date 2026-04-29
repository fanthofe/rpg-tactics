import BattleScene from './scenes/BattleScene.js';
import BattleUI    from './ui/BattleUI.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  pixelArt: true,
  roundPixels: true,
  scene: [BattleScene],
};

window.game = new Phaser.Game(config);
window.battleUI = new BattleUI();

document.getElementById('replay-btn').addEventListener('click', () => {
  window.battleUI.hideEndScreen();
  window.game.scene.getScene('BattleScene').scene.restart();
});
