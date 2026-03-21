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

### 22.1 — package.json oluşturma ✅
- [x] `package.json` oluştur: name, version, type: "module", scripts (dev, build, preview)
- [x] `html2canvas` npm dependency olarak ekle
- [x] `npm install` ile bağımlılıkları kur

### 22.2 — Vite kurulumu ✅
- [x] `vite` devDependency olarak ekle
- [x] `vite.config.js` oluştur (minimal config, root: './')
- [x] Dev server + hot reload çalışır durumda

### 22.3 — ES6 module geçişi ✅
Tüm 23 JS dosyası `import`/`export` sistemine geçirildi. Katman sırasıyla:

**Katman 1 — Sıfır bağımlılık:**
- [x] `js/utils.js` — tüm fonksiyonlara `export` ekle
- [x] `js/config.js` — tüm sabitlere `export` ekle
- [x] `js/ui/toast.js` — `export` ekle
- [x] `js/ui/accordion.js` — `export` + import utils ekle

**Katman 2 — Temel bağımlılıklar:**
- [x] `js/state.js` — import utils/config, export state/StateManager
- [x] `js/ui/validation.js` — import utils
- [x] `js/ui/tabs.js` — import utils
- [x] `js/ui/forms.js` — import utils
- [x] `js/features/script-parser.js` — import utils
- [x] `js/features/autocomplete.js` — import utils

**Katman 3 — Orta bağımlılıklar:**
- [x] `js/storage.js` — import state, config, utils
- [x] `js/phone/header.js` — import utils, state, config
- [x] `js/phone/statusbar.js` — import utils, state
- [x] `js/phone/wallpaper.js` — import utils, state, config
- [x] `js/phone/typography.js` — import utils, state
- [x] `js/phone/messages.js` — import utils, toast, state + export API
- [x] `js/ui/highlight.js` — export SyntaxHighlight + initHighlight

**Katman 4 — Yüksek bağımlılıklar:**
- [x] `js/features/people.js` — import utils, state, toast, validation + export API
- [x] `js/features/interactive-engine.js` — import script-parser, state, utils, toast, messages, people, player
- [x] `js/features/player.js` — import state, utils, config, script-parser, messages, people, toast, interactive
- [x] `js/features/script-builder.js` — import utils, state, config, script-parser, people, toast, interactive, player
- [x] `js/ui/mobile.js` — import utils, state, storage, toast, player, people, phone modules

**Katman 5 — Entry point:**
- [x] `js/app.js` — tüm modülleri import et

### 22.4 — Tek entry point ✅
- [x] `index.html`'den 24 `<script>` etiketi kaldır
- [x] Tek `<script type="module" src="js/app.js"></script>` ekle
- [x] CDN html2canvas script etiketi kaldır → npm paketi + dynamic import
- [x] DOMContentLoaded → init pattern korundu

### 22.5 — Production build ✅
- [x] `npm run build` çalışır durumda (1.01s)
- [x] Minification + tree-shaking + source maps
- [x] `dist/` klasöründe production output (116KB JS + 202KB html2canvas lazy chunk)

### 22.6 — html2canvas lazy import ✅
- [x] CDN script → `import('html2canvas')` dynamic import
- [x] Sadece PNG export butonuna tıklayınca yüklensin
- [x] typeof kontrolü yerine dynamic import kullanımı

### 22.7 — CSS optimizasyonu ✅
- [x] Vite CSS processing ile minification otomatik (64.91KB → 12.92KB gzip)

### 22.8 — Lint & format 🟡
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
