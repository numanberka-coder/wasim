import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import { initWorkspaceShell, navigateWorkspace } from '../js/ui/workspace-shell.js';
import { initTabs } from '../js/ui/tabs.js';
import { returnToPreview } from '../js/ui/mobile.js';
import { WORKSPACE_SECTIONS } from '../js/ui/menu-model.js';

beforeEach(() => {
  document.body.innerHTML = new DOMParser().parseFromString(fs.readFileSync('index.html', 'utf8'), 'text/html').body.innerHTML;
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.spyOn(history, 'back').mockImplementation(() => {});
  initWorkspaceShell();
  initTabs();
});
afterEach(() => { returnToPreview(); vi.restoreAllMocks(); });

describe('Faz 60 preview workspace', () => {
  it('builds common navigation outside the capture and separates phone menu', () => {
    const nav = document.querySelector('.workspace-workbar');
    expect([...nav.querySelectorAll('button')].map(b => b.textContent)).toEqual(WORKSPACE_SECTIONS.map(s => s.label));
    expect(document.querySelector('.phone').contains(nav)).toBe(false);
    expect(document.querySelector('.workspace-topbar').closest('.phone')).toBeNull();
    expect(document.querySelector('#headerMenuBtn').getAttribute('aria-disabled')).toBe('true');
    expect(document.querySelectorAll('[data-workspace-shell]')).toHaveLength(1);
    initWorkspaceShell();
    expect(document.querySelectorAll('[data-workspace-shell]')).toHaveLength(1);
  });
  it('retains the same form node, unfinished value, disclosure and overlay scroll', () => {
    const input = document.querySelector('#pName');
    navigateWorkspace('group');
    const details = document.querySelector('#personFormAccordion');
    details.open = true;
    input.value = 'Yarım kalan kişi';
    document.querySelector('#mobileOverlayBody').scrollTop = 127;
    returnToPreview();
    navigateWorkspace('settings');
    returnToPreview();
    navigateWorkspace('group');
    expect(document.querySelector('#pName')).toBe(input);
    expect(input.value).toBe('Yarım kalan kişi');
    expect(details.open).toBe(true);
    expect(document.querySelector('#mobileOverlayBody').scrollTop).toBe(127);
  });
  it('opens project on desktop without moving the phone or panel', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
    navigateWorkspace('project');
    expect(document.querySelector('#project').getAttribute('aria-hidden')).toBe('false');
    expect(document.querySelector('#project').parentElement.className).toBe('panel-left');
  });
});
