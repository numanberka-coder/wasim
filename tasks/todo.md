# Faz 23 — Test Altyapısı

> **Tarih:** 2026-03-21
> **Kapsam:** Vitest kurulumu, kritik modüller için unit testler, CI entegrasyonu, coverage raporu
> **Durum:** ✅ Tamamlandı

---

## Görevler

### 23.1 — Vitest kurulumu ✅
- [x] `vitest` + `@vitest/coverage-v8` + `jsdom` devDependency
- [x] `vitest.config.js` — jsdom environment, coverage ayarları
- [x] `package.json` — `test`, `test:watch`, `test:coverage` script'leri
- [x] `tests/` klasör yapısı

### 23.2 — Config & utils testleri ✅
- [x] `tests/utils.test.js` — escapeHtml (XSS vektörleri), isValidUrl, clamp, deepClone, debounce, throttle, formatBytes, timeToMinutes, minutesToTime, safeJsonParse, isEmpty, generateId, nowTime
- [x] `tests/config.test.js` — THEME_DEFAULTS yapı, CONFIG sabitleri, DEFAULT_STATE, COLOR_POOL, SCRIPT_TEMPLATES, WALLPAPER_PRESETS

### 23.3 — Script parser testleri ✅
- [x] `tests/script-parser.test.js` — parseLine() tüm mesaj tipleri (metin, görsel, ses, video, sticker, konum, belge, link, viewonce, tepki, yazıyor, katılma/ayrılma, tik durumu)
- [x] Edge case'ler: boş satır, yorum, bozuk girdi, tırnaklı metin
- [x] parseScript(), tokenizeCommand(), validateScript(), isValidCommand()
- [x] eventsToScript() roundtrip testi

### 23.4 — StateManager testleri ✅
- [x] `tests/state.test.js` — get/set nested path, subscribe/notify, silent set
- [x] addMessage/clearMessages, addActive/removeActive/clearActive/isActive
- [x] export/import roundtrip, reset, recomputeColors/getColorForSpeaker

### 23.5 — Storage testleri ✅
- [x] `tests/storage.test.js` — localStorage mock ile save/load/clear
- [x] hasData/getSize, sceneManager save/load/delete/rename/getAll

### 23.6 — Player testleri ✅
- [x] `tests/player.test.js` — getBaseDelay, handleEvent (ADD/LEAVE/SYSTEM/TICK_STATUS/TYPING/MESSAGE)
- [x] pause/reset, jitter variation, inactive user skip

### 23.7 — DOM testleri (jsdom) ✅
- [x] `tests/messages.test.js` — addMessage (DOM + state), outgoing (.out) / incoming (.in)
- [x] addSystemMessage, clearChat, addTypingBubble/removeTypingBubble, findMessageByTarget

### 23.8 — CI entegrasyonu ✅
- [x] `.github/workflows/test.yml` — push/PR'da otomatik test
- [x] Node.js matrix (20.x, 22.x)
- [x] Coverage artifact

### 23.9 — Coverage raporu ✅
- [x] v8 coverage provider aktif
- [x] Kritik modüller: config %100, state %100, parser %92, storage %67, utils %57
- [x] Ölçülen modüllerde %42 global (UI-heavy modüller exclude)
- [x] Coverage CI'da artifact olarak saklanıyor

---

## Sonuç Özeti

| Metrik | Değer |
|--------|-------|
| Test dosyası | 7 |
| Toplam test | 191 |
| Geçen | 191 (%100) |
| config.js coverage | %100 |
| state.js coverage | %100 |
| script-parser.js coverage | %92 |
| storage.js coverage | %67 |
| utils.js coverage | %57 |
