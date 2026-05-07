export const MAX_LEVEL = 20;

// EXP required to advance FROM level N (index = current level)
// Calibrated so the player gains exactly 1 level per battle across 5 fights
export const EXP_TO_NEXT = [
  0,    // 0 (unused)
  20,   // 1 → 2
  40,   // 2 → 3
  68,   // 3 → 4
  104,  // 4 → 5
  148,  // 5 → 6
  200,  // 6 → 7
  260,  // 7 → 8
  328,  // 8 → 9
  404,  // 9 → 10
  488,  // 10 → 11
  580,  // 11 → 12
  680,  // 12 → 13
  788,  // 13 → 14
  904,  // 14 → 15
  1028, // 15 → 16
  1160, // 16 → 17
  1300, // 17 → 18
  1448, // 18 → 19
  1604, // 19 → 20
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
