# Faz 12 — Bubble Renk Ayarı (Giden/Gelen Balon Renkleri)

## Strateji
Header renk picker pattern'ini birebir takip et. Color picker ile `--wa-bubble-out-bg`, `--wa-bubble-out-solid`,
`--wa-bubble-in-bg`, `--wa-bubble-in-solid` CSS variable'larını runtime'da override et.
Kuyruk rengi otomatik senkron — zaten `--wa-bubble-*-solid` variable'ı kullanılıyor.

---

## Adımlar

### Adım 1: State & Config Altyapısı
- [ ] `js/config.js` → `DEFAULT_STATE`'e `bubbleOutColor: null` ve `bubbleInColor: null` ekle
- [ ] `js/state.js` → `settings`'e `bubbleOutColor` ve `bubbleInColor` ekle
- [ ] `js/state.js` → `reset()` fonksiyonuna da ekle (null = varsayılan tema rengi)

### Adım 2: Bubble Renk Uygulama Fonksiyonları
- [ ] `js/phone/header.js`'e (veya yeni bir helper'a) `applyBubbleColors()` fonksiyonu ekle
  - `phone.style.setProperty('--wa-bubble-out-bg', color)`
  - `phone.style.setProperty('--wa-bubble-out-solid', color)` (kuyruk senkronu — 12.3)
  - `phone.style.setProperty('--wa-bubble-out', color)`
  - Aynısı `in` için
  - `null` gelirse → `style.removeProperty()` ile tema varsayılanına dön

### Adım 3: UI — Color Picker'lar
- [ ] `index.html`'e Header Rengi accordion'unun altına yeni accordion ekle:
  - "🎨 Balon Renkleri" başlığı
  - Giden balon rengi: `<input type="color" id="bubbleOutColorInput">`
  - Gelen balon rengi: `<input type="color" id="bubbleInColorInput">`
  - "🔄 Varsayılana Dön" butonu (12.4)

### Adım 4: Event Binding
- [ ] `js/app.js`'e color picker event binding ekle (headerColorInput pattern'i)
  - `bubbleOutColorInput` → input + change event → `applyBubbleColors()`
  - `bubbleInColorInput` → input + change event → `applyBubbleColors()`
  - `resetBubbleColorsBtn` → null'a set et, removeProperty, input'ları varsayılana döndür
- [ ] Form populate: sayfa yüklenirken state'ten renkleri input'lara yaz

### Adım 5: Tema Geçiş Entegrasyonu
- [ ] Light ↔ Dark geçişinde:
  - Özel renk seçilmişse → korumaya devam et
  - Varsayılana dönülmüşse (null) → tema rengini kullan
- [ ] Color input default value'larını aktif temaya göre güncelle

### Adım 6: Export/Import & Sıfırlama Uyumu
- [ ] JSON export/import'ta `bubbleOutColor` ve `bubbleInColor` dahil olmalı
- [ ] "Sıfırla" butonu bubble renklerini de sıfırlamalı
- [ ] Sayfa yüklenirken kaydedilmiş bubble renkleri uygulanmalı

### Adım 7: Test & Doğrulama
- [ ] Giden balon rengi değişiyor mu + kuyruk senkron mu
- [ ] Gelen balon rengi değişiyor mu + kuyruk senkron mu
- [ ] Varsayılana dön çalışıyor mu
- [ ] Dark → Light geçişinde bubble renk state'i doğru mu
- [ ] Export/Import bubble renklerini koruyor mu
- [ ] Sıfırla butonu her şeyi temizliyor mu
