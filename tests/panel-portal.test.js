import { beforeEach, describe, expect, it } from 'vitest';
import { createPanelPortal } from '../js/ui/panel-portal.js';

describe('Faz 59 PanelPortal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('restores parent, order, style, aria, class and scroll exactly', () => {
    const parent = document.createElement('div');
    const before = document.createElement('span');
    const panel = document.createElement('section');
    const after = document.createElement('span');
    const target = document.createElement('div');
    panel.id = 'settings';
    panel.className = 'panel active';
    panel.setAttribute('style', 'display: none; color: red;');
    panel.setAttribute('aria-hidden', 'true');
    panel.scrollTop = 11;
    parent.append(before, panel, after);
    document.body.append(parent, target);
    const portal = createPanelPortal(panel);

    expect(portal.mount(target)).toBe(true);
    panel.className = 'panel changed';
    panel.style.display = 'block';
    panel.removeAttribute('aria-hidden');
    panel.scrollTop = 99;
    expect(portal.restore()).toBe(true);

    expect([...parent.children]).toEqual([before, panel, after]);
    expect(panel.className).toBe('panel active');
    expect(panel.getAttribute('style')).toBe('display: none; color: red;');
    expect(panel.getAttribute('aria-hidden')).toBe('true');
    expect(panel.scrollTop).toBe(11);
    expect(portal.restore()).toBe(false);
  });

  it('supports repeated mount/restore and a removed sibling without orphaning the panel', () => {
    const parent = document.createElement('div');
    const panel = document.createElement('section');
    const sibling = document.createElement('span');
    const target = document.createElement('div');
    parent.append(panel, sibling);
    document.body.append(parent, target);
    const portal = createPanelPortal(panel);

    portal.mount(target);
    sibling.remove();
    portal.restore();
    expect(panel.parentNode).toBe(parent);
    portal.mount(target);
    portal.restore();
    expect(panel.parentNode).toBe(parent);
    expect(document.body.contains(panel)).toBe(true);
  });
});
