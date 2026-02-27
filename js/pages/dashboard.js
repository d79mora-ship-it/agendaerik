/**
 * Dashboard Page — Main overview with smart widgets
 */

// eslint-disable-next-line no-var
var DashboardPage = (function () {
  'use strict';

  let _countdownInterval = null;

  // Random manga illustration per session
  const MANGA_IMAGES = [
    { src: 'assets/manga/manga_study.png', quote: '¡A darle caña al estudio! 📖' },
    { src: 'assets/manga/manga_celebrate.png', quote: '¡Tú puedes con todo! 🏆' },
    { src: 'assets/manga/manga_reading.png', quote: 'El conocimiento es poder ✨' },
    { src: 'assets/manga/manga_music.png', quote: 'Estudiar con música mola 🎵' },
    { src: 'assets/manga/manga_peace.png', quote: '¡Hoy va a ser un gran día! ✌️' }
  ];
  const _sessionManga = MANGA_IMAGES[Math.floor(Math.random() * MANGA_IMAGES.length)];

  async function render(mainEl, rightEl) {
    // Clean up
    if (_countdownInterval) { clearInterval(_countdownInterval); _countdownInterval = null; }

    const [tasks, exams, schedules, subjects, profile, gradesBySubject, overallAvg, xp] = await Promise.all([
      DataService.getAllTasks(),
      DataService.getUpcomingExams(),
      DataService.getAllSchedules(),
      DataService.getAllSubjects(),
      DataService.getProfile(),
      DataService.getGradesBySubject(),
      DataService.getOverallAverage(),
      DataService.getXP()
    ]);

    const subjectProgress = await DataService.getSubjectTaskProgress();

    mainEl.innerHTML = _renderMain(tasks, exams, schedules, subjects, subjectProgress, profile, xp);
    rightEl.innerHTML = _renderRightPanel(profile, schedules, subjects, gradesBySubject, overallAvg);

    // Start countdown timers
    if (exams.length > 0) {
      _startCountdowns(exams);
    }
  }

  function _getDynamicGreeting(profile) {
    const hour = new Date().getHours();
    const name = profile?.full_name || 'Estudiante';
    const firstName = name.split(' ')[0];

    if (hour < 7) return `Buenas noches, ${firstName} 🌙`;
    if (hour < 12) return `¡Buenos días, ${firstName}! ☀️`;
    if (hour < 15) return `¡Buenas tardes, ${firstName}! 🌤️`;
    if (hour < 20) return `¡Buenas tardes, ${firstName}! 🌇`;
    return `Buenas noches, ${firstName} 🌙`;
  }

  function _getDynamicSubtitle(tasks) {
    const pending = tasks.filter(t => t.status !== 'done');
    if (pending.length === 0) return '¡Todo al día! Disfruta tu tiempo 🎉';
    if (pending.length === 1) return 'Tienes 1 tarea pendiente, ¡casi lo tienes! 💪';
    if (pending.length <= 3) return `Tienes ${pending.length} tareas pendientes, ¡tú puedes! 🔥`;
    return `Tienes ${pending.length} tareas pendientes, ¡a por ellas! 🚀`;
  }

  function _renderMain(tasks, exams, schedules, subjects, subjectProgress, profile, xp) {
    const pending = tasks.filter(t => t.status === 'pending');
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    const done = tasks.filter(t => t.status === 'done');

    // XP & Level calculations
    const level = Math.floor(xp / 100) + 1;
    const currentLevelXp = xp % 100;
    const xpPct = currentLevelXp; // Since exactly 100 XP per level

    // Today's schedule
    const today = new Date().getDay();
    const todayIdx = today === 0 ? 6 : today - 1; // Monday=0

    // YYYY-MM-DD for checking single dates
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const todaySchedule = schedules
      .filter(s => s.day_of_week === todayIdx || s.date === todayStr)
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

    const subjectsMap = {};
    subjects.forEach(s => subjectsMap[s.id] = s);

    // Urgent tasks (Due within 48h)
    const urgentTasks = tasks
      .filter(t => t.status !== 'done' && t.due_date && Helpers.daysUntil(t.due_date) <= 2)
      .sort((a, b) => a.due_date.localeCompare(b.due_date));

    // Upcoming Exams (Next 7 days)
    const upcomingRecentExams = exams.slice(0, 3);

    return `
      <div class="page-header">
        <h1>${_getDynamicGreeting(profile)}</h1>
        <p>${_getDynamicSubtitle(tasks)}</p>
      </div>

      <div class="dashboard-grid">
        <!-- XP Progress Bar (Gamification) -->
        <div class="glass-card-static full-width animate-in">
          <div class="flex justify-between items-center" style="margin-bottom: var(--space-xs);">
            <h3 style="font-size: var(--font-sm); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-primary);">🎮 Nivel Actual: ${level}</h3>
            <span style="font-size: var(--font-xs); color: var(--text-muted); font-weight: bold;">${currentLevelXp} / 100 XP</span>
          </div>
          <div class="progress-bar-container" style="height: 12px; background: var(--bg-surface); border-radius: 6px; overflow: hidden; border: 1px solid var(--border-subtle);">
            <div class="progress-bar-fill" style="width: ${xpPct}%; background: linear-gradient(90deg, var(--color-primary), var(--color-accent-blue)); height: 100%; transition: width 1s ease-out; border-radius: 6px;"></div>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px; text-align: right;">Completa más tareas para subir de nivel 🚀</p>
        </div>

        <!-- Urgent Fires (Fuegos) -->
        <div class="glass-card-static animate-in stagger-2" style="border-top: 4px solid var(--color-accent-red);">
          <div class="flex justify-between items-center" style="margin-bottom: var(--space-md);">
            <h3 style="font-size: var(--font-sm); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-accent-red);">🔥 Próximos Fuegos</h3>
            <span style="font-size: var(--font-xs); color: var(--text-muted);">${urgentTasks.length} urgencias</span>
          </div>
          ${urgentTasks.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
              ${urgentTasks.slice(0, 4).map(task => {
      const subject = subjectsMap[task.subject_id];
      const days = Helpers.daysUntil(task.due_date);
      const isToday = days <= 0;
      return `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-xs) 0; border-bottom: 1px dashed var(--border-subtle);">
                    <div style="display: flex; align-items: center; gap: var(--space-sm); overflow: hidden;">
                      ${subject ? `<span class="subject-dot" style="background: ${subject.color}; flex-shrink: 0;"></span>` : ''}
                      <span style="font-size: var(--font-sm); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${Helpers.escapeHtml(task.title)}</span>
                    </div>
                    <span class="badge badge-high" style="flex-shrink: 0; font-size: 0.65rem; background: ${isToday ? 'var(--color-accent-red)' : 'var(--color-accent-orange)'}; color: white;">
                      ${isToday ? '¡HOY!' : 'Mañana'}
                    </span>
                  </div>
                `;
    }).join('')}
            </div>
          ` : `
            <div class="empty-state" style="padding: var(--space-md);">
              <div class="empty-state-icon" style="font-size: 2rem; margin-bottom: 8px;">🧊</div>
              <h3 style="font-size: var(--font-sm);">Todo frío y tranquilo</h3>
              <p style="font-size: var(--font-xs);">No hay tareas urgentes (48h).</p>
            </div>
          `}
        </div>

        <!-- Task Stats -->
        <div class="glass-card-static animate-in stagger-2">
          <h3 style="font-size: var(--font-sm); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-md);">📊 Estado de Tareas</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-md);">
            <div class="stat-card" style="padding: var(--space-md);">
              <div class="stat-value" style="font-size: var(--font-xl); color: var(--color-accent-orange);">${pending.length}</div>
              <div class="stat-label">Pendientes</div>
            </div>
            <div class="stat-card" style="padding: var(--space-md);">
              <div class="stat-value" style="font-size: var(--font-xl); color: var(--color-primary);">${inProgress.length}</div>
              <div class="stat-label">En Proceso</div>
            </div>
            <div class="stat-card" style="padding: var(--space-md);">
              <div class="stat-value" style="font-size: var(--font-xl); color: var(--color-accent-green);">${done.length}</div>
              <div class="stat-label">Hechas</div>
            </div>
          </div>
        </div>

        <!-- Today's Schedule -->
        <div class="glass-card-static animate-in stagger-3">
          <h3 style="font-size: var(--font-sm); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-md);">📅 Agenda del Día</h3>
          ${todaySchedule.length > 0 ? `
            <div class="agenda-timeline">
              ${todaySchedule.map(entry => {
      const subject = subjectsMap[entry.subject_id];
      return `
                  <div class="agenda-item">
                    <div class="agenda-time">
                      ${Helpers.formatTime(entry.start_time)}
                      <small>${Helpers.formatTime(entry.end_time)}</small>
                    </div>
                    <div class="agenda-line" style="background: ${subject ? subject.color : 'var(--color-primary)'}; color: ${subject ? subject.color : 'var(--color-primary)'};"></div>
                    <div class="agenda-details">
                      <p>${subject ? Helpers.escapeHtml(subject.name) : '—'}</p>
                      <h4>${entry.room ? '📍 ' + Helpers.escapeHtml(entry.room) : ''}</h4>
                    </div>
                  </div>
                `;
    }).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-icon">💤</div>
              <h3>Sin clases hoy</h3>
              <p>Disfruta tu tiempo libre</p>
            </div>
          `}
        </div>

        <!-- Subject Progress -->
        <div class="glass-card-static full-width animate-in stagger-4">
          <h3 style="font-size: var(--font-sm); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-md);">📚 Progreso por Asignatura</h3>
          ${subjectProgress.length > 0 ? `
            <div class="subject-progress">
              ${subjectProgress.map(sp => `
                <div class="subject-progress-item">
                  <div class="subject-progress-header">
                    <span class="subject-progress-name">
                      <span class="subject-dot" style="background: ${sp.subject.color}; color: ${sp.subject.color};"></span>
                      ${Helpers.escapeHtml(sp.subject.name)}
                    </span>
                    <span class="subject-progress-pct">${sp.pct}%</span>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${sp.pct}%; background: ${sp.subject.color}; color: ${sp.subject.color};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-icon">📚</div>
              <h3>Sin asignaturas</h3>
              <p>Añade asignaturas para ver tu progreso</p>
            </div>
          `}
        </div>

        <!-- Exams Countdowns (Moved below) -->
        <div class="glass-card-static full-width animate-in stagger-5">
          <div class="flex justify-between items-center" style="margin-bottom: var(--space-md);">
            <h3 style="font-size: var(--font-sm); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">⏳ Contadores de Exámenes</h3>
            <span style="font-size: var(--font-xs); color: var(--text-muted);">${exams.length} próximos</span>
          </div>
          ${exams.length > 0 ? `
            <div class="exam-countdowns-grid" id="exam-countdowns">
              ${exams.slice(0, 4).map((exam, i) => {
      const subject = subjectsMap[exam.subject_id];
      const dateParts = Helpers.formatDateParts(exam.exam_date);
      return `
                  <div class="exam-countdown-card animate-in stagger-${i + 1}">
                    <div class="exam-cd-header">
                      <span class="exam-cd-subject" style="color: ${subject ? subject.color : 'var(--color-primary)'};">${subject ? Helpers.escapeHtml(subject.name) : 'General'}</span>
                      <span class="exam-cd-date">${dateParts.day} ${dateParts.month}</span>
                    </div>
                    <div class="exam-cd-title">${Helpers.escapeHtml(exam.title)}</div>
                    <div class="exam-cd-timer" data-exam-date="${exam.exam_date}">
                      <div class="cd-unit"><span class="cd-num" data-cd-days>—</span><span class="cd-lbl">días</span></div>
                      <span class="cd-sep">:</span>
                      <div class="cd-unit"><span class="cd-num" data-cd-hours>—</span><span class="cd-lbl">hrs</span></div>
                      <span class="cd-sep">:</span>
                      <div class="cd-unit"><span class="cd-num" data-cd-mins>—</span><span class="cd-lbl">min</span></div>
                    </div>
                    ${exam.location ? `<div class="exam-cd-location">📍 ${Helpers.escapeHtml(exam.location)}</div>` : ''}
                  </div>
                `;
    }).join('')}
            </div>
          ` : `
            <div class="empty-state" style="padding: var(--space-md);">
              <div class="empty-state-icon" style="font-size: 2rem; margin-bottom: 8px;">🎉</div>
              <h3 style="font-size: var(--font-sm);">Sin exámenes a la vista</h3>
            </div>
          `}
        </div>
      </div>
    `;
  }

  function _renderRightPanel(profile, schedules, subjects, gradesBySubject, overallAvg) {
    const subjectsMap = {};
    subjects.forEach(s => subjectsMap[s.id] = s);

    // Hours per subject
    const hoursMap = {};
    schedules.forEach(entry => {
      const subject = subjectsMap[entry.subject_id];
      if (!subject) return;
      const startParts = (entry.start_time || '0:0').split(':');
      const endParts = (entry.end_time || '0:0').split(':');
      const hours = (parseInt(endParts[0]) * 60 + parseInt(endParts[1]) - parseInt(startParts[0]) * 60 - parseInt(startParts[1])) / 60;
      hoursMap[subject.id] = (hoursMap[subject.id] || 0) + hours;
    });

    const totalWeeklyHours = Object.values(hoursMap).reduce((s, v) => s + v, 0);

    return `
      <div class="profile-card glass-card-static animate-in">
        <img src="${_sessionManga.src}" alt="Manga" class="manga-avatar" />
        <div class="profile-name">${Helpers.escapeHtml(profile?.full_name || 'Estudiante')}</div>
        <div class="profile-school">${Helpers.escapeHtml(profile?.school_name || 'Mi Instituto')}</div>
        <div class="manga-quote">${_sessionManga.quote}</div>
        <div class="profile-stat">
          <div class="profile-stat-value">${totalWeeklyHours.toFixed(0)}</div>
          <div class="profile-stat-label">Horas de Clase / Semana</div>
        </div>
      </div>

      <h3 style="font-size: var(--font-sm); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-md);">Horas por Asignatura</h3>
      <div class="hours-breakdown">
        ${Object.entries(hoursMap).map(([subjId, hours]) => {
      const subj = subjectsMap[subjId];
      if (!subj) return '';
      return `
            <div class="hours-item">
              <div class="hours-item-left">
                <span class="hours-dot" style="background: ${subj.color}; color: ${subj.color};"></span>
                <span class="hours-name">${Helpers.escapeHtml(subj.name)}</span>
              </div>
              <span class="hours-value">${hours.toFixed(1)}h</span>
            </div>
          `;
    }).join('')}
      </div>

      <h3 style="font-size: var(--font-sm); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-top: var(--space-xl); margin-bottom: var(--space-md);">Calificaciones Recientes</h3>
      <div class="grade-ring-container">
        ${gradesBySubject.slice(0, 5).map(grp => `
          <div class="grade-ring-item">
            <div class="grade-mini-ring">
              <svg viewBox="0 0 36 36">
                <circle class="ring-bg" cx="18" cy="18" r="14"></circle>
                <circle class="ring-value" cx="18" cy="18" r="14"
                  stroke="${Helpers.getGradeColor(grp.average)}"
                  stroke-dasharray="${(grp.average / 10) * 88} ${88 - (grp.average / 10) * 88}"
                ></circle>
              </svg>
              <span class="grade-mini-value" style="color: ${Helpers.getGradeColor(grp.average)};">${grp.average.toFixed(1)}</span>
            </div>
            <div class="grade-ring-info">
              <h4>${Helpers.escapeHtml(grp.subject.name)}</h4>
              <p>${grp.grades.length} nota${grp.grades.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="profile-stat" style="margin-top: var(--space-lg);">
        <div class="profile-stat-value" style="color: ${Helpers.getGradeColor(overallAvg)};">${overallAvg.toFixed(2)}</div>
        <div class="profile-stat-label">Promedio General</div>
      </div>
    `;
  }

  function _startCountdowns(exams) {
    _updateCountdowns(exams);
    _countdownInterval = setInterval(() => _updateCountdowns(exams), 60000);
  }

  function _updateCountdowns(exams) {
    const timerEls = document.querySelectorAll('[data-exam-date]');
    timerEls.forEach(el => {
      const examDate = el.dataset.examDate;
      const target = new Date(examDate + 'T09:00:00');
      const now = new Date();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const daysEl = el.querySelector('[data-cd-days]');
      const hoursEl = el.querySelector('[data-cd-hours]');
      const minsEl = el.querySelector('[data-cd-mins]');

      if (daysEl) daysEl.textContent = days;
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
    });
  }

  return { render };
})();
