// The recording layout is independent of project data and preview scale.
let active = false;
let nativeFullscreenSeen = false;
let beforeEnter = () => {};
let onExit = () => {};
let removeListeners = () => {};
let returnFocus = null;
let entrySequence = 0;
let pendingRequestSequence = null;

function isMobileView() {
  return window.innerWidth <= 980;
}

function isPhoneFullscreen() {
  const element = document.fullscreenElement;
  const phone = document.querySelector('.phone');
  return Boolean(element && phone && (
    element === document.documentElement || element === document.body ||
    element === phone || element.contains(phone)
  ));
}

function setActive(value) {
  const container = document.querySelector('.app-container');
  if (!container) return false;
  active = value;
  container.classList.toggle('phone-only-mode', value);
  document.body.classList.toggle('recording-view', value);
  document.dispatchEvent(new CustomEvent('recording:change', {
    detail: { active: value },
  }));
  return true;
}

function activateLayout() {
  if (active) return true;
  if (!document.querySelector('.app-container .phone')) return false;
  returnFocus = document.activeElement;
  beforeEnter();
  // Do not leave keyboard focus in hidden application chrome during capture.
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  return setActive(true);
}

export function isRecordingViewActive() {
  return active;
}

export async function enterRecordingView({ requestFullscreen = true } = {}) {
  if (active) return true;
  if (!activateLayout()) return false;
  const sequence = ++entrySequence;
  nativeFullscreenSeen = isPhoneFullscreen();
  if (requestFullscreen && !document.fullscreenElement &&
      typeof document.documentElement.requestFullscreen === 'function') {
    pendingRequestSequence = sequence;
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      // Exiting while a browser request is pending must not re-enter the layout.
      if (!active || sequence !== entrySequence) {
        if (isPhoneFullscreen() && typeof document.exitFullscreen === 'function') {
          await document.exitFullscreen();
        }
      } else {
        nativeFullscreenSeen = isPhoneFullscreen();
      }
    } catch {
      // iOS and denied requests still support the clean, CSS-only phone layout.
    } finally {
      if (pendingRequestSequence === sequence) pendingRequestSequence = null;
    }
  }
  return active;
}

export async function exitRecordingView({ exitFullscreen = true } = {}) {
  if (!active) return false;
  ++entrySequence;
  const shouldExitNative = exitFullscreen && isPhoneFullscreen();
  nativeFullscreenSeen = false;
  setActive(false);
  onExit();
  if (returnFocus?.isConnected && typeof returnFocus.focus === 'function') {
    returnFocus.focus({ preventScroll: true });
  }
  returnFocus = null;
  if (shouldExitNative && typeof document.exitFullscreen === 'function') {
    try { await document.exitFullscreen(); } catch { /* Layout already restored. */ }
  }
  return true;
}

export function toggleRecordingView(options) {
  return active ? exitRecordingView() : enterRecordingView(options);
}

export function initRecordingView(options = {}) {
  removeListeners();
  beforeEnter = options.beforeEnter || (() => {});
  onExit = options.onExit || (() => {});
  let lastTap = null;

  const handleFullscreen = () => {
    const phoneFullscreen = isPhoneFullscreen();
    if (phoneFullscreen && pendingRequestSequence != null &&
        pendingRequestSequence !== entrySequence) return;
    if (phoneFullscreen && (active || isMobileView())) {
      activateLayout();
      nativeFullscreenSeen = true;
    } else if (active && nativeFullscreenSeen && !phoneFullscreen) {
      void exitRecordingView({ exitFullscreen: false });
    }
  };
  const handleKey = (event) => {
    if (!active || event.key !== 'Escape') return;
    event.preventDefault();
    void exitRecordingView();
  };
  const handleStatusTap = (event) => {
    if (!active || !(event.target instanceof Element) ||
        !event.target.closest('.phone .status-bar')) return;
    if (event.button != null && event.button !== 0) return;
    const now = Date.now();
    if (lastTap != null && now - lastTap <= 500) {
      lastTap = null;
      void exitRecordingView();
    } else {
      lastTap = now;
    }
  };
  const handleDoubleClick = (event) => {
    if (active && event.target instanceof Element &&
        event.target.closest('.phone .status-bar')) void exitRecordingView();
  };
  const resetTap = () => { lastTap = null; };
  document.addEventListener('fullscreenchange', handleFullscreen);
  document.addEventListener('keydown', handleKey);
  document.addEventListener('pointerup', handleStatusTap);
  document.addEventListener('dblclick', handleDoubleClick);
  document.addEventListener('recording:change', resetTap);
  removeListeners = () => {
    document.removeEventListener('fullscreenchange', handleFullscreen);
    document.removeEventListener('keydown', handleKey);
    document.removeEventListener('pointerup', handleStatusTap);
    document.removeEventListener('dblclick', handleDoubleClick);
    document.removeEventListener('recording:change', resetTap);
  };
  handleFullscreen();
  return {
    enter: enterRecordingView,
    exit: exitRecordingView,
    toggle: toggleRecordingView,
    isActive: isRecordingViewActive,
    dispose: () => {
      removeListeners();
      return exitRecordingView();
    },
  };
}
