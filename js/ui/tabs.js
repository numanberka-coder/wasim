/* ========================================
   TABS - Tab Navigation System
   ======================================== */

import { $$, Logger } from '../utils.js';
import { MENU_ICON_SVG, MENU_MODES, getPanelMenuItems } from './menu-model.js';

export let activeTab = 'group';
const tabListeners = new Set();

/**
 * Initialize tab system
 */
export function initTabs() {
  const tabs = $$('.tab');
  const panels = $$('.panel');
  syncTabsWithMenuModel(tabs);
  renderDesktopWorkflowMenu();
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

    const ownerDesktopItem = document.querySelector(`[data-desktop-menu-root] [data-target-panel="${panel.id}"]`);
    const ownerTab = document.querySelector(`.tab[data-tab="${panel.id}"]`);
    if (ownerDesktopItem?.id) {
      panel.setAttribute('aria-labelledby', ownerDesktopItem.id);
    } else if (ownerTab?.id) {
      panel.setAttribute('aria-labelledby', ownerTab.id);
    }
  });

  syncDesktopWorkflowState(tabId);
}

function renderDesktopWorkflowMenu() {
  const root = document.querySelector('[data-desktop-menu-root]');
  if (!root) return;

  root.replaceChildren(...getPanelMenuItems(MENU_MODES.PRO).map(createDesktopMenuItem));
}

function createDesktopMenuItem(item) {
  const button = document.createElement('button');
  button.type = 'button';
  const classes = ['desktop-menu-item', `desktop-menu-item-${item.type}`];
  if (item.variant) classes.push(`desktop-menu-item-${item.variant}`);
  if (item.dangerous) classes.push('desktop-menu-item-danger');
  button.className = classes.join(' ');
  button.dataset.action = item.action;
  button.dataset.menuItem = item.id;
  button.dataset.menuGroup = item.group;
  button.dataset.actionType = item.type;
  button.dataset.target = item.target;
  button.setAttribute('aria-label', item.description ? `${item.label}: ${item.description}` : item.label);
  if (item.mode === MENU_MODES.PRO) button.dataset.mode = MENU_MODES.PRO;
  if (item.type === 'panel') {
    button.id = `desktop-menu-${item.target}`;
    button.dataset.targetPanel = item.target;
    button.setAttribute('aria-controls', item.target);
  }

  const icon = document.createElement('span');
  icon.className = 'desktop-menu-icon';
  icon.innerHTML = MENU_ICON_SVG[item.icon] || MENU_ICON_SVG.settings;

  const copy = document.createElement('span');
  copy.className = 'desktop-menu-copy';

  const text = document.createElement('span');
  text.className = 'desktop-menu-label';
  text.textContent = item.mobileLabel || item.shortLabel || item.label;
  copy.appendChild(text);

  if (item.description) {
    const description = document.createElement('span');
    description.className = 'desktop-menu-description';
    description.textContent = item.description;
    copy.appendChild(description);
  }

  button.append(icon, copy);
  button.addEventListener('click', () => handleDesktopMenuAction(item));
  return button;
}

function handleDesktopMenuAction(item) {
  if (item.type === 'panel') {
    switchTab(item.target);
  }
}

function syncDesktopWorkflowState(tabId) {
  document.querySelectorAll('[data-desktop-menu-root] .desktop-menu-item').forEach((item) => {
    const isActive = item.dataset.targetPanel === tabId;
    item.classList.toggle('is-active', isActive);
    item.setAttribute('aria-current', isActive ? 'page' : 'false');
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
