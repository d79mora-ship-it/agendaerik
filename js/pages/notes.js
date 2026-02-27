/**
 * Notes Page — Quick notes/apuntes organized by subject
 */

// eslint-disable-next-line no-var
var NotesPage = (function () {
  'use strict';

  let _mainEl = null;
  let _filterSubject = '';

  function render(mainEl, rightEl) {
    _mainEl = mainEl;
    rightEl.innerHTML = '';
    _refresh();
  }

  async function _refresh() {
    const notes = await DataService.getAllNotes();
    const subjects = await DataService.getAllSubjects();
    const subjectsMap = {};
    subjects.forEach(s => subjectsMap[s.id] = s);

    // Apply filter
    const filtered = _filterSubject
      ? notes.filter(n => n.subject_id === _filterSubject)
      : notes;

    // Sort by updated_at descending
    filtered.sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''));

    _mainEl.innerHTML = `
      <div class="page-header flex justify-between items-center">
        <div>
          <h1>Apuntes</h1>
          <p>Tus notas rápidas de clase ✏️</p>
        </div>
        <button class="btn btn-primary" id="add-note-btn">+ Nuevo Apunte</button>
      </div>

      <div class="notes-filter" style="margin-bottom: var(--space-lg); display: flex; gap: var(--space-sm); flex-wrap: wrap;">
        <button class="btn ${!_filterSubject ? 'btn-primary' : 'btn-ghost'} btn-sm" data-filter="">Todos</button>
        ${subjects.map(s => `
          <button class="btn ${_filterSubject === s.id ? 'btn-primary' : 'btn-ghost'} btn-sm" data-filter="${s.id}" style="${_filterSubject === s.id ? '' : `border-color: ${s.color}40; color: ${s.color};`}">
            <span class="subject-dot" style="background: ${s.color}; width: 8px; height: 8px;"></span>
            ${Helpers.escapeHtml(s.name)}
          </button>
        `).join('')}
      </div>

      <div class="notes-grid">
        ${filtered.length > 0 ? filtered.map((note, i) => {
      const subject = subjectsMap[note.subject_id];
      return `
            <div class="glass-card note-card animate-in stagger-${Math.min(i + 1, 6)}" data-note-id="${note.id}" style="border-top: 3px solid ${subject ? subject.color : 'var(--color-primary)'};">
              <div class="note-card-header">
                <h3>${Helpers.escapeHtml(note.title)}</h3>
                <div class="note-actions">
                  <button class="task-action-btn" data-action="edit-note" data-id="${note.id}" title="Editar">✏️</button>
                  <button class="task-action-btn" data-action="delete-note" data-id="${note.id}" title="Eliminar">🗑️</button>
                </div>
              </div>
              ${subject ? `<span class="badge badge-in-progress" style="margin-bottom: var(--space-sm); font-size: 0.65rem;">${Helpers.escapeHtml(subject.name)}</span>` : ''}
              <div class="note-card-body">${_renderContent(note.content)}</div>
              <div class="note-card-footer">
                <span style="font-size: var(--font-xs); color: var(--text-muted);">${Helpers.formatDate(note.updated_at || note.created_at)}</span>
              </div>
            </div>
          `;
    }).join('') : `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">📝</div>
            <h3>Sin apuntes</h3>
            <p>${_filterSubject ? 'No hay apuntes para esta asignatura' : 'Crea tu primer apunte'}</p>
          </div>
        `}
      </div>
    `;

    // Filter buttons
    _mainEl.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        _filterSubject = btn.dataset.filter || '';
        _refresh();
      });
    });

    document.getElementById('add-note-btn').addEventListener('click', () => _openModal());

    _mainEl.querySelectorAll('[data-action="edit-note"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const allNotes = await DataService.getAllNotes();
        const note = allNotes.find(n => n.id === btn.dataset.id);
        if (note) await _openModal(note);
      });
    });

    _mainEl.querySelectorAll('[data-action="delete-note"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await DataService.deleteNote(btn.dataset.id);
        Toast.show('Apunte eliminado', 'info');
        await _refresh();
      });
    });
  }

  function _renderContent(content) {
    if (!content) return '<span style="color: var(--text-muted);">Sin contenido</span>';

    // Strip HTML tags for the preview securely
    const temp = document.createElement('div');
    temp.innerHTML = content;
    const textOnly = temp.textContent || temp.innerText || '';

    // Truncate to 150 chars for card view
    const truncated = textOnly.length > 150 ? textOnly.substring(0, 150) + '...' : textOnly;
    return `<p style="white-space: pre-wrap; color: var(--text-secondary); font-size: var(--font-sm); line-height: 1.6;">${Helpers.escapeHtml(truncated)}</p>`;
  }

  async function _openModal(existing) {
    const isEdit = !!existing;
    const subjects = await DataService.getAllSubjects();

    const formHtml = `
      <div class="form-group">
        <label class="form-label">Título</label>
        <input class="form-input" id="note-title" value="${isEdit ? Helpers.escapeHtml(existing.title) : ''}" placeholder="Ej. Fórmulas de cálculo" required />
      </div>
      <div class="form-group">
        <label class="form-label">Asignatura</label>
        <select class="form-select" id="note-subject">
          <option value="">Sin asignatura</option>
          ${subjects.map(s => `<option value="${s.id}" ${isEdit && existing.subject_id === s.id ? 'selected' : ''}>${Helpers.escapeHtml(s.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="display: flex; flex-direction: column; height: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label class="form-label">Contenido</label>
          <span id="auto-save-indicator" style="font-size: 0.7rem; color: var(--text-muted); opacity: 0; transition: opacity 0.3s ease;">Guardado automático ✔️</span>
        </div>
        <div class="rich-toolbar" style="display: flex; gap: 4px; margin-bottom: 8px; background: var(--bg-surface); padding: 4px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <button type="button" class="btn btn-ghost btn-sm rich-btn" data-cmd="bold" style="padding: 2px 8px; font-weight: bold;">B</button>
          <button type="button" class="btn btn-ghost btn-sm rich-btn" data-cmd="italic" style="padding: 2px 8px; font-style: italic;">I</button>
          <button type="button" class="btn btn-ghost btn-sm rich-btn" data-cmd="underline" style="padding: 2px 8px; text-decoration: underline;">U</button>
          <div style="width: 1px; background: var(--border-subtle); margin: 0 4px;"></div>
          <button type="button" class="btn btn-ghost btn-sm rich-btn" data-cmd="insertUnorderedList" style="padding: 2px 8px;">• Lista</button>
          <button type="button" class="btn btn-ghost btn-sm rich-btn" data-cmd="insertOrderedList" style="padding: 2px 8px;">1. Lista</button>
        </div>
        <div class="form-textarea rich-editor" id="note-content" contenteditable="true" style="min-height: 250px; overflow-y: auto; background: var(--bg-card);">${isEdit ? existing.content || '' : ''}</div>
      </div>
    `;

    Modal.open(
      isEdit ? 'Editar Apunte' : 'Nuevo Apunte',
      formHtml,
      async () => {
        const title = document.getElementById('note-title').value.trim();
        if (!title) { Toast.show('El título es obligatorio', 'error'); return; }

        const data = {
          title,
          subject_id: document.getElementById('note-subject').value || null,
          content: document.getElementById('note-content').innerHTML, // Use innerHTML for Rich Text
          updated_at: new Date().toISOString()
        };

        if (isEdit) {
          await DataService.updateNote(existing.id, data);
          Toast.show('Apunte actualizado', 'success');
        } else {
          await DataService.createNote(data);
          Toast.show('Apunte creado', 'success');
        }

        Modal.close();
        await _refresh();
      },
      {
        submitLabel: isEdit ? 'Cerrar y Actualizar' : 'Guardar',
        showDelete: isEdit,
        onDelete: isEdit ? async () => {
          await DataService.deleteNote(existing.id);
          Toast.show('Apunte eliminado', 'info');
          await _refresh();
        } : undefined
      }
    );

    // Bind Rich Text Buttons
    setTimeout(() => {
      document.querySelectorAll('.rich-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          document.execCommand(btn.dataset.cmd, false, null);
          document.getElementById('note-content').focus();
        });
      });

      // Bind Auto-Save (Debounce)
      if (isEdit) {
        const editor = document.getElementById('note-content');
        const indicator = document.getElementById('auto-save-indicator');
        let debounceTimer = null;

        editor.addEventListener('keyup', () => {
          clearTimeout(debounceTimer);
          indicator.style.opacity = '0'; // Hide

          debounceTimer = setTimeout(async () => {
            const title = document.getElementById('note-title').value.trim() || 'Sin Título';
            const data = {
              title,
              subject_id: document.getElementById('note-subject').value || null,
              content: editor.innerHTML,
              updated_at: new Date().toISOString()
            };

            await DataService.updateNote(existing.id, data);
            indicator.style.opacity = '1'; // Show saved

            // Refresh background so grid stays updated
            await _refresh();
          }, 3000); // 3 seconds
        });
      }
    }, 100);
  }

  return { render };
})();
