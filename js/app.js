/* ========================================
   APP - Main Application Entry Point
   ======================================== */

// Utils & Config
import { $, escapeHtml, isValidUrl, nowTime, readFileAsDataURL, clamp, Logger, createElement } from './utils.js';
import { CONFIG, THEME_DEFAULTS, DEFAULT_PEOPLE, DEFAULT_SCRIPT, SCRIPT_TEMPLATES } from './config.js';
import { state } from './state.js';
import { storage, sceneManager, analyticsManager, initAutoSave, SCENE_CATEGORIES } from './storage.js';


// UI Modules
import { showToast, showSuccess, showError } from './ui/toast.js';
import { initTabs } from './ui/tabs.js';
import { initAccordions } from './ui/accordion.js';
import { initForms } from './ui/forms.js';
import { markInvalid, clearInvalid } from './ui/validation.js';
import { initMobile, registerMobileCallback } from './ui/mobile.js';
import { MENU_MODE_EVENT, normalizeMenuMode } from './ui/menu-model.js';
import { initHighlight, SyntaxHighlight } from './ui/highlight.js';

// Phone Modules
import { syncHeader, applyTheme, setTheme, setHeaderColor, setHeaderTextColor, setHeaderIconColor, applyHeaderTextColor, applyHeaderIconColor, applyBubbleColors, setBubbleOutColor, setBubbleInColor, resetBubbleColors, setGroupPhotoData, clearGroupPhoto } from './phone/header.js';
import { initStatusBar, setStatusTime, setOperatorName, setBatteryPercent, setBatteryHealth, setBatteryVisible } from './phone/statusbar.js';
import { applyWallpaper, setWallpaperPreset, setWallpaperColor, setWallpaperImage, clearWallpaper } from './phone/wallpaper.js';
import { applyAllTypography, setFontSize, setLineHeight, setBubbleSize, setBubblePaddingY } from './phone/typography.js';
import { addMessage, clearChat, rebuildChat, updateAllTicks, materializeAllMessages, regenerateMessageTimes, updateMessageTimesInDOM, scrollToBottom } from './phone/messages.js';


// Feature Modules
import { renderPeopleList, refreshManualSenderOptions, savePerson, deletePerson, clearPersonForm, clearPersonAvatar, applyPeopleFromJson, refreshPeopleJson } from './features/people.js';
import { loadScript, play, pause, step, reset, initPlayer } from './features/player.js';
import { initInteractive } from './features/interactive-engine.js';
import { initScriptTools } from './features/script-builder.js';
import { initAutocomplete } from './features/autocomplete.js';

const APP_MODE_KEY = 'wa_sim_app_mode';
const ONBOARDING_KEY = 'wa_sim_onboarding_seen_v1';
const GOAL_KEY = 'wa_sim_onboarding_goals_v1';
const ANALYTICS_SUMMARY_DAYS = 7;
const ONBOARDING_STATUS_TEXT = {
  not_started: 'Başlamadı',
  in_progress: 'Yarım kaldı',
  skipped: 'Geçildi',
  completed: 'Tamamlandı',
};

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

/**
 * Initialize application
 */
function init() {
  Logger.info('🚀 Initializing WhatsApp Simulator...');

  // Load saved state or use defaults
  const hasData = storage.load();
  if (!hasData) {
    state.set('people', { ...DEFAULT_PEOPLE });
    state.set('player.script', DEFAULT_SCRIPT);
    state.set('messageTimes.baseTime', nowTime());
  }

  // Initialize UI modules
  initTabs();
  initAccordions();
  initForms();
  initPlayer();
  initInteractive();

  // Initialize phone modules
  try { initStatusBar(); } catch (e) { Logger.error('initStatusBar hatası:', e); }
  try { applyWallpaper(); } catch (e) { Logger.error('applyWallpaper hatası:', e); }
  try { applyAllTypography(); } catch (e) { Logger.error('applyAllTypography hatası:', e); }

  // Render initial state
  try { renderPeopleList(); } catch (e) { Logger.error('renderPeopleList hatası:', e); }
  try { syncHeader(); } catch (e) { Logger.error('syncHeader hatası:', e); }
  try { rebuildChat(); } catch (e) { Logger.error('rebuildChat hatası:', e); }

  // Populate form fields
  try { populateFormFields(); } catch (e) { Logger.error('populateFormFields hatası:', e); }

  // Init script helpers after forms are ready
  try { initScriptTools(); } catch (e) { Logger.error('initScriptTools hatası:', e); }

  populateSceneCategoryOptions();

  // Apply saved theme
  const savedTheme = state.get('settings.theme') || 'dark';
  try { applyTheme(savedTheme); } catch (e) { Logger.error('applyTheme hatası:', e); }
  updateThemeButtons(savedTheme);

  // Bind event handlers — KRİTİK: bu satıra ulaşılmazsa hiçbir buton çalışmaz
  bindEventHandlers();

  // Render scene list + event delegation
  initSceneListDelegation();
  renderSceneUx();

  // Initialize mobile module (Faz 8)
  initMobile();

  // Start auto-save
  initAutoSave();

  // Syntax Highlight — senaryo editörü renklendirme (Faz 18)
  initHighlight();

  // Autocomplete — senaryo editörü otomatik tamamlama (Faz 17)
  initAutocomplete();

  // Tutorial rehberleri — ilk açılış kontrolü (Faz 16)
  initTutorials();

  // Onboarding + Basit/Pro mod (Faz 29)
  initOnboardingAndMode();

  trackUsage('app_open', {
    hasSavedState: Boolean(hasData),
    mode: safeStorageGet(APP_MODE_KEY) || 'simple',
  });

  Logger.info('✅ WhatsApp Simulator ready!');
}

/**
 * Populate form fields from state
 */
function populateFormFields() {
  try {
    const group = state.get('group') || {};
    const settings = state.get('settings') || {};
    const messageTimes = state.get('messageTimes') || {};
    const player = state.get('player') || {};

    // Group fields
    setInputValue('groupTitle', group.title);
    setInputValue('groupSubtitle', group.subtitle);
    setInputValue('dayLabel', group.dayLabel);
    setInputValue('groupPhotoUrl', group.photoUrl);

    // Status bar
    setInputValue('statusTimeInput', settings.statusTimeOverride || nowTime());

    // Battery
    setChecked('batteryVisible', settings.batteryVisible);
    setInputValue('batteryPercentInput', settings.batteryPercent);
    setInputValue('batteryHealthInput', settings.batteryHealth);

    // Wallpaper
    setInputValue('wallpaperPreset', settings.wallpaperPreset);
    setInputValue('wallpaperColor', settings.wallpaperColor);

    // Theme
    updateThemeButtons(settings.theme || 'dark');

    // Header color
    setInputValue('headerColorInput', settings.headerColor || THEME_DEFAULTS.dark.headerColor);

    // Header text & icon colors
    const currentTheme = settings.theme || 'dark';
    const currentThemeColors = THEME_DEFAULTS[currentTheme] || THEME_DEFAULTS.dark;
    setInputValue('headerTextColorInput', settings.headerTextColor || currentThemeColors.headerTextColor);
    setInputValue('headerIconColorInput', settings.headerIconColor || currentThemeColors.headerIconColor);

    // Bubble colors
    const theme = settings.theme || 'dark';
    const themeColors = THEME_DEFAULTS[theme] || THEME_DEFAULTS.dark;
    const defaultOutColor = themeColors.bubbleOutColor;
    const defaultInColor = themeColors.bubbleInColor;
    setInputValue('bubbleOutColorInput', settings.bubbleOutColor || defaultOutColor);
    setInputValue('bubbleInColorInput', settings.bubbleInColor || defaultInColor);

    // Tick status
    const tickVal = settings.tickStatus || 'read';
    document.querySelectorAll('.tick-btn').forEach(b => b.classList.remove('active'));
    const activeTickBtn = document.querySelector(`.tick-btn[data-tick="${tickVal}"]`);
    if (activeTickBtn) activeTickBtn.classList.add('active');

    // Typography
    setInputValue('fontSizeControl', settings.chatFontSize);
    setTextContent('fontSizeValue', `${settings.chatFontSize}px`);
    setInputValue('lineHeightControl', settings.chatLineHeight);
    const lineHeight = Number(settings.chatLineHeight) || 1.4;
    setTextContent('lineHeightValue', `${lineHeight.toFixed(2).replace(/\.00$/, '')}x`);
    setInputValue('bubbleSizeControl', settings.bubbleSize);
    setTextContent('bubbleSizeValue', `${settings.bubbleSize}%`);
    setInputValue('bubblePaddingYControl', settings.bubblePaddingY);
    setTextContent('bubblePaddingYValue', `${settings.bubblePaddingY}px`);

    // Message times
    setChecked('autoMessageTimesToggle', messageTimes.auto);
    setInputValue('messageBaseTimeInput', messageTimes.baseTime || nowTime());
    setInputValue('messageIncrementInput', messageTimes.increment);
    updateMessageTimeModeUI();

    // Script
    setInputValue('scriptBox', player.script);
    setInputValue('speed', player.speed);
    setInputValue('jitter', player.jitter);

    // Syntax highlight overlay'i güncelle
    SyntaxHighlight.refresh();
  } catch (err) {
    Logger.error('Form alanları doldurulurken hata:', err);
  }
}

/**
 * Bubble color picker varsayılanlarını temaya göre güncelle
 * Özel renk seçilmişse korunur, seçilmemişse tema varsayılanı gösterilir
 */
function updateBubbleColorInputDefaults(theme) {
  const themeColors = THEME_DEFAULTS[theme] || THEME_DEFAULTS.dark;
  const defaultOut = themeColors.bubbleOutColor;
  const defaultIn = themeColors.bubbleInColor;
  const settings = state.get('settings');
  // Özel renk yoksa input'ları güncelle
  if (!settings.bubbleOutColor) {
    setInputValue('bubbleOutColorInput', defaultOut);
  }
  if (!settings.bubbleInColor) {
    setInputValue('bubbleInColorInput', defaultIn);
  }
  // Özel renk varsa tema değişse bile korumaya devam — applyBubbleColors zaten çalışıyor
  applyBubbleColors(settings.bubbleOutColor, settings.bubbleInColor);
}

/**
 * Tema renklerini varsayılana sıfırla (header + bubble)
 */
function resetThemeColors(theme) {
  const themeColors = THEME_DEFAULTS[theme] || THEME_DEFAULTS.dark;
  setHeaderColor(themeColors.headerColor);
  setInputValue('headerColorInput', themeColors.headerColor);
  // Reset header text & icon colors
  setHeaderTextColor(null);
  setHeaderIconColor(null);
  setInputValue('headerTextColorInput', themeColors.headerTextColor);
  setInputValue('headerIconColorInput', themeColors.headerIconColor);
  updateBubbleColorInputDefaults(theme);
}

/**
 * Toggle theme between dark and light
 */
function toggleTheme() {
  const current = state.get('settings.theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  updateThemeButtons(next);
  resetThemeColors(next);
}

/**
 * Update theme toggle button states
 */
function updateThemeButtons(theme) {
  const darkBtn = $('themeDarkBtn');
  const lightBtn = $('themeLightBtn');
  if (!darkBtn || !lightBtn) return;

  if (theme === 'light') {
    darkBtn.classList.add('secondary');
    lightBtn.classList.remove('secondary');
    // Primary style for active button
    lightBtn.style.background = 'var(--wa-green)';
    lightBtn.style.color = THEME_DEFAULTS.activeButtonTextColor;
    lightBtn.style.borderColor = 'transparent';
    darkBtn.style.background = '';
    darkBtn.style.color = '';
    darkBtn.style.borderColor = '';
  } else {
    lightBtn.classList.add('secondary');
    darkBtn.classList.remove('secondary');
    // Primary style for active button
    darkBtn.style.background = 'var(--wa-green)';
    darkBtn.style.color = THEME_DEFAULTS.activeButtonTextColor;
    darkBtn.style.borderColor = 'transparent';
    lightBtn.style.background = '';
    lightBtn.style.color = '';
    lightBtn.style.borderColor = '';
  }
}

/**
 * Basit click → fonksiyon eşleştirmeleri (data-driven event map)
 */
const CLICK_MAP = [
  // People
  ['savePersonBtn',     savePerson],
  ['newPersonBtn',      clearPersonForm],
  ['clearAvatarBtn',    clearPersonAvatar],
  ['deletePersonBtn',   deletePerson],
  ['applyJsonBtn',      applyPeopleFromJson],
  ['refreshJsonBtn',    refreshPeopleJson],
  // Player
  ['loadBtn',           loadScriptWithAnalytics],
  ['stepBtn',           step],
  ['playBtn',           playWithGoal],
  ['pauseBtn',          pause],
  ['resetBtn',          reset],
  // Phone-only mode
  ['phoneOnlyBtn',      togglePhoneOnlyMode],
  ['phoneOnlyExitBtn',  togglePhoneOnlyMode],
  // Theme toggle (quick)
  ['actionThemeToggleBtn', toggleTheme],
  ['potThemeToggleBtn',    toggleTheme],
  // Screenshot
  ['screenshotBtn',     takeScreenshot],
  ['potScreenshotBtn',  takeScreenshot],
];

/**
 * Color picker eşleştirmeleri — input + change aynı handler'ı tetikler
 */
const COLOR_PICKER_MAP = [
  ['wallpaperColor',        setWallpaperColor],
  ['headerColorInput',      setHeaderColor],
  ['headerTextColorInput',  setHeaderTextColor],
  ['headerIconColorInput',  setHeaderIconColor],
  ['bubbleOutColorInput',   setBubbleOutColor],
  ['bubbleInColorInput',    setBubbleInColor],
];

/**
 * Scale butonlarının ortak handler'ı
 */
function handleScaleClick(e) {
  const btn = e.target.closest('[data-scale]');
  if (!btn) return;
  const scale = parseFloat(btn.dataset.scale);
  setPhoneScale(scale);
  syncScaleButtons(scale);
}

/**
 * Bind all event handlers
 */
function bindEventHandlers() {
  // Data-driven click bindings
  CLICK_MAP.forEach(([id, handler]) => bindClick(id, handler));

  // Color picker bindings (input + change → value handler)
  COLOR_PICKER_MAP.forEach(([id, setter]) => {
    const handler = (e) => setter(e.target.value);
    bindInput(id, handler);
    bindChange(id, handler);
  });

  // === GROUP SETTINGS ===
  bindClick('applyGroupBtn', () => {
    const ok = updateGroupFromForm();
    if (!ok) return;
    syncHeader();
    showSuccess('Ayarlar uygulandı!');
  });

  bindClick('clearGroupPhotoBtn', () => {
    clearGroupPhoto();
    setInputValue('groupPhotoUrl', '');
    const fileInput = $('groupPhotoFile');
    if (fileInput) fileInput.value = '';
    showSuccess('Fotoğraf kaldırıldı!');
  });

  bindChange('groupPhotoFile', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      setGroupPhotoData(dataUrl);
      showSuccess('Fotoğraf yüklendi!');
    } catch (err) {
      showError('Fotoğraf yüklenemedi');
    }
  });

  // === STATUS BAR ===
  bindInput('operatorNameInput', (e) => setOperatorName(e.target.value.trim()));
  bindInput('statusTimeInput', (e) => setStatusTime(e.target.value));
  bindChange('batteryVisible', (e) => setBatteryVisible(e.target.checked));

  bindInput('batteryPercentInput', (e) => {
    const value = clampInputValue(e.target, 0, 100, 95, 'Batarya % 0-100 arasında olmalı.');
    setBatteryPercent(value);
  });

  bindInput('batteryHealthInput', (e) => {
    const value = clampInputValue(e.target, 0, 100, 100, 'Sağlık yüzdesi 0-100 arasında olmalı.');
    setBatteryHealth(value);
  });

  // === WALLPAPER ===
  bindChange('wallpaperPreset', (e) => setWallpaperPreset(e.target.value));

  bindChange('wallpaperImageFile', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      setWallpaperImage(dataUrl);
      showSuccess('Duvar kağıdı yüklendi!');
    } catch (err) {
      showError('Görsel yüklenemedi');
    }
  });

  bindClick('clearWallpaperBtn', () => {
    clearWallpaper();
    const theme = state.get('settings.theme') || 'dark';
    const themeColors = THEME_DEFAULTS[theme] || THEME_DEFAULTS.dark;
    setInputValue('wallpaperPreset', themeColors.wallpaperPreset);
    setInputValue('wallpaperColor', themeColors.wallpaperColor);
    const fileInput = $('wallpaperImageFile');
    if (fileInput) fileInput.value = '';
    showSuccess('Duvar kağıdı sıfırlandı!');
  });

  // === THEME TOGGLE ===
  bindClick('themeDarkBtn', () => {
    setTheme('dark');
    updateThemeButtons('dark');
    resetThemeColors('dark');
    showSuccess('Dark mod aktif!');
  });

  bindClick('themeLightBtn', () => {
    setTheme('light');
    updateThemeButtons('light');
    resetThemeColors('light');
    showSuccess('Light mod aktif!');
  });

  // === RESET BUTTONS ===
  bindClick('resetHeaderColorBtn', () => {
    const theme = state.get('settings.theme') || 'dark';
    resetThemeColors(theme);
    showSuccess('Header rengi sıfırlandı!');
  });

  bindClick('resetBubbleColorsBtn', () => {
    resetBubbleColors();
    const theme = state.get('settings.theme') || 'dark';
    const themeColors = THEME_DEFAULTS[theme] || THEME_DEFAULTS.dark;
    setInputValue('bubbleOutColorInput', themeColors.bubbleOutColor);
    setInputValue('bubbleInColorInput', themeColors.bubbleInColor);
    showSuccess('Balon renkleri sıfırlandı!');
  });

  // === TICK STATUS ===
  ['tickSentBtn', 'tickDeliveredBtn', 'tickReadBtn'].forEach(id => {
    bindClick(id, () => {
      const btn = $(id);
      if (!btn) return;
      state.set('settings.tickStatus', btn.dataset.tick);
      document.querySelectorAll('.tick-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateAllTicks();
    });
  });

  // === TYPOGRAPHY ===
  bindInput('fontSizeControl', (e) => {
    const val = Number(e.target.value);
    setFontSize(val);
    setTextContent('fontSizeValue', `${val}px`);
  });

  bindInput('lineHeightControl', (e) => {
    const val = parseFloat(e.target.value);
    setLineHeight(val);
    setTextContent('lineHeightValue', `${val.toFixed(2).replace(/\.00$/, '')}x`);
  });

  bindInput('bubbleSizeControl', (e) => {
    const val = Number(e.target.value);
    setBubbleSize(val);
    setTextContent('bubbleSizeValue', `${val}%`);
  });

  bindInput('bubblePaddingYControl', (e) => {
    const val = Number(e.target.value);
    setBubblePaddingY(val);
    setTextContent('bubblePaddingYValue', `${val}px`);
  });

  // === MESSAGE TIMES ===
  bindChange('autoMessageTimesToggle', (e) => {
    state.set('messageTimes.auto', e.target.checked);
    updateMessageTimeModeUI();
    if (e.target.checked) regenerateMessageTimes();
  });

  bindInput('messageBaseTimeInput', (e) => {
    state.set('messageTimes.baseTime', e.target.value || nowTime());
    if (state.get('messageTimes.auto')) regenerateMessageTimes();
  });

  bindInput('messageIncrementInput', (e) => {
    const val = clampInputValue(e.target, 0, 180, 1, 'Artış dakikası 0-180 arasında olmalı.');
    state.set('messageTimes.increment', val);
    if (state.get('messageTimes.auto')) regenerateMessageTimes();
  });

  // === PEOPLE (file upload) ===
  bindChange('pAvatarFile', async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      state.data.pendingPersonAvatarDataUrl = null;
      return;
    }
    try {
      const dataUrl = await readFileAsDataURL(file);
      state.data.pendingPersonAvatarDataUrl = dataUrl;
      showSuccess('Avatar yüklendi!');
    } catch (err) {
      showError('Avatar yüklenemedi');
    }
  });

  // === SCALE CONTROLS (event delegation) ===
  document.querySelectorAll('.scale-btn, .pot-scale').forEach(btn => {
    btn.addEventListener('click', handleScaleClick);
  });

  // === EXPORT/IMPORT ===
  bindClick('saveAllBtn', () => {
    storage.exportToFile();
    showSuccess('Dosya indirildi!');
  });

  bindClick('loadAllBtn', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await storage.importFromFile(file);
        applyFullState();
        showSuccess('Dosya yüklendi!');
      } catch (err) {
        showError(err.message);
      }
    };
    input.click();
  });

  // === SCENE MANAGEMENT ===
  bindClick('saveSceneBtn', () => {
    const input = $('sceneNameInput');
    const name = input?.value?.trim();
    if (!name) {
      showError('Sahne adı boş bırakılamaz.');
      return;
    }
    const scene = sceneManager.save(name, { category: $('sceneCategoryInput')?.value });
    trackUsage('scene_save', { category: scene.category });
    input.value = '';
    renderSceneUx();
    showSuccess('Sahne kaydedildi!');
  });

  bindInput('sceneSearchInput', renderSceneList);

  bindClick('loadInteractiveDemoBtn', () => {
    trackUsage('template_load', { source: 'interactive_demo', templateId: 'interactive-demo' });
  });

  bindClick('groupBuilderPlayBtn', () => {
    trackUsage('group_builder_play', { source: 'group_builder' });
  });

  bindClick('refreshAnalyticsBtn', renderAnalyticsPanel);

  bindClick('clearAnalyticsBtn', () => {
    if (!confirm('Yerel kullanım özetini temizlemek istediğinizden emin misiniz?')) return;
    analyticsManager.clear();
    renderAnalyticsPanel();
    showSuccess('Kullanım özeti temizlendi!');
  });

  bindEvent('sceneNameInput', 'keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('saveSceneBtn')?.click();
    }
  });

  bindClick('clearAllBtn', () => {
    if (!confirm('Tüm veriyi silmek istediğinizden emin misiniz? Bu işlem senaryo, kişiler ve ayarları temizler.')) return;
    storage.clear();
    state.reset();
    state.set('player.script', DEFAULT_SCRIPT);
    applyFullState();
    showSuccess('Tüm veri silindi!');
  });
}

/**
 * Update group settings from form
 */
function updateGroupFromForm() {
  const titleInput = $('groupTitle');
  const subtitleInput = $('groupSubtitle');
  const dayLabelInput = $('dayLabel');
  const photoInput = $('groupPhotoUrl');

  const title = titleInput?.value?.trim() || '';
  const subtitle = subtitleInput?.value?.trim() || '';
  const dayLabel = dayLabelInput?.value?.trim() || 'Bugün';
  const photoUrl = photoInput?.value?.trim() || '';

  clearInvalid('groupTitle');
  clearInvalid('groupPhotoUrl');

  if (!title) {
    markInvalid('groupTitle', 'Grup adı boş bırakılamaz');
    showError('Grup adı gerekli.');
    return false;
  }

  if (photoUrl && !isValidUrl(photoUrl)) {
    markInvalid('groupPhotoUrl', 'Geçerli bir bağlantı girin');
    showError('Fotoğraf bağlantısı okunamadı.');
    return false;
  }

  state.set('group.title', title);
  state.set('group.subtitle', subtitle);
  state.set('group.dayLabel', dayLabel);
  state.set('group.photoUrl', photoUrl);
  return true;
}

/**
 * Update message time mode UI visibility
 */
function updateMessageTimeModeUI() {
  const auto = state.get('messageTimes.auto');
  const autoSection = $('autoTimeSection');
  const manualSection = $('manualTimeSection');

  if (autoSection) autoSection.style.display = auto ? 'block' : 'none';
  if (manualSection) manualSection.style.display = auto ? 'none' : 'block';
}

// === HELPER FUNCTIONS ===

function setInputValue(id, value) {
  const el = $(id);
  if (el) el.value = value ?? '';
}

function populateSceneCategoryOptions() {
  const select = $('sceneCategoryInput');
  if (!select || select.options.length > 0) return;
  select.replaceChildren(...SCENE_CATEGORIES.map(category => (
    createElement('option', { value: category }, [category])
  )));
}

function setTextContent(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function setChecked(id, checked) {
  const el = $(id);
  if (el) el.checked = Boolean(checked);
}

function bindEvent(id, event, handler) {
  const el = $(id);
  if (el) el.addEventListener(event, handler);
}

function bindClick(id, handler) { bindEvent(id, 'click', handler); }
function bindChange(id, handler) { bindEvent(id, 'change', handler); }
function bindInput(id, handler) { bindEvent(id, 'input', handler); }

function clampInputValue(input, min, max, fallback, message = '') {
  if (!input) return fallback;
  const raw = Number(input.value);
  const safe = Number.isFinite(raw) ? raw : fallback;
  const clamped = Math.min(Math.max(safe, min), max);
  if (clamped !== raw && message) {
    showError(message);
  }
  input.value = clamped;
  return clamped;
}

// === LOCAL ANALYTICS ===

function trackUsage(name, metadata = {}) {
  try {
    analyticsManager.track(name, metadata);
    renderAnalyticsPanel();
  } catch (e) {
    Logger.warn('Analytics track error:', e);
  }
}

function trackOnboardingStep(step, action) {
  try {
    analyticsManager.recordOnboardingStep(step, action);
    renderAnalyticsPanel();
  } catch (e) {
    Logger.warn('Onboarding analytics error:', e);
  }
}

function loadScriptWithAnalytics(source = 'button') {
  const result = loadScript();
  trackUsage('script_load', {
    source,
    eventCount: result?.summary?.eventCount || 0,
    errors: result?.summary?.errors || 0,
    warnings: result?.summary?.warnings || 0,
  });
  return result;
}

function createAnalyticsMetric(label, value, detail = '') {
  return createElement('div', { className: 'analytics-metric' }, [
    createElement('span', { className: 'analytics-metric-label' }, [label]),
    createElement('strong', { className: 'analytics-metric-value' }, [String(value)]),
    ...(detail ? [createElement('span', { className: 'analytics-metric-detail' }, [detail])] : []),
  ]);
}

function formatOnboardingDrop(funnel) {
  if (funnel.status === 'completed') return 'Rehber tamamlandı';
  if (funnel.status === 'not_started') return 'Henüz rehber sinyali yok';
  const step = funnel.dropOffStep ? `Adım ${funnel.dropOffStep}` : 'İlk adım';
  return funnel.status === 'skipped' ? `${step} sonrası geçildi` : `${step} civarında kaldı`;
}

function renderAnalyticsPanel() {
  const container = $('analyticsSummary');
  if (!container) return;

  const summary = analyticsManager.getSummary(ANALYTICS_SUMMARY_DAYS);
  const sceneActions = summary.actions.sceneSave + summary.actions.sceneLoad + summary.actions.sceneDelete;
  const dailyTotal = Object.values(summary.dailyCounts).reduce((sum, count) => sum + count, 0);
  const statusText = ONBOARDING_STATUS_TEXT[summary.onboarding.status] || summary.onboarding.status;

  container.replaceChildren();

  if (summary.totalEvents === 0) {
    container.appendChild(createElement('div', { className: 'analytics-empty' }, [
      'Henüz yerel kullanım verisi yok.'
    ]));
    return;
  }

  container.appendChild(createElement('div', { className: 'analytics-metric-grid' }, [
    createAnalyticsMetric('Toplam', summary.totalEvents, `Son ${summary.days} gün`),
    createAnalyticsMetric('Oynat', summary.actions.play),
    createAnalyticsMetric('Ekran', summary.actions.screenshot),
    createAnalyticsMetric('Sahne', sceneActions),
    createAnalyticsMetric('Şablon', summary.actions.templateLoad + summary.actions.groupBuilderPlay),
    createAnalyticsMetric('Rehber', statusText),
  ]));

  container.appendChild(createElement('div', { className: 'analytics-funnel' }, [
    createElement('span', { className: 'analytics-funnel-label' }, ['Onboarding']),
    createElement('strong', {}, [formatOnboardingDrop(summary.onboarding)]),
    createElement('span', { className: 'analytics-metric-detail' }, [`${dailyTotal} olay / ${summary.days} gün`]),
  ]));

  container.appendChild(createElement('div', { className: 'analytics-recommendation' }, [
    createElement('span', { className: 'analytics-funnel-label' }, ['Karar desteği']),
    createElement('strong', {}, [summary.recommendation]),
  ]));
}

// === PHONE-ONLY MODE ===

let phoneOnlyActive = false;

function togglePhoneOnlyMode() {
  const container = document.querySelector('.app-container');
  const scaleControls = $('scaleControls');
  if (!container) return;

  phoneOnlyActive = !phoneOnlyActive;
  container.classList.toggle('phone-only-mode', phoneOnlyActive);

  // Action bar'daki ölçek kontrollerini göster/gizle
  if (scaleControls) {
    scaleControls.style.display = phoneOnlyActive ? 'inline-flex' : 'none';
  }

  // Phone-only moddan çıkınca ölçeği sıfırla
  if (!phoneOnlyActive) {
    setPhoneScale(1);
    syncScaleButtons(1);
  }
}

/** Tüm scale butonlarını (action bar + toolbar) senkronize et */
function syncScaleButtons(scale) {
  document.querySelectorAll('.scale-btn, .pot-scale').forEach(b => {
    b.classList.toggle('active', parseFloat(b.dataset.scale) === scale);
  });
}

// === SCREENSHOT ===

async function takeScreenshot() {
  const phone = document.querySelector('.phone');
  if (!phone) return;

  try {
    showSuccess('Ekran görüntüsü hazırlanıyor...');

    // Virtualize edilmiş mesajları materialize et
    materializeAllMessages();

    const html2canvas = window.html2canvas;

    // Geçici olarak ölçeği sıfırla — export temiz olsun
    const currentScale = phone.style.transform;
    phone.style.transform = 'none';

    const canvas = await html2canvas(phone, {
      backgroundColor: null,
      scale: 2, // Retina kalite
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    // Ölçeği geri koy
    phone.style.transform = currentScale;

    // PNG olarak indir
    const link = document.createElement('a');
    link.download = `whatsapp_screenshot_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    markOnboardingGoal('firstScreenshot');
    trackUsage('screenshot', { source: phoneOnlyActive ? 'phone_only' : 'action_bar' });
    showSuccess('Ekran görüntüsü indirildi!');
  } catch (err) {
    console.error('Screenshot error:', err);
    showError('Ekran görüntüsü alınamadı: ' + err.message);
  }
}

// === SCENE MANAGEMENT ===

/** Sahne yüklendikten sonra tüm UI'ı senkronize et */
function applyFullState() {
  const importedTheme = state.get('settings.theme') || 'dark';
  applyTheme(importedTheme);
  populateFormFields();
  renderPeopleList();
  syncHeader();
  rebuildChat();
  applyWallpaper();
  applyAllTypography();
}

function renderSceneUx() {
  renderLastScenePrompt();
  renderRecentScenes();
  renderSceneList();
}

function getSceneSearchQuery() {
  return ($('sceneSearchInput')?.value || '').trim().toLocaleLowerCase('tr-TR');
}

function sceneMatchesQuery(scene, query) {
  if (!query) return true;
  const haystack = `${scene.name || ''} ${scene.category || ''}`.toLocaleLowerCase('tr-TR');
  return haystack.includes(query);
}

function formatSceneTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} ${timeStr}`;
}

function createSceneBadge(scene) {
  return createElement('span', { className: 'scene-category' }, [scene.category || 'Genel']);
}

function loadSceneById(id, source = 'list') {
  if (!Number.isFinite(id)) return;
  if (!confirm('Bu sahneyi yüklemek istediğinizden emin misiniz? Mevcut değişiklikler kaybolacak.')) return;
  const ok = sceneManager.load(id);
  if (ok) {
    applyFullState();
    renderSceneUx();
    trackUsage('scene_load', { source });
    showSuccess('Sahne yüklendi!');
  }
}

function createQuickSceneButton(scene) {
  return createElement('button', {
    type: 'button',
    className: 'scene-quick-btn',
    title: `${scene.name} yükle`,
    onClick: () => loadSceneById(Number(scene.id), 'recent'),
  }, [
    createElement('span', { className: 'scene-quick-name' }, [scene.name]),
    createElement('span', { className: 'scene-quick-meta' }, [scene.category || 'Genel'])
  ]);
}

function renderRecentScenes() {
  const container = $('recentScenes');
  if (!container) return;

  const recent = sceneManager.getRecent(5);
  if (recent.length === 0) {
    container.hidden = true;
    container.replaceChildren();
    return;
  }

  container.hidden = false;
  container.replaceChildren(
    createElement('div', { className: 'scene-section-label' }, ['Son 5 sahne']),
    createElement('div', { className: 'scene-quick-items' }, recent.map(createQuickSceneButton))
  );
}

function renderLastScenePrompt() {
  const container = $('lastScenePrompt');
  if (!container) return;

  const scene = sceneManager.getLastLoaded();
  if (!scene) {
    container.hidden = true;
    container.replaceChildren();
    return;
  }

  container.hidden = false;
  container.replaceChildren(
    createElement('div', { className: 'scene-last-info' }, [
      createElement('span', { className: 'scene-last-label' }, ['Son yüklenen sahne']),
      createElement('strong', {}, [scene.name]),
      createElement('span', { className: 'scene-last-date' }, [formatSceneTimestamp(scene.lastAccessedAt)])
    ]),
    createElement('button', {
      type: 'button',
      className: 'btn-sm scene-last-load',
      onClick: () => loadSceneById(Number(scene.id), 'last_prompt'),
    }, ['Geri Yükle'])
  );
}

function renderSceneList() {
  const container = $('sceneList');
  if (!container) return;

  const scenes = sceneManager.getAll();
  const query = getSceneSearchQuery();
  const filteredScenes = scenes.filter(scene => sceneMatchesQuery(scene, query));

  if (scenes.length === 0) {
    container.replaceChildren(createElement('p', { className: 'hint' }, ['Henüz kaydedilmiş sahne yok.']));
    return;
  }

  if (filteredScenes.length === 0) {
    container.replaceChildren(createElement('p', { className: 'hint' }, ['Aramayla eşleşen sahne yok.']));
    return;
  }

  container.replaceChildren();
  for (const scene of filteredScenes) {
    const date = new Date(scene.timestamp);
    const dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    container.appendChild(createElement('div', { className: 'scene-item', dataset: { sceneId: scene.id } }, [
      createElement('div', { className: 'scene-info' }, [
        createElement('span', { className: 'scene-name' }, [scene.name]),
        createSceneBadge(scene),
        createElement('span', { className: 'scene-date' }, [`${dateStr} ${timeStr}`])
      ]),
      createElement('div', { className: 'scene-actions' }, [
        createElement('button', { type: 'button', className: 'btn-sm scene-load-btn', dataset: { sceneId: scene.id } }, ['Yükle']),
        createElement('button', { type: 'button', className: 'btn-sm danger scene-delete-btn', dataset: { sceneId: scene.id } }, ['Sil'])
      ])
    ]));
  }
}

/** Scene list event delegation — tek listener, her render'da yeniden eklenmez */
function initSceneListDelegation() {
  const container = $('sceneList');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const loadBtn = e.target.closest('.scene-load-btn');
    if (loadBtn) {
      const id = Number(loadBtn.dataset.sceneId);
      if (!confirm('Bu sahneyi yüklemek istediğinizden emin misiniz? Mevcut değişiklikler kaybolacak.')) return;
      const ok = sceneManager.load(id);
      if (ok) {
        applyFullState();
        renderSceneUx();
        trackUsage('scene_load', { source: 'list' });
        showSuccess('Sahne yüklendi!');
      }
      return;
    }

    const deleteBtn = e.target.closest('.scene-delete-btn');
    if (deleteBtn) {
      const id = Number(deleteBtn.dataset.sceneId);
      if (!confirm('Bu sahneyi silmek istediğinizden emin misiniz?')) return;
      sceneManager.delete(id);
      trackUsage('scene_delete', { source: 'list' });
      renderSceneUx();
      showSuccess('Sahne silindi!');
    }
  });
}

// escapeHtml is imported from utils.js

// === PHONE SCALE ===

function setPhoneScale(scale) {
  const phone = document.querySelector('.phone');
  if (!phone) return;

  if (scale === 1) {
    phone.style.transform = '';
  } else {
    phone.style.transform = `scale(${scale})`;
    phone.style.transformOrigin = 'center center';
  }
}

/**
 * Tutorial rehberleri — ilk açılış kontrolü (Faz 16)
 */
function initTutorials() {
  const TUTORIAL_KEY = 'wa_sim_tutorials_seen';
  const seen = safeStorageGet(TUTORIAL_KEY);
  const tutorials = document.querySelectorAll('.tutorial-guide');

  if (!seen) {
    // İlk ziyaret — rehberleri açık göster
    tutorials.forEach(t => t.setAttribute('open', ''));
    safeStorageSet(TUTORIAL_KEY, '1');
  }
}

function playWithGoal() {
  if (play()) {
    markOnboardingGoal('firstPlay');
    const player = state.get('player') || {};
    trackUsage('play', { source: 'main_controls', eventCount: player.queue?.length || 0 });
  }
}

function initOnboardingAndMode() {
  const savedMode = safeStorageGet(APP_MODE_KEY) || 'simple';
  applyAppMode(savedMode);

  bindChange('appModeToggle', (e) => applyAppMode(e.target.value, true));
  bindClick('reopenOnboardingBtn', () => openOnboarding(true));

  refreshGoalUI();

  const hasSeenOnboarding = safeStorageGet(ONBOARDING_KEY) === '1';
  if (!hasSeenOnboarding) {
    // İlk yüklemede web önizleme ekranını tamamen kapatmamak için otomatik açma yerine
    // ayarlardan tekrar açılabilen rehbere yönlendiriyoruz.
    showToast('📖 Başlangıç rehberi hazır: Ayarlar > Başlangıç Rehberi & Mod', 3200);
  }
}

function applyAppMode(mode, shouldTrack = false) {
  const safeMode = normalizeMenuMode(mode);
  safeStorageSet(APP_MODE_KEY, safeMode);
  document.body.classList.toggle('simple-mode', safeMode === 'simple');
  setInputValue('appModeToggle', safeMode);
  if (shouldTrack) {
    trackUsage('mode_change', { mode: safeMode });
  }
  setTextContent('modeBadge', safeMode === 'simple' ? '✨ Basit Mod' : '🛠️ Pro Mod');

  const activeTab = document.querySelector('.tab.active');
  if (safeMode === 'simple' && activeTab?.dataset.tab === 'script') {
    document.querySelector('.tab[data-tab="group"]')?.click();
  }

  window.dispatchEvent(new CustomEvent(MENU_MODE_EVENT, { detail: { mode: safeMode } }));
}

function getOnboardingGoals() {
  try {
    const parsed = JSON.parse(safeStorageGet(GOAL_KEY) || '{}');
    return {
      firstPlay: Boolean(parsed.firstPlay),
      firstScreenshot: Boolean(parsed.firstScreenshot),
    };
  } catch {
    return { firstPlay: false, firstScreenshot: false };
  }
}

function markOnboardingGoal(goal) {
  const goals = getOnboardingGoals();
  if (!Object.prototype.hasOwnProperty.call(goals, goal)) return;
  goals[goal] = true;
  safeStorageSet(GOAL_KEY, JSON.stringify(goals));
  trackUsage('onboarding_goal', { goal });
  refreshGoalUI();
}

function refreshGoalUI() {
  const goals = getOnboardingGoals();
  const goalMap = [
    ['goalPlayItem', goals.firstPlay],
    ['goalPlayChip', goals.firstPlay],
    ['goalShotItem', goals.firstScreenshot],
    ['goalShotChip', goals.firstScreenshot],
  ];
  goalMap.forEach(([id, done]) => {
    const el = $(id);
    if (el) el.classList.toggle('done', done);
  });
}

function openOnboarding(force = false) {
  const overlay = $('onboardingOverlay');
  const titleEl = $('onboardingTitle');
  const descEl = $('onboardingDesc');
  const stepEl = $('onboardingStepNo');
  const nextBtn = $('onboardingNextBtn');
  const skipBtn = $('onboardingSkipBtn');
  if (!overlay || !titleEl || !descEl || !stepEl || !nextBtn || !skipBtn) return;

  const steps = [
    {
      title: 'Hoş geldin 👋',
      description: 'Kısa rehber ile ilk 5 dakikada senaryonu çalıştırıp ekran görüntüsü alabilirsin.',
      nextLabel: 'İleri'
    },
    {
      title: '1) Kişi ekle → Satır ekle',
      description: 'Grup sekmesinde kişi kaydet, ardından Satır Sırası bölümünden satır ekleyip "Senaryoya Aktar" ile gönder.',
      nextLabel: 'Devam'
    },
    {
      title: '2) Yükle → Oynat → Ekran Al',
      description: 'Senaryo sekmesinde önce "Yükle", sonra "Oynat". Hazır olunca üst bardan "Ekran Al" ile çıktını indir.',
      nextLabel: 'Başla'
    }
  ];

  let currentStep = 0;
  const renderStep = () => {
    const step = steps[currentStep];
    titleEl.textContent = step.title;
    descEl.textContent = step.description;
    stepEl.textContent = String(currentStep + 1);
    nextBtn.textContent = step.nextLabel;
    refreshGoalUI();
    trackOnboardingStep(currentStep + 1, 'viewed');
  };

  const close = (action = 'completed') => {
    trackOnboardingStep(currentStep + 1, action);
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    safeStorageSet(ONBOARDING_KEY, '1');
    nextBtn.onclick = null;
    skipBtn.onclick = null;
  };

  nextBtn.onclick = () => {
    if (currentStep >= steps.length - 1) {
      close('completed');
      return;
    }
    trackOnboardingStep(currentStep + 1, 'advanced');
    currentStep += 1;
    renderStep();
  };
  skipBtn.onclick = () => close('skipped');

  if (force) safeStorageRemove(ONBOARDING_KEY);
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  trackOnboardingStep(1, 'opened');
  renderStep();
}

// Register mobile callbacks for app-level functions
registerMobileCallback('populateFormFields', populateFormFields);
registerMobileCallback('takeScreenshot', takeScreenshot);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
