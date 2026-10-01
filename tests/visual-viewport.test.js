import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initVisualViewport } from '../js/ui/visual-viewport.js';

let viewport, frames, dispose, body, message, actions;
const flush = () => { const pending = frames.splice(0); pending.forEach(fn => fn()); };
const rect = (top, height) => ({ top, bottom: top + height, height, left: 0, right: 390, width: 390 });
const css = name => document.documentElement.style.getPropertyValue(name);
beforeEach(() => {
  document.body.innerHTML = '<div class="mobile-overlay-body"><div class="mobile-script-composer"><textarea id="message">Taslak</textarea><div class="mobile-script-composer-actions">Kaydet</div></div></div><input id="phoneInput">';
  body = document.querySelector('.mobile-overlay-body');
  message = document.getElementById('message');
  actions = document.querySelector('.mobile-script-composer-actions');
  viewport = Object.assign(new EventTarget(), { height: 800, offsetTop: 0, scale: 1 });
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  body.getBoundingClientRect = () => rect(viewport.offsetTop + 56, viewport.height - 56);
  message.getBoundingClientRect = () => rect(650 - body.scrollTop, 80);
  actions.getBoundingClientRect = () => rect(Math.min(message.getBoundingClientRect().bottom + 16,
    viewport.offsetTop + viewport.height - 66 - (parseFloat(body.style.paddingBottom) || 0)), 66);
  frames = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn(fn => { frames.push(fn); return frames.length; }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => {
  dispose?.();
  dispose = null;
  vi.unstubAllGlobals();
  document.documentElement.classList.remove('keyboard-open');
  for (const name of ['--visual-viewport-height', '--visual-viewport-top', '--keyboard-height']) document.documentElement.style.removeProperty(name);
});

describe('software keyboard viewport', () => {
  it('coalesces resize events using the final keyboard size and restores it on close', () => {
    dispose = initVisualViewport();
    viewport.height = 620;
    viewport.dispatchEvent(new Event('resize'));
    viewport.height = 500;
    viewport.dispatchEvent(new Event('resize'));
    viewport.height = 420;
    viewport.offsetTop = 24;
    viewport.dispatchEvent(new Event('scroll'));
    expect(frames).toHaveLength(1);
    flush();
    expect(css('--visual-viewport-height')).toBe('420px');
    expect(css('--visual-viewport-top')).toBe('24px');
    expect(css('--keyboard-height')).toBe('356px');
    expect(document.documentElement.classList.contains('keyboard-open')).toBe(true);
    viewport.height = 800;
    viewport.offsetTop = 0;
    viewport.dispatchEvent(new Event('resize'));
    flush();
    expect(css('--visual-viewport-height')).toBe('800px');
    expect(css('--visual-viewport-top')).toBe('0px');
    expect(document.documentElement.classList.contains('keyboard-open')).toBe(false);
  });

  it('keeps the focused message and actions above the keyboard without changing the draft', () => {
    dispose = initVisualViewport();
    message.focus();
    viewport.height = 420;
    viewport.offsetTop = 24;
    viewport.dispatchEvent(new Event('resize'));
    flush();
    expect(message.getBoundingClientRect().top).toBeGreaterThanOrEqual(body.getBoundingClientRect().top + 12);
    expect(message.getBoundingClientRect().bottom).toBeLessThanOrEqual(body.getBoundingClientRect().bottom - 66 - 12);
    expect(actions.getBoundingClientRect().bottom).toBeLessThanOrEqual(body.getBoundingClientRect().bottom);
    expect(message.value).toBe('Taslak');
    expect(document.activeElement).toBe(message);
  });

  it('adjusts an editor field above the visible top by scrolling only its own body', () => {
    body.scrollTop = 630;
    message.focus();
    dispose = initVisualViewport();
    expect(message.getBoundingClientRect().top).toBe(68);
    expect(body.scrollTop).toBe(582);
  });

  it('reserves the scroll body padding so sticky actions cannot cover the last text line', () => {
    body.style.paddingBottom = '24px';
    dispose = initVisualViewport();
    message.focus();
    viewport.height = 420;
    viewport.dispatchEvent(new Event('resize'));
    flush();
    expect(message.getBoundingClientRect().bottom).toBeLessThanOrEqual(actions.getBoundingClientRect().top - 12);
  });

  it('does not treat pinch zoom as a keyboard or scroll the editor', () => {
    dispose = initVisualViewport();
    message.focus();
    viewport.height = 320;
    viewport.scale = 1.5;
    viewport.offsetTop = 100;
    viewport.dispatchEvent(new Event('resize'));
    flush();
    expect(css('--visual-viewport-height')).toBe('800px');
    expect(css('--visual-viewport-top')).toBe('0px');
    expect(css('--keyboard-height')).toBe('0px');
    expect(body.scrollTop).toBe(0);
  });

  it('leaves phone inputs and desktop panel scroll untouched', () => {
    dispose = initVisualViewport();
    document.getElementById('phoneInput').focus();
    viewport.height = 420;
    viewport.dispatchEvent(new Event('resize'));
    flush();
    expect(body.scrollTop).toBe(0);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    message.focus();
    flush();
    expect(body.scrollTop).toBe(0);
  });

  it('works without VisualViewport and disposes pending work/listeners', () => {
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined });
    dispose = initVisualViewport();
    expect(css('--visual-viewport-height')).toBe('800px');
    window.dispatchEvent(new Event('resize'));
    expect(frames).toHaveLength(1);
    dispose();
    dispose = null;
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
    frames.length = 0;
    window.dispatchEvent(new Event('resize'));
    expect(frames).toHaveLength(0);
  });
});
