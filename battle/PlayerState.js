import { ITEMS } from './items.js';
import { VILLAGES, MAP_START } from './villages.js';
import { EXP_TO_NEXT, STAT_GAINS, MAX_LEVEL } from './levels.js';

export default class PlayerState {
  constructor() {
    this.level           = 1;
    this.exp             = 0;
    this.clearedVillages = new Set();
    this.currentVillage  = MAP_START;
    this.baseStats       = { hp: 55, atk: 10, def: 0, spd: 6, lck: 3 };
    this.equipped        = { weapon: null, armor: null, helmet: null, accessory1: null, accessory2: null };
    this.inventory       = ['sword-iron', 'armor-leather', 'helmet-iron'];
  }

  isVillageUnlocked(villageId) {
    const v = VILLAGES[villageId];
    if (!v) return false;
    if (!v.parent) return true;
    return this.clearedVillages.has(v.parent);
  }

  clearVillage(villageId) {
    this.clearedVillages.add(villageId);
    this.currentVillage = villageId;
    this.save();
  }

  resetProgress() {
    this.clearedVillages = new Set();
    this.currentVillage  = MAP_START;
    this.level           = 1;
    this.exp             = 0;
    this.baseStats       = { hp: 55, atk: 10, def: 0, spd: 6, lck: 3 };
    this.inventory       = ['sword-iron', 'armor-leather', 'helmet-iron'];
    this.equipped        = { weapon: null, armor: null, helmet: null, accessory1: null, accessory2: null };
  }

  save() {
    const data = {
      level:           this.level,
      exp:             this.exp,
      baseStats:       { ...this.baseStats },
      clearedVillages: [...this.clearedVillages],
      currentVillage:  this.currentVillage,
      inventory:       [...this.inventory],
      equipped:        { ...this.equipped },
    };
    try {
      localStorage.setItem('rpg-tactics-save', JSON.stringify(data));
    } catch {}
  }

  static tryLoad() {
    try {
      const raw = localStorage.getItem('rpg-tactics-save');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  loadFromData(data) {
    this.level           = data.level           ?? 1;
    this.exp             = data.exp             ?? 0;
    this.baseStats       = { hp: 55, atk: 10, def: 0, spd: 6, lck: 3, ...data.baseStats };
    this.clearedVillages = new Set(data.clearedVillages ?? []);
    this.currentVillage  = data.currentVillage  ?? MAP_START;
    this.inventory       = data.inventory       ?? ['sword-iron', 'armor-leather', 'helmet-iron'];
    this.equipped        = { weapon: null, armor: null, helmet: null, accessory1: null, accessory2: null, ...data.equipped };
  }

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
    const result = { leveled: levels.length > 0, levels };
    if (result.leveled) this.save();
    return result;
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
    this.save();
  }

  unequip(slot) {
    const itemId = this.equipped[slot];
    if (!itemId) return;
    this.equipped[slot] = null;
    this.addToInventory(itemId);
    this.save();
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
