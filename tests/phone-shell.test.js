import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CHAT_FILTERS,
  PHONE_ICON_SVG,
  getPhoneShellState,
  initPhoneShell,
  setActiveChatFilter,
  setActivePhoneTab,
  showPhoneChatDetail,
  showPhoneHome,
} from '../js/phone/app-shell.js';
import {
  closePhoneEditorSheet,
  isPhoneEditorSheetOpen,
  openPhoneEditorSheet,
} from '../js/phone/home-editors.js';
import { state } from '../js/state.js';
import { initMobile, registerMobileCallback } from '../js/ui/mobile.js';

function mountIndexDocument() {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  const doc = new DOMParser().parseFromString(html, 'text/html');
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

function loadPhoneShellCss() {
  return readFileSync(join(process.cwd(), 'css', 'phone-shell.css'), 'utf8');
}

function loadPhoneCss() {
  return readFileSync(join(process.cwd(), 'css', 'phone.css'), 'utf8');
}

function loadResponsiveCss() {
  return readFileSync(join(process.cwd(), 'css', 'responsive.css'), 'utf8');
}

function setViewportWidth(width) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
}

function expectMenuOpenFrom(trigger) {
  const menu = document.getElementById('headerDropdown');
  const backdrop = document.getElementById('mobileOverlayBackdrop');

  trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  expect(document.body.classList.contains('mobile-menu-open')).toBe(true);
  expect(menu?.classList.contains('is-open')).toBe(true);
  expect(backdrop?.classList.contains('is-open')).toBe(true);
  expect(backdrop?.classList.contains('is-menu-backdrop')).toBe(true);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');

  document.getElementById('headerMenuCloseBtn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  expect(document.body.classList.contains('mobile-menu-open')).toBe(false);
  expect(menu?.classList.contains('is-open')).toBe(false);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
}

describe('Faz 41 phone app shell', () => {
  beforeEach(() => {
    state.reset();
    setViewportWidth(1024);
    mountIndexDocument();
  });

  it('starts on the home shell with a machine-readable bottom nav state', () => {
    initPhoneShell();

    const phone = document.querySelector('.phone');
    const home = document.getElementById('phoneHomeShell');
    const detail = document.getElementById('phoneChatDetail');
    const tabs = [...document.querySelectorAll('[data-phone-tab]')];

    expect(phone?.dataset.phoneView).toBe('home');
    expect(home?.getAttribute('aria-hidden')).toBeNull();
    expect(detail?.getAttribute('aria-hidden')).toBe('true');
    expect(tabs.map((tab) => tab.dataset.phoneTab)).toEqual(['chats', 'updates', 'communities', 'calls']);
    expect(document.querySelector('[data-phone-tab="chats"]')?.getAttribute('aria-selected')).toBe('true');
    expect(document.querySelector('[data-phone-tab-panel="chats"]')?.hidden).toBe(false);
  });

  it('switches tabs without exposing chat composer controls in the home shell', () => {
    initPhoneShell();
    const activeTab = setActivePhoneTab('calls');

    expect(activeTab).toBe('calls');
    expect(document.getElementById('phoneHomeShell')?.dataset.activeTab).toBe('calls');
    expect(document.querySelector('[data-phone-tab="calls"]')?.getAttribute('aria-selected')).toBe('true');
    expect(document.querySelector('[data-phone-tab-panel="calls"]')?.hidden).toBe(false);
    expect(document.querySelector('#phoneHomeShell .chat-input')).toBeNull();
    expect(document.querySelector('#phoneHomeShell #attachBtn')).toBeNull();
    expect(document.querySelector('#phoneHomeShell #cameraBtn')).toBeNull();
    expect(document.querySelector('#phoneHomeShell #mainActionBtn')).toBeNull();
  });

  it('renders the Faz 42 chats hierarchy with search, filters, chat row and FAB', () => {
    initPhoneShell();

    const search = document.querySelector('.phone-chat-search');
    const filters = [...document.querySelectorAll('[data-phone-chat-filter]')];
    const chatRow = document.querySelector('[data-phone-open-chat]');
    const fab = document.getElementById('phoneMessageFab');

    expect(document.getElementById('phoneShellCameraBtn')).not.toBeNull();
    expect(search?.textContent).toContain("Meta AI'ya veya Ara'ya sorun");
    expect(filters.map((filter) => filter.dataset.phoneChatFilter)).toEqual(CHAT_FILTERS);
    expect(filters.map((filter) => filter.textContent?.trim())).toEqual(['All', 'Unread', 'Groups']);
    expect(document.querySelector('[data-phone-chat-filter="all"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(chatRow?.querySelector('#homeChatTitle')).not.toBeNull();
    expect(fab?.closest('[data-phone-tab-panel="chats"]')).not.toBeNull();
  });

  it('switches chat filter chips with a stable machine-readable state', () => {
    initPhoneShell();

    const activeFilter = setActiveChatFilter('unread');

    expect(activeFilter).toBe('unread');
    expect(getPhoneShellState().activeChatFilter).toBe('unread');
    expect(document.getElementById('phoneTabChats')?.dataset.activeFilter).toBe('unread');
    expect(document.querySelector('[data-phone-chat-filter="unread"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('[data-phone-chat-filter="all"]')?.getAttribute('aria-pressed')).toBe('false');
    expect(setActiveChatFilter('unknown')).toBe('all');
  });

  it('renders the Faz 43 updates hierarchy with status, channels and double FAB', () => {
    initPhoneShell();

    const activeTab = setActivePhoneTab('updates');
    const updatesPanel = document.getElementById('phoneTabUpdates');
    const searchButton = document.getElementById('phoneShellSearchBtn');
    const cameraButton = document.getElementById('phoneShellCameraBtn');
    const statusRows = [...document.querySelectorAll('#phoneTabUpdates .phone-status-row')];

    expect(activeTab).toBe('updates');
    expect(document.getElementById('phoneHomeShell')?.dataset.activeTab).toBe('updates');
    expect(document.querySelector('.phone-home-title')?.textContent).toBe('Guncellemeler');
    expect(searchButton?.hidden).toBe(false);
    expect(searchButton?.getAttribute('aria-label')).toBe('Guncellemelerde ara');
    expect(cameraButton?.hidden).toBe(true);
    expect(updatesPanel?.hidden).toBe(false);
    expect(document.querySelector('[data-phone-tab="updates"]')?.getAttribute('aria-selected')).toBe('true');
    expect(statusRows).toHaveLength(3);
    expect(document.getElementById('phoneStatusMeta')?.textContent).toContain('Durum guncellemesi');
    expect(document.getElementById('phoneStatusNote')?.textContent).toContain('24 saat sonra');
    expect(document.querySelector('#phoneTabUpdates .phone-channels-section')?.textContent).toContain('Kanallar');
    expect(document.getElementById('phoneUpdatesEditFab')).not.toBeNull();
    expect(document.getElementById('phoneUpdatesCameraFab')).not.toBeNull();
  });

  it('renders the Faz 44 communities empty state with CTA and active nav state', () => {
    initPhoneShell();

    const activeTab = setActivePhoneTab('communities');
    const communitiesPanel = document.getElementById('phoneTabCommunities');
    const searchButton = document.getElementById('phoneShellSearchBtn');
    const cameraButton = document.getElementById('phoneShellCameraBtn');
    const illustration = document.querySelector('#phoneTabCommunities .phone-communities-illustration');
    const learnButton = document.querySelector('#phoneTabCommunities .phone-communities-link-button');
    const cta = document.getElementById('phoneCommunitiesCreateBtn');

    expect(activeTab).toBe('communities');
    expect(document.getElementById('phoneHomeShell')?.dataset.activeTab).toBe('communities');
    expect(document.querySelector('.phone-home-title')?.textContent).toBe('Topluluklar');
    expect(searchButton?.hidden).toBe(true);
    expect(cameraButton?.hidden).toBe(true);
    expect(communitiesPanel?.hidden).toBe(false);
    expect(document.querySelector('[data-phone-tab="communities"]')?.getAttribute('aria-selected')).toBe('true');
    expect(illustration).not.toBeNull();
    expect(document.getElementById('phoneCommunitiesTitle')?.textContent).toBe('Topluluklar sayesinde baglantida kalin');
    expect(document.getElementById('phoneCommunitiesDescription')?.textContent).toContain('Ilgili gruplari');
    expect(document.getElementById('phoneCommunitiesLinkLabel')?.textContent).toContain('Ornek topluluklari gor');
    expect(cta?.textContent).toBe('Toplulugunuzu olusturun');
    expect(learnButton).not.toBeNull();
    expect(cta?.closest('[data-phone-tab-panel="communities"]')).not.toBeNull();
  });

  it('renders the Faz 45 calls hierarchy with shortcuts, recent calls and FAB', () => {
    initPhoneShell();

    const activeTab = setActivePhoneTab('calls');
    const callsPanel = document.getElementById('phoneTabCalls');
    const searchButton = document.getElementById('phoneShellSearchBtn');
    const cameraButton = document.getElementById('phoneShellCameraBtn');
    const shortcuts = [...document.querySelectorAll('#phoneTabCalls .phone-call-shortcut')];
    const rows = [...document.querySelectorAll('#phoneTabCalls .phone-call-row')];
    const rowActions = [...document.querySelectorAll('#phoneTabCalls .phone-call-row-action')];
    const fab = document.getElementById('phoneCallFab');

    expect(activeTab).toBe('calls');
    expect(document.getElementById('phoneHomeShell')?.dataset.activeTab).toBe('calls');
    expect(document.querySelector('.phone-home-title')?.textContent).toBe('Aramalar');
    expect(searchButton?.hidden).toBe(false);
    expect(searchButton?.getAttribute('aria-label')).toBe('Aramalarda ara');
    expect(cameraButton?.hidden).toBe(true);
    expect(callsPanel?.hidden).toBe(false);
    expect(document.querySelector('[data-phone-tab="calls"]')?.getAttribute('aria-selected')).toBe('true');
    expect(document.getElementById('phoneCallsQuickTitle')?.textContent).toBe('Hizli aksiyonlar');
    expect(shortcuts.map((shortcut) => shortcut.textContent?.trim())).toEqual(['Ara', 'Planla', 'Tus takimi', 'Favoriler']);
    expect(document.getElementById('phoneRecentCallsTitle')?.textContent).toBe('Son aramalar');
    expect(rows).toHaveLength(4);
    expect(rows[0]?.classList.contains('is-missed')).toBe(true);
    expect(rows[0]?.textContent).toContain('Cevapsiz');
    expect(rows[1]?.textContent).toContain('Giden');
    expect(rows[2]?.textContent).toContain('Gelen');
    expect(rowActions).toHaveLength(4);
    expect(fab?.getAttribute('aria-label')).toBe('Yeni arama');
    expect(fab?.closest('[data-phone-tab-panel="calls"]')).not.toBeNull();
  });

  it('derives chat row content from group and latest message with safe fallbacks', () => {
    state.set('group.title', 'Aile Grubu');
    state.set('group.subtitle', '');
    state.set('messages', [{ id: 1, speaker: 'Me', text: 'Hazir', time: '13:05' }]);

    initPhoneShell();

    expect(document.getElementById('homeChatTitle')?.textContent).toBe('Aile Grubu');
    expect(document.getElementById('homeChatSubtitle')?.textContent).toBe('Sen: Hazir');
    expect(document.getElementById('homeChatTime')?.textContent).toBe('13:05');
    expect(document.getElementById('homeChatAvatar')?.textContent).toBe('AG');

    state.set('group.title', '');
    state.set('messages', []);

    expect(document.getElementById('homeChatTitle')?.textContent).toBe('Grup');
    expect(document.getElementById('homeChatSubtitle')?.textContent).toBe('Sohbet detayini ac');
  });

  it('opens chat detail and returns to the home shell', () => {
    initPhoneShell();

    document.querySelector('[data-phone-open-chat]')?.click();
    expect(getPhoneShellState().view).toBe('chat');
    expect(document.querySelector('.phone')?.dataset.phoneView).toBe('chat');
    expect(document.getElementById('phoneChatDetail')?.getAttribute('aria-hidden')).toBeNull();
    expect(document.querySelector('#phoneChatDetail .chat-input')).not.toBeNull();

    showPhoneHome();
    expect(getPhoneShellState().view).toBe('home');
    expect(document.querySelector('.phone')?.dataset.phoneView).toBe('home');
    expect(document.getElementById('phoneChatDetail')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('uses the same mobile menu root from home shell and chat detail triggers', () => {
    initPhoneShell();

    const shellTrigger = document.getElementById('phoneShellMenuBtn');
    const detailTrigger = document.getElementById('headerMenuBtn');
    const menu = document.getElementById('headerDropdown');

    expect(shellTrigger?.dataset.mobileMenuTrigger).toBe('');
    expect(detailTrigger?.dataset.mobileMenuTrigger).toBe('');
    expect(shellTrigger?.getAttribute('aria-controls')).toBe('headerDropdown');
    expect(detailTrigger?.getAttribute('aria-controls')).toBe('headerDropdown');
    setActivePhoneTab('updates');
    expect(document.getElementById('phoneShellMenuBtn')?.getAttribute('aria-controls')).toBe('headerDropdown');
    setActivePhoneTab('communities');
    expect(document.getElementById('phoneShellMenuBtn')?.getAttribute('aria-controls')).toBe('headerDropdown');
    setActivePhoneTab('calls');
    expect(document.getElementById('phoneShellMenuBtn')?.getAttribute('aria-controls')).toBe('headerDropdown');
    expect(menu?.querySelectorAll('[data-menu-root]')).toHaveLength(1);
  });

  it('opens the shared mobile sheet from every home tab and chat detail trigger', () => {
    setViewportWidth(390);
    initPhoneShell();
    initMobile();

    const shellTrigger = document.getElementById('phoneShellMenuBtn');
    const detailTrigger = document.getElementById('headerMenuBtn');

    expect(shellTrigger).not.toBeNull();
    expect(detailTrigger).not.toBeNull();

    ['chats', 'updates', 'communities', 'calls'].forEach((tab) => {
      showPhoneHome();
      setActivePhoneTab(tab);
      expectMenuOpenFrom(shellTrigger);
    });

    showPhoneChatDetail();
    expectMenuOpenFrom(detailTrigger);
  });

  it('keeps screenshot output available through the existing mobile sheet action', () => {
    setViewportWidth(390);
    initPhoneShell();
    initMobile();

    let screenshotCalls = 0;
    registerMobileCallback('takeScreenshot', () => {
      screenshotCalls += 1;
    });

    document.getElementById('phoneShellMenuBtn')?.click();
    document.querySelector('#headerDropdown [data-action="screenshot"]')?.click();

    expect(screenshotCalls).toBe(1);
    expect(document.getElementById('headerDropdown')?.classList.contains('is-open')).toBe(false);
  });

  it('opens, cancels and saves the Faz 48 phone editor bottom sheet', () => {
    initPhoneShell();

    document.getElementById('phoneUpdatesEditFab')?.click();

    expect(isPhoneEditorSheetOpen()).toBe(true);
    expect(document.body.classList.contains('phone-editor-open')).toBe(true);
    expect(document.getElementById('phoneEditorLayer')?.getAttribute('aria-hidden')).toBe('false');
    expect(document.getElementById('phoneEditorForm')?.getAttribute('role')).toBe('dialog');
    expect(document.getElementById('phoneEditorTitle')?.textContent).toBe('Durum bilgisini duzenle');
    expect(document.querySelectorAll('#phoneEditorFields input')).toHaveLength(2);

    document.getElementById('phoneEditorCancelBtn')?.click();
    expect(isPhoneEditorSheetOpen()).toBe(false);

    openPhoneEditorSheet('updatesStatus');
    const titleInput = document.querySelector('#phoneEditorFields input[name="title"]');
    const metaInput = document.querySelector('#phoneEditorFields input[name="meta"]');
    titleInput.value = 'Sahne hazir';
    metaInput.value = 'Bugun 18:30';
    document.getElementById('phoneEditorForm')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(isPhoneEditorSheetOpen()).toBe(false);
    expect(state.get('phoneShellContent.updates.status.title')).toBe('Sahne hazir');
    expect(document.getElementById('phoneStatusTitle')?.textContent).toBe('Sahne hazir');
    expect(document.getElementById('phoneStatusMeta')?.textContent).toBe('Bugun 18:30');
  });

  it('keeps editor validation, Escape close and mobile menu pointer contracts testable', () => {
    const phoneShellCss = loadPhoneShellCss();
    initPhoneShell();

    openPhoneEditorSheet('communitiesIntro');
    const titleInput = document.querySelector('#phoneEditorFields input[name="title"]');
    titleInput.value = '';
    document.getElementById('phoneEditorForm')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(isPhoneEditorSheetOpen()).toBe(true);
    expect(document.getElementById('phoneEditorError')?.hidden).toBe(false);
    expect(document.getElementById('phoneEditorError')?.textContent).toContain('Baslik');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(isPhoneEditorSheetOpen()).toBe(false);

    expect(phoneShellCss).toContain('.phone-editor-layer');
    expect(phoneShellCss).toContain('z-index: 24');
    expect(phoneShellCss).toContain('body.phone-editor-open .header-dropdown.mobile-action-sheet.is-open');
    expect(phoneShellCss).toContain('pointer-events: none');

    closePhoneEditorSheet();
  });

  it('renders Faz 47 phone icons through the shared SVG contract', () => {
    initPhoneShell();

    const iconHosts = [...document.querySelectorAll('[data-phone-icon]')];
    const missingIconNames = iconHosts
      .map((icon) => icon.getAttribute('data-phone-icon'))
      .filter((name) => !PHONE_ICON_SVG[name]);

    expect(iconHosts.length).toBeGreaterThan(20);
    expect(missingIconNames).toEqual([]);
    iconHosts.forEach((icon) => {
      expect(icon.classList.contains('wa-phone-icon')).toBe(true);
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(icon.querySelectorAll('svg')).toHaveLength(1);
    });
    expect(document.getElementById('headerMenuBtn')?.tagName).toBe('BUTTON');
    expect(PHONE_ICON_SVG.chatPlus).toContain('m84.375 66.668');
    expect(PHONE_ICON_SVG.chatPlus).toContain('m51.043 62.5v-25');
    expect(PHONE_ICON_SVG.phonePlus).toContain('m33.812 9.7148');
    expect(PHONE_ICON_SVG.phonePlus).toContain('m69.793 45.832');
    expect(PHONE_ICON_SVG.phone).toContain('M59.308,74.811');
    expect(PHONE_ICON_SVG.video).toContain('m65.625 33.332');
  });

  it('keeps the chat back button transparent, touchable and behaviorally wired', () => {
    const phoneCss = loadPhoneCss();
    initPhoneShell();

    const backButton = document.getElementById('phoneChatBackBtn');
    showPhoneChatDetail();
    backButton?.click();

    expect(backButton?.tagName).toBe('BUTTON');
    expect(backButton?.querySelector('[data-phone-icon="back"] svg')).not.toBeNull();
    expect(document.querySelector('.phone')?.dataset.phoneView).toBe('home');
    expect(phoneCss).toContain('.back-btn');
    expect(phoneCss).toContain('width: 40px');
    expect(phoneCss).toContain('height: 40px');
    expect(phoneCss).toContain('border: none');
    expect(phoneCss).toContain('background: transparent');
    expect(phoneCss).toContain('-webkit-tap-highlight-color: transparent');
  });

  it('defines the Faz 46 mobile spacing and menu stacking CSS contract', () => {
    const phoneShellCss = loadPhoneShellCss();
    const responsiveCss = loadResponsiveCss();

    expect(phoneShellCss).toContain('--phone-bottom-nav-height');
    expect(phoneShellCss).toContain('--phone-fab-bottom');
    expect(phoneShellCss).toContain('scroll-padding-bottom: var(--phone-tab-bottom-pad)');
    expect(phoneShellCss).toContain('.phone-bottom-nav-item::before');
    expect(phoneShellCss).toContain('.phone-tab-panel[data-phone-tab-panel="updates"]');
    expect(phoneShellCss).toContain('@media (max-width: 380px)');
    expect(responsiveCss).toContain('body.mobile-menu-open .header-dropdown.mobile-action-sheet.is-open');
    expect(responsiveCss).toContain('z-index: 603');
    expect(responsiveCss).toContain('pointer-events: auto');
  });

  it('defines the Faz 47 shared icon sizing and contrast CSS contract', () => {
    const phoneCss = loadPhoneCss();
    const phoneShellCss = loadPhoneShellCss();

    expect(phoneShellCss).toContain('.wa-phone-icon');
    expect(phoneShellCss).toContain('.wa-phone-icon svg');
    expect(phoneShellCss).toContain('stroke: currentColor');
    expect(phoneShellCss).toContain('stroke-linecap: round');
    expect(phoneShellCss).toContain('.phone-bottom-nav-item.is-active .wa-phone-icon');
    expect(phoneShellCss).toContain('color: #fff');
    expect(phoneShellCss).toContain('.phone-call-shortcut-icon .wa-phone-icon');
    expect(phoneShellCss).toContain('.phone-message-fab .wa-phone-icon');
    expect(phoneShellCss).toContain('.phone-call-fab .wa-phone-icon');
    expect(phoneShellCss).toContain('width: 52px');
    expect(phoneShellCss).toContain('background: #21c063');
    expect(phoneShellCss).toContain('width: 22px');
    expect(phoneShellCss).toContain('width: 27px');
    expect(phoneCss).toContain('.header-icon.wa-phone-icon');
    expect(phoneCss).toContain('.header-icon.wa-phone-icon[data-phone-icon="video"]');
    expect(phoneCss).toContain('.header-icon.wa-phone-icon[data-phone-icon="phone"]');
    expect(phoneCss).toContain('width: 21px');
    expect(phoneCss).toContain('.composer-icon-btn .wa-phone-icon');
    expect(phoneCss).toContain('.main-action-btn .wa-phone-icon');
  });
});
