import { WORKSPACE_SECTIONS, WORKSPACE_ACTIONS, MENU_ICON_SVG } from './menu-model.js';
import { switchTab, onTabChange } from './tabs.js';
import { openWorkspacePanel, returnToPreview } from './mobile.js';

export const isCompactWorkspace = () => window.innerWidth <= 980;

export function navigateWorkspace(key, trigger) {
  const item = [...WORKSPACE_SECTIONS, ...WORKSPACE_ACTIONS].find((entry) => entry.key === key);
  if (!item) return;
  if (key === 'record') {
    document.dispatchEvent(new CustomEvent('workspace:record'));
  } else if (key === 'output') {
    returnToPreview();
    document.getElementById('screenshotBtn')?.click();
  } else if (isCompactWorkspace()) {
    openWorkspacePanel(key, trigger);
  } else {
    switchTab(item.target);
  }
}

function makeButton(item) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.workspaceAction = item.key;
  if (item.key === 'record') {
    button.setAttribute('aria-label', item.label);
    button.title = 'Tam ekran kayıt görünümü. Çıkmak için üstteki saate çift dokunun veya Esc tuşuna basın.';
  }
  if (item.target) button.setAttribute('aria-controls', item.target);
  button.innerHTML = `<span class="workspace-icon" aria-hidden="true">${MENU_ICON_SVG[item.icon] || ''}</span><span>${item.label}</span>`;
  button.addEventListener('click', () => navigateWorkspace(item.key, button));
  return button;
}

/** Mount outside .phone: never part of the exported image. Existing nodes retain their listeners. */
export function initWorkspaceShell() {
  if (document.querySelector('[data-workspace-shell]')) return;
  const app = document.querySelector('.app-container');
  const left = document.querySelector('.panel-left');
  if (!app || !left) return;
  document.body.classList.add('workspace-app');
  ['project', 'help'].forEach((id) => {
    if (document.getElementById(id)) return;
    const panel = document.createElement('section');
    panel.id = id;
    panel.className = 'panel';
    panel.setAttribute('aria-label', id === 'project' ? 'Proje' : 'Yardım');
    left.append(panel);
  });
  const top = document.createElement('header');
  top.className = 'workspace-topbar';
  top.dataset.workspaceShell = '';
  top.dataset.html2canvasIgnore = 'true';
  const actions = document.createElement('nav');
  actions.setAttribute('aria-label', 'Proje ve çıktı');
  actions.append(...WORKSPACE_ACTIONS.map(makeButton));
  top.append(actions);
  const bottom = document.createElement('nav');
  bottom.className = 'workspace-workbar';
  bottom.setAttribute('aria-label', 'Çalışma bölümleri');
  bottom.dataset.html2canvasIgnore = 'true';
  bottom.append(...WORKSPACE_SECTIONS.map(makeButton));
  app.prepend(top);
  app.append(bottom);
  const project = document.getElementById('project');
  const files = document.createElement('div');
  files.className = 'workspace-project-files';
  [['saveAllBtn', 'Proje Dosyasını İndir'], ['loadAllBtn', 'Proje Dosyası Aç']].forEach(([id, label]) => {
    const button = document.getElementById(id);
    if (!button) return;
    button.textContent = label;
    button.title = label;
    button.setAttribute('aria-label', label);
    button.className = 'secondary';
    files.append(button);
  });
  project.append(files);
  const recordingHelp = document.createElement('p');
  recordingHelp.id = 'recordingViewHelp';
  recordingHelp.className = 'hint';
  recordingHelp.textContent = 'Tam ekran, ekran kaydı için yalnız telefonu gösterir. Çıkmak için telefonun üstündeki saate çift dokunun veya Esc tuşuna basın.';
  project.append(recordingHelp);
  top.querySelector('[data-workspace-action="record"]')?.setAttribute('aria-describedby', recordingHelp.id);
  // The phone's own three-dot controls no longer open editing tools.
  document.querySelectorAll('[data-mobile-menu-trigger], #headerMenuBtn').forEach((button) => {
    button.removeAttribute('data-mobile-menu-trigger');
    button.removeAttribute('aria-controls');
    button.removeAttribute('aria-expanded');
    button.setAttribute('aria-label', 'WhatsApp menüsü (önizleme)');
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('tabindex', '-1');
  });
  const sync = (key) => bottom.querySelectorAll('button[data-workspace-action]').forEach((button) => {
    button.setAttribute('aria-current', button.dataset.workspaceAction === key ? 'page' : 'false');
  });
  document.addEventListener('workspace:opened', (event) => sync(event.detail.key));
  document.addEventListener('workspace:closed', () => sync(null));
  onTabChange((id) => sync(WORKSPACE_SECTIONS.find((item) => item.target === id)?.key));
  document.addEventListener('workspace:navigate', (event) => navigateWorkspace(event.detail.key, event.detail.trigger));
  document.getElementById('mobileOverlayBack')?.setAttribute('aria-label', 'Telefon önizlemesine dön');
}
