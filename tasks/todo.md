# Faz 23 — Test Altyapısı

> **Tarih:** 2026-03-21
> **Kapsam:** Vitest kurulumu, kritik modüller için unit testler, CI entegrasyonu, coverage raporu
> **Durum:** Plan aşaması

---

## Genel Strateji

Faz 22'de Vite + ES modules geçişi tamamlandı. Vitest, Vite ekosistemiyle doğrudan entegre olduğu için ideal test runner. Hedef: kritik modüllerde %80+ coverage, toplam %60+ coverage.

**Test edilecek modüller (öncelik sırasıyla):**
```
1. utils.js          → Pure fonksiyonlar (escapeHtml, isValidUrl, clamp, deepClone, debounce, throttle, formatBytes, timeToMinutes, minutesToTime, safeJsonParse, isEmpty, generateId)
2. config.js         → Sabit doğrulama (THEME_DEFAULTS, CONFIG, DEFAULT_STATE yapı kontrolü)
3. script-parser.js  → parseLine(), parseScript(), tokenizeCommand(), validateScript(), eventsToScript() — tüm mesaj tipleri + edge case'ler
4. state.js          → StateManager: get/set (nested path), subscribe/notify, addMessage, export/import, reset, recomputeColors
5. storage.js        → localStorage mock ile save/load/clear, sceneManager CRUD
6. player.js         → Mesaj sıralama, zamanlama mantığı (DOM bağımlı kısımlar mock)
7. messages.js       → renderMessage() temel çıktı doğrulaması (jsdom ile)
```

**jsdom stratejisi:** DOM bağımlı modüller (player, messages) için `jsdom` environment kullanılacak. Pure logic modülleri (utils, config, parser, state) için `node` environment yeterli.

---

## Görevler

### 23.1 — Vitest kurulumu 🔴
- [ ] `vitest` devDependency olarak ekle
- [ ] `@vitest/coverage-v8` devDependency olarak ekle (coverage için)
- [ ] `vitest.config.js` oluştur (jsdom environment, coverage ayarları)
- [ ] `package.json`'a `test`, `test:watch`, `test:coverage` script'leri ekle
- [ ] `tests/` klasör yapısını oluştur
- [ ] Basit bir smoke test ile çalıştığını doğrula

### 23.2 — Config & utils testleri 🔴
- [ ] `tests/utils.test.js` — escapeHtml (XSS vektörleri dahil), isValidUrl, clamp, deepClone, debounce, throttle, formatBytes, timeToMinutes, minutesToTime, safeJsonParse, isEmpty, generateId, Logger
- [ ] `tests/config.test.js` — THEME_DEFAULTS yapı kontrolü (dark/light), CONFIG sabitleri, DEFAULT_STATE geçerliliği, COLOR_POOL boyut kontrolü

### 23.3 — Script parser testleri 🔴
- [ ] `tests/script-parser.test.js` — parseLine() tüm mesaj tipleri: metin, görsel, ses, video, sticker, konum, belge, kişi, anket, sistem, tepki, yazıyor, katılma/ayrılma
- [ ] Edge case'ler: boş satır, yorum satırı (#), bozuk girdi, eksik parametre, tırnaklı metin
- [ ] parseScript() — çok satırlı senaryo, karışık mesaj tipleri
- [ ] tokenizeCommand() — tırnak içinde boşluk, iç içe tırnak
- [ ] validateScript() — geçerli/geçersiz senaryolar
- [ ] eventsToScript() — events → text → events roundtrip

### 23.4 — StateManager testleri 🔴
- [ ] `tests/state.test.js` — get/set nested path (ör. "theme.dark.bg"), subscribe/notify, deep clone doğrulaması (mutasyon koruması)
- [ ] addMessage/clearMessages, addActive/removeActive/clearActive/isActive
- [ ] export/import roundtrip, reset() varsayılanlara dönüş
- [ ] recomputeColors, getColorForSpeaker

### 23.5 — Storage testleri 🟡
- [ ] `tests/storage.test.js` — localStorage mock ile save/load/clear
- [ ] hasData/getSize kontrolü
- [ ] sceneManager: save/load/delete/rename/getAll
- [ ] importFromFile/exportToFile (File API mock)

### 23.6 — Player testleri 🟡
- [ ] `tests/player.test.js` — Mesaj sıralama mantığı, oynatma/durdurma state geçişleri
- [ ] DOM mock ile temel oynatma akışı

### 23.7 — DOM testleri (jsdom) 🟡
- [ ] `tests/messages.test.js` — renderMessage() temel çıktı: metin mesajı DOM yapısı, gelen/giden farkı
- [ ] Tema renkleri doğru uygulanıyor mu

### 23.8 — CI entegrasyonu 🟢
- [ ] `.github/workflows/test.yml` — push/PR'da otomatik test
- [ ] Node.js matrix (20.x, 22.x)
- [ ] `npm ci` + `npm test` + coverage raporu

### 23.9 — Coverage raporu 🟢
- [ ] Vitest coverage-v8 plugin aktif
- [ ] Minimum %60 global threshold
- [ ] Coverage raporu CI'da artifact olarak sakla

---

## Risk Analizi

| Risk | Etki | Azaltma |
|------|------|---------|
| DOM bağımlı modüller test edilemez | Orta | jsdom environment + minimal mock |
| Singleton state testler arası kirlilik | Yüksek | Her test öncesi state.reset() |
| localStorage mock karmaşıklığı | Düşük | vi.stubGlobal ile basit mock |
| Circular import sorunları | Orta | Test dosyalarında doğrudan import |

---

## Doğrulama Planı

1. `npm test` ile tüm testler geçer
2. `npm run test:coverage` ile coverage raporu alınır
3. Kritik modüller (utils, parser, state) %80+ coverage
4. Toplam %60+ coverage hedefi
5. CI workflow push ile tetiklenir
