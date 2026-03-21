/* ========================================
   WALLPAPER - Chat Wallpaper Management
   ======================================== */

import { $one } from '../utils.js';
import { state } from '../state.js';
import { THEME_DEFAULTS, WALLPAPER_PRESETS } from '../config.js';




/**
 * Apply current wallpaper settings
 */
export function applyWallpaper() {
  const settings = state.get('settings');
  const phoneEl = $one('.phone');
  if (!phoneEl) return;

  const presetKey = settings.wallpaperPreset || 'default';
  const preset = WALLPAPER_PRESETS[presetKey] || WALLPAPER_PRESETS.default;
  const customColor = settings.wallpaperColor || THEME_DEFAULTS.dark.wallpaperColor;

  let background = preset.background;
  let size = preset.size || 'auto';
  let blend = preset.blend || 'screen, normal, normal, overlay';

  // Custom color — düz renk
  if (presetKey === 'custom-color') {
    background = customColor;
    size = 'auto';
    blend = 'normal';
  }

  // Custom image — preload before applying
  if (presetKey === 'custom-image') {
    if (settings.wallpaperImageDataUrl) {
      // Apply default wallpaper immediately, swap to custom after preload
      const fallback = WALLPAPER_PRESETS.default;
      phoneEl.style.setProperty('--chat-wallpaper', fallback.background);
      phoneEl.style.setProperty('--chat-wallpaper-size', fallback.size);
      phoneEl.style.setProperty('--chat-wallpaper-blend', fallback.blend);

      const dataUrl = settings.wallpaperImageDataUrl;
      preloadImage(dataUrl).then(() => {
        // Verify preset hasn't changed while loading
        if (state.get('settings.wallpaperPreset') !== 'custom-image') return;
        const bg = `linear-gradient(180deg, rgba(7,12,16,.48), rgba(7,12,16,.34)), url(${dataUrl})`;
        phoneEl.style.setProperty('--chat-wallpaper', bg);
        phoneEl.style.setProperty('--chat-wallpaper-size', 'auto, cover');
        phoneEl.style.setProperty('--chat-wallpaper-blend', 'normal, normal');
      });
      return;
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
 * Preload image and resolve when loaded
 */
function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve; // resolve anyway to prevent blocking
    img.src = src;
  });
}

/**
 * Set wallpaper preset
 */
export function setWallpaperPreset(preset) {
  state.set('settings.wallpaperPreset', preset);
  applyWallpaper();
}

/**
 * Set custom wallpaper color
 */
export function setWallpaperColor(color) {
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
export function setWallpaperImage(dataUrl) {
  state.set('settings.wallpaperImageDataUrl', dataUrl);
  state.set('settings.wallpaperPreset', 'custom-image');
  applyWallpaper();
}

/**
 * Clear wallpaper to default
 */
export function clearWallpaper() {
  const theme = state.get('settings.theme') || 'dark';
  const themeColors = THEME_DEFAULTS[theme] || THEME_DEFAULTS.dark;
  const defaultPreset = themeColors.wallpaperPreset;
  const defaultColor = themeColors.wallpaperColor;
  state.set('settings.wallpaperPreset', defaultPreset);
  state.set('settings.wallpaperColor', defaultColor);
  state.set('settings.wallpaperImageDataUrl', null);
  applyWallpaper();
}

/**
 * Get available wallpaper presets
 */
export function getWallpaperPresets() {
  return Object.keys(WALLPAPER_PRESETS);
}
