# Menu Scene — Design Spec
**Date :** 2026-05-02  
**Projet :** RPG Tactics (Phaser 3, vanilla JS ES modules)

---

## 1. Vue d'ensemble

Ajouter une scène menu plein écran (800×450px) permettant au joueur de gérer son inventaire, équiper son personnage et consulter ses stats avant chaque combat.

**Flux de navigation :**
```
index.html → MenuScene ──"Combattre !"──▶ BattleScene
                  ▲                              │
                  └── victoire (loot affiché) ───┘
                  └── défaite  (replay/menu)  ───┘
```

---

## 2. Architecture

### Nouveaux fichiers

| Fichier | Rôle |
|---|---|
| `scenes/MenuScene.js` | Scène Phaser : fond + héros idle en arrière-plan |
| `ui/MenuUI.js` | Overlay DOM plein écran : stats / équipement / inventaire |
| `battle/PlayerState.js` | État persistant du joueur (stats, équipement, inventaire) |
| `battle/items.js` | Catalogue complet des objets |

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `game.js` | Scène de départ = `MenuScene` ; initialise `window.playerState` |
| `battle/BattleState.js` | Constructeur accepte `PlayerState`; calcule les stats réelles |
| `index.html` | Ajouter `#menu-overlay` (masqué par défaut) |

### État global

`window.playerState` (instance de `PlayerState`) est partagé entre `MenuScene` et `BattleScene`, comme `window.game` et `window.battleUI`.

---

## 3. Modèle de données

### `PlayerState` (`battle/PlayerState.js`)

```js
{
  level: 1,
  baseStats: { hp: 100, atk: 18, def: 0, spd: 8, lck: 5 },
  equipped: {
    weapon:     null,  // item id ou null
    armor:      null,
    helmet:     null,
    accessory1: null,
    accessory2: null,
  },
  inventory: ['sword-iron', 'armor-leather', 'helmet-iron'], // départ
}
```

**Méthodes :**
- `computedStats()` → `{ hp, atk, def, spd, lck }` (base + bonus équipement)
- `equip(itemId, slot)` → place l'item dans le slot ; retourne l'ancien item dans l'inventaire
- `unequip(slot)` → retire l'item équipé, le remet en inventaire
- `addToInventory(itemId)` → ajoute un item (max 12 slots ; si plein, remplace le plus ancien)
- `isEquipped(itemId)` → booléen

### `items.js` — Catalogue

```js
export const ITEMS = {
  // ── Commun (score ≤ 9) ──────────────────────────────────────
  'sword-iron':    { name:'Épée de fer',      slot:'weapon',    icon:'⚔',  rarity:'common', stats:{ atk:6 } },
  'armor-leather': { name:'Armure de cuir',   slot:'armor',     icon:'🛡', rarity:'common', stats:{ def:8 } },
  'helmet-iron':   { name:'Casque en fer',    slot:'helmet',    icon:'⛑', rarity:'common', stats:{ def:4, hp:10 } },
  'ring-strength': { name:'Bague de force',   slot:'accessory', icon:'💍', rarity:'common', stats:{ atk:5 } },
  'ring-speed':    { name:'Anneau de vitesse',slot:'accessory', icon:'🏃', rarity:'common', stats:{ spd:5 } },
  'amulet-luck':   { name:'Amulette de chance',slot:'accessory',icon:'📿', rarity:'common', stats:{ lck:8 } },

  // ── Rare (score 10–18) ───────────────────────────────────────
  'sword-bronze':  { name:'Épée de bronze',   slot:'weapon',    icon:'⚔',  rarity:'rare',   stats:{ atk:10 } },
  'dagger-fast':   { name:'Dague rapide',     slot:'weapon',    icon:'🗡', rarity:'rare',   stats:{ atk:4, spd:5 } },
  'armor-chain':   { name:'Armure de mailles',slot:'armor',     icon:'🛡', rarity:'rare',   stats:{ def:15 } },
  'helmet-steel':  { name:"Casque d'acier",   slot:'helmet',    icon:'⛑', rarity:'rare',   stats:{ def:8, hp:20 } },
  'charm-life':    { name:'Charme de vie',    slot:'accessory', icon:'💎', rarity:'rare',   stats:{ hp:25 } },

  // ── Épique (score ≥ 19) ──────────────────────────────────────
  'sword-runic':   { name:'Épée runique',     slot:'weapon',    icon:'⚡', rarity:'epic',   stats:{ atk:16, lck:3 } },
  'armor-paladin': { name:'Armure du Paladin',slot:'armor',     icon:'🔱', rarity:'epic',   stats:{ def:18, hp:20 } },
  'helmet-dragon': { name:'Casque du Dragon', slot:'helmet',    icon:'🐉', rarity:'epic',   stats:{ def:12, hp:10, spd:3 } },
  'ring-demon':    { name:'Anneau du Démon',  slot:'accessory', icon:'😈', rarity:'epic',   stats:{ atk:8, spd:8 } },
};

export const DROP_WEIGHTS = { common: 60, rare: 30, epic: 10 }; // %
```

**Score de valeur** = ATK×1.0 + DEF×0.8 + HP×0.5 + SPD×1.2 + LCK×1.0

---

## 4. Scène Menu

### `MenuScene.js`

Scène Phaser minimale :
- `preload()` : charge **tous** les sprites via les fonctions de `assets/sprites.js` (MenuScene est la première scène ; BattleScene vérifie `this.textures.exists(key)` avant de re-charger)
- `create()` : dessine le fond identique à `BattleScene` (même `_drawBackground()` partagée ou dupliquée) + sprite héros en idle au centre-gauche
- Le héros joue `hero-idle` en boucle ; pas d'autre logique de combat ici
- Instancie `MenuUI` et lui passe `window.playerState`
- Écoute l'événement custom `start-battle` → `this.scene.start('BattleScene')`
- Si lancée avec `{ loot: itemId }` dans les données de scène, appelle `MenuUI.showLoot(itemId)`

### `MenuUI.js`

Overlay DOM plein écran (`position: absolute; inset: 0`).

**Structure HTML :**
```
#menu-overlay
  ├── #menu-header        (titre + bouton Combattre)
  └── #menu-body
        ├── #menu-character  (portrait héros, niveau, HP, prochain ennemi)
        ├── #menu-equipment  (5 slots drag-target)
        └── #menu-stats-inv  (stats calculées + grille inventaire 4×3)
```

**Rendu des stats :** affiche la valeur de base + le bonus d'équipement en vert (`+6`). Si aucun bonus, pas de mention.

**Bouton "⚔ Combattre !" :**
- Dispatche `window.dispatchEvent(new CustomEvent('start-battle'))`
- `MenuScene` reçoit et lance `BattleScene`

**Overlay récompense (`showLoot`) :**
- Fond semi-transparent par-dessus le menu
- Affiche l'icône de l'item, son nom, sa rareté (couleur) et ses stats
- Bouton "Continuer" pour fermer l'overlay
- L'item est déjà ajouté à `PlayerState.inventory` avant l'affichage

---

## 5. Drag & Drop (HTML5 natif)

- Items d'inventaire : `draggable="true"`, `data-item-id`, `data-slot-type`
- Slots d'équipement : `data-slot`, `data-accepts` (type de slot autorisé)
  - Exception : les deux slots accessoire acceptent tous les items de type `accessory`
- **dragstart** : stocke `itemId` dans `dataTransfer`
- **dragover** : `preventDefault()` si le type correspond au slot (`data-accepts`)
- **drop** : appelle `PlayerState.equip(itemId, slot)` → re-render
- Si le slot était occupé, l'ancien item est retourné automatiquement dans l'inventaire (géré par `PlayerState.equip`)
- Highlight visuel du slot cible pendant le survol (`dragover` → ajouter classe `.drag-over`)

---

## 6. Intégration dans `BattleState`

`BattleScene.create()` lit `window.playerState` directement et le passe à `BattleState` :

```js
// Dans BattleScene.create()
this._state = new BattleState(window.playerState ?? null);
```

Le constructeur reçoit en option un `PlayerState` :

```js
constructor(playerState = null) {
  const stats = playerState ? playerState.computedStats() : null;
  this.heroMaxHp  = stats?.hp  ?? 100;
  this.heroHp     = this.heroMaxHp;
  this._heroAtk   = stats?.atk ?? 18;
  this._heroDef   = stats?.def ?? 0;
  this._heroSpd   = stats?.spd ?? 8;
  this._heroLck   = stats?.lck ?? 5;
  // goblin stats inchangées
  this.goblinHp    = 80;
  this.goblinMaxHp = 80;
  // ... reste identique
}
```

**Formules modifiées :**

| Action | Formule |
|---|---|
| Attaque héros | `(this._heroAtk + rand 0–8) × (crit ? 1.5 : 1)` arrondi |
| Chance critique | `this._heroLck × 2 / 100` |
| Réduction dégâts gobelin | `damage × (1 − def/(def+20))` |
| Esquive | `Math.random() < max(0, spd−8) × 0.01` → annule le tour gobelin |

Sans `PlayerState`, `BattleState` utilise les valeurs par défaut (rétrocompat tests).

---

## 7. Système de drops

Après une victoire dans `BattleScene` :
1. Tirer une rareté selon `DROP_WEIGHTS` (60/30/10)
2. Filtrer les items du catalogue correspondant à cette rareté et non déjà possédés
3. Si la liste est vide (tout possédé à cette rareté), descendre à la rareté inférieure
4. Choisir aléatoirement parmi les candidats
5. Appeler `playerState.addToInventory(itemId)`
6. Lancer `MenuScene` avec `{ loot: itemId }`

---

## 8. Transitions de scène

| Transition | Déclencheur | Action |
|---|---|---|
| Menu → Bataille | Bouton "Combattre !" | `scene.start('BattleScene')` |
| Bataille → Menu (victoire) | `battle-end` winner='hero' | `scene.start('MenuScene', { loot })` |
| Bataille → Menu (défaite) | Bouton "Retour au menu" ajouté dans `#end-overlay` | `scene.start('MenuScene')` |

Le bouton "Rejouer" existant reste fonctionnel (restart BattleScene sans passer par le menu). Le bouton "Retour au menu" est ajouté à côté dans `index.html` et géré par `BattleUI`.

---

## 9. Ce qui ne change pas

- `BattleScene.js` : logique d'animation, goblin AI, compétences héros — inchangées
- `BattleUI.js` : inchangé
- Sprites et animations : inchangés
- Tests `battle-state.test.html` : compatibles (constructeur sans args = comportement actuel)
