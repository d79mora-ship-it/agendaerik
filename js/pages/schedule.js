/**
 * Schedule Page — Weekly timetable grid with custom events and calendar sync
 */

// eslint-disable-next-line no-var
var SchedulePage = (function () {
  'use strict';

  let _mainEl = null;

  // Track the currently viewed week's Monday
  let _currentWeekStart = _getMonday(new Date());

  function _getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function _addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function _formatDateForHeader(date) {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase();
  }

  function _formatDateForInput(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  async function render(mainEl, rightEl) {
    _mainEl = mainEl;
    rightEl.innerHTML = '';
    await _refresh();
  }

  async function _refresh() {
    const schedules = await DataService.getAllSchedules();
    const timeSlots = Helpers.TIME_SLOTS;
    const daysStr = Helpers.DAY_SHORT;

    const allSubjects = await DataService.getAllSubjects();
    const subjectsMap = {};
    allSubjects.forEach(s => subjectsMap[s.id] = s);

    // Calculate dates for current week
    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      weekDates.push(_addDays(_currentWeekStart, i));
    }

    const weekStartStr = _currentWeekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const weekEndStr = _addDays(_currentWeekStart, 4).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    // Dynamic Time Slots: Combine base 1-hour slots with exact start times of any scheduled event
    const timeSlotsSet = new Set(Helpers.TIME_SLOTS);
    schedules.forEach(s => {
      if (s.start_time) {
        const parts = s.start_time.split(':');
        if (parts.length >= 2) {
          timeSlotsSet.add(`${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`);
        }
      }
    });
    // Convert to array and sort chronologically
    const dynamicTimeSlots = Array.from(timeSlotsSet).sort();

    _mainEl.innerHTML = `
      <div class="page-header flex justify-between items-center" style="flex-wrap: wrap; gap: var(--space-md);">
        <div>
          <h1>Horario</h1>
          <p>Semana del ${weekStartStr} al ${weekEndStr}</p>
        </div>
        
        <div class="flex items-center gap-2" style="display:flex; gap: 8px; align-items: center;">
          <button class="btn btn-ghost btn-sm" id="prev-week-btn">◀ Anterior</button>
          <button class="btn btn-ghost btn-sm" id="today-week-btn">Hoy</button>
          <button class="btn btn-ghost btn-sm" id="next-week-btn">Siguiente ▶</button>
        </div>

        <div class="flex items-center gap-2" style="display:flex; gap: 8px; align-items: center;">
          <button class="btn btn-secondary" id="download-schedule-btn" style="background: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border-subtle);" title="Guardar como imagen">📷 Descargar</button>
          <button class="btn btn-primary" id="add-schedule-btn">+ Añadir Clase/Evento</button>
        </div>
      </div>

      <div class="glass-card-static animate-in" style="overflow-x: auto; padding: 0; background: var(--bg-card); border: 1px solid var(--border-subtle);">
        <div class="schedule-grid" style="border: none; border-radius: 0;">
          <!-- Header Row -->
          <div class="schedule-header" style="background: transparent; border-right: 1px solid var(--border-subtle);"></div>
          ${daysStr.map((d, i) => `<div class="schedule-header" style="border-right: 1px solid var(--border-subtle);">${d} <br> <span style="font-size: 0.85rem; font-weight: 400; color: var(--text-primary);">${_formatDateForHeader(weekDates[i])}</span></div>`).join('')}

          <!-- Time Rows -->
          ${dynamicTimeSlots.map(time => {
      const hour = parseInt(time.split(':')[0], 10);
      // School hours highlighted from 08:00 to 15:00 
      const isSchoolHour = hour >= 8 && hour <= 15;
      const rowClass = isSchoolHour ? 'schedule-cell school-hour-cell' : 'schedule-cell';

      return `
            <div class="schedule-time" style="border-right: 1px solid var(--border-subtle); border-top: 1px solid var(--border-subtle);">${time}</div>
            ${Array.from({ length: 5 }, (_, dayIdx) => {
        const columnDateStr = _formatDateForInput(weekDates[dayIdx]);

        // Find entry that falls EXACTLY onto this time slot
        const entry = schedules.find(s => {
          let sTimeStr = "00:00";
          if (s.start_time) {
            const parts = s.start_time.split(':');
            sTimeStr = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
          }
          const timeMatch = sTimeStr === time;
          if (!timeMatch) return false;

          const isOneOffMatch = !!s.date && s.date === columnDateStr;
          const isRecurringMatch = !s.date && s.day_of_week === dayIdx;

          return isOneOffMatch || isRecurringMatch;
        });

        if (entry) {
          const subject = entry.subject_id ? subjectsMap[entry.subject_id] : null;
          const displayName = subject ? Helpers.escapeHtml(subject.name) : Helpers.escapeHtml(entry.custom_name || 'Evento');
          const displayColor = subject ? subject.color : 'var(--color-primary)';
          const roomInfo = entry.room ? Helpers.escapeHtml(entry.room) : '';

          return `
                  <div class="${rowClass}" data-schedule-id="${entry.id}" style="border-right: 1px solid var(--border-subtle); border-top: 1px solid var(--border-subtle); cursor: pointer;" title="Click para editar">
                    <div class="schedule-block" style="background: ${displayColor};">
                      <div style="font-weight: 500; font-size: 0.8rem;">${displayName}</div>
                      ${roomInfo ? `<div style="font-size: 0.7rem; opacity: 0.9; margin-top: 2px;">${roomInfo}</div>` : ''}
                    </div>
                  </div>
                `;
        }
        return `<div class="${rowClass}" data-day="${dayIdx}" data-time="${time}" data-date="${columnDateStr}" style="border-right: 1px solid var(--border-subtle); border-top: 1px solid var(--border-subtle);"></div>`;
      }).join('')}
          `}).join('')}
        </div>
      </div>
    `;

    // Bind Week Navigation Events
    document.getElementById('prev-week-btn').addEventListener('click', () => {
      _currentWeekStart = _addDays(_currentWeekStart, -7);
      _refresh();
    });
    document.getElementById('next-week-btn').addEventListener('click', () => {
      _currentWeekStart = _addDays(_currentWeekStart, 7);
      _refresh();
    });
    document.getElementById('today-week-btn').addEventListener('click', () => {
      _currentWeekStart = _getMonday(new Date());
      _refresh();
    });

    document.getElementById('add-schedule-btn').addEventListener('click', () => _openModal());

    // Click on existing entry to edit
    _mainEl.querySelectorAll('[data-schedule-id]').forEach(cell => {
      cell.addEventListener('click', async () => {
        const schedulesData = await DataService.getAllSchedules();
        const entry = schedulesData.find(s => s.id === cell.dataset.scheduleId);
        if (entry) { await _openModal(entry); }
      });
    });

    // Click on empty cell to add
    _mainEl.querySelectorAll('.schedule-cell:not([data-schedule-id])').forEach(cell => {
      cell.addEventListener('click', () => {
        const day = parseInt(cell.dataset.day);
        const time = cell.dataset.time;
        const dateStr = cell.dataset.date;
        if (!isNaN(day) && time) {
          _openModal(null, day, time, dateStr);
        }
      });
    });
  }

  async function _openModal(existing, preDay, preTime, preDateStr) {
    const isEdit = !!existing;
    const subjects = await DataService.getAllSubjects();
    const timeSlots = Helpers.TIME_SLOTS;

    const endTimeForStart = (startTime) => {
      if (!startTime) return '14:45';
      const parts = startTime.split(':');
      if (parts.length === 2) {
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        h = (h + 1) % 24;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }
      return '14:45';
    };

    const defaultDay = preDay !== undefined ? preDay : (isEdit ? (existing.day_of_week || 0) : 0);
    const defaultStart = preTime || (isEdit ? existing.start_time : timeSlots[0]);
    const defaultEnd = isEdit ? existing.end_time : endTimeForStart(defaultStart);
    const hasCustomName = isEdit && !existing.subject_id;

    // For single date
    const defaultDateStr = isEdit ? (existing.date || '') : (preDateStr || '');
    const isSingleEvent = isEdit ? !!existing.date : !!preDateStr;

    // Split default times for dropdowns
    const [startH, startM] = defaultStart.split(':');
    const [endH, endM] = defaultEnd.split(':');

    const generateOptions = (start, end, selected) => {
      let options = '';
      for (let i = start; i <= end; i++) {
        const val = i.toString().padStart(2, '0');
        options += `<option value="${val}" ${selected === val ? 'selected' : ''}>${val}</option>`;
      }
      return options;
    };

    const formHtml = `
      <div class="form-group">
        <label class="form-label">Tipo de Evento</label>
        <div style="display: flex; gap: 15px; margin-top: 5px;">
          <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
            <input type="radio" name="sch-type" value="recurring" ${!isSingleEvent ? 'checked' : ''}> Repetir semanalmente
          </label>
          <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
            <input type="radio" name="sch-type" value="single" ${isSingleEvent ? 'checked' : ''}> Solo esta fecha
          </label>
        </div>
      </div>

      <div class="form-group" id="sch-date-group" style="${!isSingleEvent ? 'display: none;' : ''}">
        <label class="form-label">Fecha Específica</label>
        <input class="form-input" type="date" id="sch-date" value="${defaultDateStr}" />
      </div>

      <div class="form-group" id="sch-day-group" style="${isSingleEvent ? 'display: none;' : ''}">
        <label class="form-label">Día de la semana</label>
        <select class="form-select" id="sch-day">
          ${Helpers.DAY_SHORT.map((d, i) => `<option value="${i}" ${defaultDay === i ? 'selected' : ''}>${Helpers.DAY_LABELS[i]}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Asignatura</label>
        <select class="form-select" id="sch-subject">
          <option value="">-- Otra (Nombre Personalizado) --</option>
          ${subjects.map(s => `<option value="${s.id}" ${isEdit && existing.subject_id === s.id ? 'selected' : ''}>${Helpers.escapeHtml(s.name)}</option>`).join('')}
        </select>
      </div>

      <div class="form-group" id="sch-custom-name-group" style="${!hasCustomName && subjects.length > 0 && !(isEdit && !existing.subject_id) ? 'display: none;' : ''}">
        <label class="form-label">Nombre del Evento / Clase</label>
        <input class="form-input" id="sch-custom-name" value="${isEdit && existing.custom_name ? Helpers.escapeHtml(existing.custom_name) : ''}" placeholder="Ej. Tutoría, Seminario..." />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Hora inicio</label>
          <div style="display: flex; gap: 5px;">
            <select class="form-select" id="sch-start-h">${generateOptions(7, 23, startH)}</select>
            <span style="align-self: center;">:</span>
            <select class="form-select" id="sch-start-m">${generateOptions(0, 59, startM)}</select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Hora fin</label>
          <div style="display: flex; gap: 5px;">
            <select class="form-select" id="sch-end-h">${generateOptions(7, 23, endH)}</select>
            <span style="align-self: center;">:</span>
            <select class="form-select" id="sch-end-m">${generateOptions(0, 59, endM)}</select>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Aula</label>
        <input class="form-input" id="sch-room" value="${isEdit ? Helpers.escapeHtml(existing.room || '') : ''}" placeholder="Ej. Lab-2" />
      </div>

      ${isEdit ? `
      <div class="form-group" style="margin-top: var(--space-md); text-align: center;">
        <button type="button" class="btn btn-secondary btn-block" id="sch-share-btn" style="background: var(--bg-surface); color: var(--color-primary); border: 1px solid var(--border-subtle);">
          📡 Copiar Link para Compartir Evento
        </button>
      </div>` : ''}
    `;

    Modal.open(
      isEdit ? 'Editar Evento' : 'Añadir Evento',
      formHtml,
      async () => {
        const typeSelect = document.querySelector('input[name="sch-type"]:checked').value;
        const subjectId = document.getElementById('sch-subject').value;
        const customName = document.getElementById('sch-custom-name').value.trim();
        const dateVal = document.getElementById('sch-date').value;
        const dayVal = parseInt(document.getElementById('sch-day').value);

        const startHVal = document.getElementById('sch-start-h').value;
        const startMVal = document.getElementById('sch-start-m').value;
        const endHVal = document.getElementById('sch-end-h').value;
        const endMVal = document.getElementById('sch-end-m').value;

        const startVal = `${startHVal}:${startMVal}`;
        const endVal = `${endHVal}:${endMVal}`;

        if (!subjectId && !customName) {
          Toast.show('Selecciona una asignatura o escribe un nombre', 'error');
          return;
        }

        if (typeSelect === 'single' && !dateVal) {
          Toast.show('Selecciona una fecha', 'error');
          return;
        }

        let exactDayOfWeek = dayVal;
        if (typeSelect === 'single') {
          const parts = dateVal.split('-');
          const d = new Date(parts[0], parts[1] - 1, parts[2]);
          exactDayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
        }

        const data = {
          subject_id: subjectId || null,
          custom_name: !subjectId ? customName : null,
          day_of_week: exactDayOfWeek,
          date: typeSelect === 'single' ? dateVal : null,
          start_time: startVal,
          end_time: endVal,
          room: document.getElementById('sch-room').value.trim()
        };

        if (isEdit) {
          await DataService.updateSchedule(existing.id, data);
          Toast.show('Evento actualizado', 'success');
        } else {
          await DataService.createSchedule(data);
          Toast.show('Evento creado', 'success');
        }

        Modal.close();
        await _refresh();
      },
      {
        submitLabel: isEdit ? 'Guardar' : 'Crear Evento',
        showDelete: isEdit,
        onDelete: isEdit ? async () => {
          await DataService.deleteSchedule(existing.id);
          Toast.show('Evento eliminado', 'info');
          await _refresh();
        } : undefined
      }
    );

    // Attach Share Event Listeners if editing
    if (isEdit) {
      setTimeout(() => { // Wait for modal to render
        const shareBtn = document.getElementById('sch-share-btn');
        if (shareBtn) {
          shareBtn.addEventListener('click', () => {
            const subjectName = existing.subject_id
              ? (subjects.find(s => s.id === existing.subject_id)?.name || '')
              : existing.custom_name;

            const shareData = {
              c: subjectName,
              r: existing.room || '',
              s: existing.start_time,
              e: existing.end_time,
              dw: existing.day_of_week !== null && existing.day_of_week !== undefined ? existing.day_of_week : -1,
              d: existing.date || ''
            };

            // Encode safely as base64
            const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
            const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encoded}#schedule`;

            navigator.clipboard.writeText(shareUrl).then(() => {
              Toast.show('Link copiado al portapapeles', 'success');
            }).catch(() => {
              prompt('Copia este enlace:', shareUrl);
            });
          });
        }
      }, 50);
    }

    // Setup interactive fields
    setTimeout(() => {
      const typeRadios = document.querySelectorAll('input[name="sch-type"]');
      const dateGrp = document.getElementById('sch-date-group');
      const dayGrp = document.getElementById('sch-day-group');
      const subjSelect = document.getElementById('sch-subject');
      const customNameGrp = document.getElementById('sch-custom-name-group');

      typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.value === 'single') {
            dateGrp.style.display = 'flex';
            dayGrp.style.display = 'none';
          } else {
            dateGrp.style.display = 'none';
            dayGrp.style.display = 'flex';
          }
        });
      });

      subjSelect.addEventListener('change', (e) => {
        if (!e.target.value) {
          customNameGrp.style.display = 'flex';
        } else {
          customNameGrp.style.display = 'none';
        }
      });

      // trigger event to set proper initial layout if subjects array is empty
      if (subjects.length === 0) {
        customNameGrp.style.display = 'flex';
      }
    }, 100);
  }

  // --- Exposed method for Shared Links ---
  async function _openModalShared(sharedData) {
    if (!sharedData) return;

    const preDay = sharedData.dw >= 0 ? sharedData.dw : undefined;
    const preTime = sharedData.s;
    const preDateStr = sharedData.d || '';

    // Open modal 
    await _openModal(null, preDay, preTime, preDateStr);

    // Overwrite the inputs with the shared data after brief delay for render
    setTimeout(() => {
      const typeRadios = document.querySelectorAll('input[name="sch-type"]');
      if (sharedData.d) {
        const singleRadio = document.querySelector('input[name="sch-type"][value="single"]');
        if (singleRadio) singleRadio.click();
        document.getElementById('sch-date').value = sharedData.d;
      } else if (sharedData.dw >= 0) {
        const recurrRadio = document.querySelector('input[name="sch-type"][value="recurring"]');
        if (recurrRadio) recurrRadio.click();
        document.getElementById('sch-day').value = sharedData.dw;
      }

      document.getElementById('sch-subject').value = ""; // Force Custom Name
      const customGrp = document.getElementById('sch-custom-name-group');
      if (customGrp) customGrp.style.display = 'block';

      document.getElementById('sch-custom-name').value = sharedData.c;
      document.getElementById('sch-room').value = sharedData.r;

      if (sharedData.s) {
        const [sh, sm] = sharedData.s.split(':');
        document.getElementById('sch-start-h').value = sh;
        document.getElementById('sch-start-m').value = sm;
      }

      if (sharedData.e) {
        const [eh, em] = sharedData.e.split(':');
        document.getElementById('sch-end-h').value = eh;
        document.getElementById('sch-end-m').value = em;
      }
    }, 200);
  }

  return { render, _openModalShared };
})();
