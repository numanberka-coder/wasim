/* ========================================
   TABS - Tab Navigation System
   ======================================== */

import { $$, Logger } from '../utils.js';
import { MENU_MODES, getPanelMenuItems } from './menu-model.js';

export let activeTab = 'group';
const tabListeners = new Set();

/**
 * Initialize tab system
 */
export function initTabs() {
  const tabs = $$('.tab');
  const panels = $$('.panel');
  syncTabsWithMenuModel(tabs);
  syncTabAriaState(activeTab, tabs, panels);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      if (!tabId) return;

      // Update active states
      syncTabAriaState(tabId, tabs, panels);

      // Update state and notify
      activeTab = tabId;
      notifyTabChange(tabId);
    });
  });

  Logger.info('📑 Tabs initialized');
}

function syncTabsWithMenuModel(tabs) {
  const tabList = [...tabs];
  const panelItems = getPanelMenuItems(MENU_MODES.PRO);

  panelItems.forEach((item, index) => {
    const tab = tabList.find((candidate) => candidate.dataset.tab === item.target);
    if (!tab) return;

    tab.dataset.menuItem = item.id;
    tab.dataset.menuGroup = item.group;
    tab.dataset.actionType = item.type;
    tab.style.order = String(index);
    if (!tab.id) tab.id = `tab-${item.target}`;
    tab.setAttribute('aria-label', `${item.shortLabel || item.label} paneli`);
    tab.setAttribute('aria-controls', item.target);

    if (item.mode === MENU_MODES.PRO) {
      tab.dataset.mode = MENU_MODES.PRO;
    } else {
      delete tab.dataset.mode;
    }

    const label = tab.querySelector('span');
    if (label) label.textContent = item.shortLabel || item.label;
  });
}

function syncTabAriaState(tabId, tabs, panels) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabId;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  panels.forEach((panel) => {
    const isActive = panel.id === tabId;
    panel.classList.toggle('active', isActive);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-hidden', String(!isActive));

    const ownerTab = document.querySelector(`.tab[data-tab="${panel.id}"]`);
    if (ownerTab?.id) panel.setAttribute('aria-labelledby', ownerTab.id);
  });
}

/**
 * Switch to specific tab programmatically
 */
export function switchTab(tabId) {
  const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
  if (tab) {
    tab.click();
  }
}

/**
 * Get current active tab
 */
export function getActiveTab() {
  return activeTab;
}

/**
 * Subscribe to tab changes
 */
export function onTabChange(callback) {
  tabListeners.add(callback);
  return () => tabListeners.delete(callback);
}

/**
 * Notify tab change
 */
export function notifyTabChange(tabId) {
  for (const callback of tabListeners) {
    callback(tabId);
  }
}
