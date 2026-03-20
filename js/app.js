/* ========================================
   APP - Main Application Entry Point
   ======================================== */





// UI Modules




// Phone Modules





// Feature Modules




/**
 * Initialize application
 */
function init() {
  console.log('🚀 Initializing WhatsApp Simulator...');

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
  initStatusBar();
  applyWallpaper();
  applyAllTypography();

  // Render initial state
  renderPeopleList();
  syncHeader();
  rebuildChat();

  // Populate form fields
  populateFormFields();

  // Init script helpers after forms are ready
  initScriptTools();

  // Bind event handlers
  bindEventHandlers();

  // Initialize mobile module (Faz 8)
  initMobile();

  // Start auto-save
  initAutoSave();

  console.log('✅ WhatsApp Simulator ready!');
}

/**
 * Populate form fields from state
 */
function populateFormFields() {
  const group = state.get('group');
  const settings = state.get('settings');
  const messageTimes = state.get('messageTimes');
  const player = state.get('player');

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

  // Header color
  setInputValue('headerColorInput', settings.headerColor || '#1f2c33');

  // Typography
  setInputValue('fontSizeControl', settings.chatFontSize);
  setTextContent('fontSizeValue', `${settings.chatFontSize}px`);
  setInputValue('lineHeightControl', settings.chatLineHeight);
  setTextContent('lineHeightValue', `${settings.chatLineHeight.toFixed(2).replace(/\.00$/, '')}x`);
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
}

/**
 * Bind all event handlers
 */
function bindEventHandlers() {
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
  bindInput('operatorNameInput', (e) => {
    setOperatorName(e.target.value.trim());
  });

  bindInput('statusTimeInput', (e) => {
    setStatusTime(e.target.value);
  });

  bindChange('batteryVisible', (e) => {
    setBatteryVisible(e.target.checked);
  });

  bindInput('batteryPercentInput', (e) => {
    const value = clampInputValue(e.target, 0, 100, 95, 'Batarya % 0-100 arasında olmalı.');
    setBatteryPercent(value);
  });

  bindInput('batteryHealthInput', (e) => {
    const value = clampInputValue(e.target, 0, 100, 100, 'Sağlık yüzdesi 0-100 arasında olmalı.');
    setBatteryHealth(value);
  });

  // === WALLPAPER ===
  bindChange('wallpaperPreset', (e) => {
    setWallpaperPreset(e.target.value);
  });

  bindInput('wallpaperColor', (e) => {
    setWallpaperColor(e.target.value);
  });

  bindChange('wallpaperColor', (e) => {
    setWallpaperColor(e.target.value);
  });

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
    setInputValue('wallpaperPreset', 'default');
    setInputValue('wallpaperColor', '#0b141a');
    const fileInput = $('wallpaperImageFile');
    if (fileInput) fileInput.value = '';
    showSuccess('Duvar kağıdı sıfırlandı!');
  });

  // === HEADER COLOR ===
  bindInput('headerColorInput', (e) => {
    setHeaderColor(e.target.value);
  });

  bindChange('headerColorInput', (e) => {
    setHeaderColor(e.target.value);
  });

  bindClick('resetHeaderColorBtn', () => {
    const defaultColor = '#1f2c33';
    setHeaderColor(defaultColor);
    setInputValue('headerColorInput', defaultColor);
    showSuccess('Header rengi sıfırlandı!');
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
    if (e.target.checked) {
      regenerateMessageTimes();
    }
  });

  bindInput('messageBaseTimeInput', (e) => {
    state.set('messageTimes.baseTime', e.target.value || nowTime());
    if (state.get('messageTimes.auto')) {
      regenerateMessageTimes();
    }
  });

  bindInput('messageIncrementInput', (e) => {
    const val = clampInputValue(e.target, 0, 180, 1, 'Artış dakikası 0-180 arasında olmalı.');
    state.set('messageTimes.increment', val);
    if (state.get('messageTimes.auto')) {
      regenerateMessageTimes();
    }
  });

  // === PEOPLE ===
  bindClick('savePersonBtn', savePerson);
  bindClick('newPersonBtn', clearPersonForm);
  bindClick('clearAvatarBtn', clearPersonAvatar);
  bindClick('deletePersonBtn', deletePerson);
  bindClick('applyJsonBtn', applyPeopleFromJson);
  bindClick('refreshJsonBtn', refreshPeopleJson);

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

  // === PLAYER ===
  bindClick('loadBtn', () => {
    loadScript();
  });

  bindClick('stepBtn', step);

  bindClick('playBtn', () => {
    play();
  });

  bindClick('pauseBtn', () => {
    pause();
  });

  bindClick('resetBtn', () => {
    reset();
  });

  // === PHONE-ONLY MODE ===
  bindClick('phoneOnlyBtn', togglePhoneOnlyMode);
  bindClick('phoneOnlyExitBtn', togglePhoneOnlyMode);

  // === SCREENSHOT ===
  bindClick('screenshotBtn', takeScreenshot);
  bindClick('potScreenshotBtn', takeScreenshot);

  // === SCALE CONTROLS (action bar + floating toolbar) ===
  document.querySelectorAll('.scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const scale = parseFloat(btn.dataset.scale);
      setPhoneScale(scale);
      syncScaleButtons(scale);
    });
  });
  document.querySelectorAll('.pot-scale').forEach(btn => {
    btn.addEventListener('click', () => {
      const scale = parseFloat(btn.dataset.scale);
      setPhoneScale(scale);
      syncScaleButtons(scale);
    });
  });

  // === EXPORT/IMPORT ===
  bindClick('saveAllBtn', () => {
    const filename = storage.exportToFile();
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
        populateFormFields();
        renderPeopleList();
        syncHeader();
        rebuildChat();
        applyWallpaper();
        applyAllTypography();
        showSuccess('Dosya yüklendi!');
      } catch (err) {
        showError(err.message);
      }
    };
    input.click();
  });

  bindClick('clearAllBtn', () => {
    if (!confirm('Tüm veriyi silmek istediğinizden emin misiniz?')) return;
    storage.clear();
    state.reset();
    state.set('player.script', DEFAULT_SCRIPT);
    populateFormFields();
    renderPeopleList();
    syncHeader();
    rebuildChat();
    applyWallpaper();
    applyAllTypography();
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

function setTextContent(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function setChecked(id, checked) {
  const el = $(id);
  if (el) el.checked = Boolean(checked);
}

function bindClick(id, handler) {
  const el = $(id);
  if (el) el.addEventListener('click', handler);
}

function bindChange(id, handler) {
  const el = $(id);
  if (el) el.addEventListener('change', handler);
}

function bindInput(id, handler) {
  const el = $(id);
  if (el) el.addEventListener('input', handler);
}

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
  if (typeof html2canvas === 'undefined') {
    showError('html2canvas yüklenemedi. İnternet bağlantısını kontrol edin.');
    return;
  }

  const phone = document.querySelector('.phone');
  if (!phone) return;

  try {
    showSuccess('Ekran görüntüsü hazırlanıyor...');

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

    showSuccess('Ekran görüntüsü indirildi!');
  } catch (err) {
    console.error('Screenshot error:', err);
    showError('Ekran görüntüsü alınamadı: ' + err.message);
  }
}

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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
