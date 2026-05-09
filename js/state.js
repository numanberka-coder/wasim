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

function createSafeConversationId(value, fallback = 'conversation') {
  return cleanText(value, fallback)
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    || fallback;
}

function createUniqueConversationId(value, existingIds, fallback = 'conversation') {
  const base = createSafeConversationId(value, fallback);
  let candidate = base;
  let index = 2;
  while (existingIds.has(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  existingIds.add(candidate);
  return candidate;
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
  const hasOwn = (key) => Object.prototype.hasOwnProperty.call(item || {}, key);
  const messages = Array.isArray(item?.messages)
    ? item.messages.map((message, index) => normalizeMessage(message, index))
    : deepClone(base.messages);
  const fallbackSeq = messages.reduce((max, message) => Math.max(max, Number(message.id) || 0), -1) + 1;

  return {
    id: cleanText(item?.id, base.id || DEFAULT_CONVERSATION_ID),
    title: hasOwn('title') ? String(item.title ?? '').trim() : cleanText(base.title, DEFAULT_STATE.groupTitle),
    subtitle: hasOwn('subtitle') ? String(item.subtitle ?? '').trim() : cleanText(base.subtitle, DEFAULT_STATE.groupSubtitle),
    photoUrl: hasOwn('photoUrl') ? String(item.photoUrl ?? '').trim() : cleanText(base.photoUrl, ''),
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
  const existingIds = new Set();
  const items = rawItems
    .map((item, index) => {
      const normalized = normalizeConversation(item, index === 0 ? fallback : null);
      normalized.id = createUniqueConversationId(
        normalized.id,
        existingIds,
        index === 0 ? DEFAULT_CONVERSATION_ID : `conversation-${index + 1}`
      );
      return normalized;
    })
    .filter((item) => item.id);

  if (!items.length) {
    existingIds.add(fallback.id);
    items.push(fallback);
  }

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

function shouldSyncConversationFromPath(path) {
  return (
    path === 'messages' ||
    path === 'messageSeq' ||
    path === 'group' ||
    path.startsWith('group.')
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
    if (shouldSyncConversationFromPath(path)) {
      this.syncActiveConversationFromLegacy();
    }
    if (!silent) this.notify(path);
  }

  ensureConversations() {
    this.data.conversations = normalizeConversations(
      this.data.conversations,
      this.data.group,
      this.data.messages,
      this.data.messageSeq
    );
    return this.data.conversations;
  }

  getActiveConversation() {
    const conversations = this.ensureConversations();
    return conversations.items.find((item) => item.id === conversations.activeId) || conversations.items[0];
  }

  syncActiveConversationFromLegacy() {
    const conversations = this.ensureConversations();
    const activeIndex = conversations.items.findIndex((item) => item.id === conversations.activeId);
    if (activeIndex < 0) return null;

    const active = conversations.items[activeIndex];
    const messages = Array.isArray(this.data.messages)
      ? this.data.messages.map((message, index) => normalizeMessage(message, index))
      : [];
    const fallbackSeq = messages.reduce((max, message) => Math.max(max, Number(message.id) || 0), -1) + 1;
    const updated = {
      ...active,
      title: String(this.data.group.title ?? '').trim(),
      subtitle: String(this.data.group.subtitle ?? '').trim(),
      photoUrl: String(this.data.group.photoUrl ?? '').trim(),
      avatarDataUrl: this.data.group.avatarDataUrl,
      messages,
      messageSeq: typeof this.data.messageSeq === 'number' ? this.data.messageSeq : fallbackSeq,
    };

    conversations.items[activeIndex] = updated;
    return updated;
  }

  applyConversationToLegacy(conversation) {
    const active = normalizeConversation(conversation, createDefaultConversation(this.data.group, this.data.messages, this.data.messageSeq));
    this.data.group = {
      ...this.data.group,
      title: active.title,
      subtitle: active.subtitle,
      photoUrl: active.photoUrl,
      avatarDataUrl: active.avatarDataUrl,
    };
    this.data.messages = deepClone(active.messages);
    this.data.messageSeq = active.messageSeq;
    return active;
  }

  selectConversation(id, silent = false) {
    this.syncActiveConversationFromLegacy();
    const conversations = this.ensureConversations();
    const next = conversations.items.find((item) => item.id === id) || conversations.items[0];
    conversations.activeId = next.id;
    this.applyConversationToLegacy(next);
    if (!silent) this.notify('conversations.activeId');
    return next;
  }

  addConversation(input = {}, silent = false) {
    this.syncActiveConversationFromLegacy();
    const conversations = this.ensureConversations();
    const existingIds = new Set(conversations.items.map((item) => item.id));
    const title = cleanText(input.title, 'Yeni sohbet');
    const firstMessage = cleanText(input.firstMessage, '');
    const messages = firstMessage
      ? [normalizeMessage({
        id: 0,
        speaker: this.data.selfName || DEFAULT_STATE.selfName,
        text: firstMessage,
        time: nowTime(),
      }, 0)]
      : [];
    const conversation = normalizeConversation({
      id: createUniqueConversationId(input.id || title, existingIds, `conversation-${conversations.items.length + 1}`),
      title,
      subtitle: cleanText(input.subtitle, 'Sohbet detayini ac'),
      photoUrl: cleanText(input.photoUrl || input.avatarUrl, ''),
      avatarDataUrl: input.avatarDataUrl || null,
      messages,
      messageSeq: messages.length,
    }, createDefaultConversation({ title, subtitle: input.subtitle, photoUrl: input.photoUrl }, messages, messages.length));

    conversations.items.push(conversation);
    conversations.activeId = conversation.id;
    this.applyConversationToLegacy(conversation);
    if (!silent) this.notify('conversations');
    return conversation;
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
    this.syncActiveConversationFromLegacy();
    this.notify('messages');
    return message;
  }

  /**
   * Clear messages
   */
  clearMessages() {
    this.data.messages = [];
    this.data.messageSeq = 0;
    this.syncActiveConversationFromLegacy();
    this.notify('messages');
  }

  /**
   * Export state for storage
   */
  export() {
    this.syncActiveConversationFromLegacy();
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
    this.applyConversationToLegacy(this.getActiveConversation());
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
