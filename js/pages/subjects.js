/**
 * Subjects Page — Subject cards with CRUD (async/await fixed)
 */

// eslint-disable-next-line no-var
var SubjectsPage = (function () {
  'use strict';

  let _mainEl = null;

  function render(mainEl, rightEl) {
    _mainEl = mainEl;
    rightEl.innerHTML = '';
    _refresh();
  }

  async function _refresh() {
    const subjects = await DataService.getAllSubjects();

    _mainEl.innerHTML = `
      <div class="page-header flex justify-between items-center">
        <div>
          <h1>Asignaturas</h1>
          <p>Tus materias del curso actual 📚</p>
        </div>
        <button class="btn btn-primary" id="add-subject-btn">+ Nueva Asignatura</button>
      </div>

      <div class="subjects-grid">
        ${subjects.map((s, i) => `
          <div class="glass-card subject-card animate-in stagger-${Math.min(i + 1, 6)}">
            <div class="subject-card-stripe" style="background: ${s.color};"></div>
            <h3>${Helpers.escapeHtml(s.name)}</h3>
            <div class="subject-card-detail">👤 ${Helpers.escapeHtml(s.teacher_name || 'Sin profesor')}</div>
            <div class="subject-card-detail">📍 ${Helpers.escapeHtml(s.room || 'Sin aula')}</div>
            <div class="subject-card-detail">
              <span class="subject-dot" style="background: ${s.color}; width: 12px; height: 12px;"></span>
              ${s.color}
            </div>
            <div class="subject-card-actions">
              <button class="btn btn-ghost btn-sm" data-action="edit" data-id="${s.id}">✏️ Editar</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${s.id}">🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>

      ${subjects.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <h3>Sin asignaturas</h3>
          <p>Añade tu primera asignatura para empezar</p>
        </div>
      ` : ''}
    `;

    document.getElementById('add-subject-btn').addEventListener('click', () => _openModal());

    _mainEl.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const subject = await DataService.getSubjectById(btn.dataset.id);
        if (subject) _openModal(subject);
      });
    });

    _mainEl.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await DataService.deleteSubject(btn.dataset.id);
        Toast.show('Asignatura eliminada', 'info');
        await _refresh();
      });
    });
  }

  async function _openModal(existing) {
    const isEdit = !!existing;
    const colors = ['#00d4ff', '#ff2d7b', '#39ff14', '#ff6b2b', '#a855f7', '#facc15', '#ef4444', '#14b8a6'];

    const formHtml = `
      <div class="form-group">
        <label class="form-label">Nombre</label>
        <input class="form-input" id="subj-name" value="${isEdit ? Helpers.escapeHtml(existing.name) : ''}" placeholder="Ej. Matemáticas" required />
      </div>
      <div class="form-group">
        <label class="form-label">Profesor/a</label>
        <input class="form-input" id="subj-teacher" value="${isEdit ? Helpers.escapeHtml(existing.teacher_name || '') : ''}" placeholder="Nombre del profesor" />
      </div>
      <div class="form-group">
        <label class="form-label">Aula</label>
        <input class="form-input" id="subj-room" value="${isEdit ? Helpers.escapeHtml(existing.room || '') : ''}" placeholder="Ej. A-101" />
      </div>
      <div class="form-group">
        <label class="form-label">Color</label>
        <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;" id="color-picker">
          ${colors.map(c => `
            <button type="button" class="color-swatch" data-color="${c}"
              style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: ${c}; border: 3px solid ${isEdit && existing.color === c ? 'white' : 'transparent'}; cursor: pointer; transition: all var(--transition-fast);">
            </button>
          `).join('')}
        </div>
        <input type="hidden" id="subj-color" value="${isEdit ? existing.color : colors[0]}" />
      </div>
    `;

    Modal.open(
      isEdit ? 'Editar Asignatura' : 'Nueva Asignatura',
      formHtml,
      async () => {
        const name = document.getElementById('subj-name').value.trim();
        if (!name) { Toast.show('El nombre es obligatorio', 'error'); return; }

        const data = {
          name,
          teacher_name: document.getElementById('subj-teacher').value.trim(),
          room: document.getElementById('subj-room').value.trim(),
          color: document.getElementById('subj-color').value
        };

        if (isEdit) {
          await DataService.updateSubject(existing.id, data);
          Toast.show('Asignatura actualizada', 'success');
        } else {
          await DataService.createSubject(data);
          Toast.show('Asignatura creada', 'success');
        }

        Modal.close();
        await _refresh();
      },
      {
        submitLabel: isEdit ? 'Actualizar' : 'Crear',
        showDelete: isEdit,
        onDelete: isEdit ? async () => {
          await DataService.deleteSubject(existing.id);
          Toast.show('Asignatura eliminada', 'info');
          await _refresh();
        } : undefined
      }
    );

    // Color picker interaction
    document.querySelectorAll('.color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(b => b.style.borderColor = 'transparent');
        btn.style.borderColor = 'white';
        document.getElementById('subj-color').value = btn.dataset.color;
      });
    });
  }

  return { render };
})();
