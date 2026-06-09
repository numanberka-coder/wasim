# Final Polish - Material Icon Pass

> Tarih: 2026-05-09
> Branch: codex/final-polish
> Kaynak: Kullanici ekran notlari + Huzaifa-A-Subhani/whatsapp_ui referansi
> Durum: Tamamlandi
> Not: Bu turda yalnizca ikon sistemi ele alinacak.
> Not: `AGENTS.md` untracked ve kapsam disi kalacak.

---

## Amac

Telefon shell icindeki tum ortak ikonlari Flutter referans reposunun kullandigi
Material Icons ailesinin SVG karsiliklariyla degistirmek. Ikonlar repo
assetlerinden kopyalanmayacak; Material/Iconify kaynagindan alinip mevcut
`PHONE_ICON_SVG` sozlesmesine inline SVG olarak yerlestirilecek.

---

## Kapsam

- [x] 1. Preflight yap:
      - Cwd, branch, remote ve untracked dosyalar kontrol edildi.
      - `codex/final-polish` branch'i kullaniliyor.
- [x] 2. Mevcut ikon sozlesmesini haritala:
      - `PHONE_ICON_SVG` ana kaynak olarak kalacak.
      - Header, bottom nav, FAB, hizli aksiyon ve composer ikonlari ayni aileye
        cekilecek.
- [x] 3. Material ikon karsiliklarini cek:
      - `search`, `photo_camera`, `more_vert`, `add_comment`, `edit`,
        `chevron_right`, `call`, `add_call`, `videocam`, `calendar_month`,
        `dialpad`, `star`, `call_made`, `call_received`, `chat`, `update`,
        `groups`, `arrow_back`, `mood`, `attach_file`, `mic`, `close`.
      - `updates` icin ilk `update`, `motion_photos_on` ve `data_saver_off`
        benzeri denemeler yeterince iyi bulunmadigi icin kullanicinin gonderdigi
        referans PNG siluetinden kirik dis halka, belirgin alt-sol kuyruk ve
        icte dolu daire formu cizildi.
- [x] 4. Ikon render ve optik olcegi guncelle:
      - Tum ikonlar 24x24 viewBox ile ayni SVG ailesinden gelecek.
      - Gerekli host bazli olculer korunacak.
- [x] 5. Test sozlesmesini guncelle:
      - Eski custom path parcalarina bagli testler Material SVG sozlesmesine
        cevrilecek.
- [x] 6. Dogrulama:
      - [x] `node --check js\phone\app-shell.js`
      - [x] `npm.cmd test -- tests\phone-shell.test.js`
      - [x] `npm.cmd test`
      - [x] `npm.cmd run build`

---

## Review

- `js/phone/app-shell.js` icindeki tum `PHONE_ICON_SVG` entry'leri Material
  ailesinden 24x24 inline SVG path'lerine cevrildi.
  - 100x100 custom `phone`, `phonePlus`, `video`, `chatPlus` ikonlari kaldirildi.
  - Flutter referans reposundaki Material icon secimleriyle uyumlu karsiliklar
    kullanildi: `search`, `photo_camera`, `more_vert`, `add_comment`,
    `call`, `add_call`, `videocam`, `calendar_month`, `dialpad`, `star`,
    `call_made`, `call_received`, `chat`, `update`, `groups`, `arrow_back`,
    `mood`, `attach_file`, `mic`, `close`.
  - `updates` ikonu kullanici geri bildirimi sonrasi referans PNG siluetine
    yaklasacak sekilde kirik dis halka, alt-sol kuyruk ve icte dolu daire
    formuyla degistirildi.
- `css/phone-shell.css` Material filled ikon davranisina gore guncellendi:
  - Ortak SVG sozlesmesi `fill: currentColor`, `stroke: none` oldu.
  - Eski stroke-width ozel ayari kaldirildi.
- `tests/phone-shell.test.js` eski custom path parcalarini beklemek yerine
  Material ikon sozlesmesini dogruluyor:
  - Tum ikonlar `viewBox="0 0 24 24"` kullanir.
  - Eski `100x100` viewBox geri gelmez.
  - Kritik Material path parcalari test edilir.
- Kapsam disi tutulanlar:
  - Metin/Turkce karakter duzeltmeleri, sohbet silme, durum foto ekleme ve
    renk paleti bu turda uygulanmadi.
  - `AGENTS.md` untracked kaldi ve degistirilmedi.
- Dogrulama:
  - `node --check js\phone\app-shell.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: 22 test basarili.
  - `npm.cmd test`: 10 test dosyasi, 263 test basarili.
  - `npm.cmd run build`: basarili.
  - `http://127.0.0.1:5173` HTTP 200 dondu; in-app screenshot yakalama komutu
    zaman asimina dustu.
