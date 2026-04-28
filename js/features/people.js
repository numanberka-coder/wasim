/* ========================================
   PEOPLE - People Management
   ======================================== */

import { $, isValidUrl, createElement } from '../utils.js';
import { state } from '../state.js';
import { showError, showSuccess } from '../ui/toast.js';
import { markInvalid, clearInvalid } from '../ui/validation.js';
import { BUILDER_TYPES, BUILDER_FIELDS, buildLineFromValues, addLine } from './script-builder.js';





/** Şu an açık olan inline builder panelinin kişi adı */
let expandedPerson = null;

/** Inline builder'daki aktif mesaj tipi */
let inlineActiveType = 'message';

/**
 * Render people list in panel
 */
function renderPeopleList() {
  const listEl = $('peopleList');
  const jsonEl = $('peopleJson');
  if (!listEl) return;

  const people = state.get('people');
  const active = state.get('active');
  const names = Object.keys(people).sort((a, b) => a.localeCompare(b, 'tr'));

  listEl.replaceChildren();

  for (const name of names) {
    const avatar = (people[name]?.avatar || '').trim();
    const isOnline = active.has(name);
    const isSelf = state.isSelf(name);

    const avatarDiv = createElement('div', { className: `person-avatar${isOnline ? ' online' : ''}` });
    if (avatar) {
      const img = document.createElement('img');
      img.src = avatar;
      img.addEventListener('error', () => img.remove());
      avatarDiv.appendChild(img);
    } else {
      avatarDiv.appendChild(createElement('span', {}, [(name[0] || '?').toUpperCase()]));
    }

    const nameChildren = [name];
    if (isSelf) {
      nameChildren.push(createElement('span', { className: 'person-me-badge' }, ['Sen']));
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'person-card-wrapper';

    const div = createElement('div', { className: 'person-item' + (expandedPerson === name ? ' expanded' : '') }, [
      avatarDiv,
      createElement('div', { className: 'person-info' }, [
        createElement('div', { className: 'person-name' }, nameChildren),
        createElement('div', { className: 'person-url' }, [
          isSelf ? 'Sizin mesajlarınız (sağ taraf)' :
          avatar ? avatar.slice(0, 40) + (avatar.length > 40 ? '...' : '') : 'avatar yok'
        ])
      ]),
      createElement('div', { className: 'person-actions' }, [
        createElement('button', { className: 'secondary btn-sm', type: 'button', dataset: { edit: name } }, ['✏️']),
        createElement('button', { className: 'btn-sm', type: 'button', dataset: { addline: name } }, ['➕ Satır'])
      ]),
      createElement('div', { className: 'person-quick-actions' }, [
        createElement('button', { className: 'btn-sm secondary', type: 'button', dataset: { quickline: 'message', name } }, ['💬 Hızlı Mesaj']),
        createElement('button', { className: 'btn-sm secondary', type: 'button', dataset: { quickline: 'typing', name } }, ['⏳ Yazıyor']),
        createElement('button', { className: 'btn-sm secondary', type: 'button', dataset: { quickline: 'sticker', name } }, ['🏷️ Sticker'])
      ])
    ]);

    wrapper.appendChild(div);

    // Inline expand panel
    if (expandedPerson === name) {
      const panel = createInlineBuilderPanel(name);
      wrapper.appendChild(panel);
    }

    listEl.appendChild(wrapper);
  }

  // Add click handlers
  listEl.querySelectorAll('button[data-edit]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.getAttribute('data-edit');
      startEditPerson(name);
    });
  });

  listEl.querySelectorAll('button[data-addline]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.getAttribute('data-addline');
      toggleInlineBuilder(name);
    });
  });

  listEl.querySelectorAll('button[data-quickline]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const type = btn.getAttribute('data-quickline');
      const name = btn.getAttribute('data-name');
      quickAddLine(name, type);
    });
  });

  // Update JSON textarea
  if (jsonEl) {
    jsonEl.value = JSON.stringify(people, null, 2);
  }

  // Refresh sender options
  refreshManualSenderOptions();
}

/**
 * Add a line directly from person card shortcuts
 */
function quickAddLine(name, type) {
  const values = { who: name };

  if (type === 'message') {
    const text = prompt(`${name} için mesaj metni girin:`);
    if (!text || !text.trim()) return;
    values.text = text.trim();
  }

  const raw = buildLineFromValues(type, values);
  if (!raw) return;
  addLine(raw);
}

/**
 * Toggle inline builder for a person
 */
function toggleInlineBuilder(name) {
  if (expandedPerson === name) {
    expandedPerson = null;
  } else {
    expandedPerson = name;
    inlineActiveType = 'message';
  }
  renderPeopleList();
}

/**
 * Create inline builder panel for a person
 */
function createInlineBuilderPanel(defaultName) {
  const panel = createElement('div', { className: 'inline-builder-panel' });

  // Chip grubu — mesaj tipi seçimi
  const chipsContainer = createElement('div', { className: 'builder-type-chips inline-chips' });
  BUILDER_TYPES.forEach(t => {
    const chip = document.createElement('button');
    chip.className = 'builder-type-chip' + (t.id === inlineActiveType ? ' active' : '');
    chip.textContent = t.label;
    chip.type = 'button';
    chip.addEventListener('click', () => {
      inlineActiveType = t.id;
      renderPeopleList();
    });
    chipsContainer.appendChild(chip);
  });
  panel.appendChild(chipsContainer);

  // Dinamik alanlar
  const fields = BUILDER_FIELDS[inlineActiveType] || [];
  const fieldValues = {};

  // "Kim" alanı
  if (fields.includes('who')) {
    const people = state.get('people') || {};
    const selfName = state.get('selfName');
    const names = Object.keys(people).sort((a, b) => a.localeCompare(b, 'tr'));
    const list = [selfName, ...names.filter(n => n !== selfName)];

    const select = document.createElement('select');
    select.className = 'inline-field';
    list.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = state.isSelf(n) ? `${n} (Sen)` : n;
      if (n === defaultName) opt.selected = true;
      select.appendChild(opt);
    });
    if (!list.includes(defaultName)) select.value = selfName;

    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Kim']),
      select
    ]);
    panel.appendChild(group);
    fieldValues.who = () => select.value;
  }

  // Metin alanı
  if (fields.includes('text')) {
    const textarea = document.createElement('textarea');
    textarea.className = 'inline-field';
    textarea.rows = 2;
    textarea.placeholder = inlineActiveType === 'message' ? 'Mesaj yazın...' : 'Metin girin...';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Metin']),
      textarea
    ]);
    panel.appendChild(group);
    fieldValues.text = () => textarea.value;
  }

  // Yanıtlanan
  if (fields.includes('replyTo')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = 'Kimi yanıtlıyor?';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Yanıtlanan']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.replyTo = () => input.value;
  }

  // URL
  if (fields.includes('url')) {
    const input = document.createElement('input');
    input.type = 'url';
    input.className = 'inline-field';
    input.placeholder = 'https://...';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['URL']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.url = () => input.value;
  }

  // Açıklama / Caption
  if (fields.includes('caption')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = 'Açıklama (opsiyonel)';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Açıklama']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.caption = () => input.value;
  }

  // Süre (voice)
  if (fields.includes('duration')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = '12s / 00:18 / 8000';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Süre']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.duration = () => input.value;
  }

  // Yer adı
  if (fields.includes('placeName')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = 'İstanbul Havalimanı';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Yer Adı']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.placeName = () => input.value;
  }

  // Alt bilgi (location)
  if (fields.includes('placeInfo')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = 'Terminal 1, Arnavutköy';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Alt Bilgi']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.placeInfo = () => input.value;
  }

  // Dosya adı
  if (fields.includes('fileName')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = 'rapor.pdf';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Dosya Adı']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.fileName = () => input.value;
  }

  // Dosya boyutu
  if (fields.includes('fileSize')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = '2.4 MB · PDF';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Boyut / Tip']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.fileSize = () => input.value;
  }

  // Sticker
  if (fields.includes('stickerVal')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = '🙂 veya https://...';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Sticker']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.stickerVal = () => input.value;
  }

  // Link başlığı
  if (fields.includes('linkTitle')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = 'Harika bir makale';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Başlık']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.linkTitle = () => input.value;
  }

  // Link URL
  if (fields.includes('linkUrl')) {
    const input = document.createElement('input');
    input.type = 'url';
    input.className = 'inline-field';
    input.placeholder = 'https://ornek.com';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['URL']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.linkUrl = () => input.value;
  }

  // View once medya tipi
  if (fields.includes('voMediaType')) {
    const select = document.createElement('select');
    select.className = 'inline-field';
    ['photo', 'video'].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v === 'photo' ? 'Fotoğraf' : 'Video';
      select.appendChild(opt);
    });
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Medya Tipi']),
      select
    ]);
    panel.appendChild(group);
    fieldValues.voMediaType = () => select.value;
  }

  // Typing ms
  if (fields.includes('typingMs')) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'inline-field';
    input.min = '200';
    input.max = '5000';
    input.value = '800';
    input.placeholder = '800';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Süre (ms)']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.typingMs = () => input.value;
  }

  // Emoji
  if (fields.includes('emoji')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = '😂 👍 ❤️';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Emoji']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.emoji = () => input.value;
  }

  // React target
  if (fields.includes('reactTarget')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = 'Kimin mesajına?';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Hedef Kişi']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.reactTarget = () => input.value;
  }

  // Sistem mesajı
  if (fields.includes('systemText')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.placeholder = 'Sistem mesajı';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Sistem Mesajı']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.systemText = () => input.value;
  }

  // Kişi adı (add/leave)
  if (fields.includes('personName')) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-field';
    input.value = defaultName;
    input.placeholder = 'Kişi adı';
    const group = createElement('div', { className: 'form-group inline-form-group' }, [
      createElement('label', {}, ['Kişi Adı']),
      input
    ]);
    panel.appendChild(group);
    fieldValues.personName = () => input.value;
  }

  // Satır Ekle butonu
  const addBtn = createElement('button', {
    type: 'button',
    className: 'inline-add-btn'
  }, ['➕ Satır Ekle']);

  addBtn.addEventListener('click', () => {
    const values = {};
    for (const [key, getter] of Object.entries(fieldValues)) {
      values[key] = getter();
    }
    const raw = buildLineFromValues(inlineActiveType, values);
    if (raw) {
      addLine(raw);
      expandedPerson = null;
      renderPeopleList();
    }
  });

  panel.appendChild(addBtn);

  return panel;
}

/**
 * Start editing a person
 */
function startEditPerson(name) {
  const people = state.get('people');

  state.data.editingName = name;
  state.data.pendingPersonAvatarDataUrl = null;

  const nameInput = $('pName');
  const avatarInput = $('pAvatar');
  const fileInput = $('pAvatarFile');
  const selfCheckbox = $('pIsSelf');

  if (nameInput) nameInput.value = name;
  if (avatarInput) avatarInput.value = people[name]?.avatar || '';
  if (fileInput) fileInput.value = '';
  if (selfCheckbox) selfCheckbox.checked = state.isSelf(name);
}

/**
 * Clear person form
 */
function clearPersonForm() {
  state.data.editingName = null;
  state.data.pendingPersonAvatarDataUrl = null;

  const nameInput = $('pName');
  const avatarInput = $('pAvatar');
  const fileInput = $('pAvatarFile');
  const selfCheckbox = $('pIsSelf');

  if (nameInput) nameInput.value = '';
  if (avatarInput) avatarInput.value = '';
  if (fileInput) fileInput.value = '';
  if (selfCheckbox) selfCheckbox.checked = false;
  clearInvalid('pName');
  clearInvalid('pAvatar');
}

/**
 * Save or update person
 */
function savePerson() {
  const nameInput = $('pName');
  const avatarInput = $('pAvatar');

  const name = nameInput?.value?.trim();
  clearInvalid('pName');
  clearInvalid('pAvatar');

  if (!name) {
    markInvalid('pName', 'İsim boş olamaz');
    showError('İsim boş olamaz.');
    return;
  }

  const avatar = state.data.pendingPersonAvatarDataUrl || avatarInput?.value?.trim() || '';
  if (avatar && !avatar.startsWith('data:') && !isValidUrl(avatar)) {
    markInvalid('pAvatar', 'Geçerli bir bağlantı girin veya dosya yükleyin');
    showError('Avatar bağlantısı okunamadı.');
    return;
  }
  const editingName = state.data.editingName;
  const people = state.get('people');
  const active = state.get('active');
  const selfCheckbox = $('pIsSelf');
  const wantsSelf = selfCheckbox?.checked || false;

  // Handle rename
  if (editingName && editingName !== name) {
    delete people[editingName];
    if (active.has(editingName)) {
      active.delete(editingName);
      active.add(name);
      state.recomputeColors();
    }
    // Rename sonrası selfName güncelle
    if (state.isSelf(editingName)) {
      state.data.selfName = name;
    }
  }

  people[name] = { avatar };
  state.set('people', people);

  // "Bu benim" toggle
  if (wantsSelf) {
    state.data.selfName = name;
  } else if (state.isSelf(name)) {
    // Checkbox kaldırıldıysa selfName'i boşalt — ancak biri "self" olmalı
    // Kullanıcı isterse kaldırabilir, başka birini atayabilir
    state.data.selfName = '';
  }
  state.recomputeColors();

  clearPersonForm();
  renderPeopleList();
  showSuccess('Kişi kaydedildi!');
}

/**
 * Delete person
 */
function deletePerson() {
  const nameInput = $('pName');
  const name = state.data.editingName || nameInput?.value?.trim();
  const people = state.get('people');

  if (!name || !people[name]) return;
  if (!confirm(`"${name}" kişisini silmek istediğinizden emin misiniz?`)) return;

  const wasSelf = state.isSelf(name);
  delete people[name];
  state.get('active').delete(name);
  if (wasSelf) state.data.selfName = '';
  state.recomputeColors();
  state.set('people', people);

  clearPersonForm();
  renderPeopleList();
  showSuccess('Kişi silindi!');
}

/**
 * Clear person avatar only
 */
function clearPersonAvatar() {
  const nameInput = $('pName');
  const avatarInput = $('pAvatar');
  const fileInput = $('pAvatarFile');
  
  const name = state.data.editingName || nameInput?.value?.trim();
  const people = state.get('people');

  state.data.pendingPersonAvatarDataUrl = null;
  if (avatarInput) avatarInput.value = '';
  if (fileInput) fileInput.value = '';

  if (name && people[name]) {
    people[name].avatar = '';
    state.set('people', people);
  }

  renderPeopleList();
  showSuccess('Avatar kaldırıldı!');
}

/**
 * Apply people from JSON
 */
function applyPeopleFromJson() {
  const jsonEl = $('peopleJson');
  if (!jsonEl) return;

  try {
    const parsed = JSON.parse(jsonEl.value);
    if (typeof parsed !== 'object' || !parsed) {
      throw new Error('JSON obje olmalı');
    }
    state.set('people', parsed);
    renderPeopleList();
    showSuccess('JSON uygulandı!');
  } catch (err) {
    alert('❌ JSON hatalı: ' + err.message);
  }
}

/**
 * Refresh JSON from current state
 */
function refreshPeopleJson() {
  const jsonEl = $('peopleJson');
  if (jsonEl) {
    jsonEl.value = JSON.stringify(state.get('people'), null, 2);
  }
  showSuccess('JSON yenilendi!');
}

/**
 * Refresh manual sender dropdown options
 */
function refreshManualSenderOptions() {
  const manualEl = $('manualSender');
  const mediaEl = $('mediaSenderSelect');

  if (!manualEl && !mediaEl) return;

  const people = state.get('people');
  const selfName = state.get('selfName');
  const names = Object.keys(people).sort((a, b) => a.localeCompare(b, 'tr'));
  // Self kişiyi en başa koy
  const list = selfName && names.includes(selfName)
    ? [selfName, ...names.filter(n => n !== selfName)]
    : names;

  const fallback = selfName || (names[0] || '');

  const fill = (selectEl, currentValue) => {
    if (!selectEl) return;
    selectEl.replaceChildren();
    for (const n of list) {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = state.isSelf(n) ? `${n} (Sen)` : n;
      selectEl.appendChild(opt);
    }
    selectEl.value = list.includes(currentValue) ? currentValue : fallback;
  };

  if (manualEl) fill(manualEl, manualEl.value || fallback);
  if (mediaEl) fill(mediaEl, mediaEl.value || (manualEl?.value || fallback));
}

/**
 * Get current manual sender
 */
function getCurrentSender() {
  const senderEl = $('manualSender');
  return senderEl?.value || state.get('selfName') || 'Me';
}

export {
  renderPeopleList,
  refreshManualSenderOptions,
  getCurrentSender,
  savePerson,
  deletePerson,
  clearPersonForm,
  clearPersonAvatar,
  applyPeopleFromJson,
  refreshPeopleJson,
};
