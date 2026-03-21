/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Messages', () => {
  let messages, state;

  beforeEach(async () => {
    vi.resetModules();

    // Set up minimal DOM (chatBody + header elements for typing indicator)
    document.body.innerHTML = `
      <div id="chatBody"></div>
      <div id="headerStatus"></div>
    `;

    const stateModule = await import('../js/state.js');
    state = stateModule.state;
    state.reset();

    const messagesModule = await import('../js/phone/messages.js');
    messages = messagesModule;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('addMessage', () => {
    it('adds a text message to DOM', () => {
      state.addActive('Ali');
      messages.addMessage({ speaker: 'Ali', text: 'Merhaba!' });
      const chat = document.getElementById('chatBody');
      expect(chat.children.length).toBeGreaterThan(0);
    });

    it('adds message to state', () => {
      messages.addMessage({ speaker: 'Me', text: 'Test' });
      expect(state.get('messages')).toHaveLength(1);
      expect(state.get('messages')[0].speaker).toBe('Me');
    });

    it('creates outgoing message for "Me" (class .out)', () => {
      messages.addMessage({ speaker: 'Me', text: 'Benim mesajım' });
      const chat = document.getElementById('chatBody');
      const outgoing = chat.querySelector('.msg-row.out');
      expect(outgoing).not.toBe(null);
    });

    it('creates incoming message for other speakers (class .in)', () => {
      state.addActive('Ali');
      messages.addMessage({ speaker: 'Ali', text: 'Onun mesajı' });
      const chat = document.getElementById('chatBody');
      const incoming = chat.querySelector('.msg-row.in');
      expect(incoming).not.toBe(null);
    });
  });

  describe('addSystemMessage', () => {
    it('adds a system message to DOM', () => {
      messages.addSystemMessage('Biri gruba katıldı');
      const chat = document.getElementById('chatBody');
      const sysMsg = chat.querySelector('.system-msg');
      expect(sysMsg).not.toBe(null);
      expect(sysMsg.textContent).toContain('Biri gruba katıldı');
    });
  });

  describe('clearChat', () => {
    it('replaces chat with day divider only', () => {
      messages.addMessage({ speaker: 'Me', text: 'Test' });
      messages.addSystemMessage('System');
      messages.clearChat();
      const chat = document.getElementById('chatBody');
      // clearChat leaves a day-divider
      expect(chat.querySelector('.day-divider')).not.toBe(null);
      expect(chat.querySelector('.msg-row')).toBe(null);
      expect(chat.querySelector('.system-msg')).toBe(null);
    });
  });

  describe('addTypingBubble / removeTypingBubble', () => {
    it('adds and removes typing indicator', () => {
      state.addActive('Ali');
      const bubble = messages.addTypingBubble('Ali');
      const chat = document.getElementById('chatBody');
      expect(chat.querySelector('.typing-bubble')).not.toBe(null);
      messages.removeTypingBubble(bubble);
      expect(chat.querySelector('.typing-bubble')).toBe(null);
    });
  });

  describe('findMessageByTarget', () => {
    it('finds message by speaker name', () => {
      state.addActive('Ali');
      messages.addMessage({ speaker: 'Ali', text: 'Hedef mesaj' });
      const found = messages.findMessageByTarget('Ali');
      expect(found).not.toBe(null);
      expect(found.speaker).toBe('Ali');
    });

    it('returns null for non-existent target', () => {
      expect(messages.findMessageByTarget('Yok')).toBe(null);
    });
  });
});
