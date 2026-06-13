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
    expect(search?.textContent).toContain('Ara');
    expect(filters.map((filter) => filter.dataset.phoneChatFilter)).toEqual(CHAT_FILTERS);
    expect(filters.map((filter) => filter.textContent?.trim())).toEqual(['Tümü', 'Okunmamış', 'Gruplar']);
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
    expect(document.querySelector('.phone-home-title')?.textContent).toBe('Güncellemeler');
    expect(searchButton?.hidden).toBe(false);
    expect(searchButton?.getAttribute('aria-label')).toBe('Güncellemelerde ara');
    expect(cameraButton?.hidden).toBe(true);
    expect(updatesPanel?.hidden).toBe(false);
    expect(document.querySelector('[data-phone-tab="updates"]')?.getAttribute('aria-selected')).toBe('true');
    expect(statusRows).toHaveLength(3);
    expect(document.getElementById('phoneStatusMeta')?.textContent).toContain('Durum güncellemesi');
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
    expect(document.getElementById('phoneCommunitiesTitle')?.textContent).toBe('Topluluklar sayesinde bağlantıda kalın');
    expect(document.getElementById('phoneCommunitiesDescription')?.textContent).toContain('İlgili grupları');
    expect(document.getElementById('phoneCommunitiesLinkLabel')?.textContent).toContain('Örnek toplulukları gör');
    expect(cta?.textContent).toBe('Topluluğunuzu oluşturun');
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
    expect(document.getElementById('phoneCallsQuickTitle')?.textContent).toBe('Hızlı aksiyonlar');
    expect(shortcuts.map((shortcut) => shortcut.textContent?.trim())).toEqual(['Ara', 'Planla', 'Tuş takımı', 'Favoriler']);
    expect(document.getElementById('phoneRecentCallsTitle')?.textContent).toBe('Son aramalar');
    expect(rows).toHaveLength(4);
    expect(rows[0]?.classList.contains('is-missed')).toBe(true);
    expect(rows[0]?.textContent).toContain('Cevapsız');
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
    expect(document.getElementById('homeChatSubtitle')?.textContent).toBe('Sohbet detayını aç');
  });

  it('renders conversations from state and selects the clicked chat before opening detail', () => {
    state.import({
      conversations: {
        activeId: 'family',
        items: [
          {
            id: 'family',
            title: 'Aile Grubu',
            subtitle: '3 kisi',
            messages: [{ id: 0, speaker: 'Me', text: 'Hazir', time: '13:05' }],
            messageSeq: 1,
          },
          {
            id: 'support',
            title: 'Destek',
            subtitle: 'Online',
            messages: [{ id: 0, speaker: 'Ali', text: 'Buradayiz', time: '14:10' }],
            messageSeq: 1,
          },
        ],
      },
    });
    initPhoneShell();

    const rows = [...document.querySelectorAll('#homeChatList [data-phone-open-chat]')];
    expect(rows).toHaveLength(2);
    expect(rows[0]?.textContent).toContain('Aile Grubu');
    expect(rows[1]?.textContent).toContain('Destek');

    rows[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(state.get('conversations.activeId')).toBe('support');
    expect(state.get('group.title')).toBe('Destek');
    expect(state.get('messages')[0].text).toBe('Buradayiz');
    expect(getPhoneShellState().view).toBe('chat');
    expect(document.querySelector('.phone')?.dataset.phoneView).toBe('chat');
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

  it('opens, cancels, saves and persists the Faz 50 updates editor sheet', () => {
    initPhoneShell();

    document.getElementById('phoneUpdatesEditFab')?.click();

    expect(isPhoneEditorSheetOpen()).toBe(true);
    expect(document.body.classList.contains('phone-editor-open')).toBe(true);
    expect(document.getElementById('phoneEditorLayer')?.getAttribute('aria-hidden')).toBe('false');
    expect(document.getElementById('phoneEditorForm')?.getAttribute('role')).toBe('dialog');
    expect(document.getElementById('phoneEditorTitle')?.textContent).toBe('Güncellemeleri düzenle');
    expect(document.querySelector('#phoneEditorFields input[name="statusTitle"]')).not.toBeNull();
    expect(document.querySelector('#phoneEditorFields .phone-editor-field-avatar input[name="statusPhoto"]')).not.toBeNull();
    expect(document.querySelector('#phoneEditorFields .phone-editor-list[data-list-name="recent"]')).not.toBeNull();

    document.getElementById('phoneEditorCancelBtn')?.click();
    expect(isPhoneEditorSheetOpen()).toBe(false);

    openPhoneEditorSheet('updatesStatus');
    document.querySelector('#phoneEditorFields input[name="statusTitle"]').value = 'Sahne hazir';
    document.querySelector('#phoneEditorFields input[name="statusMeta"]').value = 'Bugun 18:30';
    document.querySelector('#phoneEditorFields input[name="statusNote"]').value = 'Yeni durum 24 saat sonra silinir.';

    const recentList = document.querySelector('.phone-editor-list[data-list-name="recent"]');
    const initialRows = recentList.querySelectorAll('.phone-editor-list-row');
    expect(initialRows).toHaveLength(2);
    initialRows[0].querySelector('[name="title"]').value = 'Tasarim Ekibi';
    initialRows[0].querySelector('[name="meta"]').value = 'Bugun 17:10';
    initialRows[0].querySelector('[name="initials"]').value = 'TE';
    initialRows[1].querySelector('[name="title"]').value = 'Satis';
    initialRows[1].querySelector('[name="meta"]').value = 'Dun 22:05';
    initialRows[1].querySelector('[name="initials"]').value = 'S';

    // Yeni durum satırı ekle (ekle/sil akışı)
    recentList.querySelector('.phone-editor-list-add').click();
    const rowsAfterAdd = recentList.querySelectorAll('.phone-editor-list-row');
    expect(rowsAfterAdd).toHaveLength(3);
    rowsAfterAdd[2].querySelector('[name="title"]').value = 'Pazarlama';
    rowsAfterAdd[2].querySelector('[name="meta"]').value = 'Bugun 16:00';
    rowsAfterAdd[2].querySelector('[name="initials"]').value = 'PZ';

    document.querySelector('#phoneEditorFields input[name="channelTitle"]').value = 'Duyurular';
    document.querySelector('#phoneEditorFields textarea[name="channelDescription"]').value = 'Sadece onemli duyurular burada gorunur.';
    document.querySelector('#phoneEditorFields input[name="channelDiscoverLabel"]').value = 'Bul';
    document.querySelector('#phoneEditorFields input[name="channelCreateLabel"]').value = 'Duyuru kanali ac';
    document.getElementById('phoneEditorForm')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(isPhoneEditorSheetOpen()).toBe(false);
    const exported = state.export();
    expect(exported.phoneShellContent.updates.recent).toHaveLength(3);

    expect(document.getElementById('phoneStatusTitle')?.textContent).toBe('Sahne hazir');
    expect(document.getElementById('phoneStatusMeta')?.textContent).toBe('Bugun 18:30');
    expect(document.getElementById('phoneStatusNote')?.textContent).toBe('Yeni durum 24 saat sonra silinir.');
    expect(document.getElementById('phoneRecentUpdatesList')?.textContent).toContain('Tasarim Ekibi');
    expect(document.getElementById('phoneRecentUpdatesList')?.textContent).toContain('Dun 22:05');
    expect(document.getElementById('phoneRecentUpdatesList')?.textContent).toContain('Pazarlama');
    expect(document.getElementById('phoneChannelsTitle')?.textContent).toBe('Duyurular');
    expect(document.getElementById('phoneChannelsDescription')?.textContent).toBe('Sadece onemli duyurular burada gorunur.');
    expect(document.getElementById('phoneChannelDiscoverBtn')?.textContent).toBe('Bul');
    expect(document.getElementById('phoneChannelCreateBtn')?.textContent).toBe('Duyuru kanali ac');

    state.reset();
    state.import({ phoneShellContent: exported.phoneShellContent });

    expect(document.getElementById('phoneStatusTitle')?.textContent).toBe('Sahne hazir');
    expect(document.getElementById('phoneRecentUpdatesList')?.textContent).toContain('Pazarlama');
    expect(document.getElementById('phoneChannelCreateBtn')?.textContent).toBe('Duyuru kanali ac');
  });

  it('opens, saves and persists the Faz 51 communities editor sheet', () => {
    const phoneShellCss = loadPhoneShellCss();
    initPhoneShell();
    setActivePhoneTab('communities');

    document.getElementById('phoneCommunitiesCreateBtn')?.click();

    expect(isPhoneEditorSheetOpen()).toBe(true);
    expect(document.getElementById('phoneEditorTitle')?.textContent).toBe('Topluluk görünümünü düzenle');
    expect(document.getElementById('phoneEditorFields')?.dataset.phoneEditorSurface).toBe('communities-chat');
    expect(document.querySelectorAll('#phoneEditorFields input')).toHaveLength(3);
    expect(document.querySelectorAll('#phoneEditorFields textarea')).toHaveLength(1);
    expect(document.querySelector('#phoneEditorFields input[name="linkLabel"]')).not.toBeNull();
    expect(document.querySelector('#phoneEditorFields input[name="ctaLabel"]')).not.toBeNull();

    document.querySelector('#phoneEditorFields input[name="title"]').value = 'Mahalle toplulugu';
    document.querySelector('#phoneEditorFields textarea[name="description"]').value = 'Duyurular ve etkinlikler burada derli toplu kalir.';
    document.querySelector('#phoneEditorFields input[name="linkLabel"]').value = 'Ornekleri incele';
    document.querySelector('#phoneEditorFields input[name="ctaLabel"]').value = 'Toplulugu hazirla';
    document.getElementById('phoneEditorForm')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(isPhoneEditorSheetOpen()).toBe(false);
    const exported = state.export();

    expect(document.getElementById('phoneCommunitiesTitle')?.textContent).toBe('Mahalle toplulugu');
    expect(document.getElementById('phoneCommunitiesDescription')?.textContent).toBe('Duyurular ve etkinlikler burada derli toplu kalir.');
    expect(document.getElementById('phoneCommunitiesLinkLabel')?.textContent).toBe('Ornekleri incele');
    expect(document.getElementById('phoneCommunitiesCreateBtn')?.textContent).toBe('Toplulugu hazirla');
    expect(state.get('phoneShellContent.communities.linkLabel')).toBe('Ornekleri incele');

    state.reset();
    state.import({ phoneShellContent: exported.phoneShellContent });

    expect(document.getElementById('phoneCommunitiesTitle')?.textContent).toBe('Mahalle toplulugu');
    expect(document.getElementById('phoneCommunitiesLinkLabel')?.textContent).toBe('Ornekleri incele');
    expect(document.getElementById('phoneCommunitiesCreateBtn')?.textContent).toBe('Toplulugu hazirla');
    expect(phoneShellCss).toContain('.phone-editor-fields[data-phone-editor-surface="communities-chat"]');
    expect(phoneShellCss).toContain('var(--phone-bottom-nav-height)');
  });

  it('opens, saves and persists the Faz 52 calls editor sheet from search', () => {
    const phoneShellCss = loadPhoneShellCss();
    initPhoneShell();
    setActivePhoneTab('updates');

    document.getElementById('phoneShellSearchBtn')?.click();
    expect(isPhoneEditorSheetOpen()).toBe(false);

    setActivePhoneTab('calls');
    document.getElementById('phoneShellSearchBtn')?.click();

    expect(isPhoneEditorSheetOpen()).toBe(true);
    expect(document.getElementById('phoneEditorTitle')?.textContent).toBe('Arama listesini düzenle');
    expect(document.getElementById('phoneEditorFields')?.dataset.phoneEditorSurface).toBe('calls-list');
    expect(document.querySelectorAll('#phoneEditorFields select')).toHaveLength(8);
    expect(document.querySelector('#phoneEditorFields .phone-editor-field-avatar input[name="call0Avatar"]')).not.toBeNull();
    expect(document.querySelector('#phoneEditorFields select[name="call0Direction"]')?.value).toBe('missed');
    expect(document.querySelector('#phoneEditorFields select[name="call1Type"]')?.value).toBe('video');

    document.querySelector('#phoneEditorFields input[name="call0Name"]').value = 'Musteri Hizmetleri';
    document.querySelector('#phoneEditorFields input[name="call0Meta"]').value = 'bugun 14:22';
    document.querySelector('#phoneEditorFields select[name="call0Direction"]').value = 'outgoing';
    document.querySelector('#phoneEditorFields select[name="call0Type"]').value = 'video';
    document.querySelector('#phoneEditorFields input[name="call0Initials"]').value = 'MH';
    document.querySelector('#phoneEditorFields input[name="call1Name"]').value = 'Derya';
    document.querySelector('#phoneEditorFields input[name="call1Meta"]').value = 'dun 08:11';
    document.querySelector('#phoneEditorFields select[name="call1Direction"]').value = 'missed';
    document.querySelector('#phoneEditorFields select[name="call1Type"]').value = 'voice';
    document.querySelector('#phoneEditorFields input[name="call1Initials"]').value = 'D';
    document.getElementById('phoneEditorForm')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(isPhoneEditorSheetOpen()).toBe(false);
    const exported = state.export();
    const rows = [...document.querySelectorAll('#phoneRecentCallsList .phone-call-row')];

    expect(rows).toHaveLength(4);
    expect(rows[0]?.textContent).toContain('Musteri Hizmetleri');
    expect(rows[0]?.textContent).toContain('Giden, bugun 14:22');
    expect(rows[0]?.classList.contains('is-missed')).toBe(false);
    expect(rows[0]?.querySelector('.phone-call-row-action [data-phone-icon]')?.dataset.phoneIcon).toBe('video');
    expect(rows[1]?.textContent).toContain('Derya');
    expect(rows[1]?.textContent).toContain('Cevapsız, dun 08:11');
    expect(rows[1]?.classList.contains('is-missed')).toBe(true);
    expect(state.get('phoneShellContent.calls.items.0.initials')).toBe('MH');

    state.reset();
    state.import({ phoneShellContent: exported.phoneShellContent });

    expect(document.querySelector('#phoneRecentCallsList .phone-call-row')?.textContent).toContain('Musteri Hizmetleri');
    expect(document.querySelector('#phoneRecentCallsList .phone-call-row')?.textContent).toContain('Giden, bugun 14:22');
    expect(phoneShellCss).toContain('.phone-editor-fields[data-phone-editor-surface="calls-list"]');
    expect(phoneShellCss).toContain('.phone-editor-field select');
    expect(phoneShellCss).toContain('var(--phone-bottom-nav-height)');
  });

  it('creates a new conversation from the message FAB sheet and opens it', () => {
    initPhoneShell();

    document.getElementById('phoneMessageFab')?.click();

    expect(isPhoneEditorSheetOpen()).toBe(true);
    expect(document.getElementById('phoneEditorTitle')?.textContent).toBe('Yeni sohbet');
    expect(document.querySelector('#phoneEditorFields input[name="title"]')).not.toBeNull();
    expect(document.querySelector('#phoneEditorFields textarea[name="firstMessage"]')).not.toBeNull();

    document.querySelector('#phoneEditorFields input[name="title"]').value = 'Proje Ekibi';
    document.querySelector('#phoneEditorFields input[name="subtitle"]').value = '5 kisi';
    document.querySelector('#phoneEditorFields input[name="avatarUrl"]').value = 'https://example.com/proje.png';
    document.querySelector('#phoneEditorFields textarea[name="firstMessage"]').value = 'Selam ekip';
    document.getElementById('phoneEditorForm')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const conversations = state.get('conversations');
    const created = conversations.items.find((item) => item.title === 'Proje Ekibi');

    expect(isPhoneEditorSheetOpen()).toBe(false);
    expect(created).toBeTruthy();
    expect(conversations.activeId).toBe(created.id);
    expect(state.get('group.title')).toBe('Proje Ekibi');
    expect(state.get('messages')[0].text).toBe('Selam ekip');
    expect(getPhoneShellState().activeTab).toBe('chats');
    expect(getPhoneShellState().view).toBe('chat');
    expect(document.getElementById('homeChatList')?.textContent).toContain('Proje Ekibi');
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
    expect(document.getElementById('phoneEditorError')?.textContent).toContain('Topluluk başlığı');

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
    Object.values(PHONE_ICON_SVG).forEach((svg) => {
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).not.toContain('viewBox="0 0 100 100"');
    });
    expect(PHONE_ICON_SVG.chatPlus).toContain('q-.475.475-1.088.213');
    expect(PHONE_ICON_SVG.phonePlus).toContain('M19.95 21');
    expect(PHONE_ICON_SVG.phone).toContain('M19.95 21');
    expect(PHONE_ICON_SVG.video).toContain('M4 20q-.825');
    expect(PHONE_ICON_SVG.keypad).toContain('M12 23');
    expect(PHONE_ICON_SVG.updates).toContain('<circle cx="12" cy="12" r="3.6" fill="currentColor"');
    expect(PHONE_ICON_SVG.updates).toContain('r="8.4"');
    expect(PHONE_ICON_SVG.updates).toContain('stroke-dasharray="4.7 2.9"');
    expect(PHONE_ICON_SVG.updates).toContain('stroke-linecap="round"');
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
    expect(phoneShellCss).toContain('fill: currentColor');
    expect(phoneShellCss).toContain('stroke: none');
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
