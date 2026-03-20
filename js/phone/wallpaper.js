/* ========================================
   WALLPAPER - Chat Wallpaper Management
   ======================================== */




/**
 * Apply current wallpaper settings
 */
function applyWallpaper() {
  const settings = state.get('settings');
  const phoneEl = $one('.phone');
  if (!phoneEl) return;

  const presetKey = settings.wallpaperPreset || 'default';
  const preset = WALLPAPER_PRESETS[presetKey] || WALLPAPER_PRESETS.default;
  const customColor = settings.wallpaperColor || '#0b141a';

  let background = preset.background;
  let size = preset.size || 'auto';
  let blend = preset.blend || 'screen, normal, normal, overlay';

  // Custom color — düz renk
  if (presetKey === 'custom-color') {
    background = customColor;
    size = 'auto';
    blend = 'normal';
  }

  // Custom image
  if (presetKey === 'custom-image') {
    if (settings.wallpaperImageDataUrl) {
      background = `linear-gradient(180deg, rgba(7,12,16,.48), rgba(7,12,16,.34)), url(${settings.wallpaperImageDataUrl})`;
      size = 'auto, cover';
      blend = 'normal, normal';
    } else {
      // Fallback to default
      const fallback = WALLPAPER_PRESETS.default;
      background = fallback.background;
      size = fallback.size;
      blend = fallback.blend;
    }
  }

  // Apply CSS variables
  phoneEl.style.setProperty('--chat-wallpaper', background);
  phoneEl.style.setProperty('--chat-wallpaper-size', size);
  phoneEl.style.setProperty('--chat-wallpaper-blend', blend);
}

/**
 * Set wallpaper preset
 */
function setWallpaperPreset(preset) {
  state.set('settings.wallpaperPreset', preset);
  applyWallpaper();
}

/**
 * Set custom wallpaper color
 */
function setWallpaperColor(color) {
  state.set('settings.wallpaperColor', color);
  // Renk değiştiğinde otomatik olarak özel renk moduna geç
  if (state.get('settings.wallpaperPreset') !== 'custom-color') {
    state.set('settings.wallpaperPreset', 'custom-color', true);
    // Dropdown'u da senkronize et
    const presetEl = document.getElementById('wallpaperPreset');
    if (presetEl) presetEl.value = 'custom-color';
  }
  applyWallpaper();
}

/**
 * Set custom wallpaper image
 */
function setWallpaperImage(dataUrl) {
  state.set('settings.wallpaperImageDataUrl', dataUrl);
  state.set('settings.wallpaperPreset', 'custom-image');
  applyWallpaper();
}

/**
 * Clear wallpaper to default
 */
function clearWallpaper() {
  state.set('settings.wallpaperPreset', 'default');
  state.set('settings.wallpaperColor', '#0b141a');
  state.set('settings.wallpaperImageDataUrl', null);
  applyWallpaper();
}

/**
 * Get available wallpaper presets
 */
function getWallpaperPresets() {
  return Object.keys(WALLPAPER_PRESETS);
}
