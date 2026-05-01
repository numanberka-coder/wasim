/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CONFIG } from '../js/config.js';

// We need to test storage in isolation — re-import fresh instances
let storage, sceneManager, analyticsManager, state;

beforeEach(async () => {
  localStorage.clear();
  // Dynamic import to get fresh module per test
  vi.resetModules();
  const stateModule = await import('../js/state.js');
  const storageModule = await import('../js/storage.js');
  storage = storageModule.storage;
  sceneManager = storageModule.sceneManager;
  analyticsManager = storageModule.analyticsManager;
  state = stateModule.state;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ========================================
//   storage
// ========================================
describe('storage', () => {
  describe('save / load', () => {
    it('saves state to localStorage', () => {
      vi.useFakeTimers();
      state.set('group.title', 'Test Grubu');
      storage.save();
      vi.advanceTimersByTime(1100); // debounce
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      expect(raw).toBeTruthy();
      const data = JSON.parse(raw);
      expect(data.group.title).toBe('Test Grubu');
      vi.useRealTimers();
    });

    it('loads state from localStorage', () => {
      const mockData = {
        group: { title: 'Loaded Grup' },
        settings: { theme: 'light' },
      };
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(mockData));
      const result = storage.load();
      expect(result).toBe(true);
      expect(state.get('group.title')).toBe('Loaded Grup');
    });

    it('returns false when no data in localStorage', () => {
      expect(storage.load()).toBe(false);
    });

    it('returns false for invalid JSON', () => {
      localStorage.setItem(CONFIG.STORAGE_KEY, 'not json');
      expect(storage.load()).toBe(false);
    });
  });

  describe('clear', () => {
    it('removes data from localStorage', () => {
      localStorage.setItem(CONFIG.STORAGE_KEY, '{"test":true}');
      storage.clear();
      expect(localStorage.getItem(CONFIG.STORAGE_KEY)).toBe(null);
    });
  });

  describe('hasData', () => {
    it('returns true when data exists', () => {
      localStorage.setItem(CONFIG.STORAGE_KEY, '{}');
      expect(storage.hasData()).toBe(true);
    });

    it('returns false when no data', () => {
      expect(storage.hasData()).toBe(false);
    });
  });

  describe('getSize', () => {
    it('returns 0 when no data', () => {
      expect(storage.getSize()).toBe(0);
    });

    it('returns size in bytes', () => {
      localStorage.setItem(CONFIG.STORAGE_KEY, '{"a":1}');
      expect(storage.getSize()).toBeGreaterThan(0);
    });
  });
});

// ========================================
//   sceneManager
// ========================================
describe('sceneManager', () => {
  describe('save / getAll', () => {
    it('saves a scene', () => {
      const scene = sceneManager.save('Test Sahne', { category: 'Eğitim' });
      expect(scene.name).toBe('Test Sahne');
      expect(scene.category).toBe('Eğitim');
      expect(scene).toHaveProperty('id');
      expect(scene).toHaveProperty('timestamp');
      expect(scene).toHaveProperty('lastAccessedAt');
      expect(scene).toHaveProperty('data');
    });

    it('uses Genel category for legacy or invalid categories', () => {
      const scene = sceneManager.save('Test Sahne', { category: 'Bilinmeyen' });
      expect(scene.category).toBe('Genel');

      localStorage.setItem(CONFIG.SCENES_KEY, JSON.stringify([
        { id: 1, name: 'Eski Sahne', timestamp: '2026-04-01T10:00:00.000Z', data: {} }
      ]));

      const all = sceneManager.getAll();
      expect(all[0].category).toBe('Genel');
      expect(all[0].lastAccessedAt).toBe('2026-04-01T10:00:00.000Z');
    });

    it('getAll returns saved scenes', () => {
      sceneManager.save('Sahne 1');
      sceneManager.save('Sahne 2');
      const all = sceneManager.getAll();
      expect(all).toHaveLength(2);
    });

    it('new scenes are prepended (most recent first)', () => {
      sceneManager.save('Eski');
      sceneManager.save('Yeni');
      const all = sceneManager.getAll();
      expect(all[0].name).toBe('Yeni');
    });

    it('getAll returns empty array when no scenes', () => {
      expect(sceneManager.getAll()).toEqual([]);
    });
  });

  describe('load', () => {
    it('loads a scene by id', () => {
      state.set('group.title', 'Sahne Grubu', true);
      const scene = sceneManager.save('Test');
      state.set('group.title', 'Değişti', true);
      const result = sceneManager.load(scene.id);
      expect(result).toBe(true);
      expect(state.get('group.title')).toBe('Sahne Grubu');
      expect(sceneManager.getLastLoaded().id).toBe(scene.id);
    });

    it('returns false for non-existent id', () => {
      expect(sceneManager.load(99999)).toBe(false);
    });
  });

  describe('recent and metadata', () => {
    it('returns recent scenes sorted by last access time', () => {
      localStorage.setItem(CONFIG.SCENES_KEY, JSON.stringify([
        { id: 1, name: 'Eski', timestamp: '2026-04-01T10:00:00.000Z', lastAccessedAt: '2026-04-01T10:00:00.000Z', data: {} },
        { id: 2, name: 'Yeni', timestamp: '2026-04-01T11:00:00.000Z', lastAccessedAt: '2026-04-03T10:00:00.000Z', data: {} },
        { id: 3, name: 'Orta', timestamp: '2026-04-01T12:00:00.000Z', lastAccessedAt: '2026-04-02T10:00:00.000Z', data: {} }
      ]));

      const recent = sceneManager.getRecent(2);
      expect(recent.map(scene => scene.name)).toEqual(['Yeni', 'Orta']);
    });

    it('updates scene metadata', () => {
      const scene = sceneManager.save('Metadata');
      const updated = sceneManager.updateMetadata(scene.id, {
        category: 'Müşteri Destek',
        lastAccessedAt: '2026-04-30T10:00:00.000Z'
      });

      expect(updated.category).toBe('Müşteri Destek');
      expect(updated.lastAccessedAt).toBe('2026-04-30T10:00:00.000Z');
      expect(sceneManager.getAll()[0].category).toBe('Müşteri Destek');
    });

    it('tracks the last loaded scene', () => {
      const scene = sceneManager.save('Son Yuklenen');
      sceneManager.setLastLoaded(scene.id);

      const lastLoaded = sceneManager.getLastLoaded();
      expect(lastLoaded.id).toBe(scene.id);
      expect(lastLoaded.name).toBe('Son Yuklenen');
    });

    it('returns false when updating missing scene metadata', () => {
      expect(sceneManager.updateMetadata(99999, { category: 'Reklam' })).toBe(false);
    });
  });

  describe('delete', () => {
    it('deletes a scene by id', () => {
      const scene = sceneManager.save('Silinecek');
      sceneManager.delete(scene.id);
      expect(sceneManager.getAll()).toHaveLength(0);
    });

    it('clears last loaded scene when it is deleted', () => {
      const scene = sceneManager.save('Silinecek');
      sceneManager.setLastLoaded(scene.id);
      sceneManager.delete(scene.id);
      expect(sceneManager.getLastLoaded()).toBe(null);
    });
  });

  describe('rename', () => {
    it('renames a scene', () => {
      const scene = sceneManager.save('Eski Ad');
      const result = sceneManager.rename(scene.id, 'Yeni Ad');
      expect(result).toBe(true);
      const all = sceneManager.getAll();
      expect(all[0].name).toBe('Yeni Ad');
    });

    it('returns false for non-existent id', () => {
      expect(sceneManager.rename(99999, 'Test')).toBe(false);
    });
  });
});

// ========================================
//   analyticsManager
// ========================================
describe('analyticsManager', () => {
  it('tracks anonymous events and filters sensitive metadata', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T12:00:00.000Z'));

    const event = analyticsManager.track('Play Button!', {
      source: 'toolbar',
      eventCount: 3,
      script: 'Me: hassas metin',
      messageText: 'gizli mesaj',
      longLabel: 'x'.repeat(120),
    });

    expect(event.name).toBe('play_button');
    const events = analyticsManager.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].metadata.source).toBe('toolbar');
    expect(events[0].metadata.eventCount).toBe(3);
    expect(events[0].metadata.script).toBeUndefined();
    expect(events[0].metadata.messageText).toBeUndefined();
    expect(events[0].metadata.longLabel).toHaveLength(80);
  });

  it('returns an empty list for invalid analytics storage', () => {
    localStorage.setItem(CONFIG.ANALYTICS_KEY, 'not json');
    expect(analyticsManager.getEvents()).toEqual([]);
  });

  it('prunes events outside the retention window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T12:00:00.000Z'));

    localStorage.setItem(CONFIG.ANALYTICS_KEY, JSON.stringify([
      { id: 'old', name: 'play', timestamp: '2026-03-15T12:00:00.000Z', metadata: {} },
      { id: 'fresh', name: 'screenshot', timestamp: '2026-04-25T12:00:00.000Z', metadata: {} },
    ]));

    expect(analyticsManager.getEvents().map(event => event.id)).toEqual(['fresh']);
  });

  it('builds a seven day usage summary', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T12:00:00.000Z'));

    analyticsManager.track('play');
    analyticsManager.track('screenshot');
    analyticsManager.track('scene_save');
    analyticsManager.track('template_load');

    const summary = analyticsManager.getSummary(7);
    expect(summary.totalEvents).toBe(4);
    expect(summary.actions.play).toBe(1);
    expect(summary.actions.screenshot).toBe(1);
    expect(summary.actions.sceneSave).toBe(1);
    expect(summary.actions.templateLoad).toBe(1);
    expect(Object.keys(summary.dailyCounts)).toHaveLength(7);
    expect(summary.dailyCounts['2026-05-01']).toBe(4);
  });

  it('summarizes onboarding drop-off and completion', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T12:00:00.000Z'));

    analyticsManager.recordOnboardingStep(1, 'opened');
    analyticsManager.recordOnboardingStep(1, 'viewed');
    analyticsManager.recordOnboardingStep(2, 'advanced');

    const inProgress = analyticsManager.getOnboardingFunnel(7);
    expect(inProgress.status).toBe('in_progress');
    expect(inProgress.dropOffStep).toBe(2);
    expect(inProgress.stepCounts[1]).toBe(2);

    analyticsManager.recordOnboardingStep(3, 'completed');
    const completed = analyticsManager.getOnboardingFunnel(7);
    expect(completed.status).toBe('completed');
    expect(completed.dropOffStep).toBe(null);
    expect(completed.completed).toBe(1);
  });

  it('clears only analytics data', () => {
    localStorage.setItem(CONFIG.STORAGE_KEY, '{"ok":true}');
    analyticsManager.track('play');

    analyticsManager.clear();

    expect(analyticsManager.getEvents()).toEqual([]);
    expect(localStorage.getItem(CONFIG.STORAGE_KEY)).toBe('{"ok":true}');
  });
});
