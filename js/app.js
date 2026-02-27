/**
 * App — Main entry point & SPA router
 * Hash-based routing between pages
 */

// eslint-disable-next-line no-var
var App = (function () {
    'use strict';

    const PAGES = {
        dashboard: DashboardPage,
        tasks: TasksPage,
        subjects: SubjectsPage,
        exams: ExamsPage,
        schedule: SchedulePage,
        grades: GradesPage,
        notes: NotesPage,
        pomodoro: PomodoroPage
    };

    let _currentPage = 'dashboard';

    /** Bootstrap the application */
    async function init() {
        // Initialize data store with demo data on first run
        DataService.initialize();

        // Await real Supabase session check
        const { user } = await AuthService.getSession();

        // Listen to auth changes setup
        await AuthService._initSession();

        const appEl = document.getElementById('app');
        const authEl = document.getElementById('auth-view');

        if (!user) {
            // Unauthenticated state
            if (appEl) appEl.classList.add('hidden');
            if (authEl) {
                authEl.classList.remove('hidden');
                AuthPage.render(authEl);
            }
            return;
        }

        // Authenticated state
        if (authEl) authEl.classList.add('hidden');
        if (appEl) appEl.classList.remove('hidden');

        const sidebarEl = document.getElementById('sidebar');
        const mainEl = document.getElementById('main-content');
        const rightEl = document.getElementById('right-panel');

        // Determine initial page from hash
        const hash = window.location.hash.replace('#', '');
        _currentPage = PAGES[hash] ? hash : 'dashboard';

        // Render sidebar
        Sidebar.render(sidebarEl, _currentPage, navigateTo);

        // Render page
        _renderPage(mainEl, rightEl);

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (PAGES[hash] && hash !== _currentPage) {
                _currentPage = hash;
                Sidebar.setActive(sidebarEl, _currentPage);
                _renderPage(mainEl, rightEl);
            }
        });

        // Keyboard shortcut: Escape closes modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') Modal.close();
        });
    }

    /**
     * Navigate to a page
     * @param {string} page
     */
    function navigateTo(page) {
        if (!PAGES[page]) return;
        _currentPage = page;
        window.location.hash = page;

        const sidebarEl = document.getElementById('sidebar');
        const mainEl = document.getElementById('main-content');
        const rightEl = document.getElementById('right-panel');

        Sidebar.setActive(sidebarEl, page);
        _renderPage(mainEl, rightEl);
    }

    /**
     * Render the current page
     * @param {HTMLElement} mainEl
     * @param {HTMLElement} rightEl
     */
    let _previousPageKey = null;

    function _renderPage(mainEl, rightEl) {
        // Destroy previous page if it has a destroy method
        if (_previousPageKey && PAGES[_previousPageKey] && typeof PAGES[_previousPageKey].destroy === 'function') {
            PAGES[_previousPageKey].destroy();
        }

        const page = PAGES[_currentPage];
        if (page) {
            _previousPageKey = _currentPage;
            // Scroll to top
            mainEl.scrollTop = 0;
            page.render(mainEl, rightEl);
        }
    }

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { navigateTo };
})();
