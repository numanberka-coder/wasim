/* ========================================
   PLAYER - Script Player
   ======================================== */

import { $, readFileAsDataURL, Logger, parseSVG } from '../utils.js';
import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { showToast, showError } from '../ui/toast.js';
import { EventType, parseScriptDetailed } from './script-parser.js';
import { addMessage, addSystemMessage, addTypingBubble, removeTypingBubble, clearChat, findMessageByTarget, applyReactionToMessage } from '../phone/messages.js';
import { renderPeopleList, refreshManualSenderOptions } from './people.js';
import { syncHeader } from '../phone/header.js';
import { interactive, disableInteractiveMode, handleInteractiveInput } from './interactive-engine.js';

// Aktif tik durumu — senaryo içinde @sent/@delivered/@read ile değişir
let activeTickStatus = null;
let playbackGeneration = 0;
let playbackTarget = null;
let playbackOwner = null;
let running = false;
const pendingTimers = new Set();
const typingRows = new Set();

function currentTarget() {
  return state.get('conversations.activeId');
}

function scheduleTyping(callback, delay, row = null) {
  const owner = state.get('player');
  const target = currentTarget();
  const generation = playbackGeneration;
  if (row) typingRows.add(row);
  const timer = setTimeout(() => {
    pendingTimers.delete(timer);
    if (owner.typingTimer === timer) owner.typingTimer = null;
    if (row) {
      removeTypingBubble(row);
      typingRows.delete(row);
    }
    if (generation !== playbackGeneration) return;
    if (owner !== state.get('player') || target !== currentTarget()) {
      pause();
      return;
    }
    callback();
  }, delay);
  pendingTimers.add(timer);
  owner.typingTimer = timer;
}

// Conversation switches and project imports must cancel work before a timer can
// append its message to the newly selected conversation.
state.subscribe(path => {
  if (path === 'player.playback') return;
  if (!path) {
    pause();
    // Imports mutate the existing player object; its previous queue is no longer
    // a valid continuation even when the imported conversation has the same ID.
    playbackOwner = null;
    playbackTarget = null;
    state.get('player').queue = [];
    state.get('player').cursor = 0;
    notifyPlaybackState();
    return;
  }
  if ((running || pendingTimers.size) &&
      playbackOwner &&
      (playbackOwner !== state.get('player') || playbackTarget !== currentTarget())) pause();
});

function isPlayerPlaying() {
  const player = state.get('player');
  return Boolean(!player.paused && (player.playTimer || player.typingTimer));
}

function notifyPlaybackState() {
  state.notify('player.playback');
}

function notifyScriptIssues(result) {
  const summary = result?.summary;
  if (!summary) return;

  if (summary.errors > 0 && summary.eventCount > 0) {
    showError(`${summary.errors} hatalı satır atlandı; geçerli satırlar yüklendi.`);
    return;
  }

  if (summary.errors > 0) {
    showError(`${summary.errors} hata bulundu. Senaryoda oynatılacak geçerli satır yok.`);
    return;
  }

  if (summary.warnings > 0) {
    showToast(`${summary.warnings} uyarı düzeltildi; senaryo yüklendi.`);
  }
}






/**
 * Calculate base delay with jitter
 */
function getBaseDelay() {
  const player = state.get('player');
  const base = Math.max(120, Number(player.speed) || CONFIG.DEFAULT_SPEED);
  const jitter = Number(player.jitter) || 0;
  const delta = jitter ? (Math.random() * 2 * jitter - jitter) : 0;
  return Math.max(CONFIG.MIN_DELAY, base + delta);
}

/**
 * Calculate typing duration based on text length
 */
function getTypingDuration(text) {
  const len = String(text || '').length;
  const ms = CONFIG.TYPING_BASE_MS + 
    Math.min(2000, len * CONFIG.TYPING_CHAR_MS) + 
    Math.random() * CONFIG.TYPING_RANDOM_MS;
  return Math.max(CONFIG.TYPING_BASE_MS, ms);
}

/**
 * Pause playback
 */
function pause() {
  playbackGeneration++;
  running = false;
  pendingTimers.forEach(timer => clearTimeout(timer));
  pendingTimers.clear();
  typingRows.forEach(row => removeTypingBubble(row));
  typingRows.clear();
  if (playbackOwner && playbackOwner !== state.get('player')) {
    clearTimeout(playbackOwner.playTimer);
    clearTimeout(playbackOwner.typingTimer);
    playbackOwner.playTimer = null;
    playbackOwner.typingTimer = null;
    playbackOwner.paused = true;
  }
  const player = state.get('player');
  player.paused = true;

  if (player.playTimer) {
    clearTimeout(player.playTimer);
    player.playTimer = null;
  }

  if (player.typingTimer) {
    clearTimeout(player.typingTimer);
    player.typingTimer = null;
  }

  notifyPlaybackState();
}

/**
 * Reset player and chat
 */
function reset() {
  pause();

  // If interactive mode is active, disable it
  if (interactive.enabled) {
    disableInteractiveMode();
  }

  const player = state.get('player');
  player.queue = [];
  player.cursor = 0;
  playbackTarget = null;
  playbackOwner = null;

  state.clearActive();
  state.clearMessages();
  clearChat();
  syncHeader();
  notifyPlaybackState();
}

/**
 * Load script into player
 */
function loadScript() {
  pause();

  // If interactive mode is active, disable it
  if (interactive.enabled) {
    disableInteractiveMode();
  }

  const scriptBox = $('scriptBox');
  const speedInput = $('speed');
  const jitterInput = $('jitter');
  const player = state.get('player');

  {
    player.script = scriptBox ? scriptBox.value : player.script;
    const parseResult = parseScriptDetailed(player.script || '');
    player.queue = parseResult.events;
    player.lastParseIssues = parseResult.issues;
    notifyScriptIssues(parseResult);
  }

  if (speedInput) {
    player.speed = Number(speedInput.value) || CONFIG.DEFAULT_SPEED;
  }

  if (jitterInput) {
    player.jitter = Number(jitterInput.value) || 0;
  }

  player.cursor = 0;
  player.paused = true;
  playbackTarget = currentTarget();
  playbackOwner = player;
  activeTickStatus = null;

  state.clearActive();
  state.clearMessages();
  clearChat();
  syncHeader();

  // Senaryodaki tüm kişileri otomatik aktive et
  if (player.queue && player.queue.length) {
    const allPeople = new Set();
    for (const event of player.queue) {
      if (event.who && !state.isSelf(event.who)) {
        allPeople.add(event.who);
      }
    }
    for (const person of allPeople) {
      state.addActive(person);
    }
    refreshManualSenderOptions();
    renderPeopleList();
  }

  notifyPlaybackState();
  return {
    events: player.queue || [],
    issues: player.lastParseIssues || [],
    summary: {
      eventCount: (player.queue || []).length,
      errors: (player.lastParseIssues || []).filter(issue => issue.severity === 'error').length,
      warnings: (player.lastParseIssues || []).filter(issue => issue.severity === 'warning').length,
    },
  };
}

/**
 * Execute a single step
 */
function step() {
  pause();
  const player = state.get('player');

  if (!player.queue.length) {
    loadScript();
  }

  if (!canResumeTarget() || player.cursor >= player.queue.length) return false;

  const event = player.queue[player.cursor];
  const generation = playbackGeneration;
  handleEvent(event, () => {
    if (generation !== playbackGeneration) return;
    player.cursor++;
    notifyPlaybackState();
  });
  notifyPlaybackState();
  return true;
}

function canResumeTarget() {
  if (playbackOwner === state.get('player') && playbackTarget === currentTarget()) return true;
  showError('Devam etmek için önce oynatılan sohbete dönün veya Önizlemeyi Oynat ile bu sohbeti başlatın.');
  return false;
}

/**
 * Start playback
 */
function play() {
  if (running) return true;
  const player = state.get('player');

  if (!player.queue.length) {
    loadScript();
  }

  if (!player.queue.length || !canResumeTarget() || player.cursor >= player.queue.length) return false;

  // Cancel an unfinished single-step before restarting that same event.
  pause();
  player.paused = false;
  running = true;
  const generation = playbackGeneration;

  const tick = () => {
    player.playTimer = null;
    if (player.paused || generation !== playbackGeneration) return;
    if (player !== state.get('player') || playbackTarget !== currentTarget()) {
      pause();
      return;
    }

    if (player.cursor >= player.queue.length) {
      pause();
      return;
    }

    const event = player.queue[player.cursor];
    handleEvent(event, () => {
      if (generation !== playbackGeneration || player.paused) return;
      player.cursor++;
      player.playTimer = setTimeout(tick, getBaseDelay());
      notifyPlaybackState();
    });
  };

  tick();
  notifyPlaybackState();
  return true;
}

/**
 * Handle a single event
 */
function handleEvent(event, onComplete = () => {}) {
  const player = state.get('player');

  switch (event.type) {
    case EventType.ADD:
      if (event.who) {
        state.addActive(event.who);
        addSystemMessage(`${event.who} gruba katıldı`);
        refreshManualSenderOptions();
        renderPeopleList();
      }
      onComplete();
      break;

    case EventType.LEAVE:
      if (event.who) {
        state.removeActive(event.who);
        addSystemMessage(`${event.who} gruptan çıktı`);
        refreshManualSenderOptions();
        renderPeopleList();
      }
      onComplete();
      break;

    case EventType.SYSTEM:
      if (event.text) {
        addSystemMessage(event.text);
      }
      onComplete();
      break;

    case EventType.REACTION: {
      const who = event.who || 'Biri';
      const emoji = event.emoji || '🙂';
      const targetKey = event.target || '';

      const targetMsg = findMessageByTarget(targetKey);
      if (!targetMsg) {
        addSystemMessage(`Tepki hedefi bulunamadı: ${targetKey || '(boş)'}`);
        onComplete();
        break;
      }

      applyReactionToMessage(targetMsg.id, who, emoji);
      onComplete();
      break;
    }

    case EventType.TICK_STATUS:
      activeTickStatus = event.status; // 'sent', 'delivered', 'read'
      onComplete();
      break;

    case EventType.TYPING:
      handleTypingEvent(event, onComplete);
      break;

    case EventType.MESSAGE:
      handleMessageEvent(event, onComplete);
      break;

    default:
      onComplete();
  }
}

/**
 * Handle typing event
 */
function handleTypingEvent(event, onComplete) {
  const player = state.get('player');
  const who = event.who || '?';
  const isSelf = state.isSelf(who);

  if (!isSelf && !state.isActive(who)) {
    onComplete();
    return;
  }

  // Gerçek WhatsApp'ta kendi typing göstergenizi görmezsiniz
  if (isSelf) {
    onComplete();
    return;
  }

  const row = addTypingBubble(who);

  scheduleTyping(onComplete, Math.max(120, event.ms || 800), row);
}

/**
 * Handle message event
 */
function handleMessageEvent(event, onComplete) {
  const player = state.get('player');
  const who = event.who || '?';
  const isSelf = state.isSelf(who);

  if (!isSelf && !state.isActive(who)) {
    onComplete();
    return;
  }

  const addMsg = () => {
    addMessage({
      speaker: who,
      text: event.text || '',
      replyTo: event.replyTo,
      kind: event.kind,
      src: event.src,
      durationSec: event.durationSec,
      tickStatus: activeTickStatus
    });
    onComplete();
  };

  // Gerçek WhatsApp'ta kendi typing göstergenizi görmezsiniz
  if (isSelf) {
    const shortDelay = 80 + Math.random() * 120;
    scheduleTyping(addMsg, shortDelay);
    return;
  }

  const typingSeedText = event.text || (event.kind ? `[${event.kind}]` : '');
  const typingMs = event.kind === 'voice' ? 650 : getTypingDuration(typingSeedText);
  const row = addTypingBubble(who);

  scheduleTyping(addMsg, typingMs, row);
}

/**
 * Send a live message from current sender
 */
function sendLiveMessage() {
  const senderEl = $('manualSender');
  const inputEl = $('liveInput');

  if (!inputEl) return;

  const who = senderEl?.value || state.get('selfName') || 'Me';
  const text = inputEl.value.trim();

  if (!text) return;

  // Interactive mode: route input to engine
  if (interactive.enabled) {
    inputEl.value = '';
    updateMainActionButton();
    inputEl.focus();
    handleInteractiveInput(text);
    return;
  }

  const isSelf = state.isSelf(who);
  if (!isSelf && !state.isActive(who)) {
    addSystemMessage(`${who} şu an grupta değil`);
    inputEl.value = '';
    updateMainActionButton();
    return;
  }

  addMessage({ speaker: who, text });
  inputEl.value = '';
  updateMainActionButton();
  inputEl.focus();
}

/**
 * Main action button icons (mic / send)
 */
const MAIN_ACTION_ICON_MIC = `
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
  </svg>
`;

const MAIN_ACTION_ICON_SEND = `
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
`;

/**
 * Toggle main action button between mic and send
 */
function updateMainActionButton() {
  const btn = $('mainActionBtn');
  const input = $('liveInput');
  if (!btn || !input) return;

  const hasText = (input.value || '').trim().length > 0;
  const mode = hasText ? 'send' : 'mic';

  if (btn.dataset.mode === mode) return;

  btn.dataset.mode = mode;
  btn.setAttribute('aria-label', hasText ? 'Gönder' : 'Sesli mesaj');
  btn.replaceChildren(parseSVG(hasText ? MAIN_ACTION_ICON_SEND : MAIN_ACTION_ICON_MIC));
}

/**
 * Send a voice message (visual only) from current sender
 */
function sendLiveVoiceMessage() {
  const senderEl = $('manualSender');
  const inputEl = $('liveInput');

  const who = senderEl?.value || state.get('selfName') || 'Me';
  const isSelf = state.isSelf(who);

  if (!isSelf && !state.isActive(who)) {
    addSystemMessage(`${who} şu an grupta değil`);
    if (inputEl) inputEl.focus();
    return;
  }

  const durationSec = 5 + Math.floor(Math.random() * 19); // 5-23s
  addMessage({ speaker: who, kind: 'voice', durationSec });

  if (inputEl) inputEl.focus();
}

/**
 * Send a media file (photo/gif) from current sender
 */
async function sendLiveMediaFile(file) {
  const senderEl = $('manualSender');
  const inputEl = $('liveInput');

  const who = senderEl?.value || state.get('selfName') || 'Me';
  const isSelf = state.isSelf(who);

  if (!isSelf && !state.isActive(who)) {
    addSystemMessage(`${who} şu an grupta değil`);
    if (inputEl) inputEl.focus();
    return;
  }

  if (!file) return;

  const isImage = (file.type || '').startsWith('image/');
  if (!isImage) {
    showToast('Sadece görsel dosyaları destekleniyor');
    return;
  }

  if (file.size > 12 * 1024 * 1024) {
    showToast('Dosya çok büyük (12MB+)');
    return;
  }

  const dataUrl = await readFileAsDataURL(file);
  const kind = file.type === 'image/gif' ? 'gif' : 'photo';
  const caption = (inputEl?.value || '').trim();

  addMessage({
    speaker: who,
    kind,
    src: dataUrl,
    text: caption
  });

  if (inputEl) {
    inputEl.value = '';
    updateMainActionButton();
    inputEl.focus();
  }
}

/**
 * Initialize player events
 */
function initPlayer() {
  const mainActionBtn = $('mainActionBtn');
  const liveInput = $('liveInput');
  const attachBtn = $('attachBtn');
  const cameraBtn = $('cameraBtn');
  const fileInput = $('composerFileInput');

  const openPicker = (accept) => {
    if (!fileInput) return;
    fileInput.accept = accept;
    fileInput.value = '';
    fileInput.click();
  };

  if (attachBtn) {
    attachBtn.addEventListener('click', () => openPicker('image/*,image/gif'));
  }

  if (cameraBtn) {
    cameraBtn.addEventListener('click', () => openPicker('image/*,image/gif'));
  }

  if (fileInput) {
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        await sendLiveMediaFile(file);
      } catch (err) {
        showError(err?.message || 'Dosya eklenemedi');
      } finally {
        fileInput.value = '';
      }
    });
  }

  if (mainActionBtn) {
    mainActionBtn.addEventListener('click', () => {
      const hasText = (liveInput?.value || '').trim().length > 0;
      if (hasText) sendLiveMessage();
      else sendLiveVoiceMessage();
    });
  }

  if (liveInput) {
    liveInput.addEventListener('input', updateMainActionButton);

    liveInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendLiveMessage();
      }
    });

    updateMainActionButton();
  }

  Logger.info('🎬 Player initialized');
}

export {
  getBaseDelay,
  handleEvent,
  loadScript,
  play,
  pause,
  step,
  reset,
  sendLiveMessage,
  sendLiveVoiceMessage,
  sendLiveMediaFile,
  updateMainActionButton,
  initPlayer,
  isPlayerPlaying,
};
