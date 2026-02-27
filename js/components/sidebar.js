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
        // XP System initialization will be handled asynchronously below

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

        // Get initial XP (can be 0 if not loaded, will update below)
        const initialXpLevelHTML = `
            <div id="sidebar-xp-container" style="text-align: center; margin-bottom: 10px; opacity: 0; transition: opacity 0.3s;">
                <div style="font-size: var(--font-xs); color: var(--color-primary); font-weight: bold; background: var(--color-primary-light); display: inline-block; padding: 2px 8px; border-radius: 12px; margin-top: -10px;">
                    Nivel <span id="sidebar-level-num">1</span>
                </div>
            </div>
        `;

        container.innerHTML = `
      <div class="sidebar-logo">AE</div>
      ${initialXpLevelHTML}
      ${levelSelector}
      <nav class="sidebar-nav">
        ${navLinks}
      </nav>
      <button class="sidebar-link sidebar-theme-toggle" id="sidebar-theme-toggle" aria-label="Cambiar Tema">
        <span class="nav-icon" id="theme-icon">☀️</span>
        <span class="nav-label">Tema</span>
        <span class="tooltip">Cambiar Tema</span>
      </button>
      <button class="sidebar-link sidebar-logout" id="sidebar-logout" aria-label="Cerrar Sesión">
        <span class="nav-icon">🚪</span>
        <span class="nav-label">Salir</span>
        <span class="tooltip">Cerrar Sesión</span>
      </button>
    `;

        // Initialize theme from localStorage
        const themeToggleBtn = container.querySelector('#sidebar-theme-toggle');
        const themeIcon = container.querySelector('#theme-icon');
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeIcon) {
            themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
        }

        // Bind Theme Toggle event
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                const newTheme = isDark ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                if (themeIcon) themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
            });
        }

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

        // Setup XP Tracker
        _updateXPDisplay();
        window.addEventListener('xp-updated', _updateXPDisplay);
    }

    async function _updateXPDisplay() {
        const xpContainer = document.getElementById('sidebar-xp-container');
        const levelNumEl = document.getElementById('sidebar-level-num');
        if (!xpContainer || !levelNumEl) return;

        const xp = await DataService.getXP();
        const level = Math.floor(xp / 100) + 1; // 1 level every 100 XP

        levelNumEl.textContent = level;
        xpContainer.title = `${xp} XP Totales`;
        xpContainer.style.opacity = '1';
    }

    function setActive(container, activePage) {
        container.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === activePage);
        });
    }

    return { render, setActive };
})();
