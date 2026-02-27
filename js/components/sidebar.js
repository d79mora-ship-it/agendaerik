/**
 * Sidebar — Navigation component with icon links + logout
 */

// eslint-disable-next-line no-var
var Sidebar = (function () {
    'use strict';

    const NAV_ITEMS = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'tasks', icon: '✅', label: 'Tareas' },
        { id: 'subjects', icon: '📚', label: 'Asignaturas' },
        { id: 'exams', icon: '📝', label: 'Exámenes' },
        { id: 'schedule', icon: '🗓️', label: 'Horario' },
        { id: 'grades', icon: '🎓', label: 'Calificaciones' },
        { id: 'notes', icon: '📓', label: 'Apuntes' },
        { id: 'pomodoro', icon: '⏱️', label: 'Pomodoro' }
    ];

    function render(container, activePage, onNavigate) {
        const logo = `<div class="sidebar-logo">AE</div>`;

        const levels = [
            '1º ESO', '2º ESO', '3º ESO', '4º ESO',
            '1º Bachillerato', '2º Bachillerato',
            'Universidad', 'Otros'
        ];
        const activeLevel = DataService.getActiveLevel();

        const levelSelector = `
            <div class="level-selector-wrapper">
                <select id="sidebar-level-selector" class="level-selector" title="Nivel Académico">
                    ${levels.map(lvl => `<option value="${lvl}" ${lvl === activeLevel ? 'selected' : ''}>${lvl}</option>`).join('')}
                </select>
            </div>
        `;

        const navLinks = NAV_ITEMS.map(item => {
            const isActive = item.id === activePage ? ' active' : '';
            return `
        <button class="sidebar-link${isActive}" data-page="${item.id}" aria-label="${item.label}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
          <span class="tooltip">${item.label}</span>
        </button>
      `;
        }).join('');

        container.innerHTML = `
      ${logo}
      ${levelSelector}
      <nav class="sidebar-nav">
        ${navLinks}
      </nav>
      <button class="sidebar-link sidebar-logout" id="sidebar-logout" aria-label="Cerrar Sesión">
        <span class="nav-icon">🚪</span>
        <span class="nav-label">Salir</span>
        <span class="tooltip">Cerrar Sesión</span>
      </button>
    `;

        // Bind nav click events
        container.querySelectorAll('.sidebar-link:not(.sidebar-logout)').forEach(link => {
            link.addEventListener('click', () => {
                const page = link.dataset.page;
                if (page && onNavigate) {
                    onNavigate(page);
                }
            });
        });

        // Bind level selector change event
        const selectorEl = document.getElementById('sidebar-level-selector');
        if (selectorEl) {
            selectorEl.addEventListener('change', (e) => {
                DataService.setActiveLevel(e.target.value);
            });
        }

        // Bind logout
        document.getElementById('sidebar-logout').addEventListener('click', async () => {
            const { error } = await AuthService.signOut();
            if (error) {
                Toast.show('Error al cerrar sesión', 'error');
            }
            // signOut triggers page reload via auth state change listener
        });
    }

    function setActive(container, activePage) {
        container.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === activePage);
        });
    }

    return { render, setActive };
})();
