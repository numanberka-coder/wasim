/** @vitest-environment jsdom */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

let player, state;

beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML = `<div id="chatBody"></div><div id="headerStatus"></div>
    <textarea id="scriptBox"></textarea><input id="speed" value="200"><input id="jitter" value="0">`;
  ({ state } = await import('../js/state.js'));
  state.reset();
  player = await import('../js/features/player.js');
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  player.pause();
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.body.innerHTML = '';
});

function load(script) {
  document.getElementById('scriptBox').value = script;
  return player.loadScript();
}

function texts() {
  return state.get('messages').map(message => message.text);
}

describe('player continuity and conversation isolation', () => {
  it('loads changed editor text and plays it without a transfer step', () => {
    load('Me: Eski');
    load('Me: Yeni\nAli: Yanıt');
    expect(player.play()).toBe(true);
    vi.runAllTimers();
    expect(texts()).toEqual(['Yeni', 'Yanıt']);
    expect(state.get('player').cursor).toBe(2);
    expect(player.isPlayerPlaying()).toBe(false);
  });

  it('keeps a pending incoming message on pause, removes typing, and resumes once', () => {
    load('Ali: Bekleyen mesaj\nMe: Cevap');
    player.play();
    expect(document.querySelector('.typing-row')).not.toBeNull();
    expect(state.get('player').cursor).toBe(0);
    vi.advanceTimersByTime(100);
    player.pause();
    expect(document.querySelector('.typing-row')).toBeNull();
    vi.advanceTimersByTime(5000);
    expect(texts()).toEqual([]);
    player.play();
    vi.runAllTimers();
    expect(texts()).toEqual(['Bekleyen mesaj', 'Cevap']);
  });

  it('does not skip a pending self message or duplicate timers on repeated play', () => {
    load('Me: Bir\nMe: İki');
    player.play();
    player.play();
    vi.advanceTimersByTime(30);
    player.pause();
    expect(texts()).toEqual([]);
    player.play();
    player.play();
    vi.runAllTimers();
    expect(texts()).toEqual(['Bir', 'İki']);
  });

  it('does not replay an already completed event when paused between messages', () => {
    load('Me: Bir\nMe: İki');
    player.play();
    vi.advanceTimersByTime(80);
    expect(texts()).toEqual(['Bir']);
    player.pause();
    player.play();
    vi.runAllTimers();
    expect(texts()).toEqual(['Bir', 'İki']);
  });

  it('cancels pending delivery immediately when another conversation is selected', () => {
    const original = state.get('conversations.activeId');
    const other = state.addConversation({ title: 'Başka sohbet' });
    state.selectConversation(original);
    load('Ali: Yalnız ilk sohbete');
    player.play();
    state.selectConversation(other.id);
    expect(state.get('player').paused).toBe(true);
    expect(document.querySelector('.typing-row')).toBeNull();
    vi.runAllTimers();
    expect(texts()).toEqual([]);
    expect(player.play()).toBe(false);
    state.selectConversation(original);
    expect(player.play()).toBe(true);
    vi.runAllTimers();
    expect(texts()).toEqual(['Yalnız ilk sohbete']);
    expect(state.get('conversations.items').find(item => item.id === other.id).messages).toEqual([]);
  });

  it('also guards a silent target switch at timer delivery', () => {
    const original = state.get('conversations.activeId');
    const other = state.addConversation({ title: 'Başka sohbet' });
    state.selectConversation(original);
    load('Me: Yanlış yere gitmemeli');
    player.play();
    state.selectConversation(other.id, true);
    vi.runAllTimers();
    expect(texts()).toEqual([]);
    expect(state.get('player').cursor).toBe(0);
  });

  it('emits loaded/reset/step progress after state changes and supports a pending step', () => {
    const snapshots = [];
    state.subscribe(path => {
      if (path === 'player.playback') snapshots.push({ cursor: state.get('player').cursor, count: state.get('player').queue.length });
    });
    load('Me: Tek adım');
    expect(snapshots.at(-1)).toEqual({ cursor: 0, count: 1 });
    expect(player.step()).toBe(true);
    player.pause();
    expect(player.step()).toBe(true);
    vi.runAllTimers();
    expect(texts()).toEqual(['Tek adım']);
    expect(snapshots.at(-1)).toEqual({ cursor: 1, count: 1 });
    player.reset();
    expect(snapshots.at(-1)).toEqual({ cursor: 0, count: 0 });
  });

  it('cancels the old player timers on project import', () => {
    load('Ali: Eski projenin bekleyen mesajı');
    player.play();
    state.import({ group: { title: 'Açılan proje' }, player: { script: 'Me: Yeni' } });
    vi.runAllTimers();
    expect(texts()).toEqual([]);
    expect(document.querySelector('.typing-row')).toBeNull();
    expect(state.get('player').queue).toEqual([]);
    expect(state.get('player').cursor).toBe(0);
  });
});
