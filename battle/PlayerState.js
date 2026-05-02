import { ITEMS } from './items.js';

export default class PlayerState {
  constructor() {
    this.level      = 1;
    this.baseStats  = { hp: 100, atk: 18, def: 0, spd: 8, lck: 5 };
    this.equipped   = { weapon: null, armor: null, helmet: null, accessory1: null, accessory2: null };
    this.inventory  = ['sword-iron', 'armor-leather', 'helmet-iron'];
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
    return [
      ...this.inventory,
      ...Object.values(this.equipped).filter(Boolean),
    ];
  }
}
