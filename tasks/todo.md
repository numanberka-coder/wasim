# Faz 21 — Kod Kalitesi & Refactoring

> **Tarih:** 2026-03-21
> **Kapsam:** Refactoring odaklı — davranış değişikliği yok, bakım maliyetini düşür
> **Durum:** Plan aşamasında

---

## Görevler

### 21.1 — bindEventHandlers() refactoring 🔴
- [ ] `app.js:236-597` — 362 satırlık dev fonksiyonu analiz et
- [ ] Data-driven event map oluştur: `[{selector, event, handler}]` array
- [ ] Generic `bindEvents(eventMap)` loop fonksiyonu yaz
- [ ] Mevcut tüm handler'ları map'e taşı (~30 binding)
- [ ] Duplicate wallpaper color handler'ı (input + change) tek handler'a indir
- [ ] Fonksiyonel doğrulama: tüm event'lerin çalıştığını test et

### 21.2 — Tema renk sabitleri merkezileştirme 🔴
- [ ] `config.js`'e `THEME_DEFAULTS` objesi ekle (light/dark renk çiftleri)
- [ ] `app.js`'teki 27 hardcoded renk referansını `THEME_DEFAULTS` ile değiştir
- [ ] `header.js`, `wallpaper.js`, `state.js` dosyalarındaki tekrarları da temizle
- [ ] Renk değerleri: `#1f2c33`, `#008069`, `#d9fdd3`, `#005c4b`, `#ffffff`, `#efeae2`, `#0b141a`, `#111b21`

### 21.3 — renderSceneList() event listener leak düzeltmesi 🔴
- [ ] `app.js:766-822` — mevcut per-button listener pattern'i kaldır
- [ ] Container üzerinde tek event delegation listener ekle
- [ ] `e.target.closest('.scene-load-btn')` / `.scene-delete-btn` ile hedef belirle
- [ ] Listener sadece bir kez eklenir, her render'da yeniden eklenmez

### 21.4 — Event binding boilerplate azaltma 🟡
- [ ] `bindClick()`, `bindChange()`, `bindInput()` → tek generic `bindEvent(selector, event, handler)` utility
- [ ] 21.1'deki event map yapısıyla entegre et
- [ ] Mevcut helper fonksiyonları kaldır veya `bindEvent` üzerine wrapper olarak bırak

### 21.5 — buildMessageRow() parçalama 🟡
- [ ] `messages.js:180-723` — 544 satırlık fonksiyonu analiz et
- [ ] Mesaj tipine göre alt fonksiyonlara böl:
  - `renderPhotoMessage()` (photo/gif)
  - `renderVideoMessage()`
  - `renderVoiceMessage()`
  - `renderLocationMessage()`
  - `renderDocumentMessage()`
  - `renderStickerMessage()`
  - `renderLinkMessage()`
  - `renderViewOnceMessage()`
  - `renderTextMessage()`
- [ ] `buildMessageRow()` dispatch table: `const renderers = { photo: renderPhotoMessage, ... }`
- [ ] Reply target matching duplicate kodunu (19 satır) tek yerde birleştir
- [ ] Magic number'ları sabit olarak çıkar (26 bar, 80ms tick, 12s fallback)

### 21.6 — Header renk sıfırlama mantığı birleştirme 🟡
- [ ] Tekrarlanan renk reset pattern'lerini bul (app.js'te 4+ yerde)
- [ ] Tek `resetThemeColors(isDark)` fonksiyonu oluştur
- [ ] Tüm tekrarları bu fonksiyona yönlendir

### 21.7 — play() fonksiyonu parçalama 🟢
- [ ] `player.js` — `play()` zaten 27 satır, temiz (analiz bunu gösterdi)
- [ ] `handleEvent()` (165 satır) incelenecek — gerekirse mesaj tipi bazlı handler'lara böl
- [ ] Eğer handleEvent() yeterince karmaşıksa alt fonksiyonlara ayır

---

## Uygulama Sırası

1. **21.2** — Tema renk sabitleri (diğer refactoring'lerin temeli)
2. **21.6** — Header renk sıfırlama birleştirme (21.2 ile birlikte mantıklı)
3. **21.4** — Event binding utility (21.1'in temeli)
4. **21.1** — bindEventHandlers() refactoring (21.4 üzerine inşa)
5. **21.3** — renderSceneList() event delegation
6. **21.5** — buildMessageRow() parçalama
7. **21.7** — handleEvent() değerlendirme

---

## Kısıtlamalar

- **Davranış değişikliği YOK** — pure refactoring
- Her adımda mevcut fonksiyonelliğin bozulmadığını doğrula
- Yeni özellik ekleme, sadece mevcut kodu iyileştir
