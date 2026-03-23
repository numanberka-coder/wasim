# Faz 25 — Erişilebilirlik (a11y)

> **Tarih:** 2026-03-23
> **Kapsam:** WCAG AA uyumu — aria-label, heading hiyerarşisi, form a11y, kontrast, keyboard nav, screen reader, reduced motion
> **Durum:** ✅ Tamamlandı

---

## Görevler

### 25.1 — Icon Button aria-label ✅
- [x] Action bar butonları: 6 buton (#phoneOnlyBtn, #screenshotBtn, #actionThemeToggleBtn, #saveAllBtn, #loadAllBtn, #clearAllBtn)
- [x] Phone-only toolbar: 5 buton (#phoneOnlyExitBtn, 3 scale buton, #potThemeToggleBtn, #potScreenshotBtn)
- [x] Header SVG ikonları: video call (`role="img"`), voice call (`role="img"`), #headerMenuBtn (`role="button"` + `tabindex="0"`)
- [x] Mobile overlay: #moPlayBtn, #moResetBtn, #mobileOverlayBack

### 25.2 — Heading Hiyerarşisi + Tab Semantiği ✅
- [x] Brand text `<span>` → `<h1>` (CSS margin:0 ile görsel uyum korundu)
- [x] Tab'lara `role="tablist"` / `role="tab"` + `aria-selected` + `aria-controls`
- [x] Panel'lere `role="tabpanel"` + `aria-labelledby`
- [x] `<section>` ve `<main>` elementlerine `aria-label` landmark

### 25.3 — Form Erişilebilirliği ✅
- [x] 3 orphan `<label>` düzeltildi: groupPhotoFile, wallpaperImageFile, pAvatarFile
- [x] Tick status group'a `role="group"` + `aria-labelledby`
- [x] Medya yardımcı label'a `id` eklendi
- [x] Kişi adı inputuna `aria-required="true"` eklendi

### 25.4 — Renk Kontrast Düzeltmeleri ✅
- [x] `--wa-composer-placeholder` opacity 0.35 → 0.5 (dark + light tema)
- [x] `.composer-input:focus-visible` box-shadow eklendi (keyboard focus göstergesi)

### 25.5 — Keyboard Navigasyonu ✅
- [x] Tab'lara ok tuşu navigasyonu (ArrowLeft/Right/Up/Down + Home/End)
- [x] Tab aktivasyonunda `aria-selected` + `tabindex` dinamik güncelleme
- [x] Mobile overlay'de Escape tuşu ile kapatma
- [x] Header dropdown Escape ile kapatma + focus restore
- [x] Mobile overlay focus trap (Tab/Shift+Tab döngüsü)

### 25.6 — Screen Reader Desteği ✅
- [x] Chat body'ye `role="log"` + `aria-live="polite"` + `aria-label`
- [x] Toast container'a `role="status"` + `aria-live="polite"` + `aria-atomic`
- [x] Header dropdown'a `role="menu"` + `aria-label`
- [x] Dropdown butonlarına `role="menuitem"`

### 25.7 — Reduced Motion JS Kontrolü ✅
- [x] `prefersReducedMotion()` utility fonksiyonu (utils.js)
- [x] Player typing animasyonu reduced motion'da atlanır (0ms)
- [x] jsdom uyumlu güvenli kontrol (matchMedia yoksa false)
- [x] CSS `prefers-reduced-motion` zaten mevcut — doğrulandı

---

## Sonuç Özeti

| Metrik | Önce | Sonra |
|--------|------|-------|
| Icon button aria-label | 4 adet | 20 adet |
| Heading hiyerarşisi | h1-h6 yok | h1 + tab/tabpanel semantiği |
| Orphan label | 5 adet | 0 adet |
| Placeholder kontrast | opacity 0.35 | opacity 0.50 |
| Keyboard navigasyonu | Sadece autocomplete | Tab ok tuşları + Escape + focus trap |
| aria-live bölgeleri | 0 | 3 (chat, toast, dropdown) |
| Reduced motion JS | Yok | Player typing atlanır |
| Test | 191 PASS | 191 PASS |
| Build | 34 modül | 34 modül |
