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
  matchOptions: {
    contains: false,
    scoreFallback: false,
    debug: false,
  },
  lastMatch: null,
};

const MATCH_TYPE_PRIORITY = {
  exact: 3,
  contains: 2,
  score: 1,
};

function normalizeMatchText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function parseMatchTerms(raw) {
  const seen = new Set();
  const terms = [];

  String(raw || '')
    .split(',')
    .map(normalizeMatchText)
    .filter(Boolean)
    .forEach((term) => {
      if (!seen.has(term)) {
        seen.add(term);
        terms.push(term);
      }
    });

  return terms;
}

function getBlockMatchTerms(block) {
  const terms = [];

  for (const trigger of block.triggers || []) {
    if (trigger !== '*') {
      terms.push({ term: trigger, source: 'trigger' });
    }
  }

  for (const alias of block.aliases || []) {
    terms.push({ term: alias, source: 'alias' });
  }

  return terms;
}

function tokenizeForScore(value) {
  return normalizeMatchText(value)
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length > 1);
}

function calculateTokenScore(input, term) {
  const inputTokens = tokenizeForScore(input);
  const termTokens = tokenizeForScore(term);

  if (!inputTokens.length || !termTokens.length) return 0;

  const inputSet = new Set(inputTokens);
  const termSet = new Set(termTokens);
  let overlap = 0;

  for (const token of termSet) {
    if (inputSet.has(token)) overlap++;
  }

  if (overlap === 0) return 0;
  return overlap / Math.max(inputSet.size, termSet.size);
}

function createMatchResult(block, type, termInfo, score, blockIndex, termIndex) {
  return {
    block,
    type,
    term: termInfo?.term || '',
    source: termInfo?.source || '',
    score,
    blockIndex,
    termIndex,
    isDefault: false,
  };
}

function compareMatchResults(a, b) {
  const priorityDiff = MATCH_TYPE_PRIORITY[b.type] - MATCH_TYPE_PRIORITY[a.type];
  if (priorityDiff !== 0) return priorityDiff;

  const scoreDiff = b.score - a.score;
  if (scoreDiff !== 0) return scoreDiff;

  const lengthDiff = b.term.length - a.term.length;
  if (lengthDiff !== 0) return lengthDiff;

  const blockDiff = a.blockIndex - b.blockIndex;
  if (blockDiff !== 0) return blockDiff;

  return a.termIndex - b.termIndex;
}

function evaluateInteractiveMatch(userInput, blocks, defaultBlock = null, options = {}) {
  const input = normalizeMatchText(userInput);
  if (!input) return null;

  const matchOptions = {
    contains: false,
    scoreFallback: false,
    ...options,
  };

  const candidates = [];

  blocks.forEach((block, blockIndex) => {
    if (block.isDefault) return;

    const terms = getBlockMatchTerms(block);
    terms.forEach((termInfo, termIndex) => {
      if (termInfo.term === input) {
        candidates.push(createMatchResult(block, 'exact', termInfo, 1, blockIndex, termIndex));
        return;
      }

      if (
        matchOptions.contains
        && termInfo.term.length >= 2
        && (input.includes(termInfo.term) || (input.length >= 3 && termInfo.term.includes(input)))
      ) {
        const coverage = Math.min(termInfo.term.length, input.length) / Math.max(termInfo.term.length, input.length);
        candidates.push(createMatchResult(block, 'contains', termInfo, coverage, blockIndex, termIndex));
        return;
      }

      if (matchOptions.scoreFallback) {
        const score = calculateTokenScore(input, termInfo.term);
        if (score > 0) {
          candidates.push(createMatchResult(block, 'score', termInfo, score, blockIndex, termIndex));
        }
      }
    });
  });

  if (candidates.length > 0) {
    return candidates.sort(compareMatchResults)[0];
  }

  if (defaultBlock) {
    return {
      block: defaultBlock,
      type: 'default',
      term: '*',
      source: 'default',
      score: 0,
      blockIndex: blocks.indexOf(defaultBlock),
      termIndex: -1,
      isDefault: true,
    };
  }

  return null;
}

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
  const triggers = isDefault ? ['*'] : parseMatchTerms(triggerRaw);

  if (triggers.length === 0) return null;

  const aliasMatch = body.match(/^alias\s*:\s*(.+)$/im);
  const aliases = isDefault || !aliasMatch ? [] : parseMatchTerms(aliasMatch[1]);

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
    aliases,
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
function findExactMatchingBlock(userInput) {
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

function findMatchingBlock(userInput) {
  const result = evaluateInteractiveMatch(
    userInput,
    interactive.blocks,
    interactive.defaultBlock,
    interactive.matchOptions,
  );
  return result?.block || null;
}

function readMatchOptionsFromUI() {
  interactive.matchOptions = {
    contains: !!$('interactiveContainsMatch')?.checked,
    scoreFallback: !!$('interactiveScoreFallback')?.checked,
    debug: !!$('interactiveDebugToggle')?.checked,
  };
  updateInteractiveDebug();
  return interactive.matchOptions;
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
  interactive.lastMatch = null;
  readMatchOptionsFromUI();

  // Reset chat
  state.clearActive();
  state.clearMessages();
  clearChat();
  syncHeader();

  // Auto-add all people referenced in blocks
  const allPeople = new Set();
  for (const block of blocks) {
    for (const event of block.events) {
      if (event.who && !state.isSelf(event.who)) {
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
  interactive.lastMatch = null;

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
  updateInteractiveDebug();

  // Composer placeholder her zaman "Mesaj" kalır — gerçekçilik için
  // (interaktif mod aktifken bile WhatsApp görünümü bozulmamalı)
}

function updateInteractiveDebug() {
  const panel = $('interactiveMatchDebug');
  if (!panel) return;

  const shouldShow = interactive.enabled && interactive.matchOptions.debug;
  panel.style.display = shouldShow ? 'grid' : 'none';

  if (!shouldShow) return;

  const inputEl = $('interactiveDebugInput');
  const blockEl = $('interactiveDebugBlock');
  const typeEl = $('interactiveDebugType');
  const scoreEl = $('interactiveDebugScore');
  const match = interactive.lastMatch;

  if (!match) {
    if (inputEl) inputEl.textContent = '-';
    if (blockEl) blockEl.textContent = 'Henuz eslesme yok';
    if (typeEl) typeEl.textContent = '-';
    if (scoreEl) scoreEl.textContent = '-';
    return;
  }

  if (inputEl) inputEl.textContent = match.input || '-';
  if (blockEl) blockEl.textContent = match.block ? `#${match.block.name}` : 'Eslesme yok';
  if (typeEl) {
    const source = match.source && match.source !== 'default' ? ` / ${match.source}` : '';
    typeEl.textContent = `${match.type}${source}`;
  }
  if (scoreEl) {
    scoreEl.textContent = match.type === 'default'
      ? 'fallback'
      : `${match.term || '-'} (${Math.round((match.score || 0) * 100)}%)`;
  }
}

/**
 * Handle user input in interactive mode
 * Called from sendLiveMessage when interactive.enabled
 */
function handleInteractiveInput(userText) {
  if (!interactive.enabled || interactive.busy) return;

  readMatchOptionsFromUI();
  const match = evaluateInteractiveMatch(
    userText,
    interactive.blocks,
    interactive.defaultBlock,
    interactive.matchOptions,
  );
  const block = match?.block || null;
  interactive.lastMatch = match ? { ...match, input: userText } : {
    input: userText,
    block: null,
    type: 'none',
    term: '',
    source: '',
    score: 0,
  };
  updateInteractiveDebug();

  if (!block) {
    // No match and no default — just show user message, no response
    addMessage({ speaker: state.get('selfName') || 'Me', text: userText });
    return;
  }

  // Show user's message first
  addMessage({ speaker: state.get('selfName') || 'Me', text: userText });

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
      : [...block.triggers, ...(block.aliases || []).map(alias => `~${alias}`)].join(', ');
    lines.push(`<b>#${block.name}</b> → ${triggers}`);
  }
  return lines.join('<br>');
}

/**
 * Initialize interactive engine
 */
function initInteractive() {
  ['interactiveContainsMatch', 'interactiveScoreFallback', 'interactiveDebugToggle'].forEach((id) => {
    const control = $(id);
    if (control) control.addEventListener('change', readMatchOptionsFromUI);
  });

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
  parseInteractiveScript,
  parseBlockBody,
  normalizeMatchText,
  calculateTokenScore,
  evaluateInteractiveMatch,
  findMatchingBlock,
  enableInteractiveMode,
  disableInteractiveMode,
  handleInteractiveInput,
  initInteractive,
  getInteractiveSummary,
};
