/**
 * Grades Page — Grades grouped by subject with automatic averages
 */

// eslint-disable-next-line no-var
var GradesPage = (function () {
  'use strict';

  let _mainEl = null;

  async function render(mainEl, rightEl) {
    _mainEl = mainEl;
    rightEl.innerHTML = '';
    await _refresh();
  }

  async function _refresh() {
    const gradesBySubject = await DataService.getGradesBySubject();
    const overallAvg = await DataService.getOverallAverage();

    _mainEl.innerHTML = `
      <div class="page-header flex justify-between items-center">
        <div>
          <h1>Calificaciones</h1>
          <p>Promedio general:
            <span style="font-weight: 800; color: ${Helpers.getGradeColor(overallAvg)}; font-size: var(--font-lg);">
              ${overallAvg.toFixed(2)}
            </span>
          </p>
        </div>
        <button class="btn btn-primary" id="add-grade-btn">+ Nueva Nota</button>
      </div>

      <div class="grades-container">
        ${gradesBySubject.map((grp, groupIdx) => `
          <div class="glass-card-static grades-subject-group animate-in stagger-${Math.min(groupIdx + 1, 6)}">
            <div class="grades-subject-header">
              <span class="grades-subject-name">
                <span class="subject-dot" style="background: ${grp.subject.color};"></span>
                ${Helpers.escapeHtml(grp.subject.name)}
              </span>
              <span class="grades-average" style="color: ${Helpers.getGradeColor(grp.average)};">${grp.average.toFixed(2)}</span>
            </div>
            <div class="grades-list">
              ${grp.grades.map(grade => `
                <div class="grade-row">
                  <span>${Helpers.escapeHtml(grade.title)}</span>
                  <span class="grade-score" style="color: ${Helpers.getGradeColor(grade.score)};">${grade.score.toFixed(1)}</span>
                  <span class="grade-date">${Helpers.formatDate(grade.graded_at)}</span>
                  <div class="grade-actions-cell">
                    <button class="task-action-btn" data-action="edit-grade" data-id="${grade.id}">✏️</button>
                    <button class="task-action-btn" data-action="delete-grade" data-id="${grade.id}">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      ${gradesBySubject.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🎓</div>
          <h3>Sin calificaciones</h3>
          <p>Añade tu primera nota para ver promedios</p>
        </div>
      ` : ''}
    `;

    document.getElementById('add-grade-btn').addEventListener('click', () => _openModal());

    _mainEl.querySelectorAll('[data-action="edit-grade"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const gradesData = await DataService.getAllGrades();
        const grade = gradesData.find(g => g.id === btn.dataset.id);
        if (grade) { await _openModal(grade); }
      });
    });

    _mainEl.querySelectorAll('[data-action="delete-grade"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await DataService.deleteGrade(btn.dataset.id);
        Toast.show('Calificación eliminada', 'info');
        await _refresh();
      });
    });
  }

  async function _openModal(existing) {
    const isEdit = !!existing;
    const subjects = await DataService.getAllSubjects();

    const formHtml = `
      <div class="form-group">
        <label class="form-label">Título</label>
        <input class="form-input" id="grade-title" value="${isEdit ? Helpers.escapeHtml(existing.title) : ''}" placeholder="Ej. Parcial 1" required />
      </div>
      <div class="form-group">
        <label class="form-label">Asignatura</label>
        <select class="form-select" id="grade-subject" required>
          <option value="">Seleccionar asignatura</option>
          ${subjects.map(s => `<option value="${s.id}" ${isEdit && existing.subject_id === s.id ? 'selected' : ''}>${Helpers.escapeHtml(s.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nota (0-10)</label>
          <input class="form-input" type="number" id="grade-score" min="0" max="10" step="0.1" value="${isEdit ? existing.score : ''}" placeholder="8.5" required />
        </div>
        <div class="form-group">
          <label class="form-label">Peso</label>
          <input class="form-input" type="number" id="grade-weight" min="0.1" max="5" step="0.1" value="${isEdit ? existing.weight : '1.0'}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha</label>
        <input class="form-input" type="date" id="grade-date" value="${isEdit ? existing.graded_at || '' : Helpers.todayStr()}" />
      </div>
    `;

    Modal.open(
      isEdit ? 'Editar Calificación' : 'Nueva Calificación',
      formHtml,
      async () => {
        const title = document.getElementById('grade-title').value.trim();
        const subjectId = document.getElementById('grade-subject').value;
        const score = parseFloat(document.getElementById('grade-score').value);

        if (!title || !subjectId || isNaN(score)) {
          Toast.show('Completa todos los campos obligatorios', 'error');
          return;
        }

        if (score < 0 || score > 10) {
          Toast.show('La nota debe estar entre 0 y 10', 'error');
          return;
        }

        const data = {
          title,
          subject_id: subjectId,
          score,
          max_score: 10,
          weight: parseFloat(document.getElementById('grade-weight').value) || 1.0,
          graded_at: document.getElementById('grade-date').value || Helpers.todayStr()
        };

        if (isEdit) {
          await DataService.updateGrade(existing.id, data);
          Toast.show('Calificación actualizada', 'success');
        } else {
          await DataService.createGrade(data);
          Toast.show('Calificación añadida', 'success');
        }

        Modal.close();
        await _refresh();
      },
      {
        submitLabel: isEdit ? 'Actualizar' : 'Guardar',
        showDelete: isEdit,
        onDelete: isEdit ? async () => {
          await DataService.deleteGrade(existing.id);
          Toast.show('Calificación eliminada', 'info');
          await _refresh();
        } : undefined
      }
    );
  }

  return { render };
})();
