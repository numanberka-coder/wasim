# Faz 17 — Autocomplete

## Plan

### Adım 1: Autocomplete Modülü Oluştur
- [ ] `js/features/autocomplete.js` — Ana autocomplete motoru
  - @ komut listesi (17 komut) ve açıklamaları
  - Kişi adları: `state.get('people')` üzerinden dinamik
  - Cursor pozisyonu algılama (textarea selectionStart)
  - Mevcut kelime/token çıkarma
  - Filtreleme: @ ile başlıyorsa komut, satır başı ise kişi adı
  - Dropdown konumlama (textarea getBoundingClientRect + satır hesabı)

### Adım 2: Dropdown HTML
- [ ] `index.html` — Autocomplete popup container
  - `#autocompleteDropdown` — fixed pozisyonlu div
  - `.ac-item` — her öneri satırı
  - Komut adı + kısa açıklama gösterimi
  - Kişi adı gösterimi

### Adım 3: CSS Stilleri
- [ ] `css/components.css` — Autocomplete stilleri
  - `.autocomplete-dropdown` — popup stili (z-index: 9999, koyu arkaplan)
  - `.ac-item` — satır stili, hover/active durumu
  - `.ac-item.selected` — ok tuşları ile seçim vurgusu
  - `.ac-hint` — parametre ipucu (ghost text)
  - Mobil uyumluluk (min 44px touch target)

### Adım 4: Klavye & Etkileşim
- [ ] Klavye kontrolleri bağlama
  - `input` event → filtre ve dropdown göster
  - `keydown` → ArrowUp/Down navigasyon, Enter/Tab seçim, Escape kapat
  - Document click → dropdown kapat
  - Scroll/resize → dropdown kapat
  - Tab değişimi → dropdown kapat

### Adım 5: Parametre İpucu (17.4)
- [ ] Komut seçildikten sonra ghost text gösterimi
  - `@photo` → `@photo Kim "URL" "açıklama"`
  - Kullanıcı yazdıkça ipucu kaybolur

### Adım 6: app.js Entegrasyonu
- [ ] `initAutocomplete()` çağrısını `init()` fonksiyonuna ekle
- [ ] `scriptBox` ve `interactiveScriptBox` textarea'larını bağla

### Adım 7: Test & Doğrulama
- [ ] @ yazınca komut listesi görünüyor
- [ ] Satır başında kişi adı yazınca öneriler görünüyor
- [ ] Ok tuşları ile gezme çalışıyor
- [ ] Enter/Tab ile seçim çalışıyor
- [ ] Escape ile kapanıyor
- [ ] Mobilde düzgün çalışıyor
- [ ] Mevcut işlevsellik bozulmadı

## Değişen Dosyalar
- `js/features/autocomplete.js` (YENİ)
- `index.html` — autocomplete dropdown HTML + script tag
- `css/components.css` — autocomplete stilleri
- `js/app.js` — initAutocomplete() çağrısı
- `ROADMAP.md` — Faz 17 tamamlandı
- `README.md` — Mevcut durum güncelleme
