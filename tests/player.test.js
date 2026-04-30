/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Player modülü çok fazla DOM bağımlılığı var.
// Temel mantık testleri: getBaseDelay, handleEvent akışı
// DOM heavy kısımlar mock'lanıyor.

describe('Player', () => {
  let player, state, EventType;

  beforeEach(async () => {
    vi.resetModules();

    // Set up minimal DOM elements player needs
    document.body.innerHTML = `
      <div id="chatBody"></div>
      <div id="headerStatus"></div>
      <textarea id="scriptBox"></textarea>
      <input id="speed" value="900" />
      <input id="jitter" value="250" />
      <select id="manualSender"><option value="Me">Me</option></select>
      <input id="liveInput" value="" />
      <button id="mainActionBtn"></button>
      <button id="attachBtn"></button>
      <button id="cameraBtn"></button>
      <input id="composerFileInput" type="file" />
    `;

    const stateModule = await import('../js/state.js');
    state = stateModule.state;
    state.reset();

    const parserModule = await import('../js/features/script-parser.js');
    EventType = parserModule.EventType;

    const playerModule = await import('../js/features/player.js');
    player = playerModule;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('getBaseDelay', () => {
    it('returns a number >= MIN_DELAY', () => {
      const delay = player.getBaseDelay();
      expect(delay).toBeGreaterThanOrEqual(80);
    });

    it('uses player speed setting', () => {
      state.get('player').speed = 500;
      state.get('player').jitter = 0;
      const delay = player.getBaseDelay();
      expect(delay).toBe(500);
    });

    it('adds jitter variation', () => {
      state.get('player').speed = 500;
      state.get('player').jitter = 100;
      const delays = Array.from({ length: 50 }, () => player.getBaseDelay());
      // With jitter, we should see variation
      const unique = new Set(delays);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe('handleEvent', () => {
    it('handles ADD event', () => {
      const callback = vi.fn();
      player.handleEvent({ type: EventType.ADD, who: 'Ali' }, callback);
      expect(state.isActive('Ali')).toBe(true);
      expect(callback).toHaveBeenCalled();
    });

    it('handles LEAVE event', () => {
      state.addActive('Ali');
      const callback = vi.fn();
      player.handleEvent({ type: EventType.LEAVE, who: 'Ali' }, callback);
      expect(state.isActive('Ali')).toBe(false);
      expect(callback).toHaveBeenCalled();
    });

    it('handles SYSTEM event', () => {
      const callback = vi.fn();
      player.handleEvent({ type: EventType.SYSTEM, text: 'Test mesajı' }, callback);
      expect(callback).toHaveBeenCalled();
      // System messages go to DOM, not state.messages
      const chat = document.getElementById('chatBody');
      const sysMsg = chat.querySelector('.system-msg');
      expect(sysMsg).not.toBe(null);
    });

    it('handles TICK_STATUS event', () => {
      const callback = vi.fn();
      player.handleEvent({ type: EventType.TICK_STATUS, status: 'delivered' }, callback);
      expect(callback).toHaveBeenCalled();
    });

    it('handles TYPING event with active user', () => {
      vi.useFakeTimers();
      state.addActive('Ali');
      const callback = vi.fn();
      player.handleEvent({ type: EventType.TYPING, who: 'Ali', ms: 500 }, callback);
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('skips TYPING for inactive non-Me user', () => {
      const callback = vi.fn();
      player.handleEvent({ type: EventType.TYPING, who: 'Ali', ms: 500 }, callback);
      expect(callback).toHaveBeenCalled(); // Should be called immediately (skipped)
    });

    it('handles MESSAGE event for Me', () => {
      vi.useFakeTimers();
      const callback = vi.fn();
      player.handleEvent({
        type: EventType.MESSAGE,
        who: 'Me',
        text: 'Merhaba!',
      }, callback);
      // Should wait for typing animation
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(5000); // enough time for typing
      expect(callback).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('calls onComplete with no callback (default)', () => {
      // Should not throw when no callback provided
      expect(() => {
        player.handleEvent({ type: EventType.SYSTEM, text: 'Test' });
      }).not.toThrow();
    });
  });

  describe('loadScript', () => {
    it('keeps valid lines and reports parser issues', () => {
      document.getElementById('scriptBox').value = `@add Ali
@typing Ali abc
@bad nope
Ali: Merhaba!
Veli: `;

      const result = player.loadScript();
      const queue = state.get('player').queue;

      expect(queue).toHaveLength(3);
      expect(queue[1]).toEqual({
        type: EventType.TYPING,
        who: 'Ali',
        ms: 800,
      });
      expect(result.summary).toMatchObject({
        eventCount: 3,
        errors: 2,
        warnings: 1,
      });
      expect(result.issues.map(issue => issue.line)).toEqual([2, 3, 5]);
    });
  });

  describe('pause', () => {
    it('sets paused state', () => {
      player.pause();
      expect(state.get('player').paused).toBe(true);
    });
  });

  describe('reset', () => {
    it('clears player state', () => {
      state.addActive('Ali');
      state.addMessage({ speaker: 'Ali', text: 'test' });
      player.reset();
      expect(state.isActive('Ali')).toBe(false);
      expect(state.get('messages')).toEqual([]);
      expect(state.get('player').queue).toEqual([]);
    });
  });
});
