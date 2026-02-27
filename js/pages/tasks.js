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
        ${_renderTaskBody(task.description)}
        <div class="task-card-footer">
          <div class="task-card-subject">
            ${subject ? `<span class="subject-dot" style="background: ${subject.color};"></span>${Helpers.escapeHtml(subject.name)}` : ''}
          </div>
          ${daysLeft !== null ? `<span style="color: ${daysLeft <= 1 ? 'var(--color-accent-red)' : daysLeft <= 3 ? 'var(--color-accent-orange)' : 'var(--text-muted)'};">
            ${daysLeft <= 0 ? '¡Hoy!' : daysLeft + 'd'}
          </span>` : ''}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md); padding-top: var(--space-sm); border-top: 1px dashed var(--border-subtle);">
          <div style="display: flex; gap: 8px;">
            ${task.status !== 'pending' ? `
              <button class="btn btn-outline btn-sm task-action-btn" data-action="revert" data-id="${task.id}" title="Retroceder estado" style="padding: 2px 8px; font-size: 1rem; line-height: 1;">⬅️</button>
            ` : `<div style="width: 38px;"></div>`}
            ${task.status !== 'done' ? `
              <button class="btn btn-outline btn-sm task-action-btn" data-action="advance" data-id="${task.id}" title="Avanzar estado" style="padding: 2px 8px; font-size: 1rem; line-height: 1;">➡️</button>
            ` : ''}
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-ghost btn-sm task-action-btn" data-action="edit" data-id="${task.id}">✏️ Editar</button>
            <button class="btn btn-danger btn-sm task-action-btn" data-action="delete" data-id="${task.id}">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  function _renderTaskBody(description) {
    if (!description) return '';

    // Check if it has a serialized checklist
    if (description.includes('[CHECKLIST:')) {
      try {
        const parts = description.split('[CHECKLIST:');
        const normalDesc = parts[0].trim();
        const checklistStr = parts[1].substring(0, parts[1].lastIndexOf(']'));
        const checklist = JSON.parse(checklistStr);

        const total = checklist.length;
        const complete = checklist.filter(c => c.done).length;
        const pct = total > 0 ? Math.round((complete / total) * 100) : 0;

        let html = '';
        if (normalDesc) html += `<div class="task-card-body">${Helpers.escapeHtml(normalDesc)}</div>`;
        html += `
          <div style="margin-top: 8px; font-size: 0.75rem; color: var(--text-muted);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Sub-tareas (${complete}/${total})</span>
              <span>${pct}%</span>
            </div>
            <div style="height: 4px; background: var(--bg-surface); border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; width: ${pct}%; background: var(--color-primary);"></div>
            </div>
          </div>
        `;
        return html;
      } catch (e) {
        return `<div class="task-card-body">${Helpers.escapeHtml(description)}</div>`;
      }
    }

    return `<div class="task-card-body">${Helpers.escapeHtml(description)}</div>`;
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

            if (nextStatus === 'done') {
              const newXP = await DataService.addXP(10);
              Toast.show(`¡Completado! +10 XP 🌟 (Total: \${newXP})`, 'success');
              // Optionally trigger a global event so sidebar updates immediately
              window.dispatchEvent(new Event('xp-updated'));

              // Trigger confetti celebration
              if (typeof confetti === 'function') {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
                });
              }
            } else {
              Toast.show(`Tarea movida a "${Helpers.getStatusLabel(nextStatus)}"`, 'success');
            }
            await _refresh();
          }
        } else if (action === 'revert') {
          const tasks = await DataService.getAllTasks();
          const task = tasks.find(t => t.id === id);
          if (task) {
            const prevStatus = task.status === 'done' ? 'in_progress' : 'pending';
            await DataService.updateTask(id, { status: prevStatus });

            // Si la devolvemos desde 'done', quizás deberíamos quitarle XP, 
            // pero para no estropear la gamificación positiva, lo dejamos o mostramos mensaje simple
            Toast.show(`Tarea devuelta a "${Helpers.getStatusLabel(prevStatus)}"`, 'info');
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
        <label class="form-label">Descripción Normal</label>
        <textarea class="form-textarea" style="min-height: 60px;" id="task-desc" placeholder="Detalles generales">${_getNormalDesc(isEdit, existingTask)}</textarea>
      </div>

      <div class="form-group" style="background: var(--bg-surface); padding: var(--space-sm); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
          <span>📋 Sub-tareas (Checklist)</span>
          <button type="button" id="task-add-sub" class="btn btn-outline" style="padding: 2px 8px; font-size: 0.75rem;">+ Añadir paso</button>
        </label>
        <div id="task-checklist-container" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          ${_renderEditChecklist(isEdit, existingTask)}
        </div>
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

        let finalDesc = document.getElementById('task-desc').value.trim();

        // Serialize checklist
        const checks = [];
        document.querySelectorAll('.chk-item-row').forEach(row => {
          const isDone = row.querySelector('.chk-box').checked;
          const text = row.querySelector('.chk-text').value.trim();
          if (text) checks.push({ done: isDone, text });
        });

        if (checks.length > 0) {
          finalDesc += `\n[CHECKLIST:${JSON.stringify(checks)}]`;
        }

        const data = {
          title,
          description: finalDesc,
          subject_id: document.getElementById('task-subject').value || null,
          priority: document.getElementById('task-priority').value,
          status: document.getElementById('task-status').value,
          due_date: document.getElementById('task-due').value || null
        };

        if (isEdit) {
          await DataService.updateTask(existingTask.id, data);
          if (existingTask.status !== 'done' && data.status === 'done') {
            const newXP = await DataService.addXP(10);
            Toast.show(`¡Completado! +10 XP 🌟 (Total: \${newXP})`, 'success');
            window.dispatchEvent(new Event('xp-updated'));
          } else {
            Toast.show('Tarea actualizada', 'success');
          }
        } else {
          await DataService.createTask(data);
          if (data.status === 'done') {
            await DataService.addXP(10);
            window.dispatchEvent(new Event('xp-updated'));
          }
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

    // Bind add checklist item
    setTimeout(() => {
      const addBtn = document.getElementById('task-add-sub');
      const container = document.getElementById('task-checklist-container');
      if (addBtn && container) {
        addBtn.addEventListener('click', () => {
          const div = document.createElement('div');
          div.className = 'flex items-center chk-item-row';
          div.style.gap = '8px';
          div.innerHTML = `
            <input type="checkbox" class="chk-box" style="width: 16px; height: 16px; cursor: pointer;">
            <input type="text" class="form-input chk-text" placeholder="Nueva sub-tarea..." style="flex: 1; padding: 4px 8px;">
            <button type="button" class="chk-del" style="background:none; border:none; cursor:pointer; color: var(--color-accent-red);">🚮</button>
          `;
          container.appendChild(div);

          div.querySelector('.chk-del').addEventListener('click', () => div.remove());
          div.querySelector('.chk-text').focus();
        });

        // Bind delete for existing
        container.querySelectorAll('.chk-del').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.target.closest('.chk-item-row').remove();
          });
        });
      }
    }, 100);
  }

  function _getNormalDesc(isEdit, task) {
    if (!isEdit || !task.description) return '';
    if (task.description.includes('[CHECKLIST:')) {
      return Helpers.escapeHtml(task.description.split('[CHECKLIST:')[0].trim());
    }
    return Helpers.escapeHtml(task.description);
  }

  function _renderEditChecklist(isEdit, task) {
    if (!isEdit || !task.description || !task.description.includes('[CHECKLIST:')) return '';
    try {
      const parts = task.description.split('[CHECKLIST:');
      const str = parts[1].substring(0, parts[1].lastIndexOf(']'));
      const arr = JSON.parse(str);

      return arr.map(c => `
        <div class="flex items-center chk-item-row" style="gap: 8px;">
          <input type="checkbox" class="chk-box" style="width: 16px; height: 16px; cursor: pointer;" ${c.done ? 'checked' : ''}>
          <input type="text" class="form-input chk-text" value="${Helpers.escapeHtml(c.text)}" style="flex: 1; padding: 4px 8px; ${c.done ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">
          <button type="button" class="chk-del" style="background:none; border:none; cursor:pointer; color: var(--color-accent-red);">🚮</button>
        </div>
      `).join('');
    } catch (e) { return ''; }
  }

  return { render };
})();
