/**
 * Modal — Reusable modal dialog component
 */

// eslint-disable-next-line no-var
var Modal = (function () {
    'use strict';

    const overlay = () => document.getElementById('modal-overlay');
    const container = () => document.getElementById('modal-container');

    /**
     * Open modal with given HTML content
     * @param {string} title
     * @param {string} bodyHtml
     * @param {function} [onSubmit] - Callback invoked when "save" is clicked
     * @param {Object} [options] - { submitLabel: string, showDelete: boolean, onDelete: function }
     */
    function open(title, bodyHtml, onSubmit, options = {}) {
        const { submitLabel = 'Guardar', showDelete = false, onDelete } = options;

        const deleteBtn = showDelete
            ? `<button class="btn btn-danger" id="modal-delete-btn">🗑️ Eliminar</button>`
            : '';

        container().innerHTML = `
      <div class="modal-header">
        <h2>${Helpers.escapeHtml(title)}</h2>
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">
        ${bodyHtml}
      </div>
      <div class="modal-actions">
        ${deleteBtn}
        <div style="flex:1"></div>
        <button class="btn btn-ghost" id="modal-cancel-btn">Cancelar</button>
        <button class="btn btn-primary" id="modal-submit-btn">${Helpers.escapeHtml(submitLabel)}</button>
      </div>
    `;

        overlay().classList.remove('hidden');

        // Bind close
        document.getElementById('modal-close-btn').addEventListener('click', close);
        document.getElementById('modal-cancel-btn').addEventListener('click', close);

        // Close on overlay click
        overlay().addEventListener('click', (e) => {
            if (e.target === overlay()) close();
        });

        // Submit
        if (onSubmit) {
            document.getElementById('modal-submit-btn').addEventListener('click', () => {
                onSubmit();
            });
        }

        // Delete
        if (showDelete && onDelete) {
            document.getElementById('modal-delete-btn').addEventListener('click', () => {
                onDelete();
                close();
            });
        }

        // Focus first input
        const firstInput = container().querySelector('input, select, textarea');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }

    /** Close the modal */
    function close() {
        overlay().classList.add('hidden');
        container().innerHTML = '';
    }

    return { open, close };
})();
