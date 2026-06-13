import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DESKTOP_ACTION_GROUPS,
  MENU_MODES,
  findMenuItemByAction,
  getMobileMenuGroups,
  getPanelMenuItems,
} from '../js/ui/menu-model.js';
import { initMobile, renderMobileMenu } from '../js/ui/mobile.js';
import { initTabs } from '../js/ui/tabs.js';

function loadIndexDocument() {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  return new DOMParser().parseFromString(html, 'text/html');
}

function loadResponsiveCss() {
  return readFileSync(join(process.cwd(), 'css', 'responsive.css'), 'utf8');
}

function mountIndexDocument() {
  const doc = loadIndexDocument();
  document.body.innerHTML = doc.body.innerHTML;
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    });
  }
  return document;
}

function getHeaderMenuGroups(mode = MENU_MODES.PRO) {
  return getMobileMenuGroups(mode).map((group) => ({
    key: group.id,
    label: group.label,
    actions: group.items.map((item) => item.action),
    texts: group.items.map((item) => item.label),
  }));
}

function getDesktopActionGroups(doc) {
  return [...doc.querySelectorAll('.action-bar-actions .action-group')].map((group) => ({
    key: group.dataset.actionGroup,
    ids: [...group.querySelectorAll('button, .mode-badge, .scale-controls')].map((item) => item.id).filter(Boolean),
    mode: group.dataset.mode || MENU_MODES.SIMPLE,
  }));
}

function getMobilePanelActions(mode = MENU_MODES.PRO) {
  return getPanelMenuItems(mode).map((item) => item.action);
}

function getPanelAccordionLabels(doc, panelId) {
  return [...doc.querySelectorAll(`#${panelId} > details.accordion > summary`)].map((summary) =>
    summary.textContent.replace(/\s+/g, ' ').trim()
  );
}

describe('Faz 36 menu discipline', () => {
  it('orders header menu groups by the product workflow', () => {
    const groups = getHeaderMenuGroups();

    expect(groups.map((group) => group.label)).toEqual([
      'Hazırla',
      'Senaryo',
      'Oynat',
      'Çıktı',
      'Ayarlar',
      'Diğer',
    ]);
  });

  it('keeps panel, playback, output, settings, and data actions separated', () => {
    const groups = getHeaderMenuGroups();
    const actionsByKey = Object.fromEntries(groups.map((group) => [group.key, group.actions]));

    expect(actionsByKey.prepare).toEqual(['group']);
    expect(actionsByKey.scenario).toEqual(['scriptEditor']);
    expect(actionsByKey.playback).toEqual(['play', 'pause', 'reset']);
    expect(actionsByKey.output).toEqual(['screenshot']);
    expect(actionsByKey.settings).toEqual(['settings']);
    expect(actionsByKey.data).toEqual(['save', 'load', 'clear']);
  });

  it('keeps playback reset distinct from destructive data deletion', () => {
    const doc = loadIndexDocument();
    const resetAction = findMenuItemByAction('reset');
    const clearAction = findMenuItemByAction('clear');
    const clearAllButton = doc.querySelector('#clearAllBtn');
    const overlayResetButton = doc.querySelector('#moResetBtn');

    expect(resetAction?.label).toBe('Oynatmayı Sıfırla');
    expect(clearAction?.label).toBe('Tüm Veriyi Sil');
    expect(clearAllButton?.getAttribute('title')).toBe('Tüm Veriyi Sil');
    expect(overlayResetButton?.getAttribute('title')).toBe('Oynatmayı Sıfırla');
  });

  it('uses Hazırla as the main preparation tab label', () => {
    const doc = loadIndexDocument();
    const firstTab = doc.querySelector('.tabs .tab[data-tab="group"] span');

    expect(firstTab?.textContent.trim()).toBe('Hazırla');
  });
});

describe('Faz 37 desktop menu and panel order', () => {
  it('groups desktop action bar controls by view, output, settings, and data work', () => {
    const doc = loadIndexDocument();
    const groups = getDesktopActionGroups(doc);
    const expectedGroups = DESKTOP_ACTION_GROUPS.map((group) => ({
      key: group.id,
      ids: group.itemIds,
      mode: group.mode || MENU_MODES.SIMPLE,
    }));

    expect(groups).toEqual(expectedGroups);
  });

  it('keeps desktop panel tabs in the shared model order', () => {
    const doc = loadIndexDocument();
    const tabBridge = doc.querySelector('.tabs');
    const tabIds = [...doc.querySelectorAll('.tabs .tab')].map((tab) => tab.dataset.tab);
    const modelPanelIds = getPanelMenuItems(MENU_MODES.PRO).map((item) => item.target);

    expect(tabBridge?.classList.contains('tab-bridge')).toBe(true);
    expect(tabIds).toEqual(modelPanelIds);
  });

  it('keeps preparation workflow accordions before technical JSON editing', () => {
    const doc = loadIndexDocument();
    const labels = getPanelAccordionLabels(doc, 'group');

    expect(labels).toEqual([
      'Grup Bilgileri',
      'Kişi Ekle / Düzenle',
      'Kişi Listesi',
      'Satır Sırası',
      'JSON Düzenle',
    ]);
  });

  it('keeps common settings before pro and technical settings', () => {
    const doc = loadIndexDocument();
    const labels = getPanelAccordionLabels(doc, 'settings');

    expect(labels.indexOf('🌗 Tema')).toBeGreaterThan(labels.indexOf('🧭 Başlangıç Rehberi & Mod'));
    expect(labels.indexOf('🌗 Tema')).toBeLessThan(labels.indexOf('⏱️ Mesaj Saatleri'));
    expect(labels.indexOf('🔤 Tipografi')).toBeLessThan(labels.indexOf('⏱️ Mesaj Saatleri'));
  });
});

describe('Faz 38 mobile menu and overlay contract', () => {
  it('marks the header menu as a model-rendered mobile action sheet with trigger state', () => {
    const doc = loadIndexDocument();
    const trigger = doc.querySelector('#headerMenuBtn');
    const menu = doc.querySelector('#headerDropdown');
    const header = menu?.querySelector('.hd-menu-header');
    const closeButton = menu?.querySelector('#headerMenuCloseBtn');
    const root = menu?.querySelector('[data-menu-root]');

    expect(trigger?.getAttribute('role')).toBe('button');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger?.getAttribute('aria-controls')).toBe('headerDropdown');
    expect(menu?.classList.contains('mobile-action-sheet')).toBe(true);
    expect(menu?.getAttribute('role')).toBe('menu');
    expect(header?.textContent.replace(/\s+/g, ' ').trim()).toContain('Mobil menü');
    expect(closeButton?.getAttribute('aria-label')).toBe('Mobil menüyü kapat');
    expect(root).not.toBeNull();
    expect(menu?.querySelector('.hd-item')).toBeNull();
  });

  it('keeps mobile panel actions bound to the overlay panel move model', () => {
    const doc = loadIndexDocument();

    expect(getMobilePanelActions()).toEqual(['group', 'scriptEditor', 'settings']);
    expect(doc.querySelector('#mobileOverlayBody')).not.toBeNull();
    expect(doc.querySelector('#mobileOverlayBackdrop')).not.toBeNull();
  });
});

describe('Faz 39 shared menu model and Simple/Pro rules', () => {
  it('filters mobile menu items through the shared Simple/Pro rule', () => {
    const simpleActions = getHeaderMenuGroups(MENU_MODES.SIMPLE).flatMap((group) => group.actions);
    const proActions = getHeaderMenuGroups(MENU_MODES.PRO).flatMap((group) => group.actions);

    expect(simpleActions).toEqual(['group', 'play', 'pause', 'reset', 'screenshot', 'settings', 'save', 'load']);
    expect(simpleActions).not.toContain('scriptEditor');
    expect(simpleActions).not.toContain('clear');
    expect(proActions).toEqual([
      'group',
      'scriptEditor',
      'play',
      'pause',
      'reset',
      'screenshot',
      'settings',
      'save',
      'load',
      'clear',
    ]);
  });

  it('centralizes panel targets and action metadata', () => {
    expect(findMenuItemByAction('scriptEditor')).toMatchObject({
      type: 'panel',
      target: 'script',
      panelKey: 'scriptEditor',
      mode: MENU_MODES.PRO,
    });
    expect(findMenuItemByAction('clear')).toMatchObject({
      type: 'data',
      target: 'clear',
      dangerous: true,
      mode: MENU_MODES.PRO,
    });
  });

  it('keeps desktop Simple/Pro visibility aligned with the model', () => {
    const doc = loadIndexDocument();
    const simplePanels = getPanelMenuItems(MENU_MODES.SIMPLE).map((item) => item.target);
    const proPanels = getPanelMenuItems(MENU_MODES.PRO).map((item) => item.target);

    expect(simplePanels).toEqual(['group', 'settings']);
    expect(proPanels).toEqual(['group', 'script', 'settings']);
    expect(doc.querySelector('.tabs .tab[data-tab="script"]')?.dataset.mode).toBe(MENU_MODES.PRO);
    expect(doc.querySelector('.action-group[data-action-group="data"]')?.dataset.mode).toBe(MENU_MODES.PRO);
  });

  it('renders the mobile action sheet from the shared model at runtime', () => {
    const doc = mountIndexDocument();

    renderMobileMenu(MENU_MODES.PRO);
    expect([...doc.querySelectorAll('#headerDropdown .hd-item')].map((item) => item.dataset.action)).toEqual([
      'group',
      'scriptEditor',
      'play',
      'pause',
      'reset',
      'screenshot',
      'settings',
      'save',
      'load',
      'clear',
    ]);
    expect(doc.querySelector('#headerDropdown [data-action="scriptEditor"]')?.dataset.actionType).toBe('panel');
    expect(doc.querySelector('#headerDropdown [data-action="clear"]')?.classList.contains('hd-item-danger')).toBe(true);

    renderMobileMenu(MENU_MODES.SIMPLE);
    expect([...doc.querySelectorAll('#headerDropdown .hd-item')].map((item) => item.dataset.action)).toEqual([
      'group',
      'play',
      'pause',
      'reset',
      'screenshot',
      'settings',
      'save',
      'load',
    ]);
  });
});

describe('Faz 40 menu accessibility and keyboard checks', () => {
  it('syncs desktop tab selection with tabpanel ARIA state', () => {
    const doc = mountIndexDocument();

    initTabs();

    const groupTab = doc.querySelector('.tabs .tab[data-tab="group"]');
    const scriptTab = doc.querySelector('.tabs .tab[data-tab="script"]');
    const groupPanel = doc.querySelector('#group');
    const scriptPanel = doc.querySelector('#script');
    const desktopRoot = doc.querySelector('[data-desktop-menu-root]');
    const desktopGroupItem = desktopRoot?.querySelector('[data-action="group"]');
    const desktopScriptItem = desktopRoot?.querySelector('[data-action="scriptEditor"]');
    const desktopItems = [...(desktopRoot?.querySelectorAll('.desktop-menu-item') || [])];

    expect(groupTab?.getAttribute('aria-selected')).toBe('true');
    expect(groupTab?.getAttribute('tabindex')).toBe('0');
    expect(groupTab?.getAttribute('aria-controls')).toBe('group');
    expect(groupPanel?.getAttribute('role')).toBe('tabpanel');
    expect(groupPanel?.getAttribute('aria-labelledby')).toBe(desktopGroupItem?.id);
    expect(scriptTab?.getAttribute('aria-selected')).toBe('false');
    expect(scriptTab?.getAttribute('tabindex')).toBe('-1');
    expect(scriptPanel?.getAttribute('aria-hidden')).toBe('true');
    expect(desktopGroupItem?.getAttribute('aria-controls')).toBe('group');
    expect(desktopScriptItem?.getAttribute('aria-controls')).toBe('script');
    expect(desktopItems.map((item) => item.dataset.action)).toEqual(['group', 'scriptEditor', 'settings']);
    expect(desktopRoot?.querySelector('[data-menu-group="playback"]')).toBeNull();
    expect(desktopRoot?.querySelector('[data-action="play"]')).toBeNull();
    expect(desktopGroupItem?.getAttribute('aria-current')).toBe('page');
    expect(desktopScriptItem?.getAttribute('aria-current')).toBe('false');

    scriptTab.click();

    expect(groupTab?.getAttribute('aria-selected')).toBe('false');
    expect(groupPanel?.getAttribute('aria-hidden')).toBe('true');
    expect(scriptTab?.getAttribute('aria-selected')).toBe('true');
    expect(scriptPanel?.getAttribute('aria-hidden')).toBe('false');
    expect(desktopGroupItem?.getAttribute('aria-current')).toBe('false');
    expect(desktopScriptItem?.getAttribute('aria-current')).toBe('page');
  });

  it('renders mobile menu items with grouped labels and panel controls', () => {
    const doc = mountIndexDocument();

    renderMobileMenu(MENU_MODES.PRO);

    const prepareGroup = doc.querySelector('#headerDropdown [data-menu-group="prepare"]');
    const groupLabel = prepareGroup?.querySelector('.hd-group-label');
    const outputActions = [...doc.querySelectorAll('#headerDropdown [data-menu-group="output"] .hd-item')].map(
      (item) => item.dataset.action
    );
    const dataActions = [...doc.querySelectorAll('#headerDropdown [data-menu-group="data"] .hd-item')].map(
      (item) => item.dataset.action
    );
    const panelItem = doc.querySelector('#headerDropdown [data-action="scriptEditor"]');
    const playItem = doc.querySelector('#headerDropdown [data-action="play"]');
    const resetItem = doc.querySelector('#headerDropdown [data-action="reset"]');
    const clearItem = doc.querySelector('#headerDropdown [data-action="clear"]');

    expect(prepareGroup?.getAttribute('role')).toBe('group');
    expect(prepareGroup?.getAttribute('aria-labelledby')).toBe(groupLabel?.id);
    expect(outputActions).toEqual(['screenshot']);
    expect(dataActions).toEqual(['save', 'load', 'clear']);
    expect(panelItem?.getAttribute('role')).toBe('menuitem');
    expect(panelItem?.getAttribute('aria-controls')).toBe('script');
    expect(panelItem?.querySelector('.hd-item-icon')).not.toBeNull();
    expect(panelItem?.querySelector('.hd-item-description')?.textContent).toBe('Akış ve mesajlar');
    expect(panelItem?.getAttribute('aria-label')).toContain('paneli aç');
    expect(playItem?.classList.contains('hd-item-primary')).toBe(true);
    expect(resetItem?.querySelector('.hd-item-label')?.textContent).toBe('Sıfırla');
    expect(clearItem?.getAttribute('aria-label')).toContain('aksiyonu çalıştır');
  });

  it('supports keyboard open, arrow navigation, and Escape close for the mobile menu', () => {
    const doc = mountIndexDocument();
    doc.querySelector('#appModeToggle').value = MENU_MODES.PRO;
    const trigger = doc.querySelector('#headerMenuBtn');
    const menu = doc.querySelector('#headerDropdown');

    initMobile();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(doc.body.classList.contains('mobile-menu-open')).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(doc.activeElement?.dataset.action).toBe('group');

    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(doc.activeElement?.dataset.action).toBe('scriptEditor');

    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(doc.activeElement?.dataset.action).toBe('clear');

    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(doc.body.classList.contains('mobile-menu-open')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(doc.activeElement).toBe(trigger);
  });

  it('opens the settings overlay from a mouse click on the mobile bottom sheet', () => {
    const doc = mountIndexDocument();
    doc.querySelector('#appModeToggle').value = MENU_MODES.PRO;
    const trigger = doc.querySelector('#headerMenuBtn');

    initMobile();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const settingsItem = doc.querySelector('#headerDropdown [data-action="settings"]');
    settingsItem.click();

    expect(doc.querySelector('#headerDropdown')?.classList.contains('is-open')).toBe(false);
    expect(doc.querySelector('#mobileOverlay')?.classList.contains('is-open')).toBe(true);
    expect(doc.querySelector('#mobileOverlayBody #settings')).not.toBeNull();
    expect(doc.querySelector('#settings')?.getAttribute('aria-hidden')).toBe('false');
  });

  it('keeps the mobile sheet clickable above its backdrop and the overlay body scrollable', () => {
    const css = loadResponsiveCss();

    expect(css).toContain('body.mobile-menu-open .chat-header');
    expect(css).toContain('.header-dropdown.mobile-action-sheet.is-preview-sheet');
    expect(css).toContain('.hd-menu-close');
    expect(css).toContain('z-index: 602');
    expect(css).toContain('.mobile-overlay-body');
    expect(css).toContain('min-height: 0');
    expect(css).toContain('touch-action: pan-y');
  });
});
