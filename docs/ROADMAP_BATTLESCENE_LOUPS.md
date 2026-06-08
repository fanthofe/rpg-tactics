# Roadmap — BattleScene Meute de Loups

> Refonte complète du système de combat pour implémenter le lore de LORE_LOUPS.md.
> L'actuelle BattleScene est un système héros unique vs ennemis → elle devient une scène meute à 3 loups.

---

## État des lieux

### Ce qui existe et sera réutilisé
- Infrastructure Phaser 3 (scènes, animations, sprites procéduraux)
- Système de sauvegarde localStorage
- WorldMapScene et enchaînement des villages
- Générateur de sprites canvas (à étendre pour les loups)
- Boucle d'événements `player-action` / `battle-message` / `battle-end`

### Ce qui sera remplacé ou profondément refactorisé

| Fichier actuel | Devient |
|---|---|
| `battle/BattleState.js` (héros solo) | `battle/PackState.js` (meute 3 loups) |
| `battle/PlayerState.js` (1 perso, 5 slots génériques) | `battle/WolfState.js` (Kael/Sûra/Vael, slots lore) |
| `scenes/BattleScene.js` (layout héros centré) | Refonte complète (3 persos + formation + jauges) |
| `battle/enemies.js` (gobelins/orcs/etc.) | Ajout des Hurlevides et boss loups |
| `ui/BattleUI.js` | Nouveau UI : formation picker, jauges, combos |

---

## Vue d'ensemble des phases

```
Phase 0 — Fondations          (prérequis technique, aucune UI)
Phase 1 — Combat MVP meute    (3 loups qui se battent)
Phase 2 — Jauges & Skills     (CA / MC / JC + compétences individuelles)
Phase 3 — Combos de meute     (2-loups + 3-loups)
Phase 4 — Liens & Corruption  (jauges de cohésion, influence de Vorgäss)
Phase 5 — Hurlevides & Boss   (nouveaux ennemis + affinité boss)
Phase 6 — Progression         (charges d'évolution + équipement lore)
Phase 7 — Formes ultimes      (transformations + combos ultra)
Phase 8 — Narration           (moments narratifs → déblocages mécaniques)
```

---

## Phase 0 — Fondations techniques

> Objectif : poser les structures de données sans toucher à la BattleScene existante.

### 0.1 — `battle/WolfData.js` (nouveau)

Définitions statiques des 3 loups — stats de base L1, position naturelle, palette sprite.

```js
export const WOLVES = {
  kael: { name: 'Kael', naturalPos: 'alpha', baseHp: 120, baseAtk: 22, baseDef: 8,  baseSpd: 7  },
  sura: { name: 'Sûra', naturalPos: 'beta',  baseHp: 100, baseAtk: 28, baseDef: 5,  baseSpd: 12 },
  vael: { name: 'Vael', naturalPos: 'omega', baseHp: 90,  baseAtk: 20, baseDef: 4,  baseSpd: 10 },
}
```

### 0.2 — `battle/PackState.js` (remplace BattleState)

État complet de la meute pour un combat :

```js
packState = {
  wolves: {
    kael: { hp, maxHp, gauge: { ca: 0, maxCa: 5 }, statuses: [], alive: true },
    sura: { hp, maxHp, gauge: { mc: 0, maxMc: 4 }, statuses: [], alive: true },
    vael: { hp, maxHp, gauge: { jc: 0 },           statuses: [], alive: true },
  },
  formation: { alpha: 'kael', beta: 'sura', omega: 'vael' },
  bonds: { kaelSura: 0, kaelVael: 0, suraVael: 0 }, // 0-100 chacun
  turnOrder: ['alpha', 'beta', 'omega'],
  currentTurnIndex: 0,
  enemy: { ... } // compatible avec enemies.js existant
}
```

### 0.3 — `battle/WolfState.js` (remplace PlayerState)

Persistance entre les combats :
- HP conservés entre zones (repos = récupère 30-70%)
- Jauges conservées à 50% entre combats (LORE_LOUPS §15 schéma 6)
- Niveau + XP indépendants par loup
- 5 slots d'équipement lore par loup (Signe, Collier, Marque, Naturel, Trophée)
- Compteur de charges d'évolution par skill

### 0.4 — `assets/wolfSprites.js` (nouveau)

Sprites procéduraux pour les 3 loups — même technique que sprites.js existant.

| Loup | Palette | Détails |
|---|---|---|
| Kael | Blanc-neige, bandes charbon | Yeux ambre → bleu glaciaire quand il canalise |
| Sûra | Charbon profond, reflets brun-rouille | Encoche oreille gauche, posture basse |
| Vael | Gris pâle argenté | Hétérochromie : œil droit ambre, œil gauche blanc translucide |

Animations à couvrir : `idle`, `attack`, `defend`, `skill`, `combo` (subset léger au départ).

---

## Phase 1 — Combat MVP meute

> Objectif : 3 loups qui jouent à tour de rôle contre un ennemi. Fonctionnel, pas encore fancy.

### 1.1 — Écran de sélection de formation

Nouvelle étape entre WorldMapScene → BattleScene :

```
┌──────────────────────────────────┐
│  CHOIX DE FORMATION              │
│                                  │
│  Alpha  [Kael ▼]  → 1er tour    │
│  Beta   [Sûra ▼]  → 2e tour     │
│  Omega  [Vael ▼]  → 3e tour     │
│                                  │
│  ⚠ Kael hors de sa position :   │
│    En Beta → frappe précise      │
│                                  │
│  [COMBATTRE]                     │
└──────────────────────────────────┘
```

- Swap entre positions par click
- Tooltip : bonus de position naturelle + effet hors-position
- La dernière formation choisie est mémorisée

### 1.2 — Layout BattleScene refonte

```
┌────────────────────────────────────────────────────────────┐
│  ALPHA       BETA       OMEGA          ENNEMI              │
│  [Kael]     [Sûra]     [Vael]         [Hurlevide]         │
│   HP ████    HP ████    HP ████         HP ████████        │
│   CA ○○○○    MC ○○○○    JC ≈≈≈≈                           │
│────────────────────────────────────────────────────────────│
│  Tour de : KAEL (Alpha)                                    │
│  [ATTAQUE]  [COMPÉTENCE ▼]  [COMBO ▼]  [DÉFENDRE]         │
└────────────────────────────────────────────────────────────┘
```

- 3 sprites loups à gauche (positions alpha / beta / omega)
- 1 sprite ennemi à droite
- Barre HP + jauge ressource par loup
- Panel d'actions qui change selon le loup actif

### 1.3 — Boucle de tour — ATB (Active Time Battle, style FF7 PS1)

Le temps s'écoule en temps réel. Chaque combattant a une **jauge ATB** qui se remplit en continu selon sa vitesse. Quand elle est pleine, le combattant est prêt à agir.

#### Jauge ATB

```
┌─────────────────────────────────────────────────────────────┐
│  Kael  [████████████░░░░░░░░]  60%   SPD 7  → remplissage lent   │
│  Sûra  [██████████████░░░░░░]  70%   SPD 10 → remplissage moyen  │
│  Vael  [████████████████████]  PRÊT  SPD 12 → remplissage rapide │
│                                                               │
│  Ennemi[████░░░░░░░░░░░░░░░░]  20%   selon SPD ennemi         │
└─────────────────────────────────────────────────────────────┘
```

- La jauge se remplit à une vitesse proportionnelle au `SPD` du combattant
- Vael est le plus rapide de la meute, Kael le plus lent — Sûra au milieu
- La vitesse de l'ennemi dépend de sa fiche dans `enemies.js` (certains ennemis sont plus rapides que les loups)
- Quand la jauge ATB d'un combattant est pleine → il agit immédiatement ou le joueur peut le commander
- **Le temps ne se fige jamais** : les autres jauges continuent de se remplir même pendant qu'un loup est en train d'agir (mode Active pur)

#### Changement de loup actif (sélection manuelle)

Plusieurs loups peuvent avoir la jauge pleine en même temps. Le joueur choisit lequel commander :

- **Tab** (ou bouton dédié) : cycle entre les loups dont la jauge ATB est pleine
- Le portrait du loup sélectionné est mis en surbrillance, le panel d'actions affiche ses options
- Les autres loups "prêts" restent en attente avec leur jauge pleine — ils ne perdent pas leur tour
- **Le temps continue** pendant la navigation dans le menu : si le joueur tarde, l'ennemi peut agir entre deux actions de loups
- La pression temporelle est réelle — choisir vite fait partie du gameplay

```
Situation exemple :
  Vael ATB pleine → panel Vael affiché
  Pendant que le joueur ouvre le menu compétences de Vael → Kael ATB continue de monter
  [Tab] → panel Kael affiché (Kael aussi prêt entretemps)
  Pendant ce temps → l'ennemi atteint ATB pleine → il attaque immédiatement
  Joueur agit avec Vael → Vael ATB se remet à 0, les autres jauges continuent
```

#### Ordre d'initiative et formation

La formation (Alpha / Beta / Omega) **n'impose plus d'ordre fixe** — elle définit les rôles et les combos. L'ordre réel dépend du SPD de chaque loup dans sa position.

Bonus de vitesse ATB selon la position :
- Loup en **position naturelle** → vitesse ATB ×1.2 (bonus de confort)
- Loup hors position → vitesse ATB normale

#### Changement de formation en cours de combat

Le joueur peut **réassigner les positions** en cours de combat après un cooldown :

- Cooldown initial : **25 secondes** à partir du début du combat
- Après chaque changement : nouveau cooldown de **25 secondes**
- Pendant le changement : temps figé, même interface que le formation picker pré-combat
- Raccourci : **F** (ou bouton [FORMATION] visible dans l'UI)

```
┌──────────────────────────────┐
│  RÉASSIGNER LA FORMATION     │
│  (cooldown : 18s restantes)  │  ← bouton grisé avec timer
│                              │
│  [F]  FORMATION              │  ← bouton actif quand disponible
└──────────────────────────────┘
```

Contrainte : un loup dont la jauge ATB est pleine au moment du changement **garde sa jauge** — le changement de formation ne consomme pas ses ATB.

#### Règles générales

- Attaque de base : dégâts selon ATK du loup vs DEF ennemie, +1 à la jauge ressource du loup (CA/MC/JC)
- Défendre : −50% dégâts reçus jusqu'au prochain tour du loup, ATB se remplit 1.5× plus vite pendant la défense
- Loup à 0 HP : sa jauge ATB disparaît, il ne joue plus (mort en combat ≠ retraite)
- Victoire : tous les ennemis à 0 HP
- Défaite : les 3 loups à 0 HP

### 1.4 — Expérience en temps réel

L'XP n'est pas distribuée en fin de combat. Elle est **assimilée immédiatement à la mort de chaque ennemi**.

#### Principe de répartition

Chaque loup reçoit une part d'XP proportionnelle aux **dégâts qu'il a infligés à cet ennemi spécifique** (pas à l'ensemble du combat).

```
Exemple — Hurlevide Errant (100 HP)

  Kael a infligé   40 dégâts  →  40% de l'XP de base
  Sûra a infligé   45 dégâts  →  45% de l'XP de base
  Vael a infligé   15 dégâts  →  15% de l'XP de base

  XP de base de l'ennemi : 80 XP

  Kael reçoit  32 XP
  Sûra reçoit  36 XP
  Vael reçoit  12 XP  ← + bonus car coup de grâce
```

Un loup qui n'a **pas attaqué cet ennemi** ne reçoit rien — même s'il a attaqué d'autres ennemis dans le même combat.

#### Bonus de coup de grâce

Le loup qui porte le coup fatal reçoit deux bonus supplémentaires :

| Bonus | Valeur |
|---|---|
| **XP bonus** | +25% de l'XP de base de l'ennemi (indépendant de la part proportionnelle) |
| **Charges de compétence temporaires** | +1 charge sur la jauge ressource du loup (CA / MC / JC) pour le reste du combat uniquement |

Les charges temporaires du coup de grâce ne persistent pas après le combat — elles sont une récompense d'impulsion pour finir vite et bien.

#### Affichage

- À la mort de l'ennemi : chaque loup affiche un petit +XP flottant au-dessus de son portrait (proportionnel à sa part)
- Le tueur affiche en plus un indicateur distinct `[COUP DE GRÂCE +XP +CHARGE]`
- Les montées de niveau se déclenchent immédiatement si le seuil est atteint, avec une courte animation non bloquante (le combat continue en ATB pendant le level-up)
- **À chaque level-up : les HP du loup sont restaurés à 100%** — récompense immédiate visible en combat, incite à finir les ennemis avec le bon loup

#### Lien avec le système d'affinité boss (Phase 5)

Pour les boss, la logique de coup de grâce s'applique aussi mais avec des récompenses différentes (charges d'évolution permanentes, trophées) — décrit en Phase 5.3. Les deux systèmes coexistent : XP proportionnelle = toujours active, affinité boss = couche supplémentaire sur les boss uniquement.

---

## Phase 2 — Jauges et compétences individuelles

> Objectif : chaque loup a sa propre ressource et son kit de skills.

### 2.1 — Charge Ancestrale (CA) — Kael

Jauge 0-5. Aura bleu glaciaire, tracés géométriques.

| Événement | Variation |
|---|---|
| Attaque de base | +1 CA |
| Protège un allié (Abri) | +1 CA |
| Absorbe un coup | +1 CA |
| Influence de Vorgäss | −1 CA |

| Skill | Coût | Effet | Débloqué |
|---|---|---|---|
| Frappe de Meute | 0 CA | ATK + bonus si un allié a attaqué ce tour | Départ |
| Griffe Runique | 1 CA | Ignore 30% DEF ennemie | Départ |
| Abri des Crêtes | 1 CA | Absorbe les dégâts pour un allié ce tour | Niveau 4 |
| Mémoire du Clan | 2 CA | Invoque ancêtre aléatoire — buff toujours positif | Niveau 7 |
| Rugissement du Chef | 2 CA | ATK meute +25% pendant 2 tours | Avoir joué Alpha sur un boss |
| Lien de Sang | 2 CA | Égalise les HP entre Kael et un allié | 2 charges d'affinité |
| Frappe des Esprits | 3 CA | Dégâts spirituels + brise les défenses Hurlevides | 4 charges d'affinité |
| Incarnation | 5 CA | Forme Loup-Garou 3 tours *(prérequis : jauges de lien max)* | Fin Acte III |

### 2.2 — Marques de Chasse (MC) — Sûra

Jauge 0-4. Aura ambre électrique, ondulations. 4 MC = attaque suivante amplifiée.

| Événement | Variation |
|---|---|
| Inflige des dégâts | +1 MC |
| Applique un débuff | +1 MC |
| Esquive | +2 MC |
| Aucun dégât pendant 3 tours | −tout |

| Skill | Coût | Effet | Débloqué |
|---|---|---|---|
| Traque | 0 | ATK + saignement −8 HP/tour pendant 3 tours | Départ |
| Flanc Rapide | 1 MC | Bonus dégâts si l'ennemi a déjà un débuff actif | Départ |
| Pas d'Ombre | 0 | Esquive tout ce tour + contre-attaque | Niveau 5 |
| Venin des Torrents | 2 MC | Poison + saignement simultanément | Vaincre La Reine des Rapides |
| Marquage | 2 MC | ATK ennemie −30%, 3 tours + bloque capacités spéciales | Vaincre La Louve Bannie |
| Frénésie de Chasse | 3 MC | 2 tours : chaque attaque frappe 2x, sans pouvoir se défendre | 2 charges d'affinité |
| Rugissement de Bannie | 4 MC | Stun 1 tour + ATK −40% les 2 tours suivants | 3 charges d'affinité |
| Dominance | 4 MC | Forme Super Alpha 3 tours *(prérequis : boss mené en Alpha)* | Fin Acte III |

### 2.3 — Jauge du Seuil (JC) — Vael (bidirectionnelle)

Curseur 0-100 représentant la corruption. Détermine quel kit est actif.

```
0 ──────────[40]──────────[60]──────────── 100
  Esprit pur  Zone neutre  Corruption active  Hurlevide
```

| Événement | Variation |
|---|---|
| Skill Hurlevide (Morsure Corrompue) | +10 JC |
| Skill Esprit (Drain d'Âme) | −15 JC |
| Cohésion de meute haute (bonds élevés) | −2 JC/tour |
| Influence de Vorgäss | +5 JC |

- JC < 40% → aura argent-vert, skills Esprit disponibles
- JC > 60% → aura violet pulsant, skills Hurlevide actifs, Vorgäss peut l'influencer
- JC = 100% → Vael bascule : attaque n'importe qui pendant 1 tour

| Skill | Coût | Effet | Condition |
|---|---|---|---|
| Regard du Seuil | 0 | Révèle HP / faiblesses / résistances ennemi | Départ |
| Morsure Corrompue | +10 JC | ATK + contamination −5% HP/tour, 3 tours | Départ |
| Pas Fantôme | 0 | Échange de position dans la formation sans perdre de tour | Niveau 4 |
| Drain d'Âme | −15 JC | Vole HP à l'ennemi | Confession narrative |
| Voile des Mondes | −20 JC | Meute immunisée aux attaques physiques ce tour | Niveau 8 |
| Possession Partielle | +25 JC | L'ennemi attaque son propre camp ce tour *(JC > 50% requis)* | 2 charges d'affinité |
| Exorcisme du Seuil | −30 JC | Détruit tous les buffs Hurlevides + dégâts massifs *(JC < 20% requis)* | 3 charges d'affinité |
| Transcendance | −JC totale | Esprit du Loup 3 tours *(prérequis : JC à 0 depuis 3 zones)* | Fin Acte III |

### 2.4 — UI du menu compétences

- Bouton [COMPÉTENCE ▼] : liste des skills du loup actif
- Skill grisé si coût non atteignable ou condition non remplie
- Tooltip : effet + coût + condition narrative si verrouillé

---

## Phase 3 — Combos de meute

> Objectif : système dual/triple tech inspiré de Chrono Trigger.

### 3.1 — Architecture

Un combo est déclenché depuis [COMBO ▼] si toutes ses conditions sont vraies au moment du clic.

```js
COMBOS = {
  tactique_clan: {
    wolves: ['kael', 'sura'],
    conditions: { kael: { position: 'alpha' }, sura: { position: 'beta' } },
    cost: { kael: 1, sura: 1 }, // CA pour Kael, MC pour Sûra
    effect: (state) => { /* neutralise + exécute */ },
  },
}
```

Le menu [COMBO ▼] ne liste que les combos dont les conditions sont actuellement vraies.

### 3.2 — Combos à 2 loups (MVP)

#### Kael + Sûra

| Nom | Conditions | Effet |
|---|---|---|
| **Tactique du Clan** | Kael Alpha, Sûra Beta | Critique garanti + saignement + ATK ennemie −20% |
| **Alliance de Sang** | L'un < 30% HP | L'autre attaque ×2, le blessé régénère 20% HP |
| **Abri et Croc** | Kael utilise Abri sur Sûra | Sûra attaque sans riposte possible, +40% dégâts |
| **Le Poids Partagé** | Déblocage narratif Acte II | Dégâts proportionnels aux HP perdus dans ce combat |
| **Rage et Raison** | Sûra en Frénésie + Kael 2 CA | Dégâts ×2.5, Sûra conserve sa défense |

#### Kael + Vael

| Nom | Conditions | Effet |
|---|---|---|
| **Signal Ancestral** | Vael Regard du Seuil puis Kael attaque | Ignore toutes défenses + 50% chance stun |
| **Pont des Mondes** | 2 CA + JC < 40% | Ancêtre invoqué attaque physiquement 2 tours |
| **Sceau du Père** | Boss Hurlevide uniquement | Supprime tous effets de corruption + dégâts Hurlevides |
| **Héritage Brisé** | Après la confession narrative | Attaque combinée + immunité peur/stun 3 tours |
| **Lune et Cendre** | Kael Loup-Garou + Vael JC 0 | Double phase physique + spirituelle, ignore immunités |

#### Sûra + Vael

| Nom | Conditions | Effet |
|---|---|---|
| **Harcèlement Spectral** | Sûra Traque + Vael Morsure Corrompue | Double frappe physique et spirituelle simultanée |
| **Relais de Prédateurs** | Sûra attaque (esquivée ou non) | Vael contre-attaque depuis le monde des esprits — inévitable |
| **Ombre et Croc** | Vael Voile des Mondes + Sûra | Sûra attaque depuis l'esprit — multiplicateur surprise, pas de riposte |
| **Ce Qu'On Refuse** | Narratif Acte III | Détruit le statut "immunisé" de n'importe quel ennemi |
| **Venin du Seuil** | Sûra Venin + Vael JC > 50% | Empoisonnement amplifié qui affecte aussi les entités spirituelles |

### 3.3 — Combos à 3 loups

#### Cohésion

| Nom | Positions | Effet |
|---|---|---|
| **Formation Naturelle** | Kael Alpha, Sûra Beta, Vael Omega | +20% stats meute 3 tours + recharge partielle des jauges |
| **Hurlement Coordonné** | 3 loups en vie — 1x/combat | Dégâts de zone + peur 2 tours sur tous les ennemis |
| **Meute Inversée** | Vael Alpha, Sûra Beta, Kael Omega | L'ennemi passe son prochain tour |
| **Relais Total** | AUTO — loup tombe à 0 HP | Les 2 survivants agissent hors tour + regagnent 15% HP |

#### Narratifs (débloqués en cours de partie)

| Nom | Condition | Effet |
|---|---|---|
| **Les Trois Fils** | Fin Acte II — révélation sur Vorgäss | Dégâts ×3 + perce toutes les résistances |
| **Ce Que Skövann Gardait** | Premier retour à Skövann corrompu | Purge la corruption — Hurlevides −50% ATK pour le reste du combat |
| **La Meute Impossible** | Tous les combos à 2 débloqués | Les 3 attaquent comme si chacun était en position avantageuse |

### 3.4 — UI des combos

- Glow sur les portraits des loups concernés quand un combo est disponible
- Résolution animée : loups se déplacent ensemble vers la cible, regagnent leurs positions
- Message en haut de l'écran : nom du combo + bref effet

---

## Phase 4 — Liens de meute et Corruption de Vael

> Objectif : les relations entre loups ont un impact mécanique réel.

### 4.1 — Jauges de lien (bonds)

Trois liens persistants entre zones : `kaelSura`, `kaelVael`, `suraVael` — valeur 0-100.

| Événement | Lien concerné | Gain |
|---|---|---|
| Victoire, les 2 en vie | Les 2 paires impliquées | +5 |
| Combo déclenché ensemble | Les 2 loups du combo | +10 |
| Kael utilise Abri sur un allié | Kael ↔ protégé | +15 |
| Moment narratif clé | Variable | +20 |
| Loup tombe à 0 HP sans aide | Toutes paires | −5 |

**Impact :**
- Lien > 50% : combos de la paire débloqués
- Lien > 75% : combos de la paire infligent +15% dégâts
- 3 liens = 100 : transformation de Kael accessible

Affiché entre les combats (pas en combat — 3 petites barres dans l'écran de formation).

### 4.2 — Influence de Vorgäss

Active quand JC de Vael > 60%. Se déclenche pendant le tour ennemi :
- Fausse information sur l'ennemi (HP affichés incorrects pendant 1 tour)
- Vael perd son prochain tour
- +5 JC supplémentaire

Débloqué narrativement après le tournant de l'Acte II.

### 4.3 — Relais Total (auto-combo défensif)

Quand un loup descend à 0 HP :
1. Animation de chute du loup
2. Les 2 survivants gagnent immédiatement un tour bonus
3. Chacun récupère 15% HP max
4. Le loup est marqué `alive: false` — ne joue plus mais les liens avec lui restent actifs

---

## Phase 5 — Ennemis Hurlevides et boss

> Objectif : les vrais ennemis thématiques du jeu.

### 5.1 — Hurlevides de base

| Ennemi | HP | Particularité | Sprite |
|---|---|---|---|
| **Hurlevide Errant** | 60 | Hurlement creux → peur (skip prochain tour d'un loup) | Loup corrompu, veines noires |
| **Hurlevide Traqueur** | 80 | Cible toujours le loup avec le moins de HP | Loup agile, yeux vides |
| **Hurlevide Consommateur** | 120 | Drain HP sur attaque, régénère si non tué en 3 tours | Loup corpulent, gueule ouverte |
| **Alpha Corrompu** | 200 | Boss — cible en priorité les loups hors position naturelle | Grand loup, marques inversées |

### 5.2 — Boss affinitaires

#### Acte I

| Boss | Affinité | Mécanique signature |
|---|---|---|
| **La Reine des Rapides** | Sûra | Invisible 1 tour sur 2 (attaque depuis l'eau) |
| **L'Ancien Gardien** | Kael | Utilise une version dégradée des skills ancestraux de Kael |

#### Acte II

| Boss | Affinité | Mécanique signature |
|---|---|---|
| **Le Premier Converti** | Vael | Régénère chaque tour — ne peut être tué que par une attaque de Vael |
| **La Louve Bannie** | Sûra | Plus elle perd de HP, plus elle devient forte |

#### Acte III

| Boss | Affinité | Mécanique signature |
|---|---|---|
| **Le Loup-Miroir** | Vael | Copie exactement l'action de Vael du tour précédent |
| **L'Ombre de Vorgäss** | Vael | Inaccessible si JC Vael > 60% |

#### Acte IV — Boss final

**Vorgäss** — Loup-Garou corrompu, 3 phases.
- Phase 1 : absorbe les CA de Kael — chaque charge utilisée le renforce
- Phase 2 : invoque des fragments de Hurlevides à chaque tour
- Phase 3 : attaque simultanée sur les 3 loups si la meute n'est pas en Formation Naturelle
- Accessible uniquement si les 3 formes ultimes ont été débloquées au moins une fois

### 5.3 — Système d'affinité boss

Après chaque boss tué :

```
1. Qui a porté le coup de grâce ?
     Loup affinitaire → +2 charges d'évolution (ce loup uniquement)
     Autre loup       → +1 XP meute seulement

2. Position avantageuse au moment du kill ?
     Oui → +1 charge bonus (total +3)

3. Les alliés ont-ils attaqué au tour final ?
     Non → +1 charge bonus (total max +4)
```

Conséquence de gameplay : gérer les HP du boss pour amener le bon loup au coup de grâce.

---

## Phase 6 — Progression et équipement lore

> Objectif : remplacer l'équipement générique par les 5 slots du lore.

### 6.1 — Charges d'évolution

Chaque skill évoluable a un compteur propre par loup.

```js
wolfState.kael.evolutionCharges = {
  griffe_runique: 0,  // seuil : 2 → niveau 2 / 4 → niveau 3
  abri_cretes:    0,
  appel_ancestral: 0,
}
```

Affichage dans le menu skills : `[GRIFFE RUNIQUE] ★☆☆  1/2 charges` avec preview de la prochaine évolution.

### 6.2 — Les 5 slots d'équipement lore

| Slot | Nom | Logique |
|---|---|---|
| **Tête** | Le Signe | Bonus info / intimidation / ancestral — fort impact visuel sur sprite |
| **Cou** | Le Collier | Socle + logements de talismans (1-3 selon qualité) |
| **Pelage** | La Marque de Guerre | Appliquée par un *autre* loup — lien social requis |
| **Naturel** | Griffes / Crocs | Spécifique au profil loup (dual-slot Sûra, dual-état Vael) |
| **Trophée** | Mémoire de Chasse | Drop automatique boss, forme selon coup de grâce |

**Slot Marque de Guerre — mécanique sociale :**
- Hors combat : `[Vael] applique Argile Blanche sur [Kael]`
- Auto-application impossible
- L'intensité de l'effet dépend du niveau de lien entre les deux loups

**Slot Trophée — connecté à l'affinité boss :**

| Kill normal | Kill affinitaire |
|---|---|
| Fragment générique +DEF/ATK | Objet unique avec mécanique active |
| Fragment de Gardien | Éclat du Gardien — absorbe 1 attaque/combat |
| Relique Brisée | Sceau du Converti — immunité corruption 1x/combat |

### 6.3 — Collier : système de talismans

4 types de talismans. 2 talismans compatibles dans des emplacements jumelés → fusion.

| Type | Couleur | Focus |
|---|---|---|
| Prédateur | Rouge-brun | Offensif |
| Esprit | Bleu-blanc | Ancestral / connexion |
| Lien | Vert | Synergies de meute |
| Seuil | Gris translucide | Spécifique Vael, équipable par les autres |

Fusions actives :

| Fusion | Talismans | Effet combiné |
|---|---|---|
| **Frappe Sacrée** | Prédateur + Esprit | Dégâts physiques + ignore immunités spirituelles |
| **Rage de Meute** | Lien + Prédateur | Prochain combo ignore la DEF ennemie |
| **Vision de Mort** | Seuil + Esprit | Tour 1 : tous les points faibles ennemis révélés |
| **Corruption Canalisée** | Seuil + Lien | Vael transfère 10% corruption en bonus dégâts au prochain attaquant |

---

## Phase 7 — Formes ultimes

> Objectif : les transformations sont des récompenses de cohérence de jeu, pas de puissance brute.

### 7.1 — Kael — Loup-Garou des Ancêtres

**Conditions simultanées :**
- Lien `kaelSura` = 100 ET `kaelVael` = 100
- JC de Vael < 20%
- Les 3 loups en vie
- 5 CA disponibles

**Déclenchement :** skill `Incarnation` (5 CA) — 3 tours

**Effets :** stats ×1.5, attaques combinent physique + spirituel, marquages portent les traces des alliés, chaque attaque allège la pression de Vorgäss.

**Visuel :** tracés bleu glaciaire qui se ramifient + traces ambre (Sûra) + gris translucide (Vael).

### 7.2 — Sûra — Super Alpha

**Conditions :**
- Avoir joué en Alpha lors d'au moins 1 combat de boss
- Skill `Instinct de Meute` déclenché au moins 1 fois
- 3 charges d'affinité boss de Sûra

**Déclenchement :** skill `Dominance` (4 MC) — 3 tours

**Effets :** ATK ennemie globale −20% (présence), combos lancés hors tour si allié < 25% HP, motifs tribaux blancs sur sprite.

### 7.3 — Vael — Esprit du Loup

**Conditions :**
- JC = 0 maintenu depuis 3 zones consécutives
- Avoir résisté à l'offre de Vorgäss (événement Acte III)

**Déclenchement :** skill `Transcendance` (consomme toute la JC restante) — 3 tours

**Effets :** attaque les Hurlevides depuis le monde des esprits (ignore immunités physiques), parle aux esprits piégés dans les boss (mécaniques spéciales de boss), yeux uniformément gris-blanc.

### 7.4 — Combos de formes ultimes

| Combo | Prérequis | Effet |
|---|---|---|
| **Les Trois Axes** | Kael LG + Sûra SA + Vael EL simultanément | 3 phases séquentielles — chaque phase multiplie la suivante |
| **Skövann Vivant** | Les 3 formes + retour à Skövann | Ancêtres libérés buffent toute la meute — 1x/partie |
| **Ce Pour Quoi On Est Là** | Contre Vorgäss uniquement | Ending variable selon les conditions de la meute |

---

## Phase 8 — Narration et déblocages mécaniques

> Objectif : les choix de jeu débloquent les mécaniques, pas des menus de progression arbitraires.

### 8.1 — Moments narratifs → effets mécaniques

| Moment | Trigger | Effet mécanique |
|---|---|---|
| Kael protège un allié avec Abri pour la 1ère fois | Skill Abri utilisé | Marquages s'intensifient + charge ancestrale max +1 |
| Sûra joue Alpha pour la 1ère fois | Formation choisie avec Sûra en Alpha | Skill `Instinct de Meute` débloqué |
| Vael avoue sa nature à Kael | Événement scénario Acte II | Corruption max −20% + premières synergies disponibles |
| Les 3 survivent à un boss ensemble | Boss tué, 3 loups en vie | Lien permanent +1 cran (toutes paires) |
| Vael résiste à Vorgäss | Choix de dialogue Acte III | Corruption ne peut plus dépasser 40% |
| Les 3 jauges de lien au max | Condition atteinte | Transformation de Kael accessible |
| Sûra a mené au moins 1 boss en Alpha | Condition atteinte | Super Alpha accessible |
| JC à 0 depuis 3 zones | Condition atteinte | Esprit du Loup accessible |

### 8.2 — Structure WorldMap par acte

```
Acte I — Les Ruines de Skövann
  ├── 2 zones tutoriel (formation basique, attaques simples)
  ├── Rencontre Sûra (débloque perso 2)
  ├── Rencontre Vael (débloque perso 3)
  └── Boss : La Reine des Rapides

Acte II — Les Territoires Perdus
  ├── 3 zones (découverte des jauges individuelles)
  ├── Moment : Kael découvre que ses pouvoirs nourrissent Vorgäss
  ├── Pivot : Vael avoue sa nature → déblocages mécaniques
  └── Boss : L'Ancien Gardien / La Louve Bannie

Acte III — La Traque
  ├── 3 zones (combos avancés, boss affinitaires Vael)
  ├── Vorgäss contacte Vael (choix : résister ou écouter)
  ├── Découverte du rituel final de Vorgäss
  └── Boss : Le Loup-Miroir / L'Ombre de Vorgäss

Acte IV — Retour à Skövann
  ├── 1 zone de préparation (vérification des prérequis formes ultimes)
  ├── Accès aux 3 transformations si conditions remplies
  └── Boss final : Vorgäss — 3 phases
```

---

## Ordre de développement recommandé

```
Sprint 1  Phase 0 complet (WolfData, PackState, WolfState, wolfSprites)
          Phase 1.1 (formation picker)
          Phase 1.2 + 1.3 (layout BattleScene + boucle de tour basique)

Sprint 2  Phase 2.1 + 2.2 + 2.3 (jauges CA / MC / JC)
          Phase 2.4 (menu skills)
          Phase 5.1 (Hurlevides de base)

Sprint 3  Phase 3.1 + 3.2 (combos 2-loups MVP)
          Phase 3.4 (UI combos)
          Phase 4.1 (jauges de lien basiques)

Sprint 4  Phase 3.3 (combos 3-loups)
          Phase 4.2 (influence Vorgäss)
          Phase 4.3 (Relais Total)

Sprint 5  Phase 5.2 (boss affinitaires Acte I + II)
          Phase 5.3 (système de charges)
          Phase 6.1 (charges d'évolution + UI)

Sprint 6  Phase 6.2 + 6.3 (équipement lore complet)
          Phase 5.2 (boss Acte III + IV)

Sprint 7  Phase 7.1 + 7.2 + 7.3 (formes ultimes)
          Phase 7.4 (combos ultimes)

Sprint 8  Phase 8.1 (déblocages narratifs)
          Phase 8.2 (structure WorldMap par acte)
          Tests, polish, équilibrage
```

---

## Décisions d'architecture à trancher avant Sprint 1

| Question | Options | Recommandation |
|---|---|---|
| Compatibilité ascendante ? | A — garder l'ancien mode en parallèle / B — remplacement complet | **B** — le système héros solo n'est pas cohérent avec le lore |
| Sprites loups | Procédural canvas / Assets externes | **Procédural** — cohérence avec l'existant, zéro dépendances |
| JC de Vael | Curseur unique 0-100 / 2 barres opposées | **Curseur unique** — la zone neutre 40-60 crée une ambiguïté stratégique intéressante |
| Coût des combos | Accessible toujours si conditions / Coût explicite en jauges | **Coût explicite** — aligné avec la logique de chaque jauge |

---

*Document créé le 2026-06-08. Basé sur LORE_LOUPS.md (1035 lignes) et analyse du codebase existant.*
