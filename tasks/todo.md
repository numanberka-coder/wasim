# Faz 48 - Kalici Telefon Verisi & Bottom Sheet Editor Altyapisi

> Tarih: 2026-05-09
> Branch: codex/faz-48
> Kaynak: ROADMAP5 Faz 48
> Durum: Tamamlandi
> Not: `AGENTS.md` untracked ve kapsam disi kalacak. Mevcut `css/phone-shell.css`
> degisikligi korunacak; ayni dosyada gerekli olursa uzerine dikkatle calisilacak.

---

## Amac

Ana sekme duzenlemeleri icin telefon icinde ortak bottom sheet editor altyapisi
kurmak; yeni telefon verilerini state/export/import/reset akisinda kalici hale
getirmek; eski kayitlari `group` ve `messages` verisinden guvenli varsayilan
telefon verisine tamamlamak.

---

## Kapsam

- [x] 1. Faz 48 kapsam ve derslerini oku:
      - `ROADMAP5.md` Faz 48 kabul kriterleri.
      - `tasks/lessons.md` mobil pointer/stacking ve ikon polish dersleri.
      - Mevcut Faz 41-47 phone shell ve test yuzeyi.
- [x] 2. Faz 48 branch'ini hazirla:
      - `codex/faz-48` branch'i acildi.
      - Var olan `css/phone-shell.css` degisikligi ve untracked `AGENTS.md`
        kullanici calismasi olarak korunacak.
- [x] 3. Kalici state modelini ekle:
      - `conversations` ve `phoneShellContent` varsayilanlarini state'e ekle.
      - `state.export()`, `state.import()` ve `state.reset()` yeni alanlari
        korusun.
      - Eski export/localStorage verisi, `group` + `messages` uzerinden tek
        default sohbet ve default sekme icerigine tamamlanabilsin.
- [x] 4. Bottom sheet editor altyapisini kur:
      - Yeni `js/phone/home-editors.js` ortak editor sheet sozlesmesini yonetsin.
      - Ac/kapat/kaydet/iptal/backdrop ve hata durumlari test edilebilir olsun.
      - Sheet klavye ile ulasilabilir ve mevcut mobile menuyle pointer
        cakismasi yaratmasin.
- [x] 5. Phone shell entegrasyonunu yap:
      - `js/phone/app-shell.js` editor altyapisini baslatip state degisikliklerine
        duyarlilik kazansin.
      - `index.html` yalnizca gerekli sheet kokunu ve baglanti noktalarini alsin.
      - `css/phone-shell.css` bottom sheet/backdrop/form durumlarini kapsasin.
- [x] 6. Regression testlerini guclendir:
      - `tests/state.test.js` export/import/reset/fallback davranisini kapsasin.
      - `tests/phone-shell.test.js` sheet ac/kapat/kaydet/iptal ve pointer
        kontratini kapsasin.
- [ ] 7. Dogrulama calistir:
      - [x] `node --check js\state.js`
      - [x] `node --check js\phone\app-shell.js`
      - [x] `node --check js\phone\home-editors.js`
      - [x] `npm.cmd test -- tests\state.test.js`
      - [x] `npm.cmd test -- tests\phone-shell.test.js`
      - [x] `npm.cmd test`
      - [x] `npm.cmd run build`
      - [x] HTTP sanity `http://127.0.0.1:5173`

---

## Etkilenen Dosyalar

- `index.html`
- `js/state.js`
- `js/phone/app-shell.js`
- `js/phone/home-editors.js`
- `css/phone-shell.css`
- `tests/state.test.js`
- `tests/phone-shell.test.js`
- `tasks/todo.md`

---

## Review

- `js/state.js` icinde Faz 48 kalici telefon verisi modeli kuruldu:
  - `conversations` ve `phoneShellContent` state'e eklendi.
  - `state.export()`, `state.import()` ve `state.reset()` yeni alanlari koruyor.
  - Eski export/localStorage verisi `group` + `messages` uzerinden tek
    `default` sohbet ve default ana sekme icerigine tamamlanıyor.
  - Mevcut tek sohbet motoru bozulmasin diye `default` sohbet export aninda
    legacy `group/messages` verisini aynaliyor.
- Yeni `js/phone/home-editors.js` ortak bottom sheet altyapisini ekledi:
  - Sheet ac/kapat, backdrop, Escape, iptal, kaydet ve validation davranislari
    tek modulde toplandi.
  - Updates, Communities ve Calls icin kucuk editor konfigurasyonlari eklendi;
    sonraki fazlar bu sozlesmenin uzerine detayli akis kurabilecek.
- `index.html` ve `js/phone/app-shell.js` phone shell baglantisini tamamladı:
  - Ana sekme metinlerine state ile senkron id'ler eklendi.
  - Telefon icinde `phoneEditorLayer` dialog kok'u eklendi.
  - `phoneShellContent` degisiklikleri DOM'a aninda yansiyor.
- `css/phone-shell.css` bottom sheet yuzeyini kapsiyor:
  - Sheet, backdrop, form alanlari, hata mesaji, light tema ve pointer kontrati
    eklendi.
  - Var olan FAB boyut degisikligi korunarak uzerine calisildi.
- Regression testleri:
  - `tests/state.test.js` legacy fallback, export/import kaliciligi ve reset
    davranisini kapsayacak sekilde 34 teste cikarildi.
  - `tests/phone-shell.test.js` sheet ac/kapat/kaydet/validation/Escape ve
    pointer CSS kontratini kapsayacak sekilde 18 teste cikarildi.
- Dogrulama:
  - `node --check js\state.js`: basarili.
  - `node --check js\phone\app-shell.js`: basarili.
  - `node --check js\phone\home-editors.js`: basarili.
  - `npm.cmd test -- tests\state.test.js`: 34 test basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: 18 test basarili.
  - `npm.cmd test`: 10 test dosyasi, 256 test basarili.
  - `npm.cmd run build`: Vite build basarili.
  - `git diff --check`: whitespace hatasi yok; yalnizca CRLF uyarilari var.
  - HTTP sanity: Vite dev server baslatildi, `http://127.0.0.1:5173` 200 dondu
    ve `phoneEditorLayer` HTML'de goruldu.
- `AGENTS.md` untracked ve kapsam disi kaldı.
