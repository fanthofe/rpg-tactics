# Menu Scene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a full-screen inventory/equipment menu scene that appears before each battle, persists player state between fights, and awards item drops after victories.

**Architecture:** `PlayerState` (pure JS class) holds all player data accessible globally via `window.playerState`. `MenuScene` (Phaser) renders the background and animated hero sprite; `MenuUI` (DOM overlay, `position:absolute; inset:0`) handles equipment/inventory with HTML5 drag & drop. `BattleState` reads `PlayerState` to compute real combat stats.

**Tech Stack:** Phaser 3.60, vanilla JS ES modules, HTML5 Drag & Drop API, browser-based test runner (pattern: `tests/battle-state.test.html`)

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `battle/items.js` | Create | Item catalog + rarity + drop weights |
| `battle/PlayerState.js` | Create | Stats computation, inventory, equip logic |
| `tests/player-state.test.html` | Create | Unit tests for PlayerState |
| `battle/BattleState.js` | Modify | Accept PlayerState; crit, dodge, DEF reduction |
| `tests/battle-state.test.html` | Modify | Add tests for new formulas |
| `index.html` | Modify | Add `#menu-overlay`, `#loot-overlay`; update `#end-overlay` |
| `ui/MenuUI.js` | Create | Full-screen DOM overlay: 3 columns + drag & drop + loot screen |
| `scenes/MenuScene.js` | Create | Phaser scene: background + hero idle + event bridge |
| `game.js` | Modify | Start scene = MenuScene; init `window.playerState` |
| `scenes/BattleScene.js` | Modify | Pass PlayerState to BattleState; loot gen; victory → MenuScene |
| `ui/BattleUI.js` | Modify | Add "Retour au menu" button; skip end-overlay on victory |

---

## Task 1 — `battle/items.js`

**Files:**
- Create: `battle/items.js`

- [ ] **Create the items catalog**

```js
// battle/items.js
export const ITEMS = {
  // ── Commun ──────────────────────────────────────────────────
  'sword-iron':    { name: 'Épée de fer',       slot: 'weapon',    icon: '⚔',  rarity: 'common', stats: { atk: 6 } },
  'armor-leather': { name: 'Armure de cuir',    slot: 'armor',     icon: '🛡', rarity: 'common', stats: { def: 8 } },
  'helmet-iron':   { name: 'Casque en fer',     slot: 'helmet',    icon: '⛑', rarity: 'common', stats: { def: 4, hp: 10 } },
  'ring-strength': { name: 'Bague de force',    slot: 'accessory', icon: '💍', rarity: 'common', stats: { atk: 5 } },
  'ring-speed':    { name: 'Anneau de vitesse', slot: 'accessory', icon: '🏃', rarity: 'common', stats: { spd: 5 } },
  'amulet-luck':   { name: 'Amulette de chance',slot: 'accessory', icon: '📿', rarity: 'common', stats: { lck: 8 } },
  // ── Rare ────────────────────────────────────────────────────
  'sword-bronze':  { name: 'Épée de bronze',    slot: 'weapon',    icon: '⚔',  rarity: 'rare',   stats: { atk: 10 } },
  'dagger-fast':   { name: 'Dague rapide',      slot: 'weapon',    icon: '🗡', rarity: 'rare',   stats: { atk: 4, spd: 5 } },
  'armor-chain':   { name: 'Armure de mailles', slot: 'armor',     icon: '🛡', rarity: 'rare',   stats: { def: 15 } },
  'helmet-steel':  { name: "Casque d'acier",    slot: 'helmet',    icon: '⛑', rarity: 'rare',   stats: { def: 8, hp: 20 } },
  'charm-life':    { name: 'Charme de vie',     slot: 'accessory', icon: '💎', rarity: 'rare',   stats: { hp: 25 } },
  // ── Épique ──────────────────────────────────────────────────
  'sword-runic':   { name: 'Épée runique',      slot: 'weapon',    icon: '⚡', rarity: 'epic',   stats: { atk: 16, lck: 3 } },
  'armor-paladin': { name: 'Armure du Paladin', slot: 'armor',     icon: '🔱', rarity: 'epic',   stats: { def: 18, hp: 20 } },
  'helmet-dragon': { name: 'Casque du Dragon',  slot: 'helmet',    icon: '🐉', rarity: 'epic',   stats: { def: 12, hp: 10, spd: 3 } },
  'ring-demon':    { name: 'Anneau du Démon',   slot: 'accessory', icon: '😈', rarity: 'epic',   stats: { atk: 8, spd: 8 } },
};

// Drop probability per rarity (%)
export const DROP_WEIGHTS = { common: 60, rare: 30, epic: 10 };

// Pick a random loot item excluding already-owned ids
export function rollLoot(ownedIds) {
  const owned = new Set(ownedIds);
  const roll  = Math.random() * 100;
  const rarity = roll < 10 ? 'epic' : roll < 40 ? 'rare' : 'common';

  let pool = Object.entries(ITEMS)
    .filter(([id, item]) => item.rarity === rarity && !owned.has(id))
    .map(([id]) => id);

  // Fallback: if all items of this rarity are owned, pick any unowned item
  if (pool.length === 0) {
    pool = Object.entries(ITEMS)
      .filter(([id]) => !owned.has(id))
      .map(([id]) => id);
  }

  if (pool.length === 0) return null; // all items owned
  return pool[Math.floor(Math.random() * pool.length)];
}
```

- [ ] **Commit**

```bash
git add battle/items.js
git commit -m "feat: add items catalog with rarity and rollLoot helper"
```

---

## Task 2 — `battle/PlayerState.js` (TDD)

**Files:**
- Create: `battle/PlayerState.js`
- Create: `tests/player-state.test.html`

- [ ] **Write the failing tests** — create `tests/player-state.test.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>PlayerState Tests</title>
  <style>
    body { font-family: monospace; background: #111; color: #eee; padding: 20px; }
    .pass { color: #2ECC71; } .fail { color: #E74C3C; }
    h2 { color: #F0C040; }
  </style>
</head>
<body>
<h2>PlayerState Tests</h2>
<div id="results"></div>
<script type="module">
import PlayerState from '../battle/PlayerState.js';

const results = document.getElementById('results');
let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    results.innerHTML += `<div class="pass">✓ ${name}</div>`;
    passed++;
  } catch (e) {
    results.innerHTML += `<div class="fail">✗ ${name}: ${e.message}</div>`;
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg ?? 'assertion failed');
}

// ── computedStats ──────────────────────────────────────────────
test('computedStats() with no equipment returns baseStats', () => {
  const p = new PlayerState();
  const s = p.computedStats();
  assert(s.hp === 100, `hp=${s.hp}`);
  assert(s.atk === 18, `atk=${s.atk}`);
  assert(s.def === 0,  `def=${s.def}`);
  assert(s.spd === 8,  `spd=${s.spd}`);
  assert(s.lck === 5,  `lck=${s.lck}`);
});

test('computedStats() adds weapon atk bonus', () => {
  const p = new PlayerState();
  p.equip('sword-iron', 'weapon'); // +6 ATK
  assert(p.computedStats().atk === 24, `atk=${p.computedStats().atk}`);
});

test('computedStats() stacks multiple equipment bonuses', () => {
  const p = new PlayerState();
  p.equip('sword-iron', 'weapon');    // +6 ATK
  p.equip('armor-leather', 'armor');  // +8 DEF
  p.equip('helmet-iron', 'helmet');   // +4 DEF, +10 HP
  const s = p.computedStats();
  assert(s.atk === 24,  `atk=${s.atk}`);
  assert(s.def === 12,  `def=${s.def}`);
  assert(s.hp  === 110, `hp=${s.hp}`);
});

// ── equip ─────────────────────────────────────────────────────
test('equip() moves item from inventory to slot', () => {
  const p = new PlayerState();
  assert(p.inventory.includes('sword-iron'));
  p.equip('sword-iron', 'weapon');
  assert(p.equipped.weapon === 'sword-iron');
  assert(!p.inventory.includes('sword-iron'));
});

test('equip() returns previously equipped item to inventory', () => {
  const p = new PlayerState();
  p.equip('sword-iron', 'weapon');
  p.inventory.push('sword-bronze');
  p.equip('sword-bronze', 'weapon');
  assert(p.equipped.weapon === 'sword-bronze');
  assert(p.inventory.includes('sword-iron'), 'old item back in inventory');
  assert(!p.inventory.includes('sword-bronze'));
});

// ── unequip ───────────────────────────────────────────────────
test('unequip() moves item from slot back to inventory', () => {
  const p = new PlayerState();
  p.equip('sword-iron', 'weapon');
  p.unequip('weapon');
  assert(p.equipped.weapon === null);
  assert(p.inventory.includes('sword-iron'));
});

test('unequip() on empty slot does nothing', () => {
  const p = new PlayerState();
  p.unequip('accessory1'); // no item there
  assert(p.equipped.accessory1 === null);
});

// ── addToInventory ────────────────────────────────────────────
test('addToInventory() adds item to inventory', () => {
  const p = new PlayerState();
  p.addToInventory('ring-speed');
  assert(p.inventory.includes('ring-speed'));
});

test('addToInventory() removes oldest item when full (12 slots)', () => {
  const p = new PlayerState();
  p.inventory = [];
  // Fill 12 slots
  const ids = ['i0','i1','i2','i3','i4','i5','i6','i7','i8','i9','i10','i11'];
  ids.forEach(id => p.inventory.push(id));
  p.addToInventory('new-item');
  assert(p.inventory.length === 12, `length=${p.inventory.length}`);
  assert(!p.inventory.includes('i0'), 'oldest removed');
  assert(p.inventory.includes('new-item'), 'new item added');
});

// ── isEquipped ────────────────────────────────────────────────
test('isEquipped() returns true when item is in any slot', () => {
  const p = new PlayerState();
  p.equip('sword-iron', 'weapon');
  assert(p.isEquipped('sword-iron') === true);
});

test('isEquipped() returns false when item is not equipped', () => {
  const p = new PlayerState();
  assert(p.isEquipped('sword-iron') === false);
});

results.innerHTML += `<hr><b>${passed} passed, ${failed} failed</b>`;
</script>
</body>
</html>
```

- [ ] **Open `http://localhost:8080/tests/player-state.test.html` — verify all tests FAIL** (PlayerState not found)

- [ ] **Create `battle/PlayerState.js`**

```js
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
```

- [ ] **Reload `http://localhost:8080/tests/player-state.test.html` — all tests PASS**

- [ ] **Commit**

```bash
git add battle/PlayerState.js tests/player-state.test.html
git commit -m "feat: add PlayerState with inventory/equip logic and tests"
```

---

## Task 3 — Update `battle/BattleState.js`

**Files:**
- Modify: `battle/BattleState.js`
- Modify: `tests/battle-state.test.html`

- [ ] **Add new tests to `tests/battle-state.test.html`** — append before the final result count

Find the line `results.innerHTML += \`<hr>...\`` near the bottom of the test file and insert these tests above it:

```js
// ── PlayerState integration ───────────────────────────────────
import PlayerState from '../battle/PlayerState.js';

test('BattleState uses PlayerState heroMaxHp', () => {
  const p = new PlayerState();
  p.equip('helmet-iron', 'helmet'); // +10 HP
  const s = new BattleState(p);
  assert(s.heroMaxHp === 110, `heroMaxHp=${s.heroMaxHp}`);
  assert(s.heroHp    === 110);
});

test('BattleState without PlayerState uses defaults', () => {
  const s = new BattleState();
  assert(s.heroMaxHp === 100);
});

test('heroAttack() crit: LCK=50 always crits (100% chance)', () => {
  const p = new PlayerState();
  // Force LCK to 50 so crit chance = 100%
  p.baseStats.lck = 50;
  const s = new BattleState(p);
  s.goblinHp = 999;
  const result = s.heroAttack();
  assert(result.crit === true, 'should crit');
  // crit multiplier = 1.5, base atk = 18, min raw = 18 → min crit dmg = 27
  assert(result.damage >= 27, `damage=${result.damage}`);
});

test('heroAttack() no crit: LCK=0 never crits', () => {
  const p = new PlayerState();
  p.baseStats.lck = 0;
  const s = new BattleState(p);
  s.goblinHp = 999;
  for (let i = 0; i < 20; i++) {
    const r = s.heroAttack();
    assert(r.crit === false, `unexpected crit at i=${i}`);
  }
});

test('goblinAttack() DEF=0 applies no reduction', () => {
  const p = new PlayerState(); // def=0
  const s = new BattleState(p);
  // Run 20 attacks and check damage equals raw each time
  for (let i = 0; i < 20; i++) {
    const r = s.goblinAttack();
    if (r.dodged) continue;
    assert(r.damage === r.rawDamage, `damage=${r.damage} raw=${r.rawDamage}`);
  }
});

test('goblinAttack() DEF=20 reduces damage by ~50%', () => {
  const p = new PlayerState();
  p.baseStats.def = 20; // reduction = 20/(20+20) = 0.5
  const s = new BattleState(p);
  s.heroHp = 9999;
  for (let i = 0; i < 20; i++) {
    const r = s.goblinAttack();
    if (r.dodged) continue;
    const expected = Math.floor(r.rawDamage * 0.5);
    assert(r.damage === expected, `damage=${r.damage} expected=${expected}`);
  }
});
```

- [ ] **Open `http://localhost:8080/tests/battle-state.test.html` — new tests FAIL** (BattleState doesn't accept PlayerState yet)

- [ ] **Update `battle/BattleState.js`** — replace the constructor and `heroAttack`/`goblinAttack` methods:

```js
import BattleState from './BattleState.js'; // keep existing export

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
      damage       = Math.floor(damage * 0.9);
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
```

- [ ] **Reload `http://localhost:8080/tests/battle-state.test.html` — all tests PASS**

- [ ] **Commit**

```bash
git add battle/BattleState.js tests/battle-state.test.html
git commit -m "feat: BattleState accepts PlayerState, adds crit/dodge/def-reduction"
```

---

## Task 4 — Update `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Add CSS for menu overlay and loot overlay** — insert before `</style>`:

```css
    /* ── Menu overlay ─────────────────────────────────────────── */
    #menu-overlay {
      position: absolute;
      inset: 0;
      display: none;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(5,2,20,0.88) 0%, rgba(8,4,26,0.93) 100%);
      border: 2px solid #8B6914;
      box-sizing: border-box;
      font-family: 'Courier New', monospace;
    }
    #menu-overlay.visible { display: flex; }

    #menu-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 20px;
      border-bottom: 2px solid #8B6914;
      box-shadow: inset 0 -1px 0 #4A3008, 0 1px 0 #F0C040;
      flex-shrink: 0;
    }
    .menu-title    { font-size: 13px; color: #F0C040; letter-spacing: 3px; text-transform: uppercase; }
    .menu-subtitle { font-size: 10px; color: #8B6914; letter-spacing: 1px; }

    #btn-fight {
      padding: 7px 24px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      font-weight: bold;
      background: linear-gradient(180deg, #7B1FA2 0%, #4A0080 100%);
      color: #fff;
      border: 2px solid #F0C040;
      border-radius: 4px;
      cursor: pointer;
      box-shadow: 0 0 12px rgba(240,192,64,0.4);
      letter-spacing: 1px;
    }
    #btn-fight:hover { background: linear-gradient(180deg, #9C27B0 0%, #6A0090 100%); }

    #menu-body {
      display: flex;
      flex: 1;
      min-height: 0;
    }

    #menu-character {
      width: 200px;
      flex-shrink: 0;
      border-right: 1px solid #8B6914;
      padding: 14px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    #menu-equipment {
      flex: 1;
      border-right: 1px solid #8B6914;
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    #menu-stats-inv {
      width: 220px;
      flex-shrink: 0;
      padding: 14px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .menu-section-title {
      font-size: 9px;
      color: #F0C040;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    /* Equipment slots */
    .equip-row { display: flex; align-items: center; gap: 8px; }
    .equip-label {
      width: 52px;
      font-size: 9px;
      color: #8B6914;
      text-align: right;
      flex-shrink: 0;
    }
    .equip-slot {
      flex: 1;
      padding: 7px 12px;
      background: #0a0818;
      border: 2px dashed #2a1a4a;
      border-radius: 4px;
      font-size: 10px;
      color: #444;
      cursor: default;
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 34px;
      transition: border-color 0.1s, background 0.1s;
    }
    .equip-slot.filled {
      background: #1a0e40;
      border: 1px solid #6A4F9E;
      color: #D4B8FF;
      cursor: grab;
    }
    .equip-slot.drag-over {
      border-color: #F0C040;
      background: #1a1040;
    }

    /* Inventory grid */
    #inv-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
    }
    .inv-cell {
      aspect-ratio: 1;
      background: #08040e;
      border: 1px dashed #222;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .inv-cell.has-item {
      background: #1a0e40;
      border: 1px solid #546E7A;
      cursor: grab;
    }
    .inv-cell.has-item.rarity-common { border-color: #546E7A; }
    .inv-cell.has-item.rarity-rare   { border-color: #1565C0; box-shadow: 0 0 4px rgba(100,181,246,0.3); }
    .inv-cell.has-item.rarity-epic   { border-color: #7B1FA2; box-shadow: 0 0 4px rgba(206,147,216,0.35); }
    .inv-cell.dragging { opacity: 0.4; }
    .inv-cell.drag-over { border-color: #F0C040; background: #1a1040; }

    /* Stats list */
    #stats-list { display: flex; flex-direction: column; gap: 4px; }
    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      border-bottom: 1px solid #111;
      padding-bottom: 3px;
    }
    .stat-label { color: #aaa; }
    .stat-value { color: #E8D4A0; }
    .stat-bonus { color: #2ECC71; font-size: 8px; margin-left: 3px; }

    /* Hero portrait in menu */
    #menu-hero-portrait {
      width: 100%;
      max-height: 140px;
      background: linear-gradient(180deg, #1E1245, #0e082e);
      border: 2px solid #E53935;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      overflow: hidden;
    }
    #menu-hero-canvas-wrapper {
      width: 72px;
      height: 96px;
      overflow: hidden;
      position: relative;
    }

    /* Loot overlay */
    #loot-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.82);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    #loot-overlay.visible { display: flex; }
    #loot-box {
      background: linear-gradient(180deg, #0e082e, #08041a);
      border: 2px solid #8B6914;
      box-shadow: inset 0 1px 0 #F0C040, 0 0 30px rgba(240,192,64,0.2);
      border-radius: 8px;
      padding: 28px 36px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      font-family: 'Courier New', monospace;
    }
    #loot-header    { font-size: 11px; color: #F0C040; letter-spacing: 3px; }
    #loot-icon      { font-size: 48px; line-height: 1; }
    #loot-name      { font-size: 18px; font-weight: bold; color: #E8D4A0; }
    #loot-rarity    { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; }
    #loot-rarity.rarity-common { color: #B0BEC5; }
    #loot-rarity.rarity-rare   { color: #64B5F6; }
    #loot-rarity.rarity-epic   { color: #CE93D8; }
    #loot-stats     { font-size: 11px; color: #aaa; }
    #btn-loot-continue {
      margin-top: 6px;
      padding: 10px 28px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      font-weight: bold;
      background: #1E1245;
      color: #F0C040;
      border: 2px solid #F0C040;
      border-radius: 4px;
      cursor: pointer;
      letter-spacing: 1px;
    }
    #btn-loot-continue:hover { background: #2A1A5E; }
```

- [ ] **Add HTML for menu and loot overlays** — insert just before `<div id="end-overlay">`:

```html
    <div id="menu-overlay">
      <div id="menu-header">
        <div class="menu-title">⚔ RPG Tactics</div>
        <div class="menu-subtitle">MENU — ÉQUIPEMENT</div>
        <button id="btn-fight">⚔ Combattre !</button>
      </div>
      <div id="menu-body">
        <div id="menu-character"></div>
        <div id="menu-equipment"></div>
        <div id="menu-stats-inv"></div>
      </div>
    </div>

    <div id="loot-overlay">
      <div id="loot-box">
        <div id="loot-header">🎁 RÉCOMPENSE !</div>
        <div id="loot-icon"></div>
        <div id="loot-name"></div>
        <div id="loot-rarity"></div>
        <div id="loot-stats"></div>
        <button id="btn-loot-continue">Continuer →</button>
      </div>
    </div>
```

- [ ] **Add "Retour au menu" button to `#end-overlay`** — after `#replay-btn`:

```html
      <button id="replay-btn">↺ Rejouer</button>
      <button id="menu-btn">⌂ Menu</button>
```

- [ ] **Add CSS for `#menu-btn`** — after `#replay-btn:hover` rule:

```css
    #menu-btn {
      padding: 10px 24px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      border: 2px solid #8B6914;
      border-radius: 4px;
      background: #0e0820;
      color: #E8D4A0;
      letter-spacing: 1px;
    }
    #menu-btn:hover { background: #1E1245; border-color: #F0C040; }
```

- [ ] **Verify page loads without JS errors** at `http://localhost:8080`

- [ ] **Commit**

```bash
git add index.html
git commit -m "feat: add menu overlay, loot overlay, and menu-btn HTML/CSS"
```

---

## Task 5 — Create `ui/MenuUI.js`

**Files:**
- Create: `ui/MenuUI.js`

- [ ] **Create `ui/MenuUI.js`**

```js
import { ITEMS } from '../battle/items.js';

export default class MenuUI {
  constructor(playerState) {
    this._state      = playerState;
    this._el         = document.getElementById('menu-overlay');
    this._lootEl     = document.getElementById('loot-overlay');
    this._draggedId  = null;
  }

  show() {
    this._render();
    this._el.classList.add('visible');
  }

  hide() {
    this._el.classList.remove('visible');
    this._lootEl.classList.remove('visible');
  }

  showLoot(itemId) {
    if (!itemId) return;
    const item = ITEMS[itemId];
    if (!item) return;

    const statText = Object.entries(item.stats)
      .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
      .join('  ');

    document.getElementById('loot-icon').textContent   = item.icon;
    document.getElementById('loot-name').textContent   = item.name;
    const rarityEl = document.getElementById('loot-rarity');
    rarityEl.textContent  = item.rarity;
    rarityEl.className    = `rarity-${item.rarity}`;
    document.getElementById('loot-stats').textContent  = statText;

    this._lootEl.classList.add('visible');
    document.getElementById('btn-loot-continue').onclick = () => {
      this._lootEl.classList.remove('visible');
      this._render(); // refresh inventory to show new item
    };
  }

  // ── Private ──────────────────────────────────────────────────

  _render() {
    this._renderCharacter();
    this._renderEquipment();
    this._renderStatsAndInventory();
  }

  _renderCharacter() {
    const el = document.getElementById('menu-character');
    const s  = this._state;
    const cs = s.computedStats();
    const hpPct = Math.round((cs.hp / cs.hp) * 100); // always 100% at menu (full heal between fights)

    el.innerHTML = `
      <div class="menu-section-title">Personnage</div>
      <div id="menu-hero-portrait">
        <div id="menu-hero-canvas-wrapper"></div>
        <div style="font-size:8px;color:#E53935;letter-spacing:1px;">GUERRIER</div>
      </div>
      <div>
        <div style="font-size:13px;color:#E8D4A0;font-weight:bold;letter-spacing:1px;">Héros</div>
        <div style="font-size:10px;color:#F0C040;">Niveau ${s.level}</div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:9px;color:#aaa;margin-bottom:3px;">
          <span>❤ HP</span><span style="color:#2ECC71;">${cs.hp} / ${cs.hp}</span>
        </div>
        <div style="height:6px;background:#1a1a2e;border-radius:3px;border:1px solid #333;">
          <div style="width:${hpPct}%;height:100%;background:linear-gradient(90deg,#2ECC71,#27AE60);border-radius:3px;"></div>
        </div>
      </div>
      <div style="margin-top:auto;padding:8px;background:#08041a;border:1px solid #333;border-radius:4px;">
        <div style="font-size:8px;color:#666;margin-bottom:3px;">PROCHAIN ENNEMI</div>
        <div style="font-size:11px;color:#E74C3C;">👺 Gobelin</div>
        <div style="font-size:9px;color:#aaa;">Niveau 1</div>
      </div>
    `;

    // Mount Phaser hero sprite into the canvas wrapper
    const wrapper = document.getElementById('menu-hero-canvas-wrapper');
    if (window.game) {
      const scene = window.game.scene.getScene('MenuScene');
      if (scene?._heroCanvas) wrapper.appendChild(scene._heroCanvas);
    }
  }

  _renderEquipment() {
    const el    = document.getElementById('menu-equipment');
    const slots = [
      { key: 'weapon',     label: 'Arme',    accepts: 'weapon' },
      { key: 'armor',      label: 'Armure',  accepts: 'armor' },
      { key: 'helmet',     label: 'Heaume',  accepts: 'helmet' },
      { key: 'accessory1', label: 'Acc. 1',  accepts: 'accessory' },
      { key: 'accessory2', label: 'Acc. 2',  accepts: 'accessory' },
    ];

    el.innerHTML = `<div class="menu-section-title">Équipement</div>
      <div style="font-size:8px;color:#555;margin-bottom:4px;">Glisser un objet depuis l'inventaire</div>`;

    for (const { key, label, accepts } of slots) {
      const itemId = this._state.equipped[key];
      const item   = itemId ? ITEMS[itemId] : null;
      const row    = document.createElement('div');
      row.className = 'equip-row';

      const lbl = document.createElement('div');
      lbl.className   = 'equip-label';
      lbl.textContent = label;

      const slot = document.createElement('div');
      slot.className     = `equip-slot${item ? ' filled' : ''}`;
      slot.dataset.slot    = key;
      slot.dataset.accepts = accepts;

      if (item) {
        const statText = Object.entries(item.stats)
          .map(([k, v]) => `<span style="color:${this._statColor(k)};font-size:9px;">+${v} ${k.toUpperCase()}</span>`)
          .join(' ');
        slot.innerHTML = `<span>${item.icon} ${item.name}</span><span>${statText}</span>`;
        slot.addEventListener('click', () => {
          this._state.unequip(key);
          this._render();
        });
        slot.title = 'Cliquer pour déséquiper';
      } else {
        slot.textContent = '◇ Vide';
      }

      slot.addEventListener('dragover',  (e) => this._onSlotDragOver(e));
      slot.addEventListener('dragleave', (e) => e.currentTarget.classList.remove('drag-over'));
      slot.addEventListener('drop',      (e) => this._onSlotDrop(e));

      row.appendChild(lbl);
      row.appendChild(slot);
      el.appendChild(row);
    }
  }

  _renderStatsAndInventory() {
    const el    = document.getElementById('menu-stats-inv');
    const cs    = this._state.computedStats();
    const bonus = this._state.equipmentBonus();

    const statRows = [
      { icon: '❤', key: 'hp',  label: 'HP',  color: '#66BB6A' },
      { icon: '⚔', key: 'atk', label: 'ATK', color: '#EF5350' },
      { icon: '🛡', key: 'def', label: 'DEF', color: '#42A5F5' },
      { icon: '💨', key: 'spd', label: 'SPD', color: '#FFCA28' },
      { icon: '🍀', key: 'lck', label: 'LCK', color: '#AB47BC' },
    ];

    const statsHTML = statRows.map(({ icon, key, label, color }) => {
      const base = this._state.baseStats[key];
      const b    = bonus[key] ?? 0;
      const bonusSpan = b > 0 ? `<span class="stat-bonus">+${b}</span>` : '';
      return `<div class="stat-row">
        <span class="stat-label">${icon} ${label}</span>
        <span class="stat-value" style="color:${color};">${base}${bonusSpan}</span>
      </div>`;
    }).join('');

    el.innerHTML = `
      <div>
        <div class="menu-section-title">Stats</div>
        <div id="stats-list">${statsHTML}</div>
      </div>
      <div style="flex:1;min-height:0;display:flex;flex-direction:column;">
        <div class="menu-section-title">Inventaire <span style="color:#555;font-weight:normal;">${this._state.inventory.length}/12</span></div>
        <div id="inv-grid"></div>
        <div style="font-size:8px;color:#444;margin-top:5px;text-align:center;">Glisser → slot équipement</div>
      </div>
    `;

    const grid = el.querySelector('#inv-grid');
    for (let i = 0; i < 12; i++) {
      const cell = document.createElement('div');
      const itemId = this._state.inventory[i];
      if (itemId) {
        const item = ITEMS[itemId];
        cell.className     = `inv-cell has-item rarity-${item?.rarity ?? 'common'}`;
        cell.textContent   = item?.icon ?? '?';
        cell.draggable     = true;
        cell.dataset.itemId   = itemId;
        cell.dataset.slotType = item?.slot ?? '';
        cell.title         = item ? `${item.name}\n${Object.entries(item.stats).map(([k,v])=>`+${v} ${k.toUpperCase()}`).join(', ')}` : itemId;
        cell.addEventListener('dragstart', (e) => this._onDragStart(e));
        cell.addEventListener('dragend',   ()  => this._onDragEnd());
      } else {
        cell.className = 'inv-cell';
      }
      grid.appendChild(cell);
    }
  }

  // ── Drag & Drop ───────────────────────────────────────────────

  _onDragStart(e) {
    this._draggedId = e.currentTarget.dataset.itemId;
    e.currentTarget.classList.add('dragging');
  }

  _onDragEnd() {
    this._draggedId = null;
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  }

  _onSlotDragOver(e) {
    if (!this._draggedId) return;
    const item    = ITEMS[this._draggedId];
    const accepts = e.currentTarget.dataset.accepts;
    if (item && item.slot === accepts) {
      e.preventDefault();
      e.currentTarget.classList.add('drag-over');
    }
  }

  _onSlotDrop(e) {
    e.preventDefault();
    const slot = e.currentTarget.dataset.slot;
    if (this._draggedId && slot) {
      this._state.equip(this._draggedId, slot);
    }
    this._draggedId = null;
    this._render();
  }

  // ── Helpers ───────────────────────────────────────────────────

  _statColor(key) {
    return { atk:'#EF5350', def:'#42A5F5', hp:'#66BB6A', spd:'#FFCA28', lck:'#AB47BC' }[key] ?? '#E8D4A0';
  }
}
```

- [ ] **Commit**

```bash
git add ui/MenuUI.js
git commit -m "feat: add MenuUI with 3-column layout and drag-and-drop equip"
```

---

## Task 6 — Create `scenes/MenuScene.js`

**Files:**
- Create: `scenes/MenuScene.js`

- [ ] **Create `scenes/MenuScene.js`**

```js
import {
  createHeroIdleSheet, createHeroWalkSheet,
  createHeroAttackSheet, createHeroHealSheet, createHeroShieldSheet,
  createGoblinIdleSheet, createGoblinWalkSheet,
  createGoblinAttackSheet, createGoblinDefendSheet,
} from '../assets/sprites.js';
import MenuUI from '../ui/MenuUI.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this._menuUI        = null;
    this._startListener = null;
  }

  preload() {
    const sheets = {
      'hero-idle':     createHeroIdleSheet(),
      'hero-walk':     createHeroWalkSheet(),
      'hero-attack':   createHeroAttackSheet(),
      'hero-heal':     createHeroHealSheet(),
      'hero-shield':   createHeroShieldSheet(),
      'goblin-idle':   createGoblinIdleSheet(),
      'goblin-walk':   createGoblinWalkSheet(),
      'goblin-attack': createGoblinAttackSheet(),
      'goblin-defend': createGoblinDefendSheet(),
    };
    Object.entries(sheets).forEach(([key, sheet]) => {
      if (this.textures.exists(key)) return;
      this.textures.addSpriteSheet(key, sheet.canvas, {
        frameWidth:  sheet.frameWidth,
        frameHeight: sheet.frameHeight,
      });
    });
  }

  create(data = {}) {
    this._drawBackground();

    if (!this.anims.exists('hero-idle')) {
      this.anims.create({
        key: 'hero-idle',
        frames: this.anims.generateFrameNumbers('hero-idle'),
        frameRate: 4,
        repeat: -1,
      });
    }

    this._hero = this.add.sprite(180, 230, 'hero-idle');
    this._hero.play('hero-idle');

    this._menuUI = new MenuUI(window.playerState);
    this._menuUI.show();

    if (data.loot) {
      this._menuUI.showLoot(data.loot);
    }

    this._startListener = () => {
      this._menuUI.hide();
      this.scene.start('BattleScene');
    };
    window.addEventListener('start-battle', this._startListener);
  }

  shutdown() {
    if (this._startListener) {
      window.removeEventListener('start-battle', this._startListener);
      this._startListener = null;
    }
    if (this._menuUI) this._menuUI.hide();
  }

  _drawBackground() {
    const g = this.add.graphics();
    const W = 800, H = 450;

    g.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x6a3080, 0xe8703a, 1);
    g.fillRect(0, 0, W, 320);

    g.fillStyle(0x3a1050);
    g.fillTriangle(0, 320, 120, 180, 240, 320);
    g.fillTriangle(80, 320, 220, 150, 360, 320);
    g.fillTriangle(200, 320, 350, 170, 500, 320);
    g.fillTriangle(350, 320, 480, 140, 620, 320);
    g.fillTriangle(520, 320, 650, 165, 780, 320);
    g.fillRect(0, 300, W, 20);

    g.fillStyle(0x2a0840);
    g.fillTriangle(0, 320, 80, 240, 160, 320);
    g.fillTriangle(140, 320, 260, 210, 380, 320);
    g.fillTriangle(300, 320, 430, 200, 560, 320);
    g.fillTriangle(500, 320, 630, 225, 760, 320);
    g.fillRect(0, 305, W, 15);

    g.fillGradientStyle(0x3a7a30, 0x3a7a30, 0x1e4a18, 0x1e4a18, 1);
    g.fillRect(0, 320, W, H - 320);
    g.fillStyle(0x52a840);
    g.fillRect(0, 318, W, 8);
  }
}
```

- [ ] **Commit**

```bash
git add scenes/MenuScene.js
git commit -m "feat: add MenuScene with background and hero idle sprite"
```

---

## Task 7 — Update `game.js`

**Files:**
- Modify: `game.js`

- [ ] **Replace the contents of `game.js`**

```js
import MenuScene   from './scenes/MenuScene.js';
import BattleScene from './scenes/BattleScene.js';
import BattleUI    from './ui/BattleUI.js';
import PlayerState from './battle/PlayerState.js';

window.playerState = new PlayerState();

const config = {
  type:            Phaser.AUTO,
  width:           800,
  height:          450,
  parent:          'game-container',
  backgroundColor: '#1a1a2e',
  pixelArt:        true,
  roundPixels:     true,
  scene:           [MenuScene, BattleScene],
};

window.game     = new Phaser.Game(config);
window.battleUI = new BattleUI();

document.getElementById('replay-btn').addEventListener('click', () => {
  window.battleUI.hideEndScreen();
  window.game.scene.getScene('BattleScene').scene.restart();
});

document.getElementById('menu-btn').addEventListener('click', () => {
  window.battleUI.hideEndScreen();
  window.game.scene.start('MenuScene');
});

document.getElementById('btn-fight').addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('start-battle'));
});
```

- [ ] **Verify in browser:** `http://localhost:8080` opens the menu scene (purple background + hero idle + 3-column panel)

- [ ] **Commit**

```bash
git add game.js
git commit -m "feat: start with MenuScene, init PlayerState globally"
```

---

## Task 8 — Update `scenes/BattleScene.js`

**Files:**
- Modify: `scenes/BattleScene.js`

- [ ] **Update `create()` to use `window.playerState`** — replace the existing line `this._state = new BattleState();`:

```js
this._state = new BattleState(window.playerState ?? null);
```

- [ ] **Update `preload()` to skip already-loaded textures** — wrap the `addSpriteSheet` call:

```js
Object.entries(sheets).forEach(([key, sheet]) => {
  if (this.textures.exists(key)) return;
  this.textures.addSpriteSheet(key, sheet.canvas, {
    frameWidth:  sheet.frameWidth,
    frameHeight: sheet.frameHeight,
  });
});
```

- [ ] **Add `_generateLoot()` method** — add before the closing `}` of the class:

```js
_generateLoot() {
  const { rollLoot } = window._itemsModule; // set in Task 8 step below
  return rollLoot(window.playerState.ownedIds());
}
```

Wait — ES modules can't be imported dynamically at this point without `import()`. Instead, import `rollLoot` at the top of `BattleScene.js`. **Add this import** at the top of the file alongside existing imports:

```js
import { rollLoot } from '../battle/items.js';
```

Then add `_generateLoot()`:

```js
_generateLoot() {
  return rollLoot(window.playerState?.ownedIds() ?? []);
}
```

- [ ] **Update victory flow in `_onPlayerAction()`** — replace the victory block:

```js
if (this._state.isGoblinDead()) {
  this.showMessage('Le Gobelin est vaincu !');
  this.time.delayedCall(1200, () => {
    const loot = window.playerState ? this._generateLoot() : null;
    // Hero HP resets automatically: BattleState sets heroHp = heroMaxHp on construction
    this.scene.start('MenuScene', loot ? { loot } : {});
  });
  return;
}
```

- [ ] **Handle dodge in `_executeGoblinTurn()`** — update the attack callback:

```js
this._animGoblinAttack(() => {
  const result = this._state.goblinAttack();
  if (result.dodged) {
    this.showMessage('💨 Esquivé !');
    this.floatText(this._hero.x, this._hero.y - 30, 'Esquivé !', '#FFCA28');
  } else if (result.shieldAbsorbed) {
    const msg = this._state.heroShieldActive
      ? '🛡 Bouclier actif ! Dégâts réduits.'
      : '🛡 Bouclier rompu ! Dégâts réduits.';
    this.showMessage(msg);
    this.floatText(this._hero.x, this._hero.y - 30, `🛡 -${result.damage}`, '#F0C040');
    if (!this._state.heroShieldActive) this._hero.clearTint();
  } else {
    this.floatText(this._hero.x, this._hero.y - 30, `-${result.damage}`, '#E74C3C');
  }
  this._updateHpBars();

  if (this._state.isHeroDead()) {
    this.time.delayedCall(700, () =>
      window.dispatchEvent(new CustomEvent('battle-end', { detail: { winner: 'goblin' } }))
    );
    return;
  }
  window.dispatchEvent(new CustomEvent('animation-end'));
});
```

- [ ] **Commit**

```bash
git add scenes/BattleScene.js
git commit -m "feat: BattleScene uses PlayerState, generates loot, transitions to MenuScene"
```

---

## Task 9 — Update `ui/BattleUI.js`

**Files:**
- Modify: `ui/BattleUI.js`

- [ ] **Add `#menu-btn` reference and update `showEndScreen`** in `BattleUI.js` constructor:

Add after `this._endSubtitle` line:
```js
this._menuBtn = document.getElementById('menu-btn');
```

Add `this._menuBtn.disabled = !enabled;` inside `setButtonsEnabled()`.

- [ ] **Show/hide `#menu-btn` based on winner** — update `showEndScreen`:

```js
showEndScreen(winner) {
  this.setButtonsEnabled(false);
  this._endTitle.className      = winner === 'hero' ? 'victory' : 'defeat';
  this._endTitle.textContent    = winner === 'hero' ? '⚔ Victoire !' : '💀 Défaite...';
  this._endSubtitle.textContent = winner === 'hero'
    ? 'Le gobelin est vaincu !'
    : 'Vous avez été vaincu...';
  // Show "Retour au menu" only on defeat; victory goes directly to MenuScene
  this._menuBtn.style.display = winner === 'goblin' ? 'inline-block' : 'none';
  this._endOverlay.classList.add('visible');
}
```

- [ ] **Commit**

```bash
git add ui/BattleUI.js
git commit -m "feat: BattleUI shows menu-btn on defeat, hides on victory"
```

---

## Task 10 — Integration verification

**No files modified — manual browser testing only.**

- [ ] **Open `http://localhost:8080`** — menu scene loads with hero idle and 3-column panel

- [ ] **Drag `⚔` from inventory to Arme slot** — item moves to slot, ATK stat updates (green bonus visible)

- [ ] **Drag `🛡` from inventory to Armure slot** — DEF stat updates

- [ ] **Click "⚔ Combattre !"** — transitions to BattleScene

- [ ] **Win the battle** — after ~1.2s, transitions to MenuScene with loot overlay showing a new item

- [ ] **Click "Continuer →"** — loot overlay closes, new item visible in inventory

- [ ] **Lose the battle** — end overlay shows "💀 Défaite..." with "Rejouer" and "⌂ Menu" buttons

- [ ] **Click "⌂ Menu"** — returns to MenuScene

- [ ] **Verify tests still pass** at `http://localhost:8080/tests/battle-state.test.html` and `http://localhost:8080/tests/player-state.test.html`

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: complete menu scene with inventory, equipment, and loot system"
```
