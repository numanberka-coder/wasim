/** Keep the mobile phone and editor inside the software keyboard's visible area. */
export function initVisualViewport() {
  const viewport = window.visualViewport;
  const root = document.documentElement;
  let frame = null;

  function update() {
    frame = null;
    // Pinch zoom is not a keyboard resize. Let the browser pan/zoom naturally.
    const zoomed = viewport && Math.abs((viewport.scale || 1) - 1) > 0.05;
    const height = zoomed ? window.innerHeight : (viewport?.height || window.innerHeight);
    const top = zoomed ? 0 : Math.max(0, viewport?.offsetTop || 0);
    // offsetTop is browser panning, not additional usable height. Subtracting it
    // would lose the keyboard state when the browser pans to the bottom input.
    const keyboardHeight = zoomed ? 0 : Math.max(0, window.innerHeight - height);
    root.style.setProperty('--visual-viewport-height', `${height}px`);
    root.style.setProperty('--visual-viewport-top', `${top}px`);
    root.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
    root.classList.toggle('keyboard-open', keyboardHeight > 100);
    const active = document.activeElement;
    const inPhoneComposer = !!active?.closest?.('.phone .chat-input');
    const phoneFocused = inPhoneComposer && active.matches('input, textarea, [contenteditable="true"]');
    // Keep the layout steady while tapping Send (which can blur the input),
    // but restore chrome when editing elsewhere or the keyboard closes.
    const retainPhone = root.classList.contains('phone-keyboard-open') &&
      (inPhoneComposer || active === document.body);
    root.classList.toggle('phone-keyboard-open', !zoomed && window.innerWidth <= 980 &&
      keyboardHeight > 100 && (phoneFocused || retainPhone));
    if (zoomed || window.innerWidth > 980) return;

    const body = active?.closest?.('.mobile-overlay-body, .message-edit-modal .app-modal-body');
    if (!body || !active.matches('input, textarea, select, [contenteditable="true"]')) return;
    const area = body.getBoundingClientRect();
    const field = active.getBoundingClientRect();
    if (!area.height || !field.height) return;
    const actions = active.closest('.mobile-script-composer')?.querySelector('.mobile-script-composer-actions');
    const reserve = actions?.getBoundingClientRect().height || 0;
    const paddingBottom = parseFloat(getComputedStyle(body).paddingBottom) || 0;
    const inset = body.closest('.message-edit-modal') ?
      Math.min(12, Math.max(0, (area.height - field.height - paddingBottom) / 2)) : 12;
    const visibleBottom = Math.min(area.bottom, top + height) - paddingBottom - reserve - inset;
    const visibleTop = Math.max(area.top, top) + inset;
    // Scroll only the editing body; scrollIntoView would also pan the iOS page.
    if (field.height > visibleBottom - visibleTop) body.scrollTop += field.top - visibleTop;
    else if (field.bottom > visibleBottom) body.scrollTop += field.bottom - visibleBottom;
    else if (field.top < visibleTop) body.scrollTop -= visibleTop - field.top;
  }

  function schedule() {
    // Coalesce the keyboard's animation, including its final resize event.
    if (frame === null) frame = requestAnimationFrame(update);
  }
  viewport?.addEventListener('resize', schedule);
  viewport?.addEventListener('scroll', schedule);
  window.addEventListener('resize', schedule);
  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', schedule);
  update();
  return () => {
    if (frame !== null) cancelAnimationFrame(frame);
    viewport?.removeEventListener('resize', schedule);
    viewport?.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('focusin', schedule);
    document.removeEventListener('focusout', schedule);
  };
}
