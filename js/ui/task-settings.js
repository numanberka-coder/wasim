import { state } from '../state.js';
import { DEFAULT_STATE, THEME_DEFAULTS, WALLPAPER_PRESETS } from '../config.js';
import { ADVANCED_SECTIONS } from './menu-model.js';
import { resetTypography } from '../phone/typography.js';

export const PLAYBACK_PRESETS = Object.freeze([
  { id: 'slow', label: 'Yavaş', speed: 1500, jitter: 250 },
  { id: 'natural', label: 'Doğal', speed: 900, jitter: 250 },
  { id: 'fast', label: 'Hızlı', speed: 400, jitter: 100 },
]);

export function playbackPresetFor(speed, jitter) {
  return PLAYBACK_PRESETS.find(p => p.speed === Number(speed) && p.jitter === Number(jitter))?.id || 'custom';
}

const byId = id => document.getElementById(id);
const field = id => byId(id)?.closest('.form-group, .range-row, .checkbox-row');

function title(id, label) {
  const element = byId(id)?.querySelector('.accordion-title');
  if (element) element.textContent = label;
}

function label(id, text) {
  const element = document.querySelector(`label[for="${id}"]`);
  if (element) element.textContent = text;
}

function disclosure(parent, key) {
  if (!parent) return null;
  const id = `taskAdvanced-${key}`;
  if (byId(id)) return byId(id);
  const details = document.createElement('details');
  details.id = id;
  details.className = 'task-advanced';
  details.dataset.advancedSection = key;
  const summary = document.createElement('summary');
  summary.textContent = 'Gelişmiş';
  summary.setAttribute('aria-label', `Gelişmiş: ${ADVANCED_SECTIONS[key] || key}`);
  details.append(summary);
  parent.append(details);
  return details;
}

function move(id, target) {
  const node = byId(id);
  if (node && target && !node.contains(target)) target.append(node);
  return node;
}

function moveFields(ids, target) {
  if (target) ids.forEach(id => { const node = field(id); if (node) target.append(node); });
}

function body(id) { return byId(id)?.querySelector('.accordion-body'); }

function summaryValue(id, text) {
  const summary = byId(id)?.querySelector(':scope > summary');
  if (!summary) return;
  let value = summary.querySelector('.task-setting-value');
  if (!value) {
    value = document.createElement('span');
    value.className = 'task-setting-value';
    summary.append(value);
  }
  value.textContent = text;
}

function createPlayback(conversation) {
  const speed = byId('speed');
  const jitter = byId('jitter');
  if (!conversation || !speed || !jitter) return;
  // Advanced duration inputs accept exact milliseconds, including imported custom values.
  speed.step = '1';
  jitter.step = '1';
  const section = document.createElement('details');
  section.id = 'taskPlayback';
  section.className = 'accordion';
  section.innerHTML = '<summary class="accordion-header"><span class="accordion-title">Oynatma</span></summary><div class="accordion-body"><label for="playbackPreset">Konuşma hızı</label><select id="playbackPreset"></select></div>';
  conversation.append(section);
  const select = byId('playbackPreset');
  [...PLAYBACK_PRESETS, { id: 'custom', label: 'Özel' }].forEach(preset => {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.label;
    select.append(option);
  });
  moveFields(['speed', 'jitter'], disclosure(body('taskPlayback'), 'playback'));
  label('speed', 'Mesajlar arası süre (ms)');
  label('jitter', 'Rastgele ek gecikme (ms)');
  select.addEventListener('change', () => {
    const preset = PLAYBACK_PRESETS.find(item => item.id === select.value);
    if (!preset) {
      byId('taskAdvanced-playback').open = true;
      speed.focus();
      return;
    }
    speed.value = preset.speed;
    jitter.value = preset.jitter;
    // One notification exposes a consistent pair to autosave and subscribers.
    state.set('player.speed', preset.speed, true);
    state.set('player.jitter', preset.jitter);
  });
  [speed, jitter].forEach(input => input.addEventListener('input', () => {
    if (input.value !== '' && input.checkValidity()) state.set(`player.${input.id}`, Number(input.value));
  }));
}

function createAppearanceSample(appearance, onPreview) {
  if (!appearance) return;
  const sample = document.createElement('section');
  sample.id = 'taskAppearanceSample';
  sample.className = 'task-appearance-sample';
  sample.setAttribute('aria-label', 'Görünümün canlı örneği');
  sample.innerHTML = '<div class="task-sample-toolbar"><span>Canlı örnek</span><button type="button" class="secondary" id="taskFullPreview">Tam önizleme</button></div><div class="task-sample-phone"><div class="task-sample-header">Örnek konuşma <span class="task-sample-clock"></span></div><div class="task-sample-chat"><p class="task-sample-in">Merhaba! Nasıl görünüyor?</p><p class="task-sample-out">Tam istediğim gibi.</p></div></div>';
  appearance.prepend(sample);
  byId('taskFullPreview').addEventListener('click', () => onPreview?.());
}

function refreshSample() {
  const sample = byId('taskAppearanceSample');
  if (!sample) return;
  const settings = state.get('settings');
  const defaults = THEME_DEFAULTS[settings.theme] || THEME_DEFAULTS.dark;
  const style = sample.style;
  style.setProperty('--sample-text', settings.theme === 'light' ? '#111b21' : '#e9edef');
  style.setProperty('--sample-header', settings.headerColor || defaults.headerColor);
  style.setProperty('--sample-header-text', settings.headerTextColor || defaults.headerTextColor);
  style.setProperty('--sample-in', settings.bubbleInColor || defaults.bubbleInColor);
  style.setProperty('--sample-out', settings.bubbleOutColor || defaults.bubbleOutColor);
  style.setProperty('--sample-font', `${settings.chatFontSize}px`);
  style.setProperty('--sample-line-height', settings.chatLineHeight);
  style.setProperty('--sample-width', `${settings.bubbleSize}%`);
  style.setProperty('--sample-padding', `${Math.max(4, settings.bubblePaddingY - 4)}px`);
  style.setProperty('--sample-padding-bottom', `${Math.max(6, settings.bubblePaddingY - 2)}px`);
  const preset = settings.wallpaperPreset;
  const wallpaper = WALLPAPER_PRESETS[preset] || WALLPAPER_PRESETS.default;
  style.setProperty('--sample-wallpaper', preset === 'custom-color' ? settings.wallpaperColor : wallpaper.background);
  const chat = sample.querySelector('.task-sample-chat');
  chat.style.backgroundSize = wallpaper.size || 'auto';
  chat.style.backgroundBlendMode = wallpaper.blend || 'normal';
  if (preset === 'custom-image' && settings.wallpaperImageDataUrl) {
    chat.style.backgroundImage = `url(${JSON.stringify(settings.wallpaperImageDataUrl)})`;
    chat.style.backgroundSize = 'cover';
  } else chat.style.removeProperty('background-image');
  sample.querySelector('.task-sample-clock').textContent = settings.statusTimeOverride || '12:00';
}

/** Move the existing controls, never clone them: bound handlers and unfinished forms survive. */
export function initTaskSettings({ onPreview, onNavigate } = {}) {
  const appearance = byId('settings');
  if (!appearance || appearance.dataset.taskSettingsReady) return () => {};
  appearance.dataset.taskSettingsReady = 'true';
  const conversation = byId('script');
  const project = byId('project');
  const help = byId('help');

  createPlayback(conversation);
  move('groupInfoAccordion', conversation);
  byId('groupInfoAccordion')?.removeAttribute('data-preparation-step');
  title('groupInfoAccordion', 'Sohbet bilgileri');
  label('groupTitle', 'Sohbet adı');
  label('groupSubtitle', 'Alt bilgi');
  moveFields(['dayLabel'], disclosure(body('groupInfoAccordion'), 'chat'));
  moveFields(['pAvatar'], disclosure(body('personFormAccordion'), 'people'));
  label('pAvatar', 'Fotoğraf bağlantısı');
  label('pAvatarFile', 'Kişi fotoğrafı');

  move('settingsTicksAccordion', conversation);
  move('settingsMessageTimesAccordion', conversation);
  title('settingsTicksAccordion', 'Mesaj seçenekleri');
  title('settingsMessageTimesAccordion', 'Mesaj saatleri');
  move('autoTimeSection', disclosure(body('settingsMessageTimesAccordion'), 'messages'));
  title('settingsTypographyAccordion', 'Yazı ve balonlar');
  label('bubblePaddingYControl', 'Balon iç boşluğu');
  moveFields(['lineHeightControl', 'bubbleSizeControl', 'bubblePaddingYControl'], disclosure(body('settingsTypographyAccordion'), 'typography'));
  const typography = body('settingsTypographyAccordion');
  if (typography) {
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.id = 'taskResetTypography';
    reset.className = 'secondary';
    reset.textContent = 'Yazı ve balon ölçülerini sıfırla';
    typography.append(reset);
    reset.addEventListener('click', () => {
      resetTypography();
      const values = { fontSizeControl: DEFAULT_STATE.chatFontSize, lineHeightControl: DEFAULT_STATE.chatLineHeight, bubbleSizeControl: DEFAULT_STATE.bubbleSize, bubblePaddingYControl: DEFAULT_STATE.bubblePaddingY };
      Object.entries(values).forEach(([id, value]) => {
        const input = byId(id);
        if (input) { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); }
      });
    });
  }
  const appearanceAdvanced = disclosure(appearance, 'appearance');
  move('settingsHeaderAccordion', appearanceAdvanced);
  move('settingsBubblesAccordion', appearanceAdvanced);
  // The status bar remains a first-level task, not buried with custom colours.
  move('settingsStatusBarAccordion', appearance);
  title('settingsStatusBarAccordion', 'Telefon üst çubuğu');
  const statusAdvanced = disclosure(body('settingsStatusBarAccordion'), 'statusbar');
  moveFields(['operatorNameInput', 'batteryHealthInput', 'statusBarHeightControl', 'statusBarFontSizeControl', 'statusBarIconScaleControl', 'statusBarColorInput'], statusAdvanced);
  move('resetStatusBarColorBtn', statusAdvanced);
  label('batteryPercentInput', 'Pil yüzdesi');
  label('batteryHealthInput', 'Pil sağlığı (%)');
  label('statusBarHeightControl', 'Üst çubuk yüksekliği');
  if (byId('resetStatusBarColorBtn')) byId('resetStatusBarColorBtn').textContent = 'Üst çubuk rengini sıfırla';

  move('settingsScenesAccordion', project);
  title('settingsScenesAccordion', 'Kayıtlı Projeler');
  label('sceneNameInput', 'Proje adı');
  label('sceneSearchInput', 'Proje ara');
  if (byId('sceneNameInput')) byId('sceneNameInput').placeholder = 'Proje adı girin…';
  byId('sceneCategoryInput')?.setAttribute('aria-label', 'Proje kategorisi');
  const json = byId('peopleJson')?.closest('details');
  if (json && project) disclosure(project, 'project').append(json);
  move('settingsHelpAccordion', help);
  title('settingsHelpAccordion', 'Kısa görev rehberi');
  const helpAdvanced = disclosure(help, 'help');
  move('commandHelpAccordion', helpAdvanced);
  move('settingsAnalyticsAccordion', helpAdvanced);
  if (help) {
    const guide = document.createElement('ol');
    guide.className = 'task-quick-guide';
    [['group', 'Kişiler: Konuşacak kişileri ekle ve kendini seç.'], ['script', 'Konuşma: Mesajlarını ekle, önizlemeyi oynat.'], ['settings', 'Görünüm: Temayı ve telefon saatini düzenle.']].forEach(([panel, text]) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'secondary'; button.textContent = text;
      button.addEventListener('click', () => onNavigate?.(panel));
      item.append(button); guide.append(item);
    });
    help.prepend(guide);
  }
  createAppearanceSample(appearance, onPreview);
  // Empty grids/dividers left behind by moving controls should not become blank sections.
  document.querySelectorAll('#settings .form-grid, #script .form-grid, #group .form-grid').forEach(grid => {
    if (!grid.querySelector('input, select, textarea, button')) grid.remove();
  });
  byId('settingsStatusBarAccordion')?.querySelectorAll('.divider').forEach(divider => divider.remove());
  document.querySelectorAll('#settings > .panel-group, #group > .panel-group').forEach(section => {
    if (!section.querySelector('details, input, select, textarea, button')) section.remove();
  });

  const refresh = () => {
    const settings = state.get('settings');
    summaryValue('settingsTypographyAccordion', `${settings.chatFontSize} px`);
    summaryValue('settingsThemeAccordion', settings.theme === 'light' ? 'Açık' : 'Koyu');
    summaryValue('settingsTicksAccordion', { sent: 'Gönderildi', delivered: 'İletildi', read: 'Okundu' }[settings.tickStatus] || 'Okundu');
    summaryValue('settingsMessageTimesAccordion', state.get('messageTimes.auto') ? 'Otomatik' : 'Tek tek düzenle');
    summaryValue('settingsStatusBarAccordion', `${settings.statusTimeOverride || 'Gerçek saat'} · ${settings.batteryVisible ? `%${settings.batteryPercent} pil` : 'Pil gizli'}`);
    summaryValue('groupInfoAccordion', state.get('group.title') || 'Sohbet');
    const select = byId('playbackPreset');
    if (select) {
      select.value = playbackPresetFor(state.get('player.speed'), state.get('player.jitter'));
      summaryValue('taskPlayback', select.selectedOptions[0]?.textContent || 'Özel');
      ['speed', 'jitter'].forEach(id => {
        const input = byId(id);
        if (input && document.activeElement !== input) input.value = state.get(`player.${id}`);
      });
    }
    const wallpaper = byId('wallpaperPreset');
    if (wallpaper) {
      wallpaper.value = settings.wallpaperPreset;
      summaryValue('settingsWallpaperAccordion', wallpaper.selectedOptions[0]?.textContent || 'Özel');
    }
    if (field('wallpaperColor')) field('wallpaperColor').hidden = settings.wallpaperPreset !== 'custom-color';
    if (field('wallpaperImageFile')) field('wallpaperImageFile').hidden = settings.wallpaperPreset !== 'custom-image';
    refreshSample();
  };
  document.addEventListener('input', refresh);
  document.addEventListener('change', refresh);
  const unsubscribe = state.subscribe(refresh);
  refresh();
  return () => {
    unsubscribe();
    document.removeEventListener('input', refresh);
    document.removeEventListener('change', refresh);
  };
}
