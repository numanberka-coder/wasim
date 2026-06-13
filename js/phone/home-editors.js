/* ========================================
   PHONE HOME EDITORS - Shared bottom sheet infrastructure
   ======================================== */

import { $, readFileAsDataURL } from '../utils.js';
import { state } from '../state.js';

function sanitizeImageValue(value) {
  return String(value || '').replace(/["\r\n\\]/g, '');
}

function cleanValue(value) {
  return String(value ?? '').trim();
}

function getUpdatesEditorValues() {
  const updates = state.get('phoneShellContent.updates') || {};
  const recent = Array.isArray(updates.recent) ? updates.recent : [];
  return {
    statusTitle: cleanValue(updates.status?.title),
    statusMeta: cleanValue(updates.status?.meta),
    statusNote: cleanValue(updates.status?.note),
    statusPhoto: cleanValue(updates.status?.photo),
    recent: recent.map((item) => ({
      title: cleanValue(item?.title),
      meta: cleanValue(item?.meta),
      initials: cleanValue(item?.initials),
      photo: cleanValue(item?.photo),
    })),
    channelTitle: cleanValue(updates.channels?.title),
    channelDescription: cleanValue(updates.channels?.description),
    channelDiscoverLabel: cleanValue(updates.channels?.discoverLabel),
    channelCreateLabel: cleanValue(updates.channels?.createLabel),
  };
}

function getCallsEditorValues() {
  const calls = state.get('phoneShellContent.calls') || {};
  const items = Array.isArray(calls.items) ? calls.items : [];
  const values = {};
  items.slice(0, 4).forEach((call, index) => {
    values[`call${index}Name`] = cleanValue(call?.name);
    values[`call${index}Meta`] = cleanValue(call?.meta);
    values[`call${index}Direction`] = cleanValue(call?.direction) || 'incoming';
    values[`call${index}Type`] = cleanValue(call?.type) || 'voice';
    values[`call${index}Initials`] = cleanValue(call?.initials);
    values[`call${index}Avatar`] = cleanValue(call?.avatarDataUrl || call?.avatarUrl);
  });
  return values;
}

const CALL_DIRECTION_OPTIONS = [
  { value: 'missed', label: 'Cevapsız' },
  { value: 'outgoing', label: 'Giden' },
  { value: 'incoming', label: 'Gelen' },
];

const CALL_TYPE_OPTIONS = [
  { value: 'voice', label: 'Sesli' },
  { value: 'video', label: 'Video' },
];

const EDITOR_CONFIGS = {
  newConversation: {
    title: 'Yeni sohbet',
    description: 'Sohbetler listesine kalıcı yeni bir sohbet ekler.',
    fields: [
      { name: 'title', label: 'Sohbet adı', required: true, maxLength: 64 },
      { name: 'subtitle', label: 'Alt bilgi', required: false, maxLength: 96 },
      { name: 'avatarUrl', label: 'Avatar URL', required: false, maxLength: 240 },
      { name: 'firstMessage', label: 'İlk mesaj', required: false, maxLength: 280, multiline: true },
    ],
    save(values) {
      return state.addConversation({
        title: values.title,
        subtitle: values.subtitle,
        photoUrl: values.avatarUrl,
        firstMessage: values.firstMessage,
      });
    },
  },
  updatesStatus: {
    title: 'Güncellemeleri düzenle',
    description: 'Durum, son güncellemeler ve kanal metinlerini günceller.',
    fields: [
      { name: 'statusTitle', label: 'Durum başlığı', required: true, maxLength: 48 },
      { name: 'statusMeta', label: 'Durum yardımcı metni', required: true, maxLength: 96 },
      { name: 'statusNote', label: 'Durum zamanı/metni', required: true, maxLength: 120 },
      { name: 'statusPhoto', label: 'Durum fotoğrafı', type: 'avatar', required: false },
      {
        name: 'recent',
        label: 'Son güncellemeler',
        type: 'list',
        addLabel: 'Güncelleme ekle',
        min: 0,
        max: 8,
        itemFields: [
          { name: 'title', label: 'İsim', required: true, maxLength: 48 },
          { name: 'meta', label: 'Zaman', required: true, maxLength: 48 },
          { name: 'initials', label: 'Avatar (baş harf)', required: false, maxLength: 3 },
          { name: 'photo', label: 'Fotoğraf', type: 'avatar', required: false },
        ],
      },
      { name: 'channelTitle', label: 'Kanal başlığı', required: true, maxLength: 48 },
      { name: 'channelDescription', label: 'Kanal açıklaması', required: true, maxLength: 180, multiline: true },
      { name: 'channelDiscoverLabel', label: 'Keşfet CTA', required: true, maxLength: 32 },
      { name: 'channelCreateLabel', label: 'Kanal oluştur CTA', required: true, maxLength: 48 },
    ],
    values: getUpdatesEditorValues,
    save(values) {
      const current = state.get('phoneShellContent.updates') || {};
      const recent = (Array.isArray(values.recent) ? values.recent : []).map((item) => ({
        title: item.title,
        meta: item.meta,
        initials: item.initials,
        photo: item.photo || '',
      }));
      state.set('phoneShellContent.updates', {
        ...current,
        status: {
          ...(current.status || {}),
          title: values.statusTitle,
          meta: values.statusMeta,
          note: values.statusNote,
          photo: values.statusPhoto || '',
        },
        recent,
        channels: {
          ...(current.channels || {}),
          title: values.channelTitle,
          description: values.channelDescription,
          discoverLabel: values.channelDiscoverLabel,
          createLabel: values.channelCreateLabel,
        },
      });
    },
  },
  communitiesIntro: {
    title: 'Topluluk görünümünü düzenle',
    description: 'Boş durum kartını sohbet benzeri bir topluluk tanıtımı olarak günceller.',
    surface: 'communities-chat',
    path: 'phoneShellContent.communities',
    fields: [
      { name: 'title', label: 'Topluluk başlığı', required: true, maxLength: 72 },
      { name: 'description', label: 'Topluluk açıklaması', required: true, maxLength: 180, multiline: true },
      { name: 'linkLabel', label: 'Örnek link metni', required: true, maxLength: 48 },
      { name: 'ctaLabel', label: 'CTA metni', required: true, maxLength: 48 },
    ],
  },
  callsList: {
    title: 'Arama listesini düzenle',
    description: 'Son aramalar satırlarının isim, zaman, yön, tip ve avatar metinlerini günceller.',
    surface: 'calls-list',
    fields: [
      { name: 'call0Name', label: 'Arama 1 isim', required: true, maxLength: 48 },
      { name: 'call0Meta', label: 'Arama 1 tarih/metin', required: true, maxLength: 48 },
      { name: 'call0Direction', label: 'Arama 1 yön', required: true, options: CALL_DIRECTION_OPTIONS },
      { name: 'call0Type', label: 'Arama 1 tipi', required: true, options: CALL_TYPE_OPTIONS },
      { name: 'call0Initials', label: 'Arama 1 avatar (baş harf)', required: true, maxLength: 3 },
      { name: 'call0Avatar', label: 'Arama 1 foto', type: 'avatar', required: false },
      { name: 'call1Name', label: 'Arama 2 isim', required: true, maxLength: 48 },
      { name: 'call1Meta', label: 'Arama 2 tarih/metin', required: true, maxLength: 48 },
      { name: 'call1Direction', label: 'Arama 2 yön', required: true, options: CALL_DIRECTION_OPTIONS },
      { name: 'call1Type', label: 'Arama 2 tipi', required: true, options: CALL_TYPE_OPTIONS },
      { name: 'call1Initials', label: 'Arama 2 avatar (baş harf)', required: true, maxLength: 3 },
      { name: 'call1Avatar', label: 'Arama 2 foto', type: 'avatar', required: false },
      { name: 'call2Name', label: 'Arama 3 isim', required: true, maxLength: 48 },
      { name: 'call2Meta', label: 'Arama 3 tarih/metin', required: true, maxLength: 48 },
      { name: 'call2Direction', label: 'Arama 3 yön', required: true, options: CALL_DIRECTION_OPTIONS },
      { name: 'call2Type', label: 'Arama 3 tipi', required: true, options: CALL_TYPE_OPTIONS },
      { name: 'call2Initials', label: 'Arama 3 avatar (baş harf)', required: true, maxLength: 3 },
      { name: 'call2Avatar', label: 'Arama 3 foto', type: 'avatar', required: false },
      { name: 'call3Name', label: 'Arama 4 isim', required: true, maxLength: 48 },
      { name: 'call3Meta', label: 'Arama 4 tarih/metin', required: true, maxLength: 48 },
      { name: 'call3Direction', label: 'Arama 4 yön', required: true, options: CALL_DIRECTION_OPTIONS },
      { name: 'call3Type', label: 'Arama 4 tipi', required: true, options: CALL_TYPE_OPTIONS },
      { name: 'call3Initials', label: 'Arama 4 avatar (baş harf)', required: true, maxLength: 3 },
      { name: 'call3Avatar', label: 'Arama 4 foto', type: 'avatar', required: false },
    ],
    values: getCallsEditorValues,
    save(values) {
      const current = state.get('phoneShellContent.calls') || {};
      const items = [0, 1, 2, 3].map((index) => {
        const avatar = values[`call${index}Avatar`] || '';
        const isData = /^data:/i.test(avatar);
        return {
          name: values[`call${index}Name`],
          meta: values[`call${index}Meta`],
          direction: values[`call${index}Direction`],
          type: values[`call${index}Type`],
          initials: values[`call${index}Initials`],
          avatarUrl: isData ? '' : avatar,
          avatarDataUrl: isData ? avatar : null,
        };
      });
      state.set('phoneShellContent.calls', { ...current, items });
    },
  },
};

let activeEditorKey = null;
let lastTrigger = null;
let syncIcons = () => {};
let onConversationCreated = () => {};

function getElements() {
  return {
    layer: $('phoneEditorLayer'),
    sheet: document.querySelector('[data-phone-editor-sheet]'),
    form: $('phoneEditorForm'),
    title: $('phoneEditorTitle'),
    description: $('phoneEditorDescription'),
    fields: $('phoneEditorFields'),
    error: $('phoneEditorError'),
    closeButton: $('phoneEditorCloseBtn'),
    cancelButton: $('phoneEditorCancelBtn'),
    backdrop: $('phoneEditorBackdrop'),
  };
}

function setError(message = '') {
  const { error } = getElements();
  if (!error) return;
  error.hidden = !message;
  error.textContent = message;
}

function setSheetOpen(isOpen) {
  const { layer, sheet } = getElements();
  const phone = document.querySelector('.phone');

  document.body.classList.toggle('phone-editor-open', isOpen);
  if (phone) phone.classList.toggle('phone-editor-open', isOpen);
  if (layer) {
    layer.classList.toggle('is-open', isOpen);
    layer.setAttribute('aria-hidden', String(!isOpen));
  }
  if (sheet) {
    sheet.classList.toggle('is-open', isOpen);
  }
}

function createAvatarField(field, value) {
  const wrap = document.createElement('div');
  wrap.className = 'phone-editor-field phone-editor-field-avatar';

  const label = document.createElement('span');
  label.className = 'phone-editor-label';
  label.textContent = field.label;

  const row = document.createElement('div');
  row.className = 'phone-editor-avatar-row';

  const preview = document.createElement('span');
  preview.className = 'phone-editor-avatar-preview';
  preview.setAttribute('aria-hidden', 'true');

  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.name = field.name;
  hidden.value = cleanValue(value);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.hidden = true;

  const controls = document.createElement('div');
  controls.className = 'phone-editor-avatar-controls';

  const fileBtn = document.createElement('button');
  fileBtn.type = 'button';
  fileBtn.className = 'phone-editor-avatar-btn';
  fileBtn.textContent = 'Foto seç';

  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.className = 'phone-editor-avatar-url';
  urlInput.placeholder = 'veya görsel URL';
  urlInput.autocomplete = 'off';
  urlInput.value = /^data:/i.test(hidden.value) ? '' : hidden.value;

  const setPreview = (v) => {
    const safe = sanitizeImageValue(v);
    preview.style.backgroundImage = safe ? `url("${safe}")` : '';
    preview.classList.toggle('has-image', Boolean(safe));
  };
  setPreview(hidden.value);

  fileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const data = await readFileAsDataURL(file);
      hidden.value = data;
      urlInput.value = '';
      setPreview(data);
    } catch {
      /* görsel okunamadı — yoksay */
    }
  });
  urlInput.addEventListener('input', () => {
    hidden.value = urlInput.value.trim();
    setPreview(hidden.value);
  });

  controls.append(fileBtn, urlInput);
  row.append(preview, controls);
  wrap.append(label, row, hidden, fileInput);
  return wrap;
}

function createListField(field, value) {
  const wrap = document.createElement('div');
  wrap.className = 'phone-editor-list';
  wrap.dataset.listName = field.name;

  const head = document.createElement('div');
  head.className = 'phone-editor-list-head';
  const label = document.createElement('span');
  label.className = 'phone-editor-label';
  label.textContent = field.label;
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'phone-editor-list-add';
  addBtn.textContent = field.addLabel || 'Ekle';
  head.append(label, addBtn);

  const rows = document.createElement('div');
  rows.className = 'phone-editor-list-rows';

  const max = field.max || 12;
  const min = field.min || 0;

  const addRow = (itemValue = {}) => {
    if (rows.children.length >= max) return;
    const row = document.createElement('div');
    row.className = 'phone-editor-list-row';
    field.itemFields.forEach((itemField) => {
      row.appendChild(createField(itemField, itemValue[itemField.name]));
    });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'phone-editor-list-remove';
    remove.textContent = 'Satırı sil';
    remove.addEventListener('click', () => {
      if (rows.children.length <= min) return;
      row.remove();
    });
    row.appendChild(remove);
    rows.appendChild(row);
  };

  const initial = Array.isArray(value) ? value : [];
  if (initial.length) initial.forEach((item) => addRow(item));
  else addRow({});

  addBtn.addEventListener('click', () => addRow({}));

  wrap.append(head, rows);
  return wrap;
}

function createField(field, value) {
  if (field.type === 'avatar') return createAvatarField(field, value);
  if (field.type === 'list') return createListField(field, value);

  const wrap = document.createElement('label');
  wrap.className = 'phone-editor-field';
  wrap.setAttribute('for', `phoneEditorField_${field.name}`);

  const label = document.createElement('span');
  label.className = 'phone-editor-label';
  label.textContent = field.label;

  const input = document.createElement(field.options ? 'select' : (field.multiline ? 'textarea' : 'input'));
  input.id = `phoneEditorField_${field.name}`;
  input.name = field.name;
  if (!field.multiline && !field.options) input.type = 'text';
  input.autocomplete = 'off';
  if (field.maxLength) input.maxLength = field.maxLength;
  if (field.required) input.required = true;
  if (field.options) {
    field.options.forEach((option) => {
      const item = document.createElement('option');
      item.value = option.value;
      item.textContent = option.label;
      input.appendChild(item);
    });
  }
  input.value = cleanValue(value);

  wrap.append(label, input);
  return wrap;
}

function renderFields(config) {
  const { fields } = getElements();
  if (!fields) return;
  const values = typeof config.values === 'function'
    ? config.values()
    : (config.path ? (state.get(config.path) || {}) : {});
  fields.dataset.phoneEditorSurface = config.surface || 'default';
  fields.replaceChildren();
  config.fields.forEach((field) => {
    fields.appendChild(createField(field, values[field.name]));
  });
}

function focusFirstField() {
  const { fields } = getElements();
  fields?.querySelector('input, textarea')?.focus();
}

function collectValues(config) {
  const { fields } = getElements();
  const values = {};

  for (const field of config.fields) {
    if (field.type === 'list') {
      const container = fields?.querySelector(`.phone-editor-list[data-list-name="${field.name}"]`);
      const rowEls = container ? [...container.querySelectorAll('.phone-editor-list-row')] : [];
      const items = [];
      for (const rowEl of rowEls) {
        const item = {};
        for (const itemField of field.itemFields) {
          const cell = rowEl.querySelector(`[name="${itemField.name}"]`);
          const cellValue = cleanValue(cell?.value);
          if (itemField.required && !cellValue) {
            cell?.focus();
            return { ok: false, error: `${field.label}: tüm zorunlu alanları doldurun.` };
          }
          item[itemField.name] = cellValue;
        }
        items.push(item);
      }
      values[field.name] = items;
      continue;
    }

    const input = fields?.querySelector(`[name="${field.name}"]`);
    const value = cleanValue(input?.value);
    if (field.required && !value) {
      input?.focus();
      return { ok: false, error: `${field.label} boş bırakılamaz.` };
    }
    values[field.name] = value;
  }

  return { ok: true, values };
}

function saveActiveEditor() {
  const config = EDITOR_CONFIGS[activeEditorKey];
  if (!config) return false;
  const editorKey = activeEditorKey;

  const result = collectValues(config);
  if (!result.ok) {
    setError(result.error);
    return false;
  }

  const output = typeof config.save === 'function'
    ? config.save(result.values)
    : null;
  if (!config.save) {
    const current = state.get(config.path) || {};
    state.set(config.path, { ...current, ...result.values });
  }
  closePhoneEditorSheet({ restoreFocus: true });
  if (editorKey === 'newConversation') {
    onConversationCreated(output);
  }
  return true;
}

export function openPhoneEditorSheet(editorKey, options = {}) {
  const config = EDITOR_CONFIGS[editorKey];
  if (!config) return false;

  const { title, description, form } = getElements();
  activeEditorKey = editorKey;
  lastTrigger = options.trigger || document.activeElement;

  if (title) title.textContent = config.title;
  if (description) description.textContent = config.description;
  if (form) form.dataset.phoneEditorKind = editorKey;
  setError('');
  renderFields(config);
  setSheetOpen(true);
  syncIcons();
  focusFirstField();
  return true;
}

export function closePhoneEditorSheet(options = {}) {
  setError('');
  setSheetOpen(false);
  activeEditorKey = null;
  if (options.restoreFocus && lastTrigger && typeof lastTrigger.focus === 'function') {
    lastTrigger.focus();
  }
  lastTrigger = null;
}

export function isPhoneEditorSheetOpen() {
  return Boolean(getElements().layer?.classList.contains('is-open'));
}

function bindEditorTrigger(id, editorKey) {
  const trigger = $(id);
  if (!trigger || trigger.dataset.phoneEditorBound === 'true') return;
  trigger.dataset.phoneEditorBound = 'true';
  trigger.addEventListener('click', () => openPhoneEditorSheet(editorKey, { trigger }));
}

function bindCallsSearchTrigger() {
  const trigger = $('phoneShellSearchBtn');
  if (!trigger || trigger.dataset.phoneCallsSearchBound === 'true') return;
  trigger.dataset.phoneCallsSearchBound = 'true';
  trigger.addEventListener('click', () => {
    const activeTab = $('phoneHomeShell')?.dataset.activeTab;
    if (activeTab === 'calls') {
      openPhoneEditorSheet('callsList', { trigger });
    }
  });
}

function bindEditorShellEvents() {
  const { form, closeButton, cancelButton, backdrop } = getElements();
  if (!form || form.dataset.phoneEditorFormBound === 'true') return;
  form.dataset.phoneEditorFormBound = 'true';

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveActiveEditor();
  });

  closeButton?.addEventListener('click', () => closePhoneEditorSheet({ restoreFocus: true }));
  cancelButton?.addEventListener('click', () => closePhoneEditorSheet({ restoreFocus: true }));
  backdrop?.addEventListener('click', () => closePhoneEditorSheet({ restoreFocus: true }));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isPhoneEditorSheetOpen()) {
      event.preventDefault();
      closePhoneEditorSheet({ restoreFocus: true });
    }
  });
}

export function initPhoneHomeEditors(options = {}) {
  syncIcons = typeof options.syncIcons === 'function' ? options.syncIcons : syncIcons;
  onConversationCreated = typeof options.onConversationCreated === 'function'
    ? options.onConversationCreated
    : onConversationCreated;
  bindEditorShellEvents();
  bindEditorTrigger('phoneMessageFab', 'newConversation');
  bindEditorTrigger('phoneUpdatesEditFab', 'updatesStatus');
  bindEditorTrigger('phoneCommunitiesCreateBtn', 'communitiesIntro');
  bindEditorTrigger('phoneCallFab', 'callsList');
  bindCallsSearchTrigger();
}
