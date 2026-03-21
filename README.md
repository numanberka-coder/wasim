# Project Context

## Proje: wa-sim-beta
Tarayıcı tabanlı WhatsApp simülatörü. Sosyal medya içerik üretimi için
gerçekçi WhatsApp görünümü sağlar. Senaryo yazılır, telefon simülatöründe
oynatılır, PNG export alınır.

## Mevcut Durum
Faz 1–24 tamamlandı. Proje production-ready görsel kalitede.
Faz 22: Build Sistemi — Vite + ES modules geçişi, tek bundle.
Faz 23: Test Altyapısı — Vitest + 191 unit test, CI entegrasyonu, coverage raporu.
Faz 24: Performans — Message virtualization, rAF animasyon, CSS modülleme, lazy loading.

## Dosya Mimarisi
- `index.html` — Ana giriş noktası
- `js/app.js` — Ana uygulama state ve koordinasyon
- `js/player.js` — Senaryo oynatma motoru
- `js/features/conditional-parser.js` — İnteraktif mod parser
- `js/features/conditional-engine.js` — Trigger eşleştirme motoru
- `js/features/script-builder.js` — Blok Builder UI
- `js/features/autocomplete.js` — Senaryo editörü otomatik tamamlama
- `js/ui/highlight.js` — Syntax highlighting overlay motoru
- `js/ui/` — Header, mesaj render, status bar vb.
- `js/ui/virtual-scroller.js` — Message virtualization (IntersectionObserver)
- `css/phone.css` — Telefon simülatörü stilleri (7 modüler dosya + barrel import)
- `css/variables.css` — Tüm CSS değişkenleri
- `css/responsive.css` — Mobil layout
- `css/components.css` — UI bileşenleri
- `tasks/` — Plan ve lessons dosyaları

## Çalışma Kuralları
- UI metinleri ve yorumlar **Türkçe**, teknik terimler İngilizce
- Onay almadan implementasyona başlama — önce plan sun
- Her fazı zip olarak arşivle
- Toast bildirimi ekleme — ekran kaydı gerçekçiliğini bozar
