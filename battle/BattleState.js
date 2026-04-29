export default class BattleState {
  constructor() {
    this.heroHp      = 100;
    this.heroMaxHp   = 100;
    this.goblinHp    = 80;
    this.goblinMaxHp = 80;
    this.goblinDefending         = false;
    this._goblinDefendedLastTurn = false;
  }

  heroAttack() {
    const raw     = 18 + Math.floor(Math.random() * 8);
    const blocked = this.goblinDefending;
    const damage  = blocked ? Math.floor(raw / 2) : raw;
    this.goblinHp = Math.max(0, this.goblinHp - damage);
    if (blocked) this.goblinDefending = false;
    return { damage, rawDamage: raw, blocked };
  }

  heroHeal() {
    const missing = this.heroMaxHp - this.heroHp;
    const healed  = Math.min(30, missing);
    this.heroHp  += healed;
    return { healed };
  }

  goblinAttack() {
    const damage  = 12 + Math.floor(Math.random() * 9);
    this.heroHp   = Math.max(0, this.heroHp - damage);
    this._goblinDefendedLastTurn = false;
    return { damage };
  }

  goblinDefend() {
    this.goblinDefending         = true;
    this._goblinDefendedLastTurn = true;
  }

  canGoblinDefend() {
    return !this._goblinDefendedLastTurn;
  }

  goblinAI() {
    if (!this.canGoblinDefend()) return 'attack';
    return Math.random() < 0.6 ? 'attack' : 'defend';
  }

  isHeroDead()   { return this.heroHp <= 0; }
  isGoblinDead() { return this.goblinHp <= 0; }
}
