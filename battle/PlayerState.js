import { ITEMS } from './items.js';
import { BATTLE_SEQUENCE } from './enemies.js';
import { EXP_TO_NEXT, STAT_GAINS, MAX_LEVEL } from './levels.js';

export default class PlayerState {
  constructor() {
    this.level        = 1;
    this.exp          = 0;
    this.battleIndex  = 0;
    this.baseStats    = { hp: 55, atk: 10, def: 0, spd: 6, lck: 3 };
    this.equipped     = { weapon: null, armor: null, helmet: null, accessory1: null, accessory2: null };
    this.inventory    = ['sword-iron', 'armor-leather', 'helmet-iron'];
  }

  currentEnemyId() { return BATTLE_SEQUENCE[this.battleIndex] ?? null; }

  advanceBattle() {
    if (this.battleIndex < BATTLE_SEQUENCE.length - 1) {
      this.battleIndex++;
      return true;
    }
    return false; // all battles cleared
  }

  resetBattles() { this.battleIndex = 0; }

  expToNext() {
    return EXP_TO_NEXT[this.level] ?? null; // null = max level
  }

  gainExp(amount) {
    if (this.level >= MAX_LEVEL) return { leveled: false, levels: [] };
    this.exp += amount;
    const levels = [];
    while (this.level < MAX_LEVEL) {
      const needed = EXP_TO_NEXT[this.level];
      if (!needed || this.exp < needed) break;
      this.exp -= needed;
      this.level++;
      const g = STAT_GAINS[this.level];
      if (g) {
        this.baseStats.hp  += g[0];
        this.baseStats.atk += g[1];
        this.baseStats.def += g[2];
        this.baseStats.spd += g[3];
        this.baseStats.lck += g[4];
      }
      levels.push({ level: this.level, gains: g ? { hp: g[0], atk: g[1], def: g[2], spd: g[3], lck: g[4] } : {} });
    }
    return { leveled: levels.length > 0, levels };
  }

  computedStats() {
    const stats = { ...this.baseStats };
    for (const itemId of Object.values(this.equipped)) {
      if (!itemId) continue;
      const item = ITEMS[itemId];
      if (!item) continue;
      for (const [key, val] of Object.entries(item.stats)) {
        stats[key] = (stats[key] ?? 0) + val;
      }
    }
    return stats;
  }

  equipmentBonus() {
    const bonus = { hp: 0, atk: 0, def: 0, spd: 0, lck: 0 };
    for (const itemId of Object.values(this.equipped)) {
      if (!itemId) continue;
      const item = ITEMS[itemId];
      if (!item) continue;
      for (const [key, val] of Object.entries(item.stats)) {
        bonus[key] = (bonus[key] ?? 0) + val;
      }
    }
    return bonus;
  }

  equip(itemId, slot) {
    const prev = this.equipped[slot];
    if (prev) this.inventory.push(prev);
    this.equipped[slot] = itemId;
    const idx = this.inventory.indexOf(itemId);
    if (idx !== -1) this.inventory.splice(idx, 1);
  }

  unequip(slot) {
    const itemId = this.equipped[slot];
    if (!itemId) return;
    this.equipped[slot] = null;
    this.addToInventory(itemId);
  }

  addToInventory(itemId) {
    if (this.inventory.length >= 12) this.inventory.shift();
    this.inventory.push(itemId);
  }

  isEquipped(itemId) {
    return Object.values(this.equipped).includes(itemId);
  }

  ownedIds() {
    return [...new Set([...this.inventory, ...Object.values(this.equipped).filter(Boolean)])];
  }
}
