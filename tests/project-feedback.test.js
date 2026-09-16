import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { migrateAdvancedPreferences, initProjectFeedback } from '../js/ui/project-feedback.js';
import { storage } from '../js/storage.js';
import { state } from '../js/state.js';

let cleanup;
beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  document.body.innerHTML = '<header class="workspace-topbar"></header><section id="project"></section><main class="stage"><div class="phone"></div></main><details id="localAdvanced" data-advanced-section="test"></details><select id="appModeToggle"></select><span id="modeBadge"></span><button data-mode="pro">Araç</button>';
  state.reset();
});
afterEach(() => { cleanup?.(); storage.flush(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe('Faz 63 truthful feedback and migration', () => {
  it('migrates Pro once into local disclosures without gating features', () => {
    localStorage.setItem('wa_sim_app_mode', 'pro');
    migrateAdvancedPreferences();
    const details = document.getElementById('localAdvanced');
    expect(details.open).toBe(true);
    expect(document.querySelector('[data-mode]')).toBeNull();
    expect(document.getElementById('appModeToggle')).toBeNull();
    details.open = false;
    details.dispatchEvent(new Event('toggle'));
    migrateAdvancedPreferences();
    expect(details.open).toBe(false);
  });
  it('announces saving immediately and saved only after successful write', () => {
    cleanup = initProjectFeedback();
    storage.save();
    expect(document.getElementById('projectSaveStatus').textContent).toContain('Kaydediliyor');
    vi.advanceTimersByTime(1100);
    expect(document.getElementById('projectSaveStatus').textContent).toBe('Bu cihazda kaydedildi');
    expect(document.querySelector('.phone').contains(document.getElementById('projectSaveStatus'))).toBe(false);
  });
  it('shows actionable persistent error instead of claiming saved', () => {
    cleanup = initProjectFeedback();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('quota', 'QuotaExceededError'); });
    storage.saveNow();
    expect(document.getElementById('projectSaveStatus').textContent).toContain('Kaydedilemedi');
    expect(document.getElementById('projectSaveError').hidden).toBe(false);
    expect(document.getElementById('projectSaveError').textContent).toContain('Proje Dosyasını İndir');
  });
  it('suggests one context-appropriate empty-state action', () => {
    state.set('people', {});
    state.set('player.script', '');
    cleanup = initProjectFeedback();
    const hint = document.getElementById('workspaceEmptyHint');
    expect(hint.textContent).toBe('İlk kişini ekle');
    state.set('people', { Ayşe: {} });
    expect(hint.textContent).toBe('İlk mesajını yaz');
    state.set('player.script', 'Ayşe: Merhaba');
    expect(hint.hidden).toBe(true);
  });
});
