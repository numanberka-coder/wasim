# Faz 16 — Tab Öğreticileri ✅

## Tamamlanan Adımlar

### Adım 1: CSS Stilleri ✅
- [x] `.tutorial-guide` — accordion'a özel margin
- [x] `.guide-section` — bölüm aralıkları
- [x] `.guide-title` — yeşil uppercase başlık
- [x] `.guide-code` — monospace kod kutusu
- [x] `.guide-text` — açıklama metni
- [x] `.guide-table` — komut tablosu (th/td stilli)
- [x] `.guide-tip` — yeşil vurgulu ipucu kutusu

### Adım 2: Senaryo Tab Rehberi (16.1 + 16.5) ✅
- [x] `#tutorialSenaryo` accordion eklendi
- [x] Temel kullanım açıklaması
- [x] Mesaj format örnekleri (Kişi: Metin, yanıt, @typing, @photo)
- [x] 16 komutluk tam tablo (komut / açıklama / örnek)
- [x] Hız & Rastgelelik açıklaması
- [x] 1-1 sohbet ipucu (16.5) — yeşil tip kutusu

### Adım 3: İnteraktif Tab Rehberi (16.2) ✅
- [x] `#tutorialInteractive` accordion eklendi
- [x] İnteraktif mod açıklaması
- [x] Blok yapısı kod örneği (#blok_adi, trigger, ---)
- [x] Adım adım kullanım akışı (4 adım)
- [x] #default + trigger: * ipucu

### Adım 4: Builder Tab Rehberi (16.3) ✅
- [x] `#tutorialBuilder` accordion eklendi
- [x] Blok Builder açıklaması
- [x] 5 adımlı kullanım akışı
- [x] Araya ekleme & hızlı menü açıklaması
- [x] Trigger opsiyonellik ipucu

### Adım 5: İlk Açılış Davranışı (16.4) ✅
- [x] `initTutorials()` fonksiyonu — app.js
- [x] localStorage key: `wa_sim_tutorials_seen`
- [x] İlk ziyarette rehberler open attribute ile açık
- [x] Sonraki ziyaretlerde kapalı (varsayılan)

## Değişen Dosyalar
- `index.html` — 3 tutorial accordion (#tutorialSenaryo, #tutorialInteractive, #tutorialBuilder)
- `css/components.css` — tutorial-guide, guide-section, guide-title, guide-code, guide-text, guide-table, guide-tip stilleri
- `js/app.js` — initTutorials() fonksiyonu, init()'e çağrı ekleme
- `ROADMAP.md` — Faz 16 tamamlandı olarak işaretlendi
- `README.md` — Mevcut durum 1-16 olarak güncellendi
