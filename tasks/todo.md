# Faz 47 - Ikon Sistemi & Chat Header Polish

> Tarih: 2026-05-08
> Branch: codex/faz-47
> Kaynak: ROADMAP5 Faz 47
> Durum: Tamamlandi
> Not: Kullanici implementasyon icin onay gerekmedigini belirtti.

---

## Amac

Telefon ve mobil ana shell ikonlarini tek bir SVG sozlesmesine tasimak; sohbet
detay header'indaki ikon hizasini toparlamak; geri butonunun acik yesil/kare
artefact uretmeden transparent ve dokunulabilir kalmasini saglamak.

---

## Kapsam

- [x] 1. Faz 47 kapsam ve derslerini oku:
      - `ROADMAP5.md` Faz 47 kabul kriterleri.
      - `tasks/lessons.md` mobil pointer/stacking dersi.
      - Mevcut Faz 46 diff ve test yuzeyi.
- [x] 2. Faz 47 branch'ini hazirla:
      - `codex/faz-47` branch'i mevcut Faz 46 calisma durumunu koruyarak acildi.
      - `AGENTS.md` untracked ve kapsam disi kalacak.
- [x] 3. Ortak ikon sozlesmesini kur:
      - Telefon header, home header, bottom nav, FAB, composer ve call ikonlari ayni SVG render sozlesmesini kullansin.
      - Ikonlar `currentColor`, sabit viewBox ve ortak class ile tema kontrastini korusun.
- [x] 4. Chat header polish uygula:
      - Geri butonu transparent, 40x40 dokunma alani olan ve kare/yesil artefact uretmeyen hale gelsin.
      - Header ikonlari boyut, stroke/fill ve hizalama acisindan ana shell ile eslensin.
- [x] 5. FAB ve composer ikonlarini esle:
      - Mesaj, arama, kalem, kamera, atac, mikrofon ve menu ikonlari ayni ailede gorunsun.
      - Dar viewportlarda ikonlar tasma veya layout shift yaratmasin.
- [x] 6. Regression testlerini guclendir:
      - Ortak ikon kontrati DOM uzerinden test edilsin.
      - Chat geri butonu transparent ve dokunulabilir CSS sozlesmesi test edilsin.
      - Light/dark kontrast class sozlesmeleri korunur.
- [x] 7. Dogrulama calistir:
      - `node --check js\phone\app-shell.js`
      - `npm.cmd test -- tests\phone-shell.test.js`
      - `npm.cmd test`
      - `npm.cmd run build`
      - Mobil/HTTP sanity: 360x800 ve 390x844 chat header + ana sekme ikonlari.

---

## Etkilenen Dosyalar

- `index.html`
- `js/phone/app-shell.js`
- `js/ui/mobile.js`
- `css/phone.css`
- `css/phone-shell.css`
- `tests/phone-shell.test.js`
- `tasks/todo.md`

---

## Review

- `js/phone/app-shell.js` icinde `PHONE_ICON_SVG` ortak telefon ikon sozlesmesi kuruldu:
  - Home header, bottom nav, FAB, call row, chat header ve composer ikonlari `data-phone-icon` uzerinden tek render yoluna baglandi.
  - Ikonlar `wa-phone-icon` class'i, `currentColor`, sabit viewBox ve ortak stroke kuraliyla render ediliyor.
- `index.html` telefon icindeki inline ikonlari ortak ikon host'larina tasidi:
  - Search, kamera, menu, chat FAB, updates FAB'lari, call ikonlari, bottom nav, chat back ve composer ikonlari ayni aileye gecti.
  - Chat detail uc nokta trigger'i gercek `button` olarak kaldi; mevcut menu kontrati icin `role="button"` korundu.
- `css/phone.css` chat header polish'i kapatti:
  - Geri butonu 40x40 dokunma alani, `background: transparent`, `border: none`, `padding: 0` ve tap highlight reset'i aldi.
  - Header ikonlari 36x36 hit area ve 24px ikon olcusuyle ana shell hizasina yaklasti.
- `css/phone-shell.css` ortak ikon CSS sozlesmesini topladi:
  - `.wa-phone-icon svg` stroke/currentColor sistemine baglandi.
  - Bottom nav, FAB, composer ve call ikon olculeri host class uzerinden sabitlendi.
- `js/ui/mobile.js` keyboard focus davranisini guclendirdi:
  - Menu hangi trigger ile acildiyse Escape/close sonrasi focus ayni trigger'a donuyor.
  - jsdom gibi `offsetParent` olmayan ortamlarda ilk trigger fallback'i korunuyor.
- `tests/phone-shell.test.js` 16 teste genisletildi:
  - Tum `data-phone-icon` host'lari registry'de karsilik buluyor ve render sonrasi tek SVG uretiyor.
  - Chat back butonu button/transparent/touchable CSS ve davranis sozlesmesiyle test ediliyor.
  - Faz 47 icon sizing/contrast CSS kontrati regression'a baglandi.
- Dogrulama:
  - `node --check js\phone\app-shell.js`: basarili.
  - `node --check js\ui\mobile.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: 16 test basarili.
  - `npm.cmd test -- tests\menu-order.test.js`: 19 test basarili.
  - `npm.cmd test`: 10 test dosyasi, 252 test basarili.
  - `npm.cmd run build`: Vite build basarili.
  - HTTP sanity: `http://127.0.0.1:5173` 200 dondu.
  - Edge headless DOM/screenshot denemesi bu ortamda cikti uretmedi; gecici Edge profilleri temizlendi.
- `AGENTS.md` untracked kaldigi icin kapsam disinda tutuldu.

---

## Duzeltme - Referans Ikon Polish

- [x] Kullanici geri bildirimi alindi:
      - Sohbet sekmesindeki yeni sohbet ikonu referansa gore kotu gorunuyor.
      - Aramalar kismindaki arama ikonu referansa gore kotu gorunuyor.
- [x] Yeni sohbet FAB ikonunu referans ekrandaki sade WhatsApp chat/new-message silhouette'ine yaklastir.
- [x] Aramalar quick action, call row ve call FAB ikonlarini referans ekrandaki handset/plus diline yaklastir.
- [x] Kritik ikonlar icin hedefli testleri calistir.
- [x] Kullanici geri bildirimi sonrasi FAB balon kalinligi/renkleri ve chat header kamera-telefon ikon dengesi duzeltildi:
      - Yeni sohbet ve yeni arama FAB'leri 52px, daha yumusak #21c063 zemin ve daha hafif golgeye cekildi.
      - Sohbet header video/kamera ikonu 27px, telefon ikonu 21px olarak optik dengelendi.

Sonuc:
- Ilk el cizimi ikonlar yeterli bulunmadigi icin Google/Iconify kaynakli ikonlar denendi.
- `chatPlus` icin `ic:outline-add-comment` path'i kullanildi.
- `phonePlus` icin `ic:outline-add-ic-call`, `phone` icin `ic:outline-call`, `video` icin `ic:outline-videocam` path'i kullanildi.
- Sohbet FAB ikonu beyaz, Aramalar quick action ikonlari koyu zeminde beyaz/okunur hale getirildi.
- Google/Iconify denemesi de referans goruntuye gore zayif kaldigi icin kritik aksiyonlar oldschool custom stroke silhouette'e geri alindi:
  - `chatPlus`: referans FAB'a yakin chat balonu + arti.
  - `phone` / `phonePlus`: sade handset + arti, ilgili FAB/shortcut stroke agirliklari ayrica ayarlandi.
- Kullanici tarafindan saglanan Noun Project SVG dosyalarindaki ikon path'leri temizlenerek kritik ikonlara tasindi:
  - `noun-add-new-chat-8271384.svg` -> `chatPlus`.
  - `noun-new-call-8271369.svg` -> `phonePlus`.
  - `noun-phone-6359131.svg` -> `phone`.
  - `noun-add-video-8271363.svg` -> `video`.
  - Gorunur attribution text'leri UI icine alinmadi; yalnizca ikon path'leri render ediliyor.
- Yeni sohbet/yeni arama FAB zeminleri referans ekrana daha yakin, daha az kalin ve daha az jenerik duracak sekilde inceltildi.
- Sohbet icindeki video/kamera ve telefon ikonlari ayni SVG ailesinde kalirken optik olarak yeniden olceklendi.
- Dogrulama:
  - `node --check js\phone\app-shell.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: 16 test basarili.
  - `npm.cmd test -- tests\menu-order.test.js`: 19 test basarili.
  - `npm.cmd test`: 10 test dosyasi, 252 test basarili.
  - `npm.cmd run build`: basarili.
  - `git diff --check`: whitespace hatasi yok.
  - HTTP sanity `http://127.0.0.1:5173`: 200.
  - Edge headless screenshot bu ortamda dosya uretmedi; DOM/test/build ve HTTP sanity temiz.
