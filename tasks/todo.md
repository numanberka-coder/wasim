# "Me" Kavramını Kaldır — Dinamik "Sen" İşaretleme

> **Tarih:** 2026-04-03
> **Kapsam:** Hardcoded "Me" yerine herhangi bir kişiyi "Sen" olarak işaretleme
> **Durum:** 🔄 Planlama

---

## Mimari Karar

**Mevcut:** `'Me'` hardcoded keyword, 35+ yerde string karşılaştırma
**Hedef:** Herhangi bir kişi "Sen" olarak işaretlenebilir, toggle ile

### Yaklaşım
- State'e `selfName` alanı ekle (varsayılan: `'Me'`)
- Tüm `toLowerCase() === 'me'` kontrollerini `isSelf(name)` helper'ına çevir
- Kişi formuna "Bu benim" toggle ekle
- Senaryo syntax'ında `Me:` keyword'ü `selfName`'e map edilir (geriye uyumluluk)
- Aynı anda sadece 1 kişi "Sen" olabilir

---

## Görevler

- [ ] 1. State'e `selfName` alanı + `isSelf()` helper (`state.js`, `config.js`)
- [ ] 2. `people.js` — Kişi formuna "Bu benim" toggle ekle + toggle mantığı
- [ ] 3. `people.js` — renderPeopleList & dropdown'larda `isSelf()` kullan
- [ ] 4. `player.js` — 6 yerdeki `=== 'me'` → `isSelf()`
- [ ] 5. `messages.js` — 3 yerdeki `=== 'me'` → `isSelf()`
- [ ] 6. `state.js` — recomputeColors'da `isSelf()` kullan
- [ ] 7. `script-builder.js` — default sender'da `selfName` kullan
- [ ] 8. `interactive-engine.js` — 3 yerdeki referanslar
- [ ] 9. `script-parser.js` / player — `Me:` keyword geriye uyumluluk
- [ ] 10. `index.html` + `css/panels.css` — toggle UI stili
- [ ] 11. Test — 191 mevcut test geçmeli
- [ ] 12. Commit & push
