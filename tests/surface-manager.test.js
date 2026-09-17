import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSurfaceManager } from '../js/ui/surface-manager.js';

function mountSurface(id, withBackdrop = true) {
  const root = document.createElement('div');
  root.id = `${id}-root`;
  const dialog = document.createElement('div');
  dialog.tabIndex = -1;
  const first = document.createElement('button');
  first.textContent = 'İlk';
  const last = document.createElement('button');
  last.textContent = 'Son';
  dialog.append(first, last);
  root.appendChild(dialog);
  const backdrop = withBackdrop ? document.createElement('div') : null;
  document.body.append(root);
  if (backdrop) document.body.append(backdrop);
  return { root, dialog, first, last, backdrop };
}

describe('Faz 59 SurfaceManager', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="background"><button>Arka plan</button></main>';
    document.body.style.cssText = '';
    history.replaceState({}, '');
  });

  it('keeps a LIFO stack and lets only the top surface handle Escape', () => {
    const manager = createSurfaceManager();
    const first = mountSurface('first');
    const second = mountSurface('second');
    const closed = [];
    manager.open({ id: 'first', ...first, requestClose: () => closed.push('first') });
    manager.open({ id: 'second', ...second, requestClose: () => closed.push('second') });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(closed).toEqual(['second']);
    expect(manager.top().id).toBe('second');
    manager.close('second');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(closed).toEqual(['second', 'first']);
    manager.close('first');
    manager.destroy();
  });

  it('traps focus, restores inert/scroll state and is idempotent', () => {
    const manager = createSurfaceManager();
    const trigger = document.querySelector('#background button');
    trigger.focus();
    const surface = mountSurface('sheet');
    manager.open({ id: 'sheet', ...surface, trigger, initialFocus: surface.first, requestClose: vi.fn() });

    expect(document.querySelector('#background').hasAttribute('inert')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.activeElement).toBe(surface.first);
    surface.last.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(surface.first);
    expect(manager.open({ id: 'sheet', ...surface })).toBe(manager.top());
    expect(manager.size()).toBe(1);

    expect(manager.close('sheet')).toBe(true);
    expect(manager.close('sheet')).toBe(false);
    expect(document.querySelector('#background').hasAttribute('inert')).toBe(false);
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(trigger);
    manager.destroy();
  });

  it('transfers shared backdrop ownership and handles history once', () => {
    const manager = createSurfaceManager();
    const sharedBackdrop = document.createElement('div');
    document.body.appendChild(sharedBackdrop);
    const first = mountSurface('first', false);
    const second = mountSurface('second', false);
    const push = vi.spyOn(history, 'pushState');
    const back = vi.spyOn(history, 'back').mockImplementation(() => {});
    manager.open({
      id: 'first', ...first, backdrop: sharedBackdrop,
      history: { key: 'surfaceToken', token: 'one', push: true },
    });
    expect(sharedBackdrop.dataset.surfaceOwner).toBe('first');
    expect(push).toHaveBeenCalledTimes(1);

    manager.open({ id: 'second', ...second, backdrop: sharedBackdrop });
    expect(sharedBackdrop.dataset.surfaceOwner).toBe('second');
    manager.close('second');
    expect(sharedBackdrop.dataset.surfaceOwner).toBe('first');
    manager.close('first');
    expect(sharedBackdrop.dataset.surfaceOwner).toBeUndefined();
    expect(back).toHaveBeenCalledTimes(1);
    push.mockRestore();
    back.mockRestore();
    manager.destroy();
  });

  it('reactivates a pre-mounted modal when opened over a sheet, then restores the sheet', () => {
    const manager = createSurfaceManager();
    const sheet = mountSurface('sheet');
    const confirm = mountSurface('confirm');
    manager.open({ id: 'sheet', ...sheet });
    expect(confirm.root.hasAttribute('inert')).toBe(true);
    manager.open({ id: 'confirm', ...confirm, trigger: sheet.last });
    expect(confirm.root.closest('[inert]')).toBeNull();
    expect(confirm.backdrop.closest('[inert]')).toBeNull();
    expect(sheet.root.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(confirm.first);

    manager.close('confirm');
    expect(sheet.root.closest('[inert]')).toBeNull();
    expect(confirm.root.hasAttribute('inert')).toBe(true);
    expect(document.querySelector('#background').hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(sheet.last);
    manager.close('sheet');
    expect(confirm.root.hasAttribute('inert')).toBe(false);
    manager.destroy();
  });

  it('reactivates ancestors of a phone editor nested in a previously inert background', () => {
    const manager = createSurfaceManager();
    const sheet = mountSurface('sheet');
    const editor = mountSurface('phone-editor');
    const phone = document.createElement('section');
    document.querySelector('#background').appendChild(phone);
    phone.append(editor.root, editor.backdrop);
    manager.open({ id: 'sheet', ...sheet });
    expect(editor.root.closest('[inert]')).not.toBeNull();
    manager.open({ id: 'phone-editor', ...editor });
    expect(editor.root.closest('[inert]')).toBeNull();
    expect(document.querySelector('#background > button').hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(editor.first);
    manager.close('phone-editor');
    expect(document.querySelector('#background').hasAttribute('inert')).toBe(true);
    expect(sheet.root.hasAttribute('inert')).toBe(false);
    manager.destroy();
  });

  it('preserves external inert state and keeps isolation when a lower surface closes first', () => {
    const manager = createSurfaceManager();
    const background = document.querySelector('#background');
    background.setAttribute('inert', '');
    const first = mountSurface('first');
    const second = mountSurface('second');
    manager.open({ id: 'first', ...first });
    manager.open({ id: 'second', ...second });
    manager.close('first');
    expect(document.activeElement).toBe(second.first);
    expect(first.root.hasAttribute('inert')).toBe(true);
    expect(second.root.hasAttribute('inert')).toBe(false);
    expect(second.root.style.getPropertyValue('--surface-depth')).toBe('0');
    expect(document.body.style.overflow).toBe('hidden');
    manager.close('second');
    expect(background.hasAttribute('inert')).toBe(true);
    expect(first.root.hasAttribute('inert')).toBe(false);
    expect(document.body.style.overflow).toBe('');
    manager.destroy();
  });

  it('excludes closed advanced fields from tab boundaries while keeping the summary reachable', () => {
    const manager = createSurfaceManager();
    const surface = mountSurface('advanced');
    const details = document.createElement('details');
    details.innerHTML = '<summary>Gelişmiş</summary><input aria-label="Gizli alan"><button>Gizli son eylem</button>';
    surface.dialog.appendChild(details);
    const summary = details.querySelector('summary');
    const hiddenAction = details.querySelector('button');
    manager.open({ id: 'advanced', ...surface });
    summary.focus();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(surface.first);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(summary);

    details.open = true;
    surface.first.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(hiddenAction);
    manager.destroy();
  });

  it('does not focus disabled fieldsets, hidden inputs, or inert descendants', () => {
    const manager = createSurfaceManager();
    const surface = mountSurface('inputs');
    surface.dialog.insertAdjacentHTML('afterbegin', '<fieldset disabled><button>Disabled</button></fieldset><input type="hidden"><div inert><button>Inert</button></div>');
    surface.dialog.insertAdjacentHTML('beforeend', '<button tabindex="-2">Programmatic only</button>');
    manager.open({ id: 'inputs', ...surface });
    expect(document.activeElement).toBe(surface.first);
    surface.last.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(surface.first);
    manager.destroy();
  });

  it('releases owned inert and scroll locking on destroy without navigating history', () => {
    const manager = createSurfaceManager();
    const surface = mountSurface('destroy');
    const back = vi.spyOn(history, 'back').mockImplementation(() => {});
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '7px';
    manager.open({ id: 'destroy', ...surface, history: { key: 'token', token: 'destroy', push: true } });
    manager.destroy();
    expect(document.querySelector('#background').hasAttribute('inert')).toBe(false);
    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.paddingRight).toBe('7px');
    expect(manager.size()).toBe(0);
    expect(back).not.toHaveBeenCalled();
    back.mockRestore();
  });
});
