import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  escapeHtml,
  clamp,
  deepClone,
  debounce,
  throttle,
  timeToMinutes,
  minutesToTime,
  generateId,
  formatBytes,
  isEmpty,
  isValidUrl,
  safeJsonParse,
  nowTime,
} from '../js/utils.js';

// ========================================
//   escapeHtml
// ========================================
describe('escapeHtml', () => {
  it('escapes &, <, >, ", \'', () => {
    expect(escapeHtml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&#039;');
  });

  it('returns same string when no special chars', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('coerces non-string to string', () => {
    expect(escapeHtml(123)).toBe('123');
    expect(escapeHtml(null)).toBe('null');
    expect(escapeHtml(undefined)).toBe('undefined');
  });

  it('escapes XSS vectors', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
    expect(escapeHtml('<img onerror="alert(1)">')).toBe(
      '&lt;img onerror=&quot;alert(1)&quot;&gt;'
    );
  });

  it('handles nested HTML entities', () => {
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });
});

// ========================================
//   clamp
// ========================================
describe('clamp', () => {
  it('clamps value between min and max', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles edge values', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('handles NaN input', () => {
    expect(clamp(NaN, 0, 10)).toBe(0);
  });

  it('handles null/undefined input', () => {
    expect(clamp(null, 0, 10)).toBe(0);
    expect(clamp(undefined, 0, 10)).toBe(0);
  });

  it('handles string number input', () => {
    expect(clamp('5', 0, 10)).toBe(5);
  });
});

// ========================================
//   deepClone
// ========================================
describe('deepClone', () => {
  it('creates independent copy', () => {
    const obj = { a: 1, b: { c: 2 } };
    const clone = deepClone(obj);
    clone.b.c = 99;
    expect(obj.b.c).toBe(2);
  });

  it('clones arrays', () => {
    const arr = [1, [2, 3]];
    const clone = deepClone(arr);
    clone[1].push(4);
    expect(arr[1]).toEqual([2, 3]);
  });

  it('handles null', () => {
    expect(deepClone(null)).toBe(null);
  });
});

// ========================================
//   debounce
// ========================================
describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('resets timer on repeated calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('passes arguments', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('a', 'b');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('a', 'b');
  });
});

// ========================================
//   throttle
// ========================================
describe('throttle', () => {
  it('executes immediately on first call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('blocks calls within interval', () => {
    const fn = vi.fn();
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const throttled = throttle(fn, 100);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });

  it('allows calls after interval', () => {
    const fn = vi.fn();
    let now = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const throttled = throttle(fn, 100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    now += 100;
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
    vi.restoreAllMocks();
  });
});

// ========================================
//   timeToMinutes / minutesToTime
// ========================================
describe('timeToMinutes', () => {
  it('converts HH:MM to minutes', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('01:30')).toBe(90);
    expect(timeToMinutes('23:59')).toBe(1439);
  });

  it('handles single digit hour', () => {
    expect(timeToMinutes('9:05')).toBe(545);
  });

  it('returns null for invalid format', () => {
    expect(timeToMinutes('')).toBe(null);
    expect(timeToMinutes('abc')).toBe(null);
    expect(timeToMinutes('25:00')).toBe(23 * 60); // clamped
    expect(timeToMinutes(null)).toBe(null);
  });
});

describe('minutesToTime', () => {
  it('converts minutes to HH:MM', () => {
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(90)).toBe('01:30');
    expect(minutesToTime(1439)).toBe('23:59');
  });

  it('handles overflow (wraps around)', () => {
    expect(minutesToTime(1440)).toBe('00:00');
    expect(minutesToTime(1500)).toBe('01:00');
  });

  it('handles negative values', () => {
    expect(minutesToTime(-60)).toBe('23:00');
  });
});

// ========================================
//   generateId
// ========================================
describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

// ========================================
//   formatBytes
// ========================================
describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
  });
});

// ========================================
//   isEmpty
// ========================================
describe('isEmpty', () => {
  it('returns true for null, undefined, empty string', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty('')).toBe(true);
  });

  it('returns false for non-empty values', () => {
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(false)).toBe(false);
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([])).toBe(false);
  });
});

// ========================================
//   isValidUrl
// ========================================
describe('isValidUrl', () => {
  it('returns true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('ftp://files.example.com')).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl(null)).toBe(false);
    expect(isValidUrl(undefined)).toBe(false);
  });
});

// ========================================
//   safeJsonParse
// ========================================
describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
    expect(safeJsonParse('[1,2,3]')).toEqual([1, 2, 3]);
  });

  it('returns fallback for invalid JSON', () => {
    expect(safeJsonParse('not json')).toBe(null);
    expect(safeJsonParse('not json', 'default')).toBe('default');
  });

  it('returns fallback for empty string', () => {
    expect(safeJsonParse('')).toBe(null);
  });
});

// ========================================
//   nowTime
// ========================================
describe('nowTime', () => {
  it('returns HH:MM format', () => {
    const time = nowTime();
    expect(time).toMatch(/^\d{2}:\d{2}$/);
  });
});
