# Faz 25 — Erişilebilirlik (a11y)

> **Tarih:** 2026-03-23
> **Kapsam:** WCAG AA uyumu — aria-label, heading hiyerarşisi, form a11y, kontrast, keyboard nav, screen reader, reduced motion
> **Durum:** 📋 Plan Onayı Bekleniyor

---

## Mevcut Durum Analizi

**İyi durumda olanlar:**
- ✅ `:focus-visible` stili mevcut (base.css:71-75)
- ✅ `prefers-reduced-motion` desteği mevcut (responsive.css:511-532)
- ✅ `prefers-contrast: high` desteği mevcut (responsive.css:534-544)
- ✅ Composer butonlarında 4 adet `aria-label` mevcut
- ✅ Syntax overlay'de `aria-hidden="true"` doğru kullanılmış
- ✅ Form inputların ~%95'inde proper `<label for="">` mevcut
- ✅ Autocomplete'te ok tuşu + Enter + Escape desteği mevcut

**Düzeltilmesi gerekenler:**
- ❌ 14+ icon buton `aria-label` eksik (sadece `title` var)
- ❌ Tüm dokümanda h1-h6 heading YOK
- ❌ 3 SVG ikon buton olarak kullanılıyor ama `role="button"` yok
- ❌ 5 label elementinde `for` attribute eksik
- ❌ `aria-live` bölgesi yok (dinamik içerik değişiklikleri)
- ❌ `.composer-input:focus` tüm focus göstergelerini kaldırıyor
- ❌ Placeholder text kontrast çok düşük (opacity 0.35)
- ❌ Tab navigasyonu için `tabindex` yönetimi yok
- ❌ Div tabanlı tab'larda `role="tab"` semantiği yok

---

## Görevler

### 25.1 — Icon Button aria-label 🔴
- [ ] Action bar butonları: `#phoneOnlyBtn`, `#screenshotBtn`, `#actionThemeToggleBtn`, `#saveAllBtn`, `#loadAllBtn`, `#clearAllBtn` (6 buton)
- [ ] Phone-only toolbar: `#phoneOnlyExitBtn`, scale butonları, `#potThemeToggleBtn`, `#potScreenshotBtn` (5 buton)
- [ ] Header SVG ikonları: video call, voice call, `#headerMenuBtn` — `role="button"` + `aria-label` (3 ikon)
- [ ] Mobile overlay: `#moPlayBtn`, `#moResetBtn` (2 buton)

### 25.2 — Heading Hiyerarşisi 🔴
- [ ] Marka/logo text → `<h1>` (sayfa başlığı)
- [ ] Panel sekmeleri: Grup, Kişiler, Senaryo, Ayarlar bölüm başlıkları
- [ ] Accordion başlıklarında uygun heading seviyesi (summary içinde)
- [ ] `.tab` div elementlerine `role="tab"` + `role="tablist"` + `role="tabpanel"` semantiği

### 25.3 — Form Erişilebilirliği 🟡
- [ ] Orphan label düzeltmeleri: 5 adet `<label>` elementine `for` attribute ekle (satır 105, 178, 281, 415, 244)
- [ ] `aria-describedby` ile karmaşık inputlara açıklama bağla
- [ ] Zorunlu alanlara `aria-required="true"` ekle

### 25.4 — Renk Kontrast Kontrolü 🟡
- [ ] `--wa-composer-placeholder` opacity 0.35 → en az 0.5 (WCAG AA 4.5:1)
- [ ] `.composer-input:focus` focus göstergesi geri ekle (components.css:101-106)
- [ ] `--wa-text-secondary` kontrast doğrulaması

### 25.5 — Keyboard Navigasyonu 🟡
- [ ] Ana tab'lara `tabindex="0"` + `role="tab"` + ok tuşu navigasyonu
- [ ] Accordion header'lara focus stili
- [ ] Scene/people list item'larına keyboard erişimi
- [ ] Modal/overlay'lerde focus trap (mobile overlay)

### 25.6 — Screen Reader Desteği 🟢
- [ ] Validation hataları için `aria-live="polite"` bölgesi
- [ ] Script yükleme/parse durumu için `aria-live` bölgesi
- [ ] Sahne kaydetme/yükleme bildirimleri için `aria-live`
- [ ] Telefon simülatöründe `role="log"` ile chat alanı işaretleme

### 25.7 — Reduced Motion Desteği 🟢
- [ ] ✅ Zaten mevcut (responsive.css:511-532) — doğrulama yeterli
- [ ] JS animasyonlarında `matchMedia('prefers-reduced-motion: reduce')` kontrolü

---

## Etkilenen Dosyalar
- `index.html` — aria-label, heading, role, tabindex eklemeleri
- `css/variables.css` — kontrast düzeltmeleri
- `css/components.css` — focus stili düzeltmesi
- `css/base.css` — keyboard focus stilleri
- `js/app.js` — tab navigasyon mantığı, aria-live güncellemeleri
- `js/ui/mobile.js` — focus trap

## Tahmini Kapsam
Orta — çoğu HTML attribute ekleme, CSS küçük düzeltmeler, minimal JS değişiklikleri
