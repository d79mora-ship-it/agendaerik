/**
 * Utility helpers — Date formatting, averages, ID generation, error handling
 */

// eslint-disable-next-line no-var
var Helpers = (function () {
    'use strict';

    /**
     * Generate a random unique ID
     * @returns {string}
     */
    function generateId() {
        return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    }

    /**
     * Format a date string to a localized short format
     * @param {string} dateStr - ISO date string or YYYY-MM-DD
     * @returns {string}
     */
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    /**
     * Format date to show day and month
     * @param {string} dateStr
     * @returns {{ day: string, month: string }}
     */
    function formatDateParts(dateStr) {
        if (!dateStr) return { day: '—', month: '' };
        const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
        return {
            day: d.getDate().toString(),
            month: d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()
        };
    }

    /**
     * Calculate days remaining until a date
     * @param {string} dateStr
     * @returns {number}
     */
    function daysUntil(dateStr) {
        if (!dateStr) return Infinity;
        const target = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    }

    /**
     * Format time string HH:MM
     * @param {string} timeStr
     * @returns {string}
     */
    function formatTime(timeStr) {
        if (!timeStr) return '';
        return timeStr.substring(0, 5);
    }

    /**
     * Calculate weighted average of grades
     * @param {Array<{score: number, weight: number}>} grades
     * @returns {number}
     */
    function calculateWeightedAverage(grades) {
        if (!grades || grades.length === 0) return 0;
        const totalWeight = grades.reduce((sum, g) => sum + (g.weight || 1), 0);
        if (totalWeight === 0) return 0;
        const weightedSum = grades.reduce((sum, g) => sum + g.score * (g.weight || 1), 0);
        return Math.round((weightedSum / totalWeight) * 100) / 100;
    }

    /**
     * Get the color for a grade value (0-10 scale)
     * @param {number} score
     * @returns {string}
     */
    function getGradeColor(score) {
        if (score >= 9) return '#22c55e';
        if (score >= 7) return '#06b6d4';
        if (score >= 5) return '#f59e0b';
        return '#ef4444';
    }

    /**
     * Map status to human-readable label
     * @param {string} status
     * @returns {string}
     */
    function getStatusLabel(status) {
        const labels = {
            pending: 'Pendiente',
            in_progress: 'En Proceso',
            done: 'Hecho'
        };
        return labels[status] || status;
    }

    /**
     * Map priority to label
     * @param {string} priority
     * @returns {string}
     */
    function getPriorityLabel(priority) {
        const labels = {
            low: 'Baja',
            medium: 'Media',
            high: 'Alta'
        };
        return labels[priority] || priority;
    }

    /**
     * Days of week labels
     * @type {string[]}
     */
    const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    /**
     * Short day labels
     * @type {string[]}
     */
    const DAY_SHORT = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE'];

    /**
     * Time slots for the schedule (Full Day)
     * Updated Time Slots from 7:00 AM to 11:00 PM
     * @type {string[]}
     */
    const TIME_SLOTS = [
        '07:00', '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00',
        '17:00', '18:00', '19:00', '20:00', '21:00',
        '22:00', '23:00'
    ];

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} str
     * @returns {string}
     */
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Get initials from a name
     * @param {string} name
     * @returns {string}
     */
    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    /**
     * Get today's date as YYYY-MM-DD
     * @returns {string}
     */
    function todayStr() {
        return new Date().toISOString().split('T')[0];
    }

    return {
        generateId,
        formatDate,
        formatDateParts,
        daysUntil,
        formatTime,
        calculateWeightedAverage,
        getGradeColor,
        getStatusLabel,
        getPriorityLabel,
        DAY_LABELS,
        DAY_SHORT,
        TIME_SLOTS,
        escapeHtml,
        getInitials,
        todayStr
    };
})();
