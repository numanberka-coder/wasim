/* Central lifecycle for modal and sheet-like UI surfaces. */

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isVisible(element) {
  for (let current = element; current; current = current.parentElement) {
    if (current.hidden || current.inert || current.hasAttribute('inert') || current.getAttribute('aria-hidden') === 'true') return false;
    if (current.tagName === 'DETAILS' && !current.open) {
      const summary = [...current.children].find(child => child.tagName === 'SUMMARY');
      if (!summary?.contains(element)) return false;
    }
    const style = window.getComputedStyle?.(current);
    if (style && (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse')) return false;
  }
  return true;
}

function collectFocusable(dialog) {
  if (!dialog) return [];
  return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)]
    .filter((element) => !element.matches(':disabled, input[type="hidden"]') &&
      (!element.hasAttribute('tabindex') || Number(element.getAttribute('tabindex')) >= 0) && isVisible(element));
}

function inertOutside(root, exempt = []) {
  const exemptSet = new Set(exempt.filter(Boolean));
  const snapshots = [];
  let current = root;
  while (current?.parentElement) {
    const parent = current.parentElement;
    [...parent.children].forEach((sibling) => {
      if (sibling === current || [...exemptSet].some(element => sibling === element || sibling.contains(element))) return;
      if (!sibling.inert && !sibling.hasAttribute('inert')) {
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
  let ownedInert = [];
  let scrollSnapshot = null;

  const top = () => stack[stack.length - 1] || null;

  function syncInertOwnership() {
    // Recompute from the active modal instead of accumulating per-surface
    // snapshots: a pre-mounted child/sibling dialog may have been inerted by
    // the previous surface. Only release attributes this manager applied.
    ownedInert.forEach(element => {
      element.inert = false;
      element.removeAttribute('inert');
    });
    ownedInert = [];
    const modalIndex = stack.findLastIndex(entry => entry.modal);
    if (modalIndex < 0) return;
    const modal = stack[modalIndex];
    const exemptions = [modal.backdrop, ...stack.slice(modalIndex + 1).flatMap(entry => [entry.root, entry.backdrop])];
    ownedInert = inertOutside(modal.root, exemptions);
  }

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
    };
    entry.root.dataset.surfaceId = entry.id;
    entry.root.style.setProperty('--surface-depth', String(stack.length));
    if (entry.modal) {
      lockScroll();
    }
    stack.push(entry);
    syncInertOwnership();
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
    const wasTop = entry === top();
    stack.splice(index, 1);
    syncInertOwnership();
    entry.root.style.removeProperty('--surface-depth');
    delete entry.root.dataset.surfaceId;
    stack.forEach((surface, depth) => surface.root.style.setProperty('--surface-depth', String(depth)));
    syncBackdropOwnership();
    unlockScroll();
    if (!options.preserveHistory && !options.fromHistory && entry.history) {
      if (history.state?.[entry.history.key] === entry.history.token) history.back();
    }
    if (wasTop && options.restoreFocus !== false) {
      const remaining = top();
      const triggerAllowed = entry.trigger?.isConnected && isVisible(entry.trigger) &&
        (!remaining?.modal || remaining.dialog.contains(entry.trigger));
      if (triggerAllowed) entry.trigger.focus?.();
      else if (remaining) (collectFocusable(remaining.dialog)[0] || remaining.dialog)?.focus?.();
    }
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
    const outside = !focusable.includes(document.activeElement);
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
    destroy: () => {
      [...stack].reverse().forEach(entry => close(entry.id, { restoreFocus: false, preserveHistory: true }));
      document.removeEventListener('keydown', handleKeydown, true);
    },
  };
}

export const surfaceManager = createSurfaceManager();
