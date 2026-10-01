/* ========================================
   MESSAGE EDITOR - Telefonda WYSIWYG düzenleme
   #chatBody üzerinde baloncuğa basılı tutunca metin/saat/gönderen
   düzenleme ve silme popover'ı açar. state.messages üzerinde
   çalışır; ekran görüntüsü değişikliği yakalar.
   ======================================== */

import { $, createElement } from '../utils.js';
import { state } from '../state.js';
import { openModal } from '../ui/modal.js';
import { editMessage, removeMessage } from './messages.js';
import { runUndoable } from '../features/history.js';
import { showSuccess } from '../ui/toast.js';

const bindings = new WeakMap();
const interactive = '.msg-voice-play, .msg-media-img, .msg-video, a, button, input, textarea, select';

/** Düzenleme formu için gönderen seçenekleri (kişiler + Ben) */
function buildSpeakerOptions(current) {
  const people = state.get('people') || {};
  const names = Object.keys(people);
  const selfName = state.get('selfName');
  if (selfName && !names.some((n) => n.toLowerCase() === selfName.toLowerCase())) {
    names.unshift(selfName);
  }
  if (current && !names.some((n) => n.toLowerCase() === String(current).toLowerCase())) {
    names.unshift(current);
  }
  return names.map((name) => createElement('option', { value: name }, [name]));
}

/** Bir mesaj için düzenleme modalını aç */
function openEditor(msg) {
  const textArea = createElement('textarea', {
    className: 'msg-edit-text',
    rows: '3',
    placeholder: 'Mesaj metni',
  });
  textArea.value = msg.text || '';

  const timeInput = createElement('input', {
    type: 'text',
    className: 'msg-edit-time',
    placeholder: 'örn. 14:32',
  });
  timeInput.value = msg.time || '';

  const speakerSelect = createElement('select', { className: 'msg-edit-speaker' },
    buildSpeakerOptions(msg.speaker));
  speakerSelect.value = msg.speaker || '';

  const body = createElement('div', { className: 'msg-edit-form' }, [
    createElement('label', { className: 'msg-edit-label' }, ['Gönderen']),
    speakerSelect,
    createElement('label', { className: 'msg-edit-label' }, ['Metin']),
    textArea,
    createElement('label', { className: 'msg-edit-label' }, ['Saat']),
    timeInput,
  ]);

  let focusTimer = null;
  openModal({
    title: 'Mesajı Düzenle',
    bodyNode: body,
    onClose: () => clearTimeout(focusTimer),
    buttons: [
      { label: 'Vazgeç', className: 'secondary', value: 'cancel' },
      {
        label: 'Sil',
        icon: 'trash',
        className: 'danger',
        onClick: () => {
          runUndoable({
            message: 'Mesaj silindi',
            action: () => removeMessage(msg.id),
          });
        },
      },
      {
        label: 'Kaydet',
        icon: 'check',
        onClick: () => {
          const patch = {
            text: textArea.value,
            time: timeInput.value.trim(),
            speaker: speakerSelect.value,
          };
          editMessage(msg.id, patch);
          showSuccess('Mesaj güncellendi!');
        },
      },
    ],
  });
  // A quick cancellation must not refocus a detached editor.
  focusTimer = setTimeout(() => { if (textArea.isConnected) textArea.focus(); }, 50);
}

/** Deliberate 500 ms hold, or keyboard activation; normal taps do not edit. */
export function initMessageEditor() {
  const chatBody = $('chatBody');
  if (!chatBody) return;
  bindings.get(chatBody)?.();
  let press = null;
  const listeners = [];
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    listeners.push(() => target.removeEventListener(type, handler, options));
  };
  const cancel = () => {
    if (press) clearTimeout(press.timer);
    press = null;
  };
  const bubbleFor = (target) => {
    if (target?.closest?.(interactive)) return null;
    const bubble = target?.closest?.('.msg-row[data-msg-id] .msg-bubble');
    return bubble && chatBody.contains(bubble) ? bubble : null;
  };
  const editBubble = (bubble) => {
    if (!chatBody.contains(bubble)) return;
    const id = Number(bubble.closest('.msg-row').dataset.msgId);
    if (!Number.isFinite(id)) return;
    const msg = (state.get('messages') || []).find((m) => String(m.id) === String(id));
    if (msg) openEditor(msg);
  };

  listen(chatBody, 'pointerdown', (event) => {
    cancel();
    if (event.button !== 0 || event.isPrimary === false) return;
    const bubble = bubbleFor(event.target);
    if (!bubble) return;
    press = { id: event.pointerId, x: event.clientX, y: event.clientY };
    press.timer = setTimeout(() => { cancel(); editBubble(bubble); }, 500);
  });
  // Do not block native scrolling or capture the pointer.
  listen(document, 'pointerdown', (event) => {
    if (press && (event.isPrimary === false || event.pointerId !== press.id)) cancel();
  }, true);
  listen(document, 'pointermove', (event) => {
    if (press && event.pointerId === press.id &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) cancel();
  }, { passive: true });
  for (const type of ['pointerup', 'pointercancel']) listen(document, type, cancel);
  listen(chatBody, 'pointerleave', cancel);
  listen(chatBody, 'scroll', cancel, { passive: true, capture: true });
  listen(window, 'blur', cancel);
  listen(document, 'visibilitychange', cancel);
  listen(chatBody, 'contextmenu', (event) => {
    if (bubbleFor(event.target)) event.preventDefault();
  });
  listen(chatBody, 'keydown', (event) => {
    const bubble = bubbleFor(event.target);
    if (!bubble || event.target !== bubble || event.repeat || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    cancel();
    editBubble(bubble);
  });
  const dispose = () => {
    cancel();
    listeners.forEach(remove => remove());
    if (bindings.get(chatBody) === dispose) bindings.delete(chatBody);
  };
  bindings.set(chatBody, dispose);
  return dispose;
}
