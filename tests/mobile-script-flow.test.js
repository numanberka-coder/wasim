import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addLine, initScriptTools } from '../js/features/script-builder.js';
import { undoLast } from '../js/features/history.js';
import { state } from '../js/state.js';

function mountScriptEditor(script = '') {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.body.innerHTML = parsed.body.innerHTML;
  const box = document.querySelector('#scriptBox');
  box.value = script;
  state.set('player.script', script);
  initScriptTools();
  return box;
}

describe('Faz 58 mobile script flow', () => {
  beforeEach(() => {
    state.reset();
  });

  it('projects physical script lines into message cards without changing the script format', () => {
    const source = 'Aristoteles: Merhaba\n\n@typing Diogenes 800\nDiogenes: Selam';
    const box = mountScriptEditor(source);
    const cards = [...document.querySelectorAll('.mobile-script-card')];

    expect(cards).toHaveLength(3);
    expect(cards.map((card) => card.querySelector('.mobile-script-line-number').textContent)).toEqual([
      '1. satır', '3. satır', '4. satır',
    ]);
    expect(box.value).toBe(source);
    expect(state.get('player.script')).toBe(source);
  });

  it('adds and edits normal messages through the person picker', () => {
    const box = mountScriptEditor('Aristoteles: İlk mesaj');
    document.querySelector('#mobileScriptAddBtn').click();
    const sender = document.querySelector('#mobileScriptSender');
    const message = document.querySelector('#mobileScriptMessage');
    expect([...sender.options].map((option) => option.value)).toContain('Diogenes');

    sender.value = 'Diogenes';
    message.value = 'Yeni mesaj';
    document.querySelector('#mobileScriptSaveBtn').click();
    expect(box.value).toBe('Aristoteles: İlk mesaj\nDiogenes: Yeni mesaj');

    document.querySelectorAll('.mobile-script-card')[1].querySelector('button[aria-label="Satır 2 düzenle"]').click();
    message.value = 'Düzeltilmiş mesaj';
    document.querySelector('#mobileScriptSaveBtn').click();
    expect(box.value).toContain('Diogenes: Düzeltilmiş mesaj');
    expect(state.get('player.script')).toBe(box.value);
  });

  it('makes deletion undoable and restores both state and cards', () => {
    const box = mountScriptEditor('Aristoteles: Bir\nDiogenes: İki');
    document.querySelector('button[aria-label="Satır 1 sil"]').click();
    expect(box.value).toBe('Diogenes: İki');
    expect(document.querySelectorAll('.mobile-script-card')).toHaveLength(1);

    expect(undoLast()).toBe(true);
    expect(box.value).toBe('Aristoteles: Bir\nDiogenes: İki');
    expect(document.querySelectorAll('.mobile-script-card')).toHaveLength(2);
  });

  it('shows move controls only in reorder mode and preserves physical blank lines', () => {
    const box = mountScriptEditor('Aristoteles: Bir\n\nDiogenes: İki');
    expect(document.querySelector('button[aria-label$="yukarı taşı"]')).toBeNull();

    document.querySelector('#mobileScriptReorderBtn').click();
    expect(document.querySelector('#mobileScriptReorderBtn').getAttribute('aria-pressed')).toBe('true');
    document.querySelector('button[aria-label="Satır 3 yukarı taşı"]').click();
    expect(box.value).toBe('Diogenes: İki\n\nAristoteles: Bir');
  });

  it('labels invalid lines with text and focuses the exact raw line from validation', () => {
    const box = mountScriptEditor('Aristoteles: Tamam\n@invalid command');
    const invalidCard = document.querySelector('.mobile-script-card.has-error');
    expect(invalidCard.querySelector('.mobile-script-issue-label').textContent).toBe('Hata');

    document.querySelector('.script-issue-focus').click();
    expect(box.selectionStart).toBe('Aristoteles: Tamam\n'.length);
    expect(box.value.slice(box.selectionStart, box.selectionEnd)).toBe('@invalid command');
    expect(document.activeElement).toBe(box);
  });

  it('announces playback changes inside the mobile editor', () => {
    mountScriptEditor('Aristoteles: Merhaba');
    const status = document.querySelector('#mobileScriptPlaybackStatus');
    expect(status.textContent).toBe('Oynatmaya hazır');

    const timer = setTimeout(() => {}, 1000);
    const player = state.get('player');
    player.paused = false;
    player.playTimer = timer;
    state.notify('player.playback');
    expect(status.textContent).toBe('Senaryo oynatılıyor');

    clearTimeout(timer);
    player.playTimer = null;
    player.paused = true;
    player.queue = [{}];
    state.notify('player.playback');
    expect(status.textContent).toBe('Senaryo duraklatıldı');
  });

  it('shows messages prepared in the group builder as soon as they are transferred', () => {
    const box = mountScriptEditor('');
    addLine('Aristoteles: Hazırlanan mesaj');
    document.querySelector('#groupBuilderPushBtn').click();

    expect(box.value).toBe('Aristoteles: Hazırlanan mesaj');
    expect(document.querySelector('.mobile-script-card .mobile-script-message').textContent).toBe('Hazırlanan mesaj');
  });

  it('keeps the mobile flow desktop-hidden and sticky in the overlay contract', () => {
    mountScriptEditor();
    const panelsCss = readFileSync(join(process.cwd(), 'css', 'panels.css'), 'utf8');
    const responsiveCss = readFileSync(join(process.cwd(), 'css', 'responsive.css'), 'utf8');
    expect(panelsCss).toMatch(/\.mobile-script-flow\s*{[^}]*display:\s*none/s);
    expect(responsiveCss).toMatch(/\.mobile-overlay-body \.mobile-script-flow\s*{[^}]*display:\s*block/s);
    expect(responsiveCss).toMatch(/\.mobile-script-add-btn\s*{[^}]*position:\s*sticky/s);
  });
});
