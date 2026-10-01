import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initVisualViewport } from '../js/ui/visual-viewport.js';

let viewport, frames, dispose, body, message, actions, liveInput, sendButton;
const flush = () => { const pending = frames.splice(0); pending.forEach(fn => fn()); };
const rect = (top, height) => ({ top, bottom: top + height, height, left: 0, right: 390, width: 390 });
const css = name => document.documentElement.style.getPropertyValue(name);
beforeEach(() => {
  document.body.innerHTML = '<div class="mobile-overlay-body"><div class="mobile-script-composer"><textarea id="message">Taslak</textarea><div class="mobile-script-composer-actions">Kaydet</div></div></div><input id="phoneInput"><div class="phone"><div class="chat-input"><input id="liveInput"><button id="sendButton">Gönder</button></div></div>';
  body = document.querySelector('.mobile-overlay-body');
  message = document.getElementById('message');
  actions = document.querySelector('.mobile-script-composer-actions');
  liveInput = document.getElementById('liveInput');
  sendButton = document.getElementById('sendButton');
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
  document.documentElement.classList.remove('keyboard-open', 'phone-keyboard-open');
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
    expect(css('--keyboard-height')).toBe('380px');
    expect(document.documentElement.classList.contains('keyboard-open')).toBe(true);
    viewport.height = 800;
    viewport.offsetTop = 0;
    viewport.dispatchEvent(new Event('resize'));
    flush();
    expect(css('--visual-viewport-height')).toBe('800px');
    expect(css('--visual-viewport-top')).toBe('0px');
    expect(document.documentElement.classList.contains('keyboard-open')).toBe(false);
  });

  it('keeps the phone keyboard open when the visual viewport pans and restores it on close', () => {
    dispose = initVisualViewport();
    liveInput.focus();
    viewport.height = 420;
    viewport.offsetTop = 380;
    viewport.dispatchEvent(new Event('resize'));
    viewport.dispatchEvent(new Event('scroll'));
    flush();
    expect(css('--visual-viewport-height')).toBe('420px');
    expect(css('--visual-viewport-top')).toBe('380px');
    expect(css('--keyboard-height')).toBe('380px');
    expect(document.documentElement.classList.contains('keyboard-open')).toBe(true);
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(true);
    expect(body.scrollTop).toBe(0);
    viewport.height = 800;
    viewport.offsetTop = 0;
    viewport.dispatchEvent(new Event('resize'));
    flush();
    expect(css('--keyboard-height')).toBe('0px');
    expect(css('--visual-viewport-height')).toBe('800px');
    expect(css('--visual-viewport-top')).toBe('0px');
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(false);
  });

  it('preserves the phone keyboard layout during blur and send-button focus', () => {
    dispose = initVisualViewport();
    viewport.height = 420;
    liveInput.focus();
    flush();
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(true);
    liveInput.blur();
    expect(frames).toHaveLength(1);
    flush();
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(true);
    sendButton.focus();
    flush();
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(true);
  });

  it('clears the phone keyboard layout when an editor or unrelated input receives focus', () => {
    dispose = initVisualViewport();
    viewport.height = 420;
    liveInput.focus();
    flush();
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(true);
    message.focus();
    flush();
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(false);
    expect(document.documentElement.classList.contains('keyboard-open')).toBe(true);
    liveInput.focus();
    flush();
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(true);
    document.getElementById('phoneInput').focus();
    flush();
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(false);
  });

  it('clears the phone keyboard layout during pinch zoom or desktop resize', () => {
    dispose = initVisualViewport();
    viewport.height = 420;
    liveInput.focus();
    flush();
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(true);
    viewport.scale = 1.5;
    viewport.dispatchEvent(new Event('resize'));
    flush();
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(false);
    viewport.scale = 1;
    viewport.dispatchEvent(new Event('resize'));
    flush();
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(true);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    window.dispatchEvent(new Event('resize'));
    flush();
    expect(document.documentElement.classList.contains('phone-keyboard-open')).toBe(false);
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

  it.each(['textarea', 'input'])('keeps a focused message-edit modal %s inside its own scroll body', tag => {
    const modal = document.createElement('div');
    modal.className = 'app-modal message-edit-modal';
    modal.innerHTML = `<div class="app-modal-body"><${tag}></${tag}></div><div class="app-modal-footer">Kaydet</div>`;
    document.body.appendChild(modal);
    const modalBody = modal.querySelector('.app-modal-body');
    const field = modal.querySelector(tag);
    const footer = modal.querySelector('.app-modal-footer');
    field.value = 'Taslak değişmeden kalmalı';
    // The layout viewport stays fixed while the keyboard shrinks and pans the visual viewport.
    modalBody.getBoundingClientRect = () => rect(80, 660);
    field.getBoundingClientRect = () => rect(650 - modalBody.scrollTop, 80);
    footer.getBoundingClientRect = () => rect(740, 60);
    dispose = initVisualViewport();
    field.focus();
    viewport.height = 420;
    viewport.offsetTop = 120;
    viewport.dispatchEvent(new Event('resize'));
    viewport.dispatchEvent(new Event('scroll'));
    flush();
    expect(field.getBoundingClientRect().top).toBeGreaterThanOrEqual(viewport.offsetTop + 12);
    expect(field.getBoundingClientRect().bottom).toBe(viewport.offsetTop + viewport.height - 12);
    expect(modalBody.scrollTop).toBe(202);
    expect(modal.scrollTop).toBe(0);
    expect(body.scrollTop).toBe(0);
    expect(field.value).toBe('Taslak değişmeden kalmalı');
    expect(document.activeElement).toBe(field);
  });

  it('leaves unrelated app-modal bodies untouched when their inputs receive focus', () => {
    const modal = document.createElement('div');
    modal.className = 'app-modal';
    modal.innerHTML = '<div class="app-modal-body"><input value="Unrelated draft"></div>';
    document.body.appendChild(modal);
    const modalBody = modal.querySelector('.app-modal-body');
    const field = modal.querySelector('input');
    modalBody.getBoundingClientRect = () => rect(80, 660);
    field.getBoundingClientRect = () => rect(650 - modalBody.scrollTop, 80);
    dispose = initVisualViewport();
    field.focus();
    viewport.height = 420;
    viewport.offsetTop = 120;
    viewport.dispatchEvent(new Event('resize'));
    flush();
    expect(modalBody.scrollTop).toBe(0);
    expect(modal.scrollTop).toBe(0);
    expect(body.scrollTop).toBe(0);
    expect(field.value).toBe('Unrelated draft');
    expect(document.activeElement).toBe(field);
  });

  it('reduces the message-modal inset when its short scroll body can just fit the field', () => {
    const modal = document.createElement('div');
    modal.className = 'app-modal message-edit-modal';
    modal.innerHTML = '<div class="app-modal-body"><input value="Short-body draft"></div>';
    document.body.appendChild(modal);
    const modalBody = modal.querySelector('.app-modal-body');
    const field = modal.querySelector('input');
    modalBody.getBoundingClientRect = () => rect(400, 49);
    field.getBoundingClientRect = () => rect(650 - modalBody.scrollTop, 42);
    dispose = initVisualViewport();
    field.focus();
    viewport.height = 420;
    viewport.offsetTop = 120;
    viewport.dispatchEvent(new Event('resize'));
    flush();
    expect(field.getBoundingClientRect().top).toBe(403.5);
    expect(field.getBoundingClientRect().bottom).toBe(445.5);
    expect(modalBody.scrollTop).toBe(246.5);
    expect(body.scrollTop).toBe(0);
    expect(field.value).toBe('Short-body draft');
    expect(document.activeElement).toBe(field);
  });

  it('steadily anchors an oversized message-modal field at the visible top across repeated resize events', () => {
    const modal = document.createElement('div');
    modal.className = 'app-modal message-edit-modal';
    modal.innerHTML = '<div class="app-modal-body"><textarea>Oversized draft</textarea></div>';
    document.body.appendChild(modal);
    const modalBody = modal.querySelector('.app-modal-body');
    const field = modal.querySelector('textarea');
    modalBody.getBoundingClientRect = () => rect(400, 49);
    field.getBoundingClientRect = () => rect(650 - modalBody.scrollTop, 90);
    dispose = initVisualViewport();
    field.focus();
    viewport.height = 420;
    viewport.offsetTop = 120;
    for (let i = 0; i < 3; i += 1) {
      viewport.dispatchEvent(new Event('resize'));
      flush();
      expect(field.getBoundingClientRect().top).toBe(400);
      expect(modalBody.scrollTop).toBe(250);
    }
    expect(body.scrollTop).toBe(0);
    expect(field.value).toBe('Oversized draft');
    expect(document.activeElement).toBe(field);
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
