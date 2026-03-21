/* ========================================
   STORAGE - LocalStorage Operations
   ======================================== */




/**
 * Storage Manager
 */
const storage = {
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

const sceneManager = {
  /**
   * Tüm sahneleri getir
   */
  getAll() {
    try {
      const raw = localStorage.getItem(CONFIG.SCENES_KEY);
      return raw ? JSON.parse(raw) : [];
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
      localStorage.setItem(CONFIG.SCENES_KEY, JSON.stringify(scenes));
    } catch (e) {
      Logger.warn('Scene save error:', e);
    }
  },

  /**
   * Mevcut state'i isimli sahne olarak kaydet
   */
  save(name) {
    const scenes = this.getAll();
    const scene = {
      id: Date.now(),
      name: name.trim(),
      timestamp: new Date().toISOString(),
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
    storage.save();
    Logger.info('🎬 Scene loaded:', scene.name);
    return true;
  },

  /**
   * Sahneyi sil
   */
  delete(id) {
    const scenes = this.getAll();
    const filtered = scenes.filter(s => s.id !== id);
    this._save(filtered);
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
function initAutoSave() {
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
