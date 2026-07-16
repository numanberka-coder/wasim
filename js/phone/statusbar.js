/* ========================================
   STATUSBAR - Phone Status Bar Management
   ======================================== */

import { $, $one, nowTime, clamp, Logger } from '../utils.js';
import { state } from '../state.js';



let updateInterval = null;

/**
 * Update status bar time
 */
export function updateStatusBar() {
  const settings = state.get('settings');
  const timeEl = $('statusTime');
  
  if (timeEl) {
    const override = settings.statusTimeOverride?.trim();
    timeEl.textContent = override || nowTime();
  }
}

/**
 * Set status bar time override
 */
export function setStatusTime(time) {
  state.set('settings.statusTimeOverride', time);
  updateStatusBar();
}

/**
 * Clear status bar time override (use real time)
 */
export function clearStatusTime() {
  state.set('settings.statusTimeOverride', '');
  updateStatusBar();
}

/**
 * Apply battery settings
 */
export function applyBatterySettings() {
  const settings = state.get('settings');
  const phoneEl = $one('.phone');
  const batteryContainer = $one('.battery');
  const batteryFill = $one('.battery-fill');
  const batteryLabel = $('batteryPercent');

  const percent = clamp(settings.batteryPercent, 0, 100);
  const health = clamp(settings.batteryHealth, 0, 100);
  const effective = Math.round(percent * (health / 100));

  // Toggle visibility
  if (phoneEl) {
    phoneEl.classList.toggle('battery-hidden', !settings.batteryVisible);
  }

  // Low battery indicator
  if (batteryContainer) {
    batteryContainer.classList.toggle('low', effective <= 20 && settings.batteryVisible);
  }

  // Fill level
  if (batteryFill) {
    const level = settings.batteryVisible ? Math.max(0, Math.min(effective, 100)) / 100 : 0;
    batteryFill.style.setProperty('--battery-level', level);
  }

  // Percentage label
  if (batteryLabel) {
    batteryLabel.textContent = `${percent}%`;
  }
}

/**
 * Set battery percentage
 */
export function setBatteryPercent(percent) {
  state.set('settings.batteryPercent', clamp(percent, 0, 100));
  applyBatterySettings();
}

/**
 * Set battery health
 */
export function setBatteryHealth(health) {
  state.set('settings.batteryHealth', clamp(health, 0, 100));
  applyBatterySettings();
}

/**
 * Toggle battery visibility
 */
export function setBatteryVisible(visible) {
  state.set('settings.batteryVisible', visible);
  applyBatterySettings();
}

/**
 * Start automatic time updates
 */
export function startTimeUpdates() {
  if (updateInterval) return;
  
  updateStatusBar();
  updateInterval = setInterval(updateStatusBar, 60000);
  Logger.info('⏰ Status bar updates started');
}

/**
 * Stop automatic time updates
 */
export function stopTimeUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

/**
 * Apply status bar layout (height / font size / icon scale).
 * Her cihazın gerçek durum çubuğu farklı olduğundan bu ölçüler kullanıcı
 * ayarıdır; CSS değişkenleri üzerinden tüm ekranlara (home + chat) yansır.
 */
export function applyStatusBarLayout() {
  const phoneEl = $one('.phone');
  if (!phoneEl) return;

  const settings = state.get('settings');
  const height = clamp(settings.statusBarHeight ?? 28, 24, 48);
  const fontSize = clamp(settings.statusBarFontSize ?? 11, 10, 16);
  const iconScale = clamp(settings.statusBarIconScale ?? 1, 0.8, 1.5);

  phoneEl.style.setProperty('--phone-status-bar-height', `${height}px`);
  phoneEl.style.setProperty('--status-bar-font-size', `${fontSize}px`);
  phoneEl.style.setProperty('--status-bar-icon-scale', iconScale);
}

/**
 * Set status bar height (px)
 */
export function setStatusBarHeight(height) {
  state.set('settings.statusBarHeight', clamp(height, 24, 48));
  applyStatusBarLayout();
}

/**
 * Set status bar font size (px)
 */
export function setStatusBarFontSize(size) {
  state.set('settings.statusBarFontSize', clamp(size, 10, 16));
  applyStatusBarLayout();
}

/**
 * Set status bar icon scale (multiplier)
 */
export function setStatusBarIconScale(scale) {
  state.set('settings.statusBarIconScale', clamp(scale, 0.8, 1.5));
  applyStatusBarLayout();
}

/**
 * Apply status bar background color.
 * null/boş = header rengini takip et (CSS fallback devreye girer).
 */
export function applyStatusBarColor(color) {
  const phoneEl = $one('.phone');
  if (!phoneEl) return;
  if (color) {
    phoneEl.style.setProperty('--wa-status-bar-color', color);
  } else {
    phoneEl.style.removeProperty('--wa-status-bar-color');
  }
}

/**
 * Set status bar background color — updates state + applies
 */
export function setStatusBarColor(color) {
  state.set('settings.statusBarColor', color || null);
  applyStatusBarColor(color);
}

/**
 * Set operator name in status bar
 */
export function setOperatorName(name) {
  const el = $one('.status-operator');
  if (el) el.textContent = name || 'Turkcell';
  state.set('settings.operatorName', name || 'Turkcell');
}

/**
 * Initialize status bar
 */
export function initStatusBar() {
  updateStatusBar();
  applyBatterySettings();
  applyStatusBarLayout();
  applyStatusBarColor(state.get('settings.statusBarColor'));
  startTimeUpdates();

  // Restore operator name from state
  const saved = state.get('settings')?.operatorName;
  if (saved) setOperatorName(saved);
}
