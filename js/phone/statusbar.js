/* ========================================
   STATUSBAR - Phone Status Bar Management
   ======================================== */



let updateInterval = null;

/**
 * Update status bar time
 */
function updateStatusBar() {
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
function setStatusTime(time) {
  state.set('settings.statusTimeOverride', time);
  updateStatusBar();
}

/**
 * Clear status bar time override (use real time)
 */
function clearStatusTime() {
  state.set('settings.statusTimeOverride', '');
  updateStatusBar();
}

/**
 * Apply battery settings
 */
function applyBatterySettings() {
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
function setBatteryPercent(percent) {
  state.set('settings.batteryPercent', clamp(percent, 0, 100));
  applyBatterySettings();
}

/**
 * Set battery health
 */
function setBatteryHealth(health) {
  state.set('settings.batteryHealth', clamp(health, 0, 100));
  applyBatterySettings();
}

/**
 * Toggle battery visibility
 */
function setBatteryVisible(visible) {
  state.set('settings.batteryVisible', visible);
  applyBatterySettings();
}

/**
 * Start automatic time updates
 */
function startTimeUpdates() {
  if (updateInterval) return;
  
  updateStatusBar();
  updateInterval = setInterval(updateStatusBar, 60000);
  console.log('⏰ Status bar updates started');
}

/**
 * Stop automatic time updates
 */
function stopTimeUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

/**
 * Set operator name in status bar
 */
function setOperatorName(name) {
  const el = $one('.status-operator');
  if (el) el.textContent = name || 'Turkcell';
  state.set('settings.operatorName', name || 'Turkcell');
}

/**
 * Initialize status bar
 */
function initStatusBar() {
  updateStatusBar();
  applyBatterySettings();
  startTimeUpdates();

  // Restore operator name from state
  const saved = state.get('settings')?.operatorName;
  if (saved) setOperatorName(saved);
}
