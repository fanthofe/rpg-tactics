# Title Screen & Save System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un écran titre avec "Nouvelle partie" / "Continuer", et une sauvegarde automatique dans `localStorage`.

**Architecture:** `TitleScene` est la première scène Phaser ; elle lit `localStorage` pour activer le bouton "Continuer". `PlayerState` expose `save()`, `static tryLoad()`, `loadFromData()` et s'auto-sauvegarde après chaque mutation importante. Un bouton "⟵ Menu" sur la carte retourne à `TitleScene` après confirmation.

**Tech Stack:** Phaser 3.60, ES Modules, localStorage, HTML/CSS overlay (même pattern que `#village-panel`)

---

## File Map

| Fichier | Action |
|---------|--------|
| `battle/PlayerState.js` | Ajout `save()`, `static tryLoad()`, `loadFromData()` + auto-save |
| `scenes/TitleScene.js` | **Nouveau** — scène Phaser + overlay HTML |
| `index.html` | Ajout `#title-screen`, `#btn-map-menu`, `#map-confirm` + CSS |
| `game.js` | `TitleScene` en première scène |
| `scenes/WorldMapScene.js` | Bouton "⟵ Menu" + overlay confirmation |

---

## Task 1 — Save/Load sur `PlayerState`

**Files:** Modify `battle/PlayerState.js`

- [ ] **Step 1: Ajouter `save()`, `static tryLoad()`, `loadFromData()` après `resetProgress()`**

```js
save() {
  const data = {
    level:           this.level,
    exp:             this.exp,
    baseStats:       { ...this.baseStats },
    clearedVillages: [...this.clearedVillages],
    currentVillage:  this.currentVillage,
    inventory:       [...this.inventory],
    equipped:        { ...this.equipped },
  };
  localStorage.setItem('rpg-tactics-save', JSON.stringify(data));
}

static tryLoad() {
  try {
    const raw = localStorage.getItem('rpg-tactics-save');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

loadFromData(data) {
  this.level           = data.level           ?? 1;
  this.exp             = data.exp             ?? 0;
  this.baseStats       = { ...data.baseStats };
  this.clearedVillages = new Set(data.clearedVillages ?? []);
  this.currentVillage  = data.currentVillage  ?? MAP_START;
  this.inventory       = data.inventory       ?? ['sword-iron', 'armor-leather', 'helmet-iron'];
  this.equipped        = { ...data.equipped };
}
```

- [ ] **Step 2: Commit**

```bash
git add battle/PlayerState.js
git commit -m "feat: add save/tryLoad/loadFromData to PlayerState"
```

---

## Task 2 — Auto-save dans les mutations de `PlayerState`

**Files:** Modify `battle/PlayerState.js`

- [ ] **Step 1: Ajouter `this.save()` à la fin de `clearVillage()`**

Remplacer :
```js
clearVillage(villageId) {
  this.clearedVillages.add(villageId);
  this.currentVillage = villageId;
}
```
par :
```js
clearVillage(villageId) {
  this.clearedVillages.add(villageId);
  this.currentVillage = villageId;
  this.save();
}
```

- [ ] **Step 2: Ajouter `this.save()` dans `gainExp()` si level-up**

Remplacer la ligne `return` finale :
```js
    return { leveled: levels.length > 0, levels };
```
par :
```js
    if (levels.length > 0) this.save();
    return { leveled: levels.length > 0, levels };
```

- [ ] **Step 3: Ajouter `this.save()` à la fin de `equip()`**

Remplacer :
```js
  equip(itemId, slot) {
    const prev = this.equipped[slot];
    if (prev) this.inventory.push(prev);
    this.equipped[slot] = itemId;
    const idx = this.inventory.indexOf(itemId);
    if (idx !== -1) this.inventory.splice(idx, 1);
  }
```
par :
```js
  equip(itemId, slot) {
    const prev = this.equipped[slot];
    if (prev) this.inventory.push(prev);
    this.equipped[slot] = itemId;
    const idx = this.inventory.indexOf(itemId);
    if (idx !== -1) this.inventory.splice(idx, 1);
    this.save();
  }
```

- [ ] **Step 4: Ajouter `this.save()` à la fin de `unequip()`**

Remplacer :
```js
  unequip(slot) {
    const itemId = this.equipped[slot];
    if (!itemId) return;
    this.equipped[slot] = null;
    this.addToInventory(itemId);
  }
```
par :
```js
  unequip(slot) {
    const itemId = this.equipped[slot];
    if (!itemId) return;
    this.equipped[slot] = null;
    this.addToInventory(itemId);
    this.save();
  }
```

- [ ] **Step 5: Commit**

```bash
git add battle/PlayerState.js
git commit -m "feat: auto-save on clearVillage, gainExp level-up, equip, unequip"
```

---

## Task 3 — Mettre à jour `index.html`

**Files:** Modify `index.html`

- [ ] **Step 1: Ajouter le CSS de l'écran titre et des nouveaux éléments carte**

Dans le bloc `<style>`, juste avant `</style>`, ajouter :

```css
/* ── TITLE SCREEN ─────────────────────────────────────── */
#title-screen {
  position: absolute;
  inset: 0;
  z-index: 25;
  pointer-events: none;
}
#title-screen-content {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0;
  pointer-events: auto;
}
#title-screen-content.visible { display: flex; }

#title-game-name {
  font-family: 'Russo One', sans-serif;
  font-size: 52px;
  color: #A78BFA;
  letter-spacing: 8px;
  text-transform: uppercase;
  text-shadow: 0 0 30px rgba(167,139,250,0.8), 0 0 60px rgba(167,139,250,0.4);
  animation: neon-pulse 2s infinite;
  margin-bottom: 8px;
}
#title-subtitle {
  font-family: 'Chakra Petch', monospace;
  font-size: 12px;
  color: #475569;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 40px;
}
#title-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
#btn-new-game {
  padding: 12px 52px;
  font-family: 'Russo One', sans-serif;
  font-size: 15px;
  letter-spacing: 3px;
  text-transform: uppercase;
  background: linear-gradient(180deg, #7C3AED 0%, #4C1D95 100%);
  color: #fff;
  border: 1.5px solid #A78BFA;
  border-radius: 3px;
  cursor: pointer;
  box-shadow: 0 0 24px rgba(124,58,237,0.6);
  transition: all 0.15s ease;
}
#btn-new-game:hover {
  background: linear-gradient(180deg, #8B5CF6 0%, #6D28D9 100%);
  box-shadow: 0 0 40px rgba(124,58,237,0.8);
  transform: translateY(-2px);
}
#btn-continue {
  padding: 10px 40px;
  font-family: 'Russo One', sans-serif;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: rgba(255,255,255,0.03);
  color: var(--text-muted);
  border: 1.5px solid rgba(148,163,184,0.2);
  border-radius: 3px;
  cursor: default;
  transition: all 0.15s ease;
}
#btn-continue.has-save {
  background: rgba(124,58,237,0.1);
  color: var(--text);
  border-color: rgba(124,58,237,0.5);
  box-shadow: 0 0 12px rgba(124,58,237,0.25);
  cursor: pointer;
}
#btn-continue.has-save:hover {
  background: rgba(124,58,237,0.22);
  box-shadow: 0 0 22px rgba(124,58,237,0.45);
  transform: translateY(-1px);
}

/* ── MAP MENU BUTTON ──────────────────────────────────── */
#btn-map-menu {
  position: absolute;
  bottom: 124px;
  right: 12px;
  padding: 8px 14px;
  font-family: 'Chakra Petch', monospace;
  font-size: 13px; letter-spacing: 1px;
  background: rgba(255,255,255,0.04);
  border: 1.5px solid rgba(148,163,184,0.3);
  color: var(--text-muted); border-radius: 3px;
  cursor: pointer; z-index: 15;
  transition: all 0.15s ease;
  display: none;
}
#btn-map-menu.visible { display: block; }
#btn-map-menu:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(148,163,184,0.55);
  color: var(--text);
}

/* ── MAP CONFIRM OVERLAY ──────────────────────────────── */
#map-confirm {
  position: absolute;
  inset: 0;
  background: rgba(4,0,12,0.75);
  backdrop-filter: blur(3px);
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 20;
}
#map-confirm.visible { display: flex; }
#map-confirm-text {
  font-family: 'Chakra Petch', monospace;
  font-size: 13px;
  color: var(--text);
  letter-spacing: 1px;
  text-align: center;
}
#map-confirm-btns { display: flex; gap: 14px; }
#btn-confirm-yes {
  padding: 9px 28px;
  font-family: 'Russo One', sans-serif;
  font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
  background: linear-gradient(180deg, #7C3AED 0%, #4C1D95 100%);
  color: #fff; border: 1.5px solid #A78BFA; border-radius: 3px;
  cursor: pointer;
  transition: all 0.12s ease;
}
#btn-confirm-yes:hover { background: linear-gradient(180deg, #8B5CF6 0%, #6D28D9 100%); }
#btn-confirm-no {
  padding: 9px 22px;
  font-family: 'Russo One', sans-serif;
  font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
  background: rgba(255,255,255,0.04);
  color: var(--text-muted); border: 1.5px solid rgba(148,163,184,0.3); border-radius: 3px;
  cursor: pointer;
  transition: all 0.12s ease;
}
#btn-confirm-no:hover { color: var(--text); border-color: rgba(148,163,184,0.6); }
```

- [ ] **Step 2: Ajouter le HTML de l'écran titre, du bouton menu et de l'overlay confirmation**

Dans `<div id="game-wrapper">`, juste avant `</div>` (après `<button id="btn-map-equip">`), ajouter :

```html
<button id="btn-map-menu">⟵ Menu</button>

<div id="map-confirm">
  <div id="map-confirm-text">Retourner au menu ?<br><span style="font-size:10px;color:var(--text-muted);">La progression est sauvegardée.</span></div>
  <div id="map-confirm-btns">
    <button id="btn-confirm-yes">Oui</button>
    <button id="btn-confirm-no">Non</button>
  </div>
</div>

<div id="title-screen">
  <div id="title-screen-content">
    <div id="title-game-name">RPG Tactics</div>
    <div id="title-subtitle">Voyage à travers les clans</div>
    <div id="title-buttons">
      <button id="btn-new-game">Nouvelle partie</button>
      <button id="btn-continue">Continuer</button>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add title screen, map menu button, confirm overlay to HTML"
```

---

## Task 4 — Créer `scenes/TitleScene.js`

**Files:** Create `scenes/TitleScene.js`

- [ ] **Step 1: Écrire le fichier complet**

```js
import PlayerState from '../battle/PlayerState.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    this._drawBackground();
    this._setupUI();
    window.dispatchEvent(new CustomEvent('animation-end'));
  }

  _drawBackground() {
    const g = this.add.graphics();
    const W = 800, H = 450;

    g.fillGradientStyle(0x06000f, 0x06000f, 0x0e0520, 0x06000f, 1);
    g.fillRect(0, 0, W, H);

    g.fillStyle(0xFFFFFF, 0.6);
    [
      [60,20],[120,8],[200,15],[300,6],[350,22],[450,10],[520,4],[570,18],
      [630,12],[720,24],[760,8],[100,30],[400,28],[560,30],[180,40],[280,35],
      [480,45],[650,38],[740,42],[80,50],[320,55],[540,48],
    ].forEach(([sx, sy]) => g.fillCircle(sx, sy, 1));

    g.fillStyle(0xA78BFA, 0.3);
    [[150,60],[400,30],[680,55],[250,70],[600,65]].forEach(([sx,sy]) => g.fillCircle(sx, sy, 1.5));
  }

  _setupUI() {
    const hasSave = PlayerState.tryLoad() !== null;

    const content    = document.getElementById('title-screen-content');
    const btnCont    = document.getElementById('btn-continue');
    content.classList.add('visible');

    if (hasSave) {
      btnCont.classList.add('has-save');
      btnCont.textContent = 'Continuer';
    } else {
      btnCont.textContent = 'Aucune sauvegarde';
    }

    document.getElementById('btn-new-game').onclick = () => this._newGame();
    btnCont.onclick = hasSave ? () => this._continue() : null;
  }

  _newGame() {
    window.playerState.resetProgress();
    window.playerState.save();
    this._hide();
    this.scene.start('WorldMapScene');
  }

  _continue() {
    const data = PlayerState.tryLoad();
    if (!data) return;
    window.playerState.loadFromData(data);
    this._hide();
    this.scene.start('WorldMapScene');
  }

  _hide() {
    const content = document.getElementById('title-screen-content');
    content.classList.remove('visible');
    const btnCont = document.getElementById('btn-continue');
    btnCont.classList.remove('has-save');
    btnCont.onclick = null;
    document.getElementById('btn-new-game').onclick = null;
  }

  shutdown() {
    this._hide();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add scenes/TitleScene.js
git commit -m "feat: add TitleScene with new game / continue buttons"
```

---

## Task 5 — Mettre à jour `game.js`

**Files:** Modify `game.js`

- [ ] **Step 1: Ajouter l'import de `TitleScene` et la mettre en première scène**

Remplacer :
```js
import WorldMapScene from './scenes/WorldMapScene.js';
import BattleScene   from './scenes/BattleScene.js';
```
par :
```js
import TitleScene    from './scenes/TitleScene.js';
import WorldMapScene from './scenes/WorldMapScene.js';
import BattleScene   from './scenes/BattleScene.js';
```

Remplacer :
```js
  scene:           [WorldMapScene, BattleScene],
```
par :
```js
  scene:           [TitleScene, WorldMapScene, BattleScene],
```

- [ ] **Step 2: Vérifier dans le navigateur**

Ouvrir `index.html` via un serveur local. L'écran titre doit s'afficher avec :
- "RPG Tactics" en violet lumineux
- "Nouvelle partie" actif
- "Aucune sauvegarde" grisé (premier lancement)

- [ ] **Step 3: Commit**

```bash
git add game.js
git commit -m "feat: TitleScene as entry point in game.js"
```

---

## Task 6 — Bouton "⟵ Menu" dans `WorldMapScene`

**Files:** Modify `scenes/WorldMapScene.js`

- [ ] **Step 1: Ajouter le bouton et l'overlay confirmation dans `_setupUI()`**

Dans `_setupUI()`, après `document.getElementById('btn-fight-village').onclick = () => this._startBattle();`, ajouter :

```js
    const menuBtn = document.getElementById('btn-map-menu');
    menuBtn.classList.add('visible');
    menuBtn.onclick = () => this._confirmReturnToMenu();

    document.getElementById('btn-confirm-no').onclick  = () =>
      document.getElementById('map-confirm').classList.remove('visible');
    document.getElementById('btn-confirm-yes').onclick = () => this._returnToMenu();
```

- [ ] **Step 2: Ajouter les méthodes `_confirmReturnToMenu()` et `_returnToMenu()`**

Ajouter après `_closeVillagePanel()` :

```js
  _confirmReturnToMenu() {
    document.getElementById('map-confirm').classList.add('visible');
  }

  _returnToMenu() {
    document.getElementById('map-confirm').classList.remove('visible');
    this.scene.start('TitleScene');
  }
```

- [ ] **Step 3: Nettoyer dans `shutdown()`**

Dans `shutdown()`, après `this._closeVillagePanel();`, ajouter :

```js
    document.getElementById('btn-map-menu')?.classList.remove('visible');
    document.getElementById('map-confirm')?.classList.remove('visible');
```

- [ ] **Step 4: Commit**

```bash
git add scenes/WorldMapScene.js
git commit -m "feat: add Menu button to WorldMapScene with confirmation overlay"
```

---

## Task 7 — Smoke test

- [ ] **Vérifier le flux complet dans le navigateur**

1. Premier lancement : écran titre, "Aucune sauvegarde" grisé, "Nouvelle partie" actif
2. Cliquer "Nouvelle partie" → carte du monde, Hameau disponible
3. Lancer un combat (Hameau), gagner → retour carte, Forêt débloquée
4. **Recharger la page** → écran titre, "Continuer" actif
5. Cliquer "Continuer" → carte du monde avec la progression restaurée (Hameau ✓, Forêt débloquée)
6. Changer un équipement → recharger → vérifier que l'équipement est toujours là
7. Cliquer "⟵ Menu" → overlay "Retourner au menu ?" → "Non" ferme → "Oui" retourne à l'écran titre
8. Depuis l'écran titre, "Nouvelle partie" → carte vierge niveau 1

- [ ] **Commit final**

```bash
git add -A
git commit -m "feat: title screen and localStorage save system complete"
```
