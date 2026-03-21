/* ========================================
   SYNTAX HIGHLIGHT — Senaryo Editörü Renklendirme
   Faz 18: Komut, kişi, string, blok renklendirme
   Overlay tekniği: Şeffaf textarea + renkli <pre>
   ======================================== */

const SyntaxHighlight = (() => {
  'use strict';

  // Bağlı textarea → overlay eşleşmeleri
  const pairs = [];
  let debounceTimer = null;

  /**
   * Tek satırı tokenize et — HTML döndür
   */
  function highlightLine(line) {
    if (!line) return '\n';

    // Satır boşsa
    if (line.trim() === '') return escapeHtml(line) + '\n';

    // Satır başında # kontrolü (blok)
    const blockMatch = line.match(/^(#\S+)(.*)/);
    if (blockMatch) {
      return '<span class="sh-block">' + escapeHtml(blockMatch[1]) + '</span>' +
             highlightInline(blockMatch[2]) + '\n';
    }

    // Meta satırları: trigger:, delay:, fallback: vb.
    const metaMatch = line.match(/^(trigger|delay|fallback|goto|limit)(\s*:)(.*)/i);
    if (metaMatch) {
      return '<span class="sh-meta">' + escapeHtml(metaMatch[1]) + escapeHtml(metaMatch[2]) + '</span>' +
             highlightInline(metaMatch[3]) + '\n';
    }

    // Ayırıcı ---
    if (/^---\s*$/.test(line)) {
      return '<span class="sh-meta">' + escapeHtml(line) + '</span>\n';
    }

    // @ komutu ile başlayan satır
    const cmdMatch = line.match(/^(@\w+)(.*)/);
    if (cmdMatch) {
      return '<span class="sh-command">' + escapeHtml(cmdMatch[1]) + '</span>' +
             highlightInline(cmdMatch[2]) + '\n';
    }

    // Kişi adı: ile başlayan satır
    const personMatch = line.match(/^([A-Za-zÀ-ÿçÇğĞıİöÖşŞüÜ][A-Za-zÀ-ÿçÇğĞıİöÖşŞüÜ0-9 ._-]*)\s*(:)(.*)/);
    if (personMatch) {
      return '<span class="sh-person">' + escapeHtml(personMatch[1]) + '</span>' +
             escapeHtml(personMatch[2]) +
             highlightInline(personMatch[3]) + '\n';
    }

    // Normal satır — yine de inline token'ları kontrol et
    return highlightInline(line) + '\n';
  }

  /**
   * Satır içi token'ları renklendir (@ komutları ve "string"ler)
   */
  function highlightInline(text) {
    if (!text) return '';

    // @ komutları ve "string"leri bul
    const parts = [];
    let remaining = text;
    let safety = 0;

    while (remaining.length > 0 && safety < 500) {
      safety++;

      // En erken eşleşmeyi bul
      let earliest = null;
      let earliestIdx = remaining.length;
      let earliestType = null;

      // @ komutu
      const cmdInline = remaining.match(/(@(?:add|leave|system|typing|reaction|photo|gif|video|voice|location|document|sticker|link|viewonce|sent|delivered|read|deleted|poll|status|reply|delay|clear))\b/i);
      if (cmdInline && cmdInline.index < earliestIdx) {
        earliest = cmdInline;
        earliestIdx = cmdInline.index;
        earliestType = 'command';
      }

      // "string"
      const strInline = remaining.match(/"(?:[^"\\]|\\.)*"/);
      if (strInline && strInline.index < earliestIdx) {
        earliest = strInline;
        earliestIdx = strInline.index;
        earliestType = 'string';
      }

      if (!earliest) {
        parts.push(escapeHtml(remaining));
        break;
      }

      // Önceki metin
      if (earliestIdx > 0) {
        parts.push(escapeHtml(remaining.substring(0, earliestIdx)));
      }

      // Renkli token
      const cls = earliestType === 'command' ? 'sh-command' : 'sh-string';
      parts.push('<span class="' + cls + '">' + escapeHtml(earliest[0]) + '</span>');

      remaining = remaining.substring(earliestIdx + earliest[0].length);
    }

    return parts.join('');
  }

  /**
   * HTML escape
   */
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Tüm metni renklendir
   */
  function render(text) {
    const lines = text.split('\n');
    return lines.map(highlightLine).join('');
  }

  /**
   * Overlay'i güncelle
   */
  function updateOverlay(textarea, overlay) {
    const html = render(textarea.value);
    overlay.innerHTML = html;

    // Scroll senkronu
    overlay.scrollTop = textarea.scrollTop;
    overlay.scrollLeft = textarea.scrollLeft;
  }

  /**
   * Debounce ile güncelle
   */
  function scheduleUpdate(textarea, overlay) {
    if (debounceTimer) cancelAnimationFrame(debounceTimer);
    debounceTimer = requestAnimationFrame(() => {
      updateOverlay(textarea, overlay);
    });
  }

  /**
   * Textarea'ya syntax highlight bağla
   */
  function attach(textareaId) {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;

    // Overlay container'ı bul
    const wrapper = textarea.closest('.sh-wrapper');
    if (!wrapper) return;

    const overlay = wrapper.querySelector('.sh-overlay');
    if (!overlay) return;

    // Pair kaydet
    const pair = { textarea, overlay };
    pairs.push(pair);

    // Overlay'i textarea ile hizala
    function syncSize() {
      overlay.style.top = textarea.offsetTop + 'px';
      overlay.style.left = textarea.offsetLeft + 'px';
      overlay.style.height = textarea.offsetHeight + 'px';
      overlay.style.width = textarea.offsetWidth + 'px';
    }
    syncSize();

    // Event dinleyiciler
    textarea.addEventListener('input', () => scheduleUpdate(textarea, overlay));
    textarea.addEventListener('scroll', () => {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    });

    // Resize observer — textarea boyutu değiştiğinde overlay'i eşle
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => syncSize());
      ro.observe(textarea);
    }

    // İlk render
    updateOverlay(textarea, overlay);
  }

  /**
   * Tüm hedef textarea'lara yeniden render (tema değişikliğinde)
   */
  function refresh() {
    pairs.forEach(p => updateOverlay(p.textarea, p.overlay));
  }

  /**
   * Başlat
   */
  function init() {
    attach('scriptBox');
    attach('interactiveScriptBox');
  }

  // Public API
  return { init, refresh };
})();

/**
 * Global init fonksiyonu — app.js'den çağrılır
 */
export function initHighlight() {
  SyntaxHighlight.init();
}

export { SyntaxHighlight };
