/* ========================================
   HEADER - Chat Header Management
   ======================================== */



/**
 * Sync header with current state
 */
function syncHeader() {
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
  applyHeaderColor(settings.headerColor || '#1f2c33');

  // Update avatar
  renderHeaderAvatar();
}

/**
 * Render header avatar
 */
function renderHeaderAvatar() {
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
    const initial = escapeHtml((title[0] || 'G').toUpperCase());
    avatarEl.innerHTML = `<img src="${escapeHtml(group.photoUrl)}" alt="group" onerror="this.parentElement.textContent='${initial}'">`;
    return;
  }

  // Fallback to initial
  avatarEl.textContent = (title[0] || 'G').toUpperCase();
}

/**
 * Update group title
 */
function setGroupTitle(title) {
  state.set('group.title', title);
  syncHeader();
}

/**
 * Update group subtitle/status
 */
function setGroupSubtitle(subtitle) {
  state.set('group.subtitle', subtitle);
  syncHeader();
}

/**
 * Update day label
 */
function setDayLabel(label) {
  state.set('group.dayLabel', label);
  syncHeader();
}

/**
 * Set group photo URL
 */
function setGroupPhotoUrl(url) {
  state.set('group.photoUrl', url);
  renderHeaderAvatar();
}

/**
 * Set group photo from file (data URL)
 */
function setGroupPhotoData(dataUrl) {
  state.set('group.avatarDataUrl', dataUrl);
  renderHeaderAvatar();
}

/**
 * Clear group photo
 */
function clearGroupPhoto() {
  state.set('group.photoUrl', '');
  state.set('group.avatarDataUrl', null);
  renderHeaderAvatar();
}

/**
 * Apply header color via CSS variable
 */
function applyHeaderColor(color) {
  const phone = document.querySelector('.phone');
  if (phone) {
    phone.style.setProperty('--wa-header-color', color);
  }
}

/**
 * Set header color — updates state + applies
 */
function setHeaderColor(color) {
  state.set('settings.headerColor', color);
  applyHeaderColor(color);
}
