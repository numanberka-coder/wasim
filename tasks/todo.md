# Faz 41 - Ana Kabuk & Navigasyon

> Tarih: 2026-05-06
> Branch: codex/faz-41
> Kaynak: ROADMAP5 Faz 41
> Durum: Devam ediyor

---

## Amac

Telefon onizlemesini dogrudan sohbet detayindan baslatmak yerine, WhatsApp
Android benzeri ana uygulama kabuguyla acmak. Mevcut sohbet motoru, composer,
medya aksiyonlari ve mobil simulator menusu korunarak sohbet detayi bu kabugun
icinden acilacak.

---

## Uygulama Plani

- [x] 1. Mevcut telefon preview mimarisini incele:
      - `.phone` DOM yapisi.
      - Chat detail header/composer alanlari.
      - Mevcut mobil menu `data-menu-root` baglantisi.
- [x] 2. Ana shell ve chat detail ayrimini kur:
      - `.phone` icinde home shell yuzeyi.
      - Mevcut chat detail yuzeyini ayri state ile gostermek/gizlemek.
      - Ilk acilista home shell'in aktif olmasi.
- [x] 3. Bottom nav iskeletini ekle:
      - Sohbetler, Guncellemeler, Topluluklar, Aramalar sekmeleri.
      - Aktif sekmenin DOM/ARIA tarafindan okunabilir olmasi.
- [x] 4. Uc nokta menu baglantisini koru:
      - Ana shell ust aksiyonu mevcut simulator mobil menu modelini acmali.
      - Chat detail icindeki mevcut menu davranisi bozulmamali.
- [x] 5. Composer sinirini dogrula:
      - Composer, emoji, atac, kamera ve mikrofon yalnizca chat detail'da gorunmeli.
      - Home shell icinde bu kontroller bulunmamali.
- [x] 6. Geri donus davranisini netlestir:
      - Chat detail'dan home shell'e donus butonu.
      - Mesaj motoru ve mevcut chat render akisi korunmali.
- [x] 7. Test ve dogrulama ekle:
      - `tests/phone-shell.test.js`.
      - Hedefli `node --check`.
      - Hedefli test, full test, build.
      - Mobil browser sanity notlari.

---

## Kabul Kriterleri

- Mobilde ilk ekran ana shell olarak acilir.
- Bottom nav dort sekmeyi gosterir ve aktif sekme makine tarafindan okunabilir durumdadir.
- Sohbet detayina gecince mevcut mesaj motoru ve composer calismaya devam eder.
- Ana shell icinde composer/atac/kamera gorunmez.
- Uc nokta butonu mevcut `data-menu-root` menusuyle ayni modeli kullanir.

---

## Review

- `index.html` icinde telefon onizlemesi ana shell ve chat detail yuzeylerine ayrildi.
- `js/phone/app-shell.js` eklendi:
  - Ilk acilista home shell aktif.
  - Dort sekmeli bottom nav state'i `aria-selected`, `hidden` ve `data-active-tab` ile okunabilir.
  - Sohbet satiri mevcut chat detail yuzeyini acar; geri butonu home shell'e doner.
- `css/phone-shell.css` eklendi:
  - Ana shell, bottom nav ve chat detail gorunurluk kurallari izole edildi.
  - Home shell icinde chat composer kontrolleri gorunmez; chat detail icinde mevcut composer korunur.
- `js/ui/mobile.js` guncellendi:
  - `data-mobile-menu-trigger` kullanan home shell ve chat detail uc nokta butonlari ayni `#headerDropdown` ve `data-menu-root` menusuyle calisir.
- `tests/phone-shell.test.js` eklendi:
  - Ilk shell state'i, bottom nav, composer siniri, chat detail gecisi ve ortak menu kokunu dogrular.
- Dogrulama:
  - `node --check js\phone\app-shell.js`: basarili.
  - `node --check js\ui\mobile.js`: basarili.
  - `node --check js\app.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: 4 test basarili.
  - `npm.cmd test -- tests\menu-order.test.js`: 19 test basarili.
  - `npm.cmd test`: 10 test dosyasi, 240 test basarili.
  - `npm.cmd run build`: Vite build basarili.
  - Browser sanity `http://127.0.0.1:5173`:
    - Home shell gorundu.
    - Home shell icinde composer bulunmadi.
    - Sohbet satiri chat detail'i acti.
    - Geri butonu home shell'e dondu.
    - Home shell uc nokta menusu `#headerDropdown` icinde 10 menu ogesiyle acildi.
