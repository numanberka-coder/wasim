# 🔧 WhatsApp Simülatörü — İyileştirme Yol Haritası (ROADMAP 2)

> **Başlangıç:** 2026-03-21
> **Kapsam:** Faz 1–19 tamamlanmış proje üzerinde kalite, güvenlik, performans ve sürdürülebilirlik iyileştirmeleri
> **Hedef:** Projeyi hobi seviyesinden profesyonel seviyeye taşımak — test, build, güvenlik, erişilebilirlik

---

## 📋 İçindekiler

1. [Mevcut Durum](#mevcut-durum)
2. [Faz 20 — Güvenlik & Stabilite](#-faz-20--güvenlik--stabilite)
3. [Faz 21 — Kod Kalitesi & Refactoring](#-faz-21--kod-kalitesi--refactoring)
4. [Faz 22 — Build Sistemi](#-faz-22--build-sistemi)
5. [Faz 23 — Test Altyapısı](#-faz-23--test-altyapısı)
6. [Faz 24 — Performans Optimizasyonu](#-faz-24--performans-optimizasyonu)
7. [Faz 25 — Erişilebilirlik (a11y)](#-faz-25--erişilebilirlik-a11y)
8. [Faz 26 — innerHTML Temizliği & DOM API Geçişi](#-faz-26--innerhtml-temizliği--dom-api-geçişi)
9. [Öncelik Özeti](#öncelik-özeti)

---

## Mevcut Durum

Proje 19 faz boyunca zengin bir özellik setine kavuşmuş durumda: 16+ mesaj tipi, koşullu mesajlaşma, blok builder, autocomplete, syntax highlighting, sahne yönetimi, PNG export. Sıfır bağımlılık yaklaşımı ve modüler dosya yapısı güçlü temeller oluşturmuş. Ancak proje büyüdükçe aşağıdaki teknik borçlar birikmiş:

| Alan | Mevcut Not | Hedef |
|------|-----------|-------|
| Test & CI | F (hiç yok) | B+ (kritik modüller %80+) |
| Build Sistemi | F (hiç yok) | A- (Vite, ES modules, minify) |
| Güvenlik | B (escapeHtml iyi, innerHTML riskleri var) | A- (XSS riski sıfır) |
| Hata Yönetimi | C (kritik yollarda eksik) | B+ (tüm kritik yollar korumalı) |
| Performans | C+ (debounce var, virtualization yok) | B+ (lazy load, virtualization) |
| Kod Tekrarı | C- (tema mantığı 4+ yerde) | B+ (tek kaynak, DRY) |
| Erişilebilirlik | B- (semantic HTML iyi, ARIA eksik) | B+ (WCAG AA uyumlu) |
| Global Namespace | D (39 global fonksiyon) | A (ES modules, sıfır global) |

---

## 🔒 Faz 20 — Güvenlik & Stabilite
> *En acil iyileştirmeler — kullanıcı verisi ve uygulama kararlılığını koruma*

**Neden ilk?** Güvenlik açıkları ve crash riski diğer tüm iyileştirmelerden önce gelir. Bu faz küçük ama kritik değişiklikler içerir.

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 20.1 | **header.js onerror XSS düzeltmesi** | `onerror="..."` attribute → `addEventListener('error', ...)` geçişi. Satır 64. | 🔴 |
| 20.2 | **Script parser try-catch** | `parseScript()` ve `parseLine()` fonksiyonlarına hata yakalama. Bozuk girdi crash yapmasın. | 🔴 |
| 20.3 | **populateFormFields() hata koruması** | `app.js:92–160` — DOM okuma işlemlerine try-catch. Eksik element olursa sessiz hata. | 🔴 |
| 20.4 | **renderMessage() hata koruması** | `messages.js` — karmaşık DOM manipülasyonuna try-catch wrapper. Tek bozuk mesaj tüm chat'i kırmasın. | 🟡 |
| 20.5 | **console.log temizliği** | 18 debug console.log kaldır veya `DEBUG` flag'ine bağla | 🟡 |
| 20.6 | **Yapısal hata loglama** | Basit bir `Logger` utility: `Logger.error()`, `Logger.warn()`, `Logger.debug()` — production'da sessiz, debug'da verbose | 🟢 |

**Etkilenen dosyalar:** `phone/header.js` · `features/script-parser.js` · `app.js` · `phone/messages.js` · `utils.js` · tüm 18 console.log içeren dosya

**Tahmini kapsam:** Küçük — mevcut kodda minimal değişiklik, yeni özellik yok

---

## 🧹 Faz 21 — Kod Kalitesi & Refactoring
> *Bakım maliyetini düşür, teknik borcu azalt*

**Neden ikinci?** Güvenlik düzeltmelerinden sonra, daha büyük değişikliklere (build, test) geçmeden önce kodu temizlemek gerekir. Bu faz refactoring odaklı — davranış değişikliği yok.

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 21.1 | **bindEventHandlers() refactoring** | 361 satırlık dev fonksiyonu data-driven event map'e dönüştür. `[{selector, event, handler}]` array + `for` döngüsü. | 🔴 |
| 21.2 | **Tema renk sabitleri merkezileştirme** | `app.js`'te 4+ yerde tekrarlanan `#1f2c33`, `#008069`, `#d9fdd3` gibi değerler → `config.js`'te `THEME_DEFAULTS` objesi | 🔴 |
| 21.3 | **renderSceneList() event listener leak düzeltmesi** | Her render'da yeni listener ekleniyor. Çözüm: Event delegation (tek listener parent'ta) veya render öncesi cleanup | 🔴 |
| 21.4 | **Event binding boilerplate azaltma** | `bindClick()`, `bindChange()`, `bindInput()` → tek generic `bindEvent(selector, event, handler)` | 🟡 |
| 21.5 | **renderMessage() parçalama** | ~400 satırlık fonksiyonu mesaj tipine göre alt fonksiyonlara böl: `renderTextMessage()`, `renderImageMessage()`, `renderVoiceMessage()` vb. | 🟡 |
| 21.6 | **Header renk sıfırlama mantığı birleştirme** | Birden fazla fonksiyonda tekrarlanan renk reset mantığı → tek `resetThemeColors()` fonksiyonu | 🟡 |
| 21.7 | **play() fonksiyonu parçalama** | `player.js`'te ~200+ satırlık `play()` → mesaj tipi bazlı handler'lara böl | 🟢 |

**Etkilenen dosyalar:** `app.js` · `config.js` · `phone/messages.js` · `features/player.js`

**Tahmini kapsam:** Orta-büyük — dikkatli refactoring gerektirir, mevcut davranış bozulmamalı

**Not:** Bu faz **Faz 23 (Test)** ile paralel yürütülebilir. Refactoring öncesi test yazılırsa güvenli geçiş sağlanır.

---

## 📦 Faz 22 — Build Sistemi
> *Modern geliştirme altyapısı — modüller, minification, dev server*

**Neden üçüncü?** Build sistemi, modül sistemi ve test altyapısının temelidir. ES modules'e geçiş, global namespace sorununu da çözer.

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 22.1 | **package.json oluşturma** | Proje metadata, script'ler (`dev`, `build`, `preview`) | 🔴 |
| 22.2 | **Vite kurulumu** | Dev server + hot reload + production build. Sıfır config ile çalışır. | 🔴 |
| 22.3 | **ES6 module geçişi** | 24 `<script>` etiketi → `import`/`export` sistemi. Her dosya kendi modülü. Global namespace kirliliği sona erer. | 🔴 |
| 22.4 | **Tek entry point** | `app.js` → `main.js` entry point. Diğer dosyalar import ile çekilir. | 🔴 |
| 22.5 | **Production build** | Minification + tree-shaking + source maps. Tek bundle dosyası. | 🟡 |
| 22.6 | **html2canvas lazy import** | CDN script etiketi → `import('html2canvas')` dynamic import. Sadece PNG export'ta yüklensin. | 🟡 |
| 22.7 | **CSS optimizasyonu** | Vite CSS processing ile autoprefixer, minification | 🟢 |
| 22.8 | **Lint & format** | ESLint + Prettier konfigürasyonu. Tutarlı kod stili. | 🟢 |

**Etkilenen dosyalar:** Tüm 23 JS dosyası · `index.html` · Yeni: `package.json` · `vite.config.js` · `.eslintrc.json` · `.prettierrc`

**Tahmini kapsam:** Büyük — tüm dosyalarda import/export değişikliği. Tek seferde yapılmalı, aşamalı geçiş zor.

**Not:** Bu faz tamamlanınca 24 ayrı `<script>` etiketi yerine tek bir minified bundle yüklenecek. Sayfa yükleme süresi dramatik düşer.

---

## 🧪 Faz 23 — Test Altyapısı
> *Regresyon güvenliği — refactoring ve yeni fazlar için güven ağı*

**Neden dördüncü?** Build sistemi (Faz 22) kurulduktan sonra test runner'ı eklemek çok daha kolay. Vitest, Vite ekosistemiyle doğrudan entegre.

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 23.1 | **Vitest kurulumu** | Test runner konfigürasyonu, `npm test` script'i | 🔴 |
| 23.2 | **Script parser testleri** | `parseLine()`, `parseScript()` — tüm mesaj tipleri, edge case'ler, bozuk girdi | 🔴 |
| 23.3 | **StateManager testleri** | `get()`, `set()`, `subscribe()`, `export()`, `import()` — nested path, deep clone | 🔴 |
| 23.4 | **Config & utils testleri** | `escapeHtml()`, `isValidUrl()`, `debounce()`, `formatTime()` vb. | 🔴 |
| 23.5 | **Player testleri** | Mesaj sıralama, zamanlama, oynatma/durdurma mantığı | 🟡 |
| 23.6 | **Storage testleri** | localStorage mock ile kaydetme/yükleme/silme | 🟡 |
| 23.7 | **DOM testleri (jsdom)** | `renderMessage()` temel çıktı doğrulaması — happy path | 🟡 |
| 23.8 | **CI entegrasyonu** | GitHub Actions — push/PR'da otomatik test çalıştırma | 🟢 |
| 23.9 | **Coverage raporu** | Vitest coverage plugin, minimum %60 hedef | 🟢 |

**Etkilenen dosyalar:** Yeni: `vitest.config.js` · `tests/` klasörü · `.github/workflows/test.yml`

**Tahmini kapsam:** Orta-büyük — test yazımı zaman alır ama proje yapısını değiştirmez

**Not:** Faz 22 (Build) **olmadan da** başlanabilir — Vitest standalone çalışır. Ama ES modules geçişi testleri çok kolaylaştırır.

---

## ⚡ Faz 24 — Performans Optimizasyonu
> *Büyük senaryolarda akıcı deneyim — virtualization, lazy loading, CSS bölme*

**Neden beşinci?** Performans iyileştirmeleri, refactoring (Faz 21) ve build sistemi (Faz 22) üzerine inşa edilir.

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 24.1 | **Message virtualization** | IntersectionObserver ile sadece görünür mesajları render et. 100+ mesajlı senaryolarda dramatik fark. | 🔴 |
| 24.2 | **rebuildChat() optimizasyonu** | Tema değişiminde full DOM yeniden oluşturma yerine CSS class swap + minimal DOM güncellemesi | 🔴 |
| 24.3 | **phone.css bölme** | 1,712 satırlık dosya → `phone-header.css`, `phone-messages.css`, `phone-status.css`, `phone-media.css` | 🟡 |
| 24.4 | **Avatar lazy loading** | Grup fotoğrafı ve mesaj avatarları için `loading="lazy"` veya IntersectionObserver | 🟡 |
| 24.5 | **Wallpaper lazy loading** | Duvar kağıdı resmi ilk render'da değil, arka planda yüklensin | 🟡 |
| 24.6 | **requestAnimationFrame kullanımı** | Animasyonlarda `setTimeout` → `requestAnimationFrame` geçişi | 🟢 |
| 24.7 | **Timer temizleme sistemi** | Voice playback timer'ları DOM kaldırılınca otomatik temizlensin. `AbortController` pattern. | 🟢 |

**Etkilenen dosyalar:** `phone/messages.js` · `phone.css` (bölünecek) · `phone/header.js` · `phone/wallpaper.js` · `app.js` · `features/player.js`

**Tahmini kapsam:** Büyük — virtualization özellikle dikkatli implementasyon gerektirir

---

## ♿ Faz 25 — Erişilebilirlik (a11y)
> *WCAG AA uyumu — herkes için kullanılabilir arayüz*

**Neden altıncı?** Erişilebilirlik önemli ama mevcut fonksiyonelliği bozmaz. Build ve test altyapısı hazır olduktan sonra güvenle yapılır.

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 25.1 | **Icon button aria-label** | `index.html:33–54` — 15+ icon butonuna `aria-label` ekle | 🔴 |
| 25.2 | **Heading hiyerarşisi** | Brand text `<span>` → `<h1>`. Sayfa içi heading seviyeleri düzelt. | 🔴 |
| 25.3 | **Form erişilebilirliği** | `aria-describedby`, `aria-required`, label-input ilişkilendirmesi | 🟡 |
| 25.4 | **Renk kontrast kontrolü** | Düşük opacity renklerin WCAG AA kontrastını ölç, gerekirse ayarla | 🟡 |
| 25.5 | **Keyboard navigasyonu** | Tab sırası, focus visible stilleri, dropdown'larda ok tuşu desteği | 🟡 |
| 25.6 | **Screen reader desteği** | Dinamik içerik değişikliklerinde `aria-live` bölgeleri | 🟢 |
| 25.7 | **Reduced motion desteği** | `prefers-reduced-motion` media query ile animasyonları devre dışı bırak | 🟢 |

**Etkilenen dosyalar:** `index.html` · `variables.css` · `components.css` · `phone.css` · `app.js`

**Tahmini kapsam:** Orta — çoğu HTML attribute ekleme, CSS küçük düzeltmeler

---

## 🛡️ Faz 26 — innerHTML Temizliği & DOM API Geçişi
> *Son güvenlik katmanı — innerHTML yerine güvenli DOM API kullanımı*

**Neden son?** innerHTML temizliği geniş kapsamlı ve riskli. Tüm refactoring, test ve build altyapısı hazır olduktan sonra güvenle yapılır. Testler regresyonu yakalar.

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 26.1 | **messages.js innerHTML geçişi** | 14 innerHTML kullanımı → `createElement()` + `textContent` + `appendChild()` | 🔴 |
| 26.2 | **script-builder.js innerHTML geçişi** | 8 innerHTML kullanımı → DOM API | 🔴 |
| 26.3 | **people.js innerHTML geçişi** | 3 innerHTML kullanımı → DOM API | 🟡 |
| 26.4 | **autocomplete.js innerHTML geçişi** | 2 innerHTML kullanımı → DOM API | 🟡 |
| 26.5 | **Diğer dosyalar** | `app.js` (3), `mobile.js` (2), `player.js` (1), `header.js` (1) — toplam 7 innerHTML | 🟡 |
| 26.6 | **DOM helper utility** | Tekrarlanan DOM oluşturma pattern'leri için `createElement('div', {class: 'foo', text: 'bar'})` helper | 🟢 |
| 26.7 | **innerHTML lint kuralı** | ESLint custom rule veya `no-restricted-properties` — yeni innerHTML kullanımını engelle | 🟢 |

**Etkilenen dosyalar:** `phone/messages.js` · `features/script-builder.js` · `features/people.js` · `features/autocomplete.js` · `app.js` · `ui/mobile.js` · `features/player.js` · `phone/header.js` · `utils.js`

**Tahmini kapsam:** Büyük — 41 innerHTML kullanımının DOM API'ye dönüştürülmesi. Test olmadan yapılmamalı.

**Not:** Tam geçiş yerine aşamalı yaklaşım: önce kullanıcı girdisi içeren innerHTML'ler (yüksek risk), sonra statik HTML üreten innerHTML'ler (düşük risk).

---

## Öncelik Özeti

| Faz | Kapsam | Zorluk | Etki | Bağımlılık |
|-----|--------|--------|------|------------|
| **Faz 20** | Güvenlik & Stabilite | 🟢 Küçük | ⭐⭐⭐⭐⭐ | Yok — hemen başlanabilir |
| **Faz 21** | Kod Kalitesi & Refactoring | 🟡 Orta-Büyük | ⭐⭐⭐⭐ | Yok — hemen başlanabilir |
| **Faz 22** | Build Sistemi | 🔴 Büyük | ⭐⭐⭐⭐⭐ | Yok — bağımsız |
| **Faz 23** | Test Altyapısı | 🟡 Orta-Büyük | ⭐⭐⭐⭐⭐ | Faz 22 sonrası daha kolay |
| **Faz 24** | Performans | 🔴 Büyük | ⭐⭐⭐⭐ | Faz 21 + 22 sonrası ideal |
| **Faz 25** | Erişilebilirlik | 🟡 Orta | ⭐⭐⭐ | Faz 22 sonrası ideal |
| **Faz 26** | innerHTML Temizliği | 🔴 Büyük | ⭐⭐⭐⭐ | Faz 22 + 23 **zorunlu** |

---

## Önerilen Sıralama & Bağımlılık Grafiği

```
Faz 20 (Güvenlik) ──────────────────────────────────────► Hemen başla
    │
    ▼
Faz 21 (Refactoring) ──► Faz 22 (Build) ──► Faz 23 (Test)
                              │                    │
                              ▼                    ▼
                         Faz 24 (Perf)       Faz 26 (innerHTML)
                              │
                              ▼
                         Faz 25 (a11y)
```

> 💡 **Paralel çalışma fırsatları:**
> - **Faz 20 + Faz 21** paralel başlayabilir (farklı dosyalara dokunur)
> - **Faz 23 + Faz 24** kısmen paralel (test yazımı + performans farklı modüllerde)
> - **Faz 25** herhangi bir noktada bağımsız başlayabilir (HTML/CSS odaklı)

---

## Toplam Etki Projeksiyonu

Bu yol haritası tamamlandığında:

- **0 → %80+ test coverage** (kritik modüller)
- **24 script etiketi → 1 minified bundle** (~%70 daha hızlı yükleme)
- **41 innerHTML → 0** (XSS riski sıfır)
- **39 global fonksiyon → 0** (ES modules)
- **361 satırlık fonksiyon → 30 satırlık event map** (bakım kolaylığı)
- **18 debug console.log → yapısal Logger** (kontrollü loglama)
- **WCAG AA uyumlu** arayüz

---

> 📝 **Not:** Her faz kendi içinde bağımsız bir todo.md ile planlanmalı. Bu yol haritası üst düzey bir rehberdir — implementasyon detayları faz başladığında belirlenecektir.
