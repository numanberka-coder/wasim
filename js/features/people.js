/* ========================================
   PEOPLE - People Management
   ======================================== */

import { $, isValidUrl, createElement } from '../utils.js';
import { state } from '../state.js';
import { markInvalid, clearInvalid, showHint } from '../ui/validation.js';
import { composeMessageForPerson } from './script-builder.js';
import { confirmModal } from '../ui/modal.js';
import { runUndoable } from './history.js';





const PREPARATION_STEP_IDS = [
  'groupInfoAccordion',
  'personFormAccordion',
  'peopleListAccordion',
  'groupFlowAccordion',
];

function peopleFeedback(id, message) {
  showHint(id, message);
  const node = $(id);
  const hint = (node?.closest('.form-group') || node?.parentElement)?.querySelector('.field-hint');
  hint?.setAttribute('role', 'status');
  hint?.setAttribute('aria-live', 'polite');
}

function openPreparationStep(id, { focus = false } = {}) {
  const target = $(id);
  if (!target) return;
  if (target.closest('#mobileOverlay')) {
    PREPARATION_STEP_IDS.forEach((stepId) => {
      const step = $(stepId);
      if (step) step.open = step === target;
    });
  } else {
    target.open = true;
  }
  if (focus) {
    const summary = target.querySelector('summary');
    summary?.focus({ preventScroll: true });
    target.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  }
}

function syncPersonFormMode() {
  const editingName = state.data.editingName;
  const avatarInput = $('pAvatar');
  const fileInput = $('pAvatarFile');
  const hasAvatar = Boolean(
    state.data.pendingPersonAvatarDataUrl ||
    avatarInput?.value?.trim() ||
    fileInput?.files?.length
  );
  const title = $('personFormTitle');
  const saveLabel = document.querySelector('[data-person-save-label]');
  const newButton = $('newPersonBtn');
  const clearAvatarButton = $('clearAvatarBtn');
  const deleteButton = $('deletePersonBtn');

  if (title) title.textContent = editingName ? 'Kişiyi Düzenle' : 'Kişi Ekle';
  if (saveLabel) saveLabel.textContent = editingName ? 'Değişiklikleri Kaydet' : 'Kişi Ekle';
  if (newButton) newButton.hidden = !editingName;
  if (clearAvatarButton) clearAvatarButton.hidden = !hasAvatar;
  if (deleteButton) deleteButton.hidden = !editingName;
}

function bindPeopleControls() {
  const searchInput = $('peopleSearch');
  if (searchInput && searchInput.dataset.peopleSearchBound !== 'true') {
    searchInput.dataset.peopleSearchBound = 'true';
    searchInput.addEventListener('input', renderPeopleList);
  }
  ['pAvatar', 'pAvatarFile'].forEach((id) => {
    const input = $(id);
    if (input && input.dataset.personModeBound !== 'true') {
      input.dataset.personModeBound = 'true';
      input.addEventListener(id === 'pAvatar' ? 'input' : 'change', syncPersonFormMode);
    }
  });
}

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
  const query = ($('peopleSearch')?.value || '').trim().toLocaleLowerCase('tr-TR');
  const visibleNames = query
    ? names.filter((name) => name.toLocaleLowerCase('tr-TR').includes(query))
    : names;
  const count = $('peopleCount');
  const searchGroup = $('peopleSearchGroup');

  bindPeopleControls();
  syncPersonFormMode();
  if (count) count.textContent = `(${names.length})`;
  if (searchGroup) searchGroup.hidden = names.length < 10;

  listEl.replaceChildren();

  if (names.length === 0) {
    const cta = createElement('button', {
      className: 'empty-state-cta',
      type: 'button',
      onClick: () => {
        openPreparationStep('personFormAccordion');
        const input = $('pName');
        if (input) { input.focus(); input.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      },
    }, ['Kişi ekleyerek başla']);
    listEl.appendChild(
      createElement('div', { className: 'empty-state' }, [
        createElement('div', { className: 'empty-state-title' }, ['Henüz kişi yok']),
        createElement('div', { className: 'empty-state-desc' }, ['Sohbete katılacak kişileri ekleyin.']),
        cta,
      ])
    );
    if (jsonEl) jsonEl.value = JSON.stringify(people, null, 2);
    refreshManualSenderOptions();
    return;
  }

  if (visibleNames.length === 0) {
    listEl.appendChild(createElement('div', { className: 'empty-state' }, [
      createElement('div', { className: 'empty-state-title' }, ['Eşleşen kişi yok']),
      createElement('div', { className: 'empty-state-desc' }, ['Farklı bir isim arayın.']),
    ]));
  }

  for (const name of visibleNames) {
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

    const editTarget = createElement('button', {
      className: 'person-edit-target',
      type: 'button',
      dataset: { edit: name },
      'aria-label': `${name} kişisini düzenle`,
    }, [
      avatarDiv,
      createElement('span', { className: 'person-info' }, [
        createElement('div', { className: 'person-name' }, nameChildren),
      ]),
    ]);

    const div = createElement('div', { className: 'person-item' }, [
      editTarget,
      createElement('div', { className: 'person-actions' }, [
        createElement('button', {
          className: 'btn-sm',
          type: 'button',
          dataset: { addline: name },
          'aria-label': `${name} için mesaj ekle`,
        }, ['Mesaj Ekle'])
      ])
    ]);

    wrapper.appendChild(div);

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
      composeMessageForPerson(name, e.currentTarget);
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
  syncPersonFormMode();
  openPreparationStep('personFormAccordion');
  nameInput?.focus();
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
  syncPersonFormMode();
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
    nameInput?.focus();
    return;
  }

  const avatar = state.data.pendingPersonAvatarDataUrl || avatarInput?.value?.trim() || '';
  if (avatar && !avatar.startsWith('data:') && !isValidUrl(avatar)) {
    markInvalid('pAvatar', 'Geçerli bir bağlantı girin veya dosya yükleyin');
    const advanced = avatarInput?.closest('details');
    if (advanced) advanced.open = true;
    avatarInput?.focus();
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
  openPreparationStep('peopleListAccordion', { focus: true });
  peopleFeedback('peopleList', `${name} kişi listesine kaydedildi.`);
}

/**
 * Delete person
 */
async function deletePerson() {
  const nameInput = $('pName');
  const name = state.data.editingName || nameInput?.value?.trim();
  const people = state.get('people');

  if (!name || !people[name]) return;
  const ok = await confirmModal({
    title: 'Kişiyi sil',
    message: `"${name}" kişisini silmek istediğinizden emin misiniz?`,
    confirmLabel: 'Sil',
    danger: true,
  });
  if (!ok) return;

  runUndoable({
    message: `"${name}" silindi`,
    action: () => {
      const wasSelf = state.isSelf(name);
      delete people[name];
      state.get('active').delete(name);
      if (wasSelf) state.data.selfName = '';
      state.recomputeColors();
      state.set('people', people);

      clearPersonForm();
      renderPeopleList();
    },
  });
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

  const clearAvatar = () => {
    state.data.pendingPersonAvatarDataUrl = null;
    if (avatarInput) avatarInput.value = '';
    if (fileInput) fileInput.value = '';
    if (name && people[name]) {
      people[name].avatar = '';
      state.set('people', people);
    }
    renderPeopleList();
    syncPersonFormMode();
  };

  if (name && people[name]?.avatar) {
    runUndoable({ action: clearAvatar, message: 'Avatar kaldırıldı' });
  } else {
    clearAvatar();
    peopleFeedback('pName', 'Kişi fotoğrafı kaldırıldı.');
  }
}

/**
 * Apply people from JSON
 */
function applyPeopleFromJson() {
  const jsonEl = $('peopleJson');
  if (!jsonEl) return;
  clearInvalid('peopleJson');

  try {
    const parsed = JSON.parse(jsonEl.value);
    if (typeof parsed !== 'object' || !parsed) {
      throw new Error('JSON obje olmalı');
    }
    state.set('people', parsed);
    renderPeopleList();
    peopleFeedback('peopleJson', 'Kişi listesi JSON verisinden güncellendi.');
  } catch (err) {
    markInvalid('peopleJson', 'JSON okunamadı: ' + err.message);
    jsonEl.focus();
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
  clearInvalid('peopleJson');
  peopleFeedback('peopleJson', 'JSON güncel kişi listesini gösteriyor.');
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
