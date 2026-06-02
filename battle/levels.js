export const MAX_LEVEL = 20;

// EXP required to advance FROM level N (index = current level)
// Calibrated so that completing all 10 villages (~1825 total EXP) brings the player to L20.
// Skipping the Mine (optional, 245 EXP) lands around L18.
export const EXP_TO_NEXT = [
  0,    // 0 (unused)
  25,   // 1 → 2   (après Hameau combat 1)
  35,   // 2 → 3   (fin Hameau)
  50,   // 3 → 4   (début Forêt)
  65,   // 4 → 5   (fin Forêt)
  80,   // 5 → 6   (Mine / début Plage)
  95,   // 6 → 7
  100,  // 7 → 8   (fin Mine / mid Plage)
  108,  // 8 → 9
  115,  // 9 → 10  (fin Plage / Temple)
  118,  // 10 → 11
  120,  // 11 → 12 (Jungle)
  120,  // 12 → 13
  115,  // 13 → 14 (Glacier)
  118,  // 14 → 15
  115,  // 15 → 16 (Catacombes)
  115,  // 16 → 17
  115,  // 17 → 18 (Château / début Cité)
  112,  // 18 → 19
  104,  // 19 → 20 (fin Cité — total cumulé : 1825)
];

// Stat gains [hp, atk, def, spd, lck] when REACHING level N (index = new level)
// Warrior archetype: strong HP and ATK growth, moderate DEF, rare SPD/LCK bumps
export const STAT_GAINS = [
  null,             // 0 (unused)
  null,             // 1 (starting level, no gain)
  [12, 2, 1, 0, 1], // → 2
  [10, 3, 1, 1, 0], // → 3
  [14, 2, 2, 0, 0], // → 4
  [12, 3, 1, 1, 1], // → 5
  [16, 3, 2, 0, 0], // → 6
  [14, 4, 1, 1, 0], // → 7
  [18, 3, 2, 0, 1], // → 8
  [16, 4, 2, 1, 0], // → 9
  [20, 4, 2, 0, 0], // → 10
  [18, 5, 3, 1, 1], // → 11
  [22, 4, 2, 0, 0], // → 12
  [20, 5, 3, 1, 0], // → 13
  [24, 5, 3, 0, 1], // → 14
  [22, 6, 3, 1, 0], // → 15
  [26, 5, 4, 0, 0], // → 16
  [24, 6, 4, 1, 1], // → 17
  [28, 6, 4, 0, 0], // → 18
  [26, 7, 5, 1, 0], // → 19
  [30, 7, 5, 0, 1], // → 20
];
