/** @vitest-environment jsdom */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { CONFIG } from '../js/config.js';

let storage, sceneManager, state, initAutoSave;

beforeEach(async () => {
  vi.resetModules();
  localStorage.clear();
  ({ state } = await import('../js/state.js'));
  ({ storage, sceneManager, initAutoSave } = await import('../js/storage.js'));
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('truthful project save feedback', () => {
  it('starts idle and reports saving immediately, saved only after the write', () => {
    const statuses = [];
    storage.subscribeSaveStatus(value => statuses.push(value.status));
    storage.save();
    expect(statuses).toEqual(['idle', 'saving']);
    expect(localStorage.getItem(CONFIG.STORAGE_KEY)).toBeNull();
    vi.advanceTimersByTime(999);
    expect(storage.getSaveStatus().status).toBe('saving');
    vi.advanceTimersByTime(1);
    expect(statuses).toEqual(['idle', 'saving', 'saved']);
    expect(storage.getSaveStatus().savedAt).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY))).toEqual(state.export());
  });

  it('coalesces rapid changes and writes the latest state', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    state.set('player.script', 'Me: İlk');
    storage.save();
    vi.advanceTimersByTime(500);
    state.set('player.script', 'Me: Son');
    storage.save();
    vi.advanceTimersByTime(1000);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)).player.script).toBe('Me: Son');
  });

  it.each(['QuotaExceededError', 'SecurityError'])('reports %s without claiming saved', name => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Depolama kullanılamıyor', name);
    });
    const statuses = [];
    storage.subscribeSaveStatus(value => statuses.push(value.status));
    expect(storage.saveNow()).toBe(false);
    expect(statuses).toEqual(['idle', 'saving', 'error']);
    expect(storage.getSaveStatus()).toMatchObject({ error: 'Depolama kullanılamıyor', savedAt: null });
  });

  it('reports asynchronous failures and recovers after an explicit successful retry', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('Disk dolu');
    });
    storage.save();
    vi.advanceTimersByTime(1000);
    expect(storage.getSaveStatus().status).toBe('error');
    expect(storage.saveNow()).toBe(true);
    expect(storage.getSaveStatus()).toMatchObject({ status: 'saved', error: null });
    expect(setItem).toHaveBeenCalledTimes(2);
  });

  it('flushes pending work synchronously once', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    storage.save();
    expect(storage.flush()).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(storage.flush()).toBe(true);
    expect(setItem).toHaveBeenCalledTimes(1);
  });

  it('does not resurrect cleared data from a pending timer', () => {
    storage.save();
    expect(storage.clear()).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(localStorage.getItem(CONFIG.STORAGE_KEY)).toBeNull();
    expect(storage.getSaveStatus().status).toBe('idle');
    expect(storage.flush()).toBe(false);
  });

  it('unsubscribes listeners and does not let one failing observer turn a write into failure', () => {
    const listener = vi.fn();
    const unsubscribe = storage.subscribeSaveStatus(listener);
    unsubscribe();
    storage.subscribeSaveStatus(value => {
      if (value.status !== 'idle') throw new Error('UI failure');
    });
    expect(storage.saveNow()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(storage.getSaveStatus().status).toBe('saved');
  });

  it('preserves legacy project files and their script syntax', async () => {
    vi.useRealTimers();
    const legacy = { group: { title: 'Eski sohbet' }, player: { script: 'Me: Merhaba\n/typing Ayşe 900' } };
    await expect(storage.importFromFile(new File([JSON.stringify(legacy)], 'old.json', { type: 'application/json' })))
      .resolves.toEqual(legacy);
    expect(state.get('group.title')).toBe('Eski sohbet');
    expect(state.get('player.script')).toBe(legacy.player.script);
    expect(storage.getSaveStatus().status).toBe('saving');
    expect(storage.flush()).toBe(true);
    expect(JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)).player.script).toBe(legacy.player.script);
  });

  it('preserves legacy saved projects and surfaces write failures without a fake result', () => {
    localStorage.setItem(CONFIG.SCENES_KEY, JSON.stringify([
      { id: 42, name: 'Eski sahne', timestamp: '2025-01-01T00:00:00.000Z', data: { group: { title: 'Korunan' } } },
    ]));
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Kota'); });
    expect(sceneManager.save('Yeni')).toBe(false);
    expect(sceneManager.rename(42, 'Değişti')).toBe(false);
    expect(sceneManager.delete(42)).toBe(false);
    expect(storage.getSaveStatus().status).toBe('error');
    setItem.mockRestore();
    expect(sceneManager.getAll()[0]).toMatchObject({ id: 42, name: 'Eski sahne', category: 'Genel' });
    expect(sceneManager.load(42)).toBe(true);
    expect(state.get('group.title')).toBe('Korunan');
  });

  it('flushes pending autosave on pagehide and provides cleanup', () => {
    const dispose = initAutoSave();
    state.set('player.script', 'Me: Son değişiklik');
    expect(storage.getSaveStatus().status).toBe('saving');
    window.dispatchEvent(new Event('pagehide'));
    expect(storage.getSaveStatus().status).toBe('saved');
    expect(JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)).player.script).toBe('Me: Son değişiklik');
    dispose();
  });
});
