import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  editMessage: vi.fn(),
  removeMessage: vi.fn(),
  runUndoable: vi.fn(),
  showSuccess: vi.fn(),
}));

vi.mock('../js/state.js', () => ({ state: { get: mocks.get, set: mocks.set } }));
vi.mock('../js/phone/messages.js', () => ({
  editMessage: mocks.editMessage,
  removeMessage: mocks.removeMessage,
}));
vi.mock('../js/features/history.js', () => ({ runUndoable: mocks.runUndoable }));
vi.mock('../js/ui/toast.js', () => ({ showSuccess: mocks.showSuccess }));
vi.mock('../js/ui/modal.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, openModal: vi.fn(actual.openModal) };
});

import { initMessageEditor } from '../js/phone/message-editor.js';
import { openModal } from '../js/ui/modal.js';
import { surfaceManager } from '../js/ui/surface-manager.js';

describe('message editor hold and keyboard interactions', () => {
  let chatBody;
  let bubble;
  let values;
  let disposers;

  function pointer(target, type, options = {}) {
    const { pointerId = 1, isPrimary = true, ...mouseOptions } = options;
    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX: 40,
      clientY: 60,
      ...mouseOptions,
    });
    Object.defineProperties(event, {
      pointerId: { value: pointerId },
      isPrimary: { value: isPrimary },
    });
    target.dispatchEvent(event);
    return event;
  }

  function initialize() {
    const dispose = initMessageEditor();
    disposers.push(dispose);
    return dispose;
  }

  function hold(target = bubble) {
    pointer(target, 'pointerdown');
    vi.advanceTimersByTime(500);
  }

  function closeEditor() {
    const modal = openModal.mock.results.at(-1)?.value;
    modal?.close('test');
    vi.advanceTimersByTime(200);
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    document.body.innerHTML = `
      <main id="appBackground">
        <div id="chatBody">
          <div class="msg-row" data-msg-id="7">
            <span class="msg-avatar">Avatar</span>
            <div class="msg-bubble" tabindex="0">
              <span class="msg-text">Original</span>
              <span class="msg-voice-play">Play</span>
              <img class="msg-media-img" alt="Media">
              <video class="msg-video"></video>
              <a href="#">Link</a>
              <button type="button">Action</button>
              <input value="Input">
              <textarea>Text</textarea>
              <select><option>Option</option></select>
            </div>
          </div>
        </div>
      </main>`;
    chatBody = document.querySelector('#chatBody');
    bubble = chatBody.querySelector('.msg-bubble');
    values = {
      messages: [{ id: 7, speaker: 'Me', text: 'Original', time: '12:00' }],
      people: { Ali: {} },
      selfName: 'Me',
    };
    mocks.get.mockImplementation((key) => values[key]);
    mocks.runUndoable.mockImplementation(({ action }) => action());
    disposers = [];
    initialize();
  });

  afterEach(() => {
    disposers.forEach((dispose) => dispose?.());
    while (surfaceManager.top()?.id?.startsWith('app-modal-')) {
      surfaceManager.close(surfaceManager.top().id, { restoreFocus: false });
    }
    vi.clearAllTimers();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('opens once only after a 500ms hold on the bubble text', () => {
    pointer(bubble.querySelector('.msg-text'), 'pointerdown');
    vi.advanceTimersByTime(499);
    expect(openModal).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(openModal).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.msg-edit-text').value).toBe('Original');
    expect(document.querySelector('.msg-edit-time').value).toBe('12:00');
    vi.advanceTimersByTime(1000);
    pointer(bubble, 'pointerup');
    bubble.click();
    expect(openModal).toHaveBeenCalledTimes(1);
  });

  it('does not open for an ordinary click or a released short press', () => {
    bubble.click();
    pointer(bubble, 'pointerdown');
    vi.advanceTimersByTime(200);
    pointer(bubble, 'pointerup');
    bubble.click();
    vi.advanceTimersByTime(1000);
    expect(openModal).not.toHaveBeenCalled();
  });

  it('cancels pending holds on release, pointer cancellation, leave, or scroll', () => {
    for (const type of ['pointerup', 'pointercancel', 'pointerleave', 'scroll']) {
      pointer(bubble, 'pointerdown');
      vi.advanceTimersByTime(200);
      if (type === 'scroll') chatBody.dispatchEvent(new Event('scroll'));
      else pointer(type === 'pointerleave' ? chatBody : bubble, type);
      vi.advanceTimersByTime(500);
      expect(openModal, type).not.toHaveBeenCalled();
    }
  });

  it('cancels movement over 10px but permits movement exactly at the threshold', () => {
    pointer(bubble, 'pointerdown');
    pointer(bubble, 'pointermove', { clientX: 51 });
    vi.advanceTimersByTime(500);
    expect(openModal).not.toHaveBeenCalled();

    pointer(bubble, 'pointerdown');
    pointer(bubble, 'pointermove', { clientX: 46, clientY: 68 });
    vi.advanceTimersByTime(500);
    expect(openModal).toHaveBeenCalledTimes(1);
  });

  it('ignores non-primary pointers and non-left mouse buttons', () => {
    pointer(bubble, 'pointerdown', { isPrimary: false });
    vi.advanceTimersByTime(500);
    pointer(bubble, 'pointerdown', { button: 2 });
    vi.advanceTimersByTime(500);
    expect(openModal).not.toHaveBeenCalled();

    pointer(bubble, 'pointerdown');
    vi.advanceTimersByTime(200);
    pointer(document.body, 'pointerdown', { pointerId: 2, isPrimary: false });
    vi.advanceTimersByTime(500);
    expect(openModal).not.toHaveBeenCalled();
  });

  it('does not intercept media, links, buttons, or form controls inside a bubble', () => {
    for (const selector of [
      '.msg-voice-play', '.msg-media-img', '.msg-video', 'a',
      'button', 'input', 'textarea', 'select',
    ]) {
      const target = bubble.querySelector(selector);
      hold(target);
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      pointer(target, 'pointerup');
      expect(openModal, selector).not.toHaveBeenCalled();
    }
  });

  it('does not edit from an avatar, row whitespace, or outside the chat', () => {
    for (const target of [chatBody.querySelector('.msg-avatar'), bubble.parentElement, document.body]) {
      hold(target);
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      pointer(target, 'pointerup');
    }
    expect(openModal).not.toHaveBeenCalled();
  });

  it('supports Enter and Space on bubbles without repeated-key openings', () => {
    for (const key of ['Enter', ' ']) {
      const keydown = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      bubble.dispatchEvent(keydown);
      expect(keydown.defaultPrevented).toBe(true);
      expect(openModal).toHaveBeenCalledTimes(1);
      bubble.dispatchEvent(new KeyboardEvent('keydown', { key, repeat: true, bubbles: true }));
      expect(openModal).toHaveBeenCalledTimes(1);
      closeEditor();
      openModal.mockClear();
    }
  });

  it('closes with Vazgeç without editing, deleting, history, toast, or state writes', () => {
    hold();
    document.querySelector('.msg-edit-text').value = 'Unsaved changes';
    const options = openModal.mock.calls[0][0];
    const cancel = options.buttons.find((button) => button.label === 'Vazgeç');
    expect(cancel).toMatchObject({ className: 'secondary', value: 'cancel' });
    expect(cancel.onClick).toBeUndefined();
    const cancelButton = [...document.querySelectorAll('.app-modal-actions button')]
      .find((button) => button.textContent === 'Vazgeç');
    cancelButton.click();
    expect(surfaceManager.size()).toBe(0);
    vi.advanceTimersByTime(200);
    expect(document.querySelector('.app-modal-overlay')).toBeNull();
    expect(mocks.editMessage).not.toHaveBeenCalled();
    expect(mocks.removeMessage).not.toHaveBeenCalled();
    expect(mocks.runUndoable).not.toHaveBeenCalled();
    expect(mocks.showSuccess).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
    expect(values.messages[0].text).toBe('Original');
  });

  it('preserves save and undoable deletion actions', () => {
    hold();
    document.querySelector('.msg-edit-text').value = 'Edited';
    document.querySelector('.msg-edit-time').value = ' 13:04 ';
    document.querySelector('.msg-edit-speaker').value = 'Ali';
    openModal.mock.calls[0][0].buttons.find((button) => button.label === 'Kaydet').onClick();
    expect(mocks.editMessage).toHaveBeenCalledWith(7, { text: 'Edited', time: '13:04', speaker: 'Ali' });
    expect(mocks.showSuccess).toHaveBeenCalledTimes(1);
    openModal.mock.calls[0][0].buttons.find((button) => button.label === 'Sil').onClick();
    expect(mocks.runUndoable).toHaveBeenCalledTimes(1);
    expect(mocks.removeMessage).toHaveBeenCalledWith(7);
  });

  it('quick cancel does not refocus the closing editor', () => {
    hold();
    const textarea = document.querySelector('.msg-edit-text');
    const cancelButton = [...document.querySelectorAll('.app-modal-actions button')]
      .find((button) => button.textContent === 'Vazgeç');
    cancelButton.click();
    expect(textarea.isConnected).toBe(true);
    vi.advanceTimersByTime(50);
    expect(document.activeElement).not.toBe(textarea);
    expect(surfaceManager.size()).toBe(0);
  });

  it('deduplicates initialization and disposes pending holds and listeners', () => {
    const dispose = initialize();
    expect(dispose).toBeTypeOf('function');
    hold();
    expect(openModal).toHaveBeenCalledTimes(1);
    closeEditor();
    openModal.mockClear();
    pointer(bubble, 'pointerdown');
    vi.advanceTimersByTime(200);
    disposers.forEach((cleanup) => cleanup?.());
    vi.advanceTimersByTime(500);
    hold();
    bubble.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(openModal).not.toHaveBeenCalled();
    initialize();
    hold();
    expect(openModal).toHaveBeenCalledTimes(1);
  });

  it('does not open if the message is removed before the hold completes', () => {
    pointer(bubble, 'pointerdown');
    vi.advanceTimersByTime(200);
    values.messages = [];
    vi.advanceTimersByTime(500);
    expect(openModal).not.toHaveBeenCalled();
  });
});
