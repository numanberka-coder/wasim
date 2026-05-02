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
};

/** Panel key → real panel ID eşleştirmesi */
const PANEL_MAP = {
  scriptEditor: 'script',
  group: 'group',
  settings: 'settings',
};

/** Panel key → overlay başlık */
const PANEL_TITLES = {
  scriptEditor: 'Senaryo',
  group: 'Hazırla',
  settings: 'Ayarlar',
};

/* ========================================
   INIT
   ======================================== */

function initMobile() {
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
      toggleMobileMenu();
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
  }

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

function openMobileMenu() {
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
}

function closeMobileMenu() {
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
}

/* ========================================
   MENU ACTIONS
   ======================================== */

function handleMobileAction(action) {
  closeMobileMenu();

  // Panel overlay açanlar
  if (PANEL_MAP[action]) {
    openMobileOverlay(action);
    return;
  }

  // Direkt aksiyonlar
  switch (action) {
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

  // Paneli overlay body'ye taşı
  body.appendChild(sourcePanel);
  sourcePanel.classList.add('active');
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
