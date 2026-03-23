# Faz 26 — innerHTML Temizliği & DOM API Geçişi

> **Tarih:** 2026-03-23
> **Kapsam:** 27 innerHTML kullanımını güvenli DOM API'ye dönüştür, DOM helper utility oluştur, ESLint kuralı ekle
> **Durum:** 📋 Plan Onayı Bekleniyor

---

## Mevcut Durum Analizi

**Toplam:** 27 innerHTML kullanımı (test dosyaları hariç)

| Dosya | Adet | Risk | Detay |
|-------|------|------|-------|
| `messages.js` | 14 | Orta | SVG ikonlar (10), escaped text (4) |
| `script-builder.js` | 8 | Yüksek | 1 adet escape eksik olabilir (shortLabel), 4 empty clear, 3 template |
| `people.js` | 3 | Orta | 1 kart template (escaped), 2 empty clear |
| `autocomplete.js` | 2 | Düşük | 1 dropdown template (escaped), 1 escape helper |
| `app.js` | 2 | Düşük | Sahne listesi render (escaped) |
| `player.js` | 1 | Düşük | SVG icon toggle |
| `mobile.js` | 2 | Düşük | Empty clear |
| `highlight.js` | 1 | Düşük | Syntax overlay (pre-escaped) |

**Güvenlik bulgusu:**
- `script-builder.js:456` — `shortLabel` escape'siz kullanılıyor olabilir ✅ düzeltilecek
- `people.js:34` — `onerror="this.remove()"` inline handler → addEventListener'a geçecek

---

## Strateji

**Aşamalı yaklaşım (ROADMAP2 notu):**
1. Önce DOM helper utility oluştur (26.6) — tüm geçişlerde kullanılacak
2. Yüksek riskli innerHTML'ler (kullanıcı girdisi içerenler)
3. SVG icon innerHTML'ler (güvenli ama tutarlılık için)
4. Empty clear pattern'leri (`el.innerHTML = ''` → `el.replaceChildren()`)
5. ESLint kuralı (yeni innerHTML'i engelle)

**Empty clear pattern:** `el.innerHTML = ''` → `el.replaceChildren()` (modern, güvenli)

**SVG pattern:** SVG string sabitleri → fonksiyon ile `createElementNS` veya template clone

**highlight.js hariç:** Syntax overlay innerHTML'i performans kritik ve pre-escaped, dokunulmayacak.

**autocomplete.js:359 hariç:** `escapeHtml()` helper fonksiyonu innerHTML'i doğru kullanım, dokunulmayacak.

---

## Görevler

### 26.6 — DOM Helper Utility (önce) 🟢
- [ ] `js/utils/dom-helper.js` oluştur — `el()` fonksiyonu: `el('div', {class: 'foo', text: 'bar'}, [children])`
- [ ] SVG helper: `svgIcon(htmlString)` — SVG string'den DOM element oluştur (DOMParser ile)
- [ ] Testler yaz

### 26.1 — messages.js innerHTML Geçişi 🔴
- [ ] SVG icon innerHTML'leri (10 adet): sabitleri fonksiyona çevir veya template clone
- [ ] `renderSystemMessage()` (L887): DOM API
- [ ] `renderTypingBubble()` (L913): DOM API
- [ ] `updateTypingStatus()` (L952): DOM API
- [ ] `initChat()` (L992): DOM API
- [ ] Testler doğrula

### 26.2 — script-builder.js innerHTML Geçişi 🔴
- [ ] Empty clear'lar (L139, L168, L203, L487, L707): `replaceChildren()`
- [ ] Insert mode indicator (L456): DOM API + shortLabel escape düzeltmesi
- [ ] Success pill (L489): DOM API
- [ ] Empty state (L710): DOM API
- [ ] Testler doğrula

### 26.3 — people.js innerHTML Geçişi 🟡
- [ ] Empty clear'lar (L26, L243): `replaceChildren()`
- [ ] Person card (L34): DOM API + `onerror` inline handler → addEventListener
- [ ] Testler doğrula

### 26.4 — autocomplete.js innerHTML Geçişi 🟡
- [ ] Dropdown render (L247): DOM API
- [ ] `escapeHtml` helper (L359): dokunma — doğru kullanım

### 26.5 — Diğer Dosyalar 🟡
- [ ] `app.js` — sahne listesi (L726, L730): DOM API
- [ ] `player.js` — icon toggle (L364): DOM API
- [ ] `mobile.js` — empty clear'lar (L305, L393): `replaceChildren()`

### 26.7 — innerHTML Lint Kuralı 🟢
- [ ] ESLint `no-restricted-properties` kuralı ile innerHTML kullanımını engelle
- [ ] Test ve highlight.js için eslint-disable izni

---

## Etkilenen Dosyalar
- `js/phone/messages.js` — 14 innerHTML
- `js/features/script-builder.js` — 8 innerHTML
- `js/features/people.js` — 3 innerHTML
- `js/features/autocomplete.js` — 1 innerHTML (1 hariç)
- `js/app.js` — 2 innerHTML
- `js/features/player.js` — 1 innerHTML
- `js/ui/mobile.js` — 2 innerHTML
- Yeni: `js/utils/dom-helper.js`
- `.eslintrc.json` veya `eslint.config.js`

## Dokunulmayan Dosyalar
- `js/ui/highlight.js` — performans kritik, pre-escaped
- `js/features/autocomplete.js:359` — escapeHtml helper, doğru kullanım
- `tests/*.test.js` — test fixture'lar

## Tahmini Kapsam
Büyük — 25 innerHTML dönüşümü. Test altyapısı hazır olduğu için güvenli.
