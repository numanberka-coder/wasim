/* ========================================
   TABS - Tab Navigation System
   ======================================== */


let activeTab = 'group';
const tabListeners = new Set();

/**
 * Initialize tab system
 */
function initTabs() {
  const tabs = $$('.tab');
  const panels = $$('.panel');

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

/**
 * Switch to specific tab programmatically
 */
function switchTab(tabId) {
  const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
  if (tab) {
    tab.click();
  }
}

/**
 * Get current active tab
 */
function getActiveTab() {
  return activeTab;
}

/**
 * Subscribe to tab changes
 */
function onTabChange(callback) {
  tabListeners.add(callback);
  return () => tabListeners.delete(callback);
}

/**
 * Notify tab change
 */
function notifyTabChange(tabId) {
  for (const callback of tabListeners) {
    callback(tabId);
  }
}
