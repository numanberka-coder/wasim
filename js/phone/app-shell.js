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
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"/></svg>',
  camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17.5q1.875 0 3.188-1.312T16.5 13t-1.312-3.187T12 8.5T8.813 9.813T7.5 13t1.313 3.188T12 17.5m0-2q-1.05 0-1.775-.725T9.5 13t.725-1.775T12 10.5t1.775.725T14.5 13t-.725 1.775T12 15.5M4 21q-.825 0-1.412-.587T2 19V7q0-.825.588-1.412T4 5h3.15L8.4 3.65q.275-.3.663-.475T9.875 3h4.25q.425 0 .813.175t.662.475L16.85 5H20q.825 0 1.413.588T22 7v12q0 .825-.587 1.413T20 21zm0-2h16V7h-4.05l-1.825-2h-4.25L8.05 7H4zm8-6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20q-.825 0-1.412-.587T10 18t.588-1.412T12 16t1.413.588T14 18t-.587 1.413T12 20m0-6q-.825 0-1.412-.587T10 12t.588-1.412T12 10t1.413.588T14 12t-.587 1.413T12 14m0-6q-.825 0-1.412-.587T10 6t.588-1.412T12 4t1.413.588T14 6t-.587 1.413T12 8"/></svg>',
  chatPlus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 18l-2.3 2.3q-.475.475-1.088.213T2 19.575V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18zm5-7v2q0 .425.288.713T12 14t.713-.288T13 13v-2h2q.425 0 .713-.288T16 10t-.288-.712T15 9h-2V7q0-.425-.288-.712T12 6t-.712.288T11 7v2H9q-.425 0-.712.288T8 10t.288.713T9 11z"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21q-.425 0-.712-.288T3 20v-2.425q0-.4.15-.763t.425-.637L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.437.65T21 6.4q0 .4-.138.763t-.437.662l-12.6 12.6q-.275.275-.638.425t-.762.15zM17.6 7.8L19 6.4L17.6 5l-1.4 1.4z"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.6 12L8.7 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.95 21q-3.125 0-6.175-1.362t-5.55-3.863t-3.862-5.55T3 4.05q0-.45.3-.75t.75-.3H8.1q.35 0 .625.238t.325.562l.65 3.5q.05.4-.025.675T9.4 8.45L6.975 10.9q.5.925 1.187 1.787t1.513 1.663q.775.775 1.625 1.438T13.1 17l2.35-2.35q.225-.225.588-.337t.712-.063l3.45.7q.35.1.575.363T21 15.9v4.05q0 .45-.3.75t-.75.3"/></svg>',
  phonePlus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.95 21q-3.125 0-6.175-1.362t-5.55-3.863t-3.862-5.55T3 4.05q0-.45.3-.75t.75-.3H8.1q.35 0 .625.238t.325.562l.65 3.5q.05.4-.025.675T9.4 8.45L6.975 10.9q.5.925 1.187 1.787t1.513 1.663q.775.775 1.625 1.438T13.1 17l2.35-2.35q.225-.225.588-.337t.712-.063l3.45.7q.35.1.575.363T21 15.9v4.05q0 .45-.3.75t-.75.3M16 8h-2q-.425 0-.712-.288T13 7t.288-.712T14 6h2V4q0-.425.288-.712T17 3t.713.288T18 4v2h2q.425 0 .713.288T21 7t-.288.713T20 8h-2v2q0 .425-.288.713T17 11t-.712-.288T16 10z"/></svg>',
  video: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h12q.825 0 1.413.588T18 6v4.5l3.15-3.15q.25-.25.55-.125t.3.475v8.6q0 .35-.3.475t-.55-.125L18 13.5V18q0 .825-.587 1.413T16 20z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V3q0-.425.288-.712T7 2t.713.288T8 3v1h8V3q0-.425.288-.712T17 2t.713.288T18 3v1h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5zM5 8h14V6H5zm0 0V6zm7 6q-.425 0-.712-.288T11 13t.288-.712T12 12t.713.288T13 13t-.288.713T12 14m-4.712-.288Q7 13.426 7 13t.288-.712T8 12t.713.288T9 13t-.288.713T8 14t-.712-.288M16 14q-.425 0-.712-.288T15 13t.288-.712T16 12t.713.288T17 13t-.288.713T16 14m-4 4q-.425 0-.712-.288T11 17t.288-.712T12 16t.713.288T13 17t-.288.713T12 18m-4.712-.288Q7 17.426 7 17t.288-.712T8 16t.713.288T9 17t-.288.713T8 18t-.712-.288M16 18q-.425 0-.712-.288T15 17t.288-.712T16 16t.713.288T17 17t-.288.713T16 18"/></svg>',
  keypad: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 23q-.825 0-1.412-.587T10 21t.588-1.412T12 19t1.413.588T14 21t-.587 1.413T12 23M6 5q-.825 0-1.412-.587T4 3t.588-1.412T6 1t1.413.588T8 3t-.587 1.413T6 5m0 6q-.825 0-1.412-.587T4 9t.588-1.412T6 7t1.413.588T8 9t-.587 1.413T6 11m0 6q-.825 0-1.412-.587T4 15t.588-1.412T6 13t1.413.588T8 15t-.587 1.413T6 17M18 5q-.825 0-1.412-.587T16 3t.588-1.412T18 1t1.413.588T20 3t-.587 1.413T18 5m-6 12q-.825 0-1.412-.587T10 15t.588-1.412T12 13t1.413.588T14 15t-.587 1.413T12 17m6 0q-.825 0-1.412-.587T16 15t.588-1.412T18 13t1.413.588T20 15t-.587 1.413T18 17m0-6q-.825 0-1.412-.587T16 9t.588-1.412T18 7t1.413.588T20 9t-.587 1.413T18 11m-6 0q-.825 0-1.412-.587T10 9t.588-1.412T12 7t1.413.588T14 9t-.587 1.413T12 11m0-6q-.825 0-1.412-.587T10 3t.588-1.412T12 1t1.413.588T14 3t-.587 1.413T12 5"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8.85 16.825l3.15-1.9l3.15 1.925l-.825-3.6l2.775-2.4l-3.65-.325l-1.45-3.4l-1.45 3.375l-3.65.325l2.775 2.425zm3.15.45l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15zm0-5.025"/></svg>',
  callOut: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 8.4L6.1 19.3q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7L15.6 7H10q-.425 0-.712-.288T9 6t.288-.712T10 5h8q.425 0 .713.288T19 6v8q0 .425-.288.713T18 15t-.712-.288T17 14z"/></svg>',
  callIn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 20q-.425 0-.713-.288T5 19v-8q0-.425.288-.713T6 10q.425 0 .713.288T7 11v5.6L17.925 5.675Q18.2 5.4 18.6 5.4t.7.3q.275.275.275.7t-.275.7L8.4 18H14q.425 0 .713.288T15 19q0 .425-.288.713T14 20H6Z"/></svg>',
  chats: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 18l-2.3 2.3q-.475.475-1.088.213T2 19.575V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18zm-.85-2H20V4H4v13.125zM4 16V4zm3-2h6q.425 0 .713-.288T14 13t-.288-.712T13 12H7q-.425 0-.712.288T6 13t.288.713T7 14m0-3h10q.425 0 .713-.288T18 10t-.288-.712T17 9H7q-.425 0-.712.288T6 10t.288.713T7 11m0-3h10q.425 0 .713-.288T18 7t-.288-.712T17 6H7q-.425 0-.712.288T6 7t.288.713T7 8"/></svg>',
  updates: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.15"/><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M4.95 18.35A9.45 9.45 0 0 1 3.1 9.65A9.45 9.45 0 0 1 9.35 3.1"/><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M14.65 3.1a9.45 9.45 0 0 1 6.25 6.55a9.45 9.45 0 0 1-1.85 8.7"/><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M7.35 20.45A9.45 9.45 0 0 0 12 21.5a9.45 9.45 0 0 0 4.65-1.05"/><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5.8 17.45 3.45 21.15 7.85 19.55"/></svg>',
  communities: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 18q-.425 0-.712-.288T0 17v-.575q0-1.075 1.1-1.75T4 14q.325 0 .625.013t.575.062q-.35.525-.525 1.1t-.175 1.2V18zm6 0q-.425 0-.712-.288T6 17v-.625q0-.8.438-1.463t1.237-1.162T9.588 13T12 12.75q1.325 0 2.438.25t1.912.75t1.225 1.163t.425 1.462V17q0 .425-.287.713T17 18zm12.5 0v-1.625q0-.65-.162-1.225t-.488-1.075q.275-.05.563-.062T20 14q1.8 0 2.9.663t1.1 1.762V17q0 .425-.288.713T23 18zM8.125 16H15.9q-.25-.5-1.388-.875T12 14.75t-2.512.375T8.125 16M4 13q-.825 0-1.412-.587T2 11q0-.85.588-1.425T4 9q.85 0 1.425.575T6 11q0 .825-.575 1.413T4 13m16 0q-.825 0-1.412-.587T18 11q0-.85.588-1.425T20 9q.85 0 1.425.575T22 11q0 .825-.575 1.413T20 13m-8-1q-1.25 0-2.125-.875T9 9q0-1.275.875-2.137T12 6q1.275 0 2.138.863T15 9q0 1.25-.862 2.125T12 12m0-2q.425 0 .713-.288T13 9t-.288-.712T12 8t-.712.288T11 9t.288.713T12 10m0-1"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7.825 13l4.9 4.9q.3.3.288.7t-.313.7q-.3.275-.7.288t-.7-.288l-6.6-6.6q-.15-.15-.213-.325T4.426 12t.063-.375t.212-.325l6.6-6.6q.275-.275.688-.275t.712.275q.3.3.3.713t-.3.712L7.825 11H19q.425 0 .713.288T20 12t-.288.713T19 13z"/></svg>',
  emoji: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 11q.625 0 1.063-.437T17 9.5t-.437-1.062T15.5 8t-1.062.438T14 9.5t.438 1.063T15.5 11m-7 0q.625 0 1.063-.437T10 9.5t-.437-1.062T8.5 8t-1.062.438T7 9.5t.438 1.063T8.5 11m-.4 10.213q-1.825-.788-3.175-2.138T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22t-3.9-.788M12 17.5q1.45 0 2.675-.7t1.975-1.9q.15-.3-.025-.6T16.1 14H7.9q-.35 0-.525.3t-.025.6q.75 1.2 1.988 1.9t2.662.7"/></svg>',
  attach: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 15.75q0 2.6-1.825 4.425T11.75 22t-4.425-1.825T5.5 15.75V6.5q0-1.875 1.313-3.187T10 2t3.188 1.313T14.5 6.5v8.75q0 1.15-.8 1.95t-1.95.8t-1.95-.8t-.8-1.95V7q0-.425.288-.712T10 6t.713.288T11 7v8.25q0 .325.213.538t.537.212t.538-.213t.212-.537V6.5q-.025-1.05-.737-1.775T10 4t-1.775.725T7.5 6.5v9.25q-.025 1.775 1.225 3.013T11.75 20q1.75 0 2.975-1.237T16 15.75V7q0-.425.288-.712T17 6t.713.288T18 7z"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.875 13.125Q9 12.25 9 11V5q0-1.25.875-2.125T12 2t2.125.875T15 5v6q0 1.25-.875 2.125T12 14t-2.125-.875M11 20v-2.075q-2.3-.325-3.937-1.95t-1.988-3.95q-.05-.425.225-.725T6 11t.713.288T7.1 12q.35 1.75 1.738 2.875T12 16q1.8 0 3.175-1.137T16.9 12q.1-.425.388-.712T18 11t.7.3t.225.725q-.35 2.275-1.975 3.925T13 17.925V20q0 .425-.288.713T12 21t-.712-.288T11 20"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"/></svg>',
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
