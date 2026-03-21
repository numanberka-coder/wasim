/* ========================================
   SCRIPT PARSER - Script Parsing
   ======================================== */

/**
 * Event types
 */
const EventType = {
  ADD: 'add',
  LEAVE: 'leave',
  SYSTEM: 'system',
  REACTION: 'reaction',
  TYPING: 'typing',
  MESSAGE: 'msg',
  TICK_STATUS: 'tick_status',
};

/**
 * Parse script text into events
 */
function parseScript(text) {
  if (!text || typeof text !== 'string') return [];

  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const events = [];

  for (const line of lines) {
    try {
      const event = parseLine(line);
      if (event) {
        events.push(event);
      }
    } catch (err) {
      Logger.error('Satır parse hatası:', line, err);
    }
  }

  return events;
}

/**
 * Parse a single line into an event
 */

/**
 * Tokenize a command line (supports quoted tokens)
 */
function tokenizeCommand(line) {
  const tokens = [];
  const re = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|(\S+)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const tok = m[1] ?? m[2] ?? m[3] ?? '';
    tokens.push(tok.replace(/\\(["'\\])/g, '$1'));
  }
  return tokens;
}


/**
 * Remove wrapping single/double quotes from a token, without splitting spaces.
 * Also unescapes common escaped quote characters (\", \' and \\).
 */
function unquoteWrappedToken(s) {
  const t = String(s ?? '').trim();
  if (!t) return '';
  const q = t[0];
  if ((q === '"' || q === "'") && t.length >= 2 && t[t.length - 1] === q) {
    return t.slice(1, -1).replace(/\\(["'\\])/g, '$1');
  }
  return t;
}


/**
 * Parse duration token like "12s" or "8000" (ms) into seconds
 */
function parseVoiceDurationToSeconds(token) {
  const t = String(token || '').trim();
  if (!t) return 12;
  // 0:12 or 00:12
  const mmss = t.match(/^(\d{1,2}):(\d{2})$/);
  if (mmss) {
    const mm = Number(mmss[1]);
    const ss = Number(mmss[2]);
    if (Number.isFinite(mm) && Number.isFinite(ss)) return mm * 60 + ss;
  }
  // 12s
  const sec = t.match(/^(\d+(?:\.\d+)?)s$/i);
  if (sec) {
    const v = Number(sec[1]);
    return Number.isFinite(v) ? v : 12;
  }
  // assume ms if large, else seconds
  const n = Number(t);
  if (!Number.isFinite(n)) return 12;
  if (n >= 1000) return Math.max(1, n / 1000);
  return Math.max(1, n);
}

function parseLine(line) {
  try {
  // Skip interactive mode syntax lines (#block, trigger:, ---)
  if (line.startsWith('#') || line === '---' || /^trigger\s*:/i.test(line)) {
    return null;
  }

  // @sent / @delivered / @read — tik durumu değiştir
  if (line === '@sent' || line === '@delivered' || line === '@read') {
    return {
      type: EventType.TICK_STATUS,
      status: line.slice(1) // 'sent', 'delivered', 'read'
    };
  }

  // @add Name
  if (line.startsWith('@add ')) {
    const parts = tokenizeCommand(line);
    return {
      type: EventType.ADD,
      who: parts.slice(1).join(' ').trim()
    };
  }

// @leave Name
  if (line.startsWith('@leave ')) {
    const parts = tokenizeCommand(line);
    return {
      type: EventType.LEAVE,
      who: parts.slice(1).join(' ').trim()
    };
  }

// @system Message text
  if (line.startsWith('@system')) {
    return {
      type: EventType.SYSTEM,
      text: line.replace('@system', '').trim()
    };
  }

  // @reaction Who Emoji Target
  if (line.startsWith('@reaction ')) {
    const parts = tokenizeCommand(line);
    return {
      type: EventType.REACTION,
      who: parts[1] || '',
      emoji: parts[2] || '',
      target: parts.slice(3).join(' ').trim()
    };
  }

  // @typing Who Duration
  if (line.startsWith('@typing ')) {
    const parts = tokenizeCommand(line);
    const ms = Number(parts[2] || '800');
    return {
      type: EventType.TYPING,
      who: parts[1] || '',
      ms: Number.isFinite(ms) ? ms : 800
    };
  }

  // @photo Who URL [Caption...]
  if (line.startsWith('@photo ')) {
    const parts = tokenizeCommand(line);
    return {
      type: EventType.MESSAGE,
      who: parts[1] || '',
      kind: 'photo',
      src: parts[2] || '',
      text: parts.slice(3).join(' ').trim()
    };
  }

  // @gif Who URL [Caption...]
  if (line.startsWith('@gif ')) {
    const parts = tokenizeCommand(line);
    return {
      type: EventType.MESSAGE,
      who: parts[1] || '',
      kind: 'gif',
      src: parts[2] || '',
      text: parts.slice(3).join(' ').trim()
    };
  }

  // @video Who URL [Caption...]
  if (line.startsWith('@video ')) {
    const parts = tokenizeCommand(line);
    return {
      type: EventType.MESSAGE,
      who: parts[1] || '',
      kind: 'video',
      src: parts[2] || '',
      text: parts.slice(3).join(' ').trim()
    };
  }

  // @location Who "Yer Adı" [Alt Bilgi]
  if (line.startsWith('@location ')) {
    const parts = tokenizeCommand(line);
    return {
      type: EventType.MESSAGE,
      who: parts[1] || '',
      kind: 'location',
      text: parts[2] || 'Konum',
      src: parts.slice(3).join(' ').trim()
    };
  }

  // @document Who "dosya.pdf" ["boyut/tip"]
  if (line.startsWith('@document ')) {
    const parts = tokenizeCommand(line);
    return {
      type: EventType.MESSAGE,
      who: parts[1] || '',
      kind: 'document',
      text: parts[2] || 'dosya.pdf',
      src: parts.slice(3).join(' ').trim() || '· PDF'
    };
  }

  // @sticker Who [URL veya emoji]
  if (line.startsWith('@sticker ')) {
    const parts = tokenizeCommand(line);
    const third = parts[2] || '';
    const isUrl = third.startsWith('http');
    return {
      type: EventType.MESSAGE,
      who: parts[1] || '',
      kind: 'sticker',
      src: isUrl ? third : '',
      text: isUrl ? '' : (third || '🙂')
    };
  }

  // @link Who "Başlık" [URL] [ThumbnailURL]
  if (line.startsWith('@link ')) {
    const parts = tokenizeCommand(line);
    return {
      type: EventType.MESSAGE,
      who: parts[1] || '',
      kind: 'link',
      text: parts[2] || 'Bağlantı',
      durationSec: parts[3] || '',   // URL alanı olarak kullanılıyor
      src: parts[4] || ''             // Thumbnail URL
    };
  }

  // @viewonce Who [photo|video]
  if (line.startsWith('@viewonce ')) {
    const parts = tokenizeCommand(line);
    return {
      type: EventType.MESSAGE,
      who: parts[1] || '',
      kind: 'viewonce',
      src: parts[2] || 'photo',
      text: ''
    };
  }

  // @voice Who Duration [Caption]
  if (line.startsWith('@voice ')) {
    const parts = tokenizeCommand(line);
    return {
      type: EventType.MESSAGE,
      who: parts[1] || '',
      kind: 'voice',
      durationSec: parseVoiceDurationToSeconds(parts[2] || '12s'),
      text: parts.slice(3).join(' ').trim()
    };
  }

  // Reply: Sender > ReplyTo: Message
  const replyMatch = line.match(/^(.+?)\s*>\s*(.+?)\s*:\s*(.+)$/);
  if (replyMatch) {
    return {
      type: EventType.MESSAGE,
      who: unquoteWrappedToken(replyMatch[1]),
      replyTo: unquoteWrappedToken(replyMatch[2]),
      text: replyMatch[3]
    };
  }

  // Normal message: Sender: Message
  const msgMatch = line.match(/^(.+?)\s*:\s*(.+)$/);
  if (msgMatch) {
    return {
      type: EventType.MESSAGE,
      who: unquoteWrappedToken(msgMatch[1]),
      text: msgMatch[2]
    };
  }

  // Unknown format - treat as system message
  return {
    type: EventType.SYSTEM,
    text: line
  };
  } catch (err) {
    Logger.error('parseLine hatası:', line, err);
    return null;
  }
}

/**
 * Validate script and return errors
 */
function validateScript(text) {
  const errors = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Skip interactive mode syntax lines
    if (trimmed.startsWith('#') || trimmed.startsWith('trigger:') || trimmed === '---') return;

    // Check for common errors
    if (trimmed.startsWith('@') && !isValidCommand(trimmed)) {
      errors.push({
        line: index + 1,
        message: `Geçersiz komut: ${trimmed.split(' ')[0]}`
      });
    }

    // Check for empty names
    if (trimmed.startsWith('@add ') && !trimmed.slice(5).trim()) {
      errors.push({
        line: index + 1,
        message: '@add komutu için isim gerekli'
      });
    }

    if (trimmed.startsWith('@leave ') && !trimmed.slice(7).trim()) {
      errors.push({
        line: index + 1,
        message: '@leave komutu için isim gerekli'
      });
    }
  });

  return errors;
}

/**
 * Check if command is valid
 */
function isValidCommand(line) {
  const validCommands = ['@add', '@leave', '@system', '@reaction', '@typing', '@photo', '@video', '@voice', '@gif', '@location', '@document', '@sticker', '@link', '@viewonce', '@sent', '@delivered', '@read'];
  const cmd = line.split(' ')[0];
  return validCommands.includes(cmd);
}

/**
 * Format events back to script text
 */
function eventsToScript(events) {
  return events.map(event => {
    switch (event.type) {
      case EventType.ADD:
        return `@add ${event.who}`;
      case EventType.LEAVE:
        return `@leave ${event.who}`;
      case EventType.SYSTEM:
        return `@system ${event.text}`;
      case EventType.REACTION:
        return `@reaction ${event.who} ${event.emoji} ${event.target}`;
      case EventType.TYPING:
        return `@typing ${event.who} ${event.ms}`;
      case EventType.TICK_STATUS:
        return `@${event.status}`;
      case EventType.MESSAGE:
        if (event.kind === 'location') {
          const sub = event.src ? ` ${event.src}` : '';
          return `@location ${event.who} "${event.text}"${sub}`;
        }
        if (event.kind === 'document') {
          const sz = event.src ? ` "${event.src}"` : '';
          return `@document ${event.who} "${event.text}"${sz}`;
        }
        if (event.kind === 'sticker') {
          const val = event.src || event.text || '🙂';
          return `@sticker ${event.who} "${val}"`;
        }
        if (event.kind === 'link') {
          const url = event.durationSec ? ` "${event.durationSec}"` : '';
          const thumb = event.src ? ` "${event.src}"` : '';
          return `@link ${event.who} "${event.text}"${url}${thumb}`;
        }
        if (event.kind === 'viewonce') {
          return `@viewonce ${event.who} ${event.src || 'photo'}`;
        }
        if (event.kind === 'photo') {
          return `@photo ${event.who} ${event.src}${event.text ? ' ' + event.text : ''}`;
        }
        if (event.kind === 'gif') {
          return `@gif ${event.who} ${event.src}${event.text ? ' ' + event.text : ''}`;
        }
        if (event.kind === 'video') {
          return `@video ${event.who} ${event.src}${event.text ? ' ' + event.text : ''}`;
        }
        if (event.kind === 'voice') {
          const sec = Math.round(Number(event.durationSec) || 12);
          return `@voice ${event.who} ${sec}s${event.text ? ' ' + event.text : ''}`;
        }
        if (event.replyTo) {
          return `${event.who} > ${event.replyTo}: ${event.text}`;
        }
        return `${event.who}: ${event.text}`;
      default:
        return '';
    }
  }).filter(Boolean).join('\n');
}
