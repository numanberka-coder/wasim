import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { state } from '../js/state.js';
import {
  getPhoneShellState,
  initPhoneShell,
  setActivePhoneTab,
  showPhoneChatDetail,
  showPhoneHome,
  stopPhoneMotion,
} from '../js/phone/app-shell.js';

const motion = vi.hoisted(() => ({ animate: vi.fn(), cancellations: [] }));
vi.mock('../js/ui/motion.js', () => ({ animateElement: (...args) => motion.animate(...args) }));

describe('Phone navigation motion', () => {
  beforeEach(() => {
    state.reset();
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
    document.body.innerHTML = new DOMParser().parseFromString(html, 'text/html').body.innerHTML;
    window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    motion.animate.mockReset();
    motion.cancellations.length = 0;
    motion.animate.mockImplementation(() => {
      const cancel = vi.fn();
      motion.cancellations.push(cancel);
      return cancel;
    });
    initPhoneShell();
    setActivePhoneTab('chats', { animate: false });
    motion.animate.mockClear();
  });

  it('does not animate initialization, repeated rendering or an explicit instant transition', () => {
    initPhoneShell();
    showPhoneHome();
    setActivePhoneTab('chats');
    expect(motion.animate).not.toHaveBeenCalled();

    showPhoneChatDetail({ animate: false });
    showPhoneChatDetail();
    expect(motion.animate).not.toHaveBeenCalled();
    expect(getPhoneShellState().view).toBe('chat');
  });

  it('uses opposite directions for entering chat and returning home without delaying accessibility', () => {
    showPhoneChatDetail({ focus: true });
    const [detail, forwardFrames, forwardOptions] = motion.animate.mock.calls[0];
    expect(detail.id).toBe('phoneChatDetail');
    expect(forwardFrames[0].transform).toBe('translate3d(24px, 0, 0)');
    expect(forwardOptions.duration).toBe(300);
    expect(document.querySelector('.phone').dataset.phoneView).toBe('chat');
    expect(document.getElementById('phoneHomeShell').getAttribute('aria-hidden')).toBe('true');
    expect(document.getElementById('phoneChatDetail').getAttribute('aria-hidden')).toBeNull();
    expect(document.activeElement.id).toBe('phoneChatBackBtn');

    showPhoneHome({ focus: true });
    const [home, backFrames] = motion.animate.mock.calls[1];
    expect(home.id).toBe('phoneHomeShell');
    expect(backFrames[0].transform).toBe('translate3d(-18px, 0, 0)');
    expect(document.activeElement.hasAttribute('data-phone-open-chat')).toBe(true);
    expect(document.getElementById('phoneChatDetail').getAttribute('aria-hidden')).toBe('true');
  });

  it('cancels superseded screen and tab motion while keeping one current view', () => {
    showPhoneChatDetail();
    showPhoneHome();
    expect(motion.cancellations[0]).toHaveBeenCalledOnce();
    setActivePhoneTab('calls');
    expect(motion.cancellations[1]).toHaveBeenCalledOnce();
    setActivePhoneTab('updates');
    expect(motion.cancellations[2]).toHaveBeenCalledOnce();
    expect(getPhoneShellState()).toMatchObject({ view: 'home', activeTab: 'updates' });
    const visiblePanels = [...document.querySelectorAll('[data-phone-tab-panel]')].filter((panel) => !panel.hidden);
    expect(visiblePanels.map((panel) => panel.dataset.phoneTabPanel)).toEqual(['updates']);
    expect(document.querySelectorAll('#phoneChatDetail')).toHaveLength(1);
    expect(document.querySelectorAll('#phoneHomeShell')).toHaveLength(1);
  });

  it('moves tab content according to tab order, never animating hidden home content', () => {
    setActivePhoneTab('calls');
    const [calls, forwardFrames, options] = motion.animate.mock.calls[0];
    expect(calls.dataset.phoneTabPanel).toBe('calls');
    expect(forwardFrames[0].transform).toBe('translate3d(18px, 0, 0)');
    expect(options.duration).toBe(200);
    setActivePhoneTab('updates');
    expect(motion.animate.mock.calls[1][1][0].transform).toBe('translate3d(-18px, 0, 0)');

    showPhoneChatDetail();
    motion.animate.mockClear();
    setActivePhoneTab('chats');
    expect(motion.animate).not.toHaveBeenCalled();
  });

  it('reads shared timing tokens and preserves conversation data across animated navigation', () => {
    document.getElementById('phoneChatDetail').style.setProperty('--motion-screen-duration', '.2s');
    document.getElementById('phoneChatDetail').style.setProperty('--motion-ease', 'ease-out');
    const before = state.export();
    showPhoneChatDetail();
    expect(motion.animate.mock.calls[0][2]).toEqual({ duration: 200, easing: 'ease-out' });
    showPhoneHome();
    expect(state.export()).toEqual(before);
  });

  it('settles the current view for capture without changing selection or data', () => {
    showPhoneChatDetail();
    const before = state.export();
    stopPhoneMotion();
    expect(motion.cancellations[0]).toHaveBeenCalledOnce();
    expect(getPhoneShellState().view).toBe('chat');
    expect(state.export()).toEqual(before);
  });
});
