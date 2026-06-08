export const MAX_LEVEL = 20;

// XP required to advance FROM level N
export const EXP_TO_NEXT = [
  0,   // 0 unused
  30,  // 1→2
  45,  // 2→3
  62,  // 3→4
  80,  // 4→5
  100, // 5→6
  120, // 6→7
  138, // 7→8
  155, // 8→9
  170, // 9→10
  182, // 10→11
  192, // 11→12
  200, // 12→13
  200, // 13→14
  196, // 14→15
  190, // 15→16
  185, // 16→17
  178, // 17→18
  170, // 18→19
  158, // 19→20
];

// Stat gains [hp, atk, def, spd, lck] when REACHING level N
// Kael : tank/ancestral — fort en HP/DEF, lent
// Sûra : dégâts rapides — fort en ATK/SPD
// Vael : polyvalent/furtif — fort en SPD/LCK
export const WOLF_STAT_GAINS = {
  kael: [
    null, null,
    [15, 3, 2, 0, 1], [12, 4, 2, 0, 0], [18, 3, 3, 0, 1],
    [15, 4, 2, 0, 0], [20, 5, 3, 0, 0], [16, 4, 3, 1, 0],
    [22, 5, 3, 0, 1], [18, 5, 4, 0, 0], [25, 6, 4, 0, 0],
    [20, 6, 4, 1, 1], [26, 7, 4, 0, 0], [22, 6, 5, 0, 0],
    [28, 7, 5, 0, 1], [24, 7, 5, 1, 0], [30, 8, 5, 0, 0],
    [26, 8, 6, 0, 0], [32, 8, 6, 1, 1], [34, 9, 7, 0, 1],
  ],
  sura: [
    null, null,
    [10, 5, 1, 1, 2], [8, 6, 1, 1, 1], [12, 5, 1, 2, 1],
    [10, 6, 1, 1, 2], [14, 7, 1, 2, 1], [11, 6, 2, 2, 1],
    [15, 7, 1, 2, 2], [12, 7, 2, 2, 1], [16, 8, 2, 2, 1],
    [13, 8, 2, 3, 2], [17, 9, 2, 2, 1], [14, 8, 3, 3, 1],
    [18, 9, 2, 2, 2], [15, 9, 3, 3, 1], [20,10, 3, 2, 1],
    [16, 9, 3, 3, 2], [21,10, 3, 3, 1], [22,11, 4, 2, 2],
  ],
  vael: [
    null, null,
    [8,  4, 1, 2, 1], [6,  5, 1, 2, 2], [10, 4, 1, 3, 1],
    [8,  5, 1, 2, 2], [12, 5, 1, 3, 1], [9,  5, 2, 3, 2],
    [13, 6, 1, 3, 1], [10, 6, 2, 3, 2], [14, 6, 2, 3, 1],
    [11, 7, 2, 4, 2], [15, 6, 2, 3, 1], [12, 7, 3, 4, 2],
    [16, 7, 2, 3, 1], [13, 8, 3, 4, 2], [17, 7, 3, 4, 1],
    [14, 8, 3, 4, 2], [18, 8, 3, 4, 1], [19, 8, 4, 5, 1],
  ],
};

// Static wolf definitions
export const WOLVES = {
  kael: {
    id:         'kael',
    name:       'Kael',
    naturalPos: 'alpha',
    baseStats:  { hp: 120, atk: 22, def: 8, spd: 7, lck: 4 },
    colors:     {
      body:     '#E8E8E8',
      head:     '#DCDCDC',
      snout:    '#C8C8C8',
      leg:      '#D0D0D0',
      legDark:  '#B8B8B8',
      paw:      '#A0A0A0',
      ear:      '#D0D0D0',
      earInner: '#E8A0A0',
      nose:     '#1A1A1A',
      bands:    '#1F1F1F',
      eyeRight: '#F59E0B',
      eyeLeft:  '#F59E0B',
    },
    auraColor: 0x60A5FA, // bleu glaciaire
  },
  sura: {
    id:         'sura',
    name:       'Sûra',
    naturalPos: 'beta',
    baseStats:  { hp: 100, atk: 28, def: 5, spd: 10, lck: 6 },
    colors:     {
      body:     '#1C1C1C',
      head:     '#222222',
      snout:    '#2A2A2A',
      leg:      '#181818',
      legDark:  '#141414',
      paw:      '#101010',
      ear:      '#1C1C1C',
      earInner: '#7C3509',
      nose:     '#0A0A0A',
      bands:    null,
      eyeRight: '#D97706',
      eyeLeft:  '#D97706',
    },
    auraColor: 0xFBBF24, // ambre électrique
  },
  vael: {
    id:         'vael',
    name:       'Vael',
    naturalPos: 'omega',
    baseStats:  { hp: 90, atk: 20, def: 4, spd: 12, lck: 5 },
    colors:     {
      body:     '#9CA3AF',
      head:     '#9CA3AF',
      snout:    '#8B9099',
      leg:      '#878E97',
      legDark:  '#707880',
      paw:      '#606870',
      ear:      '#9CA3AF',
      earInner: '#C4A898',
      nose:     '#1A1A1A',
      bands:    null,
      eyeRight: '#F59E0B',
      eyeLeft:  '#E5E7EB',
    },
    auraColor: 0xC4B5FD, // argent-violet
  },
};

export const POSITION_LABELS = { alpha: 'Alpha', beta: 'Beta', omega: 'Omega' };
