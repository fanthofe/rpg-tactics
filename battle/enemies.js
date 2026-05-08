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
  // ── Mine ────────────────────────────────────────────────────
  cave_bat: {
    id: 'cave_bat',
    name: 'NUÉE DE CHAUVES-SOURIS',
    sprite: 'cave_bat',
    multi: true,
    enemies: [
      { name: 'CHAUVE-SOURIS α', hp: 55, atkMin: 10, atkMax: 16 },
      { name: 'CHAUVE-SOURIS β', hp: 50, atkMin:  8, atkMax: 14 },
    ],
    ai: 'cave_bat',
    dodgeBonus: 0.18,
    exp: 30,
  },
  cave_dwarf: {
    id: 'cave_dwarf',
    name: 'NAIN DES MINES',
    sprite: 'cave_dwarf',
    hp: 145,
    atkMin: 16,
    atkMax: 24,
    ai: 'cave_dwarf',
    counterCycle: 3,
    counterReflect: 0.50,
    exp: 40,
  },
  cave_miner: {
    id: 'cave_miner',
    name: 'MINEUR EXPLOSIF',
    sprite: 'cave_miner',
    hp: 160,
    atkMin: 14,
    atkMax: 22,
    ai: 'cave_miner',
    explosionCountdown: 3,
    explosionDamage: 60,
    exp: 45,
  },
  cave_troll: {
    id: 'cave_troll',
    name: 'TROLL DES CAVERNES',
    sprite: 'cave_troll',
    hp: 240,
    atkMin: 20,
    atkMax: 32,
    ai: 'cave_troll',
    regenPerTurn: 12,
    heavyBlowCycle: 3,
    exp: 55,
  },
  cave_troll_king: {
    id: 'cave_troll_king',
    name: 'ROI TROLL',
    sprite: 'cave_troll_king',
    hp: 310,
    atkMin: 26,
    atkMax: 40,
    ai: 'cave_troll_king',
    regenPerTurn: 18,
    quakeCycle: 3,
    quakeDamage: 40,
    phase2Threshold: 155,
    phase2AtkMult: 1.5,
    exp: 75,
  },
  // ── Plage ────────────────────────────────────────────────────
  pirate_grunt: {
    id: 'pirate_grunt',
    name: 'BOUCANIER',
    sprite: 'pirate_grunt',
    hp: 155,
    atkMin: 18,
    atkMax: 28,
    ai: 'pirate_grunt',
    pillageAtkBonus: 8,
    pillageMaxStacks: 3,
    exp: 42,
  },
  pirate_crew: {
    id: 'pirate_crew',
    name: 'ÉQUIPAGE PIRATE',
    sprite: 'pirate_grunt',
    multi: true,
    enemies: [
      { name: 'CORSAIRE ROUGE', hp: 130, atkMin: 16, atkMax: 24 },
      { name: 'CORSAIRE NOIR',  hp: 125, atkMin: 16, atkMax: 24 },
    ],
    ai: 'pirate_crew',
    vengeanceAtkBonus: 20,
    exp: 58,
  },
  pirate_quartermaster: {
    id: 'pirate_quartermaster',
    name: 'QUARTIER-MAÎTRE',
    sprite: 'pirate_quartermaster',
    hp: 200,
    atkMin: 22,
    atkMax: 34,
    ai: 'pirate_quartermaster',
    poisonDamage: 8,
    exp: 62,
  },
  pirate_captain: {
    id: 'pirate_captain',
    name: 'CAPITAINE FLIBUSTIER',
    sprite: 'pirate_captain',
    hp: 230,
    atkMin: 24,
    atkMax: 36,
    ai: 'pirate_captain',
    cannonballCycle: 3,
    cannonballDamage: 55,
    exp: 70,
  },
};

export const BATTLE_SEQUENCE = ['goblin', 'orc', 'witch', 'gnolls', 'shadowLord'];
