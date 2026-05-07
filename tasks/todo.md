# Faz 43 - Guncellemeler Sekmesi

> Tarih: 2026-05-07
> Branch: codex/faz-43
> Kaynak: ROADMAP5 Faz 43
> Durum: Uygulaniyor

---

## Amac

Telefon ana shell'inde Guncellemeler sekmesini WhatsApp Android dark duzenine
yaklastirmak. Faz 42'de tamamlanan Sohbetler sekmesi ve chat detail gecisi
korunacak; composer, atac, kamera ve mikrofon sadece sohbet detayinda kalacak.

---

## Kapsam

- [x] 1. Mevcut phone shell yapisini incele:
      - Bottom nav aktif sekme davranisi.
      - Ana sekmelerde uc nokta menu acma akisi.
      - Faz 42 sohbet listesi ve chat detail gecisi regressionsiz kalmali.
- [x] 2. Guncellemeler ust barini ekle:
      - Baslik: `Guncellemeler`.
      - Arama ikonu.
      - Uc nokta aksiyonu mevcut simulator menusunu acar.
- [x] 3. Durum bolumunu kur:
      - Durum ekle satiri.
      - "24 saat sonra kaybolur" yardimci metni.
      - Avatar/ekle gostergesi 360px genislikte tasmaz.
- [x] 4. Son guncellemeleri goster:
      - Iki gercekci durum satiri.
      - Statik veya mevcut veriden turetilmis guvenli fallback.
      - Zaman/isim/halka gorseli okunur kalir.
- [x] 5. Kanallar bolumunu ekle:
      - Aciklama metni.
      - `Kesfet` ve `Kanal olustur` outline butonlari.
      - Scroll alaninda bottom nav ile carpismaz.
- [x] 6. Cift FAB davranisini ekle:
      - Kalem FAB'i.
      - Kamera FAB'i.
      - Iki FAB bottom nav uzerinde kalir, dar viewportta tasmaz.
- [x] 7. Testleri guncelle:
      - `tests/phone-shell.test.js` Faz 43 hiyerarsisini dogrular.
      - Guncellemeler sekmesi aktif state'i dogrulanir.
      - Uc nokta menusu bu sekmeden de acilir.
      - Cift FAB ve kanal/durum bolumleri test edilir.
- [x] 8. Dogrulama calistir:
      - `node --check js\phone\app-shell.js`
      - `npm.cmd test -- tests\phone-shell.test.js`
      - `npm.cmd test`
      - `npm.cmd run build`
      - Mobil browser sanity: Guncellemeler scroll, menu, cift FAB, bottom nav overlap.

---

## Etkilenen Dosyalar

- `index.html`
- `js/phone/app-shell.js`
- `css/phone-shell.css`
- `tests/phone-shell.test.js`

---

## Review

- `index.html` Faz 43 Guncellemeler panelini icerir:
  - Durumum satiri, iki son guncelleme satiri, Kanallar bolumu.
  - `Kesfet` ve `Kanal olustur` outline aksiyonlari.
  - Kalem ve kamera cift FAB'i.
- `js/phone/app-shell.js` aktif sekmeye gore home header'ini senkronlar:
  - Sohbetler: `WhatsApp` + kamera + menu.
  - Guncellemeler: `Guncellemeler` + arama + menu.
- `css/phone-shell.css` Faz 43 dark mobil layoutunu kapsar:
  - Status avatar/ring, kanal bolumu, cift FAB ve light tema fallback stilleri.
  - Guncellemeler scroll padding'i bottom nav/FAB carpismasini azaltir.
- `tests/phone-shell.test.js` 8 teste genisletildi:
  - Faz 43 hiyerarsisi, aktif state, header senkronu, kanal bolumu ve cift FAB.
  - Guncellemeler sekmesinden ayni mobil menu root'una erisim.
- Dogrulama:
  - `node --check js\phone\app-shell.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: 8 test basarili.
  - `npm.cmd test`: 10 test dosyasi, 244 test basarili.
  - `npm.cmd run build`: Vite build basarili.
  - Browser sanity `http://127.0.0.1:5173`:
    - Guncellemeler sekmesi `data-active-tab=updates` oldu.
    - Header `Guncellemeler`, arama gorunur, kamera gizli.
    - 3 status satiri, kanal bolumu, kalem FAB ve kamera FAB bulundu.
    - Uc nokta menu `aria-expanded=true` ve `data-menu-root` ile acildi.
    - Console error/warning bulunmadi.
