/* ========================================
   STORAGE - LocalStorage Operations
   ======================================== */

import { state } from './state.js';
import { CONFIG } from './config.js';
import { debounce, safeJsonParse, downloadFile, Logger } from './utils.js';

export const SCENE_CATEGORIES = ['Genel', 'Reklam', 'Eğitim', 'Müşteri Destek', 'Topluluk'];
const DEFAULT_SCENE_CATEGORY = SCENE_CATEGORIES[0];
const LAST_SCENE_KEY = `${CONFIG.SCENES_KEY}_last_loaded`;

function normalizeSceneCategory(category) {
  const value = String(category || '').trim();
  return SCENE_CATEGORIES.includes(value) ? value : DEFAULT_SCENE_CATEGORY;
}

function normalizeScene(scene) {
  const timestamp = scene?.timestamp || new Date(0).toISOString();
  return {
    ...scene,
    name: String(scene?.name || 'Adsız Sahne').trim() || 'Adsız Sahne',
    category: normalizeSceneCategory(scene?.category),
    timestamp,
    lastAccessedAt: scene?.lastAccessedAt || timestamp,
  };
}

function sceneTimeValue(scene, key) {
  const time = Date.parse(scene?.[key] || '');
  return Number.isNaN(time) ? 0 : time;
}



/**
 * Storage Manager
 */
export const storage = {
  /**
   * Save state to localStorage (debounced)
   */
  save: debounce(() => {
    try {
      const data = state.export();
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
      Logger.info('💾 State saved');
    } catch (e) {
      Logger.warn('LocalStorage save error:', e);
    }
  }, 1000),

  /**
   * Load state from localStorage
   */
  load() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!raw) return false;

      const data = safeJsonParse(raw);
      if (!data) return false;

      state.import(data);
      Logger.info('📂 State loaded');
      return true;
    } catch (e) {
      Logger.warn('LocalStorage load error:', e);
      return false;
    }
  },

  /**
   * Clear localStorage
   */
  clear() {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      Logger.info('🗑️ Storage cleared');
    } catch (e) {
      Logger.warn('LocalStorage clear error:', e);
    }
  },

  /**
   * Export state to JSON file
   */
  exportToFile() {
    const data = state.export();
    const json = JSON.stringify(data, null, 2);
    const filename = `whatsapp_scenario_${Date.now()}.json`;
    downloadFile(json, filename, 'application/json');
    return filename;
  },

  /**
   * Import state from JSON file
   */
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          state.import(data);
          storage.save();
          resolve(data);
        } catch (e) {
          reject(new Error('Geçersiz JSON dosyası: ' + e.message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Dosya okunamadı'));
      };

      reader.readAsText(file);
    });
  },

  /**
   * Check if data exists
   */
  hasData() {
    return !!localStorage.getItem(CONFIG.STORAGE_KEY);
  },

  /**
   * Get storage size
   */
  getSize() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!data) return 0;
    return new Blob([data]).size;
  }
};

// ========================================
//   SCENE MANAGEMENT
// ========================================

export const sceneManager = {
  /**
   * Tüm sahneleri getir
   */
  getAll() {
    try {
      const raw = localStorage.getItem(CONFIG.SCENES_KEY);
      const scenes = raw ? JSON.parse(raw) : [];
      return Array.isArray(scenes) ? scenes.map(normalizeScene) : [];
    } catch (e) {
      Logger.warn('Scene load error:', e);
      return [];
    }
  },

  /**
   * Sahneleri localStorage'a yaz
   */
  _save(scenes) {
    try {
      localStorage.setItem(CONFIG.SCENES_KEY, JSON.stringify(scenes.map(normalizeScene)));
    } catch (e) {
      Logger.warn('Scene save error:', e);
    }
  },

  /**
   * Mevcut state'i isimli sahne olarak kaydet
   */
  save(name, options = {}) {
    const scenes = this.getAll();
    const now = new Date().toISOString();
    const scene = {
      id: Date.now(),
      name: name.trim(),
      category: normalizeSceneCategory(options.category),
      timestamp: now,
      lastAccessedAt: now,
      data: state.export()
    };
    scenes.unshift(scene);
    this._save(scenes);
    Logger.info('🎬 Scene saved:', name);
    return scene;
  },

  /**
   * Sahneyi yükle (state'e import et)
   */
  load(id) {
    const scenes = this.getAll();
    const scene = scenes.find(s => s.id === id);
    if (!scene) return false;
    state.import(scene.data);
    this.setLastLoaded(id);
    storage.save();
    Logger.info('🎬 Scene loaded:', scene.name);
    return true;
  },

  /**
   * Hizli erisim icin son kullanilan sahneleri getir
   */
  getRecent(limit = 5) {
    return this.getAll()
      .sort((a, b) => {
        const accessedDiff = sceneTimeValue(b, 'lastAccessedAt') - sceneTimeValue(a, 'lastAccessedAt');
        if (accessedDiff !== 0) return accessedDiff;
        return sceneTimeValue(b, 'timestamp') - sceneTimeValue(a, 'timestamp');
      })
      .slice(0, limit);
  },

  getLastLoaded() {
    try {
      const id = Number(localStorage.getItem(LAST_SCENE_KEY));
      if (!id) return null;
      const scene = this.getAll().find(s => s.id === id);
      if (!scene) {
        localStorage.removeItem(LAST_SCENE_KEY);
        return null;
      }
      return scene;
    } catch (e) {
      Logger.warn('Last scene load error:', e);
      return null;
    }
  },

  setLastLoaded(id) {
    const scene = this.updateMetadata(id, { lastAccessedAt: new Date().toISOString() });
    if (!scene) return false;
    try {
      localStorage.setItem(LAST_SCENE_KEY, String(id));
    } catch (e) {
      Logger.warn('Last scene save error:', e);
    }
    return true;
  },

  updateMetadata(id, patch = {}) {
    const scenes = this.getAll();
    const scene = scenes.find(s => s.id === id);
    if (!scene) return false;

    if (Object.prototype.hasOwnProperty.call(patch, 'category')) {
      scene.category = normalizeSceneCategory(patch.category);
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'lastAccessedAt')) {
      scene.lastAccessedAt = patch.lastAccessedAt || scene.lastAccessedAt;
    }

    this._save(scenes);
    return scene;
  },

  /**
   * Sahneyi sil
   */
  delete(id) {
    const scenes = this.getAll();
    const filtered = scenes.filter(s => s.id !== id);
    this._save(filtered);
    if (this.getLastLoaded()?.id === id) {
      try {
        localStorage.removeItem(LAST_SCENE_KEY);
      } catch {
        // no-op
      }
    }
    Logger.info('🎬 Scene deleted');
    return true;
  },

  /**
   * Sahne adını değiştir
   */
  rename(id, newName) {
    const scenes = this.getAll();
    const scene = scenes.find(s => s.id === id);
    if (!scene) return false;
    scene.name = newName.trim();
    this._save(scenes);
    return true;
  }
};

/**
 * Auto-save on state changes
 */
export function initAutoSave() {
  // Subscribe to state changes
  state.subscribe(() => {
    storage.save();
  });

  // Periodic save as backup
  setInterval(() => {
    storage.save();
  }, CONFIG.AUTO_SAVE_INTERVAL);

  Logger.info('⚡ Auto-save initialized');
}
