/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CONFIG } from '../js/config.js';

// We need to test storage in isolation — re-import fresh instances
let storage, sceneManager, state;

beforeEach(async () => {
  localStorage.clear();
  // Dynamic import to get fresh module per test
  vi.resetModules();
  const stateModule = await import('../js/state.js');
  const storageModule = await import('../js/storage.js');
  storage = storageModule.storage;
  sceneManager = storageModule.sceneManager;
  state = stateModule.state;
});

afterEach(() => {
  vi.restoreAllMocks();
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
      const scene = sceneManager.save('Test Sahne');
      expect(scene.name).toBe('Test Sahne');
      expect(scene).toHaveProperty('id');
      expect(scene).toHaveProperty('timestamp');
      expect(scene).toHaveProperty('data');
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
    });

    it('returns false for non-existent id', () => {
      expect(sceneManager.load(99999)).toBe(false);
    });
  });

  describe('delete', () => {
    it('deletes a scene by id', () => {
      const scene = sceneManager.save('Silinecek');
      sceneManager.delete(scene.id);
      expect(sceneManager.getAll()).toHaveLength(0);
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
