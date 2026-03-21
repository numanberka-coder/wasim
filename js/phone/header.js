/* ========================================
   HEADER - Chat Header Management
   ======================================== */

import { $ } from '../utils.js';
import { state } from '../state.js';
import { THEME_DEFAULTS } from '../config.js';
import { applyWallpaper } from './wallpaper.js';



/**
 * Sync header with current state
 */
export function syncHeader() {
  const group = state.get('group');
  const settings = state.get('settings');
  
  // Update title
  const titleEl = $('headerTitle');
  if (titleEl) {
    titleEl.textContent = group.title || 'Grup';
  }

  // Update status
  const statusEl = $('headerStatus');
  if (statusEl) {
    statusEl.textContent = group.subtitle || '';
  }

  // Update day divider
  const dayEl = $('dayDivider');
  if (dayEl) {
    dayEl.textContent = group.dayLabel || 'Bugün';
  }

  // Apply header color
  applyHeaderColor(settings.headerColor || THEME_DEFAULTS.dark.headerColor);

  // Apply bubble colors
  applyBubbleColors(settings.bubbleOutColor, settings.bubbleInColor);

  // Update avatar
  renderHeaderAvatar();
}

/**
 * Render header avatar
 */
export function renderHeaderAvatar() {
  const avatarEl = $('headerAvatar');
  if (!avatarEl) return;

  const group = state.get('group');
  const title = group.title || 'Grup';
  
  // Reset classes
  avatarEl.className = 'header-avatar online';

  // File data URL takes priority
  if (group.avatarDataUrl) {
    avatarEl.innerHTML = `<img src="${group.avatarDataUrl}" alt="group">`;
    return;
  }

  // Then URL
  if (group.photoUrl) {
    const initial = (title[0] || 'G').toUpperCase();
    const img = document.createElement('img');
    img.src = group.photoUrl;
    img.alt = 'group';
    img.addEventListener('error', () => {
      avatarEl.textContent = initial;
    });
    avatarEl.innerHTML = '';
    avatarEl.appendChild(img);
    return;
  }

  // Fallback to initial
  avatarEl.textContent = (title[0] || 'G').toUpperCase();
}

/**
 * Update group title
 */
export function setGroupTitle(title) {
  state.set('group.title', title);
  syncHeader();
}

/**
 * Update group subtitle/status
 */
export function setGroupSubtitle(subtitle) {
  state.set('group.subtitle', subtitle);
  syncHeader();
}

/**
 * Update day label
 */
export function setDayLabel(label) {
  state.set('group.dayLabel', label);
  syncHeader();
}

/**
 * Set group photo URL
 */
export function setGroupPhotoUrl(url) {
  state.set('group.photoUrl', url);
  renderHeaderAvatar();
}

/**
 * Set group photo from file (data URL)
 */
export function setGroupPhotoData(dataUrl) {
  state.set('group.avatarDataUrl', dataUrl);
  renderHeaderAvatar();
}

/**
 * Clear group photo
 */
export function clearGroupPhoto() {
  state.set('group.photoUrl', '');
  state.set('group.avatarDataUrl', null);
  renderHeaderAvatar();
}

/**
 * Apply header color via CSS variable
 */
export function applyHeaderColor(color) {
  const phone = document.querySelector('.phone');
  if (phone) {
    phone.style.setProperty('--wa-header-color', color);
  }
}

/**
 * Set header color — updates state + applies
 */
export function setHeaderColor(color) {
  state.set('settings.headerColor', color);
  applyHeaderColor(color);
}

/**
 * Apply bubble colors via CSS variable overrides
 * null = tema varsayılanını kullan (removeProperty)
 */
export function applyBubbleColors(outColor, inColor) {
  const phone = document.querySelector('.phone');
  if (!phone) return;

  if (outColor) {
    phone.style.setProperty('--wa-bubble-out-bg', outColor);
    phone.style.setProperty('--wa-bubble-out-solid', outColor);
    phone.style.setProperty('--wa-bubble-out', outColor);
  } else {
    phone.style.removeProperty('--wa-bubble-out-bg');
    phone.style.removeProperty('--wa-bubble-out-solid');
    phone.style.removeProperty('--wa-bubble-out');
  }

  if (inColor) {
    phone.style.setProperty('--wa-bubble-in-bg', inColor);
    phone.style.setProperty('--wa-bubble-in-solid', inColor);
    phone.style.setProperty('--wa-bubble-in', inColor);
  } else {
    phone.style.removeProperty('--wa-bubble-in-bg');
    phone.style.removeProperty('--wa-bubble-in-solid');
    phone.style.removeProperty('--wa-bubble-in');
  }
}

/**
 * Set bubble out color — updates state + applies
 */
export function setBubbleOutColor(color) {
  state.set('settings.bubbleOutColor', color);
  applyBubbleColors(color, state.get('settings.bubbleInColor'));
}

/**
 * Set bubble in color — updates state + applies
 */
export function setBubbleInColor(color) {
  state.set('settings.bubbleInColor', color);
  applyBubbleColors(state.get('settings.bubbleOutColor'), color);
}

/**
 * Reset bubble colors to theme defaults
 */
export function resetBubbleColors() {
  state.set('settings.bubbleOutColor', null);
  state.set('settings.bubbleInColor', null);
  applyBubbleColors(null, null);
}

/**
 * Apply theme (dark/light) — adds/removes .light class on .phone
 */
export function applyTheme(theme) {
  const phone = document.querySelector('.phone');
  if (!phone) return;

  if (theme === 'light') {
    phone.classList.add('light');
    // Light modda header rengi yeşil olmalı (kullanıcı özelleştirmemişse)
    const currentHeaderColor = state.get('settings.headerColor');
    if (currentHeaderColor === THEME_DEFAULTS.dark.headerColor) {
      phone.style.setProperty('--wa-header-color', THEME_DEFAULTS.light.headerColor);
    }
    // Light wallpaper uygula (kullanıcı custom seçmemişse)
    const currentPreset = state.get('settings.wallpaperPreset');
    if (currentPreset === 'default' || currentPreset === 'velvet' || currentPreset === 'graph' || currentPreset === 'plain') {
      state.set('settings.wallpaperPreset', 'light-default', true);
      applyWallpaper();
      const presetEl = document.getElementById('wallpaperPreset');
      if (presetEl) presetEl.value = 'light-default';
    }
  } else {
    phone.classList.remove('light');
    // Dark moda geri dön
    const currentHeaderColor = state.get('settings.headerColor');
    if (currentHeaderColor === THEME_DEFAULTS.dark.headerColor || currentHeaderColor === THEME_DEFAULTS.light.headerColor) {
      phone.style.setProperty('--wa-header-color', THEME_DEFAULTS.dark.headerColor);
    }
    // Dark wallpaper uygula
    const currentPreset = state.get('settings.wallpaperPreset');
    if (currentPreset === 'light-default' || currentPreset === 'light-plain') {
      state.set('settings.wallpaperPreset', 'default', true);
      applyWallpaper();
      const presetEl = document.getElementById('wallpaperPreset');
      if (presetEl) presetEl.value = 'default';
    }
  }
}

/**
 * Set theme — updates state + applies
 */
export function setTheme(theme) {
  state.set('settings.theme', theme);
  applyTheme(theme);
}
