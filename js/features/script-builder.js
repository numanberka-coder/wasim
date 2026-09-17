/* ========================================
   SCRIPT TOOLS - Line builder (16 tip), templates,
   validation, inner tabs, interactive demo,
   group tab line list
   ======================================== */

import { $, createElement, readFileAsDataURL, Logger } from '../utils.js';
import { SCRIPT_TEMPLATES } from '../config.js';
import { state } from '../state.js';
import { showSuccess, showError } from '../ui/toast.js';
import { SyntaxHighlight } from '../ui/highlight.js';
import { tokenizeCommand, validateScript } from './script-parser.js';
import { loadScript, play, isPlayerPlaying } from './player.js';
import { runUndoable, undoLast, redoLast, getHistoryStatus, clearHistory } from './history.js';
import { switchTab } from '../ui/tabs.js';

let unsubscribeScript = null;
let editingSource = null;
let editingConversation = null;
let mobileScriptReorderMode = false;
let mobileScriptEditingLine = null;

/** Araya ekleme modu: null = sonuna ekle, sayı = o index'in altına ekle */
let insertAfterIndex = null;

/** 16 tip tanımı */
const BUILDER_TYPES = [
  { id: 'message',  label: '💬 Mesaj' },
  { id: 'reply',    label: '↩️ Yanıt' },
  { id: 'photo',    label: '📷 Fotoğraf' },
  { id: 'gif',      label: '🎞️ GIF' },
  { id: 'video',    label: '🎬 Video' },
  { id: 'voice',    label: '🎤 Ses' },
  { id: 'location', label: '📍 Konum' },
  { id: 'document', label: '📄 Döküman' },
  { id: 'sticker',  label: '🏷️ Sticker' },
  { id: 'link',     label: '🔗 Link' },
  { id: 'viewonce', label: '👁️ Bir Kez' },
  { id: 'typing',   label: '⏳ Yazıyor' },
  { id: 'reaction', label: '😂 Tepki' },
  { id: 'system',   label: '⚙️ Sistem' },
  { id: 'add',      label: '➕ Katılma' },
  { id: 'leave',    label: '🚪 Ayrılma' },
];

/** Her tip için görünen alan listesi */
const BUILDER_FIELDS = {
  message:  ['who', 'text'],
  reply:    ['who', 'replyTo', 'text'],
  photo:    ['who', 'url', 'caption'],
  gif:      ['who', 'url', 'caption'],
  video:    ['who', 'url', 'caption'],
  voice:    ['who', 'duration', 'caption'],
  location: ['who', 'placeName', 'placeInfo'],
  document: ['who', 'fileName', 'fileSize'],
  sticker:  ['who', 'stickerVal'],
  link:     ['who', 'linkTitle', 'linkUrl'],
  viewonce: ['who', 'voMediaType'],
  typing:   ['who', 'typingMs'],
  reaction: ['who', 'emoji', 'reactTarget'],
  system:   ['systemText'],
  add:      ['personName'],
  leave:    ['personName'],
};


/* ========================================
   INIT
   ======================================== */

function initScriptTools() {
  unsubscribeScript?.();
  mobileScriptReorderMode = false;
  mobileScriptEditingLine = null;
  clearHistory();
  setupValidation();
  setupMobileScriptFlow();
  setupMediaInsertTool();
  setupScriptInnerTabs();
  setupInteractiveDemo();
  setupGroupBuilderList();
}

/* ========================================
   INNER TAB SYSTEM
   ======================================== */

function setupScriptInnerTabs() {
  const tabs = document.querySelectorAll('.script-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.stab;
      if (!target) return;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.script-tab-panel').forEach(p => p.classList.remove('active'));
      const panel = $(target);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ========================================
   INTERACTIVE DEMO
   ======================================== */

function setupInteractiveDemo() {
  const btn = $('loadInteractiveDemoBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const tpl = SCRIPT_TEMPLATES.find(t => t.id === 'interactive-demo') || null;
    if (tpl) {
      const box = $('interactiveScriptBox');
      if (box) box.value = tpl.script.trim();
      showSuccess('İnteraktif demo şablonu yüklendi!');
    } else {
      showError('İnteraktif demo şablonu bulunamadı');
    }
  });
}

/* ========================================
   LINE GENERATION (16 tip) — parametre bazlı
   ======================================== */

function quoteToken(s) {
  const v = String(s ?? '').trim();
  if (!v) return '';
  if (/[\s"]/.test(v)) return '"' + v.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  return v;
}

function quoteForce(s) {
  return '"' + String(s ?? '').trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

/**
 * Verilen tip ve değerlerden senaryo satırı üretir.
 * @param {string} type - Mesaj tipi (message, reply, photo, vb.)
 * @param {Object} values - Alan değerleri ({ who, text, replyTo, url, ... })
 * @returns {string|null} Üretilen satır veya hata durumunda null
 */
function buildLineFromValues(type, values) {
  const v = (key) => String(values[key] ?? '').trim();
  const sender = quoteToken(v('who') || state.get('selfName') || 'Me');

  switch (type) {
    case 'message': {
      const text = v('text');
      if (!text) return null;
      const who = v('who') || state.get('selfName') || 'Me';
      return `${who}: ${text}`;
    }
    case 'reply': {
      const text = v('text');
      const replyTo = v('replyTo');
      if (!text) return null;
      if (!replyTo) return null;
      const who = v('who') || state.get('selfName') || 'Me';
      return `${who} > ${replyTo}: ${text}`;
    }
    case 'photo': {
      const url = v('url');
      if (!url) return null;
      const cap = v('caption');
      return `@photo ${sender} ${quoteForce(url)}${cap ? ' ' + quoteForce(cap) : ''}`;
    }
    case 'gif': {
      const url = v('url');
      if (!url) return null;
      const cap = v('caption');
      return `@gif ${sender} ${quoteForce(url)}${cap ? ' ' + quoteForce(cap) : ''}`;
    }
    case 'video': {
      const url = v('url');
      if (!url) return null;
      const cap = v('caption');
      return `@video ${sender} ${quoteForce(url)}${cap ? ' ' + quoteForce(cap) : ''}`;
    }
    case 'voice': {
      const dur = v('duration') || '12s';
      const cap = v('caption');
      return `@voice ${sender} ${dur}${cap ? ' ' + quoteForce(cap) : ''}`;
    }
    case 'location': {
      const name = v('placeName');
      if (!name) return null;
      const info = v('placeInfo');
      return `@location ${sender} ${quoteForce(name)}${info ? ' ' + quoteForce(info) : ''}`;
    }
    case 'document': {
      const fname = v('fileName') || 'dosya.pdf';
      const fsize = v('fileSize');
      return `@document ${sender} ${quoteForce(fname)}${fsize ? ' ' + quoteForce(fsize) : ''}`;
    }
    case 'sticker': {
      const val = v('stickerVal') || '🙂';
      return `@sticker ${sender} ${quoteForce(val)}`;
    }
    case 'link': {
      const title = v('linkTitle');
      if (!title) return null;
      const url = v('linkUrl');
      return `@link ${sender} ${quoteForce(title)}${url ? ' ' + quoteForce(url) : ''}`;
    }
    case 'viewonce': {
      const mt = v('voMediaType') || 'photo';
      return `@viewonce ${sender} ${mt}`;
    }
    case 'typing': {
      const ms = v('typingMs') || '800';
      return `@typing ${sender} ${ms}`;
    }
    case 'reaction': {
      const emoji = v('emoji');
      const target = v('reactTarget');
      if (!emoji) return null;
      if (!target) return null;
      return `@reaction ${sender} ${emoji} ${target}`;
    }
    case 'system': {
      const text = v('systemText');
      if (!text) return null;
      return `@system ${text}`;
    }
    case 'add': {
      const name = v('personName');
      if (!name) return null;
      return `@add ${name}`;
    }
    case 'leave': {
      const name = v('personName');
      if (!name) return null;
      return `@leave ${name}`;
    }
    default:
      return null;
  }
}

/* ========================================
   GROUP BUILDER LIST — Satır Sırası (Grup tabı)
   ======================================== */

function setupGroupBuilderList() {
  // Legacy preparation controls are retired. People add directly to player.script.
  const legacyFlow = $('groupFlowAccordion');
  if (legacyFlow) legacyFlow.hidden = true;
  const pushBtn = $('groupBuilderPushBtn');
  if (pushBtn) pushBtn.hidden = true;
  $('groupBuilderPlayBtn')?.addEventListener('click', () => { loadScript(); play(); });
  $('groupBuilderClearBtn')?.addEventListener('click', () => commitScript('', 'Konuşma temizlendi'));
  $('scenarioHint')?.addEventListener('click', () => switchTab('script'));
}

/** Every editor operation commits the canonical script; there is no staging list. */
function commitScript(value, message = 'Konuşma güncellendi') {
  const before = state.get('player.script') || '';
  if (before === value) return;
  runUndoable({
    message,
    silent: true,
    capture: () => state.get('player.script') || '',
    restore: value => setScriptText(value),
    action: () => setScriptText(value),
  });
  const status = $('conversationEditStatus');
  if (status) status.textContent = message;
}

function addLine(raw) {
  if (!String(raw || '').trim()) return;
  const existing = state.get('player.script') || '';
  const lines = getPhysicalScriptLines(existing);
  if (insertAfterIndex !== null && insertAfterIndex >= 0 && insertAfterIndex < lines.length) {
    lines.splice(insertAfterIndex + 1, 0, raw);
    commitScript(lines.join('\n'), 'Mesaj konuşmaya eklendi');
  } else {
    commitScript(existing + (existing && !existing.endsWith('\n') ? '\n' : '') + raw, 'Mesaj konuşmaya eklendi');
  }
  insertAfterIndex = null;
}

/* ========================================
   VALIDATION
   ======================================== */

function setupValidation() {
  const scriptBox = $('scriptBox');
  if (!scriptBox) return;
  const validationBox = $('scriptValidation');
  const run = () => {
    const issues = validateScript(scriptBox.value || '');
    SyntaxHighlight.setIssues('scriptBox', issues);
    renderValidationPanel(issues, validationBox);
    if (state.get('player.script') !== (scriptBox.value || '')) state.set('player.script', scriptBox.value || '');
  };
  scriptBox.addEventListener('input', run);
  run();
}

function renderValidationPanel(issues, target) {
  if (!target) return;
  target.replaceChildren();

  if (!issues.length) {
    target.appendChild(createElement('div', { className: 'pill pill-success' }, ['✓ Senaryo temiz görünüyor']));
    return;
  }

  const errors = issues.filter(issue => issue.severity === 'error');
  const warnings = issues.filter(issue => issue.severity === 'warning');
  const summaryParts = [];

  if (errors.length) summaryParts.push(`${errors.length} hata`);
  if (warnings.length) summaryParts.push(`${warnings.length} uyarı`);

  const panel = createElement('div', { className: 'script-feedback' });
  panel.appendChild(createElement('div', { className: 'script-feedback-header' }, [
    createElement('strong', {}, [summaryParts.join(' · ')]),
    createElement('button', {
      type: 'button',
      className: 'secondary btn-sm',
      onClick: () => focusHelpTarget('commandHelpAccordion'),
    }, ['Komut Yardımı']),
  ]));

  const list = createElement('div', { className: 'script-feedback-list' });
  issues.slice(0, 6).forEach(issue => {
    list.appendChild(renderIssueCard(issue));
  });

  if (issues.length > 6) {
    list.appendChild(createElement('div', { className: 'script-feedback-more' }, [
      `${issues.length - 6} geri bildirim daha var. Önce üstteki satırları düzeltin.`
    ]));
  }

  panel.appendChild(list);
  target.appendChild(panel);
}

function renderIssueCard(issue) {
  const severityClass = issue.severity === 'warning' ? 'warning' : 'error';
  const label = issue.severity === 'warning' ? 'Uyarı' : 'Hata';
  const card = createElement('div', { className: `script-issue ${severityClass}` });

  card.appendChild(createElement('div', { className: 'script-issue-title' }, [
    createElement('span', { className: 'script-issue-line' }, [`Satır ${issue.line}`]),
    createElement('span', { className: 'script-issue-severity' }, [label]),
  ]));

  card.appendChild(createElement('div', { className: 'script-issue-message' }, [issue.message]));

  if (issue.suggestion) {
    card.appendChild(createElement('div', { className: 'script-issue-suggestion' }, [issue.suggestion]));
  }

  if (issue.example) {
    card.appendChild(createElement('code', { className: 'script-issue-example' }, [issue.example]));
  }

  card.appendChild(createElement('button', {
    type: 'button',
    className: 'secondary btn-sm script-issue-focus',
    onClick: () => focusScriptLine(issue.line),
  }, [`Satır ${issue.line} üzerinde düzelt` ]));

  return card;
}

/* ========================================
   MOBILE MESSAGE FLOW
   #scriptBox remains the single source of truth; cards are a projection.
   ======================================== */

function getPhysicalScriptLines(text = '') {
  return String(text).replace(/\r\n?/g, '\n').split('\n');
}

function getVisibleScriptLines(text = '') {
  return getPhysicalScriptLines(text)
    .map((raw, sourceIndex) => ({ raw, sourceIndex, lineNumber: sourceIndex + 1 }))
    .filter((line) => line.raw.trim());
}

function parseSimpleMessage(raw = '') {
  if (raw.trim().startsWith('@')) return null;
  const match = raw.match(/^([^:>]+):\s*(.*)$/);
  if (!match) return null;
  return { sender: match[1].trim(), message: match[2] };
}

function setScriptText(value, { focusLine = null } = {}) {
  const box = $('scriptBox');
  if (box && box.value !== value) box.value = value;
  state.set('player.script', value);
  if (box) {
    const issues = validateScript(value);
    SyntaxHighlight.setIssues('scriptBox', issues);
    renderValidationPanel(issues, $('scriptValidation'));
    box.dispatchEvent(new Event('input', { bubbles: true }));
  }
  renderMobileScriptFlow();
  if (focusLine !== null) focusScriptLine(focusLine);
}

function focusScriptLine(lineNumber) {
  const box = $('scriptBox');
  if (!box) return;
  const safeLine = Math.max(1, Number(lineNumber) || 1);
  const lines = getPhysicalScriptLines(box.value);
  const start = lines.slice(0, safeLine - 1).reduce((total, line) => total + line.length + 1, 0);
  const end = start + (lines[safeLine - 1]?.length || 0);
  for (let ancestor = box.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.tagName === 'DETAILS') ancestor.open = true;
  }
  box.focus();
  box.setSelectionRange(start, end);
  box.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
}

function fillMobileSenderOptions(preferred = '') {
  const select = $('mobileScriptSender');
  if (!select) return;
  const people = Object.keys(state.get('people') || {}).sort((a, b) => a.localeCompare(b, 'tr'));
  const selfName = state.get('selfName');
  const names = selfName
    ? [selfName, ...people.filter((name) => name !== selfName)]
    : people;
  if (preferred && !names.includes(preferred)) names.push(preferred);
  select.replaceChildren(...names.map((name) => createElement('option', { value: name }, [
    state.isSelf(name) ? `${name} (Sen)` : name,
  ])));
  select.value = names.includes(preferred) ? preferred : (selfName || names[0] || 'Me');
}

function composeMessageForPerson(sender, trigger = null) {
  document.dispatchEvent(new CustomEvent('workspace:navigate', { detail: { key: 'scriptEditor', trigger } }));
  const composer = $('mobileScriptComposer');
  // Reusing the workspace navigation must not discard an unfinished new message.
  if (composer?.hidden || mobileScriptEditingLine !== null) openMobileScriptComposer();
  fillMobileSenderOptions(sender);
  $('mobileScriptMessage')?.focus();
}

const FIELD_LABELS = {
  replyTo: 'Yanıtlanan kişi', url: 'Görsel veya video bağlantısı', caption: 'Açıklama (isteğe bağlı)',
  duration: 'Ses süresi', placeName: 'Yer adı', placeInfo: 'Adres / alt bilgi',
  fileName: 'Dosya adı', fileSize: 'Dosya boyutu / türü', stickerVal: 'Çıkartma veya emoji',
  linkTitle: 'Bağlantı başlığı', linkUrl: 'Bağlantı adresi', voMediaType: 'Medya türü',
  typingMs: 'Yazıyor süresi (ms)', emoji: 'Tepki emojisi', reactTarget: 'Hedef kişi',
  systemText: 'Sistem mesajı', personName: 'Kişi adı',
};

function parseEditableLine(raw = '') {
  const message = parseSimpleMessage(raw);
  if (message) return { type: 'message', values: { who: message.sender, text: message.message } };
  const reply = raw.match(/^([^:>]+)\s*>\s*([^:]+):\s*(.*)$/);
  if (reply) return { type: 'reply', values: { who: reply[1].trim(), replyTo: reply[2].trim(), text: reply[3] } };
  const tokens = tokenizeCommand(raw);
  const type = tokens[0]?.replace(/^@/, '');
  if (!raw.trim().startsWith('@') || !BUILDER_FIELDS[type]) return null;
  if (validateScript(raw).some(issue => issue.severity === 'error')) return null;
  if (['system', 'add', 'leave'].includes(type)) {
    return { type, values: { [type === 'system' ? 'systemText' : 'personName']: raw.trim().slice(type.length + 2) } };
  }
  const values = { who: tokens[1] || '' };
  const fields = BUILDER_FIELDS[type].filter(field => field !== 'who');
  fields.forEach((field, index) => {
    values[field] = index === fields.length - 1 ? tokens.slice(index + 2).join(' ') : (tokens[index + 2] || '');
  });
  return { type, values };
}

function composerError(message = '', control = $('mobileScriptMessage')) {
  const error = $('conversationComposerError');
  if (error) error.textContent = message;
  $('mobileScriptComposer')?.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  if (message && control) {
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', 'conversationComposerError');
    control.focus();
  }
}

function syncComposerFields() {
  const fields = BUILDER_FIELDS[$('conversationMessageType')?.value || 'message'] || [];
  const sender = $('mobileScriptSender');
  const message = $('mobileScriptMessage');
  if (sender) (sender.closest('.form-group') || sender).hidden = !fields.includes('who');
  if (message) (message.closest('.form-group') || message).hidden = !fields.includes('text');
  document.querySelectorAll('[data-conversation-field]').forEach(group => {
    group.hidden = !fields.includes(group.dataset.conversationField);
  });
  const upload = $('conversationMediaUpload');
  if (upload) upload.hidden = !['photo', 'gif', 'sticker'].includes($('conversationMessageType')?.value);
}

function setupComposerTypes() {
  const composer = $('mobileScriptComposer');
  if (!composer || $('conversationMessageType')) return;
  const type = createElement('select', { id: 'conversationMessageType', onChange: syncComposerFields },
    BUILDER_TYPES.map(item => createElement('option', { value: item.id }, [item.label])));
  const typeGroup = createElement('div', { className: 'form-group' }, [
    createElement('label', { for: type.id }, ['Mesaj türü']), type,
  ]);
  const message = $('mobileScriptMessage');
  (message.closest('.form-group') || message).after(typeGroup);
  const fields = createElement('div', { id: 'conversationTypeFields' });
  for (const [field, label] of Object.entries(FIELD_LABELS)) {
    const input = field === 'voMediaType'
      ? createElement('select', { id: 'conversationField_' + field }, [
        createElement('option', { value: 'photo' }, ['Fotoğraf']),
        createElement('option', { value: 'video' }, ['Video']),
      ])
      : createElement('input', { type: field === 'typingMs' ? 'number' : 'text', id: 'conversationField_' + field });
    fields.append(createElement('div', { className: 'form-group', dataset: { conversationField: field } }, [
      createElement('label', { for: input.id }, [label]), input,
    ]));
  }
  typeGroup.after(fields);
  const uploadInput = createElement('input', { id: 'conversationMediaFile', type: 'file', accept: 'image/*' });
  fields.prepend(createElement('div', { id: 'conversationMediaUpload', className: 'form-group' }, [
    createElement('label', { for: uploadInput.id }, ['Cihazdan görsel seç']), uploadInput,
  ]));
  uploadInput.addEventListener('change', async () => {
    const file = uploadInput.files?.[0];
    if (!file) return;
    const selectedType = type.value;
    const selectedSource = editingSource;
    try {
      const data = await readFileAsDataURL(file);
      if (composer.hidden || type.value !== selectedType || selectedSource !== editingSource) return;
      $('conversationField_' + (selectedType === 'sticker' ? 'stickerVal' : 'url')).value = data;
      composerError();
    } catch {
      composerError('Görsel okunamadı. Başka bir dosya seçin.', uploadInput);
    }
  });
  fields.after(createElement('p', { id: 'conversationComposerError', role: 'alert', className: 'conversation-inline-error' }));
  syncComposerFields();
}

function openMobileScriptComposer(line = null) {
  const composer = $('mobileScriptComposer');
  const message = $('mobileScriptMessage');
  if (!composer || !message) return;
  const parsed = line ? parseEditableLine(line.raw) : { type: 'message', values: {} };
  if (!parsed) { focusScriptLine(line.lineNumber); return; }
  mobileScriptEditingLine = line?.sourceIndex ?? null;
  editingSource = state.get('player.script') || '';
  editingConversation = state.get('conversations.activeId');
  fillMobileSenderOptions(parsed.values.who || '');
  if (parsed.values.who && !$('mobileScriptSender').value) {
    $('mobileScriptSender').append(createElement('option', { value: parsed.values.who }, [parsed.values.who]));
    $('mobileScriptSender').value = parsed.values.who;
  }
  message.value = parsed.values.text || '';
  $('conversationMessageType').value = parsed.type;
  if ($('conversationMediaFile')) $('conversationMediaFile').value = '';
  for (const field of Object.keys(FIELD_LABELS)) {
    $('conversationField_' + field).value = parsed.values[field] || (field === 'voMediaType' ? 'photo' : '');
  }
  syncComposerFields();
  composerError();
  $('mobileScriptComposerTitle').textContent = line ? 'Mesajı düzenle' : 'Yeni mesaj';
  $('mobileScriptSaveBtn').textContent = line ? 'Değişiklikleri Kaydet' : 'Konuşmaya Ekle';
  composer.hidden = false;
  $('mobileScriptAddBtn').hidden = true;
  const focusTarget = BUILDER_FIELDS[parsed.type].includes('text') ? message : composer.querySelector('[data-conversation-field]:not([hidden]) input');
  focusTarget?.focus();
}

function closeMobileScriptComposer({ restoreFocus = true } = {}) {
  const composer = $('mobileScriptComposer');
  if (composer) composer.hidden = true;
  mobileScriptEditingLine = null;
  editingSource = null;
  editingConversation = null;
  const addButton = $('mobileScriptAddBtn');
  if (addButton) {
    addButton.hidden = false;
    if (restoreFocus) addButton.focus();
  }
}

function saveMobileScriptMessage() {
  // Retain the draft, but never silently apply it to a different or reordered conversation.
  if (editingConversation !== state.get('conversations.activeId') ||
      (mobileScriptEditingLine !== null && editingSource !== (state.get('player.script') || ''))) {
    composerError('Konuşma değişti. Taslağı kopyalayıp doğru mesajı yeniden açın.');
    return;
  }
  const type = $('conversationMessageType')?.value || 'message';
  const values = {
    who: $('mobileScriptSender')?.value?.trim() || state.get('selfName') || 'Me',
    text: $('mobileScriptMessage')?.value?.trim() || '',
  };
  for (const field of Object.keys(FIELD_LABELS)) values[field] = $('conversationField_' + field)?.value || '';
  const required = { message: ['text'], reply: ['text', 'replyTo'], photo: ['url'], gif: ['url'], video: ['url'],
    location: ['placeName'], link: ['linkTitle'], reaction: ['emoji', 'reactTarget'], system: ['systemText'], add: ['personName'], leave: ['personName'] };
  for (const field of (required[type] || [])) {
    if (!values[field].trim()) {
      composerError((FIELD_LABELS[field] || 'Mesaj') + ' boş bırakılamaz.', field === 'text' ? $('mobileScriptMessage') : $('conversationField_' + field));
      return;
    }
  }
  if ((BUILDER_FIELDS[type] || []).some(field => /[\r\n]/.test(values[field]))) {
    composerError('Bir karta tek mesaj yazın. Ayrı mesajlar için yeni kart ekleyin.');
    return;
  }
  const raw = buildLineFromValues(type, values);
  if (!raw) { composerError('Mesaj türünü ve gerekli alanları kontrol edin.'); return; }
  const errors = validateScript(raw).filter(issue => issue.severity === 'error');
  if (errors.length) { composerError(errors[0].message); return; }
  if (mobileScriptEditingLine === null) addLine(raw);
  else {
    const lines = getPhysicalScriptLines(state.get('player.script') || '');
    lines[mobileScriptEditingLine] = raw;
    commitScript(lines.join('\n'), 'Mesaj güncellendi');
  }
  closeMobileScriptComposer();
}

function deleteMobileScriptLine(line) {
  const lines = getPhysicalScriptLines(state.get('player.script') || '');
  lines.splice(line.sourceIndex, 1);
  commitScript(lines.join('\n'), 'Mesaj silindi');
}

function moveMobileScriptLine(line, offset) {
  const visible = getVisibleScriptLines(state.get('player.script') || '');
  const position = visible.findIndex((item) => item.sourceIndex === line.sourceIndex);
  const target = visible[position + offset];
  if (!target) return;
  const lines = getPhysicalScriptLines(state.get('player.script') || '');
  [lines[line.sourceIndex], lines[target.sourceIndex]] = [lines[target.sourceIndex], lines[line.sourceIndex]];
  commitScript(lines.join('\n'), 'Mesaj sırası değiştirildi');
  $('mobileScriptList')?.querySelector('[data-source-index="' + target.sourceIndex + '"] button')?.focus();
}

function createMobileScriptCard(line, issue) {
  const parsed = parseSimpleMessage(line.raw);
  const editable = parseEditableLine(line.raw);
  const card = createElement('article', {
    className: 'mobile-script-card' + (issue ? ' has-' + issue.severity : ''),
    dataset: { sourceIndex: String(line.sourceIndex) },
  });
  const head = createElement('div', { className: 'mobile-script-card-head' }, [
    createElement('span', { className: 'mobile-script-line-number' }, [line.lineNumber + '. satır']),
  ]);
  if (issue) head.appendChild(createElement('span', { className: 'mobile-script-issue-label ' + issue.severity }, [
    issue.severity === 'warning' ? 'Uyarı' : 'Hata',
  ]));
  card.appendChild(head);
  const edit = createElement('button', {
    type: 'button', className: 'conversation-card-edit',
    onClick: () => editable ? openMobileScriptComposer(line) : focusScriptLine(line.lineNumber),
    'aria-label': 'Satır ' + line.lineNumber + ' düzenle',
  }, [
    createElement('strong', { className: 'mobile-script-sender' }, [editable?.values.who || parsed?.sender || 'Konuşma olayı']),
    createElement('span', { className: 'mobile-script-message' }, [parsed?.message || summaryText(line)]),
    createElement('span', { className: 'hint' }, [editable ? 'Düzenle' : 'Metinde düzelt']),
  ]);
  card.appendChild(edit);
  if (issue) card.appendChild(createElement('p', { className: 'mobile-script-card-issue' }, [issue.message]));
  const actions = createElement('div', { className: 'mobile-script-card-actions' });
  if (mobileScriptReorderMode) {
    for (const [offset, label, accessible] of [[-1, 'Yukarı', 'yukarı'], [1, 'Aşağı', 'aşağı']]) {
      const button = createElement('button', {
        type: 'button', className: 'secondary btn-sm', onClick: () => moveMobileScriptLine(line, offset),
        'aria-label': 'Satır ' + line.lineNumber + ' ' + accessible + ' taşı',
      }, [label]);
      const visible = getVisibleScriptLines(state.get('player.script') || '');
      const index = visible.findIndex(item => item.sourceIndex === line.sourceIndex);
      button.disabled = !visible[index + offset];
      actions.append(button);
    }
  } else {
    const menu = createElement('details', { className: 'conversation-card-menu' }, [
      createElement('summary', { 'aria-label': 'Satır ' + line.lineNumber + ' diğer işlemler' }, ['Diğer işlemler']),
      createElement('button', {
        type: 'button', className: 'secondary btn-sm',
        onClick: () => { $('mobileScriptReorderBtn')?.click(); },
      }, ['Sıralamayı değiştir']),
      createElement('button', {
        type: 'button', className: 'secondary btn-sm mobile-script-delete',
        onClick: () => deleteMobileScriptLine(line), 'aria-label': 'Satır ' + line.lineNumber + ' sil',
      }, ['Sil']),
    ]);
    actions.append(menu);
  }
  card.appendChild(actions);
  return card;
}

function syncMobileScriptPlaybackStatus() {
  const target = $('mobileScriptPlaybackStatus');
  if (!target) return;
  const player = state.get('player') || {};
  if (isPlayerPlaying()) target.textContent = 'Senaryo oynatılıyor';
  else if (player.paused && (player.queue?.length || player.cursor)) target.textContent = 'Senaryo duraklatıldı';
  else target.textContent = 'Oynatmaya hazır';
}

function renderMobileScriptFlow() {
  const list = $('mobileScriptList');
  const summary = $('mobileScriptFlowSummary');
  const box = $('scriptBox');
  if (!list || !summary || !box) return;
  const lines = getVisibleScriptLines(state.get('player.script') || '');
  const issueByLine = new Map(validateScript(box.value).map((issue) => [issue.line, issue]));
  list.replaceChildren(...lines.map((line) => createMobileScriptCard(line, issueByLine.get(line.lineNumber))));
  if (!lines.length) {
    list.appendChild(createElement('div', { className: 'mobile-script-empty' }, ['Henüz mesaj yok. İlk mesajı ekleyin.']));
  }
  const issueCount = issueByLine.size;
  summary.textContent = `${lines.length} satır${issueCount ? ` · ${issueCount} geri bildirim` : ' · oynatmaya hazır'}`;
  syncMobileScriptPlaybackStatus();
}

function setupMobileScriptFlow() {
  const box = $('scriptBox');
  if (!box || !$('mobileScriptFlow')) return;
  setupComposerTypes();
  setupConversationToolbar();
  setupRawTextDisclosure();
  box.addEventListener('input', renderMobileScriptFlow);
  $('mobileScriptAddBtn')?.addEventListener('click', () => openMobileScriptComposer());
  $('mobileScriptCancelBtn')?.addEventListener('click', () => closeMobileScriptComposer());
  $('mobileScriptSaveBtn')?.addEventListener('click', saveMobileScriptMessage);
  $('mobileScriptComposer')?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMobileScriptComposer();
    }
  });
  $('mobileScriptReorderBtn')?.addEventListener('click', (event) => {
    mobileScriptReorderMode = !mobileScriptReorderMode;
    event.currentTarget.setAttribute('aria-pressed', String(mobileScriptReorderMode));
    event.currentTarget.textContent = mobileScriptReorderMode ? 'Sıralamayı Bitir' : 'Sırala';
    renderMobileScriptFlow();
  });
  unsubscribeScript = state.subscribe((path) => {
    if (!path || path === 'player.script') {
      const next = state.get('player.script') || '';
      if (box.value !== next) box.value = next;
      const issues = validateScript(next);
      SyntaxHighlight.setIssues('scriptBox', issues);
      renderValidationPanel(issues, $('scriptValidation'));
      renderMobileScriptFlow();
    }
    if (!path || path === 'player.playback') syncMobileScriptPlaybackStatus();
  });
  renderMobileScriptFlow();
}

function setupConversationToolbar() {
  const flow = $('mobileScriptFlow');
  if (!flow || $('conversationHistory')) return;
  const undo = createElement('button', { type: 'button', id: 'conversationUndo', className: 'secondary btn-sm', onClick: () => undoLast({ silent: true }) }, ['Geri Al']);
  const redo = createElement('button', { type: 'button', id: 'conversationRedo', className: 'secondary btn-sm', onClick: () => redoLast({ silent: true }) }, ['Yinele']);
  const controls = createElement('div', { id: 'conversationHistory', className: 'conversation-toolbar', 'aria-label': 'Konuşma düzenleme geçmişi' }, [undo, redo]);
  const update = () => {
    if (!controls.isConnected) { document.removeEventListener('history:change', update); return; }
    const status = getHistoryStatus();
    undo.disabled = !status.canUndo;
    redo.disabled = !status.canRedo;
  };
  flow.prepend(controls);
  controls.after(createElement('p', { id: 'conversationEditStatus', role: 'status', 'aria-live': 'polite', className: 'hint' }));
  document.addEventListener('history:change', update);
  update();
}

function setupRawTextDisclosure() {
  const box = $('scriptBox');
  if (!box || $('conversationTextAdvanced')) return;
  const wrapper = box.closest('.sh-wrapper') || box;
  const advanced = createElement('details', { id: 'conversationTextAdvanced', className: 'conversation-advanced', dataset: { advancedGroup: 'conversation-text' } }, [
    createElement('summary', {}, ['Gelişmiş · Metin düzenleyici']),
  ]);
  wrapper.before(advanced);
  advanced.append(wrapper);
  box.setAttribute('aria-label', 'Konuşma metin düzenleyicisi');
  advanced.append(createElement('p', { className: 'hint' }, ['Kartlar ve metin aynı konuşmayı düzenler. Metin alanında klavyenin doğal geri alma işlevi kullanılır.']));
}

function focusHelpTarget(targetId) {
  const target = $(targetId);
  if (!target) return;
  if (target.closest('#help')) {
    document.dispatchEvent(new CustomEvent('workspace:navigate', { detail: { key: 'help', trigger: document.activeElement } }));
  }
  for (let ancestor = target; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.tagName === 'DETAILS') ancestor.open = true;
  }
  target.querySelector(':scope > summary')?.focus({ preventScroll: true });
  target.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  target.classList.add('focus-flash');
  window.setTimeout(() => target.classList.remove('focus-flash'), 1200);
}

/* ========================================
   MEDIA INSERT TOOL (Senaryo Tab)
   ======================================== */

function setupMediaInsertTool() {
  const btn = $('mediaInsertBtn');
  if (!btn) return;

  const typeEl = $('mediaTypeSelect');
  const senderEl = $('mediaSenderSelect');
  const fileInput = $('mediaFileInput');
  const urlInput = $('mediaUrlInput');
  const captionInput = $('mediaCaptionInput');
  const clearBtn = $('mediaClearBtn');

  const fileLabel = $('mediaFileLabel');
  const urlLabel = $('mediaUrlLabel');
  const captionLabel = $('mediaCaptionLabel');

  const insertLineIntoScript = (line) => {
    const box = $('scriptBox');
    if (!box) return;
    const value = box.value ?? '';
    const start = (typeof box.selectionStart === 'number') ? box.selectionStart : value.length;
    const end = (typeof box.selectionEnd === 'number') ? box.selectionEnd : value.length;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const needsNlBefore = before.length > 0 && !before.endsWith('\n');
    const prefix = needsNlBefore ? '\n' : '';
    commitScript(before + prefix + line + '\n' + after, 'Mesaj konuşmaya eklendi');
    const newPos = (before + prefix + line + '\n').length;
    box.selectionStart = box.selectionEnd = newPos;
    for (let ancestor = box.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.tagName === 'DETAILS') ancestor.open = true;
    }
    box.focus();
  };

  const resetInputs = () => {
    if (fileInput) {
      fileInput.value = '';
      const nameEl = fileInput.closest('.file-input')?.querySelector('.file-name');
      if (nameEl) nameEl.textContent = 'Seçilmedi';
    }
    if (urlInput) urlInput.value = '';
    if (captionInput) captionInput.value = '';
  };

  const syncFields = () => {
    const type = typeEl?.value || 'photo';
    const fileGroup = fileInput?.closest('.form-group');
    const urlGroup = urlInput?.closest('.form-group');

    if (type === 'photo') {
      if (fileLabel) fileLabel.textContent = 'Dosya (fotoğraf)';
      if (urlLabel) urlLabel.textContent = 'URL (opsiyonel)';
      if (captionLabel) captionLabel.textContent = 'Açıklama (opsiyonel)';
      if (fileInput) fileInput.setAttribute('accept', 'image/*');
      if (fileGroup) fileGroup.style.display = '';
      if (urlGroup) urlGroup.style.display = '';
    } else if (type === 'gif') {
      if (fileLabel) fileLabel.textContent = 'Dosya (GIF)';
      if (urlLabel) urlLabel.textContent = 'GIF URL (opsiyonel)';
      if (captionLabel) captionLabel.textContent = 'Açıklama (opsiyonel)';
      if (fileInput) fileInput.setAttribute('accept', 'image/gif');
      if (fileGroup) fileGroup.style.display = '';
      if (urlGroup) urlGroup.style.display = '';
    } else if (type === 'video') {
      if (urlLabel) urlLabel.textContent = 'Video URL (zorunlu)';
      if (captionLabel) captionLabel.textContent = 'Açıklama (opsiyonel)';
      if (fileGroup) fileGroup.style.display = 'none';
      if (urlGroup) urlGroup.style.display = '';
    } else if (type === 'voice') {
      if (urlLabel) urlLabel.textContent = 'Not (opsiyonel)';
      if (captionLabel) captionLabel.textContent = 'Süre (örn: 12s / 00:18 / 8000)';
      if (fileGroup) fileGroup.style.display = 'none';
      if (urlGroup) urlGroup.style.display = '';
    } else if (type === 'location') {
      if (urlLabel) urlLabel.textContent = 'Yer Adı (zorunlu)';
      if (captionLabel) captionLabel.textContent = 'Alt Bilgi (opsiyonel)';
      if (fileGroup) fileGroup.style.display = 'none';
      if (urlGroup) urlGroup.style.display = '';
    } else if (type === 'document') {
      if (urlLabel) urlLabel.textContent = 'Dosya Adı (örn: rapor.pdf)';
      if (captionLabel) captionLabel.textContent = 'Boyut/Tip (örn: 2.4 MB · PDF)';
      if (fileGroup) fileGroup.style.display = 'none';
      if (urlGroup) urlGroup.style.display = '';
    } else if (type === 'sticker') {
      if (fileLabel) fileLabel.textContent = 'Dosya (sticker görseli)';
      if (urlLabel) urlLabel.textContent = 'URL (opsiyonel)';
      if (captionLabel) captionLabel.textContent = 'Emoji (URL yoksa kullanılır)';
      if (fileInput) fileInput.setAttribute('accept', 'image/*');
      if (fileGroup) fileGroup.style.display = '';
      if (urlGroup) urlGroup.style.display = '';
    } else if (type === 'link') {
      if (urlLabel) urlLabel.textContent = 'Başlık (zorunlu)';
      if (captionLabel) captionLabel.textContent = 'URL (görünür link metni)';
      if (fileGroup) fileGroup.style.display = 'none';
      if (urlGroup) urlGroup.style.display = '';
    } else if (type === 'viewonce') {
      if (urlLabel) urlLabel.textContent = 'Tür (photo veya video)';
      if (captionLabel) captionLabel.textContent = '(kullanılmaz)';
      if (fileGroup) fileGroup.style.display = 'none';
      if (urlGroup) urlGroup.style.display = '';
    }
  };

  if (typeEl) typeEl.addEventListener('change', syncFields);
  syncFields();

  btn.addEventListener('click', async () => {
    try {
      const type = typeEl?.value || 'photo';
      const sender = quoteToken(senderEl?.value);
      const file = fileInput?.files?.[0];
      const url = urlInput?.value?.trim() || '';
      const caption = captionInput?.value?.trim() || '';

      if (type === 'location') {
        if (!url) throw new Error('Yer adı gerekiyor');
        const line = `@location ${sender} ${quoteForce(url)}${caption ? ' ' + quoteForce(caption) : ''}`;
        insertLineIntoScript(line);
        showSuccess('Konum komutu eklendi');
        resetInputs(); return;
      }
      if (type === 'document') {
        const line = `@document ${sender} ${quoteForce(url || 'dosya.pdf')}${caption ? ' ' + quoteForce(caption) : ''}`;
        insertLineIntoScript(line);
        showSuccess('Döküman komutu eklendi');
        resetInputs(); return;
      }
      if (type === 'sticker') {
        let src = '';
        if (file) src = await readFileAsDataURL(file);
        else if (url) src = url;
        else src = caption || '🙂';
        insertLineIntoScript(`@sticker ${sender} ${quoteForce(src)}`);
        showSuccess('Sticker komutu eklendi');
        resetInputs(); return;
      }
      if (type === 'link') {
        const line = `@link ${sender} ${quoteForce(url || 'Bağlantı')}${caption ? ' ' + quoteForce(caption) : ''}`;
        insertLineIntoScript(line);
        showSuccess('Link önizleme komutu eklendi');
        resetInputs(); return;
      }
      if (type === 'viewonce') {
        const mt = (url || 'photo').toLowerCase() === 'video' ? 'video' : 'photo';
        insertLineIntoScript(`@viewonce ${sender} ${mt}`);
        showSuccess('Bir kez görüntüle komutu eklendi');
        resetInputs(); return;
      }
      if (type === 'voice') {
        const dur = caption || '12s';
        const line = `@voice ${sender} ${dur}${url ? ' ' + quoteForce(url) : ''}`;
        insertLineIntoScript(line);
        showSuccess('Sesli mesaj komutu eklendi');
        resetInputs(); return;
      }
      if (type === 'video') {
        if (!url) throw new Error('Video için URL gerekiyor');
        const line = `@video ${sender} ${quoteForce(url)}${caption ? ' ' + quoteForce(caption) : ''}`;
        insertLineIntoScript(line);
        showSuccess('Video komutu eklendi');
        resetInputs(); return;
      }
      // photo / gif
      let src = '';
      if (file) src = await readFileAsDataURL(file);
      else if (url) src = url;
      else throw new Error('Foto/GIF için dosya seçin veya URL girin');
      const cmd = type === 'gif' ? '@gif' : '@photo';
      const line = `${cmd} ${sender} ${quoteForce(src)}${caption ? ' ' + quoteForce(caption) : ''}`;
      insertLineIntoScript(line);
      showSuccess((type === 'gif' ? 'GIF' : 'Fotoğraf') + ' komutu eklendi');
      resetInputs();
    } catch (err) {
      showError(err?.message || 'Medya komutu eklenemedi');
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      resetInputs();
      showSuccess('Temizlendi');
    });
  }
}

/* ========================================
   BLOCK RENDERING & DRAG-DROP
   ======================================== */

function renderBlocks() {
  // Compatibility export: the only list is the card projection of player.script.
  renderMobileScriptFlow();
}

function summaryText(block) {
  const raw = block.raw || '';
  if (raw.startsWith('@add '))      return `➕ ${raw.slice(5).trim()} katılır`;
  if (raw.startsWith('@leave '))    return `🚪 ${raw.slice(7).trim()} ayrılır`;
  if (raw.startsWith('@system '))   return `⚙️ ${raw.slice(8).trim()}`;
  if (raw.startsWith('@typing '))   return `⏳ ${tokenizeCommand(raw)[1] || '?'} yazıyor…`;
  if (raw.startsWith('@reaction ')) { const t = tokenizeCommand(raw); return `😂 ${t[1]||'?'} → ${t[2]||''} → ${t.slice(3).join(' ')}`; }
  if (raw.startsWith('@photo '))    return `📷 ${tokenizeCommand(raw)[1] || '?'}: Fotoğraf`;
  if (raw.startsWith('@gif '))      return `🎞️ ${tokenizeCommand(raw)[1] || '?'}: GIF`;
  if (raw.startsWith('@video '))    return `🎬 ${tokenizeCommand(raw)[1] || '?'}: Video`;
  if (raw.startsWith('@voice '))    return `🎤 ${tokenizeCommand(raw)[1] || '?'}: Ses`;
  if (raw.startsWith('@location ')) return `📍 ${tokenizeCommand(raw)[1] || '?'}: Konum`;
  if (raw.startsWith('@document ')) return `📄 ${tokenizeCommand(raw)[1] || '?'}: Döküman`;
  if (raw.startsWith('@sticker '))  return `🏷️ ${tokenizeCommand(raw)[1] || '?'}: Sticker`;
  if (raw.startsWith('@link '))     return `🔗 ${tokenizeCommand(raw)[1] || '?'}: Link`;
  if (raw.startsWith('@viewonce ')) return `👁️ ${tokenizeCommand(raw)[1] || '?'}: Bir kez`;
  const replyMatch = raw.match(/^(.+?)\s*>\s*(.+?)\s*:\s*(.+)$/);
  if (replyMatch) return `↩️ ${replyMatch[1].trim()}: ${replyMatch[3].trim().slice(0, 40)}`;
  const msgMatch = raw.match(/^(.+?)\s*:\s*(.+)$/);
  if (msgMatch) return `💬 ${msgMatch[1].trim()}: ${msgMatch[2].trim().slice(0, 40)}`;
  return raw.slice(0, 50);
}

export {
  initScriptTools,
  BUILDER_TYPES,
  BUILDER_FIELDS,
  buildLineFromValues,
  addLine,
  renderBlocks,
  commitScript,
  parseEditableLine,
  composeMessageForPerson,
};
