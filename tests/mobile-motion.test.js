import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initMobile, openWorkspacePanel, returnToPreview } from '../js/ui/mobile.js';
import { animateElement } from '../js/ui/motion.js';
import { surfaceManager } from '../js/ui/surface-manager.js';

let animations, reduced, historyBack;
const byId = id => document.getElementById(id);
const latestOverlayAnimation = () => animations.filter(a => a.element.id === 'mobileOverlay').at(-1);
beforeEach(() => {
  document.body.innerHTML = new DOMParser().parseFromString(readFileSync('index.html', 'utf8'), 'text/html').body.innerHTML;
  document.body.classList.add('workspace-app');
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  reduced = false;
  window.matchMedia = vi.fn(query => ({ matches: query.includes('prefers-reduced-motion') && reduced }));
  animations = [];
  vi.stubGlobal('getComputedStyle', window.getComputedStyle.bind(window));
  Element.prototype.animate = vi.fn(function (frames, options) {
    const animation = { element: this, frames, options, onfinish: null, cancel: vi.fn() };
    animations.push(animation);
    return animation;
  });
  historyBack = vi.spyOn(history, 'back').mockImplementation(() => {});
  initMobile();
});
afterEach(() => {
  returnToPreview();
  delete Element.prototype.animate;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('cancellable mobile navigation', () => {
  it('keeps the draft, portal and focus lock until the exit completes', () => {
    const trigger = byId('headerMenuBtn');
    const input = byId('pName');
    const panel = byId('group');
    const parent = panel.parentNode;
    openWorkspacePanel('group', trigger);
    input.value = 'Taslak';
    byId('mobileOverlayBody').scrollTop = 93;
    byId('mobileOverlayBack').click();
    expect(byId('mobileOverlay').classList.contains('is-closing')).toBe(true);
    expect(byId('mobileOverlayBody').contains(panel)).toBe(true);
    expect(surfaceManager.isTop('mobile-overlay')).toBe(true);
    expect(parent.hasAttribute('inert')).toBe(true);
    latestOverlayAnimation().onfinish();
    expect(panel.parentNode).toBe(parent);
    expect(byId('mobileOverlay').getAttribute('aria-hidden')).toBe('true');
    expect(parent.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(historyBack).toHaveBeenCalledTimes(1);
    openWorkspacePanel('group', trigger);
    expect(byId('pName')).toBe(input);
    expect(input.value).toBe('Taslak');
    expect(byId('mobileOverlayBody').scrollTop).toBe(93);
  });

  it('cancels an old exit so its completion cannot remove a newly opened panel', () => {
    openWorkspacePanel('group');
    byId('mobileOverlayBack').click();
    const exit = latestOverlayAnimation();
    const staleFinish = exit.onfinish;
    openWorkspacePanel('settings');
    staleFinish();
    expect(exit.cancel).toHaveBeenCalled();
    expect(byId('mobileOverlayBody').contains(byId('settings'))).toBe(true);
    expect(byId('mobileOverlay').classList.contains('is-open')).toBe(true);
    expect(byId('mobileOverlay').classList.contains('is-closing')).toBe(false);
    expect(historyBack).not.toHaveBeenCalled();
  });

  it('honors history back during an exit without navigating back twice', () => {
    openWorkspacePanel('group');
    byId('mobileOverlayBack').click();
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    latestOverlayAnimation().onfinish();
    expect(historyBack).not.toHaveBeenCalled();
    expect(byId('mobileOverlay').getAttribute('aria-hidden')).toBe('true');
  });

  it('does not let the previous close history event dismiss the next editor', () => {
    openWorkspacePanel('group');
    byId('mobileOverlayBack').click();
    latestOverlayAnimation().onfinish();
    expect(historyBack).toHaveBeenCalledTimes(1);
    openWorkspacePanel('settings');
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    expect(byId('mobileOverlayBody').contains(byId('settings'))).toBe(true);
    expect(byId('mobileOverlay').classList.contains('is-closing')).toBe(false);
    expect(history.state.mobileOverlayToken).toBeTruthy();
    byId('mobileOverlayBack').click();
    latestOverlayAnimation().onfinish();
    expect(historyBack).toHaveBeenCalledTimes(2);
  });

  it('forces synchronous cleanup for playback/export/recording, even mid-exit', () => {
    openWorkspacePanel('group');
    byId('mobileOverlayBack').click();
    const staleFinish = latestOverlayAnimation().onfinish;
    returnToPreview();
    expect(byId('mobileOverlayBody').childElementCount).toBe(0);
    expect(byId('mobileOverlay').getAttribute('aria-hidden')).toBe('true');
    openWorkspacePanel('settings');
    staleFinish();
    expect(byId('mobileOverlayBody').contains(byId('settings'))).toBe(true);
  });

  it('closes immediately with reduced motion and does not start animations', () => {
    reduced = true;
    openWorkspacePanel('group');
    byId('mobileOverlayBack').click();
    expect(animations).toHaveLength(0);
    expect(byId('mobileOverlay').getAttribute('aria-hidden')).toBe('true');
    expect(surfaceManager.size()).toBe(0);
  });
});

describe('motion primitive', () => {
  it('uses the shared timing and releases the filled effect before completion', () => {
    const element = byId('mobileOverlay');
    element.style.setProperty('--motion-screen-duration', '0.24s');
    element.style.setProperty('--motion-ease', 'ease-out');
    const finish = vi.fn(() => expect(animations[0].cancel).toHaveBeenCalled());
    animateElement(element, [{ opacity: 0 }, { opacity: 1 }], { onFinish: finish });
    expect(animations[0].options).toEqual({ duration: 240, easing: 'ease-out', fill: 'both' });
    animations[0].onfinish();
    expect(finish).toHaveBeenCalledTimes(1);
  });
  it('falls back to immediate completion when Web Animations is unavailable', () => {
    const element = byId('mobileOverlay');
    element.animate = undefined;
    const finish = vi.fn();
    animateElement(element, [], { onFinish: finish })();
    expect(finish).toHaveBeenCalledTimes(1);
  });
});
