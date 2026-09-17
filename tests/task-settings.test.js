import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { state } from '../js/state.js';
import { DEFAULT_STATE } from '../js/config.js';
import { initTaskSettings, playbackPresetFor, PLAYBACK_PRESETS } from '../js/ui/task-settings.js';

const el = id => document.getElementById(id);
let cleanup = () => {};
function mount() {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  document.body.innerHTML = new DOMParser().parseFromString(html, 'text/html').body.innerHTML;
  for (const id of ['project', 'help']) {
    if (!el(id)) {
      const panel = document.createElement('div'); panel.id = id; panel.className = 'panel';
      document.querySelector('.panel-left').append(panel);
    }
  }
}
function init(options) { cleanup = initTaskSettings(options); }
const value = id => el(id).querySelector('.task-setting-value').textContent;

describe('Faz 62 task-oriented settings on the actual page DOM', () => {
  beforeEach(() => { state.reset(); mount(); });
  afterEach(() => { cleanup(); cleanup = () => {}; });

  it('moves original bound controls without duplication or losing form drafts', () => {
    const originalIds = [...document.querySelectorAll('[id]')].map(node => node.id);
    const name = el('groupTitle'); name.value = 'Henüz kaydedilmeyen ad';
    const handler = vi.fn(); name.addEventListener('input', handler);
    init();
    expect(el('groupTitle')).toBe(name);
    expect(name.value).toBe('Henüz kaydedilmeyen ad');
    name.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
    for (const id of originalIds) expect(document.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
    const allIds = [...document.querySelectorAll('[id]')].map(node => node.id);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('places settings in their task destinations with local advanced groups', () => {
    init();
    for (const id of ['groupInfoAccordion', 'settingsTicksAccordion', 'settingsMessageTimesAccordion', 'taskPlayback']) {
      expect(el(id).closest('.panel').id).toBe('script');
    }
    expect(el('settingsScenesAccordion').closest('.panel').id).toBe('project');
    expect(el('settingsAnalyticsAccordion').closest('.panel').id).toBe('help');
    expect(el('commandHelpAccordion').closest('.task-advanced').id).toBe('taskAdvanced-help');
    expect(el('settingsStatusBarAccordion').parentElement.id).toBe('settings');
    expect(el('statusTimeInput').closest('.task-advanced')).toBeNull();
    expect(el('batteryPercentInput').closest('.task-advanced')).toBeNull();
    for (const id of ['operatorNameInput', 'batteryHealthInput', 'statusBarHeightControl', 'statusBarFontSizeControl', 'statusBarIconScaleControl', 'statusBarColorInput']) {
      expect(el(id).closest('.task-advanced').id).toBe('taskAdvanced-statusbar');
    }
    expect(el('dayLabel').closest('.task-advanced').id).toBe('taskAdvanced-chat');
    expect(el('pAvatar').closest('.task-advanced').id).toBe('taskAdvanced-people');
    expect(el('pAvatarFile').closest('.task-advanced')).toBeNull();
    expect(el('autoTimeSection').closest('.task-advanced').id).toBe('taskAdvanced-messages');
  });

  it('moves entire slider rows including labels and outputs, leaving font size basic', () => {
    init();
    expect(el('fontSizeControl').closest('.task-advanced')).toBeNull();
    for (const id of ['lineHeightControl', 'bubbleSizeControl', 'bubblePaddingYControl']) {
      const row = el(id).closest('.range-row');
      expect(row.querySelector(`label[for="${id}"]`)).not.toBeNull();
      expect(row.querySelector('output')).not.toBeNull();
      expect(row.closest('.task-advanced').id).toBe('taskAdvanced-typography');
    }
    expect(document.querySelector('label[for="bubblePaddingYControl"]').textContent).toBe('Balon iç boşluğu');
  });

  it.each(PLAYBACK_PRESETS)('applies $label as one consistent speed/jitter pair', preset => {
    init();
    const pairs = [];
    const unsubscribe = state.subscribe(() => pairs.push([state.get('player.speed'), state.get('player.jitter')]));
    el('playbackPreset').value = preset.id;
    el('playbackPreset').dispatchEvent(new Event('change', { bubbles: true }));
    unsubscribe();
    expect(pairs).toEqual([[preset.speed, preset.jitter]]);
    expect(el('speed').value).toBe(String(preset.speed));
    expect(el('jitter').value).toBe(String(preset.jitter));
    expect(value('taskPlayback')).toBe(preset.label);
  });

  it('preserves custom speeds on init, selecting Custom and opening advanced', () => {
    state.set('player.speed', 1234); state.set('player.jitter', 321);
    init();
    expect(el('playbackPreset').value).toBe('custom');
    expect(state.get('player.speed')).toBe(1234);
    expect(state.get('player.jitter')).toBe(321);
    expect(el('speed').value).toBe('1234');
    el('playbackPreset').dispatchEvent(new Event('change'));
    expect(el('taskAdvanced-playback').open).toBe(true);
    expect(document.activeElement).toBe(el('speed'));
    expect(playbackPresetFor('900', '250')).toBe('natural');
  });

  it('updates custom selection for precise edits and preserves temporarily invalid input drafts', () => {
    init();
    el('speed').focus(); el('speed').value = '1111';
    el('speed').dispatchEvent(new Event('input', { bubbles: true }));
    expect(state.get('player.speed')).toBe(1111);
    expect(el('playbackPreset').value).toBe('custom');
    el('speed').value = ''; el('speed').dispatchEvent(new Event('input', { bubbles: true }));
    expect(el('speed').value).toBe('');
    expect(state.get('player.speed')).toBe(1111);
  });

  it('reads closed-row values from canonical paths including messageTimes.auto', () => {
    init();
    state.set('settings.chatFontSize', 16);
    state.set('settings.tickStatus', 'delivered');
    state.set('messageTimes.auto', false);
    state.set('settings.statusTimeOverride', '08:45');
    state.set('settings.batteryVisible', false);
    state.set('group.title', 'İki kişi');
    expect(value('settingsTypographyAccordion')).toBe('16 px');
    expect(value('settingsTicksAccordion')).toBe('İletildi');
    expect(value('settingsMessageTimesAccordion')).toBe('Tek tek düzenle');
    expect(value('settingsStatusBarAccordion')).toContain('08:45 · Pil gizli');
    expect(value('groupInfoAccordion')).toBe('İki kişi');
    state.set('messageTimes.auto', true);
    expect(value('settingsMessageTimesAccordion')).toBe('Otomatik');
  });

  it('conditionally shows only the selected custom wallpaper control without erasing input', () => {
    init();
    const color = el('wallpaperColor').closest('.form-group');
    const file = el('wallpaperImageFile').closest('.form-group');
    expect(color.hidden).toBe(true); expect(file.hidden).toBe(true);
    el('wallpaperColor').value = '#123456';
    state.set('settings.wallpaperPreset', 'custom-color');
    expect(color.hidden).toBe(false); expect(file.hidden).toBe(true);
    state.set('settings.wallpaperPreset', 'custom-image');
    expect(color.hidden).toBe(true); expect(file.hidden).toBe(false);
    expect(el('wallpaperColor').value).toBe('#123456');
  });

  it('resets only typography and propagates existing bound input handlers', () => {
    init();
    state.set('settings.chatFontSize', 18); state.set('settings.bubbleSize', 90);
    state.set('settings.theme', 'light'); state.set('settings.wallpaperColor', '#123456');
    state.set('player.speed', 444);
    const onInput = vi.fn(); el('fontSizeControl').addEventListener('input', onInput);
    el('taskResetTypography').click();
    expect(state.get('settings.chatFontSize')).toBe(DEFAULT_STATE.chatFontSize);
    expect(state.get('settings.bubbleSize')).toBe(DEFAULT_STATE.bubbleSize);
    expect(state.get('settings.theme')).toBe('light');
    expect(state.get('settings.wallpaperColor')).toBe('#123456');
    expect(state.get('player.speed')).toBe(444);
    expect(onInput).toHaveBeenCalledOnce();
  });

  it('updates the live sample for style, custom image and clock without entering capture', () => {
    const onPreview = vi.fn(); init({ onPreview });
    state.set('settings.theme', 'light'); state.set('settings.chatFontSize', 17);
    state.set('settings.statusTimeOverride', '18:32');
    state.set('settings.wallpaperPreset', 'custom-image');
    state.set('settings.wallpaperImageDataUrl', 'data:image/png;base64,AAAA');
    const sample = el('taskAppearanceSample');
    expect(sample.style.getPropertyValue('--sample-font')).toBe('17px');
    expect(sample.style.getPropertyValue('--sample-text')).toBe('#111b21');
    expect(sample.querySelector('.task-sample-clock').textContent).toBe('18:32');
    expect(sample.querySelector('.task-sample-chat').style.backgroundImage).toContain('data:image/png;base64,AAAA');
    expect(sample.closest('.phone')).toBeNull();
    el('taskFullPreview').click(); expect(onPreview).toHaveBeenCalledOnce();
    state.set('settings.wallpaperPreset', 'custom-color');
    state.set('settings.wallpaperColor', '#654321');
    expect(sample.querySelector('.task-sample-chat').style.backgroundImage).toBe('');
    expect(sample.style.getPropertyValue('--sample-wallpaper')).toBe('#654321');
  });

  it('has one quick task guide, retains migrated IDs, and removes empty section headings', () => {
    const onNavigate = vi.fn(); init({ onNavigate }); initTaskSettings();
    expect(document.querySelectorAll('#taskAppearanceSample')).toHaveLength(1);
    expect(document.querySelectorAll('.task-quick-guide')).toHaveLength(1);
    document.querySelector('.task-quick-guide button').click(); expect(onNavigate).toHaveBeenCalledWith('group');
    for (const group of document.querySelectorAll('#settings > .panel-group')) {
      expect(group.querySelector('details, input, select, textarea, button')).not.toBeNull();
    }
    expect(el('settingsStatusBarAccordion').querySelectorAll('.divider')).toHaveLength(0);
  });
});
