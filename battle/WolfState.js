import { WOLVES, WOLF_STAT_GAINS, EXP_TO_NEXT, MAX_LEVEL } from './WolfData.js';
import { VILLAGES, MAP_START } from './villages.js';

const SAVE_KEY = 'rpg-wolf-save';

export default class WolfState {
  constructor() {
    this.clearedVillages = new Set();
    this.currentVillage  = MAP_START;
    this.lastFormation   = { alpha: 'kael', beta: 'sura', omega: 'vael' };
    this.wolves = {
      kael: this._newWolf('kael'),
      sura: this._newWolf('sura'),
      vael: this._newWolf('vael'),
    };
  }

  _newWolf(id) {
    const def = WOLVES[id];
    return {
      id,
      level:     1,
      exp:       0,
      hp:        def.baseStats.hp,
      baseStats: { ...def.baseStats },
    };
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
    this.lastFormation   = { alpha: 'kael', beta: 'sura', omega: 'vael' };
    this.wolves = {
      kael: this._newWolf('kael'),
      sura: this._newWolf('sura'),
      vael: this._newWolf('vael'),
    };
    this.save();
  }

  computedStats(wolfId) {
    return { ...this.wolves[wolfId].baseStats };
  }

  maxHp(wolfId) {
    return this.wolves[wolfId].baseStats.hp;
  }

  // Apply XP to a wolf. Returns { leveled: bool, levels: Array }
  // Each entry in levels: { level, gains, hpRestored }
  gainExp(wolfId, amount) {
    const wolf = this.wolves[wolfId];
    if (wolf.level >= MAX_LEVEL) return { leveled: false, levels: [] };
    wolf.exp += amount;
    const levels = [];
    while (wolf.level < MAX_LEVEL) {
      const needed = EXP_TO_NEXT[wolf.level];
      if (!needed || wolf.exp < needed) break;
      wolf.exp -= needed;
      wolf.level++;
      const gains = WOLF_STAT_GAINS[wolfId]?.[wolf.level];
      if (gains) {
        wolf.baseStats.hp  += gains[0];
        wolf.baseStats.atk += gains[1];
        wolf.baseStats.def += gains[2];
        wolf.baseStats.spd += gains[3];
        wolf.baseStats.lck += gains[4];
      }
      // Level-up restores HP to 100%
      wolf.hp = wolf.baseStats.hp;
      levels.push({
        level:      wolf.level,
        gains:      gains ? { hp: gains[0], atk: gains[1], def: gains[2], spd: gains[3], lck: gains[4] } : {},
        hpRestored: wolf.baseStats.hp,
      });
    }
    if (levels.length > 0) this.save();
    return { leveled: levels.length > 0, levels };
  }

  // Persist HP after combat (wolves recover 30% max HP between combats)
  persistCombatHp(wolfId, currentHp, maxHp) {
    const recovery = Math.floor(maxHp * 0.30);
    this.wolves[wolfId].hp = Math.min(maxHp, Math.max(1, currentHp + recovery));
  }

  save() {
    const data = {
      clearedVillages: [...this.clearedVillages],
      currentVillage:  this.currentVillage,
      lastFormation:   { ...this.lastFormation },
      wolves: {
        kael: this._pack('kael'),
        sura: this._pack('sura'),
        vael: this._pack('vael'),
      },
    };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch {}
  }

  _pack(id) {
    const w = this.wolves[id];
    return { level: w.level, exp: w.exp, hp: w.hp, baseStats: { ...w.baseStats } };
  }

  static tryLoad() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  loadFromData(data) {
    this.clearedVillages = new Set(data.clearedVillages ?? []);
    this.currentVillage  = data.currentVillage ?? MAP_START;
    this.lastFormation   = data.lastFormation ?? { alpha: 'kael', beta: 'sura', omega: 'vael' };
    for (const id of ['kael', 'sura', 'vael']) {
      const saved = data.wolves?.[id];
      if (!saved) continue;
      const def = WOLVES[id];
      this.wolves[id] = {
        id,
        level:     saved.level     ?? 1,
        exp:       saved.exp       ?? 0,
        hp:        saved.hp        ?? def.baseStats.hp,
        baseStats: { ...def.baseStats, ...saved.baseStats },
      };
    }
  }
}
