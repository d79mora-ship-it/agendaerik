/**
 * Pomodoro Page — Study timer with configurable sessions
 * Fixed: Timer no longer blocks navigation by using targeted DOM updates
 */

// eslint-disable-next-line no-var
var PomodoroPage = (function () {
  'use strict';

  let _mainEl = null;
  let _timer = null;
  let _isRunning = false;
  let _isBreak = false;
  let _secondsLeft = 0;
  let _totalSeconds = 0;
  let _sessionsCompleted = 0;
  let _selectedSubject = '';
  let _isActive = false; // Track if this page is currently active

  // Config (in minutes)
  const WORK_DURATION = 25;
  const SHORT_BREAK = 5;
  const LONG_BREAK = 15;
  const SESSIONS_BEFORE_LONG_BREAK = 4;

  function render(mainEl, rightEl) {
    _mainEl = mainEl;
    _isActive = true;
    rightEl.innerHTML = '';
    if (!_isRunning && _secondsLeft === 0) {
      _secondsLeft = WORK_DURATION * 60;
      _totalSeconds = WORK_DURATION * 60;
      _isBreak = false;
    }
    _renderFullUI();
  }

  /** Called when navigating away from this page */
  function destroy() {
    _isActive = false;
    // Don't stop the timer — let it run in background
    // But stop updating the DOM
  }

  async function _renderFullUI() {
    const subjects = await DataService.getAllSubjects();
    const minutes = Math.floor(_secondsLeft / 60);
    const seconds = _secondsLeft % 60;
    const pct = _totalSeconds > 0 ? ((_totalSeconds - _secondsLeft) / _totalSeconds) * 100 : 0;
    const circumference = 2 * Math.PI * 140;
    const dashOffset = circumference - (pct / 100) * circumference;

    const statusText = _isBreak ? '☕ Descanso' : '📖 Estudio';
    const statusColor = _isBreak ? 'var(--color-accent-green)' : 'var(--color-primary)';

    _mainEl.innerHTML = `
      <div class="page-header" style="text-align: center;">
        <h1>Pomodoro ⏱️</h1>
        <p>Técnica de estudio: ${WORK_DURATION}min estudio / ${SHORT_BREAK}min descanso</p>
      </div>

      <div class="pomodoro-container">
        <div class="pomodoro-circle-wrapper">
          <svg class="pomodoro-svg" viewBox="0 0 300 300" width="300" height="300">
            <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
            <circle id="pomo-progress-circle" cx="150" cy="150" r="140" fill="none"
              stroke="${statusColor}"
              stroke-width="8"
              stroke-linecap="round"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${dashOffset}"
              transform="rotate(-90 150 150)"
              style="transition: stroke-dashoffset 0.5s ease; filter: drop-shadow(0 0 8px ${statusColor});"
            />
          </svg>
          <div class="pomodoro-time-display">
            <div class="pomodoro-status" id="pomo-status-text" style="color: ${statusColor};">${statusText}</div>
            <div class="pomodoro-time" id="pomo-time-text">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</div>
            <div class="pomodoro-sessions" id="pomo-session-text">Sesión ${_sessionsCompleted + 1}</div>
          </div>
        </div>

        <div class="pomodoro-controls" id="pomo-controls">
          ${_isRunning
        ? `<button class="btn btn-ghost" id="pomo-pause">⏸️ Pausar</button>`
        : `<button class="btn btn-primary" id="pomo-start">▶️ ${_secondsLeft < _totalSeconds ? 'Reanudar' : 'Iniciar'}</button>`
      }
          <button class="btn btn-ghost" id="pomo-reset">🔄 Reiniciar</button>
          ${!_isRunning && !_isBreak ? `<button class="btn btn-ghost" id="pomo-skip">⏭️ Saltar</button>` : ''}
        </div>

        <div class="pomodoro-subject" style="margin-top: var(--space-xl);">
          <label class="form-label" style="text-align: center; display: block; margin-bottom: var(--space-sm);">Estudiando:</label>
          <select class="form-select" id="pomo-subject" style="max-width: 300px; margin: 0 auto; display: block;">
            <option value="">Estudio general</option>
            ${subjects.map(s => `<option value="${s.id}" ${_selectedSubject === s.id ? 'selected' : ''}>${Helpers.escapeHtml(s.name)}</option>`).join('')}
          </select>
        </div>

        <div class="pomodoro-stats">
          <div class="glass-card stat-card">
            <div class="stat-value" id="pomo-stat-sessions">${_sessionsCompleted}</div>
            <div class="stat-label">Sesiones hoy</div>
          </div>
          <div class="glass-card stat-card">
            <div class="stat-value" id="pomo-stat-minutes">${_sessionsCompleted * WORK_DURATION}</div>
            <div class="stat-label">Min. estudiados</div>
          </div>
          <div class="glass-card stat-card">
            <div class="stat-value" id="pomo-stat-total">${Math.floor(_sessionsCompleted * WORK_DURATION / 60)}h ${_sessionsCompleted * WORK_DURATION % 60}m</div>
            <div class="stat-label">Tiempo total</div>
          </div>
        </div>

        <div class="pomodoro-tips glass-card-static" style="margin-top: var(--space-xl); padding: var(--space-lg);">
          <h3 style="font-size: var(--font-md); font-weight: 700; margin-bottom: var(--space-sm);">💡 Consejos</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-sm); font-size: var(--font-sm); color: var(--text-secondary);">
            <li>🎯 Concéntrate en una sola tarea por sesión</li>
            <li>📱 Deja el móvil en otra habitación</li>
            <li>💧 Aprovecha los descansos para hidratarte</li>
            <li>🏃 Cada 4 sesiones, tómate un descanso largo de ${LONG_BREAK}min</li>
          </ul>
        </div>
      </div>
    `;

    _bindEvents();
  }

  function _bindEvents() {
    const startBtn = document.getElementById('pomo-start');
    const pauseBtn = document.getElementById('pomo-pause');
    const resetBtn = document.getElementById('pomo-reset');
    const skipBtn = document.getElementById('pomo-skip');
    const subjectSelect = document.getElementById('pomo-subject');

    if (startBtn) startBtn.addEventListener('click', _start);
    if (pauseBtn) pauseBtn.addEventListener('click', _pause);
    if (resetBtn) resetBtn.addEventListener('click', _reset);
    if (skipBtn) skipBtn.addEventListener('click', _skipToBreak);
    if (subjectSelect) subjectSelect.addEventListener('change', (e) => { _selectedSubject = e.target.value; });
  }

  /** Only update the time text and progress circle — no full re-render */
  function _updateTimeDisplay() {
    const timeEl = document.getElementById('pomo-time-text');
    const circleEl = document.getElementById('pomo-progress-circle');

    // If the elements don't exist, we navigated away — skip
    if (!timeEl || !circleEl) return;

    const minutes = Math.floor(_secondsLeft / 60);
    const seconds = _secondsLeft % 60;
    timeEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const pct = _totalSeconds > 0 ? ((_totalSeconds - _secondsLeft) / _totalSeconds) * 100 : 0;
    const circumference = 2 * Math.PI * 140;
    const dashOffset = circumference - (pct / 100) * circumference;
    circleEl.setAttribute('stroke-dashoffset', dashOffset);
  }

  function _start() {
    _isRunning = true;
    _timer = setInterval(() => {
      _secondsLeft--;
      if (_secondsLeft <= 0) {
        clearInterval(_timer);
        _timer = null;
        _isRunning = false;
        _onTimerComplete();
        return;
      }
      // Only update time display, don't re-render the full page
      _updateTimeDisplay();
    }, 1000);
    // Re-render controls to show pause button
    if (_isActive) _renderFullUI();
  }

  function _pause() {
    _isRunning = false;
    if (_timer) {
      clearInterval(_timer);
      _timer = null;
    }
    if (_isActive) _renderFullUI();
  }

  function _reset() {
    _pause();
    _isBreak = false;
    _secondsLeft = WORK_DURATION * 60;
    _totalSeconds = WORK_DURATION * 60;
    if (_isActive) _renderFullUI();
  }

  function _skipToBreak() {
    _pause();
    _isBreak = true;
    _sessionsCompleted++;
    const isLong = _sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK === 0;
    const breakDuration = isLong ? LONG_BREAK : SHORT_BREAK;
    _secondsLeft = breakDuration * 60;
    _totalSeconds = breakDuration * 60;
    Toast.show(`¡Sesión completada! ${isLong ? 'Descanso largo' : 'Descanso corto'} 🎉`, 'success');
    if (_isActive) _renderFullUI();
  }

  function _onTimerComplete() {
    if (_isBreak) {
      _isBreak = false;
      _secondsLeft = WORK_DURATION * 60;
      _totalSeconds = WORK_DURATION * 60;
      Toast.show('¡Descanso terminado! Vuelve al estudio 📖', 'info');
    } else {
      _sessionsCompleted++;
      _isBreak = true;
      const isLong = _sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK === 0;
      const breakDuration = isLong ? LONG_BREAK : SHORT_BREAK;
      _secondsLeft = breakDuration * 60;
      _totalSeconds = breakDuration * 60;
      Toast.show(`¡Sesión ${_sessionsCompleted} completada! ${isLong ? '🎊 Descanso largo' : '☕ Descansa'} 🎉`, 'success');
    }
    if (_isActive) _renderFullUI();
  }

  return { render, destroy };
})();
