/* ========================================
   PHONE APP SHELL - Home tabs and chat detail
   ======================================== */

import { $ } from '../utils.js';
import { state } from '../state.js';

export const PHONE_TABS = ['chats', 'updates', 'communities', 'calls'];

const shellState = {
  activeTab: 'chats',
  view: 'home',
};

function getShellElements() {
  return {
    phone: document.querySelector('.phone'),
    home: $('phoneHomeShell'),
    detail: $('phoneChatDetail'),
    backButton: $('phoneChatBackBtn'),
    tabButtons: [...document.querySelectorAll('[data-phone-tab]')],
    tabPanels: [...document.querySelectorAll('[data-phone-tab-panel]')],
    openChatButtons: [...document.querySelectorAll('[data-phone-open-chat]')],
  };
}

function getSafeTab(tab) {
  return PHONE_TABS.includes(tab) ? tab : 'chats';
}

export function setActivePhoneTab(tab) {
  const activeTab = getSafeTab(tab);
  const { home, tabButtons, tabPanels } = getShellElements();

  shellState.activeTab = activeTab;
  if (home) home.dataset.activeTab = activeTab;

  tabButtons.forEach((button) => {
    const isActive = button.dataset.phoneTab === activeTab;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.phoneTabPanel === activeTab;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });

  return activeTab;
}

export function showPhoneHome(options = {}) {
  const { phone, home, detail } = getShellElements();
  shellState.view = 'home';
  if (phone) phone.dataset.phoneView = 'home';
  if (home) {
    home.removeAttribute('aria-hidden');
    if (options.focus) home.querySelector('[data-phone-open-chat]')?.focus();
  }
  if (detail) detail.setAttribute('aria-hidden', 'true');
}

export function showPhoneChatDetail(options = {}) {
  const { phone, home, detail, backButton } = getShellElements();
  shellState.view = 'chat';
  if (phone) phone.dataset.phoneView = 'chat';
  if (home) home.setAttribute('aria-hidden', 'true');
  if (detail) detail.removeAttribute('aria-hidden');
  if (options.focus && backButton) backButton.focus();
}

export function getPhoneShellState() {
  return { ...shellState };
}

function syncHomeChatSummary() {
  const group = state.get('group') || {};
  const title = group.title || 'Grup';
  const subtitle = group.subtitle || 'Sohbet detayini ac';
  const time = $('statusTime')?.textContent?.trim() || '12:00';
  const titleEl = $('homeChatTitle');
  const subtitleEl = $('homeChatSubtitle');
  const avatarEl = $('homeChatAvatar');
  const timeEl = $('homeChatTime');

  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;
  if (timeEl) timeEl.textContent = time;
  if (avatarEl) avatarEl.textContent = (title[0] || 'G').toUpperCase();
}

function bindPhoneShellEvents() {
  const { phone, backButton, tabButtons, openChatButtons } = getShellElements();
  if (!phone || phone.dataset.phoneShellBound === 'true') return;
  phone.dataset.phoneShellBound = 'true';

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => setActivePhoneTab(button.dataset.phoneTab));
  });

  openChatButtons.forEach((button) => {
    button.addEventListener('click', () => showPhoneChatDetail({ focus: true }));
  });

  if (backButton) {
    backButton.addEventListener('click', () => showPhoneHome({ focus: true }));
  }
}

export function initPhoneShell() {
  bindPhoneShellEvents();
  syncHomeChatSummary();
  setActivePhoneTab(shellState.activeTab);
  showPhoneHome();
}
