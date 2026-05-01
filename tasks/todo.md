# Faz 34 - Olcumleme (Analytics) & Karar Destegi

> Tarih: 2026-05-01
> Branch: codex/faz-34
> Kaynak: ROADMAP4.md / Faz 34
> Durum: Tamamlandi

---

## Roadmap Ozeti

Faz 34, uygulama icinde anonim ve yerel kalan kullanim olaylarini kaydedip
kullaniciya son 7 gunluk sade bir metrik ozeti gostermeyi hedefler. Amac
uzak servis veya kisi takibi eklemek degil; hangi akislarin gercekten
kullanildigini ve onboarding'in nerede yarida kaldigini localStorage uzerinden
gorunur hale getirmektir.

Kapsam:
- 34.1 Anonim olay takibi altyapisi
- 34.2 Yerel metrik paneli
- 34.3 Onboarding dusme noktasi tespiti
- 34.4 Roadmap geri besleme dongusu

Etkilenen dosyalar:
- `js/storage.js`
- `js/app.js`
- `index.html`
- `css/components.css`
- `tests/storage.test.js`

---

## Mevcut Durum

- Uygulama localStorage tabanli state ve sahne kaydi kullaniyor.
- Faz 29 onboarding akisi `ONBOARDING_KEY` ve `GOAL_KEY` ile ilk oynatma ve ilk
  ekran goruntusu hedeflerini tutuyor.
- Faz 33 sahne yonetimi `sceneManager` icinde metadata ve son erisim bilgisini
  sakliyor.
- Su anda olay takibi, 7 gunluk ozet veya onboarding adim bazli terk bilgisi yok.
- Ayarlar panelinde onboarding/mod bolumu ve pro-only sahne bolumu Faz 34
  paneli icin uygun yerler.

---

## Mimari Karar

- Analytics tamamen lokal ve anonim olacak; ag istegi, kullanici kimligi veya
  dis servis eklenmeyecek.
- `js/storage.js` icinde `analyticsManager` adli kucuk bir API eklenecek:
  - `track(eventName, metadata = {})`
  - `getEvents()`
  - `getSummary(days = 7)`
  - `recordOnboardingStep(step, action)`
  - `getOnboardingFunnel()`
  - `clear()`
- Event kayitlari `CONFIG.ANALYTICS_KEY` altinda saklanacak ve 30 gunluk
  pencereyle sinirlanacak.
- UI sadece ozet metrikleri gosterecek; ham event listesi varsayilan olarak
  gosterilmeyecek.
- Onboarding drop-off hesabi su aksiyonlardan turetilecek:
  - rehber acildi
  - adim goruldu
  - ileri tiklandi
  - gecildi
  - tamamlandi
- Roadmap geri besleme dongusu, panelde otomatik hesaplanan "sonraki odak"
  satiri olarak kalacak; roadmap dosyalarini otomatik degistirmeyecek.

---

## Gorevler

- [x] 1. `CONFIG` icine analytics localStorage anahtari ve saklama suresi ekle.
- [x] 2. `storage.js` icinde local, anonim `analyticsManager` API'sini ekle.
- [x] 3. Analytics kayitlarini bozuk JSON, eski veri ve fazla buyuyen event
      listesine karsi dayanıklı hale getir.
- [x] 4. `app.js` icinde temel eventleri bagla:
      - uygulama acilisi
      - senaryo yukle
      - oynat
      - ekran goruntusu al
      - sahne kaydet/yukle/sil
      - template/demo yukle
      - onboarding adimlari
- [x] 5. Ayarlar paneline kompakt "Kullanim Ozeti" paneli ekle:
      - son 7 gun event toplamı
      - oynatma ve ekran goruntusu sayisi
      - sahne ve sablon kullanimi
      - onboarding durum/dusme noktasi
      - karar destegi onerisi
- [x] 6. Panel yenileme ve temizleme aksiyonlarini ekle; temizleme yalnizca
      analytics verisini silmeli.
- [x] 7. CSS ile metrik kartlari mevcut ayarlar paneli diliyle uyumlu ve mobilde
      tasmasiz hale getir.
- [x] 8. `tests/storage.test.js` icinde analytics API, 7 gun filtresi, veri
      budama, onboarding funnel ve temizleme davranislarini kapsa.
- [x] 9. Dogrulama:
      - `node --check js/storage.js`
      - `node --check js/app.js`
      - `npm.cmd test -- tests/storage.test.js`
      - `npm.cmd test`
      - `npm.cmd run build`

---

## Kabul Kriterleri

- Analytics dis servise veri gondermez; tum veri localStorage'da kalir.
- Eventler anonimdir ve kullanici/metin/mesaj icerigi gibi hassas veri saklamaz.
- Son 7 gun metrik paneli uygulama icinden okunabilir sekilde gorunur.
- Onboarding acildi, adim goruldu, gecildi ve tamamlandi gibi aksiyonlardan
  dusme noktasi anlasilabilir.
- Analytics verisi tek aksiyonla temizlenebilir ve uygulama state/sahne verisini
  silmez.
- Bozuk localStorage verisi uygulamayi bozmaz.
- Test ve build gecmeden Faz 34 tamam sayilmaz.

---

## Elegance Check

- En sade cozum, analytics'i mevcut storage katmanina kucuk bir manager olarak
  eklemek ve UI tarafinda sadece ozet gostermektir.
- Yeni paket, backend, network endpoint veya global state genisletmesi gereksiz
  olur; Faz 34 hedefi karar destegi icin lokal sinyal toplamaktir.
- Roadmap geri beslemesi dosya yazan otomasyon degil, kullaniciya gorunen
  hesaplanmis oneriler olarak kalmali.

---

## Review

- `codex/faz-34` branch'i `codex/faz-33` uzerinden olusturuldu.
- ROADMAP.md, ROADMAP2.md, ROADMAP3.md ve ROADMAP4.md basliklari tarandi.
- Faz 34 gereksinimleri ROADMAP4.md icinden cikarildi.
- Implementasyon onayi alindi; Faz 34 gelistirmesi basladi.
- `CONFIG` analytics anahtarlari ve local `analyticsManager` API'si eklendi.
- `tests/storage.test.js` analytics davranislariyla genisletildi.
- Hedefli storage dogrulamasi:
  - `node --check js/storage.js`
  - `npm.cmd test -- tests/storage.test.js` -> 30 test gecti
- `app.js` icinde uygulama acilisi, senaryo yukleme, oynatma, ekran goruntusu,
  sahne kaydet/yukle/sil, demo yukleme ve onboarding adimlari event olarak
  baglandi.
- Ayarlar paneline son 7 gunluk yerel "Kullanim Ozeti" eklendi.
- Panel yenileme ve yalnizca analytics verisini temizleyen aksiyon eklendi.
- CSS metrik kartlari, onboarding ozeti ve karar destegi satiri icin eklendi.
- Final dogrulama:
  - `node --check js/storage.js`
  - `node --check js/app.js`
  - `npm.cmd test -- tests/storage.test.js` -> 30 test gecti
  - `npm.cmd test` -> 7 test dosyasi, 207 test gecti
  - `npm.cmd run build` -> Vite build basarili
  - Vite dev server -> `http://127.0.0.1:5174/` HTTP 200
  - `analyticsSummary` HTML marker'i canli sayfada gorundu
