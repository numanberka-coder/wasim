/* ========================================
   MOBILE - Mobile UI Controller
   Faz 8: Mobil Altyapı & Responsive
   ======================================== */

import { $, debounce, throttle } from '../utils.js';
import { showSuccess, showError } from '../ui/toast.js';
import { state } from '../state.js';
import { storage } from '../storage.js';
import { DEFAULT_SCRIPT } from '../config.js';
import { loadScript, play, pause, reset } from '../features/player.js';
import { renderPeopleList } from '../features/people.js';
import { syncHeader } from '../phone/header.js';
import { rebuildChat } from '../phone/messages.js';
import { applyWallpaper } from '../phone/wallpaper.js';
import { applyAllTypography } from '../phone/typography.js';
import {
  MENU_MODE_EVENT,
  MENU_MODES,
  findMenuItemByAction,
  getMobileMenuGroups,
  getPanelMenuItems,
  normalizeMenuMode,
} from './menu-model.js';

/**
 * Registry for app-level callbacks that mobile module can invoke.
 * app.js registers these after all modules are initialized.
 */
const appCallbacks = {};
export function registerMobileCallback(name, fn) {
  appCallbacks[name] = fn;
}

const MOBILE_BREAKPOINT = 768;

function isMobileView() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

/** Mobile UI state */
const mobileState = {
  menuOpen: false,
  overlayOpen: false,
  currentPanel: null,
  // Panel move referansları
  _movedPanel: null,
  _panelParent: null,
  _panelNextSibling: null,
  _panelOriginalDisplay: null,
  _panelOriginalAriaHidden: null,
};

/** Panel key → real panel ID eşleştirmesi */
const PANEL_MAP = Object.fromEntries(
  getPanelMenuItems(MENU_MODES.PRO).map((item) => [item.panelKey, item.target])
);

/** Panel key → overlay başlık */
const PANEL_TITLES = Object.fromEntries(
  getPanelMenuItems(MENU_MODES.PRO).map((item) => [item.panelKey, item.shortLabel || item.label])
);

const MOBILE_MENU_ICONS = Object.freeze({
  people: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 11a4 4 0 1 0-3.2-6.4A4.8 4.8 0 0 1 14 8a4.8 4.8 0 0 1-1.2 3.2c.9.3 1.7.8 2.4 1.5.3-.9.4-1.4.8-1.7Z"/><path d="M8.5 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M8.5 13.5c-3.8 0-6.5 2-6.5 4.6V20h13v-1.9c0-2.6-2.7-4.6-6.5-4.6Z"/><path d="M16.5 13.5c-.5 0-1 .1-1.5.2 1.1 1 1.7 2.4 1.7 4.1V20H22v-1.8c0-2.7-2.2-4.7-5.5-4.7Z"/></svg>',
  scenario: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3 4h8M8 12h8M8 16h5"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7-11-7Z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z"/></svg>',
  reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7v6h6M5.2 17A8 8 0 1 0 6 6.7L4 9"/></svg>',
  camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3l2-2h6l2 2h3v12H4V7Zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>',
  save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h12l2 2v14H5V4Zm4 0v6h6V4M8 16h8"/></svg>',
  load: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/><path d="m4 13 .2-2 2-1 .6-1.5L6 6.5 7.5 5l2 .8 1.5-.6L12 3h2l1 2.2 1.5.6 2-.8L20 6.5l-.8 2 .6 1.5 2 1 .2 2-2 1-.6 1.5.8 2L18.5 19l-2-.8-1.5.6-1 2.2h-2l-1-2.2-1.5-.6-2 .8L6 17.5l.8-2L6.2 14 4 13Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2m-8 3 .6 10h8.8L17 10M10 11v6m4-6v6"/></svg>',
});

/* ========================================
   INIT
   ======================================== */

function initMobile() {
  renderMobileMenu();
  bindMobileEvents();
  initCommandCopy();
  if (isMobileView()) {
    setupVisualViewport();
  }
  // Standalone / APK / PWA tespiti — sahte status bar'ı gizle
  detectStandaloneMode();
}

/* ========================================
   EVENT BINDING
   ======================================== */

function bindMobileEvents() {
  const headerMenuBtn = $('headerMenuBtn');
  const headerDropdown = $('headerDropdown');
  const backdrop = $('mobileOverlayBackdrop');
  const backBtn = $('mobileOverlayBack');

  // Header 3 nokta toggle
  if (headerMenuBtn) {
    headerMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
    headerMenuBtn.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      e.stopPropagation();
      if (mobileState.menuOpen) {
        closeMobileMenu({ restoreFocus: true });
      } else {
        openMobileMenu({ focusFirst: true });
      }
    });
  }

  // Dropdown item clicks
  if (headerDropdown) {
    headerDropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.hd-item');
      if (!item) return;
      e.stopPropagation();
      handleMobileAction(item.dataset.action);
    });
    headerDropdown.addEventListener('keydown', (e) => {
      if (handleMobileMenuKeydown(e, headerDropdown)) e.stopPropagation();
    });
  }

  window.addEventListener(MENU_MODE_EVENT, (e) => {
    renderMobileMenu(e.detail?.mode);
  });

  // Backdrop → close active mobile surface
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      if (mobileState.menuOpen) {
        closeMobileMenu();
        return;
      }
      closeMobileOverlay();
    });
  }

  // Back button → close overlay
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileOverlay();
    });
  }

  // Overlay action buttons (Oynat / Sıfırla)
  const moPlayBtn = $('moPlayBtn');
  const moResetBtn = $('moResetBtn');
  if (moPlayBtn) {
    moPlayBtn.addEventListener('click', () => {
      closeMobileOverlay();
      setTimeout(() => {
        loadScript();
        play();
      }, 300);
    });
  }
  if (moResetBtn) {
    moResetBtn.addEventListener('click', () => {
      reset();
    });
  }

  // Click outside → close dropdown
  document.addEventListener('click', (e) => {
    if (!mobileState.menuOpen) return;
    const btnEl = $('headerMenuBtn');
    const ddEl = $('headerDropdown');
    if (btnEl && btnEl.contains(e.target)) return;
    if (ddEl && ddEl.contains(e.target)) return;
    closeMobileMenu();
  });

  // Resize: masaüstüne geçince mobil UI'ları kapat
  window.addEventListener('resize', debounce(() => {
    if (!isMobileView()) {
      closeMobileMenu();
      if (mobileState.overlayOpen) closeMobileOverlay();
    }
  }, 250));

  // Android geri tuşu
  window.addEventListener('popstate', (e) => {
    if (mobileState.overlayOpen) {
      e.preventDefault();
      closeMobileOverlay();
    } else if (mobileState.menuOpen) {
      e.preventDefault();
      closeMobileMenu();
    }
  });
}

/* ========================================
   DROPDOWN MENU
   ======================================== */

function toggleMobileMenu() {
  mobileState.menuOpen ? closeMobileMenu() : openMobileMenu();
}

function openMobileMenu(options = {}) {
  const dd = $('headerDropdown');
  if (!dd) return;
  const btn = $('headerMenuBtn');
  const backdrop = $('mobileOverlayBackdrop');
  mobileState.menuOpen = true;
  dd.classList.add('is-open');
  document.body.classList.add('mobile-menu-open');
  if (btn) {
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Mobil menuyu kapat');
  }
  if (isMobileView() && backdrop) {
    backdrop.classList.add('is-open', 'is-menu-backdrop');
  }
  if (options.focusFirst) focusFirstMobileMenuItem(dd);
}

function closeMobileMenu(options = {}) {
  const dd = $('headerDropdown');
  const btn = $('headerMenuBtn');
  const backdrop = $('mobileOverlayBackdrop');
  mobileState.menuOpen = false;
  if (dd) dd.classList.remove('is-open');
  document.body.classList.remove('mobile-menu-open');
  if (btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Mobil menuyu ac');
  }
  if (backdrop) {
    backdrop.classList.remove('is-menu-backdrop');
    if (!mobileState.overlayOpen) backdrop.classList.remove('is-open');
  }
  if (options.restoreFocus && btn) btn.focus();
}

function getCurrentMenuMode() {
  const modeSelect = $('appModeToggle');
  if (modeSelect?.value) return normalizeMenuMode(modeSelect.value);
  if (document.body.classList.contains('simple-mode')) return MENU_MODES.SIMPLE;
  return MENU_MODES.SIMPLE;
}

export function renderMobileMenu(mode = getCurrentMenuMode()) {
  const menu = $('headerDropdown');
  if (!menu) return;

  const safeMode = normalizeMenuMode(mode);
  let root = menu.querySelector('[data-menu-root]');
  if (!root) {
    root = document.createElement('div');
    root.className = 'hd-menu-groups';
    root.dataset.menuRoot = '';
    menu.querySelectorAll('.hd-menu-group').forEach((group) => group.remove());
    menu.appendChild(root);
  }

  root.replaceChildren(...getMobileMenuGroups(safeMode).map(createMenuGroupElement));
  menu.dataset.menuMode = safeMode;
}

function createMenuGroupElement(group) {
  const groupEl = document.createElement('div');
  groupEl.className = `hd-menu-group hd-menu-group-${group.id}`;
  groupEl.dataset.menuGroup = group.id;
  groupEl.setAttribute('role', 'group');

  const labelEl = document.createElement('div');
  const labelId = `mobile-menu-group-${group.id}`;
  labelEl.id = labelId;
  labelEl.className = 'hd-group-label';
  labelEl.textContent = group.label;
  groupEl.setAttribute('aria-labelledby', labelId);
  groupEl.appendChild(labelEl);

  const itemsEl = document.createElement('div');
  itemsEl.className = 'hd-group-items';

  group.items.forEach((item) => {
    itemsEl.appendChild(createMenuItemElement(item));
  });

  groupEl.appendChild(itemsEl);
  return groupEl;
}

function createMenuItemElement(item) {
  const button = document.createElement('button');
  button.type = 'button';
  const itemClasses = ['hd-item', `hd-item-${item.type}`];
  if (item.variant) itemClasses.push(`hd-item-${item.variant}`);
  if (item.dangerous) itemClasses.push('hd-item-danger');
  button.className = itemClasses.join(' ');
  button.dataset.action = item.action;
  button.dataset.menuItem = item.id;
  button.dataset.actionType = item.type;
  button.dataset.target = item.target;
  if (item.mode === MENU_MODES.PRO) button.dataset.mode = MENU_MODES.PRO;
  button.setAttribute('role', 'menuitem');
  button.setAttribute('aria-label', `${item.label} - ${item.type === 'panel' ? 'panel ac' : 'aksiyon calistir'}`);
  if (item.type === 'panel') button.setAttribute('aria-controls', item.target);

  const icon = document.createElement('span');
  icon.className = 'hd-item-icon';
  icon.innerHTML = MOBILE_MENU_ICONS[item.icon] || MOBILE_MENU_ICONS.settings;

  const copy = document.createElement('span');
  copy.className = 'hd-item-copy';

  const label = document.createElement('span');
  label.className = 'hd-item-label';
  label.textContent = item.mobileLabel || item.label;
  copy.appendChild(label);

  if (item.description) {
    const description = document.createElement('span');
    description.className = 'hd-item-description';
    description.textContent = item.description;
    copy.appendChild(description);
  }

  button.append(icon, copy);

  if (item.type === 'panel') {
    const affordance = document.createElement('span');
    affordance.className = 'hd-item-affordance';
    affordance.setAttribute('aria-hidden', 'true');
    affordance.textContent = '›';
    button.appendChild(affordance);
  }

  return button;
}

function getFocusableMenuItems(menu = $('headerDropdown')) {
  if (!menu) return [];
  return [...menu.querySelectorAll('.hd-item:not([disabled])')];
}

function focusFirstMobileMenuItem(menu) {
  const firstItem = getFocusableMenuItems(menu)[0];
  if (firstItem) firstItem.focus();
}

function focusMobileMenuItem(menu, offset) {
  const items = getFocusableMenuItems(menu);
  if (!items.length) return;

  const currentIndex = items.indexOf(document.activeElement);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const nextIndex = (safeIndex + offset + items.length) % items.length;
  items[nextIndex].focus();
}

function handleMobileMenuKeydown(e, menu) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeMobileMenu({ restoreFocus: true });
    return true;
  }

  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    focusMobileMenuItem(menu, 1);
    return true;
  }

  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    focusMobileMenuItem(menu, -1);
    return true;
  }

  if (e.key === 'Home') {
    e.preventDefault();
    focusFirstMobileMenuItem(menu);
    return true;
  }

  if (e.key === 'End') {
    e.preventDefault();
    const items = getFocusableMenuItems(menu);
    if (items.length) items[items.length - 1].focus();
    return true;
  }

  return false;
}

/* ========================================
   MENU ACTIONS
   ======================================== */

function handleMobileAction(action) {
  const menuItem = findMenuItemByAction(action);
  if (!menuItem) return;

  closeMobileMenu();

  // Panel overlay açanlar
  if (menuItem.type === 'panel') {
    openMobileOverlay(menuItem.panelKey || menuItem.action);
    return;
  }

  // Direkt aksiyonlar
  switch (menuItem.target) {
    case 'play':
      if (mobileState.overlayOpen) closeMobileOverlay();
      setTimeout(() => {
        loadScript();
        play();
      }, 150);
      break;
    case 'pause':
      pause();
      break;
    case 'reset':
      if (mobileState.overlayOpen) closeMobileOverlay();
      reset();
      break;
    case 'save':
      if (storage.exportToFile) {
        storage.exportToFile();
        showSuccess('Dosya indirildi!');
      }
      break;
    case 'screenshot':
      if (appCallbacks.takeScreenshot) appCallbacks.takeScreenshot();
      break;
    case 'load':
      triggerMobileFileLoad();
      break;
    case 'clear':
      if (!confirm('Tüm veriyi silmek istediğinizden emin misiniz? Bu işlem senaryo, kişiler ve ayarları temizler.')) return;
      mobileClearAll();
      break;
  }
}

/** Call an app-registered callback if it exists */
function callApp(fnName, ...args) {
  if (typeof appCallbacks[fnName] === 'function') {
    appCallbacks[fnName](...args);
  }
}

/** File import dialog (mirrors desktop logic) */
function triggerMobileFileLoad() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (storage.importFromFile) {
        await storage.importFromFile(file);
      }
      mobileRefreshAll();
      showSuccess('Dosya yüklendi!');
    } catch (err) {
      showError(err.message || 'Dosya yüklenemedi');
    }
  };
  input.click();
}

/** Clear all data */
function mobileClearAll() {
  if (storage.clear) storage.clear();
  state.reset();
  state.set('player.script', DEFAULT_SCRIPT);
  mobileRefreshAll();
  showSuccess('Tüm veri silindi!');
}

/** Refresh all UI after data change */
function mobileRefreshAll() {
  if (appCallbacks.populateFormFields) appCallbacks.populateFormFields();
  renderPeopleList();
  syncHeader();
  rebuildChat();
  applyWallpaper();
  applyAllTypography();
}

/* ========================================
   OVERLAY PANEL
   Yaklaşım: Panel DOM node'unu overlay'e TAŞI,
   kapanırken eski yerine GERİ TAŞI.
   Böylece ID'ler ve mevcut event listener'lar korunur.
   ======================================== */

function openMobileOverlay(panelKey) {
  const overlay = $('mobileOverlay');
  const backdrop = $('mobileOverlayBackdrop');
  const titleEl = $('mobileOverlayTitle');
  const body = $('mobileOverlayBody');
  if (!overlay || !body) return;

  const sourcePanelId = PANEL_MAP[panelKey];
  if (!sourcePanelId) return;
  const sourcePanel = $(sourcePanelId);
  if (!sourcePanel) return;

  // Başlık
  if (titleEl) titleEl.textContent = PANEL_TITLES[panelKey] || panelKey;

  // Body temizle (önceki overlay kalıntısı)
  body.replaceChildren();

  // Referansları sakla — geri taşımak için
  mobileState._movedPanel = sourcePanel;
  mobileState._panelParent = sourcePanel.parentNode;
  mobileState._panelNextSibling = sourcePanel.nextSibling;
  mobileState._panelOriginalDisplay = sourcePanel.style.display || '';
  mobileState._panelOriginalAriaHidden = sourcePanel.getAttribute('aria-hidden');

  // Paneli overlay body'ye taşı
  body.appendChild(sourcePanel);
  sourcePanel.classList.add('active');
  sourcePanel.setAttribute('aria-hidden', 'false');
  sourcePanel.style.display = 'block';
  sourcePanel.style.overflow = 'visible';
  sourcePanel.style.height = 'auto';

  // State güncelle
  mobileState.overlayOpen = true;
  mobileState.currentPanel = panelKey;

  // Aç
  overlay.classList.add('is-open');
  if (backdrop) {
    backdrop.classList.remove('is-menu-backdrop');
    backdrop.classList.add('is-open');
  }

  // History push — geri tuşu desteği
  history.pushState({ mobileOverlay: true }, '');
}

function closeMobileOverlay() {
  const overlay = $('mobileOverlay');
  const backdrop = $('mobileOverlayBackdrop');

  // Overlay kapalıysa bile zorla temizle
  if (!overlay) return;

  // Paneli eski yerine geri taşı
  if (mobileState._movedPanel && mobileState._panelParent) {
    const panel = mobileState._movedPanel;

    // Script inner tab state'ini kaydet (taşımadan ÖNCE)
    const activeScriptTab = panel.querySelector('.script-tab.active');
    const activeScriptTabTarget = activeScriptTab ? activeScriptTab.dataset.stab : null;

    // Overlay'de uygulanan stil override'ları geri al
    panel.style.overflow = '';
    panel.style.height = '';
    if (mobileState._panelOriginalAriaHidden === null) {
      panel.removeAttribute('aria-hidden');
    } else {
      panel.setAttribute('aria-hidden', mobileState._panelOriginalAriaHidden);
    }
    // Orijinal display değerini geri yükle
    panel.style.display = mobileState._panelOriginalDisplay || '';
    panel.classList.remove('active');

    // Orijinal pozisyona geri koy
    try {
      if (mobileState._panelNextSibling && mobileState._panelNextSibling.parentNode === mobileState._panelParent) {
        mobileState._panelParent.insertBefore(panel, mobileState._panelNextSibling);
      } else {
        mobileState._panelParent.appendChild(panel);
      }
    } catch (e) {
      // Fallback: body'ye ekle gizli olarak
      document.body.appendChild(panel);
      panel.style.display = 'none';
    }

    // Script inner tab state'ini restore et
    if (activeScriptTabTarget) {
      panel.querySelectorAll('.script-tab').forEach(t => t.classList.remove('active'));
      panel.querySelectorAll('.script-tab-panel').forEach(p => p.classList.remove('active'));
      const targetTab = panel.querySelector(`.script-tab[data-stab="${activeScriptTabTarget}"]`);
      const targetPanel = document.getElementById(activeScriptTabTarget);
      if (targetTab) targetTab.classList.add('active');
      if (targetPanel) targetPanel.classList.add('active');
    }

    // Masaüstü tab aktif panel'i restore et
    restoreDesktopActiveTab();
  }

  // Temizle
  mobileState._movedPanel = null;
  mobileState._panelParent = null;
  mobileState._panelNextSibling = null;
  mobileState._panelOriginalDisplay = null;
  mobileState._panelOriginalAriaHidden = null;
  mobileState.overlayOpen = false;
  mobileState.currentPanel = null;

  overlay.classList.remove('is-open');
  if (backdrop) backdrop.classList.remove('is-open');

  const body = $('mobileOverlayBody');
  if (body) body.replaceChildren();
}

/** Masaüstündeki tab sistemi aktif paneli restore eder */
function restoreDesktopActiveTab() {
  const activeTab = document.querySelector('.tab.active');
  if (!activeTab) return;
  const tabId = activeTab.dataset.tab;
  if (!tabId) return;

  document.querySelectorAll('.panel-left .panel').forEach(p => {
    p.classList.remove('active');
    p.style.display = '';
  });

  const panel = $(tabId);
  if (panel) panel.classList.add('active');
}

/* ========================================
   COMMAND COPY (Long-press / Right-click)
   Faz 19: Mobil Komut Yardımı
   ======================================== */

function initCommandCopy() {
  let pressTimer = null;
  let pressTarget = null;

  /**
   * Kopyalanabilir satırı bul — tıklanan elementin en yakın hedefi
   * .guide-table tr (komut tablosu satırı) veya .command-help p
   */
  function findCopyRow(el) {
    // guide-table satırı (th hariç)
    const tr = el.closest('.guide-table tr');
    if (tr && !tr.querySelector('th')) return tr;
    // command-help paragrafı
    const p = el.closest('.command-help p');
    if (p) return p;
    return null;
  }

  /** Satırdan kopyalanacak metni çıkar */
  function extractText(row) {
    if (row.tagName === 'TR') {
      // İlk sütun: komut, üçüncü sütun: örnek
      const cells = row.querySelectorAll('td');
      if (cells.length >= 3) return cells[2].textContent.trim();
      if (cells.length >= 1) return cells[0].textContent.trim();
    }
    // command-help p — code elemanının text'i
    const code = row.querySelector('code');
    if (code) return code.textContent.trim();
    return row.textContent.trim();
  }

  /** Flash efekti uygula */
  function flashRow(row) {
    row.classList.add('copy-flash');
    setTimeout(() => {
      row.classList.remove('copy-flash');
      row.classList.add('copy-flash-out');
      setTimeout(() => row.classList.remove('copy-flash-out'), 400);
    }, 600);
  }

  /** Clipboard'a kopyala + toast + flash */
  async function copyRow(row) {
    const text = extractText(row);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Kopyalandı!');
      flashRow(row);
    } catch {
      // Fallback: execCommand
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showSuccess('Kopyalandı!');
      flashRow(row);
    }
  }

  // Touch long-press (mobil)
  document.addEventListener('touchstart', (e) => {
    const row = findCopyRow(e.target);
    if (!row) return;
    pressTarget = row;
    pressTimer = setTimeout(() => {
      e.preventDefault();
      copyRow(row);
      pressTarget = null;
    }, 500);
  }, { passive: false });

  document.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
    pressTarget = null;
  });

  document.addEventListener('touchmove', () => {
    clearTimeout(pressTimer);
    pressTarget = null;
  });

  // Right-click / contextmenu (masaüstü alternatif)
  document.addEventListener('contextmenu', (e) => {
    const row = findCopyRow(e.target);
    if (!row) return;
    // Sadece mobilde context menu'yü engelle (masaüstünde varsayılan davranış korunsun)
    if (isMobileView()) {
      e.preventDefault();
      copyRow(row);
    }
  });
}

/* ========================================
   VIRTUAL KEYBOARD HANDLING
   ======================================== */

function setupVisualViewport() {
  if (!window.visualViewport) return;

  const vv = window.visualViewport;

  const onViewportChange = throttle(() => {
    const heightDiff = window.innerHeight - vv.height;
    const isKeyboardOpen = heightDiff > 100;
    // Keyboard açıkken gerekirse overlay'i ayarla
    document.documentElement.style.setProperty('--keyboard-height', isKeyboardOpen ? `${heightDiff}px` : '0px');
  }, 50);

  vv.addEventListener('resize', onViewportChange);
  vv.addEventListener('scroll', onViewportChange);
}

/* ========================================
   STANDALONE / APK / PWA DETECTION
   CSS media query fallback — iOS Safari
   ve bazı WebView'lar için JS tespiti
   ======================================== */

function detectStandaloneMode() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    const statusBar = document.querySelector('.status-bar');
    if (statusBar) statusBar.style.display = 'none';
  }
}

export { initMobile };
