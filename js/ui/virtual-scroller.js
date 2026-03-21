/* ========================================
   VIRTUAL SCROLLER - Message Virtualization
   ======================================== */

/**
 * VirtualScroller — IntersectionObserver tabanlı mesaj virtualization.
 *
 * Strateji:
 * - rebuildChat() sırasında mesaj sayısı THRESHOLD'u aşarsa aktif
 * - Viewport dışı mesajlar placeholder (sabit yükseklik) ile değiştirilir
 * - Scroll ile viewport'a girenler tekrar render edilir (lazy)
 * - PNG export öncesi tüm mesajlar materialize edilir
 */

const VIRTUAL_THRESHOLD = 50; // Bu sayının altında virtualization devre dışı
const ROOT_MARGIN = '200px 0px'; // Viewport + 200px margin

let observer = null;
let buildRowFn = null; // buildMessageRow referansı
let messagesFn = null; // state.get('messages') getter

/**
 * Initialize virtual scroller
 * @param {HTMLElement} container - chatBody element
 * @param {Function} buildRow - buildMessageRow fonksiyonu
 * @param {Function} getMessages - state'ten mesaj listesini döndüren fonksiyon
 */
export function initVirtualScroller(container, buildRow, getMessages) {
  buildRowFn = buildRow;
  messagesFn = getMessages;

  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target;
      if (entry.isIntersecting && el.dataset.virtual === '1') {
        materializeRow(el);
      }
    }
  }, {
    root: container,
    rootMargin: ROOT_MARGIN,
    threshold: 0,
  });
}

/**
 * Destroy virtual scroller and disconnect observer
 */
export function destroyVirtualScroller() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  buildRowFn = null;
  messagesFn = null;
}

/**
 * Check if message count exceeds virtualization threshold
 */
export function shouldVirtualize(messageCount) {
  return messageCount > VIRTUAL_THRESHOLD;
}

/**
 * Create a placeholder row that preserves estimated height
 * @param {object} msg - Message data
 * @param {number} estimatedHeight - Estimated row height in px
 * @returns {HTMLElement}
 */
export function createPlaceholderRow(msg, estimatedHeight) {
  const row = document.createElement('div');
  row.className = 'msg-row virtual-placeholder';
  row.dataset.msgId = String(msg.id);
  row.dataset.virtual = '1';
  row.style.height = `${estimatedHeight}px`;
  row.style.minHeight = `${estimatedHeight}px`;

  if (observer) {
    observer.observe(row);
  }

  return row;
}

/**
 * Materialize a placeholder row into a real message row
 */
function materializeRow(placeholder) {
  if (!buildRowFn || !messagesFn) return;

  const msgId = placeholder.dataset.msgId;
  const messages = messagesFn();
  const msg = messages.find(m => String(m.id) === msgId);
  if (!msg) return;

  try {
    const realRow = buildRowFn(msg);
    placeholder.replaceWith(realRow);
  } catch (_err) {
    // Sessiz hata — placeholder kalır
  }
}

/**
 * Materialize ALL placeholder rows (PNG export öncesi)
 */
export function materializeAll(container) {
  if (!buildRowFn || !messagesFn) return;

  const placeholders = container.querySelectorAll('[data-virtual="1"]');
  if (!placeholders.length) return;

  const messages = messagesFn();
  const msgMap = new Map(messages.map(m => [String(m.id), m]));

  for (const ph of placeholders) {
    const msg = msgMap.get(ph.dataset.msgId);
    if (!msg) continue;

    try {
      const realRow = buildRowFn(msg);
      ph.replaceWith(realRow);
    } catch (_err) {
      // Sessiz hata
    }
  }
}

/**
 * Estimate row height based on message type
 * Basit bir tahmin — gerçek render yapılmadan yükseklik hesapla
 */
export function estimateRowHeight(msg) {
  const kind = msg.kind || null;

  if (kind === 'photo' || kind === 'gif') return 220;
  if (kind === 'video') return 200;
  if (kind === 'voice') return 60;
  if (kind === 'location') return 180;
  if (kind === 'document') return 70;
  if (kind === 'sticker') return 140;
  if (kind === 'link') return 160;
  if (kind === 'viewonce') return 200;

  // Text messages — estimate from text length
  const textLen = String(msg.text || '').length;
  const lineCount = Math.max(1, Math.ceil(textLen / 35)); // ~35 chars per line
  return Math.max(40, 28 + lineCount * 20);
}

/**
 * Get virtualization threshold constant (for testing)
 */
export { VIRTUAL_THRESHOLD };
