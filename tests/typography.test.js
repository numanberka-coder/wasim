import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyAllTypography,
  setFontSize,
  setBubblePaddingY,
} from '../js/phone/typography.js';
import { state } from '../js/state.js';

function loadPhoneCss() {
  return readFileSync(join(process.cwd(), 'css', 'phone.css'), 'utf8');
}

function mountPhone() {
  document.body.innerHTML = '<div class="phone"></div>';
  return document.querySelector('.phone');
}

describe('Tipografi token bağı (CSS)', () => {
  const css = loadPhoneCss();
  const bubbleBlock = css.slice(css.indexOf('.msg-bubble {'), css.indexOf('.msg-bubble.in'));

  it('.msg-bubble font-size ve line-height token tüketir, hardcoded değildir', () => {
    expect(bubbleBlock).toContain('font-size: var(--chat-font-size)');
    expect(bubbleBlock).toContain('line-height: var(--chat-line-height)');
    expect(bubbleBlock).not.toContain('font-size: 14.2px');
    expect(bubbleBlock).not.toContain('line-height: 19px');
  });

  it('.msg-bubble dolgusu --bubble-padding-* token tüketir', () => {
    expect(bubbleBlock).toContain('var(--bubble-padding-top)');
    expect(bubbleBlock).toContain('var(--bubble-padding-right)');
    expect(bubbleBlock).toContain('var(--bubble-padding-bottom)');
    expect(bubbleBlock).toContain('var(--bubble-padding-left)');
  });

  it('--chat-line-height varsayılanı birimsiz çarpandır (px değil)', () => {
    expect(css).toMatch(/--chat-line-height:\s*1\.\d+;/);
    expect(css).not.toContain('--chat-line-height: 19px');
  });
});

describe('Tipografi kaydırıcıları balon token\'larını sürer (JS)', () => {
  beforeEach(() => {
    state.reset();
    mountPhone();
  });

  it('varsayılan ayarlar eski sabit balon görünümünü üretir', () => {
    applyAllTypography();
    const phone = document.querySelector('.phone');
    expect(phone.style.getPropertyValue('--chat-font-size')).toBe('14px');
    expect(phone.style.getPropertyValue('--chat-line-height')).toBe('1.4');
    expect(phone.style.getPropertyValue('--bubble-padding-top')).toBe('6px');
    expect(phone.style.getPropertyValue('--bubble-padding-bottom')).toBe('8px');
    expect(phone.style.getPropertyValue('--bubble-padding-right')).toBe('7px');
    expect(phone.style.getPropertyValue('--bubble-padding-left')).toBe('9px');
  });

  it('font boyutu kaydırıcısı --chat-font-size değişkenini günceller', () => {
    setFontSize(18);
    expect(document.querySelector('.phone').style.getPropertyValue('--chat-font-size')).toBe('18px');
  });

  it('balon dolgu kaydırıcısı dikey dolgu token\'larını günceller', () => {
    setBubblePaddingY(14);
    const phone = document.querySelector('.phone');
    expect(phone.style.getPropertyValue('--bubble-padding-top')).toBe('10px');
    expect(phone.style.getPropertyValue('--bubble-padding-bottom')).toBe('12px');
  });
});
