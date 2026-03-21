/* ========================================
   PEOPLE - People Management
   ======================================== */

import { $, escapeHtml, isValidUrl } from '../utils.js';
import { state } from '../state.js';
import { showError, showSuccess } from '../ui/toast.js';
import { markInvalid, clearInvalid } from '../ui/validation.js';





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

  listEl.innerHTML = '';

  for (const name of names) {
    const avatar = (people[name]?.avatar || '').trim();
    const isOnline = active.has(name);

    const div = document.createElement('div');
    div.className = 'person-item';
    div.innerHTML = `
      <div class="person-avatar ${isOnline ? 'online' : ''}">
        ${avatar 
          ? `<img src="${escapeHtml(avatar)}" onerror="this.remove()">` 
          : `<span>${escapeHtml((name[0] || '?').toUpperCase())}</span>`
        }
      </div>
      <div class="person-info">
        <div class="person-name">${escapeHtml(name)}</div>
        <div class="person-url">${avatar ? escapeHtml(avatar.slice(0, 40) + (avatar.length > 40 ? '...' : '')) : 'avatar yok'}</div>
      </div>
      <div class="person-actions">
        <button class="secondary btn-sm" data-edit="${escapeHtml(name)}" type="button">✏️ Düzenle</button>
      </div>
    `;

    listEl.appendChild(div);
  }

  // Add click handlers
  listEl.querySelectorAll('button[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-edit');
      startEditPerson(name);
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

  if (nameInput) nameInput.value = name;
  if (avatarInput) avatarInput.value = people[name]?.avatar || '';
  if (fileInput) fileInput.value = '';
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

  if (nameInput) nameInput.value = '';
  if (avatarInput) avatarInput.value = '';
  if (fileInput) fileInput.value = '';
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

  // Handle rename
  if (editingName && editingName !== name) {
    delete people[editingName];
    if (active.has(editingName)) {
      active.delete(editingName);
      active.add(name);
      state.recomputeColors();
    }
  }

  people[name] = { avatar };
  state.set('people', people);

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

  delete people[name];
  state.get('active').delete(name);
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

  // If neither select exists, nothing to do
  if (!manualEl && !mediaEl) return;

  const people = state.get('people');
  const names = Object.keys(people).sort((a, b) => a.localeCompare(b, 'tr'));
  const list = ['Me', ...names.filter(n => n !== 'Me')];

  const fill = (selectEl, currentValue = 'Me') => {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    for (const n of list) {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n;
      selectEl.appendChild(opt);
    }
    selectEl.value = list.includes(currentValue) ? currentValue : 'Me';
  };

  if (manualEl) fill(manualEl, manualEl.value || 'Me');
  if (mediaEl) fill(mediaEl, mediaEl.value || (manualEl?.value || 'Me'));
}

/**
 * Get current manual sender
 */
function getCurrentSender() {
  const senderEl = $('manualSender');
  return senderEl?.value || 'Me';
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
