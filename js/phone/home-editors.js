/* ========================================
   PHONE HOME EDITORS - Shared bottom sheet infrastructure
   ======================================== */

import { $ } from '../utils.js';
import { state } from '../state.js';

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
    recent0Title: cleanValue(recent[0]?.title),
    recent0Meta: cleanValue(recent[0]?.meta),
    recent0Initials: cleanValue(recent[0]?.initials),
    recent1Title: cleanValue(recent[1]?.title),
    recent1Meta: cleanValue(recent[1]?.meta),
    recent1Initials: cleanValue(recent[1]?.initials),
    channelTitle: cleanValue(updates.channels?.title),
    channelDescription: cleanValue(updates.channels?.description),
    channelDiscoverLabel: cleanValue(updates.channels?.discoverLabel),
    channelCreateLabel: cleanValue(updates.channels?.createLabel),
  };
}

const EDITOR_CONFIGS = {
  newConversation: {
    title: 'Yeni sohbet',
    description: 'Sohbetler listesine kalici yeni bir sohbet ekler.',
    fields: [
      { name: 'title', label: 'Sohbet adi', required: true, maxLength: 64 },
      { name: 'subtitle', label: 'Alt bilgi', required: false, maxLength: 96 },
      { name: 'avatarUrl', label: 'Avatar URL', required: false, maxLength: 240 },
      { name: 'firstMessage', label: 'Ilk mesaj', required: false, maxLength: 280, multiline: true },
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
    title: 'Guncellemeleri duzenle',
    description: 'Durum, son guncellemeler ve kanal metinlerini gunceller.',
    fields: [
      { name: 'statusTitle', label: 'Durum basligi', required: true, maxLength: 48 },
      { name: 'statusMeta', label: 'Durum yardimci metni', required: true, maxLength: 96 },
      { name: 'statusNote', label: 'Durum zamani/metni', required: true, maxLength: 120 },
      { name: 'recent0Title', label: 'Son guncelleme 1 isim', required: true, maxLength: 48 },
      { name: 'recent0Meta', label: 'Son guncelleme 1 zaman', required: true, maxLength: 48 },
      { name: 'recent0Initials', label: 'Son guncelleme 1 avatar', required: true, maxLength: 3 },
      { name: 'recent1Title', label: 'Son guncelleme 2 isim', required: true, maxLength: 48 },
      { name: 'recent1Meta', label: 'Son guncelleme 2 zaman', required: true, maxLength: 48 },
      { name: 'recent1Initials', label: 'Son guncelleme 2 avatar', required: true, maxLength: 3 },
      { name: 'channelTitle', label: 'Kanal basligi', required: true, maxLength: 48 },
      { name: 'channelDescription', label: 'Kanal aciklamasi', required: true, maxLength: 180, multiline: true },
      { name: 'channelDiscoverLabel', label: 'Kesfet CTA', required: true, maxLength: 32 },
      { name: 'channelCreateLabel', label: 'Kanal olustur CTA', required: true, maxLength: 48 },
    ],
    values: getUpdatesEditorValues,
    save(values) {
      const current = state.get('phoneShellContent.updates') || {};
      state.set('phoneShellContent.updates', {
        ...current,
        status: {
          ...(current.status || {}),
          title: values.statusTitle,
          meta: values.statusMeta,
          note: values.statusNote,
        },
        recent: [
          {
            title: values.recent0Title,
            meta: values.recent0Meta,
            initials: values.recent0Initials,
          },
          {
            title: values.recent1Title,
            meta: values.recent1Meta,
            initials: values.recent1Initials,
          },
        ],
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
    title: 'Topluluk gorunumunu duzenle',
    description: 'Topluluklar sekmesindeki bos durum metinlerini gunceller.',
    path: 'phoneShellContent.communities',
    fields: [
      { name: 'title', label: 'Baslik', required: true, maxLength: 72 },
      { name: 'description', label: 'Aciklama', required: true, maxLength: 180 },
      { name: 'ctaLabel', label: 'Buton metni', required: true, maxLength: 48 },
    ],
  },
  callsDraft: {
    title: 'Arama editor altyapisi',
    description: 'Aramalar sekmesi icin ortak sheet davranisini dogrular.',
    path: 'phoneShellContent.calls.editorDraft',
    fields: [
      { name: 'title', label: 'Baslik', required: true, maxLength: 48 },
      { name: 'description', label: 'Aciklama', required: true, maxLength: 120 },
    ],
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

function createField(field, value) {
  const wrap = document.createElement('label');
  wrap.className = 'phone-editor-field';
  wrap.setAttribute('for', `phoneEditorField_${field.name}`);

  const label = document.createElement('span');
  label.className = 'phone-editor-label';
  label.textContent = field.label;

  const input = document.createElement(field.multiline ? 'textarea' : 'input');
  input.id = `phoneEditorField_${field.name}`;
  input.name = field.name;
  if (!field.multiline) input.type = 'text';
  input.value = cleanValue(value);
  input.autocomplete = 'off';
  input.maxLength = field.maxLength || 120;
  if (field.required) input.required = true;

  wrap.append(label, input);
  return wrap;
}

function renderFields(config) {
  const { fields } = getElements();
  if (!fields) return;
  const values = typeof config.values === 'function'
    ? config.values()
    : (config.path ? (state.get(config.path) || {}) : {});
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
    const input = fields?.querySelector(`[name="${field.name}"]`);
    const value = cleanValue(input?.value);
    if (field.required && !value) {
      input?.focus();
      return { ok: false, error: `${field.label} bos birakilamaz.` };
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
  bindEditorTrigger('phoneCallFab', 'callsDraft');
}
