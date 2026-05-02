export default class BattleState {
  constructor(playerState = null) {
    const stats       = playerState ? playerState.computedStats() : null;
    this.heroMaxHp    = stats?.hp  ?? 100;
    this.heroHp       = this.heroMaxHp;
    this._heroAtk     = stats?.atk ?? 18;
    this._heroDef     = stats?.def ?? 0;
    this._heroSpd     = stats?.spd ?? 8;
    this._heroLck     = stats?.lck ?? 5;

    this.goblinHp    = 80;
    this.goblinMaxHp = 80;

    this.goblinDefending         = false;
    this._goblinDefendedLastTurn = false;
    this.heroShieldActive        = false;
    this.heroShieldTurns         = 0;
  }

  heroAttack() {
    const raw     = this._heroAtk + Math.floor(Math.random() * 8);
    const crit    = Math.random() < this._heroLck * 0.02;
    const blocked = this.goblinDefending;
    const damage  = blocked
      ? Math.floor(raw / 2)
      : Math.floor(raw * (crit ? 1.5 : 1));
    this.goblinHp = Math.max(0, this.goblinHp - damage);
    if (blocked) this.goblinDefending = false;
    return { damage, rawDamage: raw, blocked, crit };
  }

  heroHeal() {
    const missing = this.heroMaxHp - this.heroHp;
    const healed  = Math.min(30, missing);
    this.heroHp  += healed;
    return { healed };
  }

  heroDoubleSlash() {
    const hit1 = this.heroAttack();
    const hit2 = this._goblinAlive() ? this.heroAttack() : null;
    return { hit1, hit2 };
  }

  heroShield() {
    this.heroShieldActive = true;
    this.heroShieldTurns  = 1 + Math.floor(Math.random() * 2);
    return { turns: this.heroShieldTurns };
  }

  goblinAttack() {
    const raw         = 12 + Math.floor(Math.random() * 9);
    const dodgeChance = Math.max(0, this._heroSpd - 8) * 0.01;

    if (Math.random() < dodgeChance) {
      this._goblinDefendedLastTurn = false;
      return { damage: 0, rawDamage: raw, dodged: true, shieldAbsorbed: false };
    }

    const defReduction = this._heroDef / (this._heroDef + 20);
    let   damage       = Math.floor(raw * (1 - defReduction));
    let   shieldAbsorbed = false;

    if (this.heroShieldActive) {
      damage         = Math.floor(damage * 0.9);
      shieldAbsorbed = true;
      this.heroShieldTurns--;
      if (this.heroShieldTurns <= 0) this.heroShieldActive = false;
    }

    this.heroHp = Math.max(0, this.heroHp - damage);
    this._goblinDefendedLastTurn = false;
    return { damage, rawDamage: raw, dodged: false, shieldAbsorbed };
  }

  goblinDefend() {
    this.goblinDefending         = true;
    this._goblinDefendedLastTurn = true;
  }

  canGoblinDefend() { return !this._goblinDefendedLastTurn; }

  goblinAI() {
    if (!this.canGoblinDefend()) return 'attack';
    return Math.random() < 0.6 ? 'attack' : 'defend';
  }

  isHeroDead()   { return this.heroHp   <= 0; }
  isGoblinDead() { return this.goblinHp <= 0; }
  _goblinAlive() { return this.goblinHp > 0; }
}
