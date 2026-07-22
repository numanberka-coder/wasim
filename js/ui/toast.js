/* ========================================
   TOAST - Notification System
   ======================================== */

let toastContainer = null;
let toastQueue = [];
let isShowing = false;

/**
 * Initialize toast container
 */
function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.setAttribute('role', 'status');
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show toast notification
 * @param {string} message
 * @param {number|Object} [durationOrOpts]  süre (ms) veya opsiyon nesnesi
 * @param {Object} [maybeOpts]  { actionLabel, onAction }
 * @returns {HTMLElement}
 */
export function showToast(message, durationOrOpts = 2500, maybeOpts = null) {
  const container = ensureContainer();

  let duration = 2500;
  let opts = maybeOpts || {};
  if (typeof durationOrOpts === 'number') {
    duration = durationOrOpts;
  } else if (durationOrOpts && typeof durationOrOpts === 'object') {
    opts = durationOrOpts;
    if (typeof opts.duration === 'number') duration = opts.duration;
  }
  // Aksiyonlu toast'lar biraz daha uzun kalsın (kullanıcı tıklayabilsin)
  if (opts.actionLabel && duration < 5000 && !opts.duration) duration = 6000;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.pointerEvents = 'auto';

  const msg = document.createElement('span');
  msg.className = 'toast-msg';
  msg.textContent = message;
  toast.appendChild(msg);

  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  };

  if (opts.actionLabel) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-action';
    btn.textContent = opts.actionLabel;
    btn.addEventListener('click', () => {
      try { if (opts.onAction) opts.onAction(); }
      finally { remove(); }
    });
    toast.appendChild(btn);
  }

  container.appendChild(toast);

  setTimeout(remove, duration);

  return toast;
}

/**
 * Show success toast
 */
export function showSuccess(message) {
  return showToast(`✓ ${message}`);
}

/**
 * Show error toast
 */
export function showError(message) {
  const toast = showToast(`❌ ${message}`, 4000);
  toast.style.borderColor = 'var(--wa-danger)';
  return toast;
}

/**
 * Show warning toast
 */
export function showWarning(message) {
  const toast = showToast(`⚠️ ${message}`, 3500);
  toast.style.borderColor = '#fbbf24';
  return toast;
}

/**
 * Add slide out animation
 */
const style = document.createElement('style');
style.textContent = `
  @keyframes toastSlideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(20px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
