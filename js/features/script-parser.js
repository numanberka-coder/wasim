/* ========================================
   SCRIPT PARSER - Script Parsing
   ======================================== */

import { Logger } from '../utils.js';

/**
 * Event types
 */
export const EventType = {
  ADD: 'add',
  LEAVE: 'leave',
  SYSTEM: 'system',
  REACTION: 'reaction',
  TYPING: 'typing',
  MESSAGE: 'msg',
  TICK_STATUS: 'tick_status',
};

const COMMAND_HELP_TARGET = 'commandHelpAccordion';

export const COMMAND_DEFINITIONS = Object.freeze({
  '@add': {
    example: '@add Ahmet',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@leave': {
    example: '@leave Ahmet',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@system': {
    example: '@system Grup adı değişti',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@reaction': {
    example: '@reaction Ahmet 😂 Mehmet',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@typing': {
    example: '@typing Ahmet 800',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@photo': {
    example: '@photo Ahmet "https://example.com/foto.jpg" "Açıklama"',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@gif': {
    example: '@gif Ahmet "https://example.com/animasyon.gif"',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@video': {
    example: '@video Ahmet "https://example.com/video.mp4" "Açıklama"',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@voice': {
    example: '@voice Ahmet 12s',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@location': {
    example: '@location Ahmet "İstanbul" "Konum notu"',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@document': {
    example: '@document Ahmet "rapor.pdf" "1.2 MB · PDF"',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@sticker': {
    example: '@sticker Ahmet 🙂',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@link': {
    example: '@link Ahmet "Başlık" "https://example.com"',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@viewonce': {
    example: '@viewonce Ahmet photo',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@sent': {
    example: '@sent',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@delivered': {
    example: '@delivered',
    helpTarget: COMMAND_HELP_TARGET,
  },
  '@read': {
    example: '@read',
    helpTarget: COMMAND_HELP_TARGET,
  },
});

const VALID_COMMANDS = Object.keys(COMMAND_DEFINITIONS);

function createIssue({
  line,
  raw,
  code,
  command,
  severity = 'error',
  message,
  suggestion,
  example,
  helpTarget = COMMAND_HELP_TARGET,
}) {
  return {
    line,
    raw,
    code,
    command,
    severity,
    message,
    suggestion,
    example,
    helpTarget,
  };
}

function hasErrors(issues) {
  return issues.some(issue => issue.severity === 'error');
}

function buildDetailedResult(events, issues, totalLines) {
  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  const warningCount = issues.filter(issue => issue.severity === 'warning').length;
  return {
    events,
    issues,
    hasErrors: errorCount > 0,
    hasWarnings: warningCount > 0,
    summary: {
      totalLines,
      eventCount: events.length,
      errors: errorCount,
      warnings: warningCount,
    },
  };
}

function isInteractiveSyntaxLine(line) {
  return line.startsWith('#') || line === '---' || /^trigger\s*:/i.test(line);
}

function pushMissingArgumentIssue(issues, line, raw, command, message, suggestion) {
  const def = COMMAND_DEFINITIONS[command] || {};
  issues.push(createIssue({
    line,
    raw,
    code: 'missing_argument',
    command,
    message,
    suggestion,
    example: def.example,
    helpTarget: def.helpTarget,
  }));
}

function validateCommandLine(trimmed, lineNo, raw) {
  const issues = [];
  const parts = tokenizeCommand(trimmed);
  const command = parts[0] || trimmed.split(/\s+/)[0] || '';
  const def = COMMAND_DEFINITIONS[command];

  if (!def) {
    issues.push(createIssue({
      line: lineNo,
      raw,
      code: 'invalid_command',
      command,
      message: `Geçersiz komut: ${command || trimmed}`,
      suggestion: 'Komut adını kontrol edin veya Komut Yardımı bölümündeki formatlardan birini kullanın.',
      example: '@typing Ahmet 800',
    }));
    return { issues, event: null };
  }

  const requireName = () => {
    if (!parts[1]) {
      pushMissingArgumentIssue(
        issues,
        lineNo,
        raw,
        command,
        `${command} komutu için kişi adı gerekli.`,
        `Önce komutu, sonra kişi adını yazın: ${def.example}`
      );
    }
  };

  switch (command) {
    case '@add':
    case '@leave':
      requireName();
      break;

    case '@system':
      if (!trimmed.replace('@system', '').trim()) {
        pushMissingArgumentIssue(
          issues,
          lineNo,
          raw,
          command,
          '@system komutu için mesaj metni gerekli.',
          `Sistem mesajını komuttan sonra yazın: ${def.example}`
        );
      }
      break;

    case '@reaction':
      requireName();
      if (!parts[2]) {
        pushMissingArgumentIssue(issues, lineNo, raw, command, '@reaction için emoji gerekli.', `Örnek format: ${def.example}`);
      }
      if (!parts[3]) {
        pushMissingArgumentIssue(issues, lineNo, raw, command, '@reaction için hedef mesaj gerekli.', `Tepki verilecek mesajı sona ekleyin: ${def.example}`);
      }
      break;

    case '@typing': {
      requireName();
      if (parts[2]) {
        const ms = Number(parts[2]);
        if (!Number.isFinite(ms) || ms < 80) {
          issues.push(createIssue({
            line: lineNo,
            raw,
            code: 'soft_default',
            command,
            severity: 'warning',
            message: '@typing süresi sayı olmalı; bu satır 800ms ile oynatılacak.',
            suggestion: `Milisaniye cinsinden sayı yazın: ${def.example}`,
            example: def.example,
            helpTarget: def.helpTarget,
          }));
          if (!hasErrors(issues)) {
            return {
              issues,
              event: {
                type: EventType.TYPING,
                who: parts[1],
                ms: 800,
              },
            };
          }
        }
      }
      break;
    }

    case '@photo':
    case '@gif':
    case '@video':
      requireName();
      if (!parts[2]) {
        pushMissingArgumentIssue(
          issues,
          lineNo,
          raw,
          command,
          `${command} komutu için medya bağlantısı veya data değeri gerekli.`,
          `Gönderen adından sonra medya kaynağını ekleyin: ${def.example}`
        );
      }
      break;

    case '@voice':
      requireName();
      if (parts[2]) {
        const duration = parseVoiceDurationToSeconds(parts[2]);
        if (!Number.isFinite(duration) || duration <= 0) {
          issues.push(createIssue({
            line: lineNo,
            raw,
            code: 'soft_default',
            command,
            severity: 'warning',
            message: '@voice süresi okunamadı; bu satır 12s ile oynatılacak.',
            suggestion: `Süreyi 12s, 0:12 veya 12000 olarak yazın: ${def.example}`,
            example: def.example,
            helpTarget: def.helpTarget,
          }));
        }
      }
      break;

    case '@location':
    case '@document':
    case '@link':
      requireName();
      if (!parts[2]) {
        pushMissingArgumentIssue(
          issues,
          lineNo,
          raw,
          command,
          `${command} komutu için ikinci alan gerekli.`,
          `Eksik alanı tırnak içinde yazabilirsiniz: ${def.example}`
        );
      }
      break;

    case '@sticker':
      requireName();
      break;

    case '@viewonce': {
      requireName();
      const kind = String(parts[2] || 'photo').toLowerCase();
      if (parts[2] && !['photo', 'video'].includes(kind)) {
        issues.push(createIssue({
          line: lineNo,
          raw,
          code: 'soft_default',
          command,
          severity: 'warning',
          message: '@viewonce türü photo veya video olmalı; bu satır photo olarak oynatılacak.',
          suggestion: `Türü photo veya video seçin: ${def.example}`,
          example: def.example,
          helpTarget: def.helpTarget,
        }));
        if (!hasErrors(issues)) {
          return {
            issues,
            event: {
              type: EventType.MESSAGE,
              who: parts[1],
              kind: 'viewonce',
              src: 'photo',
              text: '',
            },
          };
        }
      }
      break;
    }

    case '@sent':
    case '@delivered':
    case '@read':
      break;

    default:
      break;
  }

  return { issues, event: null };
}

function validateMessageLine(trimmed, lineNo, raw) {
  const missingReplyText = trimmed.match(/^(.+?)\s*>\s*(.+?)\s*:\s*$/);
  if (missingReplyText) {
    return [createIssue({
      line: lineNo,
      raw,
      code: 'missing_message',
      message: 'Yanıt satırında mesaj metni eksik.',
      suggestion: 'İki nokta üst üste işaretinden sonra mesajı yazın.',
      example: 'Ahmet > Mehmet: Katılıyorum',
      helpTarget: 'tutorialSenaryo',
    })];
  }

  const missingMessageText = trimmed.match(/^(.+?)\s*:\s*$/);
  if (missingMessageText) {
    return [createIssue({
      line: lineNo,
      raw,
      code: 'missing_message',
      message: 'Mesaj satırında metin eksik.',
      suggestion: 'İki nokta üst üste işaretinden sonra mesajı yazın.',
      example: 'Ahmet: Merhaba!',
      helpTarget: 'tutorialSenaryo',
    })];
  }

  return [];
}

/**
 * Parse script text into events
 */
export function parseScript(text) {
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
 * Parse script text and return line-level issues with safe events.
 */
export function parseScriptDetailed(text) {
  if (!text || typeof text !== 'string') {
    return buildDetailedResult([], [], 0);
  }

  const events = [];
  const issues = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    const raw = line;
    const trimmed = line.trim();
    const lineNo = index + 1;

    if (!trimmed || isInteractiveSyntaxLine(trimmed)) return;

    let overrideEvent = null;

    if (trimmed.startsWith('@')) {
      const result = validateCommandLine(trimmed, lineNo, raw);
      issues.push(...result.issues);
      overrideEvent = result.event;
      if (hasErrors(result.issues)) return;
    } else {
      const messageIssues = validateMessageLine(trimmed, lineNo, raw);
      issues.push(...messageIssues);
      if (hasErrors(messageIssues)) return;
    }

    const event = overrideEvent || parseLine(trimmed);
    if (event) {
      events.push(event);
    }
  });

  return buildDetailedResult(events, issues, lines.length);
}

/**
 * Parse a single line into an event
 */

/**
 * Tokenize a command line (supports quoted tokens)
 */
export function tokenizeCommand(line) {
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
export function unquoteWrappedToken(s) {
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
export function parseVoiceDurationToSeconds(token) {
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

export function parseLine(line) {
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
export function validateScript(text) {
  return parseScriptDetailed(text).issues;
}

/**
 * Check if command is valid
 */
export function isValidCommand(line) {
  const cmd = line.split(' ')[0];
  return VALID_COMMANDS.includes(cmd);
}

/**
 * Format events back to script text
 */
export function eventsToScript(events) {
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
