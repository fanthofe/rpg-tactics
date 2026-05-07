export default class BattleUI {
  constructor() {
    this._btnAttack      = document.getElementById('btn-attack');
    this._btnHeal        = document.getElementById('btn-heal');
    this._btnSkills      = document.getElementById('btn-skills');
    this._btnDoubleSlash = document.getElementById('btn-double-slash');
    this._btnShield      = document.getElementById('btn-shield');
    this._btnBack        = document.getElementById('btn-back');
    this._actionButtons  = document.getElementById('action-buttons');
    this._skillsPanel    = document.getElementById('skills-panel');
    this._msgEl          = document.getElementById('battle-message');
    this._endOverlay     = document.getElementById('end-overlay');
    this._endTitle       = document.getElementById('end-title');
    this._endSubtitle    = document.getElementById('end-subtitle');
    this._menuBtn        = document.getElementById('menu-btn');

    this._btnAttack.addEventListener('click', () =>
      window.dispatchEvent(new CustomEvent('player-action', { detail: { action: 'attack' } }))
    );
    this._btnHeal.addEventListener('click', () =>
      window.dispatchEvent(new CustomEvent('player-action', { detail: { action: 'heal' } }))
    );
    this._btnSkills.addEventListener('click', () => this._showSkillsPanel());
    this._btnBack.addEventListener('click',   () => this._showActionButtons());
    this._btnDoubleSlash.addEventListener('click', () => {
      this._showActionButtons();
      window.dispatchEvent(new CustomEvent('player-action', { detail: { action: 'double-slash' } }));
    });
    this._btnShield.addEventListener('click', () => {
      this._showActionButtons();
      window.dispatchEvent(new CustomEvent('player-action', { detail: { action: 'shield' } }));
    });

    window.addEventListener('animation-start',  () => this.setButtonsEnabled(false));
    window.addEventListener('animation-end',    () => this.setButtonsEnabled(true));
    window.addEventListener('battle-end',       (e) => this.showEndScreen(e.detail));
    window.addEventListener('battle-message',   (e) => this.setMessage(e.detail.text));
  }

  _showSkillsPanel() {
    this._actionButtons.style.display = 'none';
    this._skillsPanel.classList.add('visible');
  }

  _showActionButtons() {
    this._skillsPanel.classList.remove('visible');
    this._actionButtons.style.display = 'flex';
  }

  setButtonsEnabled(enabled) {
    this._btnAttack.disabled      = !enabled;
    this._btnHeal.disabled        = !enabled;
    this._btnSkills.disabled      = !enabled;
    this._btnDoubleSlash.disabled = !enabled;
    this._btnShield.disabled      = !enabled;
    this._btnBack.disabled        = !enabled;
    if (!enabled) this._showActionButtons();
  }

  setMessage(text) {
    this._msgEl.textContent = text;
  }

  showEndScreen({ winner, allCleared = false }) {
    this.setButtonsEnabled(false);
    const replayBtn = document.getElementById('replay-btn');

    if (winner === 'hero' && allCleared) {
      this._endTitle.className      = 'victory';
      this._endTitle.textContent    = 'LÉGENDE !';
      this._endSubtitle.textContent = 'Vous avez vaincu les 5 champions des Ombres !';
      replayBtn.textContent         = 'Rejouer depuis le début';
      this._menuBtn.style.display   = 'none';
    } else {
      this._endTitle.className      = 'defeat';
      this._endTitle.textContent    = 'DÉFAITE';
      this._endSubtitle.textContent = 'Vous avez été vaincu...';
      replayBtn.textContent         = 'Réessayer';
      this._menuBtn.style.display   = 'inline-block';
    }
    this._endOverlay.classList.add('visible');
  }

  hideEndScreen() {
    this._endOverlay.classList.remove('visible');
    this.setButtonsEnabled(true);
  }
}
