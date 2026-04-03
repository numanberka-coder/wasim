/* ========================================
   SCRIPT TOOLS - Line builder (16 tip), templates,
   validation, inner tabs, interactive demo,
   group tab line list
   ======================================== */

import { $, createElement, readFileAsDataURL, Logger } from '../utils.js';
import { SCRIPT_TEMPLATES } from '../config.js';
import { state } from '../state.js';
import { showSuccess, showError } from '../ui/toast.js';
import { tokenizeCommand, validateScript } from './script-parser.js';
import { loadScript, play } from './player.js';
import { switchTab } from '../ui/tabs.js';

let blocks = [];

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

function makeId() {
  const hasCrypto = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';
  return hasCrypto ? crypto.randomUUID() : String(Date.now()) + Math.random();
}

/* ========================================
   INIT
   ======================================== */

function initScriptTools() {
  setupValidation();
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
  const v = (key) => (values[key] ?? '').trim();
  const sender = quoteToken(v('who') || 'Me');

  switch (type) {
    case 'message': {
      const text = v('text');
      if (!text) { showError('Mesaj boş olamaz'); return null; }
      const who = v('who') || 'Me';
      return `${who}: ${text}`;
    }
    case 'reply': {
      const text = v('text');
      const replyTo = v('replyTo');
      if (!text) { showError('Mesaj boş olamaz'); return null; }
      if (!replyTo) { showError('Yanıtlanan kişi gerekli'); return null; }
      const who = v('who') || 'Me';
      return `${who} > ${replyTo}: ${text}`;
    }
    case 'photo': {
      const url = v('url');
      if (!url) { showError('URL gerekli'); return null; }
      const cap = v('caption');
      return `@photo ${sender} ${quoteForce(url)}${cap ? ' ' + quoteForce(cap) : ''}`;
    }
    case 'gif': {
      const url = v('url');
      if (!url) { showError('URL gerekli'); return null; }
      const cap = v('caption');
      return `@gif ${sender} ${quoteForce(url)}${cap ? ' ' + quoteForce(cap) : ''}`;
    }
    case 'video': {
      const url = v('url');
      if (!url) { showError('URL gerekli'); return null; }
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
      if (!name) { showError('Yer adı gerekli'); return null; }
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
      if (!title) { showError('Başlık gerekli'); return null; }
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
      if (!emoji) { showError('Emoji gerekli'); return null; }
      if (!target) { showError('Hedef gerekli'); return null; }
      return `@reaction ${sender} ${emoji} ${target}`;
    }
    case 'system': {
      const text = v('systemText');
      if (!text) { showError('Sistem mesajı boş olamaz'); return null; }
      return `@system ${text}`;
    }
    case 'add': {
      const name = v('personName');
      if (!name) { showError('Kişi adı gerekli'); return null; }
      return `@add ${name}`;
    }
    case 'leave': {
      const name = v('personName');
      if (!name) { showError('Kişi adı gerekli'); return null; }
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
  blocks = [];
  renderBlocks();

  const pushBtn = $('groupBuilderPushBtn');
  const playBtn = $('groupBuilderPlayBtn');
  const clearBtn = $('groupBuilderClearBtn');

  pushBtn?.addEventListener('click', pushBlocksToScriptBox);

  playBtn?.addEventListener('click', () => {
    if (!blocks.length) { showError('Satır listesi boş'); return; }
    const text = blocks.map(b => b.raw).join('\n');
    setScriptBox(text);
    loadScript();
    play();
  });

  clearBtn?.addEventListener('click', () => {
    blocks = [];
    clearInsertMode();
    renderBlocks();
  });

  // Senaryo yönlendirme banner'ı
  const hint = $('scenarioHint');
  if (hint) {
    hint.addEventListener('click', () => switchTab('script'));
  }
}

/**
 * Dışarıdan satır ekleme (inline builder'dan çağrılır)
 */
function addLine(raw) {
  const newBlock = { id: makeId(), raw };

  if (insertAfterIndex !== null && insertAfterIndex >= 0 && insertAfterIndex < blocks.length) {
    blocks.splice(insertAfterIndex + 1, 0, newBlock);
    showSuccess(`Satır ${insertAfterIndex + 2}. sıraya eklendi`);
  } else {
    blocks.push(newBlock);
    showSuccess('Satır eklendi');
  }

  clearInsertMode();
  renderBlocks();
}

/** Araya ekleme modunu aktifle */
function setInsertMode(index) {
  insertAfterIndex = index;
  renderBlocks();
}

/** Araya ekleme modunu iptal et */
function clearInsertMode() {
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
    const errors = validateScript(scriptBox.value || '');
    renderValidation(errors, validationBox);
    state.set('player.script', scriptBox.value || '');
  };
  scriptBox.addEventListener('input', run);
  run();
}

function renderValidation(errors, target) {
  if (!target) return;
  target.replaceChildren();
  if (!errors.length) {
    target.appendChild(createElement('div', { className: 'pill pill-success' }, ['✅ Senaryo temiz görünüyor']));
    return;
  }
  const list = document.createElement('ul');
  list.className = 'error-list';
  errors.forEach(err => {
    const li = document.createElement('li');
    li.textContent = `Satır ${err.line}: ${err.message}`;
    list.appendChild(li);
  });
  target.appendChild(list);
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
    box.value = before + prefix + line + '\n' + after;
    const newPos = (before + prefix + line + '\n').length;
    box.selectionStart = box.selectionEnd = newPos;
    box.dispatchEvent(new Event('input', { bubbles: true }));
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
  const list = $('groupBuilderList');
  if (!list) return;
  list.replaceChildren();

  if (!blocks.length) {
    list.appendChild(createElement('div', { className: 'empty' }, ['Henüz satır eklenmedi. Kişi kartına tıklayarak ekleyin.']));
    return;
  }

  blocks.forEach((block, index) => {
    const isInsertTarget = insertAfterIndex === index;

    const insertBtn = createElement('button', {
      className: 'icon-btn builder-insert-btn',
      title: 'Altına satır ekle',
      onClick: (e) => { e.stopPropagation(); setInsertMode(index); }
    }, ['+']);

    const summaryEl = createElement('div', {
      className: 'builder-summary',
      onClick: (e) => { e.stopPropagation(); showContextMenu(e, index); }
    }, [summaryText(block)]);

    const item = createElement('div', {
      className: 'builder-item' + (isInsertTarget ? ' insert-target' : ''),
      draggable: true,
      dataset: { id: block.id }
    }, [
      createElement('div', { className: 'builder-handle', title: 'Sürükle-bırak' }, ['↕']),
      summaryEl,
      insertBtn,
      createElement('button', { className: 'icon-btn', onClick: () => removeBlock(block.id), title: 'Sil' }, ['✖'])
    ]);
    attachDragEvents(item, index);
    list.appendChild(item);
  });
}

/* ========================================
   CONTEXT MENU — Hızlı Komut Menüsü
   ======================================== */

const CONTEXT_MENU_ITEMS = [
  { type: 'message',  label: '💬 Mesaj' },
  { type: 'photo',    label: '📷 Fotoğraf' },
  { type: 'typing',   label: '⏳ Yazıyor' },
  { type: 'reaction', label: '😂 Tepki' },
  { type: 'voice',    label: '🎤 Ses' },
  { type: 'system',   label: '⚙️ Sistem' },
  { type: 'sticker',  label: '🏷️ Sticker' },
  { type: 'reply',    label: '↩️ Yanıt' },
];

function showContextMenu(event, index) {
  closeContextMenu();

  const menu = document.createElement('div');
  menu.className = 'builder-context-menu';
  menu.id = 'builderContextMenu';

  CONTEXT_MENU_ITEMS.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'builder-context-item';
    btn.textContent = item.label;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setInsertMode(index);
      closeContextMenu();
    });
    menu.appendChild(btn);
  });

  // Pozisyonlama
  document.body.appendChild(menu);
  const rect = event.currentTarget.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();

  let top = rect.bottom + 4;
  let left = rect.left;

  // Ekranın dışına taşma kontrolü
  if (top + menuRect.height > window.innerHeight) {
    top = rect.top - menuRect.height - 4;
  }
  if (left + menuRect.width > window.innerWidth) {
    left = window.innerWidth - menuRect.width - 8;
  }

  menu.style.top = top + 'px';
  menu.style.left = left + 'px';

  // Dışına tıklayınca kapat
  setTimeout(() => {
    document.addEventListener('click', handleContextMenuClose);
    document.addEventListener('keydown', handleContextMenuEsc);
  }, 10);
}

function closeContextMenu() {
  const existing = $('builderContextMenu');
  if (existing) existing.remove();
  document.removeEventListener('click', handleContextMenuClose);
  document.removeEventListener('keydown', handleContextMenuEsc);
}

function handleContextMenuClose(e) {
  const menu = $('builderContextMenu');
  if (menu && !menu.contains(e.target)) closeContextMenu();
}

function handleContextMenuEsc(e) {
  if (e.key === 'Escape') closeContextMenu();
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

function attachDragEvents(el, index) {
  el.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', index.toString());
    el.classList.add('dragging');
  });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));
  el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('drag-over');
    const fromIndex = Number(e.dataTransfer.getData('text/plain'));
    const toIndex = Array.from(el.parentElement.children).indexOf(el);
    moveBlock(fromIndex, toIndex);
  });
}

function moveBlock(from, to) {
  if (from === to || from < 0 || to < 0) return;
  const [item] = blocks.splice(from, 1);
  blocks.splice(to, 0, item);
  clearInsertMode();
  renderBlocks();
}

function removeBlock(id) {
  const removedIndex = blocks.findIndex(b => b.id === id);
  blocks = blocks.filter(b => b.id !== id);

  // insertAfterIndex düzelt
  if (insertAfterIndex !== null) {
    if (removedIndex === insertAfterIndex) {
      clearInsertMode();
    } else if (removedIndex < insertAfterIndex) {
      insertAfterIndex--;
    }
  }

  renderBlocks();
}

/* ========================================
   SCRIPT SYNC
   ======================================== */

/** Satır listesini Senaryo textarea'sına aktar */
function pushBlocksToScriptBox() {
  if (blocks.length === 0) {
    showError('Eklenecek satır yok');
    return;
  }

  const lines = blocks.map(b => b.raw).join('\n');

  // Senaryo textarea'sına APPEND et
  const box = $('scriptBox');
  if (!box) return;
  const existing = box.value.trim();
  box.value = existing ? existing + '\n\n' + lines : lines;
  box.dispatchEvent(new Event('input', { bubbles: true }));
  showSuccess('Senaryoya aktarıldı!');
}

function setScriptBox(value) {
  const box = $('scriptBox');
  if (!box) return;
  box.value = value;
  state.set('player.script', value);
  box.dispatchEvent(new Event('input', { bubbles: true }));
}

export {
  initScriptTools,
  BUILDER_TYPES,
  BUILDER_FIELDS,
  buildLineFromValues,
  addLine,
  renderBlocks
};
