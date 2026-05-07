# RPG Tactics — World Map & Village System

**Date:** 2026-05-07
**Scope:** WorldMapScene, village navigation (Mario World style), hero stat rebalance
**Status:** Approved

---

## 1. Hero Stat Rebalance

Base stats in `PlayerState` reduced to make combat meaningful at level 1:

| Stat | Before | After |
|------|--------|-------|
| HP   | 100    | 55    |
| ATK  | 18     | 10    |
| DEF  | 0      | 0     |
| SPD  | 8      | 6     |
| LCK  | 5      | 3     |

Level-up gains (`STAT_GAINS` in `battle/levels.js`) remain unchanged.

---

## 2. Architecture

### Game Flow

```
WorldMapScene  ←──────────────────────────────────────┐
    │                                                   │
    │  clic nœud débloqué                               │
    ▼                                                   │
[panneau village] ── "Combattre" ──► BattleScene ──────┘
    │                                (enchaîne N combats du village)
    │  bouton ⚙
    ▼
[overlay équipement / MenuUI]
```

- `WorldMapScene` remplace `MenuScene` comme scène centrale permanente.
- `MenuScene` est supprimée.
- Après victoire ou défaite dans `BattleScene`, retour à `WorldMapScene`.
- L'équipement est accessible via un bouton `⚙` permanent sur la carte.

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `scenes/WorldMapScene.js` | Nouveau — carte, nœuds, navigation, panneaux |
| `battle/villages.js` | Nouveau — données des 10 villages |
| `battle/enemies.js` | Étendu — nouveaux ennemis (phases 2 & 3) |
| `battle/PlayerState.js` | Modifié — remplace `battleIndex`/`BATTLE_SEQUENCE` par `clearedVillages`, `currentVillage`, stat rebalance |
| `scenes/MenuScene.js` | Supprimé |
| `game.js` | Modifié — scène de départ = `WorldMapScene` |
| `ui/MenuUI.js` | Réutilisé tel quel comme overlay équipement |

---

## 3. Village Data (`battle/villages.js`)

### Structure d'un village

```js
{
  id: 'foret',
  name: 'Forêt gobeline',
  icon: '👺',
  pos: { x: 185, y: 225 },     // position sur la carte 800×450
  diff: 2,                      // 1–10, affiché en étoiles
  unlocked: false,              // true uniquement pour 'hameau' au départ
  battles: ['goblin', 'goblin', 'orc'],  // IDs dans enemies.js
  connections: ['plage', 'mine'],        // nœuds adjacents déblocables
}
```

### Carte complète

| ID | Nom | Pos | Diff | Combats | Connecté à |
|----|-----|-----|------|---------|------------|
| `hameau` | Hameau | (80, 225) | 1 | goblin, goblin | foret |
| `foret` | Forêt gobeline | (185, 225) | 2 | goblin, goblin, orc | plage, mine |
| `mine` | Mine ★ | (185, 115) | 2 | cave_dwarf, cave_troll | — (dead end) |
| `plage` | Plage pirate | (290, 225) | 3 | pirate_grunt, pirate_captain | temple |
| `temple` | Temple maudit | (395, 225) | 4 | witch, cursed_knight | jungle |
| `jungle` | Jungle | (500, 225) | 5 | gnolls, gnolls, jungle_beast | glacier |
| `glacier` | Glacier | (605, 225) | 6 | frost_troll, ice_witch | catacombes |
| `catacombes` | Catacombes | (710, 225) | 7 | skeleton, lich, shadowLord | cite, chateau |
| `chateau` | Château hanté ★ | (710, 115) | 7 | ghost_knight, vampire | — (dead end) |
| `cite` | Cité des Démons | (710, 340) | 10 | demon_warrior, demon_lord | — (final) |

★ = branches optionnelles (dead end, loot bonus)

### Progression (PlayerState)

```js
this.clearedVillages = new Set();   // IDs des villages terminés
this.currentVillage  = 'hameau';    // village sélectionné
```

Un village se débloque quand tous ses `connections` parents sont dans `clearedVillages`. `hameau` est `unlocked: true` par défaut.

---

## 4. WorldMapScene

### Fond (canvas programmatique Phaser)

Biomes dessinés par zone, de gauche à droite :
- **Zones vertes** (Hameau, Forêt, Mine) — herbe, arbres
- **Zone bleue** (Plage) — côte, mer
- **Zones ocre** (Temple, Jungle) — terre, dense
- **Zone blanche** (Glacier) — glace, neige
- **Zones sombres** (Catacombes, Château, Cité) — nuit, ombres violettes

### Nœuds

Cercle 40px avec emoji centré + label en dessous. Trois états :

| État | Visuel |
|------|--------|
| Débloqué | fond bleu `#0d2e5a`, bordure `#4a8aff`, glow faible |
| Actuel (héros ici) | fond violet `#2a0d6a`, bordure `#a064ff`, glow fort + pulsation |
| Verrouillé | fond gris `#111122`, bordure `#2a2a3a`, alpha 0.5 |

### Chemins

Lignes droites entre nœuds connectés. Segments débloqués = trait plein ; verrouillés = pointillés `[5, 4]`. Couleur : `#4a8aff` débloqué, `#2a3855` verrouillé.

### Navigation au clic

1. Joueur clique sur un nœud **débloqué** directement connecté au nœud actuel (adjacence définie par `connections`).
2. Le sprite héros (32px) se déplace nœud par nœud le long du chemin, **300 ms par segment**, ease `Sine.easeInOut`.
3. À l'arrivée, `currentVillage` est mis à jour et le panneau village s'ouvre.
4. Cliquer sur un nœud non adjacent ou verrouillé = pas de réaction (pas d'erreur affichée).
5. Les villages **terminés** restent navigables et rejouables (pour le loot bonus).

### Panneau village (overlay HTML)

S'affiche à la sélection d'un nœud. Contenu :
- Nom du village + icône
- Barre de difficulté (★ étoiles colorées)
- Liste des ennemis (`N combats`)
- Statut : `Terminé ✓` si dans `clearedVillages`, sinon bouton **Combattre**
- Bouton **Fermer**

### Bouton ⚙ Équipement

Fixe, bas-gauche de l'écran. Ouvre l'overlay `MenuUI` existant (aucune modification de `MenuUI`).

---

## 5. Intégration BattleScene

`BattleScene` est lancée avec `{ villageId }` en données. Elle lit `VILLAGES[villageId].battles` et enchaîne les combats dans l'ordre (remplace l'actuel `BATTLE_SEQUENCE` linéaire).

Après le dernier combat du village (victoire) :
- `playerState.clearedVillages.add(villageId)`
- Retour à `WorldMapScene` avec `{ clearedVillage: villageId, loot }`

Après défaite : retour à `WorldMapScene` sans modifier `clearedVillages`.

---

## 6. Plan d'implémentation par phases

### Phase 1 — Fondations (ce sprint)
- Rebalance stats héros (`PlayerState`)
- `battle/villages.js` — 10 villages définis (placeholders pour ennemis manquants)
- `WorldMapScene` complet (fond, nœuds, chemins, navigation, panneaux)
- Villages jouables : **Hameau** et **Forêt** (utilisent les sprites existants)
- Suppression de `MenuScene`, mise à jour de `game.js`
- `BattleScene` adapté pour lire `villageId` au lieu de `BATTLE_SEQUENCE`

### Phase 2 — Ennemis zones 1–5
Nouveaux sprites canvas : `cave_dwarf`, `cave_troll`, `pirate_grunt`, `pirate_captain`, `cursed_knight`, `jungle_beast`
Villages jouables : Mine, Plage, Temple, Jungle

### Phase 3 — Ennemis zones 6–10
Nouveaux sprites canvas : `frost_troll`, `ice_witch`, `skeleton`, `lich`, `ghost_knight`, `vampire`, `demon_warrior`, `demon_lord`
Villages jouables : Glacier, Catacombes, Château, Cité des Démons
