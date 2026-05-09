/* ========================================
   STATE - Application State Management
   ======================================== */

import { DEFAULT_STATE, DEFAULT_PEOPLE, COLOR_POOL, THEME_DEFAULTS } from './config.js';
import { deepClone, nowTime } from './utils.js';

const DEFAULT_CONVERSATION_ID = 'default';

const DEFAULT_PHONE_SHELL_CONTENT = Object.freeze({
  updates: {
    status: {
      title: 'Durumum',
      meta: 'Durum guncellemesi eklemek icin dokunun',
      note: 'Durum guncellemeleriniz 24 saat sonra kaybolur.',
    },
    channels: {
      title: 'Kanallar',
      description: 'Ilgilendiginiz konulardan haber almak icin kanallari takip edin.',
      discoverLabel: 'Kesfet',
      createLabel: 'Kanal olustur',
    },
  },
  communities: {
    title: 'Topluluklar sayesinde baglantida kalin',
    description: 'Ilgili gruplari bir araya getirin, duyurulari kolayca paylasin ve herkesin ayni yerde kalmasini saglayin.',
    linkLabel: 'Ornek topluluklari gor',
    ctaLabel: 'Toplulugunuzu olusturun',
  },
  calls: {
    editorDraft: {
      title: 'Yeni arama',
      description: 'Arama listesi duzenleme altyapisi hazir.',
    },
  },
});

function cleanText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizeMessage(message, index = 0, baseTime = nowTime()) {
  return {
    id: typeof message?.id === 'number' ? message.id : index,
    speaker: message?.speaker || '?',
    text: message?.text || '',
    replyTo: message?.replyTo || null,
    time: message?.time || baseTime,
    kind: message?.kind || null,
    src: message?.src || null,
    durationSec: (typeof message?.durationSec === 'number') ? message.durationSec : (message?.durationSec ?? null),
    tickStatus: message?.tickStatus || null,
    reactions: Array.isArray(message?.reactions) ? message.reactions : [],
  };
}

function createDefaultConversation(group = {}, messages = [], messageSeq = 0) {
  const safeMessages = Array.isArray(messages)
    ? messages.map((message, index) => normalizeMessage(message, index))
    : [];
  const fallbackSeq = safeMessages.reduce((max, message) => Math.max(max, Number(message.id) || 0), -1) + 1;

  return {
    id: DEFAULT_CONVERSATION_ID,
    title: cleanText(group.title, DEFAULT_STATE.groupTitle),
    subtitle: cleanText(group.subtitle, DEFAULT_STATE.groupSubtitle),
    photoUrl: cleanText(group.photoUrl, ''),
    avatarDataUrl: group.avatarDataUrl || null,
    messages: safeMessages,
    messageSeq: typeof messageSeq === 'number' ? messageSeq : fallbackSeq,
  };
}

function normalizeConversation(item, fallback) {
  const base = fallback || createDefaultConversation();
  const messages = Array.isArray(item?.messages)
    ? item.messages.map((message, index) => normalizeMessage(message, index))
    : deepClone(base.messages);
  const fallbackSeq = messages.reduce((max, message) => Math.max(max, Number(message.id) || 0), -1) + 1;

  return {
    id: cleanText(item?.id, base.id || DEFAULT_CONVERSATION_ID),
    title: cleanText(item?.title, base.title),
    subtitle: cleanText(item?.subtitle, base.subtitle),
    photoUrl: cleanText(item?.photoUrl, base.photoUrl),
    avatarDataUrl: item?.avatarDataUrl || base.avatarDataUrl || null,
    messages,
    messageSeq: typeof item?.messageSeq === 'number' ? item.messageSeq : fallbackSeq,
  };
}

function normalizeConversations(value, group, messages, messageSeq) {
  const fallback = createDefaultConversation(group, messages, messageSeq);
  if (!value || typeof value !== 'object') {
    return { activeId: fallback.id, items: [fallback] };
  }

  const rawItems = Array.isArray(value.items) ? value.items : [];
  const items = rawItems
    .map((item, index) => normalizeConversation(item, index === 0 ? fallback : null))
    .filter((item) => item.id);

  if (!items.length) items.push(fallback);

  const activeId = items.some((item) => item.id === value.activeId)
    ? value.activeId
    : items[0].id;

  return { activeId, items };
}

function mergeDefaults(defaults, value) {
  if (!value || typeof value !== 'object') return deepClone(defaults);
  const output = Array.isArray(defaults) ? [] : {};

  Object.entries(defaults).forEach(([key, defaultValue]) => {
    const nextValue = value[key];
    if (
      defaultValue &&
      typeof defaultValue === 'object' &&
      !Array.isArray(defaultValue)
    ) {
      output[key] = mergeDefaults(defaultValue, nextValue);
    } else if (typeof defaultValue === 'string') {
      output[key] = cleanText(nextValue, defaultValue);
    } else {
      output[key] = nextValue ?? deepClone(defaultValue);
    }
  });

  return output;
}

function normalizePhoneShellContent(value) {
  return mergeDefaults(DEFAULT_PHONE_SHELL_CONTENT, value);
}

function shouldMirrorLegacyConversation(conversations) {
  return (
    conversations?.activeId === DEFAULT_CONVERSATION_ID &&
    Array.isArray(conversations.items) &&
    conversations.items.length === 1 &&
    conversations.items[0]?.id === DEFAULT_CONVERSATION_ID
  );
}

/**
 * Reactive State Manager
 */
export class StateManager {
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
        headerTextColor: DEFAULT_STATE.headerTextColor,
        headerIconColor: DEFAULT_STATE.headerIconColor,
        bubbleOutColor: DEFAULT_STATE.bubbleOutColor,
        bubbleInColor: DEFAULT_STATE.bubbleInColor,
        tickStatus: DEFAULT_STATE.tickStatus,
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

      // Phone home data
      conversations: null,
      phoneShellContent: normalizePhoneShellContent(),

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

      // Self (which person represents the user)
      selfName: DEFAULT_STATE.selfName,

      // Colors cache
      colorBySpeaker: new Map(),
    };

    this.listeners = new Set();
    this.data.conversations = normalizeConversations(
      null,
      this.data.group,
      this.data.messages,
      this.data.messageSeq
    );
  }

  /**
   * Check if a speaker name is the "self" user
   */
  isSelf(name) {
    return String(name).toLowerCase() === String(this.data.selfName).toLowerCase();
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
      .filter(n => !this.isSelf(n))
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
    const message = { id, ...msg, tickStatus: msg.tickStatus || null, reactions: Array.isArray(msg.reactions) ? msg.reactions : [] };
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
    this.data.conversations = normalizeConversations(
      this.data.conversations,
      this.data.group,
      this.data.messages,
      this.data.messageSeq
    );
    if (shouldMirrorLegacyConversation(this.data.conversations)) {
      this.data.conversations.items[0] = createDefaultConversation(
        this.data.group,
        this.data.messages,
        this.data.messageSeq
      );
    }
    this.data.phoneShellContent = normalizePhoneShellContent(this.data.phoneShellContent);

    return {
      people: this.data.people,
      selfName: this.data.selfName,
      group: this.data.group,
      settings: this.data.settings,
      messageTimes: this.data.messageTimes,
      messages: this.data.messages,
      messageSeq: this.data.messageSeq,
      conversations: deepClone(this.data.conversations),
      phoneShellContent: deepClone(this.data.phoneShellContent),
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
    if (data.selfName) this.data.selfName = data.selfName;

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
      this.data.messages = data.messages.map((m, idx) => normalizeMessage(m, idx, this.data.messageTimes.baseTime));
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

    this.data.conversations = normalizeConversations(
      data.conversations,
      this.data.group,
      this.data.messages,
      this.data.messageSeq
    );
    this.data.phoneShellContent = normalizePhoneShellContent(data.phoneShellContent);

    this.notify();
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.data.people = deepClone(DEFAULT_PEOPLE);
    this.data.selfName = DEFAULT_STATE.selfName;
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
      wallpaperColor: THEME_DEFAULTS.dark.wallpaperColor,
      wallpaperImageDataUrl: null,
      batteryVisible: true,
      batteryPercent: 95,
      batteryHealth: 100,
      chatFontSize: 14,
      chatLineHeight: 1.4,
      bubbleSize: 78,
      bubblePaddingY: 10,
      headerColor: THEME_DEFAULTS.dark.headerColor,
      headerTextColor: null,
      headerIconColor: null,
      bubbleOutColor: null,
      bubbleInColor: null,
      tickStatus: 'read',
    };

    this.data.messageTimes = {
      auto: true,
      baseTime: nowTime(),
      increment: 1,
    };

    this.data.messages = [];
    this.data.messageSeq = 0;
    this.data.conversations = normalizeConversations(
      null,
      this.data.group,
      this.data.messages,
      this.data.messageSeq
    );
    this.data.phoneShellContent = normalizePhoneShellContent();

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
export const state = new StateManager();
