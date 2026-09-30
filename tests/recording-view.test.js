import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import {
  initRecordingView, enterRecordingView, exitRecordingView,
  toggleRecordingView, isRecordingViewActive,
} from '../js/ui/recording-view.js';

let controller;
let fullscreenElement;
let beforeEnter;
let onExit;

function nativeFullscreen(element) {
  fullscreenElement = element;
  document.dispatchEvent(new Event('fullscreenchange'));
}

beforeEach(() => {
  document.body.innerHTML = `
    <header class="workspace-topbar"><button id="capture">Kayıt görünümü</button></header>
    <div class="app-container"><aside class="panel-left"><input value="Taslak"></aside>
      <main class="stage"><div class="phone"><div class="status-bar"><span>12:00</span></div>
        <div class="chat-body">Önizleme</div></div></main></div>
    <nav class="workspace-workbar"></nav>`;
  fullscreenElement = null;
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true, get: () => fullscreenElement,
  });
  Object.defineProperty(document.documentElement, 'requestFullscreen', {
    configurable: true, writable: true, value: undefined,
  });
  Object.defineProperty(document, 'exitFullscreen', {
    configurable: true, value: vi.fn(async () => nativeFullscreen(null)),
  });
  beforeEnter = vi.fn();
  onExit = vi.fn();
  controller = initRecordingView({ beforeEnter, onExit });
});

afterEach(async () => {
  await controller.dispose();
  vi.restoreAllMocks();
});

describe('Clean recording view', () => {
  it('enters CSS-only capture and restores the edit trigger without changing the draft', async () => {
    const trigger = document.querySelector('#capture');
    trigger.focus();
    await enterRecordingView();
    expect(beforeEnter).toHaveBeenCalledTimes(1);
    expect(document.body.classList.contains('recording-view')).toBe(true);
    expect(document.querySelector('.app-container').classList.contains('phone-only-mode')).toBe(true);
    expect(document.activeElement).not.toBe(trigger);
    expect(await toggleRecordingView()).toBe(true);
    expect(isRecordingViewActive()).toBe(false);
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(trigger);
    expect(document.querySelector('input').value).toBe('Taslak');
  });

  it('requests native fullscreen once and follows native exit', async () => {
    document.documentElement.requestFullscreen = vi.fn(async () => {
      nativeFullscreen(document.documentElement);
    });
    await enterRecordingView();
    await enterRecordingView();
    expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
    expect(document.documentElement.requestFullscreen).toHaveBeenCalledWith({ navigationUI: 'hide' });
    nativeFullscreen(null);
    expect(isRecordingViewActive()).toBe(false);
    expect(document.body.classList.contains('recording-view')).toBe(false);
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('uses a clean fallback when the native API rejects the request', async () => {
    document.documentElement.requestFullscreen = vi.fn().mockRejectedValue(new Error('Denied'));
    expect(await enterRecordingView()).toBe(true);
    expect(isRecordingViewActive()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(isRecordingViewActive()).toBe(false);
  });

  it('synchronizes mobile page fullscreen started by the browser', () => {
    nativeFullscreen(document.documentElement);
    expect(isRecordingViewActive()).toBe(true);
    expect(beforeEnter).toHaveBeenCalledTimes(1);
    nativeFullscreen(null);
    expect(isRecordingViewActive()).toBe(false);
  });

  it('uses the compact workspace breakpoint on a tablet', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 900 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 700 });
    nativeFullscreen(document.documentElement);
    expect(isRecordingViewActive()).toBe(true);
  });

  it('does not turn ordinary desktop or unrelated element fullscreen into phone capture', () => {
    nativeFullscreen(document.querySelector('aside'));
    expect(isRecordingViewActive()).toBe(false);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
    nativeFullscreen(document.documentElement);
    expect(isRecordingViewActive()).toBe(false);
  });

  it('leaves capture active while the window loses focus', async () => {
    await enterRecordingView();
    window.dispatchEvent(new Event('blur'));
    document.dispatchEvent(new Event('visibilitychange'));
    expect(isRecordingViewActive()).toBe(true);
  });

  it('provides a double-tap exit on the simulated status bar without adding visible controls', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1000);
    await enterRecordingView();
    const clock = document.querySelector('.status-bar span');
    clock.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, button: 0 }));
    expect(isRecordingViewActive()).toBe(true);
    now.mockReturnValue(1400);
    clock.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, button: 0 }));
    expect(isRecordingViewActive()).toBe(false);
    expect(document.querySelectorAll('button')).toHaveLength(1);
  });

  it('requires consecutive status taps within 500 ms', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1000);
    await enterRecordingView();
    const bar = document.querySelector('.status-bar');
    bar.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    now.mockReturnValue(1600);
    bar.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    expect(isRecordingViewActive()).toBe(true);
  });

  it('does not re-enter after leaving while a native request is still pending', async () => {
    let resolveRequest;
    document.documentElement.requestFullscreen = vi.fn(() => new Promise(resolve => {
      resolveRequest = resolve;
    }));
    const entry = enterRecordingView();
    await exitRecordingView();
    nativeFullscreen(document.documentElement);
    expect(isRecordingViewActive()).toBe(false);
    resolveRequest();
    await entry;
    expect(isRecordingViewActive()).toBe(false);
    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
  });
});
