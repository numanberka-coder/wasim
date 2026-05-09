/* ========================================
   PHONE HOME EDITORS - Shared bottom sheet infrastructure
   ======================================== */

import { $ } from '../utils.js';
import { state } from '../state.js';

const EDITOR_CONFIGS = {
  updatesStatus: {
    title: 'Durum bilgisini duzenle',
    description: 'Ana Guncellemeler sekmesindeki durum satirini gunceller.',
    path: 'phoneShellContent.updates.status',
    fields: [
      { name: 'title', label: 'Baslik', required: true, maxLength: 48 },
      { name: 'meta', label: 'Aciklama', required: true, maxLength: 96 },
    ],
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

function getElements() {
  return {
    layer: $('phoneEditorLayer'),
    sheet: $('phoneEditorSheet'),
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

function cleanValue(value) {
  return String(value ?? '').trim();
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

  const input = document.createElement('input');
  input.id = `phoneEditorField_${field.name}`;
  input.name = field.name;
  input.type = 'text';
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
  const values = state.get(config.path) || {};
  fields.replaceChildren();
  config.fields.forEach((field) => {
    fields.appendChild(createField(field, values[field.name]));
  });
}

function focusFirstField() {
  const { fields } = getElements();
  fields?.querySelector('input')?.focus();
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

  const result = collectValues(config);
  if (!result.ok) {
    setError(result.error);
    return false;
  }

  const current = state.get(config.path) || {};
  state.set(config.path, { ...current, ...result.values });
  closePhoneEditorSheet({ restoreFocus: true });
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
  bindEditorShellEvents();
  bindEditorTrigger('phoneUpdatesEditFab', 'updatesStatus');
  bindEditorTrigger('phoneCommunitiesCreateBtn', 'communitiesIntro');
  bindEditorTrigger('phoneCallFab', 'callsDraft');
}
