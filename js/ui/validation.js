/* ========================================
   VALIDATION - Inline helpers
   ======================================== */

import { $ } from '../utils.js';

export function markInvalid(id, message) {
  const input = $(id);
  if (!input) return;
  input.classList.add('input-error');
  const container = input.closest('.form-group') || input.parentElement;
  let hint = container?.querySelector('.field-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.className = 'field-hint error';
    container?.appendChild(hint);
  }
  if (hint) {
    hint.textContent = message;
  }
}

export function clearInvalid(id) {
  const input = $(id);
  if (!input) return;
  input.classList.remove('input-error');
  const container = input.closest('.form-group') || input.parentElement;
  const hint = container?.querySelector('.field-hint');
  if (hint) {
    hint.remove();
  }
}

export function showHint(id, message) {
  const input = $(id);
  const container = input?.closest('.form-group') || input?.parentElement;
  if (!container) return;
  let hint = container.querySelector('.field-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.className = 'field-hint';
    container.appendChild(hint);
  }
  hint.textContent = message;
}
