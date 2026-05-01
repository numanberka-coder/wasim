import { describe, it, expect } from 'vitest';
import {
  parseLine,
  parseScript,
  parseScriptDetailed,
  tokenizeCommand,
  unquoteWrappedToken,
  parseVoiceDurationToSeconds,
  validateScript,
  isValidCommand,
  eventsToScript,
  EventType,
} from '../js/features/script-parser.js';

// ========================================
//   EventType
// ========================================
describe('EventType', () => {
  it('has all expected types', () => {
    expect(EventType.ADD).toBe('add');
    expect(EventType.LEAVE).toBe('leave');
    expect(EventType.SYSTEM).toBe('system');
    expect(EventType.REACTION).toBe('reaction');
    expect(EventType.TYPING).toBe('typing');
    expect(EventType.MESSAGE).toBe('msg');
    expect(EventType.TICK_STATUS).toBe('tick_status');
  });
});

// ========================================
//   tokenizeCommand
// ========================================
describe('tokenizeCommand', () => {
  it('splits simple tokens', () => {
    expect(tokenizeCommand('@add Ali')).toEqual(['@add', 'Ali']);
  });

  it('handles quoted strings with spaces', () => {
    expect(tokenizeCommand('@location Me "İstanbul Havalimanı"')).toEqual([
      '@location', 'Me', 'İstanbul Havalimanı',
    ]);
  });

  it('handles single-quoted strings', () => {
    expect(tokenizeCommand("@document Me 'dosya adı.pdf'")).toEqual([
      '@document', 'Me', 'dosya adı.pdf',
    ]);
  });

  it('handles escaped quotes inside quoted strings', () => {
    expect(tokenizeCommand('@system "Ahmet \\"Admin\\" oldu"')).toEqual([
      '@system', 'Ahmet "Admin" oldu',
    ]);
  });

  it('handles empty input', () => {
    expect(tokenizeCommand('')).toEqual([]);
  });
});

// ========================================
//   unquoteWrappedToken
// ========================================
describe('unquoteWrappedToken', () => {
  it('removes double quotes', () => {
    expect(unquoteWrappedToken('"hello"')).toBe('hello');
  });

  it('removes single quotes', () => {
    expect(unquoteWrappedToken("'hello'")).toBe('hello');
  });

  it('returns as-is if no quotes', () => {
    expect(unquoteWrappedToken('hello')).toBe('hello');
  });

  it('handles empty/null input', () => {
    expect(unquoteWrappedToken('')).toBe('');
    expect(unquoteWrappedToken(null)).toBe('');
    expect(unquoteWrappedToken(undefined)).toBe('');
  });

  it('unescapes inner quotes', () => {
    expect(unquoteWrappedToken('"say \\"hi\\""')).toBe('say "hi"');
  });
});

// ========================================
//   parseVoiceDurationToSeconds
// ========================================
describe('parseVoiceDurationToSeconds', () => {
  it('parses "12s" format', () => {
    expect(parseVoiceDurationToSeconds('12s')).toBe(12);
    expect(parseVoiceDurationToSeconds('5.5s')).toBe(5.5);
  });

  it('parses MM:SS format', () => {
    expect(parseVoiceDurationToSeconds('1:30')).toBe(90);
    expect(parseVoiceDurationToSeconds('0:12')).toBe(12);
  });

  it('parses milliseconds (large number)', () => {
    expect(parseVoiceDurationToSeconds('8000')).toBe(8);
  });

  it('parses plain seconds (small number)', () => {
    expect(parseVoiceDurationToSeconds('15')).toBe(15);
  });

  it('returns 12 as default', () => {
    expect(parseVoiceDurationToSeconds('')).toBe(12);
    expect(parseVoiceDurationToSeconds(null)).toBe(12);
    expect(parseVoiceDurationToSeconds('abc')).toBe(12);
  });

  it('enforces minimum of 1 second', () => {
    expect(parseVoiceDurationToSeconds('0')).toBe(1);
  });
});

// ========================================
//   parseLine — Commands
// ========================================
describe('parseLine', () => {
  describe('skip lines', () => {
    it('returns null for comment lines (#)', () => {
      expect(parseLine('#block_name')).toBe(null);
    });

    it('returns null for trigger lines', () => {
      expect(parseLine('trigger: merhaba, selam')).toBe(null);
    });

    it('returns null for separator (---)', () => {
      expect(parseLine('---')).toBe(null);
    });
  });

  describe('@add', () => {
    it('parses @add command', () => {
      expect(parseLine('@add Ali')).toEqual({
        type: EventType.ADD,
        who: 'Ali',
      });
    });

    it('handles multi-word names', () => {
      expect(parseLine('@add "Ali Veli"')).toEqual({
        type: EventType.ADD,
        who: 'Ali Veli',
      });
    });
  });

  describe('@leave', () => {
    it('parses @leave command', () => {
      expect(parseLine('@leave Ali')).toEqual({
        type: EventType.LEAVE,
        who: 'Ali',
      });
    });
  });

  describe('@system', () => {
    it('parses @system command', () => {
      expect(parseLine('@system Grup adı değiştirildi')).toEqual({
        type: EventType.SYSTEM,
        text: 'Grup adı değiştirildi',
      });
    });
  });

  describe('@reaction', () => {
    it('parses @reaction command', () => {
      expect(parseLine('@reaction Ali 😂 Me')).toEqual({
        type: EventType.REACTION,
        who: 'Ali',
        emoji: '😂',
        target: 'Me',
      });
    });
  });

  describe('@typing', () => {
    it('parses @typing with duration', () => {
      expect(parseLine('@typing Ali 1200')).toEqual({
        type: EventType.TYPING,
        who: 'Ali',
        ms: 1200,
      });
    });

    it('defaults to 800ms if no duration', () => {
      expect(parseLine('@typing Ali')).toEqual({
        type: EventType.TYPING,
        who: 'Ali',
        ms: 800,
      });
    });
  });

  describe('tick status', () => {
    it('parses @sent', () => {
      expect(parseLine('@sent')).toEqual({
        type: EventType.TICK_STATUS,
        status: 'sent',
      });
    });

    it('parses @delivered', () => {
      expect(parseLine('@delivered')).toEqual({
        type: EventType.TICK_STATUS,
        status: 'delivered',
      });
    });

    it('parses @read', () => {
      expect(parseLine('@read')).toEqual({
        type: EventType.TICK_STATUS,
        status: 'read',
      });
    });
  });

  describe('media messages', () => {
    it('parses @photo', () => {
      const result = parseLine('@photo Me https://example.com/img.jpg Güzel manzara');
      expect(result).toEqual({
        type: EventType.MESSAGE,
        who: 'Me',
        kind: 'photo',
        src: 'https://example.com/img.jpg',
        text: 'Güzel manzara',
      });
    });

    it('parses @gif', () => {
      const result = parseLine('@gif Ali https://example.com/funny.gif');
      expect(result).toEqual({
        type: EventType.MESSAGE,
        who: 'Ali',
        kind: 'gif',
        src: 'https://example.com/funny.gif',
        text: '',
      });
    });

    it('parses @video', () => {
      const result = parseLine('@video Me https://example.com/vid.mp4 Video');
      expect(result).toEqual({
        type: EventType.MESSAGE,
        who: 'Me',
        kind: 'video',
        src: 'https://example.com/vid.mp4',
        text: 'Video',
      });
    });

    it('parses @location', () => {
      const result = parseLine('@location Me "İstanbul Havalimanı" "Terminal 1"');
      expect(result).toEqual({
        type: EventType.MESSAGE,
        who: 'Me',
        kind: 'location',
        text: 'İstanbul Havalimanı',
        src: 'Terminal 1',
      });
    });

    it('parses @document', () => {
      const result = parseLine('@document Ali "rapor.pdf" "1.2 MB · PDF"');
      expect(result).toEqual({
        type: EventType.MESSAGE,
        who: 'Ali',
        kind: 'document',
        text: 'rapor.pdf',
        src: '1.2 MB · PDF',
      });
    });

    it('parses @sticker with emoji', () => {
      const result = parseLine('@sticker Ali ✈️');
      expect(result).toEqual({
        type: EventType.MESSAGE,
        who: 'Ali',
        kind: 'sticker',
        src: '',
        text: '✈️',
      });
    });

    it('parses @sticker with URL', () => {
      const result = parseLine('@sticker Ali https://example.com/sticker.webp');
      expect(result).toEqual({
        type: EventType.MESSAGE,
        who: 'Ali',
        kind: 'sticker',
        src: 'https://example.com/sticker.webp',
        text: '',
      });
    });

    it('parses @link', () => {
      const result = parseLine('@link Me "Google" "https://google.com"');
      expect(result).toEqual({
        type: EventType.MESSAGE,
        who: 'Me',
        kind: 'link',
        text: 'Google',
        durationSec: 'https://google.com',
        src: '',
      });
    });

    it('parses @viewonce', () => {
      expect(parseLine('@viewonce Ali photo')).toEqual({
        type: EventType.MESSAGE,
        who: 'Ali',
        kind: 'viewonce',
        src: 'photo',
        text: '',
      });
    });

    it('parses @voice', () => {
      const result = parseLine('@voice Me 15s');
      expect(result).toEqual({
        type: EventType.MESSAGE,
        who: 'Me',
        kind: 'voice',
        durationSec: 15,
        text: '',
      });
    });
  });

  describe('text messages', () => {
    it('parses normal message', () => {
      expect(parseLine('Ali: Merhaba!')).toEqual({
        type: EventType.MESSAGE,
        who: 'Ali',
        text: 'Merhaba!',
      });
    });

    it('parses reply message', () => {
      expect(parseLine('Ali > Me: Katılıyorum')).toEqual({
        type: EventType.MESSAGE,
        who: 'Ali',
        replyTo: 'Me',
        text: 'Katılıyorum',
      });
    });

    it('handles message with colons in text', () => {
      const result = parseLine('Ali: Saat: 14:00');
      expect(result.who).toBe('Ali');
      expect(result.text).toBe('Saat: 14:00');
    });
  });

  describe('edge cases', () => {
    it('treats unknown lines as system messages', () => {
      const result = parseLine('Bu bir test satırı');
      expect(result.type).toBe(EventType.SYSTEM);
    });
  });
});

// ========================================
//   parseScript
// ========================================
describe('parseScript', () => {
  it('parses multi-line script', () => {
    const script = `@add Ali
@typing Ali 800
Ali: Merhaba!`;
    const events = parseScript(script);
    expect(events).toHaveLength(3);
    expect(events[0].type).toBe(EventType.ADD);
    expect(events[1].type).toBe(EventType.TYPING);
    expect(events[2].type).toBe(EventType.MESSAGE);
  });

  it('skips empty lines', () => {
    const script = `@add Ali

Ali: Merhaba!

Ali: Nasılsın?`;
    const events = parseScript(script);
    expect(events).toHaveLength(3);
  });

  it('handles empty/null input', () => {
    expect(parseScript('')).toEqual([]);
    expect(parseScript(null)).toEqual([]);
    expect(parseScript(undefined)).toEqual([]);
  });

  it('skips interactive mode syntax', () => {
    const script = `#selamlasma
trigger: merhaba
alias: selam, yardim
---
Ali: Selam!`;
    const events = parseScript(script);
    expect(events).toHaveLength(1);
    expect(events[0].text).toBe('Selam!');
  });
});

// ========================================
//   parseScriptDetailed
// ========================================
describe('parseScriptDetailed', () => {
  it('returns events and line-level issues together', () => {
    const result = parseScriptDetailed(`@add Ali
@invalid value
Ali: Merhaba!`);

    expect(result.events).toHaveLength(2);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toMatchObject({
      line: 2,
      severity: 'error',
      code: 'invalid_command',
    });
    expect(result.summary.errors).toBe(1);
  });

  it('uses a soft default for invalid @typing duration', () => {
    const result = parseScriptDetailed('@typing Ali abc');

    expect(result.events).toEqual([
      { type: EventType.TYPING, who: 'Ali', ms: 800 },
    ]);
    expect(result.issues[0]).toMatchObject({
      line: 1,
      severity: 'warning',
      code: 'soft_default',
    });
  });

  it('does not create an event for missing message text', () => {
    const result = parseScriptDetailed('Ali: ');

    expect(result.events).toEqual([]);
    expect(result.issues[0]).toMatchObject({
      line: 1,
      severity: 'error',
      code: 'missing_message',
    });
    expect(result.issues[0].example).toBe('Ahmet: Merhaba!');
  });
});

// ========================================
//   validateScript
// ========================================
describe('validateScript', () => {
  it('returns no errors for valid script', () => {
    const script = `@add Ali
Ali: Merhaba!
@typing Ali 800`;
    expect(validateScript(script)).toEqual([]);
  });

  it('detects invalid commands', () => {
    const errors = validateScript('@invalid command');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('Geçersiz komut');
  });

  it('detects missing names for @add/@leave', () => {
    expect(validateScript('@add ')[0].message).toContain('kişi adı gerekli');
    expect(validateScript('@leave ')[0].message).toContain('kişi adı gerekli');
  });

  it('skips interactive mode lines', () => {
    const script = `#block
trigger: hello
---`;
    expect(validateScript(script)).toEqual([]);
  });
});

// ========================================
//   isValidCommand
// ========================================
describe('isValidCommand', () => {
  it('returns true for valid commands', () => {
    const validCmds = [
      '@add Ali', '@leave Ali', '@system Test', '@reaction Ali 😂 Me',
      '@typing Ali 800', '@photo Me url', '@video Me url', '@voice Me 12s',
      '@gif Me url', '@location Me "Yer"', '@document Me "dosya.pdf"',
      '@sticker Me 😀', '@link Me "title"', '@viewonce Me photo',
      '@sent', '@delivered', '@read',
    ];
    for (const cmd of validCmds) {
      expect(isValidCommand(cmd)).toBe(true);
    }
  });

  it('returns false for invalid commands', () => {
    expect(isValidCommand('@invalid test')).toBe(false);
    expect(isValidCommand('@hello world')).toBe(false);
  });
});

// ========================================
//   eventsToScript
// ========================================
describe('eventsToScript', () => {
  it('converts events back to script text', () => {
    const events = [
      { type: EventType.ADD, who: 'Ali' },
      { type: EventType.TYPING, who: 'Ali', ms: 800 },
      { type: EventType.MESSAGE, who: 'Ali', text: 'Merhaba!' },
    ];
    const script = eventsToScript(events);
    expect(script).toBe('@add Ali\n@typing Ali 800\nAli: Merhaba!');
  });

  it('converts reply messages', () => {
    const events = [
      { type: EventType.MESSAGE, who: 'Ali', replyTo: 'Me', text: 'Katılıyorum' },
    ];
    expect(eventsToScript(events)).toBe('Ali > Me: Katılıyorum');
  });

  it('converts media messages', () => {
    const events = [
      { type: EventType.MESSAGE, who: 'Me', kind: 'photo', src: 'url.jpg', text: 'caption' },
      { type: EventType.MESSAGE, who: 'Me', kind: 'voice', durationSec: 15, text: '' },
      { type: EventType.MESSAGE, who: 'Me', kind: 'location', text: 'Yer', src: 'alt bilgi' },
      { type: EventType.MESSAGE, who: 'Me', kind: 'document', text: 'dosya.pdf', src: '1 MB' },
      { type: EventType.MESSAGE, who: 'Me', kind: 'sticker', src: '', text: '😀' },
      { type: EventType.MESSAGE, who: 'Me', kind: 'viewonce', src: 'photo', text: '' },
    ];
    const script = eventsToScript(events);
    expect(script).toContain('@photo Me url.jpg caption');
    expect(script).toContain('@voice Me 15s');
    expect(script).toContain('@location Me "Yer" alt bilgi');
    expect(script).toContain('@document Me "dosya.pdf" "1 MB"');
    expect(script).toContain('@sticker Me "😀"');
    expect(script).toContain('@viewonce Me photo');
  });

  it('converts tick status events', () => {
    const events = [
      { type: EventType.TICK_STATUS, status: 'sent' },
      { type: EventType.TICK_STATUS, status: 'delivered' },
      { type: EventType.TICK_STATUS, status: 'read' },
    ];
    expect(eventsToScript(events)).toBe('@sent\n@delivered\n@read');
  });

  it('converts system and leave events', () => {
    const events = [
      { type: EventType.SYSTEM, text: 'Grup adı değiştirildi' },
      { type: EventType.LEAVE, who: 'Ali' },
      { type: EventType.REACTION, who: 'Ali', emoji: '😂', target: 'Me' },
    ];
    const script = eventsToScript(events);
    expect(script).toContain('@system Grup adı değiştirildi');
    expect(script).toContain('@leave Ali');
    expect(script).toContain('@reaction Ali 😂 Me');
  });

  it('roundtrips simple script', () => {
    const original = `@add Ali
@typing Ali 800
Ali: Merhaba!
@system Ali gruba katıldı
@leave Ali`;
    const events = parseScript(original);
    const result = eventsToScript(events);
    expect(result).toBe(original);
  });
});
