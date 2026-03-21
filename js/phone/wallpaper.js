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
