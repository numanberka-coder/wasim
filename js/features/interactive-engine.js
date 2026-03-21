/* ========================================
   INTERACTIVE ENGINE - Koşullu Mesajlaşma
   Faz 7: Blok parser, trigger eşleştirme,
   interaktif mod motoru
   ======================================== */

import { $, Logger } from '../utils.js';
import { state } from '../state.js';
import { showSuccess, showError } from '../ui/toast.js';
import { EventType, parseLine } from './script-parser.js';
import { addMessage, clearChat } from '../phone/messages.js';
import { renderPeopleList, refreshManualSenderOptions } from './people.js';
import { syncHeader } from '../phone/header.js';
import { getBaseDelay, handleEvent } from './player.js';

/**
 * Interactive mode state
 */
const interactive = {
  enabled: false,
  blocks: [],       // parsed blocks: { name, triggers, events }
  defaultBlock: null,
  busy: false,      // true while a block is playing
};

/**
 * Parse interactive script into blocks
 *
 * Syntax:
 *   #blok_adi
 *   trigger: kelime1, kelime2
 *   ---
 *   Ahmet | Merhaba!
 *   @photo Ahmet https://...
 *
 *   #default
 *   trigger: *
 *   ---
 *   Ahmet | Bunu anlayamadım.
 */
function parseInteractiveScript(text) {
  const blocks = [];
  let defaultBlock = null;

  // Split into block chunks by #blockname
  const raw = text.replace(/\r\n/g, '\n');
  const blockRegex = /^#(\S+)\s*$/gm;
  const starts = [];
  let m;

  while ((m = blockRegex.exec(raw)) !== null) {
    starts.push({ name: m[1], index: m.index, headerEnd: m.index + m[0].length });
  }

  if (starts.length === 0) return { blocks: [], defaultBlock: null };

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1].index : raw.length;
    const body = raw.substring(start.headerEnd, end).trim();

    const block = parseBlockBody(start.name, body);
    if (!block) continue;

    if (block.isDefault) {
      defaultBlock = block;
    }

    blocks.push(block);
  }

  return { blocks, defaultBlock };
}

/**
 * Parse a single block body (trigger line + separator + message lines)
 */
function parseBlockBody(name, body) {
  // Find trigger line
  const triggerMatch = body.match(/^trigger\s*:\s*(.+)$/im);
  if (!triggerMatch) return null;

  const triggerRaw = triggerMatch[1].trim();
  const isDefault = triggerRaw === '*';

  // Parse triggers (comma separated, case-insensitive)
  const triggers = isDefault
    ? ['*']
    : triggerRaw
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

  if (triggers.length === 0) return null;

  // Find separator ---
  const sepIndex = body.indexOf('---');
  if (sepIndex === -1) return null;

  // Everything after --- is the message script
  const scriptBody = body.substring(sepIndex + 3).trim();

  // Parse message lines using the pipe syntax OR standard syntax
  const events = parseBlockMessages(scriptBody);

  return {
    name,
    triggers,
    isDefault,
    events,
  };
}

/**
 * Parse message lines within a block
 * Supports both:
 *   - Pipe syntax:  Ahmet | Merhaba!
 *   - Standard syntax: Ahmet: Merhaba!  (and all @commands)
 *
 * Pipe syntax allows "Who | HH:MM | message" for explicit times
 */
function parseBlockMessages(text) {
  const lines = text
    .split(/\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const events = [];

  for (const line of lines) {
    // First try pipe syntax: Who | [Time |] Message
    const pipeEvent = parsePipeLine(line);
    if (pipeEvent) {
      events.push(pipeEvent);
      continue;
    }

    // Fall back to standard parseLine (from script-parser.js)
    const standardEvent = parseLine(line);
    if (standardEvent) {
      events.push(standardEvent);
    }
  }

  return events;
}

/**
 * Parse pipe-delimited line:
 *   Who | Message
 *   Who | HH:MM | Message
 */
function parsePipeLine(line) {
  if (!line.includes('|')) return null;

  const parts = line.split('|').map(p => p.trim());

  if (parts.length === 2) {
    // Who | Message
    const who = parts[0];
    const text = parts[1];
    if (!who || !text) return null;
    return { type: EventType.MESSAGE, who, text };
  }

  if (parts.length === 3) {
    // Who | HH:MM | Message
    const who = parts[0];
    const time = parts[1]; // kept for potential future use
    const text = parts[2];
    if (!who || !text) return null;
    return { type: EventType.MESSAGE, who, text, explicitTime: time };
  }

  return null;
}

/**
 * Find matching block for user input
 * Case-insensitive exact match
 */
function findMatchingBlock(userInput) {
  const input = String(userInput || '').trim().toLowerCase();
  if (!input) return null;

  // Search all blocks for a trigger match
  for (const block of interactive.blocks) {
    if (block.isDefault) continue;

    for (const trigger of block.triggers) {
      if (trigger === input) {
        return block;
      }
    }
  }

  // No exact match — return default block if exists
  return interactive.defaultBlock || null;
}

/**
 * Enable interactive mode
 * @param {string} [sourceText] - Script text to parse. If omitted, reads from interactiveScriptBox.
 */
function enableInteractiveMode(sourceText) {
  const scriptText = sourceText
    || ($('interactiveScriptBox')?.value || '')
    || (state.get('player').script || '');

  // Parse the interactive blocks
  const { blocks, defaultBlock } = parseInteractiveScript(scriptText);

  if (blocks.length === 0) {
    showError('İnteraktif blok bulunamadı! #blok_adi / trigger: / --- formatını kullanın.');
    return false;
  }

  interactive.blocks = blocks;
  interactive.defaultBlock = defaultBlock;
  interactive.enabled = true;
  interactive.busy = false;

  // Reset chat
  state.clearActive();
  state.clearMessages();
  clearChat();
  syncHeader();

  // Auto-add all people referenced in blocks
  const allPeople = new Set();
  for (const block of blocks) {
    for (const event of block.events) {
      if (event.who && String(event.who).toLowerCase() !== 'me') {
        allPeople.add(event.who);
      }
    }
  }
  for (const person of allPeople) {
    state.addActive(person);
  }
  refreshManualSenderOptions();
  renderPeopleList();

  // Update UI
  updateInteractiveModeUI(true);

  // List loaded triggers
  const triggerCount = blocks.reduce((n, b) => n + (b.isDefault ? 0 : b.triggers.length), 0);
  const blockCount = blocks.length;
  showSuccess(`İnteraktif mod aktif! ${blockCount} blok, ${triggerCount} tetikleyici yüklendi.`);

  Logger.info('🎮 Interactive mode enabled', { blockCount, triggerCount, hasDefault: !!defaultBlock });
  return true;
}

/**
 * Disable interactive mode
 */
function disableInteractiveMode() {
  interactive.enabled = false;
  interactive.blocks = [];
  interactive.defaultBlock = null;
  interactive.busy = false;

  updateInteractiveModeUI(false);
  showSuccess('İnteraktif mod kapatıldı.');
  Logger.info('🎮 Interactive mode disabled');
}

/**
 * Update UI for interactive mode toggle
 */
function updateInteractiveModeUI(enabled) {
  const badge = $('interactiveBadge');
  const toggleBtn = $('interactiveToggleBtn');
  const normalControls = $('normalPlayerControls');
  const interactiveInfo = $('interactiveInfo');

  if (badge) badge.style.display = enabled ? 'inline-flex' : 'none';

  if (toggleBtn) {
    toggleBtn.textContent = enabled ? '🛑 İnteraktif Modu Kapat' : '🎮 İnteraktif Modu Aç';
    toggleBtn.className = enabled ? 'danger' : '';
  }

  if (normalControls) normalControls.style.display = enabled ? 'none' : '';
  if (interactiveInfo) interactiveInfo.style.display = enabled ? 'block' : 'none';

  // Composer placeholder her zaman "Mesaj" kalır — gerçekçilik için
  // (interaktif mod aktifken bile WhatsApp görünümü bozulmamalı)
}

/**
 * Handle user input in interactive mode
 * Called from sendLiveMessage when interactive.enabled
 */
function handleInteractiveInput(userText) {
  if (!interactive.enabled || interactive.busy) return;

  const block = findMatchingBlock(userText);

  if (!block) {
    // No match and no default — just show user message, no response
    addMessage({ speaker: 'Me', text: userText });
    return;
  }

  // Show user's message first
  addMessage({ speaker: 'Me', text: userText });

  // Play the matched block's events
  playBlockEvents(block);
}

/**
 * Play a block's events sequentially with typing animation
 */
function playBlockEvents(block) {
  if (!block || !block.events.length) return;

  interactive.busy = true;

  const events = [...block.events];
  let cursor = 0;

  const playNext = () => {
    if (cursor >= events.length || !interactive.enabled) {
      interactive.busy = false;
      return;
    }

    const event = events[cursor];
    cursor++;

    handleEvent(event, () => {
      const delay = getBaseDelay();
      setTimeout(playNext, delay);
    });
  };

  // Start after a brief pause (feels more natural)
  setTimeout(playNext, 400);
}

/**
 * Build trigger summary for info panel
 */
function getInteractiveSummary() {
  if (!interactive.blocks.length) return '';

  const lines = [];
  for (const block of interactive.blocks) {
    const triggers = block.isDefault
      ? '* (varsayılan)'
      : block.triggers.join(', ');
    lines.push(`<b>#${block.name}</b> → ${triggers}`);
  }
  return lines.join('<br>');
}

/**
 * Initialize interactive engine
 */
function initInteractive() {
  // Toggle button (reads from interactiveScriptBox)
  const toggleBtn = $('interactiveToggleBtn');
  if (toggleBtn) toggleBtn.addEventListener('click', () => {
    if (interactive.enabled) {
      disableInteractiveMode();
    } else {
      const text = $('interactiveScriptBox')?.value || '';
      enableInteractiveMode(text);
    }
  });

  // Reset button
  const resetBtn = $('interactiveResetBtn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    if (interactive.enabled) disableInteractiveMode();
    state.clearActive();
    state.clearMessages();
    clearChat();
    syncHeader();
    showSuccess('Sıfırlandı!');
  });

  Logger.info('🎮 Interactive engine initialized');
}

export {
  interactive,
  enableInteractiveMode,
  disableInteractiveMode,
  handleInteractiveInput,
  initInteractive,
  getInteractiveSummary,
};
