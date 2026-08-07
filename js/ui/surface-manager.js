/* Central lifecycle for modal and sheet-like UI surfaces. */

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isVisible(element, root) {
  for (let current = element; current && current !== root; current = current.parentElement) {
    if (current.hidden || current.getAttribute('aria-hidden') === 'true') return false;
    const style = window.getComputedStyle?.(current);
    if (style && (style.display === 'none' || style.visibility === 'hidden')) return false;
  }
  return true;
}

function collectFocusable(dialog) {
  if (!dialog) return [];
  return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)]
    .filter((element) => isVisible(element, dialog));
}

function inertOutside(root, exempt = []) {
  const exemptSet = new Set(exempt.filter(Boolean));
  const snapshots = [];
  let current = root;
  while (current?.parentElement) {
    const parent = current.parentElement;
    [...parent.children].forEach((sibling) => {
      if (sibling === current || exemptSet.has(sibling) || sibling.contains(current)) return;
      if (!sibling.hasAttribute('inert')) {
        sibling.inert = true;
        sibling.setAttribute('inert', '');
        snapshots.push(sibling);
      }
    });
    current = parent;
    if (parent === document.body) break;
  }
  return snapshots;
}

export function createSurfaceManager() {
  const stack = [];
  const managedBackdrops = new Set();
  let scrollSnapshot = null;

  const top = () => stack[stack.length - 1] || null;

  function syncBackdropOwnership() {
    stack.forEach((entry) => { if (entry.backdrop) managedBackdrops.add(entry.backdrop); });
    managedBackdrops.forEach((backdrop) => {
      const owner = [...stack].reverse().find((entry) => entry.backdrop === backdrop);
      if (owner) {
        backdrop.dataset.surfaceOwner = owner.id;
        backdrop.setAttribute('aria-hidden', 'false');
      } else {
        delete backdrop.dataset.surfaceOwner;
        backdrop.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function lockScroll() {
    if (scrollSnapshot) return;
    scrollSnapshot = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth) document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.classList.add('surface-open');
  }

  function unlockScroll() {
    if (!scrollSnapshot || stack.some((entry) => entry.modal)) return;
    document.body.style.overflow = scrollSnapshot.overflow;
    document.body.style.paddingRight = scrollSnapshot.paddingRight;
    document.body.classList.remove('surface-open');
    scrollSnapshot = null;
  }

  function open(config) {
    if (!config?.id || !config.root) throw new Error('Surface id and root are required');
    const existing = stack.find((entry) => entry.id === config.id);
    if (existing) {
      config.initialFocus?.focus?.();
      return existing;
    }

    const entry = {
      modal: config.modal !== false,
      dismissable: config.dismissable !== false,
      dialog: config.dialog || config.root,
      trigger: config.trigger || document.activeElement,
      initialFocus: config.initialFocus || null,
      requestClose: config.requestClose || null,
      backdrop: config.backdrop || null,
      history: config.history || null,
      ...config,
      inertSnapshots: [],
    };
    entry.root.dataset.surfaceId = entry.id;
    entry.root.style.setProperty('--surface-depth', String(stack.length));
    if (entry.modal) {
      lockScroll();
      entry.inertSnapshots = inertOutside(entry.root, [entry.backdrop]);
    }
    stack.push(entry);
    if (entry.history?.push) {
      history.pushState({ ...history.state, [entry.history.key]: entry.history.token }, '');
    }
    syncBackdropOwnership();
    if (config.autoFocus !== false) {
      const focusTarget = typeof entry.initialFocus === 'function'
        ? entry.initialFocus()
        : entry.initialFocus;
      (focusTarget || collectFocusable(entry.dialog)[0] || entry.dialog)?.focus?.();
    }
    return entry;
  }

  function close(id, options = {}) {
    const index = stack.findIndex((entry) => entry.id === id);
    if (index === -1) return false;
    const entry = stack[index];
    stack.splice(index, 1);
    entry.inertSnapshots.forEach((element) => {
      element.inert = false;
      element.removeAttribute('inert');
    });
    entry.root.style.removeProperty('--surface-depth');
    delete entry.root.dataset.surfaceId;
    syncBackdropOwnership();
    unlockScroll();
    if (!options.preserveHistory && !options.fromHistory && entry.history) {
      if (history.state?.[entry.history.key] === entry.history.token) history.back();
    }
    if (options.restoreFocus !== false && entry.trigger?.isConnected) entry.trigger.focus?.();
    return true;
  }

  function requestTopClose(reason) {
    const entry = top();
    if (!entry || !entry.dismissable) return false;
    entry.requestClose?.(reason);
    return true;
  }

  function handleKeydown(event) {
    const entry = top();
    if (!entry) return;
    if (event.key === 'Escape' && entry.dismissable) {
      event.preventDefault();
      event.stopPropagation();
      requestTopClose('escape');
      return;
    }
    if (event.key !== 'Tab' || !entry.modal) return;
    const focusable = collectFocusable(entry.dialog);
    if (!focusable.length) {
      event.preventDefault();
      entry.dialog?.focus?.();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const outside = !entry.dialog.contains(document.activeElement);
    if (event.shiftKey && (outside || document.activeElement === first)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (outside || document.activeElement === last)) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', handleKeydown, true);

  return {
    open,
    close,
    top,
    isTop: (id) => top()?.id === id,
    ownsBackdrop: (id, backdrop) => top()?.id === id && top()?.backdrop === backdrop,
    requestTopClose,
    size: () => stack.length,
    destroy: () => document.removeEventListener('keydown', handleKeydown, true),
  };
}

export const surfaceManager = createSurfaceManager();
