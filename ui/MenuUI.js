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
      this._render();
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
          <div style="width:100%;height:100%;background:linear-gradient(90deg,#2ECC71,#27AE60);border-radius:3px;"></div>
        </div>
      </div>
      <div style="margin-top:auto;padding:8px;background:#08041a;border:1px solid #333;border-radius:4px;">
        <div style="font-size:8px;color:#666;margin-bottom:3px;">PROCHAIN ENNEMI</div>
        <div style="font-size:11px;color:#E74C3C;">👺 Gobelin</div>
        <div style="font-size:9px;color:#aaa;">Niveau 1</div>
      </div>
    `;
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
      const cell   = document.createElement('div');
      const itemId = this._state.inventory[i];
      if (itemId) {
        const item = ITEMS[itemId];
        cell.className     = `inv-cell has-item rarity-${item?.rarity ?? 'common'}`;
        cell.textContent   = item?.icon ?? '?';
        cell.draggable     = true;
        cell.dataset.itemId   = itemId;
        cell.dataset.slotType = item?.slot ?? '';
        cell.title         = item
          ? `${item.name}\n${Object.entries(item.stats).map(([k,v])=>`+${v} ${k.toUpperCase()}`).join(', ')}`
          : itemId;
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
