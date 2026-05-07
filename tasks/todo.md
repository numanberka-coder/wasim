# Faz 45 - Aramalar Sekmesi

> Tarih: 2026-05-07
> Branch: codex/faz-45
> Kaynak: ROADMAP5 Faz 45
> Durum: Tamamlandi

---

## Amac

Telefon ana shell'indeki Aramalar sekmesini WhatsApp Android hissine
yaklastirmak. Faz 41-44 ile gelen ana shell, bottom nav, mobil menu, Sohbetler,
Guncellemeler ve Topluluklar davranislari korunacak.

---

## Kapsam

- [x] 1. Mevcut phone shell yapisini incele:
      - `calls` sekmesinin placeholder durumunu belirle.
      - Header config'inde Aramalar basligi, arama ikonu ve menu davranisini dogrula.
      - Bottom nav aktif state mekanizmasinin `calls` icin calistigini kontrol et.
- [x] 2. Aramalar sekmesi ust barini tamamla:
      - Baslik `Aramalar` shell header'indan gelir.
      - Arama ikonu dogru `Aramalarda ara` etiketiyle gorunur, kamera gizli kalir.
      - Uc nokta aksiyonu mevcut mobil menu root'una bagli kalir.
- [x] 3. Hizli aksiyonlari ekle:
      - Ara, Planla, Tus takimi, Favoriler kisa yol daireleri.
      - Dar ekranda esit aralikli ve okunur grid.
- [x] 4. Son aramalar listesini ekle:
      - Gercekci avatar, isim, tarih ve yon bilgisi.
      - Gelen/giden/cevapsiz durumlari ayirt edilebilir.
      - Liste bottom nav altina tasmadan scroll eder.
- [x] 5. Sag aksiyon ikonlarini ekle:
      - Satir bazinda video veya telefon ikonu.
      - Ikonlar metinle ve FAB ile carpismaz.
- [x] 6. Cagri FAB davranisini ekle:
      - Sag altta yesil yeni arama FAB'i.
      - Bottom nav ve liste ikonlariyla carpismaz.
- [x] 7. Testleri guncelle:
      - `tests/phone-shell.test.js` Faz 45 hiyerarsisini dogrular.
      - Header arama/kamera gorunurlugu test edilir.
      - Hizli aksiyonlar, son aramalar ve FAB test edilir.
      - Menu root'unun calls sekmesinde de ayni kaldigi dogrulanir.
- [x] 8. Dogrulama calistir:
      - `node --check js\phone\app-shell.js`
      - `npm.cmd test -- tests\phone-shell.test.js`
      - `npm.cmd test`
      - `npm.cmd run build`
      - Mobil browser sanity: 360x800 ve 390x844 Aramalar layout, FAB/nav overlap ve menu acilimi.

---

## Etkilenen Dosyalar

- `index.html`
- `css/phone-shell.css`
- `js/phone/app-shell.js`
- `tests/phone-shell.test.js`

---

## Review

- `index.html` Faz 45 Aramalar panelini icerir:
  - `Hizli aksiyonlar` alani: Ara, Planla, Tus takimi, Favoriler.
  - `Son aramalar` listesi: cevapsiz, giden ve gelen arama durumlari.
  - Satir saginda telefon/video aksiyon ikonlari.
  - `Yeni arama` yesil FAB'i.
- `css/phone-shell.css` Aramalar layoutunu kapsar:
  - Dortlu hizli aksiyon grid'i dar ekranda esit dagilir.
  - Son aramalar listesi bottom nav/FAB alanina pay birakir.
  - Dark ve light tema fallback stilleri eklendi.
- `js/phone/app-shell.js` sekme header sozlesmesini koruyarak genisletildi:
  - Aramalar sekmesinde search ikonu `Aramalarda ara` etiketiyle gorunur.
  - Kamera Aramalar sekmesinde gizli kalir.
  - Mevcut mobil menu trigger'i degismedi.
- `tests/phone-shell.test.js` 10 teste genisletildi:
  - Faz 45 hiyerarsisi, header state'i, hizli aksiyonlar, son aramalar, row aksiyonlari ve FAB test edildi.
  - Mobil menu root'unun `calls` sekmesinde de ayni kaldigi dogrulandi.
- Dogrulama:
  - `node --check js\phone\app-shell.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: 10 test basarili.
  - `npm.cmd test`: 10 test dosyasi, 246 test basarili.
  - `npm.cmd run build`: Vite build basarili.
  - `git diff --check`: whitespace hatasi yok.
  - Browser sanity `http://127.0.0.1:5173`:
    - `data-active-tab=calls`, header `Aramalar`.
    - Search etiketi `Aramalarda ara`, kamera gizli.
    - 4 hizli aksiyon, 4 son arama satiri ve `Yeni arama` FAB'i gorunur.
    - Uc nokta menu `headerDropdown`/`data-menu-root` ile acildi.
    - Console warning/error kaydi yok.
    - Screenshot alma CDP timeout verdi; bu nedenle browser sanity DOM ve gercek tiklama sinyalleriyle tamamlandi.
- `AGENTS.md` untracked kaldigi icin kapsam disinda tutuldu.
