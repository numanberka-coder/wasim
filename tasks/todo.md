# Faz 52 - Aramalar Duzenleme Akisi

> Tarih: 2026-05-09
> Branch: codex/faz-52
> Kaynak: ROADMAP5 Faz 52
> Durum: Tamamlandi
> Not: Kullanici onay beklemeden implementasyona gecilmesini istedi.
> Not: `AGENTS.md` untracked ve kapsam disi kalacak.

---

## Amac

Aramalar sekmesindeki ust `Ara` butonunu ortak bottom sheet editorune
baglayarak son aramalar listesini kalici `phoneShellContent.calls` verisinden
duzenlenebilir, render edilebilir ve export/import akislariyla korunur hale
getirmek.

---

## Kapsam

- [x] 1. Faz 52 kapsam ve derslerini oku:
      - `ROADMAP5.md` Faz 52 kabul kriterleri.
      - `tasks/lessons.md` mobil pointer ve ikon dersleri.
      - Faz 50-51 shared editor pattern'i.
- [x] 2. Faz 52 branch'ini hazirla:
      - `codex/faz-52` branch'i acildi.
      - `AGENTS.md` kapsam disinda tutuluyor.
- [x] 3. Aramalar state modelini netlestir:
      - `phoneShellContent.calls.items` default son arama satirlarini tasir.
      - Bos veya gecersiz degerler guvenli default'a duser.
- [x] 4. Aramalar listesi renderini kalici veriye bagla:
      - Statik HTML arama satirlari render hedefiyle degistirilir.
      - Yon, cagri tipi, avatar bas harfleri ve metinler state'ten akar.
- [x] 5. Editor akisini tamamla:
      - Aramalar sekmesindeki ust `Ara` butonu editor sheet'i acar.
      - FAB de ayni liste editorunu acar.
      - Isim, tarih/metin, yon, cagri tipi ve avatar bas harfleri duzenlenir.
      - Kaydetme sonrasi sekme hemen guncellenir ve sheet kapanir.
- [x] 6. Ikon ve layout guvencesini koru:
      - Telefon/video ve yon ikonlari Faz 47 ortak ikon sistemiyle render edilir.
      - FAB, satir aksiyon ikonlari ve bottom nav dar viewportlarda carpismaz.
- [x] 7. Regression testlerini guncelle:
      - `tests/phone-shell.test.js` search trigger, editor alanlari, kaydetme,
        render ve import/export kaliciligini kapsar.
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

- `js/state.js` icinde `phoneShellContent.calls.items` kalici default liste
  modeline tasindi:
  - Isim, tarih/metin, yon, cagri tipi ve avatar bas harfleri state'te tutulur.
  - Export/import/reset akislari mevcut normalize sozlesmesiyle korunur.
- `index.html` statik arama satirlarini `phoneRecentCallsList` render hedefiyle
  degistirdi; hizli aksiyonlar, FAB ve bottom nav mevcut yapida kaldi.
- `js/phone/app-shell.js` son aramalar listesini state'ten render ediyor:
  - Yon ikonlari `callIn`/`callOut`, aksiyon ikonlari `phone`/`video` ortak Faz
    47 ikon sistemiyle basiliyor.
  - Cevapsiz satir kirmizi yon ikonunu, gelen/giden satirlar yesil yon ikonunu
    koruyor.
- `js/phone/home-editors.js` icinde `callsList` editoru tamamlandi:
  - Ust `Ara` butonu yalnizca Aramalar sekmesindeyken sheet acar.
  - `phoneCallFab` ayni editoru acar.
  - Yon ve cagri tipi select alanlariyla duzenlenir.
- `css/phone-shell.css` sadece calls editor yuzeyine scoped select ve bolum
  ayirici stilleri ekledi; bottom nav boslugu korunur.
- `tests/phone-shell.test.js` Faz 52 regresyonunu ekledi:
  - Updates sekmesinde search editor acmaz.
  - Calls sekmesinde search sheet acar.
  - 12 input ve 8 select alanli editor kaydedip listeyi aninda gunceller.
  - Export/import sonrasi arama listesi kalici kalir.
- Kapsam disi tutulanlar:
  - Arama baslatma, gercek rehber entegrasyonu, satir ekleme/silme ve bildirim
    mantigi eklenmedi.
  - `AGENTS.md` untracked kaldi ve degistirilmedi.
- Dogrulama:
  - `node --check js\state.js`: basarili.
  - `node --check js\phone\app-shell.js`: basarili.
  - `node --check js\phone\home-editors.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: 22 test basarili.
  - `npm.cmd test`: 10 test dosyasi, 263 test basarili.
  - `npm.cmd run build`: basarili.
  - HTTP sanity: `http://127.0.0.1:5173` 200 dondu.
  - In-app browser sanity: 390x844 viewport'ta Aramalar sekmesi, 4 render
    satiri, `calls-list` editor sheet'i, 12 input ve 8 select dogrulandi.
