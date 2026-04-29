export default class BattleUI {
  constructor() {
    this._btnAttack   = document.getElementById('btn-attack');
    this._btnHeal     = document.getElementById('btn-heal');
    this._msgEl       = document.getElementById('battle-message');
    this._endOverlay  = document.getElementById('end-overlay');
    this._endTitle    = document.getElementById('end-title');
    this._endSubtitle = document.getElementById('end-subtitle');

    this._btnAttack.addEventListener('click', () =>
      window.dispatchEvent(new CustomEvent('player-action', { detail: { action: 'attack' } }))
    );
    this._btnHeal.addEventListener('click', () =>
      window.dispatchEvent(new CustomEvent('player-action', { detail: { action: 'heal' } }))
    );

    window.addEventListener('animation-start',  () => this.setButtonsEnabled(false));
    window.addEventListener('animation-end',    () => this.setButtonsEnabled(true));
    window.addEventListener('battle-end',       (e) => this.showEndScreen(e.detail.winner));
    window.addEventListener('battle-message',   (e) => this.setMessage(e.detail.text));
  }

  setButtonsEnabled(enabled) {
    this._btnAttack.disabled = !enabled;
    this._btnHeal.disabled   = !enabled;
  }

  setMessage(text) {
    this._msgEl.textContent = text;
  }

  showEndScreen(winner) {
    this.setButtonsEnabled(false);
    this._endTitle.className      = winner === 'hero' ? 'victory' : 'defeat';
    this._endTitle.textContent    = winner === 'hero' ? '⚔ Victoire !' : '💀 Défaite...';
    this._endSubtitle.textContent = winner === 'hero'
      ? 'Le gobelin est vaincu !'
      : 'Vous avez été vaincu...';
    this._endOverlay.classList.add('visible');
  }

  hideEndScreen() {
    this._endOverlay.classList.remove('visible');
    this.setButtonsEnabled(true);
  }
}
