/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';

let state, storage, sceneManager, CONFIG, player, consoleErrors;
const byId = id => document.getElementById(id);

describe('full application workspace composition', () => {
  beforeAll(async () => {
    vi.resetModules();
    localStorage.clear();
    const parsed = new DOMParser().parseFromString(readFileSync(join(process.cwd(), 'index.html'), 'utf8'), 'text/html');
    document.body.innerHTML = parsed.body.innerHTML;
    window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    Element.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
    vi.useFakeTimers();
    consoleErrors = vi.spyOn(console, 'error').mockImplementation(() => {});
    ({ state } = await import('../js/state.js'));
    ({ storage, sceneManager } = await import('../js/storage.js'));
    ({ CONFIG } = await import('../js/config.js'));
    player = await import('../js/features/player.js');
    await import('../js/app.js');
    if (!document.querySelector('[data-workspace-shell]')) document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterAll(() => {
    player?.pause();
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('boots the real index and app without swallowed initialization errors', () => {
    expect(consoleErrors.mock.calls).toEqual([]);
    expect(document.querySelectorAll('[data-workspace-shell]')).toHaveLength(1);
    expect(byId('onboardingOverlay').classList.contains('open')).toBe(false);
    expect(byId('appModeToggle')).toBeNull();
    expect(document.body.classList.contains('simple-mode')).toBe(false);
    expect(byId('mobileScriptFlow')).not.toBeNull();
    expect(byId('conversationTextAdvanced').open).toBe(false);
    expect(byId('conversationTextAdvanced').contains(byId('scriptBox'))).toBe(true);
  });

  it('composes task controls into the intended panels and keeps workbars outside capture', () => {
    for (const id of ['script', 'group', 'settings', 'project', 'help']) expect(byId(id)).not.toBeNull();
    expect(byId('script').contains(byId('playbackPreset'))).toBe(true);
    expect(byId('script').contains(byId('groupInfoAccordion'))).toBe(true);
    expect(byId('script').contains(byId('settingsTicksAccordion'))).toBe(true);
    expect(byId('settings').contains(byId('taskAppearanceSample'))).toBe(true);
    expect(byId('settings').contains(byId('settingsStatusBarAccordion'))).toBe(true);
    expect(byId('project').contains(byId('settingsScenesAccordion'))).toBe(true);
    expect(byId('project').contains(byId('saveAllBtn'))).toBe(true);
    expect(byId('taskAdvanced-project').contains(byId('clearAllBtn'))).toBe(true);
    expect(byId('conversationInteractiveAdvanced').contains(byId('tabInteractive'))).toBe(true);
    for (const element of document.querySelectorAll('.workspace-workbar, .workspace-topbar, #projectSaveStatus')) {
      expect(element.closest('.phone')).toBeNull();
    }
  });

  it('reflects actual debounced persistence results in the project bar', () => {
    state.set('player.script', 'Me: Kalıcı düzenleme');
    expect(byId('projectSaveStatus').dataset.saveState).toBe('saving');
    vi.advanceTimersByTime(1000);
    expect(JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)).player.script).toBe('Me: Kalıcı düzenleme');
    expect(byId('projectSaveStatus').textContent).toBe('Bu cihazda kaydedildi');
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Kota dolu'); });
    expect(storage.saveNow()).toBe(false);
    expect(byId('projectSaveStatus').dataset.saveState).toBe('error');
    expect(byId('projectSaveError').hidden).toBe(false);
    write.mockRestore();
    expect(storage.saveNow()).toBe(true);
    expect(byId('projectSaveError').hidden).toBe(true);
  });

  it('plays freshly edited text directly into the selected conversation only', () => {
    const original = state.get('conversations.activeId');
    const target = state.addConversation({ title: 'İki kişilik test' });
    state.selectConversation(original);
    const select = byId('scriptTargetConversation');
    select.value = target.id;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    const box = byId('scriptBox');
    box.value = 'Me: Merhaba\nAli: Selam';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    byId('playBtn').click();
    vi.advanceTimersByTime(10000);
    expect(state.get('conversations.activeId')).toBe(target.id);
    expect(state.get('messages').map(message => message.text)).toEqual(['Merhaba', 'Selam']);
    expect(state.get('conversations.items').find(item => item.id === original).messages).toEqual([]);
    expect(byId('pauseBtn').disabled).toBe(true);
  });

  it('pauses from the actual control during typing and resumes without losing the message', () => {
    byId('scriptBox').value = 'Ali: Bekleyen yanıt';
    byId('scriptBox').dispatchEvent(new Event('input', { bubbles: true }));
    byId('playBtn').click();
    expect(state.get('player').typingTimer).toBeTruthy();
    byId('pauseBtn').click();
    expect(state.get('player').paused).toBe(true);
    expect(byId('pauseBtn').textContent).toBe('Devam Et');
    vi.advanceTimersByTime(5000);
    expect(state.get('messages')).toEqual([]);
    byId('pauseBtn').click();
    vi.advanceTimersByTime(5000);
    expect(state.get('messages').map(message => message.text)).toEqual(['Bekleyen yanıt']);
  });

  it('keeps a failed named-project save inline without adding a fake saved project', () => {
    const before = sceneManager.getAll().length;
    const name = byId('sceneNameInput');
    name.value = 'Başarısız kayıt';
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Kota dolu', 'QuotaExceededError'); });
    byId('saveSceneBtn').click();
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(byId('sceneNameInput-error').textContent).toContain('Proje kaydedilemedi');
    expect(name.value).toBe('Başarısız kayıt');
    expect(sceneManager.getAll()).toHaveLength(before);
    expect(byId('projectSaveStatus').dataset.saveState).toBe('error');
    write.mockRestore();
    byId('saveSceneBtn').click();
    expect(name.hasAttribute('aria-invalid')).toBe(false);
    expect(sceneManager.getAll()).toHaveLength(before + 1);
    expect(name.value).toBe('');
  });

  it('opens a legacy file through the app and replaces stale editor and playback content', async () => {
    const legacy = { group: { title: 'Dosyadan sohbet' }, people: { Me: {}, Ali: {} }, player: { script: 'Me: Dosyadan yeni mesaj', speed: 400, jitter: 100 }, messages: [] };
    let picker;
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function () { picker = this; });
    byId('loadAllBtn').click();
    expect(picker.type).toBe('file');
    const file = new File([JSON.stringify(legacy)], 'legacy.json', { type: 'application/json' });
    const loading = picker.onchange({ target: { files: [file] } });
    await vi.advanceTimersByTimeAsync(20);
    await loading;
    click.mockRestore();
    expect(byId('scriptBox').value).toBe(legacy.player.script);
    expect(state.get('player').queue).toEqual([]);
    expect(byId('groupTitle').value).toBe('Dosyadan sohbet');
    byId('playBtn').click();
    vi.advanceTimersByTime(5000);
    expect(state.get('messages').map(message => message.text)).toEqual(['Dosyadan yeni mesaj']);
    expect(consoleErrors.mock.calls).toEqual([]);
  });
});
