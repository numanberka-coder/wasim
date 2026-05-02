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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      if (!tabId) return;

      // Update active states
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      panels.forEach(p => p.classList.remove('active'));
      const panel = document.getElementById(tabId);
      if (panel) {
        panel.classList.add('active');
      }

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
    tab.setAttribute('aria-label', `${item.shortLabel || item.label} paneli`);

    if (item.mode === MENU_MODES.PRO) {
      tab.dataset.mode = MENU_MODES.PRO;
    } else {
      delete tab.dataset.mode;
    }

    const label = tab.querySelector('span');
    if (label) label.textContent = item.shortLabel || item.label;
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
