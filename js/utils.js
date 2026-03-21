/* ========================================
   UTILS - Helper Functions
   ======================================== */

/**
 * DOM Selectors
 */
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);
const $one = (selector) => document.querySelector(selector);

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Get current time as HH:MM string
 */
function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Clamp number between min and max
 */
function clamp(value, min, max) {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return min;
  return Math.min(Math.max(num, min), max);
}

/**
 * Deep clone object (simple version)
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
function debounce(fn, ms = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Throttle function
 */
function throttle(fn, ms = 100) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Convert time string (HH:MM) to minutes
 */
function timeToMinutes(str) {
  const match = String(str || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = clamp(Number(match[1]), 0, 23);
  const mins = clamp(Number(match[2]), 0, 59);
  return hours * 60 + mins;
}

/**
 * Convert minutes to time string (HH:MM)
 */
function minutesToTime(total) {
  const mins = ((total % 1440) + 1440) % 1440; // Handle negative/overflow
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Generate unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Format file size
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Check if value is empty (null, undefined, empty string)
 */
function isEmpty(value) {
  return value === null || value === undefined || value === '';
}

/**
 * Check if a string is a valid URL
 */
function isValidUrl(str) {
  if (!str) return false;
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create element with attributes
 */
function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }
  
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }
  
  return el;
}

/**
 * Read file as Data URL
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as Text
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsText(file);
  });
}

/**
 * Download data as file
 */
function downloadFile(data, filename, type = 'application/json') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Safe JSON parse
 */
function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Yapısal loglama utility
 * Production'da sessiz, ?debug=true ile verbose
 */
const Logger = (() => {
  const DEBUG = new URLSearchParams(window.location.search).has('debug');

  const noop = () => {};

  return {
    get DEBUG() { return DEBUG; },
    info:  DEBUG ? console.log.bind(console)  : noop,
    warn:  DEBUG ? console.warn.bind(console) : noop,
    error: console.error.bind(console), // Hatalar her zaman gösterilsin
    debug: DEBUG ? console.debug.bind(console) : noop
  };
})();
