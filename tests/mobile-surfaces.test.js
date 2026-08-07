import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initMobile } from '../js/ui/mobile.js';
import { MENU_MODES } from '../js/ui/menu-model.js';
import { state } from '../js/state.js';
import { renderPeopleList } from '../js/features/people.js';

function mountApp() {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.body.innerHTML = parsed.body.innerHTML;
  window.matchMedia = vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  document.querySelector('#appModeToggle').value = MENU_MODES.PRO;
}

function openSettingsOverlay() {
  const trigger = document.querySelector('#headerMenuBtn');
  trigger.click();
  document.querySelector('#headerDropdown [data-action="settings"]').click();
  return trigger;
}

describe('Faz 54 mobile surface lifecycle', () => {
  beforeEach(() => {
    mountApp();
  });

  it('exposes the overlay as a labelled modal dialog', () => {
    const overlay = document.querySelector('#mobileOverlay');

    expect(overlay.getAttribute('role')).toBe('dialog');
    expect(overlay.getAttribute('aria-modal')).toBe('true');
    expect(overlay.getAttribute('aria-labelledby')).toBe('mobileOverlayTitle');
    expect(overlay.getAttribute('aria-hidden')).toBe('true');
    expect(document.querySelector('#mobileOverlayBack').getAttribute('aria-label')).toBe('Paneli kapat');
  });

  it('traps focus, restores the moved panel exactly, and uses one close path', () => {
    const historyBack = vi.spyOn(history, 'back').mockImplementation(() => {});
    const settings = document.querySelector('#settings');
    const originalParent = settings.parentNode;
    const originalNextSibling = settings.nextSibling;
    settings.setAttribute('style', 'display: none; color: red;');
    settings.setAttribute('aria-hidden', 'true');
    settings.classList.remove('active');
    settings.scrollTop = 7;

    initMobile();
    const trigger = openSettingsOverlay();
    const overlay = document.querySelector('#mobileOverlay');
    const back = document.querySelector('#mobileOverlayBack');
    const background = document.querySelector('.panel-left');

    expect(overlay.getAttribute('aria-hidden')).toBe('false');
    expect(document.activeElement).toBe(back);
    expect(background.hasAttribute('inert')).toBe(true);

    back.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    }));
    expect(overlay.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(back);

    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    }));

    expect(overlay.getAttribute('aria-hidden')).toBe('true');
    expect(background.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(settings.parentNode).toBe(originalParent);
    expect(settings.nextSibling).toBe(originalNextSibling);
    expect(settings.getAttribute('style')).toBe('display: none; color: red;');
    expect(settings.getAttribute('aria-hidden')).toBe('true');
    expect(settings.classList.contains('active')).toBe(false);
    expect(settings.scrollTop).toBe(7);
    expect(historyBack).toHaveBeenCalledTimes(1);

    openSettingsOverlay();
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));

    expect(overlay.getAttribute('aria-hidden')).toBe('true');
    expect(historyBack).toHaveBeenCalledTimes(1);
    historyBack.mockRestore();
  });
});

describe('Faz 55 contextual controls', () => {
  beforeEach(() => {
    mountApp();
    state.reset();
  });

  it('synchronizes play and pause availability with player state', () => {
    initMobile();
    const playItem = document.querySelector('[data-action="play"]');
    const pauseItem = document.querySelector('[data-action="pause"]');

    expect(playItem.disabled).toBe(false);
    expect(pauseItem.disabled).toBe(true);

    const timer = setTimeout(() => {}, 1000);
    const player = state.get('player');
    player.paused = false;
    player.playTimer = timer;
    state.notify('player.playback');

    expect(playItem.disabled).toBe(true);
    expect(playItem.querySelector('.hd-item-label')?.textContent).toBe('Oynatılıyor');
    expect(pauseItem.disabled).toBe(false);

    clearTimeout(timer);
    player.playTimer = null;
    player.paused = true;
    state.notify('player.playback');
  });

  it('shows only panel-relevant overlay header actions', () => {
    initMobile();
    const trigger = document.querySelector('#headerMenuBtn');
    const playButton = document.querySelector('#moPlayBtn');
    const resetButton = document.querySelector('#moResetBtn');

    trigger.click();
    document.querySelector('[data-action="group"]').click();
    expect(playButton.hidden).toBe(false);
    expect(playButton.getAttribute('aria-label')).toBe('Hazırlanan sohbeti oynat');
    expect(resetButton.hidden).toBe(true);
    document.querySelector('#mobileOverlayBack').click();

    trigger.click();
    document.querySelector('[data-action="settings"]').click();
    expect(playButton.hidden).toBe(true);
    expect(resetButton.hidden).toBe(true);
  });
});

describe('Faz 56 preparation flow', () => {
  beforeEach(() => {
    mountApp();
    state.reset();
  });

  function openGroupOverlay() {
    initMobile();
    document.querySelector('#headerMenuBtn').click();
    document.querySelector('[data-action="group"]').click();
  }

  it('opens only the people list when people exist and keeps preparation sections exclusive', async () => {
    openGroupOverlay();
    const steps = [...document.querySelectorAll('[data-preparation-step]')];

    expect(steps.filter((step) => step.open).map((step) => step.id)).toEqual(['peopleListAccordion']);
    document.querySelector('#groupFlowAccordion summary').click();
    await vi.waitFor(() => {
      expect(steps.filter((step) => step.open).map((step) => step.id)).toEqual(['groupFlowAccordion']);
    });
  });

  it('opens the person form when the people list is empty', () => {
    state.set('people', {});
    openGroupOverlay();

    expect(document.querySelector('#personFormAccordion').open).toBe(true);
    expect(document.querySelectorAll('[data-preparation-step][open]')).toHaveLength(1);
  });

  it('removes URL noise and exposes contextual edit actions with accessible names', () => {
    openGroupOverlay();
    renderPeopleList();

    expect(document.querySelector('#peopleCount').textContent).toBe('(5)');
    expect(document.querySelector('.person-url')).toBeNull();
    const editTarget = document.querySelector('.person-edit-target');
    expect(editTarget.getAttribute('aria-label')).toMatch(/kişisini düzenle$/);
    editTarget.click();

    expect(document.querySelector('#personFormAccordion').open).toBe(true);
    expect(document.querySelector('#deletePersonBtn').hidden).toBe(false);
    expect(document.querySelector('[data-person-save-label]').textContent).toBe('Değişiklikleri Kaydet');
  });

  it('shows search only for long lists and filters people without changing state', () => {
    const people = Object.fromEntries(
      Array.from({ length: 20 }, (_, index) => [`Kişi ${index + 1}`, { avatar: '' }])
    );
    state.set('people', people);
    renderPeopleList();

    const searchGroup = document.querySelector('#peopleSearchGroup');
    const search = document.querySelector('#peopleSearch');
    expect(searchGroup.hidden).toBe(false);
    expect(document.querySelector('#peopleCount').textContent).toBe('(20)');
    search.value = 'Kişi 20';
    search.dispatchEvent(new Event('input', { bubbles: true }));

    expect(document.querySelectorAll('.person-card-wrapper')).toHaveLength(1);
    expect(Object.keys(state.get('people'))).toHaveLength(20);
  });

  it('moves to the message flow after adding an inline message', () => {
    openGroupOverlay();
    renderPeopleList();
    document.querySelector('[data-addline]').click();
    const textarea = document.querySelector('.inline-builder-panel textarea');
    textarea.value = 'Merhaba';
    document.querySelector('.inline-add-btn').click();

    expect(document.querySelector('#groupFlowAccordion').open).toBe(true);
    expect(document.querySelector('#groupBuilderList').textContent).toContain('Merhaba');
  });
});
