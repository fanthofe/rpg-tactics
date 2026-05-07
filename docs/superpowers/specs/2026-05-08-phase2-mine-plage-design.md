# RPG Tactics — Phase 2 : Mine & Plage

**Date:** 2026-05-08
**Scope:** 9 nouveaux ennemis, 7 familles de sprites, 6 nouvelles actions IA
**Status:** Approuvé

---

## 1. Objectif

Rendre les villages **Mine** (5 combats) et **Plage Pirate** (4 combats) jouables en ajoutant les ennemis manquants avec des mécaniques distinctes.

---

## 2. Mise à jour des villages

### `battle/villages.js`

```js
mine: {
  battles: ['cave_bat', 'cave_dwarf', 'cave_miner', 'cave_troll', 'cave_troll_king'],
},
plage: {
  battles: ['pirate_grunt', 'pirate_crew', 'pirate_quartermaster', 'pirate_captain'],
},
```

---

## 3. Ennemis — `battle/enemies.js`

### Mine

#### `cave_bat`
```js
cave_bat: {
  id: 'cave_bat', name: 'NUÉE DE CHAUVES-SOURIS', sprite: 'cave_bat',
  multi: true,
  enemies: [
    { name: 'CHAUVE-SOURIS α', hp: 55, atkMin: 10, atkMax: 16 },
    { name: 'CHAUVE-SOURIS β', hp: 50, atkMin: 10, atkMax: 16 },
    { name: 'CHAUVE-SOURIS γ', hp: 45, atkMin:  8, atkMax: 14 },
  ],
  ai: 'cave_bat',
  dodgeBonus: 0.18,   // chaque chauve-souris a +18% esquive supplémentaire
  exp: 30,
}
```

#### `cave_dwarf`
```js
cave_dwarf: {
  id: 'cave_dwarf', name: 'NAIN DES MINES', sprite: 'cave_dwarf',
  hp: 145, atkMin: 16, atkMax: 24,
  ai: 'cave_dwarf',
  counterCycle: 3,        // immunité + contre tous les 3 tours
  counterReflect: 0.50,   // renvoie 50% des dégâts reçus ce tour
  exp: 40,
}
```

#### `cave_miner`
```js
cave_miner: {
  id: 'cave_miner', name: 'MINEUR EXPLOSIF', sprite: 'cave_miner',
  hp: 160, atkMin: 14, atkMax: 22,
  ai: 'cave_miner',
  explosionCountdown: 3,  // explose au tour 3 si encore vivant
  explosionDamage: 60,    // dégâts fixes, ignore DEF/bouclier/esquive
  exp: 45,
}
```

#### `cave_troll`
```js
cave_troll: {
  id: 'cave_troll', name: 'TROLL DES CAVERNES', sprite: 'cave_troll',
  hp: 240, atkMin: 20, atkMax: 32,
  ai: 'cave_troll',
  regenPerTurn: 12,       // régénération passive chaque tour ennemi
  heavyBlowCycle: 3,      // frappe lourde (×2 ATK) tous les 3 tours
  exp: 55,
}
```

#### `cave_troll_king`
```js
cave_troll_king: {
  id: 'cave_troll_king', name: 'ROI TROLL', sprite: 'cave_troll_king',
  hp: 310, atkMin: 26, atkMax: 40,
  ai: 'cave_troll_king',
  regenPerTurn: 18,
  quakeCycle: 3,          // séisme tous les 3 tours
  quakeDamage: 40,        // dégâts fixes + brise le bouclier
  phase2Threshold: 155,   // 50% HP
  phase2AtkMult: 1.5,
  exp: 75,
}
```

### Plage

#### `pirate_grunt`
```js
pirate_grunt: {
  id: 'pirate_grunt', name: 'BOUCANIER', sprite: 'pirate_grunt',
  hp: 155, atkMin: 18, atkMax: 28,
  ai: 'pirate_grunt',
  pillageAtkBonus: 8,     // +8 ATK permanent par coup qui touche
  pillageMaxStacks: 3,
  exp: 42,
}
```

#### `pirate_crew`
```js
pirate_crew: {
  id: 'pirate_crew', name: 'ÉQUIPAGE PIRATE', sprite: 'pirate_grunt',
  multi: true,
  enemies: [
    { name: 'CORSAIRE ROUGE', hp: 130, atkMin: 16, atkMax: 24 },
    { name: 'CORSAIRE NOIR', hp: 125, atkMin: 16, atkMax: 24 },
  ],
  ai: 'pirate_crew',
  vengeanceAtkBonus: 20,  // même mécanique que gnolls
  exp: 58,
}
```

#### `pirate_quartermaster`
```js
pirate_quartermaster: {
  id: 'pirate_quartermaster', name: 'QUARTIER-MAÎTRE', sprite: 'pirate_quartermaster',
  hp: 200, atkMin: 22, atkMax: 34,
  ai: 'pirate_quartermaster',
  poisonDamage: 8,        // -8 HP héros par tour (persistant jusqu'à fin combat)
  poisonApplied: false,   // état interne — appliqué une seule fois
  exp: 62,
}
```

#### `pirate_captain`
```js
pirate_captain: {
  id: 'pirate_captain', name: 'CAPITAINE FLIBUSTIER', sprite: 'pirate_captain',
  hp: 230, atkMin: 24, atkMax: 36,
  ai: 'pirate_captain',
  cannonballCycle: 3,     // tous les 3 tours
  cannonballDamage: 55,   // dégâts fixes, ignore tout (DEF, bouclier, esquive)
  exp: 70,
}
```

---

## 4. Nouvelles mécaniques — `battle/BattleState.js`

### États ajoutés au constructeur

```js
// Cave Dwarf
this.dwarfCounterActive = false;
this._dwarfTurnCounter  = 0;

// Cave Miner
this._minerCountdown = 0;          // initialisé à config.explosionCountdown

// Cave Troll / King
this._trollTurnCounter = 0;

// Pirate Grunt
this.pillageStacks = 0;

// Pirate Quartermaster
this.heroPoisoned      = false;
this.heroPoisonDamage  = 0;

// Pirate Captain
this._captainTurnCounter = 0;
```

### Nouvelles méthodes `enemyAI()` (switch cases)

```js
case 'cave_bat':          return 'attack';   // multi, toujours attaque
case 'cave_dwarf':        return this._caveDwarfAI();
case 'cave_miner':        return this._caveMinerAI();
case 'cave_troll':        return this._caveTrollAI();
case 'cave_troll_king':   return this._caveTrollKingAI();
case 'pirate_grunt':      return 'attack';
case 'pirate_crew':       return 'attack';   // multi, comme gnolls
case 'pirate_quartermaster': return this._pirateQmAI();
case 'pirate_captain':    return this._pirateCaptainAI();
```

### Nouvelles méthodes `enemyAttack()` (switch cases)

```js
case 'cave_bat':          return this._caveBatDoAttack();
case 'cave_dwarf':        return [this._basicEnemyAttack()];
case 'cave_miner':        return [this._basicEnemyAttack()];
case 'cave_troll':        return [this._trollDoAttack()];
case 'cave_troll_king':   return [this._trollDoAttack()];
case 'pirate_grunt':      return [this._pirateGruntDoAttack()];
case 'pirate_crew':       return this._gnollsDoAttack();  // réutilise gnolls
case 'pirate_quartermaster': return [this._basicEnemyAttack()];
case 'pirate_captain':    return [this._basicEnemyAttack()];
```

### Détail des méthodes IA privées

#### `_caveDwarfAI()`
```js
_caveDwarfAI() {
  this._dwarfTurnCounter++;
  if (this._dwarfTurnCounter % this._config.counterCycle === 0) {
    this.dwarfCounterActive = true;
    return 'counterAttack';
  }
  return 'attack';
}
```

#### `_caveMinerAI()`
```js
_caveMinerAI() {
  this._minerCountdown++;
  if (this._minerCountdown >= this._config.explosionCountdown) {
    this._minerCountdown = 0;
    return 'explosion';
  }
  return 'attack';
}
```

#### `_caveTrollAI()`
```js
_caveTrollAI() {
  this._trollTurnCounter++;
  if (this._trollTurnCounter % this._config.heavyBlowCycle === 0) return 'heavyBlow';
  return 'attack';
}
```

#### `_caveTrollKingAI()`
```js
_caveTrollKingAI() {
  if (!this.phase2Active && this.enemyHp <= this._config.phase2Threshold) {
    this.phase2Active        = true;
    this.phase2JustTriggered = true;
    return 'phase2';
  }
  this._trollTurnCounter++;
  if (this._trollTurnCounter % this._config.quakeCycle === 0) return 'quake';
  return 'attack';
}
```

#### `_pirateQmAI()`
```js
_pirateQmAI() {
  if (!this.heroPoisoned) {
    this.heroPoisoned     = true;
    this.heroPoisonDamage = this._config.poisonDamage;
    return 'poison';
  }
  if (!this.canEnemyDefend()) return 'attack';
  return Math.random() < 0.7 ? 'attack' : 'defend';
}
```

#### `_pirateCaptainAI()`
```js
_pirateCaptainAI() {
  this._captainTurnCounter++;
  if (this._captainTurnCounter % this._config.cannonballCycle === 0) return 'cannonball';
  if (!this.canEnemyDefend()) return 'attack';
  return Math.random() < 0.75 ? 'attack' : 'defend';
}
```

### Méthodes d'attaque spéciales

#### `_caveBatDoAttack()` — réutilise `_gnollsDoAttack()`
Identique à `_gnollsDoAttack()`. La mécanique d'esquive des chauves-souris est gérée côté `heroAttack()` : si `config.ai === 'cave_bat'`, chaque cible a une chance de dodge supplémentaire (`config.dodgeBonus`) appliquée sur chaque ennemi individuellement avant de soustraire les HP.

#### `_trollDoAttack()` — attaque normale + régénération
```js
_trollDoAttack() {
  const regenAmt = this._config.regenPerTurn ?? 0;
  const healed   = Math.min(regenAmt, this.enemyMaxHp - this.enemyHp);
  this.enemyHp  += healed;
  return { ...this._basicEnemyAttack(), trollRegen: healed };
}
```

#### `_pirateGruntDoAttack()`
```js
_pirateGruntDoAttack() {
  const result = this._applyDamageToHero(
    this._config.atkMin + Math.floor(Math.random() * (this._config.atkMax - this._config.atkMin + 1))
    + this.pillageStacks * this._config.pillageAtkBonus
  );
  if (!result.dodged && this.pillageStacks < this._config.pillageMaxStacks) {
    this.pillageStacks++;
    result.pillaged = true;
  }
  return result;
}
```

### `tickHeroTurn()` — poison persistant
```js
// Ajout dans tickHeroTurn() :
if (this.heroPoisoned && this.heroPoisonDamage > 0) {
  this.heroHp = Math.max(0, this.heroHp - this.heroPoisonDamage);
}
```

### Actions publiques nouvelles

```js
// Appelées depuis BattleScene

// dwarfCounterActive est vérifié dans heroAttack() :
// si true → dégâts hero = 0, héros reçoit floor(rawHeroDmg * counterReflect), dwarfCounterActive = false
// Le flag est mis à true par _caveDwarfAI() quand c'est le tour du counter.

trollQuake() {
  // Brise le bouclier du héros (heroShieldActive = false, turns = 0)
  // Applique config.quakeDamage directement sur heroHp (pas de DEF, pas d'esquive)
  const dmg = this._config.quakeDamage ?? 40;
  const shieldBroken = this.heroShieldActive;
  this.heroShieldActive = false;
  this.heroShieldTurns  = 0;
  this.heroHp = Math.max(0, this.heroHp - dmg);
  return { damage: dmg, shieldBroken };
}

explosion() {
  // Dégâts fixes, ignore tout
  const dmg = this._config.explosionDamage ?? 60;
  this.heroHp = Math.max(0, this.heroHp - dmg);
  return { damage: dmg };
}

cannonball() {
  // Dégâts fixes, ignore DEF/bouclier/esquive
  const dmg = this._config.cannonballDamage ?? 55;
  this.heroHp = Math.max(0, this.heroHp - dmg);
  return { damage: dmg };
}
```

---

## 5. Effets visuels — `scenes/BattleScene.js`

Nouveaux handlers dans `_executeEnemyTurn()` :

| Action | Handler | Description visuelle |
|--------|---------|---------------------|
| `counterAttack` | `_doDwarfCounter()` | Flash doré sur l'ennemi, message "ARMURE DE ROC !" |
| `explosion` | `_doMinerExplosion()` | Grand flash orange, secousse écran, flottant "BOOM !" |
| `heavyBlow` | `_doTrollHeavyBlow()` | Animation attaque amplifiée, flottant "FRAPPE LOURDE !" |
| `quake` | `_doTrollQuake()` | Secousse écran, flash violet, brise bouclier |
| `poison` | `_doPiratePoison()` | Flash vert sur héros, flottant "EMPOISONNÉ !" |
| `cannonball` | `_doPirateCannonball()` | Flash rouge, secousse forte, flottant "BOULET !" |
| `phase2` | `_doTrollKingPhase2()` | Flash rouge + message "LE ROI TROLL EST EN RAGE !", puis attaque immédiatement (enchaîne sur `_doEnemyAttack()`) |

La contre-attaque du nain se gère dans `_executeHeroAction()` : si `dwarfCounterActive === true` quand le héros attaque, appeler `_doDwarfCounterHit()` après l'animation d'attaque du héros.

---

## 6. Sprites — `assets/sprites.js`

7 familles visuelles, 4 animations chacune (idle, walk, attack, defend) :

| Famille | Dimensions | Description visuelle |
|---------|-----------|---------------------|
| `cave_bat` | 48×40 | Petite, ailes membraneuses, yeux rouges. Couleurs : gris-brun, rouge |
| `cave_dwarf` | 64×80 | Trapu, casque à cornes, tablier de forge. Couleurs : gris-bleu, brun |
| `cave_miner` | 64×80 | Même silhouette que dwarf, tenue brune + dynamite visible, mèche rouge |
| `cave_troll` | 80×96 | Grand, bossé, peau vert-gris, poings énormes |
| `cave_troll_king` | 88×104 | Même silhouette troll + couronne rocheuse, taille légèrement supérieure |
| `pirate_grunt` | 64×84 | Bandana, veste déchirée, sabre courbe. Couleurs : rouge foncé, brun |
| `pirate_quartermaster` | 64×84 | Chapeau bicorne, manteau vert-brun, dague empoisonnée |
| `pirate_captain` | 72×96 | Grand chapeau à plumes, manteau rouge, pistolet + épée |

`cave_miner` partage la fonction de dessin de `cave_dwarf` avec `recolor: true`.
`cave_troll_king` partage la fonction de `cave_troll` avec `king: true` (couronne + taille +10%).
`pirate_crew` réutilise le sprite `pirate_grunt`.

---

## 7. Fichiers concernés

| Fichier | Action |
|---------|--------|
| `battle/villages.js` | Modifier `mine.battles` et `plage.battles` |
| `battle/enemies.js` | Ajouter 9 entrées |
| `assets/sprites.js` | Ajouter 6 nouvelles familles (cave_bat, cave_dwarf, cave_troll, pirate_grunt, pirate_quartermaster, pirate_captain) avec variantes |
| `battle/BattleState.js` | Nouveaux états, 6 méthodes IA, 4 méthodes d'attaque, mise à jour tickHeroTurn |
| `scenes/BattleScene.js` | 7 nouveaux handlers visuels, mise à jour `_executeEnemyTurn`, mise à jour `preload` pour charger les nouveaux sprites, mise à jour `_executeHeroAction` pour counter-attaque |
