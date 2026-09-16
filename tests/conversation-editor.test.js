import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { state } from '../js/state.js';
import { addLine, initScriptTools, parseEditableLine, buildLineFromValues, composeMessageForPerson } from '../js/features/script-builder.js';
import { undoLast, redoLast, clearHistory, getHistoryStatus, runUndoable } from '../js/features/history.js';
import { renderPeopleList } from '../js/features/people.js';

const el = id => document.getElementById(id);
function mount(script = '') {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  document.body.innerHTML = new DOMParser().parseFromString(html, 'text/html').body.innerHTML;
  el('scriptBox').value = script;
  state.set('player.script', script);
  initScriptTools();
  return el('scriptBox');
}
function addMessage(text, sender = 'Diogenes') {
  el('mobileScriptAddBtn').click();
  el('mobileScriptSender').value = sender;
  el('mobileScriptMessage').value = text;
  el('mobileScriptSaveBtn').click();
}

describe('Faz 61 canonical conversation editor', () => {
  beforeEach(() => { state.reset(); clearHistory(); });

  it('adds directly from people without a transfer step or independent list', () => {
    const box = mount('Aristoteles: Önceki mesaj');
    renderPeopleList();
    const navigate = vi.fn();
    document.addEventListener('workspace:navigate', navigate, { once: true });
    document.querySelector('[data-addline="Diogenes"]').click();
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate.mock.calls[0][0].detail.key).toBe('scriptEditor');
    expect(el('mobileScriptSender').value).toBe('Diogenes');
    el('mobileScriptMessage').value = 'Yeni mesaj';
    el('mobileScriptSaveBtn').click();
    expect(box.value).toBe('Aristoteles: Önceki mesaj\nDiogenes: Yeni mesaj');
    expect(state.get('player.script')).toBe(box.value);
    expect(document.querySelector('.inline-builder-panel')).toBeNull();
    expect(el('groupFlowAccordion').hidden).toBe(true);
  });

  it('undoes and redoes add, edit, move and delete through one history', () => {
    const initial = 'Aristoteles: Bir';
    const box = mount(initial);
    addMessage('İki');
    const added = box.value;
    expect(undoLast({ silent: true })).toBe(true);
    expect(box.value).toBe(initial);
    expect(redoLast({ silent: true })).toBe(true);
    expect(box.value).toBe(added);
    document.querySelector('[aria-label="Satır 2 düzenle"]').click();
    el('mobileScriptMessage').value = 'Yeni iki';
    el('mobileScriptSaveBtn').click();
    const edited = box.value;
    undoLast({ silent: true }); expect(box.value).toBe(added);
    redoLast({ silent: true }); expect(box.value).toBe(edited);
    el('mobileScriptReorderBtn').click();
    document.querySelector('[aria-label="Satır 2 yukarı taşı"]').click();
    const moved = box.value;
    undoLast({ silent: true }); expect(box.value).toBe(edited);
    redoLast({ silent: true }); expect(box.value).toBe(moved);
    el('mobileScriptReorderBtn').click();
    document.querySelector('[aria-label="Satır 1 sil"]').click();
    expect(box.value).toBe(initial);
    undoLast({ silent: true }); expect(box.value).toBe(moved);
    redoLast({ silent: true }); expect(box.value).toBe(initial);
    expect(el('conversationUndo').disabled).toBe(false);
  });

  it('does not rewind unrelated appearance or active conversation on script undo', () => {
    mount('Aristoteles: Bir');
    addLine('Diogenes: İki');
    state.set('group.title', 'Bağımsız başlık');
    const target = state.get('conversations.activeId');
    undoLast({ silent: true });
    expect(state.get('group.title')).toBe('Bağımsız başlık');
    expect(state.get('conversations.activeId')).toBe(target);
  });

  it('clears redo on the next new operation', () => {
    mount(); addLine('Diogenes: A'); undoLast({ silent: true });
    expect(getHistoryStatus().canRedo).toBe(true);
    addLine('Diogenes: B');
    expect(redoLast({ silent: true })).toBe(false);
  });

  it('synchronizes external canonical changes into cards, text and validation', () => {
    const box = mount();
    state.set('player.script', 'Aristoteles: Dışarıdan\n@unknown nope');
    expect(box.value).toBe(state.get('player.script'));
    expect(document.querySelectorAll('.mobile-script-card')).toHaveLength(2);
    expect(document.querySelector('.mobile-script-card.has-error')).not.toBeNull();
    document.querySelector('.script-issue-focus').click();
    expect(el('conversationTextAdvanced').open).toBe(true);
    expect(box.value.slice(box.selectionStart, box.selectionEnd)).toBe('@unknown nope');
  });

  it('keeps raw text undo keys native and raw changes visible in cards', () => {
    const box = mount();
    box.value = 'Diogenes: Klavyeyle';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    const key = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true });
    box.dispatchEvent(key);
    expect(key.defaultPrevented).toBe(false);
    expect(state.get('player.script')).toBe(box.value);
    expect(document.querySelector('.mobile-script-message').textContent).toBe('Klavyeyle');
  });

  it('reveals only selected type fields and keeps field values on type changes', () => {
    mount(); el('mobileScriptAddBtn').click();
    const type = el('conversationMessageType');
    expect(document.querySelector('[data-conversation-field="url"]').hidden).toBe(true);
    type.value = 'photo'; type.dispatchEvent(new Event('change'));
    expect(el('mobileScriptMessage').closest('.form-group').hidden).toBe(true);
    expect(document.querySelector('[data-conversation-field="url"]').hidden).toBe(false);
    el('conversationField_url').value = 'https://example.com/photo.jpg';
    type.value = 'reply'; type.dispatchEvent(new Event('change'));
    expect(document.querySelector('[data-conversation-field="replyTo"]').hidden).toBe(false);
    expect(el('conversationField_url').value).toBe('https://example.com/photo.jpg');
  });

  it('edits a media card without requiring commands', () => {
    const box = mount('@photo Diogenes "https://example.com/a.jpg" "Eski"');
    document.querySelector('[aria-label="Satır 1 düzenle"]').click();
    expect(el('conversationMessageType').value).toBe('photo');
    expect(el('conversationField_url').value).toBe('https://example.com/a.jpg');
    el('conversationField_caption').value = 'Yeni';
    el('mobileScriptSaveBtn').click();
    expect(box.value).toBe('@photo Diogenes "https://example.com/a.jpg" "Yeni"');
  });

  it('keeps invalid drafts inline without adding partial messages', () => {
    const box = mount();
    el('mobileScriptAddBtn').click();
    el('mobileScriptSaveBtn').click();
    expect(el('conversationComposerError').textContent).toContain('boş');
    expect(el('mobileScriptMessage').getAttribute('aria-invalid')).toBe('true');
    el('mobileScriptMessage').value = 'Bir\nİki';
    el('mobileScriptSaveBtn').click();
    expect(box.value).toBe('');
    expect(el('mobileScriptComposer').hidden).toBe(false);
  });

  it('preserves unfinished new-message text when navigating from another person', () => {
    mount(); el('mobileScriptAddBtn').click();
    el('mobileScriptMessage').value = 'Bitmemiş taslak';
    composeMessageForPerson('Aristoteles');
    expect(el('mobileScriptMessage').value).toBe('Bitmemiş taslak');
    expect(el('mobileScriptSender').value).toBe('Aristoteles');
  });

  it('refuses a stale edit while retaining the form draft', () => {
    const box = mount('Diogenes: İlk');
    document.querySelector('[aria-label="Satır 1 düzenle"]').click();
    el('mobileScriptMessage').value = 'Taslak';
    state.set('player.script', 'Aristoteles: Değişti');
    el('mobileScriptSaveBtn').click();
    expect(box.value).toBe('Aristoteles: Değişti');
    expect(el('mobileScriptMessage').value).toBe('Taslak');
    expect(el('conversationComposerError').textContent).toContain('Konuşma değişti');
  });

  it('refuses adding a draft after the target conversation changes', () => {
    const box = mount();
    el('mobileScriptAddBtn').click(); el('mobileScriptMessage').value = 'Yanlış sohbet olmamalı';
    state.set('conversations.activeId', 'different-chat');
    el('mobileScriptSaveBtn').click();
    expect(box.value).toBe('');
    expect(el('mobileScriptComposer').hidden).toBe(false);
  });

  it('retains imported unknown senders when editing a card', () => {
    const box = mount('Eski Kişi: Merhaba');
    document.querySelector('[aria-label="Satır 1 düzenle"]').click();
    expect(el('mobileScriptSender').value).toBe('Eski Kişi');
    el('mobileScriptMessage').value = 'Selam'; el('mobileScriptSaveBtn').click();
    expect(box.value).toBe('Eski Kişi: Selam');
  });

  it.each([
    ['message', { who: 'Diogenes', text: 'Merhaba' }],
    ['reply', { who: 'Diogenes', replyTo: 'Aristoteles', text: 'Evet' }],
    ['photo', { who: 'Diogenes', url: 'https://example.com/a.jpg', caption: 'Bir fotoğraf' }],
    ['gif', { who: 'Diogenes', url: 'https://example.com/a.gif', caption: 'GIF' }],
    ['video', { who: 'Diogenes', url: 'https://example.com/a.mp4', caption: 'Video' }],
    ['voice', { who: 'Diogenes', duration: '12s', caption: 'Sesli mesaj' }],
    ['location', { who: 'Diogenes', placeName: 'İstanbul', placeInfo: 'Şehir merkezi' }],
    ['document', { who: 'Diogenes', fileName: 'rapor.pdf', fileSize: '2 MB' }],
    ['sticker', { who: 'Diogenes', stickerVal: '🙂' }],
    ['link', { who: 'Diogenes', linkTitle: 'Başlık', linkUrl: 'https://example.com' }],
    ['viewonce', { who: 'Diogenes', voMediaType: 'photo' }],
    ['typing', { who: 'Diogenes', typingMs: '800' }],
    ['reaction', { who: 'Diogenes', emoji: '👍', reactTarget: 'Aristoteles' }],
    ['system', { systemText: 'Grup oluşturuldu' }],
    ['add', { personName: 'Yeni Kişi' }],
    ['leave', { personName: 'Yeni Kişi' }],
  ])('roundtrips the existing %s syntax without a second model', (type, values) => {
    const raw = buildLineFromValues(type, values);
    const parsed = parseEditableLine(raw);
    expect(parsed.type).toBe(type);
    expect(buildLineFromValues(parsed.type, parsed.values)).toBe(raw);
  });

  it('supports existing snapshot history callers with redo', () => {
    mount();
    const previous = state.get('group.title');
    runUndoable({ action: () => state.set('group.title', 'Yeni'), message: 'Başlık', silent: true });
    undoLast({ silent: true }); expect(state.get('group.title')).toBe(previous);
    redoLast({ silent: true }); expect(state.get('group.title')).toBe('Yeni');
  });
});
