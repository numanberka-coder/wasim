/* ========================================
   MESSAGES - Message Management & Rendering
   ======================================== */

import { $, escapeHtml, timeToMinutes, minutesToTime, nowTime, Logger } from '../utils.js';
import { showToast } from '../ui/toast.js';
import { state } from '../state.js';



/**
 * Get next message time based on settings
 */
function getNextMessageTime() {
  const messageTimes = state.get('messageTimes');
  const messages = state.get('messages');
  
  const autoBase = timeToMinutes(messageTimes.baseTime);
  const increment = Math.max(0, Number(messageTimes.increment) || 0);

  if (messageTimes.auto) {
    const start = autoBase !== null ? autoBase : (timeToMinutes(nowTime()) || 0);
    return minutesToTime(start + messages.length * increment);
  }

  // Manual mode - increment from last message
  const lastMsg = messages[messages.length - 1];
  if (lastMsg) {
    const lastMin = timeToMinutes(lastMsg.time);
    if (lastMin !== null) {
      return minutesToTime(lastMin + Math.max(1, increment || 1));
    }
  }

  if (autoBase !== null) return minutesToTime(autoBase);
  return nowTime();
}

/**
 * Create avatar element for speaker
 */
function createAvatarNode(name) {
  const people = state.get('people');
  const av = document.createElement('div');
  av.className = 'msg-avatar';

  const initial = document.createTextNode((name[0] || '?').toUpperCase());
  av.appendChild(initial);

  const url = (people[name]?.avatar || '').trim();
  if (url) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = name;
    img.onerror = () => { img.remove(); };
    av.appendChild(img);
  }

  return av;
}


/**
 * Format voice duration (seconds) as mm:ss
 */
function formatVoiceDuration(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const mm = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}


/**
 * Get a short one-line snippet for a message (used in replies & reactions UI)
 */
function getMessageSnippet(m) {
  const kind = m?.kind || null;
  const caption = String(m?.text || '').trim();

  if (kind === 'photo') return caption ? `📷 ${caption}` : '📷 Fotoğraf';
  if (kind === 'gif') return caption ? `🎞️ ${caption}` : '🎞️ GIF';
  if (kind === 'video') return caption ? `🎬 ${caption}` : '🎬 Video';
  if (kind === 'voice') {
    const d = (typeof m?.durationSec === 'number') ? formatVoiceDuration(m.durationSec) : null;
    return d ? `🎤 Sesli mesaj (${d})` : '🎤 Sesli mesaj';
  }
  if (kind === 'location') return `📍 ${caption || 'Konum'}`;
  if (kind === 'document') return `📄 ${caption || 'Dosya'}`;
  if (kind === 'sticker') return '🎭 Sticker';
  if (kind === 'link') return `🔗 ${caption || 'Bağlantı'}`;
  if (kind === 'viewonce') return '👁️ Bir kez görüntüle';

  return caption || 'Mesaj';
}

/**
 * Simple seeded random for deterministic waveforms
 */
function seededRand(seed) {
  let x = (seed || 1) % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}


/**
 * Determine grouping context for a message
 * Returns: { isFirst, isLast, isMiddle }
 */
function getGroupContext(msg) {
  const all = state.get('messages') || [];
  const idx = all.findIndex(m => m.id === msg.id);
  if (idx === -1) return { isFirst: true, isLast: true, isMiddle: false };

  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  const samePrev = prev && String(prev.speaker).toLowerCase() === String(msg.speaker).toLowerCase();
  const sameNext = next && String(next.speaker).toLowerCase() === String(msg.speaker).toLowerCase();

  return {
    isFirst: !samePrev,
    isLast: !sameNext,
    isMiddle: samePrev && sameNext,
  };
}

/**
 * SVG double-tick � WhatsApp Web Orijinal Tasar�m�
 */
function createTickSVG(status = 'read') {
  if (status === true) status = 'read';
  if (status === false) status = 'delivered';

  const isSent = status === 'sent';
  const isRead = status === 'read';
  const color = isRead ? '#53bdeb' : '#8696a0';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', isSent ? '11' : '15');
  svg.setAttribute('height', '11');
  svg.setAttribute('viewBox', isSent ? '0 0 11 11' : '0 0 15 11');
  svg.style.flexShrink = '0';
  svg.style.marginLeft = '3px';

  if (isSent) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M1 5.5L4 8.5L10 1.5');
    p.setAttribute('stroke', color);
    p.setAttribute('stroke-width', '1.8');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    p.setAttribute('fill', 'none');
    svg.appendChild(p);
  } else {
    // Sol tik
    const left = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    left.setAttribute('d', 'M1 5.5L4 8.5L10 1.5');
    left.setAttribute('stroke', color);
    left.setAttribute('stroke-width', '1.8');
    left.setAttribute('stroke-linecap', 'round');
    left.setAttribute('stroke-linejoin', 'round');
    left.setAttribute('fill', 'none');
    svg.appendChild(left);

    // Sağ tik — sol bacak kısaltıldı, W görünümü giderildi
    const right = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    right.setAttribute('d', 'M6.5 6.5L8 8.5L14 1.5');
    right.setAttribute('stroke', color);
    right.setAttribute('stroke-width', '1.8');
    right.setAttribute('stroke-linecap', 'round');
    right.setAttribute('stroke-linejoin', 'round');
    right.setAttribute('fill', 'none');
    svg.appendChild(right);
  }

  return svg;
}

// === MESSAGE CONTENT RENDERERS ===

const VOICE_PLAY_ICON  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
const VOICE_PAUSE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

const VOICE_WAVEFORM_BARS = 26;
const VOICE_TICK_MS = 80;
const VOICE_DEFAULT_DURATION = 12;

const DOC_EXT_COLORS = {
  pdf: '#f44336', doc: '#2196f3', docx: '#2196f3',
  xls: '#4caf50', xlsx: '#4caf50', ppt: '#ff5722', pptx: '#ff5722',
  zip: '#9c27b0', rar: '#9c27b0', txt: '#607d8b'
};

const REPLY_FALLBACK_COLOR = '#a78bfa';

function renderPhotoContent(msg, bubble) {
  const media = document.createElement('div');
  media.className = 'msg-media';

  const img = document.createElement('img');
  img.className = 'msg-media-img';
  img.alt = msg.kind === 'gif' ? 'GIF' : 'Fotoğraf';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = (msg.src || '').trim();

  img.addEventListener('click', () => {
    const url = (msg.src || '').trim();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  });

  img.onerror = () => {
    img.style.display = 'none';
    const fallback = document.createElement('div');
    fallback.className = 'msg-media-fallback';
    fallback.textContent = 'Görsel yüklenemedi';
    media.appendChild(fallback);
  };

  media.appendChild(img);
  bubble.appendChild(media);
  appendCaption(msg, bubble);
}

function renderVideoContent(msg, bubble) {
  const video = document.createElement('div');
  video.className = 'msg-video';
  video.title = 'Video (önizleme)';

  const play = document.createElement('div');
  play.className = 'msg-video-play';
  play.textContent = '▶';

  const label = document.createElement('div');
  label.className = 'msg-video-label';
  label.textContent = 'Video';

  video.appendChild(play);
  video.appendChild(label);

  video.addEventListener('click', () => {
    const url = (msg.src || '').trim();
    showToast(url ? `Video önizleme: ${url}` : 'Video önizleme');
  });

  bubble.appendChild(video);
  appendCaption(msg, bubble);
}

function renderVoiceContent(msg, bubble) {
  const voice = document.createElement('div');
  voice.className = 'msg-voice';

  const play = document.createElement('div');
  play.className = 'msg-voice-play';
  play.innerHTML = VOICE_PLAY_ICON;

  const body = document.createElement('div');
  body.className = 'msg-voice-body';

  const wave = document.createElement('div');
  wave.className = 'msg-voice-wave';
  const rnd = seededRand(Number(msg.id) + 17);
  for (let i = 0; i < VOICE_WAVEFORM_BARS; i++) {
    const bar = document.createElement('span');
    bar.style.height = `${5 + Math.floor(rnd() * 17)}px`;
    wave.appendChild(bar);
  }

  const footer = document.createElement('div');
  footer.className = 'msg-voice-footer';

  const duration = msg.durationSec || VOICE_DEFAULT_DURATION;
  const dur = document.createElement('div');
  dur.className = 'msg-voice-dur';
  dur.textContent = formatVoiceDuration(duration);

  const mic = document.createElement('div');
  mic.className = 'msg-voice-mic';
  mic.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;

  footer.appendChild(dur);
  footer.appendChild(mic);
  body.appendChild(wave);
  body.appendChild(footer);

  play.addEventListener('click', (e) => {
    e.stopPropagation();

    if (voice._playTimer) {
      clearInterval(voice._playTimer);
      voice._playTimer = null;
      voice.classList.remove('playing');
      Array.from(wave.querySelectorAll('span')).forEach(b => b.classList.remove('played', 'current'));
      dur.textContent = formatVoiceDuration(duration);
      play.innerHTML = VOICE_PLAY_ICON;
      return;
    }

    voice.classList.add('playing');
    play.innerHTML = VOICE_PAUSE_ICON;

    const totalSec   = Math.max(1, duration);
    const allBars    = Array.from(wave.querySelectorAll('span'));
    const totalBars  = allBars.length;
    const totalTicks = Math.round((totalSec * 1000) / VOICE_TICK_MS);
    let   tick       = 0;

    voice._playTimer = setInterval(() => {
      tick++;
      const progress   = tick / totalTicks;
      const currentBar = Math.floor(progress * totalBars);
      dur.textContent  = formatVoiceDuration(Math.max(0, Math.round(totalSec * (1 - progress))));

      allBars.forEach((b, i) => {
        if (i < currentBar) { b.classList.add('played'); b.classList.remove('current'); }
        else if (i === currentBar) { b.classList.remove('played'); b.classList.add('current'); }
        else { b.classList.remove('played', 'current'); }
      });

      if (tick >= totalTicks) {
        clearInterval(voice._playTimer);
        voice._playTimer = null;
        voice.classList.remove('playing');
        play.innerHTML = VOICE_PLAY_ICON;
        setTimeout(() => {
          allBars.forEach(b => b.classList.remove('played', 'current'));
          dur.textContent = formatVoiceDuration(duration);
        }, 400);
      }
    }, VOICE_TICK_MS);
  });

  voice.appendChild(play);
  voice.appendChild(body);
  bubble.appendChild(voice);
  appendCaption(msg, bubble);
}

function renderLocationContent(msg, bubble) {
  const loc = document.createElement('div');
  loc.className = 'msg-location';

  const map = document.createElement('div');
  map.className = 'msg-location-map';
  map.innerHTML = `
    <svg class="msg-location-pin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ea4335" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  `;

  const info = document.createElement('div');
  info.className = 'msg-location-info';

  const locName = document.createElement('div');
  locName.className = 'msg-location-name';
  locName.textContent = msg.text || 'Konum';

  const locSub = document.createElement('div');
  locSub.className = 'msg-location-sub';
  locSub.textContent = msg.src || '';

  info.appendChild(locName);
  if (msg.src) info.appendChild(locSub);

  loc.appendChild(map);
  loc.appendChild(info);
  bubble.appendChild(loc);
}

function renderDocumentContent(msg, bubble) {
  const doc = document.createElement('div');
  doc.className = 'msg-document';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'msg-document-icon';

  const filename = msg.text || 'dosya.pdf';
  const ext = (filename.split('.').pop() || 'pdf').toLowerCase();
  const iconColor = DOC_EXT_COLORS[ext] || '#607d8b';

  iconWrap.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="${iconColor}" opacity="0.9"/>
      <path d="M14 2v6h6" fill="rgba(0,0,0,0.2)"/>
      <text x="12" y="17" text-anchor="middle" fill="white" font-size="5" font-weight="700" font-family="Roboto,sans-serif">${ext.toUpperCase().slice(0,4)}</text>
    </svg>
  `;

  const docMeta = document.createElement('div');
  docMeta.className = 'msg-document-meta';

  const docName = document.createElement('div');
  docName.className = 'msg-document-name';
  docName.textContent = filename;

  const docSize = document.createElement('div');
  docSize.className = 'msg-document-size';
  docSize.textContent = msg.src || '· PDF';

  docMeta.appendChild(docName);
  docMeta.appendChild(docSize);

  const dlIcon = document.createElement('div');
  dlIcon.className = 'msg-document-dl';
  dlIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M12 2v12m0 0l-4-4m4 4l4-4M3 20h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  doc.appendChild(iconWrap);
  doc.appendChild(docMeta);
  doc.appendChild(dlIcon);
  bubble.appendChild(doc);
}

function renderStickerContent(msg, bubble) {
  bubble.classList.add('sticker-bubble');

  const stickerWrap = document.createElement('div');
  stickerWrap.className = 'msg-sticker';

  if (msg.src) {
    const img = document.createElement('img');
    img.className = 'msg-sticker-img';
    img.src = msg.src;
    img.alt = 'Sticker';
    img.loading = 'lazy';
    img.onerror = () => {
      img.style.display = 'none';
      const fb = document.createElement('div');
      fb.className = 'msg-sticker-fallback';
      fb.textContent = msg.text || '🙂';
      stickerWrap.appendChild(fb);
    };
    stickerWrap.appendChild(img);
  } else {
    const fb = document.createElement('div');
    fb.className = 'msg-sticker-fallback';
    fb.textContent = msg.text || '🙂';
    stickerWrap.appendChild(fb);
  }

  bubble.appendChild(stickerWrap);
}

function renderLinkContent(msg, bubble) {
  const link = document.createElement('div');
  link.className = 'msg-link';

  if (msg.src) {
    const thumb = document.createElement('div');
    thumb.className = 'msg-link-thumb';
    const thumbImg = document.createElement('img');
    thumbImg.src = msg.src;
    thumbImg.alt = '';
    thumbImg.onerror = () => thumb.remove();
    thumb.appendChild(thumbImg);
    link.appendChild(thumb);
  } else {
    const thumbPlaceholder = document.createElement('div');
    thumbPlaceholder.className = 'msg-link-thumb msg-link-thumb-placeholder';
    thumbPlaceholder.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    link.appendChild(thumbPlaceholder);
  }

  const linkBody = document.createElement('div');
  linkBody.className = 'msg-link-body';

  const siteName = document.createElement('div');
  siteName.className = 'msg-link-site';
  const urlText = msg.replyTo || '';
  let domain = '';
  try { domain = urlText ? new URL(urlText.startsWith('http') ? urlText : 'https://' + urlText).hostname : ''; } catch(e) {}
  siteName.textContent = domain || 'Web';

  const linkTitle = document.createElement('div');
  linkTitle.className = 'msg-link-title';
  linkTitle.textContent = msg.text || 'Bağlantı önizleme';

  const linkUrl = document.createElement('div');
  linkUrl.className = 'msg-link-url';
  linkUrl.textContent = typeof msg.durationSec === 'string' ? msg.durationSec : (msg.replyTo || '');

  linkBody.appendChild(siteName);
  linkBody.appendChild(linkTitle);
  if (linkUrl.textContent) linkBody.appendChild(linkUrl);
  link.appendChild(linkBody);
  bubble.appendChild(link);
}

function renderViewOnceContent(msg, bubble) {
  const vo = document.createElement('div');
  vo.className = 'msg-viewonce';

  const voIcon = document.createElement('div');
  voIcon.className = 'msg-viewonce-icon';
  voIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>`;

  const voLabel = document.createElement('div');
  voLabel.className = 'msg-viewonce-label';

  const voType = document.createElement('div');
  voType.className = 'msg-viewonce-type';
  voType.textContent = msg.src === 'video' ? 'Video' : 'Fotoğraf';

  const voSub = document.createElement('div');
  voSub.className = 'msg-viewonce-sub';
  voSub.textContent = 'Bir kez görüntüle';

  voLabel.appendChild(voType);
  voLabel.appendChild(voSub);
  vo.appendChild(voIcon);
  vo.appendChild(voLabel);
  bubble.appendChild(vo);
}

function renderTextContent(msg, bubble) {
  const textEl = document.createElement('span');
  textEl.className = 'msg-text';
  textEl.textContent = msg.text;
  bubble.appendChild(textEl);
}

/** Opsiyonel caption ekleme (photo, video, voice) */
function appendCaption(msg, bubble) {
  if (msg.text) {
    const caption = document.createElement('div');
    caption.className = 'msg-text msg-caption';
    caption.textContent = msg.text;
    bubble.appendChild(caption);
  }
}

/** Mesaj tipi → renderer dispatch table */
const MESSAGE_RENDERERS = {
  photo:    renderPhotoContent,
  gif:      renderPhotoContent,
  video:    renderVideoContent,
  voice:    renderVoiceContent,
  location: renderLocationContent,
  document: renderDocumentContent,
  sticker:  renderStickerContent,
  link:     renderLinkContent,
  viewonce: renderViewOnceContent,
};

/** Reply hedef mesajını bul — buildMessageRow ve findMessageByTarget ortak kullanır */
function resolveReplyTarget(key, excludeId) {
  if (!key) return null;
  const all = state.get('messages') || [];

  const idMatch = key.match(/^#?(\d+)$/);
  if (idMatch) {
    const idNum = Number(idMatch[1]);
    return all.find(m => Number(m.id) === idNum) || null;
  }

  for (let i = all.length - 1; i >= 0; i--) {
    const m = all[i];
    if (excludeId != null && m?.id === excludeId) continue;
    if (String(m?.text || '').trim() === key) return m;
  }

  for (let i = all.length - 1; i >= 0; i--) {
    const m = all[i];
    if (excludeId != null && m?.id === excludeId) continue;
    if (String(m?.text || '').includes(key)) return m;
  }

  const keyLower = key.toLowerCase();
  for (let i = all.length - 1; i >= 0; i--) {
    const m = all[i];
    if (excludeId != null && m?.id === excludeId) continue;
    if (String(m?.speaker || '').toLowerCase() === keyLower) return m;
  }

  return null;
}

/** Reply bölümünü oluştur */
function renderReplyBlock(msg, bubble) {
  const key = String(msg.replyTo || '').trim();
  const targetMsg = resolveReplyTarget(key, msg.id);

  const reply = document.createElement('div');
  reply.className = 'msg-reply';

  const bar = document.createElement('div');
  bar.className = 'msg-reply-bar';

  const replyName = targetMsg?.speaker ? String(targetMsg.speaker) : (key || 'Biri');
  const color = targetMsg?.speaker ? state.getColorForSpeaker(replyName) : REPLY_FALLBACK_COLOR;
  bar.style.background = color;

  const body = document.createElement('div');
  body.className = 'msg-reply-body';

  const nameEl = document.createElement('div');
  nameEl.className = 'msg-reply-name';
  nameEl.textContent = replyName;
  nameEl.style.color = color;

  const snippetEl = document.createElement('div');
  snippetEl.className = 'msg-reply-snippet';
  snippetEl.textContent = targetMsg ? getMessageSnippet(targetMsg) : '';

  reply.appendChild(bar);
  body.appendChild(nameEl);
  body.appendChild(snippetEl);
  reply.appendChild(body);
  bubble.appendChild(reply);
}

/** Mesaj meta bilgisi (saat + tick) */
function renderMessageMeta(msg, isMe, bubble) {
  if (msg.kind === 'sticker') return;

  const meta = document.createElement('span');
  meta.className = 'msg-meta';

  const time = document.createElement('span');
  time.className = 'msg-time';
  time.textContent = msg.time || '';
  meta.appendChild(time);

  if (isMe) {
    const tickWrapper = document.createElement('span');
    tickWrapper.className = 'msg-tick';
    const tickVal = msg.tickStatus || state.get('settings.tickStatus') || 'read';
    tickWrapper.appendChild(createTickSVG(tickVal));
    meta.appendChild(tickWrapper);
  }

  bubble.appendChild(meta);
}

/** Reaction chip oluştur */
function renderReactionChip(msg, row, bubble) {
  if (!Array.isArray(msg.reactions) || !msg.reactions.length) return;

  const last = msg.reactions[msg.reactions.length - 1] || {};
  const chip = document.createElement('div');
  chip.className = 'msg-reaction';
  chip.textContent = last.emoji || '🙂';

  if (msg.reactions.length > 1) {
    const count = document.createElement('span');
    count.className = 'msg-reaction-count';
    count.textContent = String(msg.reactions.length);
    chip.appendChild(count);
  }

  const title = msg.reactions
    .map(r => `${r?.who || 'Biri'}: ${r?.emoji || ''}`.trim())
    .join('\n');

  if (title) chip.title = title;

  chip.addEventListener('click', (e) => {
    e.stopPropagation();
    if (title) showToast(title);
  });

  bubble.appendChild(chip);
  row.classList.add('has-reaction');
}

/**
 * Build message row element
 */
function buildMessageRow(msg) {
  const isMe = String(msg.speaker).toLowerCase() === 'me';
  const group = getGroupContext(msg);

  const row = document.createElement('div');
  row.className = `msg-row ${isMe ? 'out' : 'in'}`;
  row.dataset.msgId = String(msg.id);
  row.dataset.time = msg.time || '';

  if (group.isFirst) row.classList.add('group-first');
  if (group.isLast) row.classList.add('group-last');
  if (group.isMiddle) row.classList.add('group-middle');

  // Avatar for incoming messages — only on FIRST message in group
  if (!isMe) {
    if (group.isFirst) {
      row.appendChild(createAvatarNode(msg.speaker));
    } else {
      const spacer = document.createElement('div');
      spacer.className = 'msg-avatar-spacer';
      row.appendChild(spacer);
    }
  }

  // Bubble
  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${isMe ? 'out' : 'in'}`;

  if (!group.isFirst) bubble.classList.add('no-tail');
  if (group.isFirst && !group.isLast) bubble.classList.add('group-top');
  if (!group.isFirst && !group.isLast) bubble.classList.add('group-mid');
  if (!group.isFirst && group.isLast) bubble.classList.add('group-bottom');

  // Name for incoming — only on first message in group
  if (!isMe && group.isFirst) {
    const nameEl = document.createElement('div');
    nameEl.className = 'msg-name';
    nameEl.textContent = msg.speaker || '?';
    nameEl.style.color = state.getColorForSpeaker(msg.speaker || '?');
    bubble.appendChild(nameEl);
  }

  // Reply
  if (msg.replyTo) renderReplyBlock(msg, bubble);

  // Content — dispatch table or fallback to text
  const renderer = MESSAGE_RENDERERS[msg.kind];
  if (renderer) {
    renderer(msg, bubble);
  } else {
    renderTextContent(msg, bubble);
  }

  // Meta (time + tick)
  renderMessageMeta(msg, isMe, bubble);

  // Reactions
  renderReactionChip(msg, row, bubble);

  row.appendChild(bubble);
  return row;
}

/**
 * Add a new message
 */
function addMessage({ speaker, text, replyTo = null, time = null, kind = null, src = null, durationSec = null, tickStatus = null } = {}) {
  const chatBody = $('chatBody');
  if (!chatBody) return null;

  const msg = {
    speaker,
    text: String(text || ''),
    replyTo,
    time: time || getNextMessageTime(),
    kind: kind || null,
    src: src || null,
    durationSec: (typeof durationSec === 'number') ? durationSec : (durationSec ?? null),
    tickStatus: tickStatus || null
  };

  // Add to state
  const savedMsg = state.addMessage(msg);

  // Check if previous message is same speaker — if so, re-render it for grouping update
  const allMsgs = state.get('messages') || [];
  const myIdx = allMsgs.findIndex(m => m.id === savedMsg.id);
  if (myIdx > 0) {
    const prevMsg = allMsgs[myIdx - 1];
    if (String(prevMsg.speaker).toLowerCase() === String(savedMsg.speaker).toLowerCase()) {
      const prevRow = chatBody.querySelector(`[data-msg-id="${String(prevMsg.id)}"]`);
      if (prevRow) {
        try {
          const updated = buildMessageRow(prevMsg);
          prevRow.replaceWith(updated);
        } catch (err) {
          Logger.error('Mesaj yeniden render hatası:', prevMsg.id, err);
        }
      }
    }
  }

  // Render new message
  try {
    const row = buildMessageRow(savedMsg);
    chatBody.appendChild(row);
    chatBody.scrollTop = chatBody.scrollHeight;
  } catch (err) {
    Logger.error('Mesaj render hatası:', savedMsg.id, err);
  }

  return savedMsg;
}


/**
 * Find a message by a "target" token (reuses resolveReplyTarget)
 */
function findMessageByTarget(target) {
  return resolveReplyTarget(String(target || '').trim());
}

function updateReactionInDOM(msgId) {
  const row = document.querySelector(`[data-msg-id="${String(msgId)}"]`);
  if (!row) return;

  const bubble = row.querySelector('.msg-bubble');
  if (!bubble) return;

  // clear existing
  bubble.querySelectorAll('.msg-reaction').forEach(el => el.remove());

  const all = state.get('messages') || [];
  const msg = all.find(m => Number(m.id) === Number(msgId));
  const reactions = Array.isArray(msg?.reactions) ? msg.reactions : [];

  if (!reactions.length) {
    row.classList.remove('has-reaction');
    return;
  }

  const last = reactions[reactions.length - 1] || {};
  const chip = document.createElement('div');
  chip.className = 'msg-reaction';
  chip.textContent = last.emoji || '🙂';

  if (reactions.length > 1) {
    const count = document.createElement('span');
    count.className = 'msg-reaction-count';
    count.textContent = String(reactions.length);
    chip.appendChild(count);
  }

  const title = reactions
    .map(r => `${r?.who || 'Biri'}: ${r?.emoji || ''}`.trim())
    .join('\n');

  if (title) chip.title = title;

  chip.addEventListener('click', (e) => {
    e.stopPropagation();
    if (title) showToast(title);
  });

  // Check if a chip already existed (update vs new)
  const hadChip = bubble.querySelector('.msg-reaction');
  bubble.appendChild(chip);
  row.classList.add('has-reaction');

  // Trigger update wiggle if chip already existed
  if (hadChip) {
    chip.classList.add('reaction-update');
    chip.addEventListener('animationend', () => chip.classList.remove('reaction-update'), { once: true });
  }
}

/**
 * Add/update a reaction on a message (stored in state, rendered as chip)
 */
function applyReactionToMessage(msgId, who, emoji) {
  const all = state.get('messages') || [];
  const msg = all.find(m => Number(m.id) === Number(msgId));
  if (!msg) return false;

  const list = Array.isArray(msg.reactions) ? msg.reactions : [];
  const whoNorm = String(who || '').trim().toLowerCase();
  const existing = list.find(r => String(r?.who || '').trim().toLowerCase() === whoNorm);

  if (existing) existing.emoji = emoji;
  else list.push({ who, emoji });

  msg.reactions = list;

  updateReactionInDOM(msgId);
  return true;
}

/**
 * Add system message
 */
function addSystemMessage(text) {
  const chatBody = $('chatBody');
  if (!chatBody) return;

  const div = document.createElement('div');
  div.className = 'system-msg';
  div.innerHTML = `<span>${escapeHtml(text)}</span>`;
  
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * Add typing indicator
 */
function addTypingBubble(speaker) {
  const chatBody = $('chatBody');
  if (!chatBody) return null;

  const isMe = String(speaker).toLowerCase() === 'me';
  
  const row = document.createElement('div');
  row.className = 'typing-row';
  row.dataset.typing = '1';
  row.dataset.typingSpeaker = speaker;

  if (!isMe) {
    row.appendChild(createAvatarNode(speaker));
  }

  const bubble = document.createElement('div');
  bubble.className = 'typing-bubble';
  bubble.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;

  row.appendChild(bubble);
  chatBody.appendChild(row);
  chatBody.scrollTop = chatBody.scrollHeight;

  // Update header status to "Yazıyor..."
  _setHeaderTyping(speaker);

  return row;
}

/**
 * Remove typing indicator
 */
function removeTypingBubble(row) {
  if (row && row.parentNode) {
    row.remove();
  }
  // Restore header status only if no other typing bubbles remain
  const stillTyping = document.querySelector('[data-typing="1"]');
  if (!stillTyping) {
    _clearHeaderTyping();
  }
}

/** Set header to "Yazıyor..." mode */
function _setHeaderTyping(speaker) {
  const statusEl = $('headerStatus');
  if (!statusEl) return;

  const isMe = String(speaker).toLowerCase() === 'me';
  const name = isMe ? '' : speaker;

  statusEl.classList.add('is-typing');
  statusEl.innerHTML = name
    ? `${escapeHtml(name)} yazıyor<span class="header-typing-dots"><span></span><span></span><span></span></span>`
    : `Yazıyor<span class="header-typing-dots"><span></span><span></span><span></span></span>`;
}

/** Restore header status */
function _clearHeaderTyping() {
  const statusEl = $('headerStatus');
  if (!statusEl) return;

  statusEl.classList.remove('is-typing');
  const group = state.get('group');
  statusEl.textContent = group.subtitle || 'Online';
}

/**
 * Clear chat but keep day divider
 */
function clearChat() {
  const chatBody = $('chatBody');
  if (!chatBody) return;

  const dayLabel = state.get('group.dayLabel') || 'Bugün';
  chatBody.innerHTML = `<div class="day-divider"><span id="dayDivider">${escapeHtml(dayLabel)}</span></div>`;
}

/**
 * Rebuild chat from messages state
 */
function rebuildChat() {
  clearChat();
  const chatBody = $('chatBody');
  if (!chatBody) return;

  const messages = state.get('messages');
  for (const msg of messages) {
    try {
      const row = buildMessageRow(msg);
      chatBody.appendChild(row);
    } catch (err) {
      Logger.error('Mesaj rebuild hatası:', msg.id, err);
    }
  }

  if (messages.length) {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}

/**
 * Update message times in DOM
 */
function updateMessageTimesInDOM() {
  const chatBody = $('chatBody');
  if (!chatBody) return;

  const messages = state.get('messages');
  for (const msg of messages) {
    const row = chatBody.querySelector(`[data-msg-id="${msg.id}"]`);
    if (!row) continue;

    row.dataset.time = msg.time || '';
    const timeEl = row.querySelector('.msg-time');
    if (timeEl) {
      timeEl.textContent = msg.time || '';
    }
  }
}

/**
 * Regenerate all message times based on settings
 */
function regenerateMessageTimes() {
  const messageTimes = state.get('messageTimes');
  const messages = state.get('messages');
  
  const base = timeToMinutes(messageTimes.baseTime);
  const inc = Math.max(0, Number(messageTimes.increment) || 0);
  const start = base !== null ? base : (timeToMinutes(nowTime()) || 0);

  // Update times
  const updatedMessages = messages.map((m, idx) => ({
    ...m,
    time: minutesToTime(start + inc * idx)
  }));

  state.set('messages', updatedMessages, true);
  state.data.messages = updatedMessages; // Direct update to avoid triggering save loop

  updateMessageTimesInDOM();
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
  const chatBody = $('chatBody');
  if (chatBody) {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}

export {
  addMessage,
  addSystemMessage,
  addTypingBubble,
  removeTypingBubble,
  clearChat,
  rebuildChat,
  scrollToBottom,
  findMessageByTarget,
  applyReactionToMessage,
  updateMessageTimesInDOM,
  regenerateMessageTimes,
};
