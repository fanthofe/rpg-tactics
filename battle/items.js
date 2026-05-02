// battle/items.js
export const ITEMS = {
  // ── Commun ──────────────────────────────────────────────────
  'sword-iron':    { name: 'Épée de fer',       slot: 'weapon',    icon: '⚔',  rarity: 'common', stats: { atk: 6 } },
  'armor-leather': { name: 'Armure de cuir',    slot: 'armor',     icon: '🛡', rarity: 'common', stats: { def: 8 } },
  'helmet-iron':   { name: 'Casque en fer',     slot: 'helmet',    icon: '⛑', rarity: 'common', stats: { def: 4, hp: 10 } },
  'ring-strength': { name: 'Bague de force',    slot: 'accessory', icon: '💍', rarity: 'common', stats: { atk: 5 } },
  'ring-speed':    { name: 'Anneau de vitesse', slot: 'accessory', icon: '🏃', rarity: 'common', stats: { spd: 5 } },
  'amulet-luck':   { name: 'Amulette de chance',slot: 'accessory', icon: '📿', rarity: 'common', stats: { lck: 8 } },
  // ── Rare ────────────────────────────────────────────────────
  'sword-bronze':  { name: 'Épée de bronze',    slot: 'weapon',    icon: '⚔',  rarity: 'rare',   stats: { atk: 10 } },
  'dagger-fast':   { name: 'Dague rapide',      slot: 'weapon',    icon: '🗡', rarity: 'rare',   stats: { atk: 4, spd: 5 } },
  'armor-chain':   { name: 'Armure de mailles', slot: 'armor',     icon: '🛡', rarity: 'rare',   stats: { def: 15 } },
  'helmet-steel':  { name: "Casque d'acier",    slot: 'helmet',    icon: '⛑', rarity: 'rare',   stats: { def: 8, hp: 20 } },
  'charm-life':    { name: 'Charme de vie',     slot: 'accessory', icon: '💎', rarity: 'rare',   stats: { hp: 25 } },
  // ── Épique ──────────────────────────────────────────────────
  'sword-runic':   { name: 'Épée runique',      slot: 'weapon',    icon: '⚡', rarity: 'epic',   stats: { atk: 16, lck: 3 } },
  'armor-paladin': { name: 'Armure du Paladin', slot: 'armor',     icon: '🔱', rarity: 'epic',   stats: { def: 18, hp: 20 } },
  'helmet-dragon': { name: 'Casque du Dragon',  slot: 'helmet',    icon: '🐉', rarity: 'epic',   stats: { def: 12, hp: 10, spd: 3 } },
  'ring-demon':    { name: 'Anneau du Démon',   slot: 'accessory', icon: '😈', rarity: 'epic',   stats: { atk: 8, spd: 8 } },
};

// Drop probability per rarity (%)
export const DROP_WEIGHTS = { common: 60, rare: 30, epic: 10 };

// Pick a random loot item excluding already-owned ids
export function rollLoot(ownedIds = []) {
  const owned = new Set(ownedIds);
  const roll  = Math.random() * 100;
  const rarity = roll < 10 ? 'epic' : roll < 40 ? 'rare' : 'common';

  let pool = Object.entries(ITEMS)
    .filter(([id, item]) => item.rarity === rarity && !owned.has(id))
    .map(([id]) => id);

  // Fallback: if all items of this rarity are owned, pick any unowned item
  if (pool.length === 0) {
    pool = Object.entries(ITEMS)
      .filter(([id]) => !owned.has(id))
      .map(([id]) => id);
  }

  if (pool.length === 0) return null; // all items owned
  return pool[Math.floor(Math.random() * pool.length)];
}
