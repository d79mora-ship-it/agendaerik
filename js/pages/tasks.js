/**
 * Tasks Page — Kanban board with CRUD operations
 */

// eslint-disable-next-line no-var
var TasksPage = (function () {
  'use strict';

  let _mainEl = null;

  function render(mainEl, rightEl) {
    _mainEl = mainEl;
    rightEl.innerHTML = '';
    _refresh();
  }

  async function _refresh() {
    const tasks = await DataService.getAllTasks();
    const subjects = await DataService.getAllSubjects();
    const subjectsMap = {};
    subjects.forEach(s => subjectsMap[s.id] = s);

    const pending = tasks.filter(t => t.status === 'pending');
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    const done = tasks.filter(t => t.status === 'done');

    _mainEl.innerHTML = `
      <div class="page-header flex justify-between items-center">
        <div>
          <h1>Tareas</h1>
          <p>Gestiona tus tareas y entregas 📋</p>
        </div>
        <button class="btn btn-primary" id="add-task-btn">+ Nueva Tarea</button>
      </div>

      <div class="kanban-board">
        ${_renderColumn('📋 Pendientes', 'pending', pending, 'var(--color-accent-orange)', subjectsMap)}
        ${_renderColumn('⚡ En Proceso', 'in_progress', inProgress, 'var(--color-primary)', subjectsMap)}
        ${_renderColumn('✅ Completadas', 'done', done, 'var(--color-accent-green)', subjectsMap)}
      </div>
    `;

    document.getElementById('add-task-btn').addEventListener('click', () => _openTaskModal());
    _bindCardActions();
  }

  function _renderColumn(title, status, tasks, color, subjectsMap) {
    return `
      <div class="kanban-column">
        <div class="kanban-column-header" style="border-bottom-color: ${color};">
          <span class="kanban-column-title">
            ${title}
            <span class="kanban-count">${tasks.length}</span>
          </span>
        </div>
        ${tasks.length > 0 ? tasks.map((task, i) => _renderTaskCard(task, i, subjectsMap)).join('') : `
          <div class="empty-state" style="padding: var(--space-lg);">
            <p style="font-size: var(--font-sm);">Sin tareas</p>
          </div>
        `}
      </div>
    `;
  }

  function _renderTaskCard(task, index, subjectsMap) {
    const subject = subjectsMap[task.subject_id];
    const daysLeft = task.due_date ? Helpers.daysUntil(task.due_date) : null;

    return `
      <div class="glass-card task-card animate-in stagger-${Math.min(index + 1, 6)}" data-task-id="${task.id}">
        <div class="task-card-header">
          <h3>${Helpers.escapeHtml(task.title)}</h3>
          <span class="badge badge-${task.priority}">${Helpers.getPriorityLabel(task.priority)}</span>
        </div>
        ${task.description ? `<div class="task-card-body">${Helpers.escapeHtml(task.description)}</div>` : ''}
        <div class="task-card-footer">
          <div class="task-card-subject">
            ${subject ? `<span class="subject-dot" style="background: ${subject.color};"></span>${Helpers.escapeHtml(subject.name)}` : ''}
          </div>
          ${daysLeft !== null ? `<span style="color: ${daysLeft <= 1 ? 'var(--color-accent-red)' : daysLeft <= 3 ? 'var(--color-accent-orange)' : 'var(--text-muted)'};">
            ${daysLeft <= 0 ? '¡Hoy!' : daysLeft + 'd'}
          </span>` : ''}
        </div>
        <div class="task-actions" style="margin-top: var(--space-sm);">
          ${task.status !== 'done' ? `
            <button class="task-action-btn" data-action="advance" data-id="${task.id}" title="Avanzar estado">→</button>
          ` : ''}
          <button class="task-action-btn" data-action="edit" data-id="${task.id}" title="Editar">✏️</button>
          <button class="task-action-btn" data-action="delete" data-id="${task.id}" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;
  }

  function _bindCardActions() {
    _mainEl.querySelectorAll('.task-action-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'advance') {
          const tasks = await DataService.getAllTasks();
          const task = tasks.find(t => t.id === id);
          if (task) {
            const nextStatus = task.status === 'pending' ? 'in_progress' : 'done';
            await DataService.updateTask(id, { status: nextStatus });
            Toast.show(`Tarea movida a "${Helpers.getStatusLabel(nextStatus)}"`, 'success');
            await _refresh();
          }
        } else if (action === 'edit') {
          const tasks = await DataService.getAllTasks();
          const task = tasks.find(t => t.id === id);
          if (task) await _openTaskModal(task);
        } else if (action === 'delete') {
          await DataService.deleteTask(id);
          Toast.show('Tarea eliminada', 'info');
          await _refresh();
        }
      });
    });
  }

  async function _openTaskModal(existingTask) {
    const isEdit = !!existingTask;
    const subjects = await DataService.getAllSubjects();

    const subjectOptions = subjects.map(s =>
      `<option value="${s.id}" ${existingTask && existingTask.subject_id === s.id ? 'selected' : ''}>${Helpers.escapeHtml(s.name)}</option>`
    ).join('');

    const formHtml = `
      <div class="form-group">
        <label class="form-label">Título</label>
        <input class="form-input" id="task-title" value="${isEdit ? Helpers.escapeHtml(existingTask.title) : ''}" placeholder="Nombre de la tarea" required />
      </div>
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <textarea class="form-textarea" id="task-desc" placeholder="Detalles opcionales">${isEdit ? Helpers.escapeHtml(existingTask.description || '') : ''}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Asignatura</label>
          <select class="form-select" id="task-subject">
            <option value="">Sin asignatura</option>
            ${subjectOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Prioridad</label>
          <select class="form-select" id="task-priority">
            <option value="low" ${isEdit && existingTask.priority === 'low' ? 'selected' : ''}>Baja</option>
            <option value="medium" ${(!isEdit || existingTask.priority === 'medium') ? 'selected' : ''}>Media</option>
            <option value="high" ${isEdit && existingTask.priority === 'high' ? 'selected' : ''}>Alta</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select class="form-select" id="task-status">
            <option value="pending" ${(!isEdit || existingTask.status === 'pending') ? 'selected' : ''}>Pendiente</option>
            <option value="in_progress" ${isEdit && existingTask.status === 'in_progress' ? 'selected' : ''}>En Proceso</option>
            <option value="done" ${isEdit && existingTask.status === 'done' ? 'selected' : ''}>Hecho</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha límite</label>
          <input class="form-input" type="date" id="task-due" value="${isEdit ? existingTask.due_date || '' : ''}" />
        </div>
      </div>
    `;

    Modal.open(
      isEdit ? 'Editar Tarea' : 'Nueva Tarea',
      formHtml,
      async () => {
        const title = document.getElementById('task-title').value.trim();
        if (!title) { Toast.show('El título es obligatorio', 'error'); return; }

        const data = {
          title,
          description: document.getElementById('task-desc').value.trim(),
          subject_id: document.getElementById('task-subject').value || null,
          priority: document.getElementById('task-priority').value,
          status: document.getElementById('task-status').value,
          due_date: document.getElementById('task-due').value || null
        };

        if (isEdit) {
          await DataService.updateTask(existingTask.id, data);
          Toast.show('Tarea actualizada', 'success');
        } else {
          await DataService.createTask(data);
          Toast.show('Tarea creada', 'success');
        }

        Modal.close();
        await _refresh();
      },
      {
        submitLabel: isEdit ? 'Actualizar' : 'Crear',
        showDelete: isEdit,
        onDelete: isEdit ? async () => {
          await DataService.deleteTask(existingTask.id);
          Toast.show('Tarea eliminada', 'info');
          await _refresh();
        } : undefined
      }
    );
  }

  return { render };
})();
