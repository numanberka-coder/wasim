import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateManager } from '../js/state.js';

describe('StateManager', () => {
  let sm;

  beforeEach(() => {
    sm = new StateManager();
  });

  // ========================================
  //   get / set
  // ========================================
  describe('get / set', () => {
    it('gets top-level data with no path', () => {
      const data = sm.get();
      expect(data).toHaveProperty('people');
      expect(data).toHaveProperty('messages');
    });

    it('gets nested value by dot path', () => {
      expect(sm.get('group.title')).toBe('Felsefe Grubu');
      expect(sm.get('settings.theme')).toBe('dark');
    });

    it('returns undefined for non-existent path', () => {
      expect(sm.get('nonexistent.path')).toBeUndefined();
    });

    it('sets nested value by dot path', () => {
      sm.set('group.title', 'Yeni Başlık');
      expect(sm.get('group.title')).toBe('Yeni Başlık');
    });

    it('creates intermediate objects if needed', () => {
      sm.set('custom.nested.value', 42);
      expect(sm.get('custom.nested.value')).toBe(42);
    });
  });

  // ========================================
  //   subscribe / notify
  // ========================================
  describe('subscribe / notify', () => {
    it('calls subscriber on notify', () => {
      const callback = vi.fn();
      sm.subscribe(callback);
      sm.notify('test');
      expect(callback).toHaveBeenCalledWith('test');
    });

    it('set() triggers subscribers', () => {
      const callback = vi.fn();
      sm.subscribe(callback);
      sm.set('settings.theme', 'light');
      expect(callback).toHaveBeenCalledWith('settings.theme');
    });

    it('silent set does not trigger subscribers', () => {
      const callback = vi.fn();
      sm.subscribe(callback);
      sm.set('settings.theme', 'light', true);
      expect(callback).not.toHaveBeenCalled();
    });

    it('unsubscribe works', () => {
      const callback = vi.fn();
      const unsubscribe = sm.subscribe(callback);
      unsubscribe();
      sm.notify('test');
      expect(callback).not.toHaveBeenCalled();
    });

    it('supports multiple subscribers', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      sm.subscribe(cb1);
      sm.subscribe(cb2);
      sm.notify('test');
      expect(cb1).toHaveBeenCalledOnce();
      expect(cb2).toHaveBeenCalledOnce();
    });
  });

  // ========================================
  //   active members
  // ========================================
  describe('active members', () => {
    it('addActive and isActive', () => {
      sm.addActive('Ali');
      expect(sm.isActive('Ali')).toBe(true);
      expect(sm.isActive('Veli')).toBe(false);
    });

    it('removeActive', () => {
      sm.addActive('Ali');
      sm.removeActive('Ali');
      expect(sm.isActive('Ali')).toBe(false);
    });

    it('clearActive', () => {
      sm.addActive('Ali');
      sm.addActive('Veli');
      sm.clearActive();
      expect(sm.isActive('Ali')).toBe(false);
      expect(sm.isActive('Veli')).toBe(false);
    });

    it('addActive triggers notification', () => {
      const callback = vi.fn();
      sm.subscribe(callback);
      sm.addActive('Ali');
      expect(callback).toHaveBeenCalledWith('active');
    });
  });

  // ========================================
  //   colors
  // ========================================
  describe('colors', () => {
    it('assigns colors to non-Me speakers', () => {
      sm.addActive('Ali');
      sm.addActive('Veli');
      const color1 = sm.getColorForSpeaker('Ali');
      const color2 = sm.getColorForSpeaker('Veli');
      expect(color1).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(color2).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('returns fallback for unknown speaker', () => {
      expect(sm.getColorForSpeaker('Unknown')).toBe('var(--wa-text)');
    });

    it('does not assign color to "Me"', () => {
      sm.addActive('Me');
      expect(sm.getColorForSpeaker('Me')).toBe('var(--wa-text)');
    });

    it('recomputes colors on add/remove', () => {
      sm.addActive('Ali');
      const colorBefore = sm.getColorForSpeaker('Ali');
      sm.addActive('Ahmet');
      // Color should still be assigned (may change due to sort)
      expect(sm.getColorForSpeaker('Ali')).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  // ========================================
  //   messages
  // ========================================
  describe('messages', () => {
    it('addMessage returns message with id', () => {
      const msg = sm.addMessage({ speaker: 'Ali', text: 'Merhaba' });
      expect(msg.id).toBe(0);
      expect(msg.speaker).toBe('Ali');
      expect(msg.text).toBe('Merhaba');
    });

    it('auto-increments message id', () => {
      sm.addMessage({ speaker: 'Ali', text: 'A' });
      const msg2 = sm.addMessage({ speaker: 'Veli', text: 'B' });
      expect(msg2.id).toBe(1);
    });

    it('addMessage initializes reactions array', () => {
      const msg = sm.addMessage({ speaker: 'Ali', text: 'Test' });
      expect(msg.reactions).toEqual([]);
    });

    it('addMessage preserves provided reactions', () => {
      const msg = sm.addMessage({ speaker: 'Ali', text: 'Test', reactions: [{ emoji: '😂' }] });
      expect(msg.reactions).toEqual([{ emoji: '😂' }]);
    });

    it('clearMessages resets', () => {
      sm.addMessage({ speaker: 'Ali', text: 'A' });
      sm.clearMessages();
      expect(sm.get('messages')).toEqual([]);
      const newMsg = sm.addMessage({ speaker: 'Veli', text: 'B' });
      expect(newMsg.id).toBe(0); // seq reset
    });

    it('addMessage triggers notification', () => {
      const callback = vi.fn();
      sm.subscribe(callback);
      sm.addMessage({ speaker: 'Ali', text: 'Test' });
      expect(callback).toHaveBeenCalledWith('messages');
    });
  });

  // ========================================
  //   export / import
  // ========================================
  describe('export / import', () => {
    it('export returns serializable object', () => {
      sm.addMessage({ speaker: 'Ali', text: 'Merhaba' });
      const exported = sm.export();
      expect(exported).toHaveProperty('people');
      expect(exported).toHaveProperty('group');
      expect(exported).toHaveProperty('settings');
      expect(exported).toHaveProperty('messages');
      expect(exported).toHaveProperty('player');
      // Should not have runtime state
      expect(exported.player).not.toHaveProperty('playTimer');
      expect(exported.player).not.toHaveProperty('typingTimer');
    });

    it('import restores state', () => {
      sm.set('group.title', 'Test Grubu', true);
      sm.addMessage({ speaker: 'Ali', text: 'Test' });
      const exported = sm.export();

      const sm2 = new StateManager();
      sm2.import(exported);
      expect(sm2.get('group.title')).toBe('Test Grubu');
      expect(sm2.get('messages')).toHaveLength(1);
    });

    it('import handles missing fields gracefully', () => {
      expect(() => sm.import({})).not.toThrow();
    });

    it('import recalculates messageSeq if not provided', () => {
      sm.import({
        messages: [
          { id: 5, speaker: 'A', text: 'test' },
          { id: 10, speaker: 'B', text: 'test2' },
        ],
      });
      expect(sm.get('messageSeq')).toBe(11);
    });

    it('roundtrip preserves data', () => {
      sm.set('group.title', 'Export Test', true);
      sm.set('settings.theme', 'light', true);
      sm.addMessage({ speaker: 'Ali', text: 'Roundtrip' });

      const exported = sm.export();
      const json = JSON.stringify(exported);
      const parsed = JSON.parse(json);

      const sm2 = new StateManager();
      sm2.import(parsed);
      expect(sm2.get('group.title')).toBe('Export Test');
      expect(sm2.get('settings.theme')).toBe('light');
      expect(sm2.get('messages')[0].text).toBe('Roundtrip');
    });
  });

  // ========================================
  //   reset
  // ========================================
  describe('reset', () => {
    it('resets to default values', () => {
      sm.set('group.title', 'Changed', true);
      sm.addActive('Ali');
      sm.addMessage({ speaker: 'Ali', text: 'Test' });
      sm.reset();

      expect(sm.get('group.title')).toBe('Felsefe Grubu');
      expect(sm.isActive('Ali')).toBe(false);
      expect(sm.get('messages')).toEqual([]);
      expect(sm.get('settings.theme')).toBe('dark');
    });

    it('reset triggers notification', () => {
      const callback = vi.fn();
      sm.subscribe(callback);
      sm.reset();
      expect(callback).toHaveBeenCalled();
    });

    it('reset clears color cache', () => {
      sm.addActive('Ali');
      expect(sm.getColorForSpeaker('Ali')).toMatch(/^#/);
      sm.reset();
      expect(sm.getColorForSpeaker('Ali')).toBe('var(--wa-text)');
    });
  });
});
