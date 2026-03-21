# Faz 22 — Build Sistemi

> **Tarih:** 2026-03-21
> **Kapsam:** Vite + ES modules geçişi — 23 JS dosyası modüler sisteme taşınacak
> **Durum:** Plan aşaması

---

## Genel Strateji

Projedeki 23 JS dosyası şu anda global scope'ta çalışıyor (24 `<script>` etiketi).
Hedef: Vite ile modern build sistemi, ES modules ile sıfır global namespace kirliliği.

**Bağımlılık katmanları (aşağıdan yukarı):**
```
utils.js, config.js          → Sıfır bağımlılık (temel katman)
state.js                     → config, utils
storage.js                   → state, config, utils
ui/toast.js                  → Sıfır bağımlılık
ui/validation.js             → utils ($, $one)
ui/tabs.js                   → utils (Logger)
ui/accordion.js              → Sıfır bağımlılık
ui/forms.js                  → utils ($$, Logger)
ui/mobile.js                 → utils, state, storage, toast
ui/highlight.js              → utils, script-parser
phone/header.js              → utils, state, config
phone/statusbar.js           → utils, state
phone/wallpaper.js           → utils, state, config
phone/typography.js          → utils, state
phone/messages.js            → utils, config, state
features/script-parser.js    → utils (Logger)
features/interactive-engine.js → script-parser, state, utils
features/people.js           → utils, state, toast, validation
features/player.js           → state, utils, config, script-parser, messages, people, toast, interactive
features/script-builder.js   → utils, state, config, script-parser, people, toast, validation
features/autocomplete.js     → utils ($)
app.js → main.js             → HER ŞEY (orchestrator)
```

**Önemli not:** `html2canvas` CDN'den async yükleniyor → npm paketi olarak eklenecek, lazy import ile sadece export'ta yüklenecek.

---

## Görevler

### 22.1 — package.json oluşturma 🔴
- [ ] `package.json` oluştur: name, version, type: "module", scripts (dev, build, preview)
- [ ] `html2canvas` npm dependency olarak ekle
- [ ] `npm install` ile bağımlılıkları kur

### 22.2 — Vite kurulumu 🔴
- [ ] `vite` devDependency olarak ekle
- [ ] `vite.config.js` oluştur (minimal config, root: './')
- [ ] Dev server + hot reload çalışır durumda

### 22.3 — ES6 module geçişi 🔴
Tüm 23 JS dosyasını `import`/`export` sisteme geçir. Sıra kritik — aşağıdan yukarı:

**Katman 1 — Sıfır bağımlılık:**
- [ ] `js/utils.js` — tüm fonksiyonlara `export` ekle
- [ ] `js/config.js` — tüm sabitlere `export` ekle
- [ ] `js/ui/toast.js` — `export` ekle
- [ ] `js/ui/accordion.js` — `export` ekle

**Katman 2 — Temel bağımlılıklar:**
- [ ] `js/state.js` — import utils/config, export state/StateManager
- [ ] `js/ui/validation.js` — import utils
- [ ] `js/ui/tabs.js` — import utils
- [ ] `js/ui/forms.js` — import utils
- [ ] `js/features/script-parser.js` — import utils
- [ ] `js/features/autocomplete.js` — import utils

**Katman 3 — Orta bağımlılıklar:**
- [ ] `js/storage.js` — import state, config, utils
- [ ] `js/phone/header.js` — import utils, state, config
- [ ] `js/phone/statusbar.js` — import utils, state
- [ ] `js/phone/wallpaper.js` — import utils, state, config
- [ ] `js/phone/typography.js` — import utils, state
- [ ] `js/phone/messages.js` — import utils, config, state
- [ ] `js/ui/highlight.js` — import utils, script-parser

**Katman 4 — Yüksek bağımlılıklar:**
- [ ] `js/features/people.js` — import utils, state, toast, validation
- [ ] `js/features/interactive-engine.js` — import script-parser, state, utils
- [ ] `js/features/player.js` — import state, utils, config, script-parser, messages, people, toast, interactive
- [ ] `js/features/script-builder.js` — import utils, state, config, script-parser, people, toast, validation
- [ ] `js/ui/mobile.js` — import utils, state, storage, toast + diğerleri

**Katman 5 — Entry point:**
- [ ] `js/app.js` — tüm modülleri import et

### 22.4 — Tek entry point 🔴
- [ ] `index.html`'den 24 `<script>` etiketi kaldır
- [ ] Tek `<script type="module" src="js/app.js"></script>` ekle
- [ ] CDN html2canvas script etiketi kaldır
- [ ] DOMContentLoaded → modül seviyesinde çalışma (top-level await veya init pattern)

### 22.5 — Production build 🟡
- [ ] `npm run build` çalışır durumda
- [ ] Minification + tree-shaking + source maps
- [ ] `dist/` klasöründe production output

### 22.6 — html2canvas lazy import 🟡
- [ ] CDN script → `import('html2canvas')` dynamic import
- [ ] Sadece PNG export butonuna tıklayınca yüklensin
- [ ] typeof kontrolü yerine dynamic import kullanımı

### 22.7 — CSS optimizasyonu 🟢
- [ ] Vite CSS processing ile minification otomatik gelecek
- [ ] CSS dosyaları import ile çekilebilir (opsiyonel)

### 22.8 — Lint & format 🟢
- [ ] ESLint konfigürasyonu (ES modules uyumlu)
- [ ] Prettier konfigürasyonu
- [ ] `npm run lint` script'i

---

## Risk Analizi

| Risk | Etki | Azaltma |
|------|------|---------|
| Circular dependency | Yüksek | Bağımlılık grafiğini katman katman takip et |
| html2canvas async yükleme | Orta | npm paketi + dynamic import |
| Tüm dosyalar aynı anda değişir | Yüksek | Katman sırasıyla ilerle, her katman sonrası test et |
| DOM event binding zamanlaması | Orta | DOMContentLoaded yerine modül yükleme sırası |

---

## Doğrulama Planı

1. `npm run dev` ile Vite dev server başlatılır
2. Tüm UI fonksiyonları test edilir (tema değişimi, mesaj ekleme, senaryo oynatma, export)
3. `npm run build` ile production build alınır
4. `npm run preview` ile production build test edilir
5. Konsol hatası sıfır olmalı
