import { ENEMIES } from './enemies.js';

export default class BattleState {
  constructor(playerState = null, enemyConfig = null) {
    const stats = playerState ? playerState.computedStats() : null;
    this.heroMaxHp = stats?.hp  ?? 100;
    this.heroHp    = this.heroMaxHp;
    this._heroAtk  = stats?.atk ?? 18;
    this._heroDef  = stats?.def ?? 0;
    this._heroSpd  = stats?.spd ?? 8;
    this._heroLck  = stats?.lck ?? 5;

    const cfg = enemyConfig ?? ENEMIES.goblin;
    this._config = cfg;
    this.isMulti = !!cfg.multi;

    if (this.isMulti) {
      this.enemies = cfg.enemies.map(e => ({
        name:   e.name,
        hp:     e.hp,
        maxHp:  e.hp,
        atkMin: e.atkMin,
        atkMax: e.atkMax,
      }));
    } else {
      this.enemyHp    = cfg.hp;
      this.enemyMaxHp = cfg.hp;
    }

    // Hero status
    this.heroShieldActive    = false;
    this.heroShieldTurns     = 0;
    this.heroCursed          = false;
    this._heroCurseTurns     = 0;
    this.heroHealBlocked     = false;

    // Enemy status
    this._enemyDefending         = false;
    this._enemyDefendedLastTurn  = false;

    // Orc
    this.orcRageActive = false;

    // Gnolls
    this.gnollVengeanceActive  = false;

    // Shadow Lord
    this.phase2Active        = false;
    this.phase2JustTriggered = false;
    this._healBlockCounter   = 0;

    // Cave Dwarf
    this.dwarfCounterActive = false;
    this._dwarfTurnCounter  = 0;

    // Cave Miner
    this._minerCountdown    = 0;

    // Cave Troll / King
    this._trollTurnCounter  = 0;
  }

  // ── Hero actions ──────────────────────────────────────────────────────────

  heroAttack(targetIndex = 0) {
    if (this.dwarfCounterActive) {
      this.dwarfCounterActive = false;
      const reflected = Math.floor(this._heroAtk * (this._config.counterReflect ?? 0.5));
      this.heroHp = Math.max(0, this.heroHp - reflected);
      return { damage: 0, rawDamage: 0, blocked: false, crit: false, targetIndex, counterReflected: reflected };
    }
    const raw    = this._heroAtk + Math.floor(Math.random() * 8);
    const crit   = Math.random() < this._heroLck * 0.02;
    const blocked = this._enemyDefending;
    let dmg = blocked
      ? Math.floor(raw / 2)
      : Math.floor(raw * (crit ? 1.5 : 1));
    if (blocked) this._enemyDefending = false;
    if (this.heroCursed) dmg = Math.floor(dmg * (this._config.curseDmgMult ?? 0.6));

    let phase2Triggered = false;
    if (this.isMulti) {
      const t = this.enemies[targetIndex];
      if (!t || t.hp <= 0) return { damage: 0, crit: false, blocked: false, targetIndex };
      t.hp = Math.max(0, t.hp - dmg);
      if (t.hp <= 0) this._checkGnollVengeance();
    } else {
      this.enemyHp = Math.max(0, this.enemyHp - dmg);
      if (!this.phase2Active && this._config.ai === 'shadowLord'
          && this.enemyHp <= this._config.phase2Threshold) {
        this.phase2Active        = true;
        this.phase2JustTriggered = true;
        phase2Triggered          = true;
      }
    }
    return { damage: dmg, rawDamage: raw, blocked, crit, targetIndex, phase2Triggered };
  }

  heroHeal() {
    if (this.heroHealBlocked) {
      this.heroHealBlocked = false;
      return { healed: 0, blocked: true };
    }
    const healed = Math.min(30, this.heroMaxHp - this.heroHp);
    this.heroHp += healed;
    return { healed, blocked: false };
  }

  heroDoubleSlash(targetIndex = 0) {
    const hit1 = this.heroAttack(targetIndex);
    const alive = this.isMulti
      ? (this.enemies[targetIndex]?.hp ?? 0) > 0
      : this.enemyHp > 0;
    const hit2 = alive ? this.heroAttack(targetIndex) : null;
    return { hit1, hit2 };
  }

  heroShield() {
    this.heroShieldActive = true;
    this.heroShieldTurns  = 1 + Math.floor(Math.random() * 2);
    return { turns: this.heroShieldTurns };
  }

  // ── Enemy AI & actions ────────────────────────────────────────────────────

  enemyAI() {
    switch (this._config.ai) {
      case 'orc':        return this._orcAI();
      case 'witch':      return this._witchAI();
      case 'gnolls':     return 'attack';
      case 'shadowLord': return this._shadowLordAI();
      case 'cave_bat':        return 'attack';
      case 'cave_dwarf':      return this._caveDwarfAI();
      case 'cave_miner':      return this._caveMinerAI();
      case 'cave_troll':      return this._caveTrollAI();
      case 'cave_troll_king': return this._caveTrollKingAI();
      default:           return this._goblinAI();
    }
  }

  enemyAttack() {
    switch (this._config.ai) {
      case 'witch':      return [this._witchDoAttack()];
      case 'gnolls':     return this._gnollsDoAttack();
      case 'shadowLord': return this._shadowLordDoAttack();
      case 'cave_bat':        return this._gnollsDoAttack();
      case 'cave_dwarf':      return [this._basicEnemyAttack()];
      case 'cave_miner':      return [this._basicEnemyAttack()];
      case 'cave_troll':      return [this._trollDoAttack()];
      case 'cave_troll_king': return [this._trollDoAttack()];
      default:           return [this._basicEnemyAttack()];
    }
  }

  enemyDefend() {
    this._enemyDefending        = true;
    this._enemyDefendedLastTurn = true;
  }

  witchCurse() {
    this.heroCursed      = true;
    this._heroCurseTurns = this._config.curseDuration ?? 2;
    return { curseDuration: this._heroCurseTurns };
  }

  witchRegen() {
    const amount = this._config.regenAmount ?? 10;
    const healed = Math.min(amount, this.enemyMaxHp - this.enemyHp);
    this.enemyHp += healed;
    return { healed };
  }

  canEnemyDefend() { return !this._enemyDefendedLastTurn; }

  isHeroDead()  { return this.heroHp <= 0; }
  isEnemyDead() {
    return this.isMulti
      ? this.enemies.every(e => e.hp <= 0)
      : this.enemyHp <= 0;
  }

  // ── Turn ticks ────────────────────────────────────────────────────────────

  tickHeroTurn() {
    if (this.heroCursed) {
      this._heroCurseTurns--;
      if (this._heroCurseTurns <= 0) this.heroCursed = false;
    }
  }

  tickEnemyTurn() {
    this._enemyDefendedLastTurn = false;
    this.phase2JustTriggered    = false;
    if (this._config.ai === 'shadowLord') {
      this._healBlockCounter++;
      this.heroHealBlocked =
        (this._healBlockCounter % (this._config.healBlockEvery ?? 2) === 0);
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  _applyDamageToHero(rawAtk) {
    const dodgeChance = Math.max(0, this._heroSpd - 8) * 0.01;
    if (Math.random() < dodgeChance)
      return { damage: 0, rawDamage: rawAtk, dodged: true, shieldAbsorbed: false, shieldBroken: false };

    const defReduction = this._heroDef / (this._heroDef + 20);
    let   dmg           = Math.floor(rawAtk * (1 - defReduction));
    let   shieldAbsorbed = false;
    let   shieldBroken   = false;

    if (this.heroShieldActive) {
      dmg            = Math.floor(dmg * 0.9);
      shieldAbsorbed = true;
      this.heroShieldTurns--;
      if (this.heroShieldTurns <= 0) this.heroShieldActive = false;
    }
    this.heroHp = Math.max(0, this.heroHp - dmg);
    return { damage: dmg, rawDamage: rawAtk, dodged: false, shieldAbsorbed, shieldBroken };
  }

  _basicEnemyAttack() {
    const cfg   = this._config;
    const range = cfg.atkMax - cfg.atkMin;
    const raw   = cfg.atkMin + Math.floor(Math.random() * (range + 1));
    const mult  = this.orcRageActive ? (cfg.rageAtkMult ?? 1.5) : 1;
    this._enemyDefendedLastTurn = false;
    return this._applyDamageToHero(Math.floor(raw * mult));
  }

  _witchDoAttack() {
    const cfg    = this._config;
    const range  = cfg.atkMax - cfg.atkMin;
    const raw    = cfg.atkMin + Math.floor(Math.random() * (range + 1));
    const pierce = cfg.defPierce ?? 0;
    const savedDef  = this._heroDef;
    this._heroDef   = this._heroDef * (1 - pierce);
    const result    = this._applyDamageToHero(raw);
    this._heroDef   = savedDef;
    result.defPierced = true;
    return result;
  }

  _gnollsDoAttack() {
    const bonus = this.gnollVengeanceActive ? (this._config.vengeanceAtkBonus ?? 12) : 0;
    return this.enemies
      .filter(e => e.hp > 0)
      .map(gnoll => {
        const range = gnoll.atkMax - gnoll.atkMin;
        const raw   = gnoll.atkMin + Math.floor(Math.random() * (range + 1)) + bonus;
        return { ...this._applyDamageToHero(raw), attacker: gnoll.name };
      });
  }

  _trollDoAttack() {
    const cfg     = this._config;
    const mult    = this.phase2Active ? (cfg.phase2AtkMult ?? 1.5) : 1;
    const range   = cfg.atkMax - cfg.atkMin;
    const raw     = cfg.atkMin + Math.floor(Math.random() * (range + 1));
    const result  = this._applyDamageToHero(Math.floor(raw * mult));
    const regen   = cfg.regenPerTurn ?? 0;
    const healed  = Math.min(regen, this.enemyMaxHp - this.enemyHp);
    this.enemyHp += healed;
    result.trollRegen = healed;
    return result;
  }

  explosion() {
    const dmg  = this._config.explosionDamage ?? 60;
    this.heroHp = Math.max(0, this.heroHp - dmg);
    return { damage: dmg };
  }

  trollQuake() {
    const dmg         = this._config.quakeDamage ?? 40;
    const shieldBroken = this.heroShieldActive;
    this.heroShieldActive = false;
    this.heroShieldTurns  = 0;
    this.heroHp = Math.max(0, this.heroHp - dmg);
    return { damage: dmg, shieldBroken };
  }

  _shadowLordDoAttack() {
    const cfg   = this._config;
    const range = cfg.atkMax - cfg.atkMin;
    const raw   = cfg.atkMin + Math.floor(Math.random() * (range + 1));
    const mult  = this.phase2Active ? (cfg.phase2AtkMult ?? 1.4) : 1;
    const finalRaw = Math.floor(raw * mult);

    const result = this._applyDamageToHero(finalRaw);

    // Shield break
    if (this.heroShieldActive && Math.random() < (cfg.shieldBreakChance ?? 0.35)) {
      this.heroShieldActive = false;
      this.heroShieldTurns  = 0;
      result.shieldBroken   = true;
    }

    const results = [result];

    // Double hit
    if (Math.random() < (cfg.doubleHitChance ?? 0.45)) {
      const r2 = this._applyDamageToHero(Math.floor(finalRaw * (cfg.doubleHitMult ?? 0.6)));
      r2.isDoubleHit = true;
      results.push(r2);
    }

    return results;
  }

  _goblinAI() {
    if (!this.canEnemyDefend()) return 'attack';
    return Math.random() < 0.6 ? 'attack' : 'defend';
  }

  _orcAI() {
    const hpRatio = this.enemyHp / this.enemyMaxHp;
    if (hpRatio <= (this._config.rageThreshold ?? 0.35)) {
      this.orcRageActive = true;
      return 'attack';
    }
    if (!this.canEnemyDefend()) return 'attack';
    return Math.random() < 0.75 ? 'attack' : 'defend';
  }

  _witchAI() {
    if (!this.heroCursed && Math.random() < (this._config.curseChance ?? 0.25)) return 'curse';
    if (this.enemyHp < this.enemyMaxHp * 0.65 && Math.random() < 0.4) return 'regen';
    return 'attack';
  }

  _shadowLordAI() {
    if (!this.phase2Active && this.enemyHp <= this._config.phase2Threshold) {
      this.phase2Active        = true;
      this.phase2JustTriggered = true;
      return 'phase2';
    }
    return 'attack';
  }

  _caveDwarfAI() {
    this._dwarfTurnCounter++;
    if (this._dwarfTurnCounter % (this._config.counterCycle ?? 3) === 0) {
      this.dwarfCounterActive = true;
      return 'counterAttack';
    }
    return 'attack';
  }

  _caveMinerAI() {
    this._minerCountdown++;
    if (this._minerCountdown >= (this._config.explosionCountdown ?? 3)) {
      this._minerCountdown = 0;
      return 'explosion';
    }
    return 'attack';
  }

  _caveTrollAI() {
    this._trollTurnCounter++;
    if (this._trollTurnCounter % (this._config.heavyBlowCycle ?? 3) === 0) return 'heavyBlow';
    return 'attack';
  }

  _caveTrollKingAI() {
    if (!this.phase2Active && this.enemyHp <= (this._config.phase2Threshold ?? 155)) {
      this.phase2Active        = true;
      this.phase2JustTriggered = true;
      return 'phase2';
    }
    this._trollTurnCounter++;
    if (this._trollTurnCounter % (this._config.quakeCycle ?? 3) === 0) return 'quake';
    return 'attack';
  }

  _checkGnollVengeance() {
    if (!this.gnollVengeanceActive) {
      const aliveCount = this.enemies.filter(e => e.hp > 0).length;
      if (aliveCount === 1) this.gnollVengeanceActive = true;
    }
  }
}
