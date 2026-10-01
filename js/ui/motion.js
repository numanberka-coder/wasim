/** Small, cancellable motion primitive; layout and accessibility stay with the caller. */
export function animateElement(element, keyframes, options = {}) {
  const { onFinish } = options;
  if (!element?.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    onFinish?.();
    return () => {};
  }
  const styles = getComputedStyle(element);
  const timing = options.duration ?? '--motion-screen-duration';
  const value = typeof timing === 'string' ? styles.getPropertyValue(timing).trim() : timing;
  const duration = typeof value === 'number' ? value
    : value ? parseFloat(value) * (value.endsWith('ms') ? 1 : 1000) : 240;
  const easing = options.easing || styles.getPropertyValue('--motion-ease').trim() || 'cubic-bezier(.22, 1, .36, 1)';
  const animation = element.animate(keyframes, { duration, easing, fill: 'both' });
  let active = true;
  const cancel = () => {
    active = false;
    animation.onfinish = null;
    animation.cancel();
  };
  animation.onfinish = () => {
    if (!active) return;
    cancel(); // Release filled transform/opacity before restoring or capturing nodes.
    onFinish?.();
  };
  return cancel;
}
