/* ========================================
   MENU MODEL - Shared desktop/mobile menu contract
   ======================================== */

export const MENU_MODES = Object.freeze({
  SIMPLE: 'simple',
  PRO: 'pro',
});

export const MENU_MODE_EVENT = 'wa-menu-mode-change';

export const MENU_GROUPS = Object.freeze([
  { id: 'prepare', label: 'Hazırla' },
  { id: 'scenario', label: 'Senaryo' },
  { id: 'playback', label: 'Oynat' },
  { id: 'output', label: 'Çıktı' },
  { id: 'settings', label: 'Ayarlar' },
  { id: 'data', label: 'Diğer' },
]);

export const MENU_ICON_SVG = Object.freeze({
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

export const MENU_ITEMS = Object.freeze([
  {
    id: 'prepare-panel',
    group: 'prepare',
    label: 'Grup & Kişiler',
    shortLabel: 'Hazırla',
    description: 'Grup, kişiler ve sıra',
    icon: 'people',
    action: 'group',
    type: 'panel',
    target: 'group',
    panelKey: 'group',
    mode: MENU_MODES.SIMPLE,
  },
  {
    id: 'scenario-editor',
    group: 'scenario',
    label: 'Senaryo Editörü',
    shortLabel: 'Senaryo',
    description: 'Akış ve mesajlar',
    icon: 'scenario',
    action: 'scriptEditor',
    type: 'panel',
    target: 'script',
    panelKey: 'scriptEditor',
    mode: MENU_MODES.PRO,
  },
  {
    id: 'playback-play',
    group: 'playback',
    label: 'Oynat',
    icon: 'play',
    variant: 'primary',
    action: 'play',
    type: 'playback',
    target: 'play',
    mode: MENU_MODES.SIMPLE,
  },
  {
    id: 'playback-pause',
    group: 'playback',
    label: 'Duraklat',
    icon: 'pause',
    variant: 'neutral',
    action: 'pause',
    type: 'playback',
    target: 'pause',
    mode: MENU_MODES.SIMPLE,
  },
  {
    id: 'playback-reset',
    group: 'playback',
    label: 'Oynatmayı Sıfırla',
    mobileLabel: 'Sıfırla',
    icon: 'reset',
    variant: 'danger',
    action: 'reset',
    type: 'playback',
    target: 'reset',
    mode: MENU_MODES.SIMPLE,
  },
  {
    id: 'output-screenshot',
    group: 'output',
    label: 'Ekran Görüntüsü',
    description: 'Telefon ekranını indir',
    icon: 'camera',
    action: 'screenshot',
    type: 'output',
    target: 'screenshot',
    mode: MENU_MODES.SIMPLE,
  },
  {
    id: 'output-save',
    group: 'data',
    label: 'Kaydet',
    description: 'JSON dosyası indir',
    icon: 'save',
    action: 'save',
    type: 'output',
    target: 'save',
    mode: MENU_MODES.SIMPLE,
  },
  {
    id: 'output-load',
    group: 'data',
    label: 'Yükle',
    description: 'JSON dosyası içe aktar',
    icon: 'load',
    action: 'load',
    type: 'output',
    target: 'load',
    mode: MENU_MODES.SIMPLE,
  },
  {
    id: 'settings-panel',
    group: 'settings',
    label: 'Ayarlar',
    shortLabel: 'Ayarlar',
    description: 'Görünüm ve kontroller',
    icon: 'settings',
    action: 'settings',
    type: 'panel',
    target: 'settings',
    panelKey: 'settings',
    mode: MENU_MODES.SIMPLE,
  },
  {
    id: 'data-clear',
    group: 'data',
    label: 'Tüm Veriyi Sil',
    description: 'Senaryo, kişiler ve ayarlar',
    icon: 'trash',
    action: 'clear',
    type: 'data',
    target: 'clear',
    mode: MENU_MODES.PRO,
    dangerous: true,
  },
]);

export const DESKTOP_ACTION_GROUPS = Object.freeze([
  { id: 'view', label: 'Gorunum', itemIds: ['modeBadge', 'phoneOnlyBtn', 'scaleControls'] },
  { id: 'output', label: 'Cikti', itemIds: ['screenshotBtn', 'saveAllBtn', 'loadAllBtn'] },
  { id: 'settings', label: 'Ayarlar', itemIds: ['actionThemeToggleBtn'] },
  { id: 'data', label: 'Veri Islemleri', itemIds: ['clearAllBtn'], mode: MENU_MODES.PRO },
]);

export function normalizeMenuMode(mode) {
  return mode === MENU_MODES.PRO ? MENU_MODES.PRO : MENU_MODES.SIMPLE;
}

export function isMenuItemVisible(item, mode = MENU_MODES.PRO) {
  const safeMode = normalizeMenuMode(mode);
  return safeMode === MENU_MODES.PRO || item.mode !== MENU_MODES.PRO;
}

export function getMenuGroups(mode = MENU_MODES.PRO) {
  return MENU_GROUPS
    .map((group) => ({
      ...group,
      items: MENU_ITEMS.filter((item) => item.group === group.id && isMenuItemVisible(item, mode)),
    }))
    .filter((group) => group.items.length > 0);
}

export function getMobileMenuGroups(mode = MENU_MODES.PRO) {
  return getMenuGroups(mode);
}

export function getPanelMenuItems(mode = MENU_MODES.PRO) {
  return MENU_ITEMS.filter((item) => item.type === 'panel' && isMenuItemVisible(item, mode));
}

export function findMenuItemByAction(action) {
  return MENU_ITEMS.find((item) => item.action === action) || null;
}
