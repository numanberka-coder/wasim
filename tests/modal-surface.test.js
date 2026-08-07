import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openModal } from '../js/ui/modal.js';
import { surfaceManager } from '../js/ui/surface-manager.js';

describe('Faz 59 modal surface integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<main id="appBackground"><button id="trigger">Aç</button></main>';
    document.querySelector('#trigger').focus();
  });

  afterEach(() => {
    while (surfaceManager.top()?.id?.startsWith('app-modal-')) {
      surfaceManager.close(surfaceManager.top().id, { restoreFocus: false });
    }
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('uses labelled dialogs, focus management, inert background and nested LIFO close', () => {
    const lower = openModal({ title: 'Alt modal', buttons: [{ label: 'Kapat' }] });
    const upper = openModal({ title: 'Üst modal', buttons: [{ label: 'Tamam' }] });

    expect(lower.card.getAttribute('aria-labelledby')).toBe(`${lower.surfaceId}-title`);
    expect(upper.card.getAttribute('aria-labelledby')).toBe(`${upper.surfaceId}-title`);
    expect(document.querySelector('#appBackground').hasAttribute('inert')).toBe(true);
    expect(surfaceManager.top().id).toBe(upper.surfaceId);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(surfaceManager.top().id).toBe(lower.surfaceId);
    expect(lower.overlay.isConnected).toBe(true);
    vi.advanceTimersByTime(200);
    expect(upper.overlay.isConnected).toBe(false);

    lower.close('test');
    vi.advanceTimersByTime(200);
    expect(surfaceManager.size()).toBe(0);
    expect(document.querySelector('#appBackground').hasAttribute('inert')).toBe(false);
    expect(document.activeElement.id).toBe('trigger');
  });
});
