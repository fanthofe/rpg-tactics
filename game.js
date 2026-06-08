import WorldMapScene    from './scenes/WorldMapScene.js';
import TitleScene       from './scenes/TitleScene.js';
import BattleScene      from './scenes/BattleScene.js';
import PrologueScene    from './scenes/PrologueScene.js';
import FormationScene   from './scenes/FormationScene.js';
import WolfBattleScene  from './scenes/WolfBattleScene.js';
import BattleUI         from './ui/BattleUI.js';
import WolfState        from './battle/WolfState.js';
import { VILLAGES }     from './battle/villages.js';

// Expose VILLAGES globally so WolfState.isVillageUnlocked can access it
window._villages = { VILLAGES };

// Wolf state (new pack system)
window.wolfState = new WolfState();
const saved = WolfState.tryLoad();
if (saved) window.wolfState.loadFromData(saved);

// Legacy player state kept for BattleScene compatibility
import PlayerState from './battle/PlayerState.js';
window.playerState = new PlayerState();
const legacySave = PlayerState.tryLoad();
if (legacySave) window.playerState.loadFromData(legacySave);

const config = {
  type:            Phaser.AUTO,
  width:           800,
  height:          450,
  parent:          'game-container',
  backgroundColor: '#06000f',
  pixelArt:        true,
  roundPixels:     true,
  scene:           [TitleScene, PrologueScene, WorldMapScene, BattleScene, FormationScene, WolfBattleScene],
};

window.game     = new Phaser.Game(config);
window.battleUI = new BattleUI();

// ── Village cleared (meute a gagné) ───────────────────────────────────────
window.addEventListener('village-cleared', (e) => {
  const { villageId, loot } = e.detail;

  // Determine which scene is active and transition accordingly
  const wbScene = window.game.scene.getScene('WolfBattleScene');
  const bScene  = window.game.scene.getScene('BattleScene');

  if (wbScene?.scene.isActive()) {
    wbScene.scene.start('WorldMapScene', { clearedVillage: villageId, loot: loot ?? null });
  } else if (bScene?.scene.isActive()) {
    bScene.scene.start('WorldMapScene', { clearedVillage: villageId, loot: loot ?? null });
  }
});

// ── Battle end (défaite) ──────────────────────────────────────────────────
window.addEventListener('battle-end', (e) => {
  if (e.detail?.winner === 'hero' && e.detail?.allCleared) {
    window._allBattlesCleared = true;
  }
  if (e.detail?.winner === 'enemy') {
    window.battleUI.showEndScreen(e.detail);
  }
});

// ── Replay button ─────────────────────────────────────────────────────────
document.getElementById('replay-btn').addEventListener('click', () => {
  window.battleUI.hideEndScreen();
  if (window._allBattlesCleared) {
    window._allBattlesCleared = false;
    window.wolfState.resetProgress();
    window.playerState.resetProgress();
    window.game.scene.getScene('WolfBattleScene')?.scene.start('WorldMapScene');
    window.game.scene.getScene('BattleScene')?.scene.start('WorldMapScene');
  } else {
    const villageId = window.wolfState.currentVillage;
    document.getElementById('wolf-ui-overlay').style.display = 'none';
    document.getElementById('ui-overlay').style.display = 'none';
    window.game.scene.getScene('WolfBattleScene')?.scene.start('FormationScene', {
      villageId, seqIdx: 0,
    });
  }
});

// ── Menu button ───────────────────────────────────────────────────────────
document.getElementById('menu-btn').addEventListener('click', () => {
  window.battleUI.hideEndScreen();
  document.getElementById('wolf-ui-overlay').style.display = 'none';
  document.getElementById('ui-overlay').style.display = 'none';
  const active = window.game.scene.scenes.find(s => s.scene.isActive());
  active?.scene.start('WorldMapScene');
});
