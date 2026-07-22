/* ========================================
   MODAL - Themed dialog (reusable)
   Native confirm()/alert() yerine erişilebilir,
   temalı modal. Export sheet, onay ve kısayol
   kartı gibi yerlerde kullanılır.
   ======================================== */

import { syncUiIcons } from './ui-icons.js';

/**
 * Generic themed modal.
 * @param {Object} opts
 * @param {string} [opts.title]
 * @param {Node} [opts.bodyNode]  content node
 * @param {Array} [opts.buttons]  [{label, icon, className, value, keepOpen, onClick}]
 * @param {Function} [opts.onClose]  (reason) => void
 * @param {boolean} [opts.dismissable=true]  backdrop/Esc closes
 * @returns {{ close: Function, overlay: HTMLElement, card: HTMLElement }}
 */
export function openModal({ title = '', bodyNode = null, buttons = [], onClose = null, dismissable = true } = {}) {
  const previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'app-modal-overlay';

  const card = document.createElement('div');
  card.className = 'app-modal';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  if (title) card.setAttribute('aria-label', title);

  if (title) {
    const h = document.createElement('h3');
    h.className = 'app-modal-title';
    h.textContent = title;
    card.appendChild(h);
  }

  if (bodyNode) {
    const body = document.createElement('div');
    body.className = 'app-modal-body';
    body.appendChild(bodyNode);
    card.appendChild(body);
  }

  let closed = false;
  const close = (reason) => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey, true);
    overlay.classList.add('is-closing');
    setTimeout(() => overlay.remove(), 160);
    if (previousFocus && typeof previousFocus.focus === 'function') {
      try { previousFocus.focus(); } catch { /* noop */ }
    }
    if (onClose) onClose(reason);
  };

  if (buttons.length) {
    const foot = document.createElement('div');
    foot.className = 'app-modal-actions';
    buttons.forEach((btn) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = btn.className || 'secondary';
      if (btn.icon) {
        const s = document.createElement('span');
        s.className = 'ui-icon';
        s.dataset.uiIcon = btn.icon;
        el.appendChild(s);
      }
      el.appendChild(document.createTextNode(btn.label));
      el.addEventListener('click', async () => {
        let keepOpen = btn.keepOpen === true;
        if (btn.onClick) {
          const r = await btn.onClick();
          if (r === true) keepOpen = true;
        }
        if (!keepOpen) close(btn.value ?? 'action');
      });
      foot.appendChild(el);
    });
    card.appendChild(foot);
  }

  overlay.appendChild(card);

  if (dismissable) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close('backdrop');
    });
  }

  const onKey = (e) => {
    if (e.key === 'Escape' && dismissable) {
      e.stopPropagation();
      close('escape');
    }
  };
  document.addEventListener('keydown', onKey, true);

  document.body.appendChild(overlay);
  syncUiIcons(overlay);

  // Focus first primary action (or the card) for accessibility.
  const firstBtn = card.querySelector('.app-modal-actions button:not(.secondary)')
    || card.querySelector('.app-modal-actions button');
  if (firstBtn) firstBtn.focus();

  return { close, overlay, card };
}

/**
 * Themed confirm() replacement — resolves true/false.
 * @param {Object} opts
 * @param {string} opts.message
 * @param {string} [opts.title]
 * @param {string} [opts.confirmLabel]
 * @param {string} [opts.cancelLabel]
 * @param {boolean} [opts.danger]
 * @returns {Promise<boolean>}
 */
export function confirmModal({ message, title = 'Emin misiniz?', confirmLabel = 'Onayla', cancelLabel = 'Vazgeç', danger = false } = {}) {
  return new Promise((resolve) => {
    let decided = false;
    const p = document.createElement('p');
    p.className = 'app-modal-message';
    p.textContent = message;
    const { close } = openModal({
      title,
      bodyNode: p,
      buttons: [
        { label: cancelLabel, className: 'secondary', value: false },
        { label: confirmLabel, className: danger ? 'danger' : '', value: true },
      ],
      onClose: (reason) => {
        if (decided) return;
        decided = true;
        resolve(reason === true);
      },
    });
    // openModal resolves via onClose(value); ensure boolean
    void close;
  });
}
