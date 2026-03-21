/* ========================================
   AUTOCOMPLETE — Senaryo Editörü Otomatik Tamamlama
   Faz 17: @ komut + kişi adı önerileri
   ======================================== */

const Autocomplete = (() => {
  'use strict';

  // @ komut listesi — açıklama ve parametre ipucu
  const COMMANDS = [
    { name: '@add',       desc: 'Kişiyi gruba ekle',          hint: '@add İsim' },
    { name: '@leave',     desc: 'Kişiyi gruptan çıkar',       hint: '@leave İsim' },
    { name: '@system',    desc: 'Sistem mesajı göster',        hint: '@system Mesaj metni' },
    { name: '@typing',    desc: 'Yazıyor animasyonu',          hint: '@typing İsim 800' },
    { name: '@reaction',  desc: 'Tepki ekle',                  hint: '@reaction İsim 😂 Hedef' },
    { name: '@photo',     desc: 'Fotoğraf mesajı',             hint: '@photo İsim URL "Açıklama"' },
    { name: '@gif',       desc: 'GIF mesajı',                  hint: '@gif İsim URL "Açıklama"' },
    { name: '@video',     desc: 'Video mesajı',                hint: '@video İsim URL "Açıklama"' },
    { name: '@voice',     desc: 'Sesli mesaj',                 hint: '@voice İsim 12s' },
    { name: '@location',  desc: 'Konum kartı',                 hint: '@location İsim "Yer Adı" Alt Bilgi' },
    { name: '@document',  desc: 'Döküman kartı',               hint: '@document İsim "dosya.pdf" "Boyut"' },
    { name: '@sticker',   desc: 'Sticker gönder',              hint: '@sticker İsim 🙂' },
    { name: '@link',      desc: 'Link önizleme kartı',         hint: '@link İsim "Başlık" URL' },
    { name: '@viewonce',  desc: 'Bir kez görüntüle',           hint: '@viewonce İsim photo' },
    { name: '@sent',      desc: 'Tik: gönderildi (tek gri)',   hint: '@sent' },
    { name: '@delivered', desc: 'Tik: iletildi (çift gri)',    hint: '@delivered' },
    { name: '@read',      desc: 'Tik: okundu (çift mavi)',     hint: '@read' },
  ];

  let dropdown = null;
  let activeTextarea = null;
  let selectedIndex = -1;
  let items = [];          // mevcut filtrelenmiş öneriler
  let tokenStart = -1;     // tamamlanan token'ın textarea içindeki başlangıç konumu
  let mode = null;         // 'command' | 'person'

  /**
   * Autocomplete'i başlat — hedef textarea'ları bağla
   */
  function init() {
    dropdown = document.getElementById('autocompleteDropdown');
    if (!dropdown) return;

    const targets = ['scriptBox', 'interactiveScriptBox'];
    targets.forEach(id => {
      const textarea = document.getElementById(id);
      if (!textarea) return;

      textarea.addEventListener('input', onInput);
      textarea.addEventListener('keydown', onKeyDown);
      textarea.addEventListener('blur', () => {
        // Küçük gecikme — dropdown tıklaması yakalanabilsin
        setTimeout(hide, 150);
      });
      textarea.addEventListener('scroll', hide);
    });

    // Dropdown item tıklama (event delegation)
    dropdown.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.ac-item');
      if (item) {
        e.preventDefault();
        const idx = Number(item.dataset.index);
        if (Number.isFinite(idx)) {
          selectItem(idx);
        }
      }
    });

    // Sayfa scroll veya resize'da kapat
    window.addEventListener('resize', hide);
  }

  /**
   * Input event — ne yazıldığını analiz et
   */
  function onInput(e) {
    activeTextarea = e.target;
    const text = activeTextarea.value;
    const cursor = activeTextarea.selectionStart;

    // Cursor'dan geriye bak — mevcut satırı bul
    const lineStart = text.lastIndexOf('\n', cursor - 1) + 1;
    const lineText = text.slice(lineStart, cursor);

    // 1. @ komut tamamlama
    const atMatch = lineText.match(/@(\w*)$/);
    if (atMatch) {
      const query = atMatch[1].toLowerCase();
      tokenStart = cursor - atMatch[0].length;
      mode = 'command';

      items = COMMANDS.filter(cmd =>
        cmd.name.toLowerCase().includes(query)
      );

      if (items.length > 0) {
        show();
      } else {
        hide();
      }
      return;
    }

    // 2. Kişi adı tamamlama — satır başında, en az 1 karakter yazılmış
    // "@" veya "#" ile başlamıyorsa ve ":" henüz yoksa
    const personQuery = lineText.trimStart();
    if (
      personQuery.length >= 1 &&
      !personQuery.startsWith('@') &&
      !personQuery.startsWith('#') &&
      !personQuery.includes(':') &&
      !personQuery.includes('>') &&
      personQuery !== '---'
    ) {
      tokenStart = lineStart;
      mode = 'person';

      const people = state.get('people') || {};
      const names = Object.keys(people);
      const lowerQuery = personQuery.toLowerCase();

      items = names
        .filter(name => name.toLowerCase().startsWith(lowerQuery) && name.toLowerCase() !== lowerQuery)
        .sort((a, b) => a.localeCompare(b, 'tr'))
        .map(name => ({ name, desc: 'Kişi' }));

      if (items.length > 0) {
        show();
      } else {
        hide();
      }
      return;
    }

    // Hiçbir koşul sağlanmadı
    hide();
  }

  /**
   * Keydown — ok tuşları, Enter/Tab, Escape
   */
  function onKeyDown(e) {
    if (!dropdown || dropdown.style.display === 'none') return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      renderSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      renderSelection();
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        selectItem(selectedIndex);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      hide();
    }
  }

  /**
   * Seçilen öğeyi textarea'ya yerleştir
   */
  function selectItem(index) {
    if (!activeTextarea || index < 0 || index >= items.length) return;

    const item = items[index];
    const text = activeTextarea.value;
    const cursor = activeTextarea.selectionStart;

    let insertText;
    let cursorOffset = 0;

    if (mode === 'command') {
      // Komut tamamlama — komutu yaz + parametresiz komutlarda boşluk ekleme
      const noParam = ['@sent', '@delivered', '@read'];
      if (noParam.includes(item.name)) {
        insertText = item.name;
      } else {
        insertText = item.name + ' ';
      }
      cursorOffset = insertText.length;
    } else {
      // Kişi adı tamamlama — "İsim: " formatında ekle
      insertText = item.name + ': ';
      cursorOffset = insertText.length;
    }

    // Textarea'daki token'ı değiştir
    const before = text.slice(0, tokenStart);
    const after = text.slice(cursor);
    activeTextarea.value = before + insertText + after;

    // Cursor'ı yerleştir
    const newCursor = tokenStart + cursorOffset;
    activeTextarea.selectionStart = newCursor;
    activeTextarea.selectionEnd = newCursor;
    activeTextarea.focus();

    // Input event tetikle (state senkronu için)
    activeTextarea.dispatchEvent(new Event('input', { bubbles: true }));

    hide();

    // Parametre ipucu göster (17.4)
    if (mode === 'command' && item.hint) {
      showHint(item.hint);
    }
  }

  /**
   * Dropdown'ı göster ve konumla
   */
  function show() {
    if (!dropdown || !activeTextarea || items.length === 0) return;

    selectedIndex = 0;
    renderItems();
    positionDropdown();
    dropdown.style.display = 'block';
  }

  /**
   * Dropdown'ı gizle
   */
  function hide() {
    if (!dropdown) return;
    dropdown.style.display = 'none';
    selectedIndex = -1;
    items = [];
    mode = null;
    hideHint();
  }

  /**
   * Dropdown içeriğini render et
   */
  function renderItems() {
    if (!dropdown) return;

    dropdown.innerHTML = items.map((item, i) => {
      const cls = i === selectedIndex ? 'ac-item selected' : 'ac-item';
      const icon = mode === 'command' ? '⚡' : '👤';
      return `<div class="${cls}" data-index="${i}">
        <span class="ac-icon">${icon}</span>
        <span class="ac-name">${escapeHtml(item.name)}</span>
        <span class="ac-desc">${escapeHtml(item.desc)}</span>
      </div>`;
    }).join('');
  }

  /**
   * Seçimi güncelle (ok tuşları)
   */
  function renderSelection() {
    if (!dropdown) return;
    const allItems = dropdown.querySelectorAll('.ac-item');
    allItems.forEach((el, i) => {
      el.classList.toggle('selected', i === selectedIndex);
    });
    // Görünür alana scroll
    const sel = dropdown.querySelector('.ac-item.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Dropdown konumu — textarea'nın cursor satırına göre
   */
  function positionDropdown() {
    if (!dropdown || !activeTextarea) return;

    const rect = activeTextarea.getBoundingClientRect();
    const text = activeTextarea.value.slice(0, activeTextarea.selectionStart);
    const lines = text.split('\n');
    const lineIndex = lines.length - 1;

    // Textarea'nın satır yüksekliğini hesapla
    const style = getComputedStyle(activeTextarea);
    const lineHeight = parseFloat(style.lineHeight) || 20;
    const paddingTop = parseFloat(style.paddingTop) || 0;

    // Cursor'ın textarea içindeki Y pozisyonu (scroll offseti dahil)
    const cursorY = paddingTop + (lineIndex * lineHeight) - activeTextarea.scrollTop;

    // Dropdown'ı textarea'nın altına veya cursor satırının altına konumla
    let top = rect.top + cursorY + lineHeight + 2;
    let left = rect.left + 8;

    // Ekran sınırları kontrolü
    const dropdownHeight = Math.min(items.length * 36, 240);
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;

    // Alta sığmıyorsa yukarı aç
    if (top + dropdownHeight > viewportH - 10) {
      top = rect.top + cursorY - dropdownHeight - 2;
    }

    // Sağ kenar kontrolü
    const dropdownWidth = 280;
    if (left + dropdownWidth > viewportW - 10) {
      left = viewportW - dropdownWidth - 10;
    }

    // Minimum sınırlar
    top = Math.max(10, top);
    left = Math.max(10, left);

    dropdown.style.top = `${top}px`;
    dropdown.style.left = `${left}px`;
  }

  /**
   * Parametre ipucu göster (17.4)
   */
  function showHint(hintText) {
    let hintEl = document.getElementById('autocompleteHint');
    if (!hintEl) return;

    hintEl.textContent = hintText;
    hintEl.style.display = 'block';

    // Textarea'nın altına konumla
    if (activeTextarea) {
      const rect = activeTextarea.getBoundingClientRect();
      hintEl.style.top = `${rect.bottom + 4}px`;
      hintEl.style.left = `${rect.left}px`;
      hintEl.style.maxWidth = `${rect.width}px`;
    }

    // 4 saniye sonra otomatik kapat
    clearTimeout(hintEl._timer);
    hintEl._timer = setTimeout(hideHint, 4000);
  }

  /**
   * Parametre ipucunu gizle
   */
  function hideHint() {
    const hintEl = document.getElementById('autocompleteHint');
    if (hintEl) {
      hintEl.style.display = 'none';
      clearTimeout(hintEl._timer);
    }
  }

  /**
   * HTML escape
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init };
})();

/**
 * Modül başlatma fonksiyonu — app.js'den çağrılır
 */
function initAutocomplete() {
  Autocomplete.init();
}
