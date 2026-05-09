# Faz 49 - Coklu Sohbetler & Yeni Sohbet Olusturma

> Tarih: 2026-05-09
> Branch: codex/faz-49
> Kaynak: ROADMAP5 Faz 49
> Durum: Tamamlandi
> Not: `AGENTS.md` untracked ve kapsam disi kaldi.

---

## Amac

Sohbetler sekmesini kalici `conversations.items` listesinden uretmek; yeni
sohbet olusturma sheet'i eklemek; secilen sohbeti mevcut chat detail, player,
composer, screenshot ve export/import akislarina aktif sohbet olarak baglamak.

---

## Kapsam

- [x] 1. Faz 49 kapsam ve derslerini oku:
      - `ROADMAP5.md` Faz 49 kabul kriterleri.
      - `tasks/lessons.md` mobil pointer/ikon polish dersleri.
      - Faz 48 kalici state ve bottom sheet altyapisi.
- [x] 2. Faz 49 branch'ini hazirla:
      - `codex/faz-49` branch'i `codex/faz-48` temelinden acildi.
      - `AGENTS.md` kapsam disinda tutuldu.
- [x] 3. Coklu sohbet state modelini tamamla:
      - `conversations.items` guvenli normalize ediliyor.
      - Aktif sohbet `group`, `messages` ve `messageSeq` ile senkron kaliyor.
      - Export/import/reset ve legacy fallback coklu sohbet verisini koruyor.
- [x] 4. Yeni sohbet sheet'i ekle:
      - Mesaj FAB'i sohbet adi, alt bilgi, avatar URL ve ilk mesaj alanlariyla
        bottom sheet aciyor.
      - Kayit sonrasi yeni sohbet aktif oluyor ve chat detail aciliyor.
      - Gecersiz/bos veri uygulamayi kirmadan guvenli hata/fallback aliyor.
- [x] 5. Sohbetler sekmesi secme akislarini bagla:
      - Liste `conversations.items` uzerinden render ediliyor.
      - Satira tiklama once mevcut aktif sohbeti kaydediyor, sonra hedef sohbeti
        chat detail olarak aciyor.
      - Bos liste guvenli default sohbet uretiyor.
- [x] 6. Regression testlerini guncelle:
      - `tests/state.test.js` aktif sohbet senkronu ve coklu sohbet
        kaliciligini kapsiyor.
      - `tests/phone-shell.test.js` yeni sohbet sheet'i, liste ve secme
        akislarini kapsiyor.
- [x] 7. Dogrulama calistir:
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

- `js/state.js` icinde coklu sohbet API'si tamamlandi:
  - `ensureConversations()`, `getActiveConversation()`, `selectConversation()`
    ve `addConversation()` eklendi.
  - Aktif sohbet, legacy `group/messages/messageSeq` motoruna iki yonlu
    baglandi.
  - `addMessage()`, `clearMessages()`, `set('group.*')`, `set('messages')`,
    `export()` ve `import()` aktif sohbet verisini kaybetmeden calisiyor.
  - Bos veya bozuk `conversations.items` verisi default sohbete temizleniyor.
- `js/phone/app-shell.js` Sohbetler sekmesini state listesinden render ediyor:
  - Her satir kendi avatar, baslik, son mesaj ozeti ve saatini tasiyor.
  - Satir tiklamasi hedef sohbeti aktif yapiyor, header/chat DOM'unu yeniden
    kuruyor ve chat detail'i aciyor.
- `js/phone/home-editors.js` yeni sohbet sheet'ini Faz 48 altyapisina ekledi:
  - Mesaj FAB'i `newConversation` editorunu aciyor.
  - Sohbet adi zorunlu, alt bilgi/avatar URL/ilk mesaj opsiyonel.
  - Kayit sonrasi yeni sohbet aktif oluyor ve mevcut sohbet motoruna baglaniyor.
- `index.html` ve `css/phone-shell.css` sheet kokunu ve form yuzeyini
  tamamliyor:
  - Editor sheet artik selector sozlesmesiyle bulunuyor.
  - Ilk mesaj icin textarea ve aktif sohbet satiri stili eklendi.
- Regression testleri:
  - `tests/state.test.js`: 37 test basarili.
  - `tests/phone-shell.test.js`: 20 test basarili.
  - Tam suite: 10 test dosyasi, 261 test basarili.
- Dogrulama:
  - `node --check js\state.js`: basarili.
  - `node --check js\phone\app-shell.js`: basarili.
  - `node --check js\phone\home-editors.js`: basarili.
  - `npm.cmd test -- tests\state.test.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: basarili.
  - `npm.cmd test`: basarili.
  - `npm.cmd run build`: basarili.
  - `git diff --check`: whitespace hatasi yok; yalnizca CRLF uyarilari var.
  - HTTP sanity: `http://127.0.0.1:5173` 200 dondu ve HTML'de
    `phoneHomeShell`, `phoneMessageFab`, `phoneEditorLayer`,
    `data-phone-open-chat` goruldu.
  - In-app browser eklentisi bu ortamda Node izin hatasiyla acilamadi; bunun
    yerine local HTTP/DOM sanity ve regression testleriyle dogrulama tamamlandi.
