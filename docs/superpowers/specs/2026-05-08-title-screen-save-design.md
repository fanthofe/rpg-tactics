# RPG Tactics — Écran titre & Système de sauvegarde

**Date:** 2026-05-08
**Scope:** TitleScene, sauvegarde localStorage, bouton retour au menu
**Status:** Approuvé

---

## 1. Écran titre (`TitleScene`)

Scène Phaser canvas programmatique, même ambiance visuelle que les autres scènes (fond sombre dégradé violet-noir, étoiles).

### Contenu centré

- Titre **RPG TACTICS** — Russo One, grand format, couleur `#A78BFA`, glow violet
- Sous-titre *Voyage à travers les clans* — Chakra Petch, 13px, `#64748B`
- Bouton **Nouvelle partie** — toujours visible, style bouton principal violet
- Bouton **Continuer** — visible si `PlayerState.tryLoad() !== null`, sinon grisé avec texte *Aucune sauvegarde* et `cursor: default`

### Comportement des boutons

- **Nouvelle partie** : appelle `playerState.resetProgress()`, `playerState.save()`, puis `scene.start('WorldMapScene')`
- **Continuer** : appelle `PlayerState.tryLoad()`, restaure l'état dans `window.playerState`, puis `scene.start('WorldMapScene')`

### Boutons HTML vs canvas

Les boutons sont des éléments HTML superposés au canvas (même pattern que le panneau village et le bouton ⚙). Un `<div id="title-screen">` overlay est ajouté dans `index.html`, visible uniquement pendant `TitleScene`.

---

## 2. Système de sauvegarde

### Clé localStorage

`rpg-tactics-save`

### Format JSON sauvegardé

```json
{
  "level": 3,
  "exp": 12,
  "baseStats": { "hp": 79, "atk": 14, "def": 1, "spd": 8, "lck": 4 },
  "clearedVillages": ["hameau", "foret"],
  "currentVillage": "foret",
  "inventory": ["sword-iron", "armor-leather", "helmet-iron"],
  "equipped": {
    "weapon": "sword-iron",
    "armor": null,
    "helmet": null,
    "accessory1": null,
    "accessory2": null
  }
}
```

`clearedVillages` est un `Set` en mémoire, sérialisé en tableau JSON et restauré en `new Set(array)`.

### Méthodes sur `PlayerState`

```js
save() {
  const data = {
    level: this.level,
    exp: this.exp,
    baseStats: { ...this.baseStats },
    clearedVillages: [...this.clearedVillages],
    currentVillage: this.currentVillage,
    inventory: [...this.inventory],
    equipped: { ...this.equipped },
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
  this.level           = data.level ?? 1;
  this.exp             = data.exp ?? 0;
  this.baseStats       = { ...data.baseStats };
  this.clearedVillages = new Set(data.clearedVillages ?? []);
  this.currentVillage  = data.currentVillage ?? MAP_START;
  this.inventory       = data.inventory ?? ['sword-iron', 'armor-leather', 'helmet-iron'];
  this.equipped        = { ...data.equipped };
}
```

### Points d'auto-save

| Méthode | Condition |
|---------|-----------|
| `clearVillage(id)` | Toujours |
| `gainExp(amount)` | Uniquement si level-up (`leveled === true`) |
| `equip(itemId, slot)` | Toujours |
| `unequip(slot)` | Toujours |

---

## 3. Bouton "Menu" sur la carte du monde

Bouton fixe en bas-droite de `WorldMapScene` (symétrique au bouton ⚙ en bas-gauche).

- Libellé : **⟵ Menu**
- Au clic : overlay de confirmation inline (*"Retourner au menu ? La progression est sauvegardée."*) avec deux boutons **Oui** / **Non**
- Confirmation → `scene.start('TitleScene')`

Même style CSS que `#btn-map-equip`.

---

## 4. Flux complet

```
TitleScene
├── "Nouvelle partie" → resetProgress() + save() → WorldMapScene
└── "Continuer"       → loadFromData(tryLoad()) → WorldMapScene

WorldMapScene
└── "⟵ Menu" → confirmation → TitleScene

BattleScene (auto-save)
└── village-cleared → clearVillage() → save() automatique
```

---

## 5. Fichiers concernés

| Fichier | Action |
|---------|--------|
| `scenes/TitleScene.js` | Nouveau |
| `battle/PlayerState.js` | Ajout `save()`, `static tryLoad()`, `loadFromData()`, auto-save dans `clearVillage/gainExp/equip/unequip` |
| `game.js` | `TitleScene` en première scène de la liste |
| `index.html` | Ajout `#title-screen` overlay + CSS |
| `scenes/WorldMapScene.js` | Ajout bouton "⟵ Menu" + overlay confirmation |
