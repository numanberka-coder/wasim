/* ========================================
   PHONE APP SHELL - Home tabs and chat detail
   ======================================== */

import { $ } from '../utils.js';
import { state } from '../state.js';
import { syncHeader } from './header.js';
import { initPhoneHomeEditors } from './home-editors.js';
import { rebuildChat } from './messages.js';

export const PHONE_TABS = ['chats', 'updates', 'communities', 'calls'];
export const CHAT_FILTERS = ['all', 'unread', 'groups'];

export const PHONE_ICON_SVG = Object.freeze({
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg>',
  camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>',
  chatPlus: '<svg viewBox="0 0 100 100" aria-hidden="true"><path fill="currentColor" stroke="none" d="m84.375 66.668c0 2.875-2.332 5.207-5.207 5.207h-50c-2.875 0-5.207-2.332-5.207-5.207v-20.285c0-0.38672-0.074219-0.77344-0.21484-1.1367l-6.6719-17.121h62.094c2.875 0 5.207 2.332 5.207 5.207zm6.25-33.336c0-6.3281-5.1289-11.457-11.457-11.457h-66.668c-1.0312 0-1.9961 0.51172-2.5781 1.3633-0.58203 0.85156-0.70703 1.9375-0.33594 2.8984l8.125 20.84v19.691c0 6.3281 5.1289 11.457 11.457 11.457h50c6.3281 0 11.457-5.1289 11.457-11.457z"/><path fill="currentColor" stroke="none" d="m51.043 62.5v-25c0-1.7266 1.3984-3.125 3.125-3.125 1.7227 0 3.125 1.3984 3.125 3.125v25c0 1.7266-1.4023 3.125-3.125 3.125-1.7266 0-3.125-1.3984-3.125-3.125z"/><path fill="currentColor" stroke="none" d="m66.668 53.125h-25c-1.7266 0-3.125-1.3984-3.125-3.125s1.3984-3.125 3.125-3.125h25c1.7227 0 3.125 1.3984 3.125 3.125s-1.4023 3.125-3.125 3.125z"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16.5V20h3.5L18.8 8.7l-3.5-3.5L4 16.5Z"/><path d="m14.5 6 3.5 3.5"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
  phone: '<svg viewBox="0 0 100 100" aria-hidden="true"><path fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" d="M59.308,74.811c2.274,1.191,4.92,0.539,6.6-1.287l4.688-5.097c0.91-0.989,2.2-1.193,3.454-0.79l17.509,5.627c1.28,0.411,2.49,1.529,2.352,2.947l-1.364,14.007c-0.216,2.22-1.351,3.867-3.688,3.694C44.673,90.632,9.354,55.31,6.087,11.139c-0.11-1.486,0.666-2.805,2.025-3.333c1.333-0.517,13.376-1.496,15.676-1.72c1.418-0.138,2.536,1.073,2.948,2.352l5.627,17.509c0.214,0.667,0.252,1.34,0.105,1.951c-0.796,3.302-10.495,6.651-7.279,12.791c3.793,7.24,8.626,13.966,14.39,19.73C45.34,66.182,52.072,71.02,59.308,74.811z"/></svg>',
  phonePlus: '<svg viewBox="0 0 100 100" aria-hidden="true"><path fill="currentColor" stroke="none" d="m33.812 9.7148c3.8086-2.1992 8.6797-0.89062 10.879 2.918l5.5117 9.5508c1.7148 2.9688 1.3359 6.6992-0.9375 9.2656l-3.2109 3.6172c-1.8711 2.1094-2.1797 5.1836-0.76953 7.625l7.5391 13.055c1.4102 2.4453 4.2266 3.7109 6.9883 3.1445l4.7383-0.96875c3.3555-0.6875 6.7773 0.85156 8.4922 3.8203l5.5156 9.5508c2.1992 3.8086 0.89453 8.6797-2.9141 10.879l-7.1016 4.0938c-6.9375 4.0078-15.633 3.2891-21.82-1.8008-15.613-12.844-26.039-30.906-29.359-50.848-1.3125-7.9023 2.4102-15.793 9.3516-19.801zm5.4648 6.0391c-0.47266-0.81641-1.5234-1.0977-2.3398-0.625l-7.0977 4.1016c-4.6836 2.7031-7.1992 8.0273-6.3125 13.359 3.0703 18.449 12.723 35.164 27.164 47.051 4.1758 3.4336 10.043 3.918 14.727 1.2148l7.1016-4.0977c0.82031-0.47266 1.1016-1.5234 0.62891-2.3398l-5.5195-9.5508c-0.36719-0.63672-1.1016-0.96875-1.8242-0.82422l-4.7383 0.97266c-5.3984 1.1055-10.898-1.3711-13.656-6.1445l-7.5391-13.055c-2.7539-4.7734-2.1484-10.773 1.5078-14.898l3.2109-3.6172c0.48828-0.55078 0.57031-1.3555 0.19922-1.9922z"/><path fill="currentColor" stroke="none" d="m69.793 45.832v-20.832c0-1.7266 1.3984-3.125 3.125-3.125 1.7227 0 3.125 1.3984 3.125 3.125v20.832c0 1.7266-1.4023 3.125-3.125 3.125-1.7266 0-3.125-1.3984-3.125-3.125z"/><path fill="currentColor" stroke="none" d="m83.332 38.543h-20.832c-1.7266 0-3.125-1.4023-3.125-3.125 0-1.7266 1.3984-3.125 3.125-3.125h20.832c1.7266 0 3.125 1.3984 3.125 3.125 0 1.7227-1.3984 3.125-3.125 3.125z"/></svg>',
  video: '<svg viewBox="0 0 100 100" aria-hidden="true"><path fill="currentColor" stroke="none" d="m65.625 33.332c0-2.875-2.332-5.207-5.207-5.207h-39.586c-2.875 0-5.207 2.332-5.207 5.207v33.336c0 2.875 2.332 5.207 5.207 5.207h39.586c2.875 0 5.207-2.332 5.207-5.207v-5.1289c0-3.5312 3.4102-5.9688 6.6719-5l0.65234 0.23828 11.426 5.0781v-23.711l-11.426 5.0781c-3.4453 1.5273-7.3242-0.99219-7.3242-4.7617zm6.25 3.5234 14.355-6.3789c0.96484-0.42969 2.082-0.33984 2.9688 0.23438 0.89062 0.57812 1.4258 1.5664 1.4258 2.6211v33.336c0 1.0547-0.53516 2.043-1.4258 2.6172-0.88672 0.57812-2.0039 0.66797-2.9688 0.23828l-14.355-6.3789v3.5234c0 6.3281-5.1289 11.457-11.457 11.457h-39.586c-6.3281 0-11.457-5.1289-11.457-11.457v-33.336c0-6.3281 5.1289-11.457 11.457-11.457h39.586c6.3281 0 11.457 5.1289 11.457 11.457z"/><path fill="currentColor" stroke="none" d="m33.332 40.625h-8.332c-1.7266 0-3.125-1.3984-3.125-3.125s1.3984-3.125 3.125-3.125h8.332c1.7266 0 3.125 1.3984 3.125 3.125s-1.3984 3.125-3.125 3.125z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M13 14h4v4h-4z"/></svg>',
  keypad: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h.01M12 5h.01M18 5h.01M6 12h.01M12 12h.01M18 12h.01M6 19h.01M12 19h.01M18 19h.01"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>',
  callOut: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 18 6M12 6h6v6"/></svg>',
  callIn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 6-10 10M8 10v6h6"/></svg>',
  chats: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A3.5 3.5 0 0 1 16.5 18H8l-4 3v-4.5A3.5 3.5 0 0 1 2 13.5v-6A3.5 3.5 0 0 1 5.5 4h11A3.5 3.5 0 0 1 20 7.5v7Z"/></svg>',
  updates: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 3v9h9"/></svg>',
  communities: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-1a6 6 0 0 1 12 0v1"/><path d="M17 11a3 3 0 1 0-2.4-4.8M15.5 14.2A5.5 5.5 0 0 1 22 19.6V21h-4"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>',
  emoji: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01M8 14c.9 1.4 2.2 2.1 4 2.1s3.1-.7 4-2.1"/></svg>',
  attach: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 11.5-8.6 8.6a5 5 0 0 1-7.1-7.1l9.3-9.3a3.2 3.2 0 0 1 4.5 4.5l-9.1 9.1a1.5 1.5 0 0 1-2.1-2.1l8.4-8.4"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
});

const PHONE_TAB_HEADERS = {
  chats: { title: 'WhatsApp', search: false, camera: true, searchLabel: 'Sohbetlerde ara' },
  updates: { title: 'Guncellemeler', search: true, camera: false, searchLabel: 'Guncellemelerde ara' },
  communities: { title: 'Topluluklar', search: false, camera: false, searchLabel: 'Topluluklarda ara' },
  calls: { title: 'Aramalar', search: true, camera: false, searchLabel: 'Aramalarda ara' },
};

const DEFAULT_RECENT_UPDATES = [
  { title: 'Aile Grubu', meta: 'Bugun 12:40', initials: 'AG' },
  { title: 'Destek Ekibi', meta: 'Bugun 09:18', initials: 'DE' },
];

const DEFAULT_RECENT_CALLS = [
  { name: 'Ayse Eren', meta: 'bugun 11:48', direction: 'missed', type: 'voice', initials: 'AE' },
  { name: 'Destek Ekibi', meta: 'dun 20:12', direction: 'outgoing', type: 'video', initials: 'DE' },
  { name: 'Aile Grubu', meta: 'sali 18:05', direction: 'incoming', type: 'voice', initials: 'AG' },
  { name: 'Ece Yildiz', meta: 'pazartesi 09:31', direction: 'incoming', type: 'video', initials: 'EY' },
];

const CALL_DIRECTION_META = {
  missed: { label: 'Cevapsiz', icon: 'callOut', className: '', rowClassName: 'is-missed' },
  outgoing: { label: 'Giden', icon: 'callOut', className: 'is-outgoing', rowClassName: '' },
  incoming: { label: 'Gelen', icon: 'callIn', className: 'is-incoming', rowClassName: '' },
};

const CALL_TYPE_META = {
  voice: { label: 'sesli arama', icon: 'phone' },
  video: { label: 'video aramasi', icon: 'video' },
};

const CALL_AVATAR_TONES = ['', 'teal', 'blue', 'purple'];

const shellState = {
  activeTab: 'chats',
  activeChatFilter: 'all',
  view: 'home',
};

let shellStateListenerBound = false;

function renderPhoneIcon(name) {
  return PHONE_ICON_SVG[name] || PHONE_ICON_SVG.search;
}

function syncPhoneIcons() {
  document.querySelectorAll('[data-phone-icon]').forEach((icon) => {
    const name = icon.dataset.phoneIcon;
    icon.classList.add('wa-phone-icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = renderPhoneIcon(name);
  });
}

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
    chatList: $('homeChatList'),
    messageFab: $('phoneMessageFab'),
    statusTitle: $('phoneStatusTitle'),
    statusMeta: $('phoneStatusMeta'),
    statusNote: $('phoneStatusNote'),
    recentUpdatesList: $('phoneRecentUpdatesList'),
    channelsTitle: $('phoneChannelsTitle'),
    channelsDescription: $('phoneChannelsDescription'),
    channelDiscover: $('phoneChannelDiscoverBtn'),
    channelCreate: $('phoneChannelCreateBtn'),
    communitiesTitle: $('phoneCommunitiesTitle'),
    communitiesDescription: $('phoneCommunitiesDescription'),
    communitiesLinkLabel: $('phoneCommunitiesLinkLabel'),
    communitiesCta: $('phoneCommunitiesCreateBtn'),
    recentCallsList: $('phoneRecentCallsList'),
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
  if (searchButton) {
    searchButton.hidden = !header.search;
    searchButton.setAttribute('aria-label', header.searchLabel);
  }
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
    if (options.focus) home.querySelector('[data-phone-open-chat].is-active, [data-phone-open-chat]')?.focus();
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

function getChatTime(messages) {
  const lastMessage = getLastMessage(messages);
  return cleanText(lastMessage?.time, cleanText($('statusTime')?.textContent, '12:00'));
}

function syncAvatar(avatarEl, group, title) {
  if (!avatarEl) return;
  const avatarUrl = cleanText(group.avatarDataUrl || group.photoUrl, '');
  avatarEl.classList.toggle('has-image', Boolean(avatarUrl));
  avatarEl.style.backgroundImage = avatarUrl ? `url("${avatarUrl.replace(/["\r\n\\]/g, '')}")` : '';
  avatarEl.textContent = avatarUrl ? '' : getInitials(title);
}

function createChatRow(conversation, options = {}) {
  const button = document.createElement('button');
  const isActive = Boolean(options.isActive);
  const title = cleanText(conversation.title, 'Grup');
  const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
  button.className = 'phone-chat-entry';
  button.type = 'button';
  button.dataset.phoneOpenChat = '';
  button.dataset.conversationId = conversation.id;
  button.classList.toggle('is-active', isActive);
  button.setAttribute('aria-label', `${title} sohbetini ac`);

  const avatar = document.createElement('span');
  avatar.className = 'phone-chat-entry-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  if (options.withLegacyIds) avatar.id = 'homeChatAvatar';

  const copy = document.createElement('span');
  copy.className = 'phone-chat-entry-copy';

  const topline = document.createElement('span');
  topline.className = 'phone-chat-entry-topline';

  const titleEl = document.createElement('span');
  titleEl.className = 'phone-chat-entry-title';
  titleEl.textContent = title;
  if (options.withLegacyIds) titleEl.id = 'homeChatTitle';

  const timeEl = document.createElement('span');
  timeEl.className = 'phone-chat-entry-time';
  timeEl.textContent = getChatTime(messages);
  if (options.withLegacyIds) timeEl.id = 'homeChatTime';

  const meta = document.createElement('span');
  meta.className = 'phone-chat-entry-meta';
  meta.textContent = getChatPreview(conversation, messages);
  if (options.withLegacyIds) meta.id = 'homeChatSubtitle';

  topline.append(titleEl, timeEl);
  copy.append(topline, meta);
  button.append(avatar, copy);
  syncAvatar(avatar, conversation, title);
  return button;
}

function syncHomeChatSummary() {
  const { chatList } = getShellElements();
  if (!chatList) return;

  const conversations = state.ensureConversations();
  const items = conversations.items.length ? conversations.items : [state.getActiveConversation()];
  chatList.replaceChildren();
  items.forEach((conversation, index) => {
    chatList.appendChild(createChatRow(conversation, {
      isActive: conversation.id === conversations.activeId,
      withLegacyIds: index === 0,
    }));
  });
}

function createRecentUpdateRow(update) {
  const title = cleanText(update?.title, 'Guncelleme');
  const meta = cleanText(update?.meta, 'Bugun');
  const initials = cleanText(update?.initials, getInitials(title)).slice(0, 3).toLocaleUpperCase('tr-TR');
  const button = document.createElement('button');
  button.className = 'phone-status-row';
  button.type = 'button';
  button.setAttribute('aria-label', `${title} durumunu ac`);

  const avatar = document.createElement('span');
  avatar.className = 'phone-status-avatar phone-status-ring';
  avatar.setAttribute('aria-hidden', 'true');
  const avatarText = document.createElement('span');
  avatarText.textContent = initials || getInitials(title);
  avatar.appendChild(avatarText);

  const copy = document.createElement('span');
  copy.className = 'phone-status-copy';
  const titleEl = document.createElement('span');
  titleEl.className = 'phone-status-title';
  titleEl.textContent = title;
  const metaEl = document.createElement('span');
  metaEl.className = 'phone-status-meta';
  metaEl.textContent = meta;

  copy.append(titleEl, metaEl);
  button.append(avatar, copy);
  return button;
}

function getSafeCallDirection(direction) {
  return CALL_DIRECTION_META[direction] ? direction : 'incoming';
}

function getSafeCallType(type) {
  return CALL_TYPE_META[type] ? type : 'voice';
}

function createCallRow(call, index = 0) {
  const name = cleanText(call?.name, 'Arama');
  const meta = cleanText(call?.meta, 'bugun');
  const directionKey = getSafeCallDirection(call?.direction);
  const typeKey = getSafeCallType(call?.type);
  const direction = CALL_DIRECTION_META[directionKey];
  const type = CALL_TYPE_META[typeKey];
  const initials = cleanText(call?.initials, getInitials(name)).slice(0, 3).toLocaleUpperCase('tr-TR');
  const tone = CALL_AVATAR_TONES[index % CALL_AVATAR_TONES.length];

  const button = document.createElement('button');
  button.className = 'phone-call-row';
  button.type = 'button';
  if (direction.rowClassName) button.classList.add(direction.rowClassName);
  button.setAttribute('aria-label', `${name} ${direction.label.toLocaleLowerCase('tr-TR')} ${type.label}`);

  const avatar = document.createElement('span');
  avatar.className = 'phone-call-avatar';
  if (tone) avatar.classList.add(`phone-call-avatar-${tone}`);
  avatar.textContent = initials || getInitials(name);

  const copy = document.createElement('span');
  copy.className = 'phone-call-copy';

  const nameEl = document.createElement('span');
  nameEl.className = 'phone-call-name';
  nameEl.textContent = name;

  const metaEl = document.createElement('span');
  metaEl.className = 'phone-call-meta';

  const directionIcon = document.createElement('span');
  directionIcon.className = 'phone-call-direction wa-phone-icon';
  if (direction.className) directionIcon.classList.add(direction.className);
  directionIcon.dataset.phoneIcon = direction.icon;
  directionIcon.setAttribute('aria-hidden', 'true');

  const metaText = document.createElement('span');
  metaText.textContent = `${direction.label}, ${meta}`;

  metaEl.append(directionIcon, metaText);
  copy.append(nameEl, metaEl);

  const action = document.createElement('span');
  action.className = 'phone-call-row-action';
  action.setAttribute('aria-hidden', 'true');
  const actionIcon = document.createElement('span');
  actionIcon.className = 'wa-phone-icon';
  actionIcon.dataset.phoneIcon = type.icon;
  actionIcon.setAttribute('aria-hidden', 'true');
  action.appendChild(actionIcon);

  button.append(avatar, copy, action);
  return button;
}

function syncPhoneShellContent() {
  const content = state.get('phoneShellContent') || {};
  const updates = content.updates || {};
  const communities = content.communities || {};
  const calls = content.calls || {};
  const {
    statusTitle,
    statusMeta,
    statusNote,
    recentUpdatesList,
    channelsTitle,
    channelsDescription,
    channelDiscover,
    channelCreate,
    communitiesTitle,
    communitiesDescription,
    communitiesLinkLabel,
    communitiesCta,
    recentCallsList,
  } = getShellElements();

  if (statusTitle) statusTitle.textContent = cleanText(updates.status?.title, 'Durumum');
  if (statusMeta) statusMeta.textContent = cleanText(updates.status?.meta, 'Durum guncellemesi eklemek icin dokunun');
  if (statusNote) statusNote.textContent = cleanText(updates.status?.note, 'Durum guncellemeleriniz 24 saat sonra kaybolur.');
  if (recentUpdatesList) {
    const recent = Array.isArray(updates.recent) ? updates.recent : [];
    const rows = recent.length ? recent : DEFAULT_RECENT_UPDATES;
    recentUpdatesList.replaceChildren(...rows.slice(0, 2).map(createRecentUpdateRow));
  }
  if (channelsTitle) channelsTitle.textContent = cleanText(updates.channels?.title, 'Kanallar');
  if (channelsDescription) channelsDescription.textContent = cleanText(updates.channels?.description, 'Ilgilendiginiz konulardan haber almak icin kanallari takip edin.');
  if (channelDiscover) channelDiscover.textContent = cleanText(updates.channels?.discoverLabel, 'Kesfet');
  if (channelCreate) channelCreate.textContent = cleanText(updates.channels?.createLabel, 'Kanal olustur');

  if (communitiesTitle) communitiesTitle.textContent = cleanText(communities.title, 'Topluluklar sayesinde baglantida kalin');
  if (communitiesDescription) communitiesDescription.textContent = cleanText(communities.description, 'Ilgili gruplari bir araya getirin, duyurulari kolayca paylasin ve herkesin ayni yerde kalmasini saglayin.');
  if (communitiesLinkLabel) communitiesLinkLabel.textContent = cleanText(communities.linkLabel, 'Ornek topluluklari gor');
  if (communitiesCta) communitiesCta.textContent = cleanText(communities.ctaLabel, 'Toplulugunuzu olusturun');

  if (recentCallsList) {
    const items = Array.isArray(calls.items) ? calls.items : [];
    const rows = items.length ? items : DEFAULT_RECENT_CALLS;
    recentCallsList.replaceChildren(...rows.slice(0, 4).map(createCallRow));
    syncPhoneIcons();
  }
}

function shouldSyncHomeChatSummary(path) {
  return (
    !path ||
    path === 'messages' ||
    path === 'messageSeq' ||
    path === 'conversations' ||
    path.startsWith('conversations.') ||
    path.startsWith('group.') ||
    path === 'settings.statusTimeOverride'
  );
}

function shouldSyncPhoneShellContent(path) {
  return !path || path.startsWith('phoneShellContent');
}

function bindPhoneShellStateListener() {
  if (shellStateListenerBound) return;
  state.subscribe((path) => {
    if (shouldSyncHomeChatSummary(path)) syncHomeChatSummary();
    if (shouldSyncPhoneShellContent(path)) syncPhoneShellContent();
  });
  shellStateListenerBound = true;
}

function bindPhoneShellEvents() {
  const { phone, backButton, tabButtons, chatFilterButtons } = getShellElements();
  if (!phone || phone.dataset.phoneShellBound === 'true') return;
  phone.dataset.phoneShellBound = 'true';

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => setActivePhoneTab(button.dataset.phoneTab));
  });

  phone.addEventListener('click', (event) => {
    const button = event.target.closest('[data-phone-open-chat]');
    if (!button || !phone.contains(button)) return;
    const conversation = state.selectConversation(button.dataset.conversationId);
    if (!conversation) return;
    syncHeader();
    rebuildChat();
    syncHomeChatSummary();
    showPhoneChatDetail({ focus: true });
  });

  chatFilterButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveChatFilter(button.dataset.phoneChatFilter));
  });

  if (backButton) {
    backButton.addEventListener('click', () => showPhoneHome({ focus: true }));
  }
}

function handleConversationCreated(conversation) {
  if (!conversation) return;
  setActivePhoneTab('chats');
  syncHeader();
  rebuildChat();
  syncHomeChatSummary();
  showPhoneChatDetail({ focus: true });
}

export function initPhoneShell() {
  syncPhoneIcons();
  bindPhoneShellEvents();
  bindPhoneShellStateListener();
  initPhoneHomeEditors({
    syncIcons: syncPhoneIcons,
    onConversationCreated: handleConversationCreated,
  });
  syncHomeChatSummary();
  syncPhoneShellContent();
  setActivePhoneTab(shellState.activeTab);
  setActiveChatFilter(shellState.activeChatFilter);
  showPhoneHome();
}
