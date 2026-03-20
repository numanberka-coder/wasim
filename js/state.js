/* ========================================
   STATE - Application State Management
   ======================================== */



/**
 * Reactive State Manager
 */
class StateManager {
  constructor() {
    this.data = {
      // People & Active members
      people: deepClone(DEFAULT_PEOPLE),
      active: new Set(),
      editingName: null,
      pendingPersonAvatarDataUrl: null,

      // Group settings
      group: {
        title: DEFAULT_STATE.groupTitle,
        subtitle: DEFAULT_STATE.groupSubtitle,
        dayLabel: DEFAULT_STATE.dayLabel,
        photoUrl: DEFAULT_STATE.groupPhotoUrl,
        avatarDataUrl: DEFAULT_STATE.groupAvatarDataUrl,
      },

      // Phone settings
      settings: {
        theme: DEFAULT_STATE.theme,
        statusTimeOverride: DEFAULT_STATE.statusTimeOverride,
        wallpaperPreset: DEFAULT_STATE.wallpaperPreset,
        wallpaperColor: DEFAULT_STATE.wallpaperColor,
        wallpaperImageDataUrl: DEFAULT_STATE.wallpaperImageDataUrl,
        batteryVisible: DEFAULT_STATE.batteryVisible,
        batteryPercent: DEFAULT_STATE.batteryPercent,
        batteryHealth: DEFAULT_STATE.batteryHealth,
        chatFontSize: DEFAULT_STATE.chatFontSize,
        chatLineHeight: DEFAULT_STATE.chatLineHeight,
        bubbleSize: DEFAULT_STATE.bubbleSize,
        bubblePaddingY: DEFAULT_STATE.bubblePaddingY,
        headerColor: DEFAULT_STATE.headerColor,
      },

      // Message times
      messageTimes: {
        auto: DEFAULT_STATE.messageTimesAuto,
        baseTime: nowTime(),
        increment: DEFAULT_STATE.messageIncrement,
      },

      // Messages
      messages: [],
      messageSeq: 0,

      // Player
      player: {
        queue: [],
        cursor: 0,
        paused: false,
        playTimer: null,
        typingTimer: null,
        speed: DEFAULT_STATE.speed,
        jitter: DEFAULT_STATE.jitter,
        script: '',
      },

      // Colors cache
      colorBySpeaker: new Map(),
    };

    this.listeners = new Set();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all subscribers
   */
  notify(path = null) {
    for (const callback of this.listeners) {
      callback(path);
    }
  }

  /**
   * Get nested value by path
   */
  get(path) {
    if (!path) return this.data;
    return path.split('.').reduce((obj, key) => obj?.[key], this.data);
  }

  /**
   * Set nested value by path
   */
  set(path, value, silent = false) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!(key in obj)) obj[key] = {};
      return obj[key];
    }, this.data);
    target[last] = value;
    if (!silent) this.notify(path);
  }

  /**
   * Recompute colors for active speakers
   */
  recomputeColors() {
    this.data.colorBySpeaker.clear();
    const activeNames = Array.from(this.data.active)
      .filter(n => String(n).toLowerCase() !== 'me')
      .sort((a, b) => a.localeCompare(b, 'tr'));

    activeNames.forEach((name, idx) => {
      this.data.colorBySpeaker.set(name, COLOR_POOL[idx % COLOR_POOL.length]);
    });
  }

  /**
   * Get color for speaker
   */
  getColorForSpeaker(name) {
    return this.data.colorBySpeaker.get(name) || 'var(--wa-text)';
  }

  /**
   * Add person to active set
   */
  addActive(name) {
    this.data.active.add(name);
    this.recomputeColors();
    this.notify('active');
  }

  /**
   * Remove person from active set
   */
  removeActive(name) {
    this.data.active.delete(name);
    this.recomputeColors();
    this.notify('active');
  }

  /**
   * Clear all active
   */
  clearActive() {
    this.data.active.clear();
    this.recomputeColors();
    this.notify('active');
  }

  /**
   * Check if person is active
   */
  isActive(name) {
    return this.data.active.has(name);
  }

  /**
   * Add message
   */
  addMessage(msg) {
    const id = this.data.messageSeq++;
    const message = { id, ...msg, reactions: Array.isArray(msg.reactions) ? msg.reactions : [] };
    this.data.messages.push(message);
    this.notify('messages');
    return message;
  }

  /**
   * Clear messages
   */
  clearMessages() {
    this.data.messages = [];
    this.data.messageSeq = 0;
    this.notify('messages');
  }

  /**
   * Export state for storage
   */
  export() {
    return {
      people: this.data.people,
      group: this.data.group,
      settings: this.data.settings,
      messageTimes: this.data.messageTimes,
      messages: this.data.messages,
      messageSeq: this.data.messageSeq,
      player: {
        speed: this.data.player.speed,
        jitter: this.data.player.jitter,
        script: this.data.player.script,
      },
    };
  }

  /**
   * Import state from storage
   */
  import(data) {
    if (data.people) this.data.people = data.people;

    if (data.group) {
      Object.assign(this.data.group, data.group);
    }

    if (data.settings) {
      Object.assign(this.data.settings, data.settings);
    }

    if (data.messageTimes) {
      Object.assign(this.data.messageTimes, data.messageTimes);
    }

    if (data.messages) {
      this.data.messages = data.messages.map((m, idx) => ({
        id: typeof m.id === 'number' ? m.id : idx,
        speaker: m.speaker || '?',
        text: m.text || '',
        replyTo: m.replyTo || null,
        time: m.time || this.data.messageTimes.baseTime,
        kind: m.kind || null,
        src: m.src || null,
        durationSec: (typeof m.durationSec === 'number') ? m.durationSec : (m.durationSec ?? null),
      }));
    }

    if (typeof data.messageSeq === 'number') {
      this.data.messageSeq = data.messageSeq;
    } else if (this.data.messages.length) {
      const maxId = this.data.messages.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0);
      this.data.messageSeq = maxId + 1;
    }

    if (data.player) {
      this.data.player.speed = data.player.speed || DEFAULT_STATE.speed;
      this.data.player.jitter = data.player.jitter || DEFAULT_STATE.jitter;
      this.data.player.script = data.player.script || '';
    }

    this.notify();
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.data.people = deepClone(DEFAULT_PEOPLE);
    this.data.active.clear();
    this.data.editingName = null;
    this.data.pendingPersonAvatarDataUrl = null;

    this.data.group = {
      title: DEFAULT_STATE.groupTitle,
      subtitle: DEFAULT_STATE.groupSubtitle,
      dayLabel: DEFAULT_STATE.dayLabel,
      photoUrl: '',
      avatarDataUrl: null,
    };

    this.data.settings = {
      theme: 'dark',
      statusTimeOverride: '',
      wallpaperPreset: 'default',
      wallpaperColor: '#0b141a',
      wallpaperImageDataUrl: null,
      batteryVisible: true,
      batteryPercent: 95,
      batteryHealth: 100,
      chatFontSize: 14,
      chatLineHeight: 1.4,
      bubbleSize: 78,
      bubblePaddingY: 10,
      headerColor: '#1f2c33',
    };

    this.data.messageTimes = {
      auto: true,
      baseTime: nowTime(),
      increment: 1,
    };

    this.data.messages = [];
    this.data.messageSeq = 0;

    this.data.player = {
      queue: [],
      cursor: 0,
      paused: false,
      playTimer: null,
      typingTimer: null,
      speed: 900,
      jitter: 250,
      script: '',
    };

    this.data.colorBySpeaker.clear();
    this.notify();
  }
}

// Export singleton instance
const state = new StateManager();
