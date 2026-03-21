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

  // Apply saved theme
  const savedTheme = state.get('settings.theme') || 'dark';
  applyTheme(savedTheme);
  updateThemeButtons(savedTheme);

  // Bind event handlers
  bindEventHandlers();

  // Render scene list
  renderSceneList();

  // Initialize mobile module (Faz 8)
  initMobile();

  // Start auto-save
  initAutoSave();

  // Autocomplete — senaryo editörü otomatik tamamlama (Faz 17)
  initAutocomplete();

  // Tutorial rehberleri — ilk açılış kontrolü (Faz 16)
  initTutorials();

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

  // Theme
  updateThemeButtons(settings.theme || 'dark');

  // Header color
  setInputValue('headerColorInput', settings.headerColor || '#1f2c33');

  // Bubble colors
  const theme = settings.theme || 'dark';
  const defaultOutColor = theme === 'light' ? '#d9fdd3' : '#005c4b';
  const defaultInColor = theme === 'light' ? '#ffffff' : '#1f2c33';
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
 * Bubble color picker varsayılanlarını temaya göre güncelle
 * Özel renk seçilmişse korunur, seçilmemişse tema varsayılanı gösterilir
 */
function updateBubbleColorInputDefaults(theme) {
  const defaultOut = theme === 'light' ? '#d9fdd3' : '#005c4b';
  const defaultIn = theme === 'light' ? '#ffffff' : '#1f2c33';
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
 * Toggle theme between dark and light
 */
function toggleTheme() {
  const current = state.get('settings.theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  updateThemeButtons(next);
  // Header rengi temaya uygun varsayılana dönsün
  const defaultColor = next === 'light' ? '#008069' : '#1f2c33';
  setHeaderColor(defaultColor);
  setInputValue('headerColorInput', defaultColor);
  // Bubble renk picker varsayılanlarını güncelle (özel renk yoksa)
  updateBubbleColorInputDefaults(next);
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
    lightBtn.style.color = '#111b21';
    lightBtn.style.borderColor = 'transparent';
    darkBtn.style.background = '';
    darkBtn.style.color = '';
    darkBtn.style.borderColor = '';
  } else {
    lightBtn.classList.add('secondary');
    darkBtn.classList.remove('secondary');
    // Primary style for active button
    darkBtn.style.background = 'var(--wa-green)';
    darkBtn.style.color = '#111b21';
    darkBtn.style.borderColor = 'transparent';
    lightBtn.style.background = '';
    lightBtn.style.color = '';
    lightBtn.style.borderColor = '';
  }
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
    const theme = state.get('settings.theme') || 'dark';
    const defaultPreset = theme === 'light' ? 'light-default' : 'default';
    const defaultColor = theme === 'light' ? '#efeae2' : '#0b141a';
    setInputValue('wallpaperPreset', defaultPreset);
    setInputValue('wallpaperColor', defaultColor);
    const fileInput = $('wallpaperImageFile');
    if (fileInput) fileInput.value = '';
    showSuccess('Duvar kağıdı sıfırlandı!');
  });

  // === THEME TOGGLE ===
  bindClick('themeDarkBtn', () => {
    setTheme('dark');
    updateThemeButtons('dark');
    // Header rengi dark varsayılana dönsün
    const defaultDark = '#1f2c33';
    setHeaderColor(defaultDark);
    setInputValue('headerColorInput', defaultDark);
    updateBubbleColorInputDefaults('dark');
    showSuccess('Dark mod aktif!');
  });

  bindClick('themeLightBtn', () => {
    setTheme('light');
    updateThemeButtons('light');
    // Header rengi light varsayılana dönsün
    const defaultLight = '#008069';
    setHeaderColor(defaultLight);
    setInputValue('headerColorInput', defaultLight);
    updateBubbleColorInputDefaults('light');
    showSuccess('Light mod aktif!');
  });

  // Action bar & phone-only toolbar quick theme toggle
  bindClick('actionThemeToggleBtn', toggleTheme);
  bindClick('potThemeToggleBtn', toggleTheme);

  // === HEADER COLOR ===
  bindInput('headerColorInput', (e) => {
    setHeaderColor(e.target.value);
  });

  bindChange('headerColorInput', (e) => {
    setHeaderColor(e.target.value);
  });

  bindClick('resetHeaderColorBtn', () => {
    const theme = state.get('settings.theme') || 'dark';
    const defaultColor = theme === 'light' ? '#008069' : '#1f2c33';
    setHeaderColor(defaultColor);
    setInputValue('headerColorInput', defaultColor);
    showSuccess('Header rengi sıfırlandı!');
  });

  // === BUBBLE COLORS ===
  bindInput('bubbleOutColorInput', (e) => {
    setBubbleOutColor(e.target.value);
  });

  bindChange('bubbleOutColorInput', (e) => {
    setBubbleOutColor(e.target.value);
  });

  bindInput('bubbleInColorInput', (e) => {
    setBubbleInColor(e.target.value);
  });

  bindChange('bubbleInColorInput', (e) => {
    setBubbleInColor(e.target.value);
  });

  bindClick('resetBubbleColorsBtn', () => {
    resetBubbleColors();
    const theme = state.get('settings.theme') || 'dark';
    const defaultOut = theme === 'light' ? '#d9fdd3' : '#005c4b';
    const defaultIn = theme === 'light' ? '#ffffff' : '#1f2c33';
    setInputValue('bubbleOutColorInput', defaultOut);
    setInputValue('bubbleInColorInput', defaultIn);
    showSuccess('Balon renkleri sıfırlandı!');
  });

  // === TICK STATUS ===
  ['tickSentBtn', 'tickDeliveredBtn', 'tickReadBtn'].forEach(id => {
    bindClick(id, () => {
      const btn = $(id);
      if (!btn) return;
      const tickVal = btn.dataset.tick;
      state.set('settings.tickStatus', tickVal);
      // Update active class
      document.querySelectorAll('.tick-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Re-render all messages to apply new default tick
      rebuildChat();
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
        const importedTheme = state.get('settings.theme') || 'dark';
        applyTheme(importedTheme);
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

  // === SCENE MANAGEMENT ===
  bindClick('saveSceneBtn', () => {
    const input = $('sceneNameInput');
    const name = input?.value?.trim();
    if (!name) {
      showError('Sahne adı boş bırakılamaz.');
      return;
    }
    sceneManager.save(name);
    input.value = '';
    renderSceneList();
    showSuccess('Sahne kaydedildi!');
  });

  // Enter ile kaydet
  bindChange('sceneNameInput', () => {});
  const sceneInput = $('sceneNameInput');
  if (sceneInput) {
    sceneInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        $('saveSceneBtn')?.click();
      }
    });
  }

  bindClick('clearAllBtn', () => {
    if (!confirm('Tüm veriyi silmek istediğinizden emin misiniz?')) return;
    storage.clear();
    state.reset();
    state.set('player.script', DEFAULT_SCRIPT);
    applyTheme('dark');
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

// === SCENE MANAGEMENT ===

function renderSceneList() {
  const container = $('sceneList');
  if (!container) return;

  const scenes = sceneManager.getAll();

  if (scenes.length === 0) {
    container.innerHTML = '<p class="hint">Henüz kaydedilmiş sahne yok.</p>';
    return;
  }

  container.innerHTML = scenes.map(scene => {
    const date = new Date(scene.timestamp);
    const dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    return `<div class="scene-item" data-scene-id="${scene.id}">
      <div class="scene-info">
        <span class="scene-name">${escapeHtml(scene.name)}</span>
        <span class="scene-date">${dateStr} ${timeStr}</span>
      </div>
      <div class="scene-actions">
        <button type="button" class="btn-sm scene-load-btn" data-scene-id="${scene.id}">Yükle</button>
        <button type="button" class="btn-sm danger scene-delete-btn" data-scene-id="${scene.id}">Sil</button>
      </div>
    </div>`;
  }).join('');

  // Event delegation
  container.querySelectorAll('.scene-load-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.sceneId);
      if (!confirm('Bu sahneyi yüklemek istediğinizden emin misiniz? Mevcut değişiklikler kaybolacak.')) return;
      const ok = sceneManager.load(id);
      if (ok) {
        const importedTheme = state.get('settings.theme') || 'dark';
        applyTheme(importedTheme);
        populateFormFields();
        renderPeopleList();
        syncHeader();
        rebuildChat();
        applyWallpaper();
        applyAllTypography();
        showSuccess('Sahne yüklendi!');
      }
    });
  });

  container.querySelectorAll('.scene-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.sceneId);
      if (!confirm('Bu sahneyi silmek istediğinizden emin misiniz?')) return;
      sceneManager.delete(id);
      renderSceneList();
      showSuccess('Sahne silindi!');
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
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

/**
 * Tutorial rehberleri — ilk açılış kontrolü (Faz 16)
 */
function initTutorials() {
  const TUTORIAL_KEY = 'wa_sim_tutorials_seen';
  const seen = localStorage.getItem(TUTORIAL_KEY);
  const tutorials = document.querySelectorAll('.tutorial-guide');

  if (!seen) {
    // İlk ziyaret — rehberleri açık göster
    tutorials.forEach(t => t.setAttribute('open', ''));
    localStorage.setItem(TUTORIAL_KEY, '1');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
