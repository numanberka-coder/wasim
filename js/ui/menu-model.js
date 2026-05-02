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
  { id: 'data', label: 'Veri İşlemleri' },
]);

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
    group: 'output',
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
    group: 'output',
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
