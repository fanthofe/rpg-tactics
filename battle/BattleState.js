import { ENEMIES } from './enemies.js';

export default class BattleState {
  constructor(playerState = null, enemyConfig = null, initHeroHp = null) {
    const stats = playerState ? playerState.computedStats() : null;
    this.heroMaxHp = stats?.hp  ?? 100;
    this.heroHp    = initHeroHp !== null ? Math.min(initHeroHp, this.heroMaxHp) : this.heroMaxHp;
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

    // Pirate Grunt
    this.pillageStacks      = 0;

    // Pirate Quartermaster
    this.heroPoisoned       = false;
    this.heroPoisonDamage   = 0;

    // Pirate Captain
    this._captainTurnCounter = 0;

    // Frozen status (frost_troll / ice_witch)
    this.heroFrozen       = false;
    this._heroFrozenTurns = 0;

    // Burn status (demon_warrior / demon_lord)
    this.heroBurning    = false;
    this.heroBurnDamage = 0;
    this._heroBurnTurns = 0;

    // Frost Troll
    this._frostTrollTurnCounter = 0;

    // Ice Witch
    this._iceWitchTurnCounter = 0;

    // Ghost Knight
    this._ghostKnightTurnCounter = 0;

    // Vampire
    this._vampireTurnCounter = 0;

    // Demon Warrior
    this._demonWarriorTurnCounter = 0;

    // Demon Lord
    this._demonLordTurnCounter = 0;

    // Cursed Knight
    this._cursedKnightTurnCounter = 0;

    // Jungle Beast
    this._beastTurnCounter = 0;
    this.beastFrenzyActive = false;

    // Skeleton
    this._skeletonTurnCounter = 0;

    // Lich
    this._lichTurnCounter = 0;
  }

  // ── Hero actions ──────────────────────────────────────────────────────────

  heroAttack(targetIndex = 0) {
    if (this.dwarfCounterActive) {
      this.dwarfCounterActive = false;
      const reflected = Math.floor(this._heroAtk * (this._config.counterReflect ?? 0.5));
      this.heroHp = Math.max(0, this.heroHp - reflected);
      return { damage: 0, rawDamage: 0, blocked: false, crit: false, targetIndex, counterReflected: reflected };
    }
    if (this._config.ai === 'ghost_knight' && !this.phase2Active) {
      if (Math.random() < (this._config.phaseEvadeChance ?? 0.30)) {
        return { damage: 0, rawDamage: 0, blocked: false, crit: false, targetIndex, phaseEvaded: true };
      }
    }
    const raw    = this._heroAtk + Math.floor(Math.random() * 8);
    const crit   = Math.random() < this._heroLck * 0.02;
    const blocked = this._enemyDefending;
    let dmg = blocked
      ? Math.floor(raw / 2)
      : Math.floor(raw * (crit ? 1.5 : 1));
    if (blocked) this._enemyDefending = false;
    if (this.heroCursed) dmg = Math.floor(dmg * (this._config.curseDmgMult ?? 0.6));
    if (this.heroFrozen) dmg = Math.floor(dmg * 0.60);

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
    const healed = Math.min(Math.floor(this.heroMaxHp * 0.25), this.heroMaxHp - this.heroHp);
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
      case 'pirate_grunt':         return 'attack';
      case 'pirate_crew':          return 'attack';
      case 'pirate_quartermaster': return this._pirateQmAI();
      case 'pirate_captain':       return this._pirateCaptainAI();
      case 'cursed_knight': return this._cursedKnightAI();
      case 'jungle_beast':  return this._jungleBeastAI();
      case 'skeleton':      return this._skeletonAI();
      case 'lich':          return this._lichAI();
      case 'frost_troll':   return this._frostTrollAI();
      case 'ice_witch':     return this._iceWitchAI();
      case 'ghost_knight':  return this._ghostKnightAI();
      case 'vampire':       return this._vampireAI();
      case 'demon_warrior': return this._demonWarriorAI();
      case 'demon_lord':    return this._demonLordAI();
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
      case 'pirate_grunt':         return [this._pirateGruntDoAttack()];
      case 'pirate_crew':          return this._gnollsDoAttack();
      case 'pirate_quartermaster': return [this._basicEnemyAttack()];
      case 'pirate_captain':       return [this._basicEnemyAttack()];
      case 'cursed_knight': return [this._basicEnemyAttack()];
      case 'jungle_beast':  return [this._jungleBeastDoAttack()];
      case 'skeleton':      return [this._skeletonDoAttack()];
      case 'lich':          return [this._lichDoAttack()];
      case 'frost_troll':   return [this._frostTrollDoAttack()];
      case 'ice_witch':     return [this._witchDoAttack()];
      case 'ghost_knight':  return [this._ghostKnightDoAttack()];
      case 'vampire':       return this._vampireDoAttack();
      case 'demon_warrior': return [this._basicEnemyAttack()];
      case 'demon_lord':    return this._demonLordDoAttack();
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
    if (this.heroFrozen) {
      this._heroFrozenTurns--;
      if (this._heroFrozenTurns <= 0) this.heroFrozen = false;
    }
    if (this.heroPoisoned && this.heroPoisonDamage > 0) {
      this.heroHp = Math.max(0, this.heroHp - this.heroPoisonDamage);
    }
    if (this.heroBurning && this.heroBurnDamage > 0) {
      this.heroHp = Math.max(0, this.heroHp - this.heroBurnDamage);
      this._heroBurnTurns--;
      if (this._heroBurnTurns <= 0) { this.heroBurning = false; this.heroBurnDamage = 0; }
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
    const dodgeChance = this._heroSpd * 0.012;
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

  _pirateGruntDoAttack() {
    const cfg   = this._config;
    const bonus = this.pillageStacks * (cfg.pillageAtkBonus ?? 8);
    const range = cfg.atkMax - cfg.atkMin;
    const raw   = cfg.atkMin + Math.floor(Math.random() * (range + 1)) + bonus;
    const result = this._applyDamageToHero(raw);
    if (!result.dodged && this.pillageStacks < (cfg.pillageMaxStacks ?? 3)) {
      this.pillageStacks++;
      result.pillaged = true;
    }
    return result;
  }

  cannonball() {
    const dmg  = this._config.cannonballDamage ?? 55;
    this.heroHp = Math.max(0, this.heroHp - dmg);
    return { damage: dmg };
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

  _pirateQmAI() {
    if (!this.heroPoisoned) {
      this.heroPoisoned     = true;
      this.heroPoisonDamage = this._config.poisonDamage ?? 8;
      return 'poison';
    }
    if (!this.canEnemyDefend()) return 'attack';
    return Math.random() < 0.7 ? 'attack' : 'defend';
  }

  _pirateCaptainAI() {
    this._captainTurnCounter++;
    if (this._captainTurnCounter % (this._config.cannonballCycle ?? 3) === 0) return 'cannonball';
    if (!this.canEnemyDefend()) return 'attack';
    return Math.random() < 0.75 ? 'attack' : 'defend';
  }

  _frostTrollAI() {
    if (!this.phase2Active && this.enemyHp <= (this._config.phase2Threshold ?? 142)) {
      this.phase2Active = true; this.phase2JustTriggered = true; return 'phase2';
    }
    this._frostTrollTurnCounter++;
    if (this._frostTrollTurnCounter % (this._config.frostSmashCycle ?? 3) === 0) return 'frostSmash';
    return 'attack';
  }

  _frostTrollDoAttack() {
    const cfg  = this._config;
    const mult = this.phase2Active ? (cfg.phase2AtkMult ?? 1.45) : 1;
    const range = cfg.atkMax - cfg.atkMin;
    const raw  = cfg.atkMin + Math.floor(Math.random() * (range + 1));
    const result = this._applyDamageToHero(Math.floor(raw * mult));
    const healed = Math.min(cfg.regenPerTurn ?? 14, this.enemyMaxHp - this.enemyHp);
    this.enemyHp += healed;
    result.trollRegen = healed;
    return result;
  }

  frostSmash() {
    const cfg = this._config;
    const mult = this.phase2Active ? (cfg.phase2AtkMult ?? 1.45) : 1;
    const shieldBroken = this.heroShieldActive;
    this.heroShieldActive = false; this.heroShieldTurns = 0;
    const dmg = Math.floor((cfg.frostSmashDamage ?? 50) * mult);
    this.heroHp = Math.max(0, this.heroHp - dmg);
    this.heroFrozen       = true;
    this._heroFrozenTurns = cfg.frozenDuration ?? 2;
    return { damage: dmg, shieldBroken, frozenDuration: this._heroFrozenTurns };
  }

  _iceWitchAI() {
    if (!this.heroFrozen && Math.random() < (this._config.blizzardChance ?? 0.35)) return 'blizzard';
    if (this.enemyHp < this.enemyMaxHp * 0.60 && Math.random() < (this._config.regenChance ?? 0.30)) return 'iceRegen';
    return 'attack';
  }

  blizzard() {
    const cfg = this._config;
    const savedDef = this._heroDef;
    this._heroDef  = this._heroDef * (1 - (cfg.defPierce ?? 0.50));
    const result   = this._applyDamageToHero(cfg.blizzardDamage ?? 28);
    this._heroDef  = savedDef;
    this.heroFrozen       = true;
    this._heroFrozenTurns = cfg.frozenDuration ?? 2;
    result.frozenDuration = this._heroFrozenTurns;
    result.blizzard = true;
    return result;
  }

  iceWitchRegen() {
    const amount = this._config.regenAmount ?? 15;
    const healed = Math.min(amount, this.enemyMaxHp - this.enemyHp);
    this.enemyHp += healed;
    return { healed };
  }

  _ghostKnightAI() {
    if (!this.phase2Active && this.enemyHp <= (this._config.phase2Threshold ?? 98)) {
      this.phase2Active = true; this.phase2JustTriggered = true; return 'phase2';
    }
    this._ghostKnightTurnCounter++;
    if (this._ghostKnightTurnCounter % (this._config.hauntCycle ?? 3) === 0) return 'haunt';
    if (!this.canEnemyDefend()) return 'attack';
    return Math.random() < 0.70 ? 'attack' : 'defend';
  }

  _ghostKnightDoAttack() {
    const cfg    = this._config;
    const pierce = this.phase2Active ? 0 : (cfg.defPierce ?? 0.35);
    const mult   = this.phase2Active ? (cfg.phase2AtkMult ?? 1.55) : 1;
    const savedDef = this._heroDef;
    this._heroDef  = this._heroDef * (1 - pierce);
    const range    = cfg.atkMax - cfg.atkMin;
    const raw      = cfg.atkMin + Math.floor(Math.random() * (range + 1));
    const result   = this._applyDamageToHero(Math.floor(raw * mult));
    this._heroDef  = savedDef;
    result.defPierced = pierce > 0;
    return result;
  }

  ghostKnightHaunt() {
    this.heroCursed      = true;
    this._heroCurseTurns = this._config.curseDuration ?? 1;
    return { curseDuration: this._heroCurseTurns };
  }

  _vampireAI() {
    this._vampireTurnCounter++;
    if (this._vampireTurnCounter % (this._config.bloodDrainCycle ?? 3) === 0) return 'bloodDrain';
    if (!this.canEnemyDefend()) return 'attack';
    return Math.random() < 0.70 ? 'attack' : 'defend';
  }

  _vampireDoAttack() {
    const cfg   = this._config;
    const range = cfg.atkMax - cfg.atkMin;
    const raw   = cfg.atkMin + Math.floor(Math.random() * (range + 1));
    const result = this._applyDamageToHero(raw);
    const healed = Math.min(cfg.regenAmount ?? 12, this.enemyMaxHp - this.enemyHp);
    this.enemyHp += healed;
    result.vampireRegen = healed;
    if (Math.random() < (cfg.batSwarmChance ?? 0.30)) {
      const r2 = this._applyDamageToHero(Math.floor(raw * (cfg.batSwarmMult ?? 0.60)));
      r2.isBatSwarm = true;
      return [result, r2];
    }
    return [result];
  }

  bloodDrain() {
    const cfg = this._config;
    const dmg = cfg.bloodDrainAmount ?? 35;
    this.heroHp = Math.max(0, this.heroHp - dmg);
    const healed = Math.min(cfg.bloodDrainHeal ?? 25, this.enemyMaxHp - this.enemyHp);
    this.enemyHp += healed;
    return { damage: dmg, healed };
  }

  _demonWarriorAI() {
    const hpRatio = this.enemyHp / this.enemyMaxHp;
    if (hpRatio <= (this._config.rageThreshold ?? 0.40)) this.orcRageActive = true;
    this._demonWarriorTurnCounter++;
    if (this._demonWarriorTurnCounter % (this._config.fireSlashCycle ?? 3) === 0) return 'fireSlash';
    if (!this.canEnemyDefend()) return 'attack';
    return Math.random() < 0.75 ? 'attack' : 'defend';
  }

  fireSlash() {
    const cfg  = this._config;
    const mult = this.orcRageActive ? (cfg.rageAtkMult ?? 1.6) : 1;
    const range = cfg.atkMax - cfg.atkMin;
    const raw  = Math.floor((cfg.atkMin + Math.floor(Math.random() * (range + 1))) * mult);
    const result = this._applyDamageToHero(raw);
    this.heroBurning    = true;
    this.heroBurnDamage = cfg.burnDamage ?? 12;
    this._heroBurnTurns = cfg.burnDuration ?? 3;
    result.burnDamage   = this.heroBurnDamage;
    return result;
  }

  _demonLordAI() {
    if (!this.phase2Active && this.enemyHp <= (this._config.phase2Threshold ?? 210)) {
      this.phase2Active = true; this.phase2JustTriggered = true; return 'phase2';
    }
    if (!this.heroCursed && Math.random() < (this._config.curseChance ?? 0.25)) return 'demonCurse';
    this._demonLordTurnCounter++;
    if (this._demonLordTurnCounter % (this._config.hellfireCycle ?? 3) === 0) return 'hellfire';
    return 'attack';
  }

  _demonLordDoAttack() {
    const cfg    = this._config;
    const pierce = cfg.defPierce ?? 0.35;
    const mult   = this.phase2Active ? (cfg.phase2AtkMult ?? 1.75) : 1;
    const savedDef = this._heroDef;
    this._heroDef  = this._heroDef * (1 - pierce);
    const range    = cfg.atkMax - cfg.atkMin;
    const finalRaw = Math.floor((cfg.atkMin + Math.floor(Math.random() * (range + 1))) * mult);
    const result   = this._applyDamageToHero(finalRaw);
    this._heroDef  = savedDef;
    result.defPierced = true;
    if (this.heroShieldActive && Math.random() < (cfg.shieldBreakChance ?? 0.40)) {
      this.heroShieldActive = false; this.heroShieldTurns = 0; result.shieldBroken = true;
    }
    const results = [result];
    if (Math.random() < (cfg.doubleHitChance ?? 0.45)) {
      const r2 = this._applyDamageToHero(Math.floor(finalRaw * (cfg.doubleHitMult ?? 0.65)));
      r2.isDoubleHit = true;
      results.push(r2);
    }
    return results;
  }

  demonCurse() {
    this.heroCursed      = true;
    this._heroCurseTurns = this._config.curseDuration ?? 2;
    return { curseDuration: this._heroCurseTurns };
  }

  hellfire() {
    const cfg  = this._config;
    const mult = this.phase2Active ? (cfg.phase2AtkMult ?? 1.75) : 1;
    const dmg  = Math.floor((cfg.hellfireDamage ?? 70) * mult);
    const shieldBroken = this.heroShieldActive;
    this.heroShieldActive = false; this.heroShieldTurns = 0;
    this.heroHp = Math.max(0, this.heroHp - dmg);
    this.heroBurning    = true;
    this.heroBurnDamage = cfg.burnDamage ?? 18;
    this._heroBurnTurns = cfg.burnDuration ?? 3;
    return { damage: dmg, shieldBroken, burnDamage: this.heroBurnDamage };
  }

  _cursedKnightAI() {
    this._cursedKnightTurnCounter++;
    const hpRatio = this.enemyHp / this.enemyMaxHp;
    if (hpRatio <= (this._config.rageThreshold ?? 0.35)) this.orcRageActive = true;
    if (this._cursedKnightTurnCounter % (this._config.shieldCrushCycle ?? 3) === 0) return 'shieldCrush';
    if (!this.canEnemyDefend()) return 'attack';
    return Math.random() < 0.70 ? 'attack' : 'defend';
  }

  shieldCrush() {
    const cfg = this._config;
    const shieldBroken = this.heroShieldActive;
    this.heroShieldActive = false;
    this.heroShieldTurns  = 0;
    const mult = this.orcRageActive ? (cfg.rageAtkMult ?? 1.5) : 1;
    const dmg  = Math.floor((cfg.shieldCrushDamage ?? 45) * mult);
    this.heroHp = Math.max(0, this.heroHp - dmg);
    return { damage: dmg, shieldBroken };
  }

  _jungleBeastAI() {
    const hpRatio = this.enemyHp / this.enemyMaxHp;
    if (hpRatio <= (this._config.frenzyThreshold ?? 0.40)) this.beastFrenzyActive = true;
    this._beastTurnCounter++;
    if (this._beastTurnCounter % (this._config.pounceCycle ?? 3) === 0) return 'pounce';
    return 'attack';
  }

  _jungleBeastDoAttack() {
    const cfg  = this._config;
    const mult = this.beastFrenzyActive ? (cfg.frenzyAtkMult ?? 1.45) : 1;
    const range = cfg.atkMax - cfg.atkMin;
    const raw  = cfg.atkMin + Math.floor(Math.random() * (range + 1));
    const result = this._applyDamageToHero(Math.floor(raw * mult));
    result.frenzy = this.beastFrenzyActive;
    return result;
  }

  beastPounce() {
    const cfg  = this._config;
    const mult = this.beastFrenzyActive ? (cfg.frenzyAtkMult ?? 1.45) : 1;
    const range = cfg.atkMax - cfg.atkMin;
    const rawHit = () => Math.floor((cfg.atkMin + Math.floor(Math.random() * (range + 1))) * (cfg.pounceHitMult ?? 0.70) * mult);
    const r1 = this._applyDamageToHero(rawHit());
    const r2 = this.heroHp > 0 ? this._applyDamageToHero(rawHit()) : null;
    return { hit1: r1, hit2: r2, frenzy: this.beastFrenzyActive };
  }

  _skeletonAI() {
    this._skeletonTurnCounter++;
    if (this._skeletonTurnCounter % (this._config.boneSpearCycle ?? 3) === 0) return 'boneSpear';
    if (!this.canEnemyDefend()) return 'attack';
    return Math.random() < 0.65 ? 'attack' : 'defend';
  }

  _skeletonDoAttack() {
    return this._witchDoAttack();
  }

  boneSpear() {
    const cfg = this._config;
    const range = cfg.atkMax - cfg.atkMin;
    const raw  = cfg.atkMin + Math.floor(Math.random() * (range + 1));
    const savedDef = this._heroDef;
    this._heroDef  = 0;
    const result   = this._applyDamageToHero(raw);
    this._heroDef  = savedDef;
    result.boneSpear = true;
    return result;
  }

  _lichAI() {
    if (!this.heroCursed && Math.random() < (this._config.curseChance ?? 0.30)) return 'lichCurse';
    this._lichTurnCounter++;
    if (this._lichTurnCounter % (this._config.soulDrainCycle ?? 3) === 0) return 'soulDrain';
    return 'attack';
  }

  _lichDoAttack() {
    return this._witchDoAttack();
  }

  lichCurse() {
    this.heroCursed      = true;
    this._heroCurseTurns = this._config.curseDuration ?? 2;
    return { curseDuration: this._heroCurseTurns };
  }

  soulDrain() {
    const cfg   = this._config;
    const range = cfg.atkMax - cfg.atkMin;
    const raw   = cfg.atkMin + Math.floor(Math.random() * (range + 1));
    const savedDef = this._heroDef;
    this._heroDef  = 0;
    const result   = this._applyDamageToHero(raw);
    this._heroDef  = savedDef;
    const healed   = Math.min(cfg.soulDrainHeal ?? 30, this.enemyMaxHp - this.enemyHp);
    this.enemyHp  += healed;
    result.soulDrained = healed;
    return result;
  }

  _checkGnollVengeance() {
    if (!this.gnollVengeanceActive) {
      const aliveCount = this.enemies.filter(e => e.hp > 0).length;
      if (aliveCount === 1) this.gnollVengeanceActive = true;
    }
  }
}
