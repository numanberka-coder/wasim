# Faz 51 - Topluluk Duzenleme Akisi

> Tarih: 2026-05-09
> Branch: codex/faz-51
> Kaynak: ROADMAP5 Faz 51
> Durum: Tamamlandi
> Not: Kullanici onay beklemeden implementasyona gecilmesini istedi.
> Not: `AGENTS.md` untracked ve kapsam disi kalacak.

---

## Amac

Topluluklar sekmesindeki `Toplulugunuzu olusturun` CTA'sini ortak bottom
sheet editorune baglayarak bos durum basligi, aciklamasi, ornek link metni ve
CTA metnini kalici `phoneShellContent.communities` verisinden duzenlenebilir
hale getirmek.

---

## Kapsam

- [x] 1. Faz 51 kapsam ve derslerini oku:
      - `ROADMAP5.md` Faz 51 kabul kriterleri.
      - `tasks/lessons.md` mobil pointer ve layout dersleri.
      - Faz 50 shared editor pattern'i.
- [x] 2. Faz 51 branch'ini hazirla:
      - `codex/faz-51` branch'i acildi.
      - `AGENTS.md` kapsam disinda tutuluyor.
- [x] 3. Topluluk state modelini netlestir:
      - `phoneShellContent.communities.linkLabel` export/import/reset akislariyla korunur.
      - Bos veya gecersiz metinler guvenli default'a duser.
- [x] 4. Topluluk bos durum renderini kalici veriye bagla:
      - Baslik, aciklama, ornek link ve CTA metni state'ten render edilir.
      - Illustasyon statik kalir; metinler state'ten akar.
- [x] 5. CTA editor akisini tamamla:
      - `phoneCommunitiesCreateBtn` ortak bottom sheet'i acar.
      - Editor sohbet benzeri yuzey icin baslik, aciklama, ornek link ve CTA
        alanlarini duzenletir.
      - Kaydetme sonrasi sekme hemen guncellenir ve sheet kapanir.
      - Gercek mesajlasma, katilimci yonetimi veya bildirim mantigi eklenmez.
- [x] 6. Layout guvencesini ekle:
      - CTA ve editor sheet bottom nav ile 360x800 ve 390x844 hedeflerinde
        carpismaz.
- [x] 7. Regression testlerini guncelle:
      - `tests/phone-shell.test.js` CTA, editor alanlari, kaydetme, render ve
        import/export kaliciligini kapsar.
- [x] 8. Dogrulama calistir:
      - [x] `node --check js\state.js`
      - [x] `node --check js\phone\app-shell.js`
      - [x] `node --check js\phone\home-editors.js`
      - [x] `npm.cmd test -- tests\phone-shell.test.js`
      - [x] `npm.cmd test`
      - [x] `npm.cmd run build`
      - [x] HTTP veya browser sanity

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

- `js/phone/home-editors.js` icinde `communitiesIntro` editoru tamamlandi:
  - Baslik, aciklama, ornek link ve CTA metni ayni shared bottom sheet icinde
    duzenleniyor.
  - Aciklama alani multiline oldu.
  - Editor alanlari `communities-chat` yuzeyiyle sohbet hissine yaklasti.
- `css/phone-shell.css` Faz 51 editor yuzeyini sinirli ve scoped sekilde
  stilliyor:
  - Sadece `communities-chat` data surface'i hedefleniyor.
  - Form alanlari sohbet balonu benzeri hizalanir.
  - Var olan bottom nav boslugu ve editor scroll sozlesmesi korunur.
- `tests/phone-shell.test.js` Faz 51 regresyonunu ekledi:
  - CTA sheet aciyor.
  - Baslik, aciklama, ornek link ve CTA kaydedilip aninda render ediliyor.
  - Export/import sonrasi topluluk metinleri kalici kaliyor.
  - CSS layout sozlesmesi testte goruluyor.
- Kapsam disi tutulanlar:
  - Gercek mesajlasma, katilimci yonetimi ve bildirim mantigi eklenmedi.
  - `AGENTS.md` untracked kaldi ve degistirilmedi.
  - `index.html`, `js/state.js`, `js/phone/app-shell.js` mevcut Faz 51
    altyapisini zaten tasidigi icin degistirilmedi.
- Dogrulama:
  - `node --check js\state.js`: basarili.
  - `node --check js\phone\app-shell.js`: basarili.
  - `node --check js\phone\home-editors.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: 21 test basarili.
  - `npm.cmd test`: 10 test dosyasi, 262 test basarili.
  - `npm.cmd run build`: basarili.
  - `git diff --check`: whitespace hatasi yok; yalnizca CRLF uyarilari var.
  - HTTP sanity: `http://127.0.0.1:5173` 200 dondu.
  - Headless Edge screenshot denemesi bu ortamda dosya uretmedi; layout
    guvencesi targeted regression, CSS sozlesmesi, build ve HTTP sanity ile
    kapatildi.
