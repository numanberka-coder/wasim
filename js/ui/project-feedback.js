import { storage } from '../storage.js';
import { state } from '../state.js';
import { navigateWorkspace } from './workspace-shell.js';

const ADVANCED_KEY = 'wa_sim_advanced_sections_v1';

/** One-time migration; legacy preference never hides or disables a feature. */
export function migrateAdvancedPreferences() {
  let preference = null;
  try { preference = JSON.parse(localStorage.getItem(ADVANCED_KEY)); } catch { /* storage may be unavailable */ }
  if (!preference || typeof preference !== 'object' || Array.isArray(preference)) {
    let expanded = false;
    try { expanded = localStorage.getItem('wa_sim_app_mode') === 'pro'; } catch { /* keep useful defaults */ }
    preference = { initialExpanded: expanded, sections: {} };
  }
  const persist = () => { try { localStorage.setItem(ADVANCED_KEY, JSON.stringify(preference)); } catch { /* main save reports persistence failures */ } };
  const sections = preference.sections && typeof preference.sections === 'object' ? preference.sections : {};
  preference.sections = sections;
  document.querySelectorAll('[data-advanced-section], .conversation-advanced').forEach((details) => {
    details.open = Object.hasOwn(sections, details.id) ? Boolean(sections[details.id]) : Boolean(preference.initialExpanded);
    details.addEventListener('toggle', () => { sections[details.id] = details.open; persist(); });
  });
  persist();
  document.body.classList.remove('simple-mode');
  document.querySelectorAll('[data-mode], .pro-only').forEach((node) => {
    node.removeAttribute('data-mode');
    node.classList.remove('pro-only');
  });
  const mode = document.getElementById('appModeToggle');
  (mode?.closest('.form-group') || mode)?.remove();
  document.getElementById('modeBadge')?.remove();
  document.querySelectorAll('.settings-save-note').forEach((node) => node.remove());
  const clear = document.getElementById('clearAllBtn');
  if (clear) {
    clear.textContent = 'Tüm Veriyi Sil';
    document.getElementById('taskAdvanced-project')?.append(clear);
  }
  document.querySelectorAll('#group .panel-group').forEach((group) => {
    if (group.querySelector('#groupFlowAccordion')) group.hidden = true;
  });
  const sceneSave = document.getElementById('saveSceneBtn');
  if (sceneSave) sceneSave.textContent = 'Projeyi Kaydet';
  document.getElementById('settingsScenesAccordion')?.setAttribute('open', '');
}

export function initProjectFeedback() {
  const bar = document.querySelector('.workspace-topbar');
  if (!bar || document.getElementById('projectSaveStatus')) return () => {};
  const status = document.createElement('p');
  status.id = 'projectSaveStatus';
  status.className = 'project-save-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  bar.append(status);
  const details = document.createElement('p');
  details.id = 'projectSaveError';
  details.className = 'project-save-error';
  details.hidden = true;
  details.setAttribute('role', 'alert');
  document.getElementById('project')?.prepend(details);
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Kaydetmeyi tekrar dene';
  retry.className = 'secondary';
  retry.hidden = true;
  retry.addEventListener('click', () => storage.saveNow());
  details.after(retry);
  const unsubscribe = storage.subscribeSaveStatus((result) => {
    const labels = { idle: 'Henüz kaydedilmedi', saving: 'Kaydediliyor…', saved: 'Bu cihazda kaydedildi', error: 'Kaydedilemedi · Proje bölümüne bakın' };
    status.textContent = labels[result.status];
    status.dataset.saveState = result.status;
    details.hidden = retry.hidden = result.status !== 'error';
    details.textContent = result.status === 'error' ? 'Bu cihazda kayıt yapılamadı. Depolama dolu veya kapalı olabilir. Çalışmanızı korumak için Proje Dosyasını İndir seçeneğini kullanın.' : '';
  });
  const hint = document.createElement('button');
  hint.type = 'button'; hint.id = 'workspaceEmptyHint'; hint.className = 'workspace-empty-hint';
  hint.dataset.html2canvasIgnore = 'true';
  document.querySelector('.stage')?.append(hint);
  const refresh = () => {
    const peopleEmpty = Object.keys(state.get('people') || {}).length === 0;
    hint.hidden = !peopleEmpty && Boolean((state.get('player.script') || '').trim());
    hint.textContent = peopleEmpty ? 'İlk kişini ekle' : 'İlk mesajını yaz';
    hint.dataset.destination = peopleEmpty ? 'group' : 'scriptEditor';
  };
  hint.addEventListener('click', () => navigateWorkspace(hint.dataset.destination, hint));
  const stop = state.subscribe(refresh);
  refresh();
  return () => { unsubscribe(); stop(); };
}
