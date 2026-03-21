# Project Context

## Proje: wa-sim-beta
Tarayıcı tabanlı WhatsApp simülatörü. Sosyal medya içerik üretimi için
gerçekçi WhatsApp görünümü sağlar. Senaryo yazılır, telefon simülatöründe
oynatılır, PNG export alınır.

## Mevcut Durum
Faz 1–20 tamamlandı. Proje production-ready görsel kalitede.
Faz 20: Güvenlik & Stabilite — XSS düzeltmesi, hata koruması, Logger utility.

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
- `css/phone.css` — Telefon simülatörü stilleri (pixel-perfect)
- `css/variables.css` — Tüm CSS değişkenleri
- `css/responsive.css` — Mobil layout
- `css/components.css` — UI bileşenleri
- `tasks/` — Plan ve lessons dosyaları

## Çalışma Kuralları
- UI metinleri ve yorumlar **Türkçe**, teknik terimler İngilizce
- Onay almadan implementasyona başlama — önce plan sun
- Her fazı zip olarak arşivle
- Toast bildirimi ekleme — ekran kaydı gerçekçiliğini bozar
