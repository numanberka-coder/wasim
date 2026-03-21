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
 */
export function showToast(message, duration = 2500) {
  const container = ensureContainer();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.pointerEvents = 'auto';

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);

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
