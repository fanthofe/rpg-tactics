import MenuScene   from './scenes/MenuScene.js';
import BattleScene from './scenes/BattleScene.js';
import BattleUI    from './ui/BattleUI.js';
import PlayerState from './battle/PlayerState.js';

window.playerState = new PlayerState();

const config = {
  type:            Phaser.AUTO,
  width:           800,
  height:          450,
  parent:          'game-container',
  backgroundColor: '#1a1a2e',
  pixelArt:        true,
  roundPixels:     true,
  scene:           [MenuScene, BattleScene],
};

window.game     = new Phaser.Game(config);
window.battleUI = new BattleUI();

document.getElementById('replay-btn').addEventListener('click', () => {
  window.battleUI.hideEndScreen();
  window.game.scene.getScene('BattleScene').scene.restart();
});

document.getElementById('menu-btn').addEventListener('click', () => {
  window.battleUI.hideEndScreen();
  window.game.scene.start('MenuScene');
});

document.getElementById('btn-fight').addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('start-battle'));
});
