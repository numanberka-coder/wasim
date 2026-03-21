# Faz 16 — Tab Öğreticileri

## Plan

Her 3 script alt tab'ına (Senaryo, İnteraktif, Blok Builder) collapsible "Nasıl Kullanılır?" rehberi eklenecek. Mevcut `<details class="accordion">` pattern'i kullanılacak. İlk ziyarette rehber açık gelecek, sonra localStorage ile hatırlanacak.

### Adım 1: Senaryo Tab Rehberi (16.1)
- `tabSenaryo` paneline, textarea'nın hemen üstüne bir `<details class="accordion">` ekle
- İçerik: Komut listesi tablosu, syntax örnekleri, hız/jitter açıklaması, 1-1 sohbet ipucu (16.5)
- [ ] HTML ekleme
- [ ] İlk ziyaret: `open` attribute

### Adım 2: İnteraktif Tab Rehberi (16.2)
- `tabInteractive` paneline, textarea'nın üstüne accordion ekle
- İçerik: Blok syntax (#blok_adi, trigger, ---), adım adım akış, demo yükleme ipucu
- Mevcut "Syntax Referansı" accordion'u korunacak (zaten var)
- [ ] HTML ekleme

### Adım 3: Builder Tab Rehberi (16.3)
- `tabBuilder` paneline, hazır şablonların üstüne accordion ekle
- İçerik: Trigger ayarları, satır ekleme akışı, metne aktarma, insert modu, context menü
- [ ] HTML ekleme

### Adım 4: CSS Stilleri
- Tutorial accordion'a özel `.tutorial-guide` stili (opsiyonel - ihtiyaç olursa)
- İçerik için `.guide-section`, `.guide-code` gibi yardımcı stiller
- Kod örnekleri için monospace kutu stili (mevcut interactive syntax referansındaki gibi)
- [ ] components.css güncelleme

### Adım 5: İlk Açılış Davranışı (16.4)
- localStorage key: `wa_sim_tutorials_seen`
- İlk ziyarette rehberler `open` attribute ile açık
- Kullanıcı kapatınca localStorage'a kaydet
- Sonraki ziyaretlerde kapalı başla
- [ ] JS mantığı (app.js veya ayrı fonksiyon)

### Adım 6: Doğrulama & Test
- [ ] 3 tab'da da rehber görünüyor
- [ ] Açılıp kapanıyor (accordion çalışıyor)
- [ ] İlk ziyarette açık, sonra kapalı
- [ ] Mobilde düzgün görünüyor
- [ ] Light mode'da düzgün görünüyor

## Değişecek Dosyalar
- `index.html` — 3 accordion rehber ekleme
- `css/components.css` — Tutorial-specific stiller
- `js/app.js` — İlk açılış localStorage kontrolü
- `ROADMAP.md` — Faz 16 tamamlandı olarak işaretleme
- `README.md` — Durum güncelleme
