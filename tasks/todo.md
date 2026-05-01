# Faz 33 - Sahne Yonetimi UX Iyilestirmeleri

> Tarih: 2026-04-30
> Branch: codex/faz-33
> Kaynak: ROADMAP.md / Faz 14, ROADMAP4.md / Faz 33
> Durum: Tamamlandi

---

## Roadmap Ozeti

Faz 33, mevcut sahne kaydet/yukle/sil temelini daha hizli kullanilir hale
getirir. Hedef yeni bir veri modeli icat etmek degil; kayitli sahnelere daha
hizli donmek, son calisilan sahneyi istege bagli geri yuklemek, sahneleri
kategoriyle ayirmak ve liste buyudugunde arama ile filtrelemektir.

Kapsam:
- 33.1 Son 5 sahne kisa erisim
- 33.2 Son sahneyi geri yukle onerisi
- 33.3 Sahne etiketi/kategori
- 33.4 Sahne arama

Etkilenen dosyalar:
- `js/storage.js`
- `js/app.js`
- `index.html`
- `css/components.css`
- `tests/storage.test.js`

---

## Mevcut Durum

- `sceneManager.save(name)` sahneyi `CONFIG.SCENES_KEY` altinda localStorage'a
  en basa ekliyor.
- `sceneManager.load(id)` state'i yukluyor ancak son yuklenen sahneyi veya
  erisim zamanini kaydetmiyor.
- `renderSceneList()` tum sahneleri tek liste halinde gosteriyor.
- Sahne panelinde yalnizca isim girisi, Kaydet, Yukle ve Sil aksiyonlari var.
- ROADMAP.md Faz 14 sahne yonetimi temelini tamamlanmis kabul ediyor; Faz 33 bu
  temelin UX hizlandirmasi olacak.

---

## Mimari Karar

- Sahne kayit formatini geriye uyumlu genislet:
  - `category`: kullanici secimi veya bos kategori.
  - `lastAccessedAt`: kaydetme/yukleme sirasinda guncellenen hizli erisim sirasi.
- `sceneManager` icine kucuk yardimci API'ler ekle:
  - `getRecent(limit = 5)`
  - `getLastLoaded()`
  - `setLastLoaded(id)`
  - `updateMetadata(id, patch)`
- Mevcut `load(id)` davranisini koru; basarili yuklemede son sahne bilgisini ve
  erisim zamanini kaydet.
- UI state'i global state'e karistirma; arama metni sadece DOM uzerinden
  filtrelensin.
- Kategori icin sabit, sade secenekler kullan:
  - Genel
  - Reklam
  - Eğitim
  - Müşteri Destek
  - Topluluk
- Son sahne onerisi, mevcut state'i otomatik ezmesin. Kullanici acikca "Geri
  Yukle" derse sahne yuklensin.

---

## Gorevler

- [x] 1. `storage.js` icinde sahne metadata yardimcilarini ekle ve eski sahne
      kayitlariyla geriye uyumlulugu koru.
- [x] 2. `sceneManager.save(name, options)` ile kategori kaydini destekle.
- [x] 3. Basarili sahne yuklemede son yuklenen sahneyi ve `lastAccessedAt`
      bilgisini guncelle.
- [x] 4. Sahne paneline kategori secimi, arama kutusu, son 5 sahne kisa erisim
      alani ve son sahne geri yukleme onerisi ekle.
- [x] 5. `app.js` icinde scene render akisini ayir:
      - tam liste render
      - son sahneler render
      - son sahne onerisi render
      - ortak yukleme yardimcisi
- [x] 6. Sahne aramasini isim ve kategori uzerinden filtrele.
- [x] 7. Sahne kartlarinda kategori rozetini ve son erisim/kayit tarihini
      okunakli goster.
- [x] 8. CSS ile yeni sahne kontrollerini kompakt, mobil uyumlu ve mevcut panel
      diline uygun hale getir.
- [x] 9. `tests/storage.test.js` icinde metadata, son sahne ve son 5 sahne
      davranislarini kapsa.
- [x] 10. Dogrulama:
      - `node --check js/storage.js`
      - `node --check js/app.js`
      - `npm.cmd test`
      - `npm.cmd run build`

---

## Kabul Kriterleri

- Kullanici son 5 sahneyi tek tikla gorebilir ve yukleyebilir.
- Uygulama acilisinda son yuklenen sahne varsa otomatik yukleme yapmadan geri
  yukleme onerisi gosterir.
- Yeni kaydedilen sahne kategori bilgisiyle saklanir ve listede rozet olarak
  gorunur.
- Eski kategori bilgisi olmayan sahneler bozulmadan "Genel" gibi guvenli bir
  varsayilanla gorunur.
- Sahne arama isim ve kategori metninde calisir.
- Sahne silme/yukleme akisi mevcut confirm ve toast davranisini korur.
- Test ve build gecmeden Faz 33 tamam sayilmaz.

---

## Elegance Check

- En sade cozum, sahne ozelliklerini mevcut `sceneManager` icinde tutmak ve yeni
  UI kontrol durumlarini global state'e tasimamaktir.
- Ayrica bir sahne servisi veya framework eklemek gereksiz olur; veri localStorage
  tabanli ve kapsam kucuk.
- Geriye uyumluluk icin eski sahneleri migrate etmek yerine okuma sirasinda
  normalize etmek daha dusuk riskli.

---

## Review

- Uygulama onayi alindi; Faz 33 implementasyonu basladi.
- Storage metadata API'leri eklendi: kategori, son erisim, son yuklenen sahne ve
  son 5 sahne siralamasi.
- `tests/storage.test.js` Faz 33 davranislariyla genisletildi.
- Sahne paneline kategori secimi, son sahne onerisi, son 5 hizli erisim ve
  isim/kategori aramasi eklendi.
- Sahne listesi kartlari kategori rozetiyle genisletildi; yukleme/silme
  sonrasinda tum sahne UX alanlari tazeleniyor.
- CSS yeni kontroller icin kompakt ve mobil uyumlu hale getirildi.
- Hedefli dogrulama:
  - `node --check js/storage.js`
  - `node --check js/app.js`
  - `npm.cmd test -- tests/storage.test.js` -> 24 test gecti
- Final dogrulama:
  - `npm.cmd test` -> 7 test dosyasi, 201 test gecti
  - `npm.cmd run build` -> Vite build basarili
  - Vite dev server -> `http://127.0.0.1:5174/` HTTP 200
