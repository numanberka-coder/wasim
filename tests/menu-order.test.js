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

function getDesktopActionGroups(doc) {
  return [...doc.querySelectorAll('.action-bar-actions .action-group')].map((group) => ({
    key: group.dataset.actionGroup,
    ids: [...group.querySelectorAll('button, .mode-badge, .scale-controls')].map((item) => item.id).filter(Boolean),
  }));
}

function getMobilePanelActions(doc) {
  return [...doc.querySelectorAll('#headerDropdown .hd-item')]
    .map((item) => item.dataset.action)
    .filter((action) => ['group', 'scriptEditor', 'settings'].includes(action));
}

function getPanelAccordionLabels(doc, panelId) {
  return [...doc.querySelectorAll(`#${panelId} > details.accordion > summary`)].map((summary) =>
    summary.textContent.replace(/\s+/g, ' ').trim()
  );
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

describe('Faz 37 desktop menu and panel order', () => {
  it('groups desktop action bar controls by view, output, settings, and data work', () => {
    const doc = loadIndexDocument();
    const groups = getDesktopActionGroups(doc);
    const groupsByKey = Object.fromEntries(groups.map((group) => [group.key, group.ids]));

    expect(groups.map((group) => group.key)).toEqual(['view', 'output', 'settings', 'data']);
    expect(groupsByKey.view).toEqual(['modeBadge', 'phoneOnlyBtn', 'scaleControls']);
    expect(groupsByKey.output).toEqual(['screenshotBtn', 'saveAllBtn', 'loadAllBtn']);
    expect(groupsByKey.settings).toEqual(['actionThemeToggleBtn']);
    expect(groupsByKey.data).toEqual(['clearAllBtn']);
  });

  it('keeps preparation workflow accordions before technical JSON editing', () => {
    const doc = loadIndexDocument();
    const labels = getPanelAccordionLabels(doc, 'group');

    expect(labels).toEqual([
      'Grup Bilgileri',
      'Kişi Ekle / Düzenle',
      'Kişi Listesi',
      'Satır Sırası',
      'JSON Düzenle',
    ]);
  });

  it('keeps common settings before pro and technical settings', () => {
    const doc = loadIndexDocument();
    const labels = getPanelAccordionLabels(doc, 'settings');

    expect(labels.indexOf('🌗 Tema')).toBeGreaterThan(labels.indexOf('🧭 Başlangıç Rehberi & Mod'));
    expect(labels.indexOf('🌗 Tema')).toBeLessThan(labels.indexOf('⏱️ Mesaj Saatleri'));
    expect(labels.indexOf('🔤 Tipografi')).toBeLessThan(labels.indexOf('⏱️ Mesaj Saatleri'));
  });
});

describe('Faz 38 mobile menu and overlay contract', () => {
  it('marks the header menu as a mobile action sheet with trigger state', () => {
    const doc = loadIndexDocument();
    const trigger = doc.querySelector('#headerMenuBtn');
    const menu = doc.querySelector('#headerDropdown');
    const header = menu?.querySelector('.hd-menu-header');

    expect(trigger?.getAttribute('role')).toBe('button');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger?.getAttribute('aria-controls')).toBe('headerDropdown');
    expect(menu?.classList.contains('mobile-action-sheet')).toBe(true);
    expect(menu?.getAttribute('role')).toBe('menu');
    expect(header?.textContent.replace(/\s+/g, ' ').trim()).toContain('Mobil menu');
  });

  it('keeps mobile panel actions bound to the overlay panel move model', () => {
    const doc = loadIndexDocument();

    expect(getMobilePanelActions(doc)).toEqual(['group', 'scriptEditor', 'settings']);
    expect(doc.querySelector('#mobileOverlayBody')).not.toBeNull();
    expect(doc.querySelector('#mobileOverlayBackdrop')).not.toBeNull();
  });
});
