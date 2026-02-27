/**
 * Toast — Lightweight notification system
 */

// eslint-disable-next-line no-var
var Toast = (function () {
    'use strict';

    const DURATION_MS = 3500;

    /**
     * Show a toast notification
     * @param {string} message
     * @param {'success'|'error'|'info'} type
     */
    function show(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const icons = { success: '✓', error: '✕', info: 'ℹ' };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${Helpers.escapeHtml(message)}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            toast.style.transition = 'all 300ms ease';
            setTimeout(() => toast.remove(), 300);
        }, DURATION_MS);
    }

    return { show };
})();
