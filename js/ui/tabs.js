/* ========================================
   TABS - Tab Navigation System
   ======================================== */

import { $$, Logger } from '../utils.js';

export let activeTab = 'group';
const tabListeners = new Set();

/**
 * Initialize tab system
 */
export function initTabs() {
  const tabs = $$('.tab');
  const panels = $$('.panel');

  function activateTab(tab) {
    const tabId = tab.dataset.tab;
    if (!tabId) return;

    // Update active states
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');

    panels.forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(tabId);
    if (panel) {
      panel.classList.add('active');
    }

    // Update state and notify
    activeTab = tabId;
    notifyTabChange(tabId);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));

    // Keyboard: ok tuşları ile tab geçişi, Enter/Space ile aktivasyon
    tab.addEventListener('keydown', (e) => {
      const tabArr = Array.from(tabs);
      const idx = tabArr.indexOf(tab);
      let target = null;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        target = tabArr[(idx + 1) % tabArr.length];
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        target = tabArr[(idx - 1 + tabArr.length) % tabArr.length];
      } else if (e.key === 'Home') {
        e.preventDefault();
        target = tabArr[0];
      } else if (e.key === 'End') {
        e.preventDefault();
        target = tabArr[tabArr.length - 1];
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateTab(tab);
        return;
      }

      if (target) {
        target.focus();
        activateTab(target);
      }
    });
  });

  Logger.info('📑 Tabs initialized');
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
