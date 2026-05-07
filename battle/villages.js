export const MAP_START = 'hameau';

export const VILLAGES = {
  hameau: {
    id: 'hameau', name: 'Hameau', icon: '🏘',
    pos: { x: 75, y: 160 }, diff: 1,
    parent: null,
    battles: ['goblin', 'goblin'],
    connections: ['foret'],
  },
  foret: {
    id: 'foret', name: 'Forêt gobeline', icon: '👺',
    pos: { x: 175, y: 160 }, diff: 2,
    parent: 'hameau',
    battles: ['goblin', 'goblin', 'orc'],
    connections: ['hameau', 'plage', 'mine'],
  },
  mine: {
    id: 'mine', name: 'Mine', icon: '⛏',
    pos: { x: 175, y: 60 }, diff: 2,
    parent: 'foret',
    battles: ['cave_dwarf', 'cave_troll'],
    connections: ['foret'],
  },
  plage: {
    id: 'plage', name: 'Plage pirate', icon: '⚓',
    pos: { x: 280, y: 160 }, diff: 3,
    parent: 'foret',
    battles: ['pirate_grunt', 'pirate_captain'],
    connections: ['foret', 'temple'],
  },
  temple: {
    id: 'temple', name: 'Temple maudit', icon: '🛕',
    pos: { x: 385, y: 160 }, diff: 4,
    parent: 'plage',
    battles: ['witch', 'cursed_knight'],
    connections: ['plage', 'jungle'],
  },
  jungle: {
    id: 'jungle', name: 'Jungle', icon: '🌿',
    pos: { x: 490, y: 160 }, diff: 5,
    parent: 'temple',
    battles: ['gnolls', 'gnolls', 'jungle_beast'],
    connections: ['temple', 'glacier'],
  },
  glacier: {
    id: 'glacier', name: 'Glacier', icon: '🧊',
    pos: { x: 590, y: 160 }, diff: 6,
    parent: 'jungle',
    battles: ['frost_troll', 'ice_witch'],
    connections: ['jungle', 'catacombes'],
  },
  catacombes: {
    id: 'catacombes', name: 'Catacombes', icon: '💀',
    pos: { x: 690, y: 160 }, diff: 7,
    parent: 'glacier',
    battles: ['skeleton', 'lich', 'shadowLord'],
    connections: ['glacier', 'cite', 'chateau'],
  },
  chateau: {
    id: 'chateau', name: 'Château hanté', icon: '🏰',
    pos: { x: 690, y: 60 }, diff: 7,
    parent: 'catacombes',
    battles: ['ghost_knight', 'vampire'],
    connections: ['catacombes'],
  },
  cite: {
    id: 'cite', name: 'Cité des Démons', icon: '😈',
    pos: { x: 690, y: 280 }, diff: 10,
    parent: 'catacombes',
    battles: ['demon_warrior', 'demon_lord'],
    connections: ['catacombes'],
  },
};

export const VILLAGE_ORDER = [
  'hameau', 'foret', 'mine', 'plage', 'temple',
  'jungle', 'glacier', 'catacombes', 'chateau', 'cite',
];
