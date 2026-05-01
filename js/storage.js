/* ========================================
   STORAGE - LocalStorage Operations
   ======================================== */

import { state } from './state.js';
import { CONFIG } from './config.js';
import { debounce, safeJsonParse, downloadFile, Logger } from './utils.js';

export const SCENE_CATEGORIES = ['Genel', 'Reklam', 'Eğitim', 'Müşteri Destek', 'Topluluk'];
const DEFAULT_SCENE_CATEGORY = SCENE_CATEGORIES[0];
const LAST_SCENE_KEY = `${CONFIG.SCENES_KEY}_last_loaded`;
const DAY_MS = 24 * 60 * 60 * 1000;
const METADATA_DENYLIST = /text|message|script|content|raw|body|data|avatar|url|file|photo|image/i;

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

function normalizeAnalyticsName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.:-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

function normalizeAnalyticsMetadata(metadata = {}) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};

  return Object.entries(metadata).slice(0, 12).reduce((safe, [key, value]) => {
    const safeKey = String(key || '').trim().replace(/[^a-zA-Z0-9_:-]+/g, '_').slice(0, 40);
    if (!safeKey || METADATA_DENYLIST.test(safeKey)) return safe;

    if (typeof value === 'string') {
      safe[safeKey] = value.trim().slice(0, 80);
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      safe[safeKey] = value;
    } else if (typeof value === 'boolean') {
      safe[safeKey] = value;
    } else if (value === null) {
      safe[safeKey] = null;
    }

    return safe;
  }, {});
}

function analyticsDayKey(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function normalizeAnalyticsEvent(event) {
  const name = normalizeAnalyticsName(event?.name);
  const time = Date.parse(event?.timestamp || '');
  if (!name || Number.isNaN(time)) return null;

  const timestamp = new Date(time).toISOString();
  return {
    id: String(event?.id || `${time}_${name}`),
    name,
    timestamp,
    day: analyticsDayKey(timestamp),
    metadata: normalizeAnalyticsMetadata(event?.metadata),
  };
}

function isWithinDays(timestamp, days, now = new Date()) {
  const time = Date.parse(timestamp || '');
  if (Number.isNaN(time)) return false;
  return time >= now.getTime() - (days * DAY_MS);
}

function pruneAnalyticsEvents(events, now = new Date()) {
  const retentionDays = Number(CONFIG.ANALYTICS_RETENTION_DAYS) || 30;
  const maxEvents = Number(CONFIG.ANALYTICS_MAX_EVENTS) || 1000;
  const cutoff = now.getTime() - (retentionDays * DAY_MS);

  return events
    .map(normalizeAnalyticsEvent)
    .filter(Boolean)
    .filter(event => Date.parse(event.timestamp) >= cutoff)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
    .slice(-maxEvents);
}

function countEventsByName(events) {
  return events.reduce((counts, event) => {
    counts[event.name] = (counts[event.name] || 0) + 1;
    return counts;
  }, {});
}

function buildDailyCounts(events, days, now = new Date()) {
  const result = {};
  const anchor = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  for (let offset = days - 1; offset >= 0; offset--) {
    const day = new Date(anchor - (offset * DAY_MS)).toISOString().slice(0, 10);
    result[day] = 0;
  }

  events.forEach(event => {
    if (Object.prototype.hasOwnProperty.call(result, event.day)) {
      result[event.day] += 1;
    }
  });

  return result;
}

function buildAnalyticsRecommendation(actions, onboarding) {
  if (!actions.total) return 'Veri birikince sonraki odak daha net gorunecek.';
  if (onboarding.status === 'skipped' || onboarding.status === 'in_progress') {
    return 'Onboarding adimlarini kisaltma veya daha netlestirme oncelikli gorunuyor.';
  }
  if (actions.play === 0) return 'Ilk oynatma akisini daha gorunur hale getirmek oncelikli.';
  if (actions.screenshot === 0) return 'Ekran goruntusu alma aksiyonunu daha belirginlestirmek oncelikli.';
  if (actions.templateLoad > actions.play) return 'Sablondan oynatmaya gecisi guclendirmek iyi bir sonraki odak.';
  return 'Kullanim sinyalleri dengeli; Faz 35 akilli eslestirme icin veri birikiyor.';
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

// ========================================
//   LOCAL ANALYTICS
// ========================================

export const analyticsManager = {
  getEvents() {
    try {
      const raw = localStorage.getItem(CONFIG.ANALYTICS_KEY);
      const parsed = raw ? safeJsonParse(raw, []) : [];
      if (!Array.isArray(parsed)) return [];
      return pruneAnalyticsEvents(parsed);
    } catch (e) {
      Logger.warn('Analytics load error:', e);
      return [];
    }
  },

  _save(events) {
    try {
      localStorage.setItem(CONFIG.ANALYTICS_KEY, JSON.stringify(pruneAnalyticsEvents(events)));
    } catch (e) {
      Logger.warn('Analytics save error:', e);
    }
  },

  track(name, metadata = {}) {
    const eventName = normalizeAnalyticsName(name);
    if (!eventName) return null;

    const timestamp = new Date().toISOString();
    const event = {
      id: `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      name: eventName,
      timestamp,
      day: analyticsDayKey(timestamp),
      metadata: normalizeAnalyticsMetadata(metadata),
    };

    this._save([...this.getEvents(), event]);
    return event;
  },

  recordOnboardingStep(step, action) {
    const stepNumber = Number(step) || 0;
    return this.track('onboarding_step', {
      step: stepNumber > 0 ? stepNumber : null,
      action: String(action || 'viewed').trim() || 'viewed',
    });
  },

  getOnboardingFunnel(days = CONFIG.ANALYTICS_RETENTION_DAYS) {
    const safeDays = Math.max(1, Math.min(Number(days) || 30, CONFIG.ANALYTICS_RETENTION_DAYS));
    const events = this.getEvents()
      .filter(event => event.name === 'onboarding_step')
      .filter(event => isWithinDays(event.timestamp, safeDays));

    const stepCounts = { 1: 0, 2: 0, 3: 0 };
    let opened = 0;
    let completed = 0;
    let skipped = 0;
    let advanced = 0;
    let lastEvent = null;

    events.forEach(event => {
      const step = Number(event.metadata?.step) || 0;
      const action = String(event.metadata?.action || '');
      if (step >= 1 && step <= 3 && (action === 'opened' || action === 'viewed' || action === 'advanced')) {
        stepCounts[step] += 1;
      }
      if (action === 'opened') opened += 1;
      if (action === 'completed') completed += 1;
      if (action === 'skipped') skipped += 1;
      if (action === 'advanced') advanced += 1;
      if (!lastEvent || Date.parse(event.timestamp) >= Date.parse(lastEvent.timestamp)) {
        lastEvent = event;
      }
    });

    const viewedSteps = Object.entries(stepCounts)
      .filter(([, count]) => count > 0)
      .map(([step]) => Number(step));
    const lastStep = Number(lastEvent?.metadata?.step) || (viewedSteps.at(-1) || null);
    const status = completed > 0
      ? 'completed'
      : skipped > 0
        ? 'skipped'
        : opened > 0 || viewedSteps.length > 0
          ? 'in_progress'
          : 'not_started';

    return {
      opened,
      completed,
      skipped,
      advanced,
      status,
      dropOffStep: status === 'completed' || status === 'not_started' ? null : lastStep,
      lastAction: lastEvent?.metadata?.action || null,
      lastStep,
      stepCounts,
    };
  },

  getSummary(days = 7) {
    const safeDays = Math.max(1, Math.min(Number(days) || 7, CONFIG.ANALYTICS_RETENTION_DAYS));
    const events = this.getEvents().filter(event => isWithinDays(event.timestamp, safeDays));
    const eventsByName = countEventsByName(events);
    const onboarding = this.getOnboardingFunnel(safeDays);
    const actions = {
      total: events.length,
      appOpen: eventsByName.app_open || 0,
      scriptLoad: eventsByName.script_load || 0,
      play: eventsByName.play || 0,
      screenshot: eventsByName.screenshot || 0,
      sceneSave: eventsByName.scene_save || 0,
      sceneLoad: eventsByName.scene_load || 0,
      sceneDelete: eventsByName.scene_delete || 0,
      templateLoad: eventsByName.template_load || 0,
      groupBuilderPlay: eventsByName.group_builder_play || 0,
    };

    return {
      days: safeDays,
      totalEvents: events.length,
      eventsByName,
      dailyCounts: buildDailyCounts(events, safeDays),
      actions,
      onboarding,
      recommendation: buildAnalyticsRecommendation(actions, onboarding),
    };
  },

  clear() {
    try {
      localStorage.removeItem(CONFIG.ANALYTICS_KEY);
    } catch (e) {
      Logger.warn('Analytics clear error:', e);
    }
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
