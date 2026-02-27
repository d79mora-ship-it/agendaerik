/**
 * Exams Page — Timeline view with countdowns
 */

// eslint-disable-next-line no-var
var ExamsPage = (function () {
  'use strict';

  let _mainEl = null;

  async function render(mainEl, rightEl) {
    _mainEl = mainEl;
    rightEl.innerHTML = '';
    await _refresh();
  }

  async function _refresh() {
    const examsData = await DataService.getAllExams();
    const exams = examsData.sort((a, b) => a.exam_date.localeCompare(b.exam_date));

    const today = Helpers.todayStr();
    const upcoming = exams.filter(e => e.exam_date >= today);
    const past = exams.filter(e => e.exam_date < today);

    const allSubjects = await DataService.getAllSubjects();
    const subjectsMap = {};
    allSubjects.forEach(s => subjectsMap[s.id] = s);

    _mainEl.innerHTML = `
      <div class="page-header flex justify-between items-center">
        <div>
          <h1>Exámenes</h1>
          <p>${upcoming.length} examen${upcoming.length !== 1 ? 'es' : ''} próximo${upcoming.length !== 1 ? 's' : ''}</p>
        </div>
        <button class="btn btn-primary" id="add-exam-btn">+ Nuevo Examen</button>
      </div>

      ${upcoming.length > 0 ? `
        <h3 style="font-size: var(--font-sm); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; margin-bottom: var(--space-md);">
          📅 Próximos
        </h3>
        <div class="exams-list mb-lg">
          ${upcoming.map((exam, i) => _renderExamCard(exam, i, subjectsMap)).join('')}
        </div>
      ` : ''}

      ${past.length > 0 ? `
        <h3 style="font-size: var(--font-sm); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; margin-bottom: var(--space-md); margin-top: var(--space-xl);">
          📋 Pasados
        </h3>
        <div class="exams-list" style="opacity: 0.6;">
          ${past.map((exam, i) => _renderExamCard(exam, i, subjectsMap)).join('')}
        </div>
      ` : ''}

      ${exams.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h3>Sin exámenes</h3>
          <p>Añade tu primer examen</p>
        </div>
      ` : ''}
    `;

    document.getElementById('add-exam-btn').addEventListener('click', () => _openModal());

    _mainEl.querySelectorAll('[data-action="edit-exam"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const examsData = await DataService.getAllExams();
        const exam = examsData.find(e => e.id === btn.dataset.id);
        if (exam) { await _openModal(exam); }
      });
    });

    _mainEl.querySelectorAll('[data-action="delete-exam"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await DataService.deleteExam(btn.dataset.id);
        Toast.show('Examen eliminado', 'info');
        await _refresh();
      });
    });
  }

  function _renderExamCard(exam, index, subjectsMap) {
    const subject = subjectsMap[exam.subject_id];
    const dateParts = Helpers.formatDateParts(exam.exam_date);
    const daysLeft = Helpers.daysUntil(exam.exam_date);

    return `
      <div class="glass-card exam-card animate-in stagger-${Math.min(index + 1, 6)}">
        <div class="exam-date-block">
          <div class="exam-date-day">${dateParts.day}</div>
          <div class="exam-date-month">${dateParts.month}</div>
        </div>
        <div class="exam-info">
          <h3>${Helpers.escapeHtml(exam.title)}</h3>
          <p>
            ${subject ? `<span class="subject-dot" style="background: ${subject.color}; display: inline-block; margin-right: 4px;"></span>${Helpers.escapeHtml(subject.name)}` : ''}
            ${exam.location ? ` · 📍 ${Helpers.escapeHtml(exam.location)}` : ''}
          </p>
          ${exam.notes ? `<p style="margin-top: 4px; font-size: var(--font-xs); color: var(--text-muted);">${Helpers.escapeHtml(exam.notes)}</p>` : ''}
        </div>
        <div>
          ${daysLeft >= 0 ? `
            <div class="exam-countdown">
              <div class="exam-countdown-value">${daysLeft}</div>
              <div class="exam-countdown-label">días</div>
            </div>
          ` : `
            <span class="badge badge-done">Pasado</span>
          `}
          <div style="display: flex; gap: var(--space-xs); margin-top: var(--space-sm); justify-content: flex-end;">
            <button class="task-action-btn" data-action="edit-exam" data-id="${exam.id}">✏️</button>
            <button class="task-action-btn" data-action="delete-exam" data-id="${exam.id}">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  async function _openModal(existing) {
    const isEdit = !!existing;
    const subjects = await DataService.getAllSubjects();

    const formHtml = `
      <div class="form-group">
        <label class="form-label">Título</label>
        <input class="form-input" id="exam-title" value="${isEdit ? Helpers.escapeHtml(existing.title) : ''}" placeholder="Ej. Parcial de Cálculo" required />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Asignatura</label>
          <select class="form-select" id="exam-subject">
            <option value="">Sin asignatura</option>
            ${subjects.map(s => `<option value="${s.id}" ${isEdit && existing.subject_id === s.id ? 'selected' : ''}>${Helpers.escapeHtml(s.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha</label>
          <input class="form-input" type="date" id="exam-date" value="${isEdit ? existing.exam_date : ''}" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Ubicación</label>
        <input class="form-input" id="exam-location" value="${isEdit ? Helpers.escapeHtml(existing.location || '') : ''}" placeholder="Ej. Aula Magna" />
      </div>
      <div class="form-group">
        <label class="form-label">Notas</label>
        <textarea class="form-textarea" id="exam-notes" placeholder="Temas a estudiar, materiales, etc.">${isEdit ? Helpers.escapeHtml(existing.notes || '') : ''}</textarea>
      </div>
    `;

    Modal.open(
      isEdit ? 'Editar Examen' : 'Nuevo Examen',
      formHtml,
      async () => {
        const title = document.getElementById('exam-title').value.trim();
        const examDate = document.getElementById('exam-date').value;
        if (!title || !examDate) { Toast.show('Título y fecha son obligatorios', 'error'); return; }

        const data = {
          title,
          subject_id: document.getElementById('exam-subject').value || null,
          exam_date: examDate,
          location: document.getElementById('exam-location').value.trim(),
          notes: document.getElementById('exam-notes').value.trim()
        };

        if (isEdit) {
          await DataService.updateExam(existing.id, data);
          Toast.show('Examen actualizado', 'success');
        } else {
          await DataService.createExam(data);
          Toast.show('Examen creado', 'success');
        }

        Modal.close();
        await _refresh();
      },
      {
        submitLabel: isEdit ? 'Actualizar' : 'Crear',
        showDelete: isEdit,
        onDelete: isEdit ? async () => {
          await DataService.deleteExam(existing.id);
          Toast.show('Examen eliminado', 'info');
          await _refresh();
        } : undefined
      }
    );
  }

  return { render };
})();
