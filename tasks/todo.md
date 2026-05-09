# Faz 50 - Guncellemeler Duzenleme Akisi

> Tarih: 2026-05-09
> Branch: codex/faz-50
> Kaynak: ROADMAP5 Faz 50
> Durum: Tamamlandi
> Not: `AGENTS.md` untracked ve kapsam disi kalacak.

---

## Amac

Guncellemeler sekmesindeki kalem FAB'ini ortak bottom sheet editorune
baglayarak durum, son guncellemeler ve kanal metinlerini kalici
`phoneShellContent.updates` verisinden duzenlenebilir hale getirmek.

---

## Kapsam

- [x] 1. Faz 50 kapsam ve derslerini oku:
      - `ROADMAP5.md` Faz 50 kabul kriterleri.
      - `tasks/lessons.md` mobil pointer/ikon polish dersleri.
      - Faz 48/49 bottom sheet ve kalici state altyapisi.
- [x] 2. Faz 50 branch'ini hazirla:
      - `codex/faz-50` branch'i acildi.
      - `AGENTS.md` kapsam disinda tutuluyor.
- [x] 3. Guncellemeler state modelini genislet:
      - `phoneShellContent.updates.recent` icin en az iki satirlik default
        veri ve normalize fallback ekle.
      - Kanal basligi/aciklama/CTA metinleri export/import/reset akislariyla
        korunur.
- [x] 4. Guncellemeler tab renderini kalici veriye bagla:
      - Durumum, son guncellemeler ve kanal metinleri state'ten render edilir.
      - Gecersiz veya bos veri guvenli default'a duser.
- [x] 5. Kalem FAB editor akisini tamamla:
      - `phoneUpdatesEditFab` tek bottom sheet icinde durum, iki son guncelleme
        ve kanal metinlerini duzenletir.
      - Kaydetme sonrasi sekme hemen guncellenir ve sheet kapanir.
- [x] 6. Regression testlerini guncelle:
      - `tests/phone-shell.test.js` editor alanlari, kaydetme, render ve
        export/import kaliciligini kapsar.
- [x] 7. Dogrulama calistir:
      - [x] `node --check js\state.js`
      - [x] `node --check js\phone\app-shell.js`
      - [x] `node --check js\phone\home-editors.js`
      - [x] `npm.cmd test -- tests\phone-shell.test.js`
      - [x] `npm.cmd test`
      - [x] `npm.cmd run build`
      - [x] HTTP sanity

---

## Etkilenen Dosyalar

- `index.html`
- `js/state.js`
- `js/phone/app-shell.js`
- `js/phone/home-editors.js`
- `css/phone-shell.css`
- `tests/phone-shell.test.js`
- `tasks/todo.md`

---

## Review

- `js/state.js` icinde Guncellemeler verisi kalici modele eklendi:
  - `phoneShellContent.updates.recent` iki satirlik default veriyle normalize
    ediliyor.
  - Array default merge davranisi export/import/reset akislari icin guvenli
    hale getirildi.
- `js/phone/app-shell.js` Guncellemeler sekmesini state'ten render ediyor:
  - Durumum baslik/aciklama/not alanlari kalici veriden okunuyor.
  - Son guncellemeler listesi dinamik olarak iki satir uretiyor.
  - Kanal basligi, aciklamasi ve CTA metinleri state'e baglandi.
- `js/phone/home-editors.js` mevcut bottom sheet sozlesmesini genisletti:
  - `phoneUpdatesEditFab`, tek `updatesStatus` editoruyle durum, iki son
    guncelleme ve kanal alanlarini duzenletiyor.
  - Kaydetme sonrasi `phoneShellContent.updates` tek state set'iyle guncellenip
    sekmeye hemen yansiyor.
- `index.html` ve `css/phone-shell.css` dinamik liste ve uzun editor formunu
  destekliyor:
  - Statik son guncelleme satirlari `phoneRecentUpdatesList` kokune tasindi.
  - Editor alanlari uzun formda scroll edebilmek icin `min-height: 0` aldi.
- Regression testleri:
  - `tests/phone-shell.test.js`: 20 test basarili.
  - Tam suite: 10 test dosyasi, 261 test basarili.
- Dogrulama:
  - `node --check js\state.js`: basarili.
  - `node --check js\phone\app-shell.js`: basarili.
  - `node --check js\phone\home-editors.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: basarili.
  - `npm.cmd test`: basarili.
  - `npm.cmd run build`: basarili.
  - `git diff --check`: whitespace hatasi yok; yalnizca CRLF uyarilari var.
  - HTTP sanity: `http://127.0.0.1:5173` 200 dondu ve HTML'de
    `phoneUpdatesEditFab`, `phoneRecentUpdatesList` ve `phoneEditorLayer`
    goruldu.
  - Headless Edge screenshot denemesi bu ortamda dosya uretmedi; DOM regression
    testleri, build ve HTTP sanity ile dogrulama tamamlandi.
