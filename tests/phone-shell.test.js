import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CHAT_FILTERS,
  getPhoneShellState,
  initPhoneShell,
  setActiveChatFilter,
  setActivePhoneTab,
  showPhoneChatDetail,
  showPhoneHome,
} from '../js/phone/app-shell.js';
import { state } from '../js/state.js';

function mountIndexDocument() {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  document.body.innerHTML = doc.body.innerHTML;
  return document;
}

describe('Faz 41 phone app shell', () => {
  beforeEach(() => {
    state.reset();
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
    expect(document.querySelector('#phoneTabUpdates .phone-status-note')?.textContent).toContain('24 saat sonra');
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
    expect(document.querySelector('#phoneTabCommunities .phone-communities-copy')?.textContent).toContain('Ilgili gruplari');
    expect(learnButton?.textContent).toContain('Ornek topluluklari gor');
    expect(cta?.textContent).toBe('Toplulugunuzu olusturun');
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
});
