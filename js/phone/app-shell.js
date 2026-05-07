/* ========================================
   PHONE APP SHELL - Home tabs and chat detail
   ======================================== */

import { $ } from '../utils.js';
import { state } from '../state.js';

export const PHONE_TABS = ['chats', 'updates', 'communities', 'calls'];
export const CHAT_FILTERS = ['all', 'unread', 'groups'];

const PHONE_TAB_HEADERS = {
  chats: { title: 'WhatsApp', search: false, camera: true },
  updates: { title: 'Guncellemeler', search: true, camera: false },
  communities: { title: 'Topluluklar', search: false, camera: false },
  calls: { title: 'Aramalar', search: true, camera: false },
};

const shellState = {
  activeTab: 'chats',
  activeChatFilter: 'all',
  view: 'home',
};

let shellStateListenerBound = false;

function getShellElements() {
  return {
    phone: document.querySelector('.phone'),
    home: $('phoneHomeShell'),
    detail: $('phoneChatDetail'),
    backButton: $('phoneChatBackBtn'),
    headerTitle: document.querySelector('.phone-home-title'),
    searchButton: $('phoneShellSearchBtn'),
    cameraButton: $('phoneShellCameraBtn'),
    tabButtons: [...document.querySelectorAll('[data-phone-tab]')],
    tabPanels: [...document.querySelectorAll('[data-phone-tab-panel]')],
    chatFilterButtons: [...document.querySelectorAll('[data-phone-chat-filter]')],
    openChatButtons: [...document.querySelectorAll('[data-phone-open-chat]')],
  };
}

function getSafeTab(tab) {
  return PHONE_TABS.includes(tab) ? tab : 'chats';
}

function getSafeChatFilter(filter) {
  return CHAT_FILTERS.includes(filter) ? filter : 'all';
}

function syncPhoneHomeHeader(tab) {
  const activeTab = getSafeTab(tab);
  const { headerTitle, searchButton, cameraButton } = getShellElements();
  const header = PHONE_TAB_HEADERS[activeTab] || PHONE_TAB_HEADERS.chats;

  if (headerTitle) headerTitle.textContent = header.title;
  if (searchButton) searchButton.hidden = !header.search;
  if (cameraButton) cameraButton.hidden = !header.camera;
}

export function setActivePhoneTab(tab) {
  const activeTab = getSafeTab(tab);
  const { home, tabButtons, tabPanels } = getShellElements();

  shellState.activeTab = activeTab;
  if (home) home.dataset.activeTab = activeTab;
  syncPhoneHomeHeader(activeTab);

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

export function setActiveChatFilter(filter) {
  const activeFilter = getSafeChatFilter(filter);
  const { chatFilterButtons } = getShellElements();
  const chatsPanel = $('phoneTabChats');

  shellState.activeChatFilter = activeFilter;
  if (chatsPanel) chatsPanel.dataset.activeFilter = activeFilter;

  chatFilterButtons.forEach((button) => {
    const isActive = button.dataset.phoneChatFilter === activeFilter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  return activeFilter;
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

function cleanText(value, fallback) {
  const text = String(value || '').trim();
  return text || fallback;
}

function getInitials(title) {
  const words = cleanText(title, 'G').split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]).join('');
  return (initials || 'G').toLocaleUpperCase('tr-TR');
}

function getMessageLabel(message) {
  const text = String(message?.text || '').trim();
  if (text) return text;

  const labels = {
    photo: 'Fotograf',
    video: 'Video',
    voice: 'Sesli mesaj',
    location: 'Konum',
    document: 'Belge',
    sticker: 'Sticker',
    viewonce: 'Bir kez goruntule',
    link: 'Baglanti',
  };

  return labels[message?.kind] || 'Mesaj';
}

function getLastMessage(messages) {
  return [...messages].reverse().find((message) => (
    message && (message.text || message.kind || message.src || message.speaker)
  ));
}

function getChatPreview(group, messages) {
  const lastMessage = getLastMessage(messages);
  if (!lastMessage) {
    return cleanText(group.subtitle, 'Sohbet detayini ac');
  }

  const label = getMessageLabel(lastMessage);
  const speaker = cleanText(lastMessage.speaker, '');
  if (!speaker) return label;

  const displayName = state.isSelf(speaker) ? 'Sen' : speaker;
  return `${displayName}: ${label}`;
}

function syncAvatar(avatarEl, group, title) {
  if (!avatarEl) return;
  const avatarUrl = cleanText(group.avatarDataUrl || group.photoUrl, '');
  avatarEl.classList.toggle('has-image', Boolean(avatarUrl));
  avatarEl.style.backgroundImage = avatarUrl ? `url("${avatarUrl.replace(/["\r\n\\]/g, '')}")` : '';
  avatarEl.textContent = avatarUrl ? '' : getInitials(title);
}

function syncHomeChatSummary() {
  const group = state.get('group') || {};
  const messages = state.get('messages') || [];
  const lastMessage = getLastMessage(messages);
  const title = cleanText(group.title, 'Grup');
  const subtitle = getChatPreview(group, messages);
  const time = cleanText(lastMessage?.time, cleanText($('statusTime')?.textContent, '12:00'));
  const titleEl = $('homeChatTitle');
  const subtitleEl = $('homeChatSubtitle');
  const avatarEl = $('homeChatAvatar');
  const timeEl = $('homeChatTime');

  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;
  if (timeEl) timeEl.textContent = time;
  syncAvatar(avatarEl, group, title);
}

function shouldSyncHomeChatSummary(path) {
  return (
    !path ||
    path === 'messages' ||
    path.startsWith('group.') ||
    path === 'settings.statusTimeOverride'
  );
}

function bindPhoneShellStateListener() {
  if (shellStateListenerBound) return;
  state.subscribe((path) => {
    if (shouldSyncHomeChatSummary(path)) syncHomeChatSummary();
  });
  shellStateListenerBound = true;
}

function bindPhoneShellEvents() {
  const { phone, backButton, tabButtons, chatFilterButtons, openChatButtons } = getShellElements();
  if (!phone || phone.dataset.phoneShellBound === 'true') return;
  phone.dataset.phoneShellBound = 'true';

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => setActivePhoneTab(button.dataset.phoneTab));
  });

  openChatButtons.forEach((button) => {
    button.addEventListener('click', () => showPhoneChatDetail({ focus: true }));
  });

  chatFilterButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveChatFilter(button.dataset.phoneChatFilter));
  });

  if (backButton) {
    backButton.addEventListener('click', () => showPhoneHome({ focus: true }));
  }
}

export function initPhoneShell() {
  bindPhoneShellEvents();
  bindPhoneShellStateListener();
  syncHomeChatSummary();
  setActivePhoneTab(shellState.activeTab);
  setActiveChatFilter(shellState.activeChatFilter);
  showPhoneHome();
}
