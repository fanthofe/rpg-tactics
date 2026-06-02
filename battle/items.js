// battle/items.js
export const ITEMS = {
  // ── Commun ──────────────────────────────────────────────────
  'sword-iron':    { name: 'Épée de fer',          slot: 'weapon',    icon: '⚔',  rarity: 'common', stats: { atk: 6 } },
  'armor-leather': { name: 'Armure de cuir',       slot: 'armor',     icon: '🛡', rarity: 'common', stats: { def: 8 } },
  'helmet-iron':   { name: 'Casque en fer',        slot: 'helmet',    icon: '⛑', rarity: 'common', stats: { def: 4, hp: 10 } },
  'ring-strength': { name: 'Bague de force',       slot: 'accessory', icon: '💍', rarity: 'common', stats: { atk: 5 } },
  'ring-speed':    { name: 'Anneau de vitesse',    slot: 'accessory', icon: '🏃', rarity: 'common', stats: { spd: 5 } },
  'amulet-luck':   { name: 'Amulette de chance',  slot: 'accessory', icon: '📿', rarity: 'common', stats: { lck: 8 } },
  'ring-hp':       { name: 'Anneau de vitalité',  slot: 'accessory', icon: '💍', rarity: 'common', stats: { hp: 20 } },
  // ── Rare ────────────────────────────────────────────────────
  'sword-bronze':  { name: 'Épée de bronze',       slot: 'weapon',    icon: '⚔',  rarity: 'rare',   stats: { atk: 10 } },
  'axe-battle':    { name: 'Hache de guerre',      slot: 'weapon',    icon: '🪓', rarity: 'rare',   stats: { atk: 8, def: 3 } },
  'dagger-fast':   { name: 'Dague rapide',         slot: 'weapon',    icon: '🗡', rarity: 'rare',   stats: { atk: 4, spd: 5 } },
  'armor-chain':   { name: 'Armure de mailles',   slot: 'armor',     icon: '🛡', rarity: 'rare',   stats: { def: 15 } },
  'helmet-steel':  { name: "Casque d'acier",       slot: 'helmet',    icon: '⛑', rarity: 'rare',   stats: { def: 8, hp: 20 } },
  'charm-life':    { name: 'Charme de vie',        slot: 'accessory', icon: '💎', rarity: 'rare',   stats: { hp: 25 } },
  'boots-swift':   { name: 'Bottes rapides',       slot: 'accessory', icon: '👢', rarity: 'rare',   stats: { spd: 8, lck: 3 } },
  // ── Épique (zones 1-4) ───────────────────────────────────────
  'sword-runic':   { name: 'Épée runique',         slot: 'weapon',    icon: '⚡', rarity: 'epic',   stats: { atk: 16, lck: 3 } },
  'armor-paladin': { name: 'Armure du Paladin',    slot: 'armor',     icon: '🔱', rarity: 'epic',   stats: { def: 18, hp: 20 } },
  'helmet-dragon': { name: 'Casque du Dragon',     slot: 'helmet',    icon: '🐉', rarity: 'epic',   stats: { def: 12, hp: 10, spd: 3 } },
  'ring-demon':    { name: 'Anneau du Démon',      slot: 'accessory', icon: '😈', rarity: 'epic',   stats: { atk: 8, spd: 8 } },
  // ── Épique (zones 5+) ────────────────────────────────────────
  'sword-ice':     { name: 'Épée de Givre',        slot: 'weapon',    icon: '❄',  rarity: 'epic',   stats: { atk: 14, spd: 5 },        minZoneDiff: 5 },
  'armor-shadow':  { name: 'Armure des Ombres',    slot: 'armor',     icon: '🌑', rarity: 'epic',   stats: { def: 22, hp: 15 },         minZoneDiff: 6 },
  'amulet-undying':{ name: "Amulette de l'Éternité", slot: 'accessory', icon: '⚗', rarity: 'epic',  stats: { hp: 40, lck: 5 },          minZoneDiff: 7 },
  'sword-hellfire':{ name: 'Lame des Enfers',      slot: 'weapon',    icon: '🔥', rarity: 'epic',   stats: { atk: 20, lck: 4 },         minZoneDiff: 9 },
  'helmet-lich':   { name: 'Couronne de la Liche', slot: 'helmet',    icon: '💀', rarity: 'epic',   stats: { def: 16, hp: 20, atk: 4 }, minZoneDiff: 7 },
  // ── Exclusif Mine ────────────────────────────────────────────
  'pickaxe-miner': { name: 'Pioche du Mineur',     slot: 'weapon',    icon: '⛏', rarity: 'epic',   stats: { atk: 12, def: 8 },         minZoneDiff: 2, mineExclusive: true },
};

// Poids des raretés selon la difficulté de zone
function _rarityWeights(zoneDiff) {
  if (zoneDiff >= 7) return { epic: 40, rare: 45, common: 15 };
  if (zoneDiff >= 5) return { epic: 20, rare: 50, common: 30 };
  if (zoneDiff >= 3) return { epic: 10, rare: 45, common: 45 };
  return                     { epic:  5, rare: 30, common: 65 };
}

// Pick a random loot item excluding already-owned ids, scaled by zone difficulty
export function rollLoot(ownedIds = [], zoneDiff = 1) {
  const owned   = new Set(ownedIds);
  const weights = _rarityWeights(zoneDiff);
  const roll    = Math.random() * 100;
  const rarity  = roll < weights.epic ? 'epic' : roll < weights.epic + weights.rare ? 'rare' : 'common';

  let pool = Object.entries(ITEMS)
    .filter(([id, item]) =>
      item.rarity === rarity &&
      !owned.has(id) &&
      (!item.minZoneDiff || zoneDiff >= item.minZoneDiff)
    )
    .map(([id]) => id);

  // Fallback : si la rareté tirée est épuisée, piocher dans tout ce qui est accessible
  if (pool.length === 0) {
    pool = Object.entries(ITEMS)
      .filter(([id, item]) => !owned.has(id) && (!item.minZoneDiff || zoneDiff >= item.minZoneDiff))
      .map(([id]) => id);
  }

  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
