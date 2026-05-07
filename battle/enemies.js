export const ENEMIES = {
  // Acte 1 — Échauffement
  goblin: {
    id: 'goblin',
    name: 'GOBELIN',
    sprite: 'goblin',
    hp: 130,
    atkMin: 14,
    atkMax: 24,
    ai: 'goblin',
    exp: 20,
  },
  // Acte 2 — Première vraie résistance
  orc: {
    id: 'orc',
    name: 'ORC BERSERKER',
    sprite: 'orc',
    hp: 210,
    atkMin: 22,
    atkMax: 33,
    ai: 'orc',
    rageThreshold: 0.40,   // rage plus tôt
    rageAtkMult: 1.6,       // rage plus forte
    exp: 35,
  },
  // Acte 3 — Danger magique
  witch: {
    id: 'witch',
    name: 'SORCIÈRE DES CENDRES',
    sprite: 'witch',
    hp: 170,
    atkMin: 28,
    atkMax: 40,
    defPierce: 0.45,        // ignore presque la moitié de la DEF
    ai: 'witch',
    regenAmount: 18,         // régénération significative
    curseChance: 0.35,       // malédiction fréquente
    curseDuration: 3,        // dure plus longtemps
    curseDmgMult: 0.50,      // attaques héros à 50%
    exp: 50,
  },
  // Acte 4 — Double menace
  gnolls: {
    id: 'gnolls',
    name: 'FRÈRES GNOLLS',
    sprite: 'gnoll',
    multi: true,
    enemies: [
      { name: 'GNOLL ALPHA', hp: 120, atkMin: 18, atkMax: 28 },
      { name: 'GNOLL BETA',  hp: 110, atkMin: 15, atkMax: 24 },
    ],
    ai: 'gnolls',
    vengeanceAtkBonus: 20,   // vengeance dévastatrice
    exp: 70,
  },
  // Acte 5 — Boss final
  shadowLord: {
    id: 'shadowLord',
    name: 'SEIGNEUR DES OMBRES',
    sprite: 'shadowLord',
    hp: 340,
    atkMin: 36,
    atkMax: 52,
    ai: 'shadowLord',
    phase2Threshold: 170,    // phase 2 à 50% HP
    phase2AtkMult: 1.7,      // ATK ×1.7 en phase 2
    doubleHitChance: 0.55,
    doubleHitMult: 0.65,
    shieldBreakChance: 0.45,
    healBlockEvery: 2,
    exp: 115,
  },
};

export const BATTLE_SEQUENCE = ['goblin', 'orc', 'witch', 'gnolls', 'shadowLord'];
