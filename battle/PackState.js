import { WOLVES } from './WolfData.js';

// ATB fills in 2.5s at spd=10 (1 = full)
const ATB_RATE = 100 / 2500;

const WOLF_IDS = ['kael', 'sura', 'vael'];

export default class PackState {
  constructor(wolfState, formation, enemyConfig) {
    this.formation   = { ...formation };
    this._wolfState  = wolfState;
    this._config     = enemyConfig;

    // Build wolf combat slots
    this.wolves = {};
    for (const id of WOLF_IDS) {
      const stats = wolfState.computedStats(id);
      this.wolves[id] = {
        id,
        name:      WOLVES[id].name,
        hp:        wolfState.wolves[id].hp,
        maxHp:     stats.hp,
        atk:       stats.atk,
        def:       stats.def,
        spd:       stats.spd,
        lck:       stats.lck,
        level:     wolfState.wolves[id].level,
        atb:       0,
        alive:     true,
        defending: false,
        // Resource gauges
        ca: 0,   // Kael — Charges Ancestrales (0-5)
        mc: 0,   // Sûra — Marques de Chasse (0-4)
        jc: 0,   // Vael — Jauge du Seuil (0-100, corruption)
      };
    }

    // Build enemy slots
    if (enemyConfig.multi) {
      this.enemies = enemyConfig.enemies.map((e, i) => ({
        id:     i,
        name:   e.name,
        hp:     e.hp,
        maxHp:  e.hp,
        atkMin: e.atkMin,
        atkMax: e.atkMax,
        spd:    e.spd ?? 8,
        atb:    0,
        alive:  true,
      }));
    } else {
      this.enemies = [{
        id:     0,
        name:   enemyConfig.name,
        hp:     enemyConfig.hp,
        maxHp:  enemyConfig.hp,
        atkMin: enemyConfig.atkMin,
        atkMax: enemyConfig.atkMax,
        spd:    enemyConfig.spd ?? 8,
        atb:    0,
        alive:  true,
      }];
    }

    // XP tracking per wolf per enemy
    this._dmg     = {};
    this._lastHit = new Array(this.enemies.length).fill(null);
    for (const id of WOLF_IDS) {
      this._dmg[id] = new Array(this.enemies.length).fill(0);
    }
  }

  // ── ATB ───────────────────────────────────────────────────────────────────

  // Tick ATB for all alive combatants.
  // Returns { readyWolves: string[], readyEnemies: number[] }
  tickATB(delta) {
    const readyWolves  = [];
    const readyEnemies = [];

    for (const id of WOLF_IDS) {
      const w = this.wolves[id];
      if (!w.alive || w.atb >= 100) continue;
      const rate = ATB_RATE * (w.spd / 10) * (w.defending ? 1.5 : 1);
      const was  = w.atb;
      w.atb = Math.min(100, w.atb + rate * delta);
      if (was < 100 && w.atb >= 100) readyWolves.push(id);
    }

    for (const e of this.enemies) {
      if (!e.alive || e.atb >= 100) continue;
      const was = e.atb;
      e.atb = Math.min(100, e.atb + ATB_RATE * (e.spd / 10) * delta);
      if (was < 100 && e.atb >= 100) readyEnemies.push(e.id);
    }

    return { readyWolves, readyEnemies };
  }

  getReadyWolves() {
    return WOLF_IDS.filter(id => this.wolves[id].alive && this.wolves[id].atb >= 100);
  }

  resetWolfATB(wolfId)  { this.wolves[wolfId].atb = 0; }
  resetEnemyATB(eid)    { this.enemies[eid].atb   = 0; }

  // ── Wolf actions ──────────────────────────────────────────────────────────

  // Returns { wolfId, targetId, damage, crit, died, xpResult }
  wolfAttack(wolfId, targetEnemyId = 0) {
    const wolf  = this.wolves[wolfId];
    const enemy = this.enemies[targetEnemyId];
    if (!wolf.alive || !enemy?.alive) return null;

    const raw  = wolf.atk + Math.floor(Math.random() * 8);
    const crit = Math.random() < wolf.lck * 0.02;
    const dmg  = Math.max(1, Math.floor(raw * (crit ? 1.5 : 1)));

    enemy.hp = Math.max(0, enemy.hp - dmg);
    this._dmg[wolfId][targetEnemyId] += dmg;
    this._lastHit[targetEnemyId] = wolfId;

    // Fill resource gauge
    this._fillGauge(wolfId, 1);

    let xpResult = null;
    if (enemy.hp <= 0) {
      enemy.alive = false;
      xpResult    = this._resolveEnemyDeath(targetEnemyId);
    }

    this.resetWolfATB(wolfId);
    wolf.defending = false;

    return { wolfId, targetId: targetEnemyId, damage: dmg, crit, died: !enemy.alive, xpResult };
  }

  wolfDefend(wolfId) {
    const wolf    = this.wolves[wolfId];
    wolf.defending = true;
    this.resetWolfATB(wolfId);
    return { wolfId };
  }

  // Kill-bonus ATB charge: +1 gauge for the killing wolf (called by scene after level-up)
  applyKillGaugeBonus(wolfId) {
    this._fillGauge(wolfId, 1);
  }

  // ── Enemy action ──────────────────────────────────────────────────────────

  // Returns { enemyId, targetId, damage, wolfDied }
  enemyAct(enemyId) {
    const enemy = this.enemies[enemyId];
    if (!enemy?.alive) return null;

    // Target the alive wolf with the lowest HP
    const alive = WOLF_IDS.filter(id => this.wolves[id].alive);
    if (alive.length === 0) return null;

    alive.sort((a, b) => this.wolves[a].hp - this.wolves[b].hp);
    const targetId = alive[0];
    const target   = this.wolves[targetId];

    const range      = enemy.atkMax - enemy.atkMin;
    const rawAtk     = enemy.atkMin + Math.floor(Math.random() * (range + 1));
    const defMult    = target.defending ? 0.5 : 1;
    const defReduce  = target.def / (target.def + 20);
    const dmg        = Math.max(1, Math.floor(rawAtk * defMult * (1 - defReduce)));

    target.hp = Math.max(0, target.hp - dmg);
    if (target.hp <= 0) target.alive = false;

    target.defending = false; // defending consumed on hit
    this.resetEnemyATB(enemyId);

    return { enemyId, targetId, damage: dmg, wolfDied: target.hp <= 0 };
  }

  // ── XP on enemy death ─────────────────────────────────────────────────────

  _resolveEnemyDeath(eid) {
    const baseXP   = this._config.exp ?? 30;
    const totalDmg = WOLF_IDS.reduce((s, id) => s + this._dmg[id][eid], 0);

    const xpGains = {};
    for (const id of WOLF_IDS) {
      const dmg = this._dmg[id][eid];
      if (dmg > 0 && totalDmg > 0) {
        xpGains[id] = Math.round((dmg / totalDmg) * baseXP);
      }
    }

    const killWolf = this._lastHit[eid];
    if (killWolf && xpGains[killWolf] != null) {
      xpGains[killWolf] += Math.round(baseXP * 0.25); // +25% kill bonus
    }

    return { xpGains, killWolf, baseXP, enemyId: eid };
  }

  // ── Formation ─────────────────────────────────────────────────────────────

  swapFormation(newFormation) {
    this.formation = { ...newFormation };
    // Bonus ATB to wolves now in their natural position
    for (const [pos, id] of Object.entries(newFormation)) {
      if (WOLVES[id].naturalPos === pos) {
        this.wolves[id].atb = Math.min(100, this.wolves[id].atb + 10);
      }
    }
  }

  getPosition(wolfId) {
    for (const [pos, id] of Object.entries(this.formation)) {
      if (id === wolfId) return pos;
    }
    return null;
  }

  isInNaturalPos(wolfId) {
    return this.getPosition(wolfId) === WOLVES[wolfId].naturalPos;
  }

  // ── Gauge helpers ─────────────────────────────────────────────────────────

  _fillGauge(wolfId, amount) {
    const w = this.wolves[wolfId];
    if (wolfId === 'kael') w.ca = Math.min(5,   w.ca + amount);
    if (wolfId === 'sura') w.mc = Math.min(4,   w.mc + amount);
    if (wolfId === 'vael') w.jc = Math.max(0,   Math.min(100, w.jc - amount * 6));
  }

  // ── State queries ─────────────────────────────────────────────────────────

  isPackDead()        { return WOLF_IDS.every(id => !this.wolves[id].alive); }
  isAllEnemiesDead()  { return this.enemies.every(e => !e.alive); }
  aliveWolves()       { return WOLF_IDS.filter(id => this.wolves[id].alive); }
  aliveEnemies()      { return this.enemies.filter(e => e.alive); }
}
