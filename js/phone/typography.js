/* ========================================
   TYPOGRAPHY - Font & Bubble Settings
   ======================================== */



/**
 * Apply font size setting
 */
function applyFontSize() {
  const phoneEl = $one('.phone');
  if (!phoneEl) return;

  const size = clamp(state.get('settings.chatFontSize'), 12, 18);
  phoneEl.style.setProperty('--chat-font-size', `${size}px`);
}

/**
 * Set font size
 */
function setFontSize(size) {
  const clamped = clamp(size, 12, 18);
  state.set('settings.chatFontSize', clamped);
  applyFontSize();
}

/**
 * Apply line height setting
 */
function applyLineHeight() {
  const phoneEl = $one('.phone');
  if (!phoneEl) return;

  const lineHeight = clamp(state.get('settings.chatLineHeight'), 1.2, 1.6);
  phoneEl.style.setProperty('--chat-line-height', lineHeight);
}

/**
 * Set line height
 */
function setLineHeight(height) {
  const clamped = clamp(height, 1.2, 1.6);
  state.set('settings.chatLineHeight', clamped);
  applyLineHeight();
}

/**
 * Apply bubble size setting
 */
function applyBubbleSize() {
  const phoneEl = $one('.phone');
  if (!phoneEl) return;

  const maxWidth = clamp(state.get('settings.bubbleSize'), 70, 90);
  const factor = maxWidth / 78;

  phoneEl.style.setProperty('--bubble-max-width', `${maxWidth}%`);

  // Adjust padding proportionally
  const right = Math.round(10 * factor * 10) / 10;
  const left = Math.round(12 * factor * 10) / 10;
  phoneEl.style.setProperty('--bubble-padding-right', `${right}px`);
  phoneEl.style.setProperty('--bubble-padding-left', `${left}px`);
}

/**
 * Set bubble size
 */
function setBubbleSize(size) {
  const clamped = clamp(size, 70, 90);
  state.set('settings.bubbleSize', clamped);
  applyBubbleSize();
}

/**
 * Apply bubble padding Y setting
 */
function applyBubblePaddingY() {
  const phoneEl = $one('.phone');
  if (!phoneEl) return;

  const pad = clamp(state.get('settings.bubblePaddingY'), 8, 14);
  const top = Math.max(6, pad - 1);
  const bottom = pad + 1;

  phoneEl.style.setProperty('--bubble-padding-top', `${top}px`);
  phoneEl.style.setProperty('--bubble-padding-bottom', `${bottom}px`);
}

/**
 * Set bubble padding Y
 */
function setBubblePaddingY(padding) {
  const clamped = clamp(padding, 8, 14);
  state.set('settings.bubblePaddingY', clamped);
  applyBubblePaddingY();
}

/**
 * Apply all typography settings
 */
function applyAllTypography() {
  applyFontSize();
  applyLineHeight();
  applyBubbleSize();
  applyBubblePaddingY();
}

/**
 * Reset typography to defaults
 */
function resetTypography() {
  state.set('settings.chatFontSize', 14);
  state.set('settings.chatLineHeight', 1.4);
  state.set('settings.bubbleSize', 78);
  state.set('settings.bubblePaddingY', 10);
  applyAllTypography();
}
