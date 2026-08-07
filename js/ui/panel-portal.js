/* Idempotent DOM portal that restores the exact panel contract. */

export function createPanelPortal(panel) {
  if (!panel) throw new Error('Panel is required');
  let snapshot = null;

  function mount(target) {
    if (!target) throw new Error('Portal target is required');
    if (snapshot) return false;
    const anchor = document.createComment(`panel-portal:${panel.id || 'anonymous'}`);
    snapshot = {
      parent: panel.parentNode,
      anchor,
      style: panel.getAttribute('style'),
      ariaHidden: panel.getAttribute('aria-hidden'),
      className: panel.className,
      scrollTop: panel.scrollTop,
    };
    snapshot.parent?.insertBefore(anchor, panel);
    target.appendChild(panel);
    return true;
  }

  function restore() {
    if (!snapshot) return false;
    const current = snapshot;
    if (current.anchor.parentNode === current.parent) {
      current.parent.insertBefore(panel, current.anchor);
      current.anchor.remove();
    } else if (current.parent?.isConnected) {
      current.parent.appendChild(panel);
    } else {
      throw new Error(`Panel portal restore target is unavailable: ${panel.id || 'anonymous'}`);
    }
    if (current.style === null) panel.removeAttribute('style');
    else panel.setAttribute('style', current.style);
    if (current.ariaHidden === null) panel.removeAttribute('aria-hidden');
    else panel.setAttribute('aria-hidden', current.ariaHidden);
    panel.className = current.className;
    panel.scrollTop = current.scrollTop;
    snapshot = null;
    return true;
  }

  return { mount, restore, isMounted: () => Boolean(snapshot), panel };
}
