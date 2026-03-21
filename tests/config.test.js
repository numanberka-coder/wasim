import { describe, it, expect } from 'vitest';
import {
  THEME_DEFAULTS,
  CONFIG,
  DEFAULT_STATE,
  COLOR_POOL,
  DEFAULT_PEOPLE,
  SCRIPT_TEMPLATES,
  WALLPAPER_PRESETS,
} from '../js/config.js';

// ========================================
//   THEME_DEFAULTS
// ========================================
describe('THEME_DEFAULTS', () => {
  it('has dark and light themes', () => {
    expect(THEME_DEFAULTS).toHaveProperty('dark');
    expect(THEME_DEFAULTS).toHaveProperty('light');
  });

  it('dark theme has required color fields', () => {
    const { dark } = THEME_DEFAULTS;
    expect(dark).toHaveProperty('headerColor');
    expect(dark).toHaveProperty('bubbleOutColor');
    expect(dark).toHaveProperty('bubbleInColor');
    expect(dark).toHaveProperty('wallpaperColor');
    expect(dark).toHaveProperty('wallpaperPreset');
  });

  it('light theme has required color fields', () => {
    const { light } = THEME_DEFAULTS;
    expect(light).toHaveProperty('headerColor');
    expect(light).toHaveProperty('bubbleOutColor');
    expect(light).toHaveProperty('bubbleInColor');
    expect(light).toHaveProperty('wallpaperColor');
    expect(light).toHaveProperty('wallpaperPreset');
  });

  it('colors are valid hex strings', () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    expect(THEME_DEFAULTS.dark.headerColor).toMatch(hexRegex);
    expect(THEME_DEFAULTS.light.headerColor).toMatch(hexRegex);
    expect(THEME_DEFAULTS.dark.bubbleOutColor).toMatch(hexRegex);
    expect(THEME_DEFAULTS.light.bubbleOutColor).toMatch(hexRegex);
  });
});

// ========================================
//   CONFIG
// ========================================
describe('CONFIG', () => {
  it('has required keys', () => {
    expect(CONFIG).toHaveProperty('STORAGE_KEY');
    expect(CONFIG).toHaveProperty('SCENES_KEY');
    expect(CONFIG).toHaveProperty('AUTO_SAVE_INTERVAL');
    expect(CONFIG).toHaveProperty('TYPING_BASE_MS');
    expect(CONFIG).toHaveProperty('DEFAULT_SPEED');
    expect(CONFIG).toHaveProperty('DEFAULT_JITTER');
  });

  it('storage keys are non-empty strings', () => {
    expect(typeof CONFIG.STORAGE_KEY).toBe('string');
    expect(CONFIG.STORAGE_KEY.length).toBeGreaterThan(0);
    expect(typeof CONFIG.SCENES_KEY).toBe('string');
    expect(CONFIG.SCENES_KEY.length).toBeGreaterThan(0);
  });

  it('timing values are positive numbers', () => {
    expect(CONFIG.AUTO_SAVE_INTERVAL).toBeGreaterThan(0);
    expect(CONFIG.TYPING_BASE_MS).toBeGreaterThan(0);
    expect(CONFIG.DEFAULT_SPEED).toBeGreaterThan(0);
    expect(CONFIG.MIN_DELAY).toBeGreaterThan(0);
  });
});

// ========================================
//   COLOR_POOL
// ========================================
describe('COLOR_POOL', () => {
  it('has at least 10 colors', () => {
    expect(COLOR_POOL.length).toBeGreaterThanOrEqual(10);
  });

  it('all entries are valid hex colors', () => {
    for (const color of COLOR_POOL) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

// ========================================
//   DEFAULT_PEOPLE
// ========================================
describe('DEFAULT_PEOPLE', () => {
  it('has "Me" as a key', () => {
    expect(DEFAULT_PEOPLE).toHaveProperty('Me');
  });

  it('each person has avatar property', () => {
    for (const [, person] of Object.entries(DEFAULT_PEOPLE)) {
      expect(person).toHaveProperty('avatar');
    }
  });
});

// ========================================
//   DEFAULT_STATE
// ========================================
describe('DEFAULT_STATE', () => {
  it('has all required fields', () => {
    const requiredFields = [
      'theme', 'groupTitle', 'groupSubtitle', 'dayLabel',
      'batteryVisible', 'batteryPercent', 'chatFontSize',
      'speed', 'jitter', 'tickStatus',
    ];
    for (const field of requiredFields) {
      expect(DEFAULT_STATE).toHaveProperty(field);
    }
  });

  it('theme defaults to dark', () => {
    expect(DEFAULT_STATE.theme).toBe('dark');
  });

  it('tickStatus is valid value', () => {
    expect(['sent', 'delivered', 'read']).toContain(DEFAULT_STATE.tickStatus);
  });
});

// ========================================
//   SCRIPT_TEMPLATES
// ========================================
describe('SCRIPT_TEMPLATES', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(SCRIPT_TEMPLATES)).toBe(true);
    expect(SCRIPT_TEMPLATES.length).toBeGreaterThan(0);
  });

  it('each template has id, title, description, script', () => {
    for (const template of SCRIPT_TEMPLATES) {
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('title');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('script');
      expect(typeof template.script).toBe('string');
      expect(template.script.length).toBeGreaterThan(0);
    }
  });
});

// ========================================
//   WALLPAPER_PRESETS
// ========================================
describe('WALLPAPER_PRESETS', () => {
  it('has default and light-default presets', () => {
    expect(WALLPAPER_PRESETS).toHaveProperty('default');
    expect(WALLPAPER_PRESETS).toHaveProperty('light-default');
  });

  it('each preset has background property', () => {
    for (const [, preset] of Object.entries(WALLPAPER_PRESETS)) {
      expect(preset).toHaveProperty('background');
      expect(typeof preset.background).toBe('string');
    }
  });
});
