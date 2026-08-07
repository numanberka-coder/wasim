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
});
