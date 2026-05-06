import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  getPhoneShellState,
  initPhoneShell,
  setActivePhoneTab,
  showPhoneChatDetail,
  showPhoneHome,
} from '../js/phone/app-shell.js';

function mountIndexDocument() {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  document.body.innerHTML = doc.body.innerHTML;
  return document;
}

describe('Faz 41 phone app shell', () => {
  beforeEach(() => {
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

  it('opens chat detail and returns to the home shell', () => {
    initPhoneShell();

    showPhoneChatDetail();
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
    expect(menu?.querySelectorAll('[data-menu-root]')).toHaveLength(1);
  });
});
