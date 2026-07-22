/* ========================================
   MESSAGE EDITOR - Telefonda WYSIWYG düzenleme
   #chatBody üzerinde baloncuğa tıklayınca metin/saat/gönderen
   düzenleme ve silme popover'ı açar. state.messages üzerinde
   çalışır; ekran görüntüsü değişikliği yakalar.
   ======================================== */

import { $, createElement } from '../utils.js';
import { state } from '../state.js';
import { openModal } from '../ui/modal.js';
import { editMessage, removeMessage } from './messages.js';
import { runUndoable } from '../features/history.js';
import { showSuccess } from '../ui/toast.js';

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

  openModal({
    title: 'Mesajı Düzenle',
    bodyNode: body,
    buttons: [
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
  // Metin alanına odaklan
  setTimeout(() => textArea.focus(), 50);
}

/** #chatBody tıklama delegasyonu — baloncuğu düzenle */
export function initMessageEditor() {
  const chatBody = $('chatBody');
  if (!chatBody) return;

  chatBody.addEventListener('click', (e) => {
    // Mevcut etkileşimli öğelere dokunma (ses oynatma, medya, bağlantı vb.)
    if (e.target.closest('.msg-voice-play, .msg-media-img, .msg-video, a, button')) return;

    const row = e.target.closest('.msg-row[data-msg-id]');
    if (!row || !chatBody.contains(row)) return;

    const id = Number(row.dataset.msgId);
    if (!Number.isFinite(id)) return;

    const msg = (state.get('messages') || []).find((m) => String(m.id) === String(id));
    if (!msg) return;

    openEditor(msg);
  });
}
