import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function loadIndexDocument() {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  return new DOMParser().parseFromString(html, 'text/html');
}

function getHeaderMenuGroups(doc) {
  return [...doc.querySelectorAll('#headerDropdown .hd-menu-group')].map((group) => ({
    key: group.dataset.menuGroup,
    label: group.querySelector('.hd-group-label')?.textContent.trim(),
    actions: [...group.querySelectorAll('.hd-item')].map((item) => item.dataset.action),
    texts: [...group.querySelectorAll('.hd-item')].map((item) => item.textContent.trim()),
  }));
}

describe('Faz 36 menu discipline', () => {
  it('orders header menu groups by the product workflow', () => {
    const doc = loadIndexDocument();
    const groups = getHeaderMenuGroups(doc);

    expect(groups.map((group) => group.label)).toEqual([
      'Hazırla',
      'Senaryo',
      'Oynat',
      'Çıktı',
      'Ayarlar',
      'Veri İşlemleri',
    ]);
  });

  it('keeps panel, playback, output, settings, and data actions separated', () => {
    const doc = loadIndexDocument();
    const groups = getHeaderMenuGroups(doc);
    const actionsByKey = Object.fromEntries(groups.map((group) => [group.key, group.actions]));

    expect(actionsByKey.prepare).toEqual(['group']);
    expect(actionsByKey.scenario).toEqual(['scriptEditor']);
    expect(actionsByKey.playback).toEqual(['play', 'pause', 'reset']);
    expect(actionsByKey.output).toEqual(['screenshot', 'save', 'load']);
    expect(actionsByKey.settings).toEqual(['settings']);
    expect(actionsByKey.data).toEqual(['clear']);
  });

  it('keeps playback reset distinct from destructive data deletion', () => {
    const doc = loadIndexDocument();
    const resetAction = doc.querySelector('#headerDropdown [data-action="reset"]');
    const clearAction = doc.querySelector('#headerDropdown [data-action="clear"]');
    const clearAllButton = doc.querySelector('#clearAllBtn');
    const overlayResetButton = doc.querySelector('#moResetBtn');

    expect(resetAction?.textContent.trim()).toBe('Oynatmayı Sıfırla');
    expect(clearAction?.textContent.trim()).toBe('Tüm Veriyi Sil');
    expect(clearAllButton?.getAttribute('title')).toBe('Tüm Veriyi Sil');
    expect(overlayResetButton?.getAttribute('title')).toBe('Oynatmayı Sıfırla');
  });

  it('uses Hazırla as the main preparation tab label', () => {
    const doc = loadIndexDocument();
    const firstTab = doc.querySelector('.tabs .tab[data-tab="group"] span');

    expect(firstTab?.textContent.trim()).toBe('Hazırla');
  });
});
