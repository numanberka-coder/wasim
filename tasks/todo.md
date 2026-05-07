# Faz 44 - Topluluklar Sekmesi

> Tarih: 2026-05-07
> Branch: codex/faz-44
> Kaynak: ROADMAP5 Faz 44
> Durum: Planlandi

---

## Amac

Telefon ana shell'inde Topluluklar sekmesini WhatsApp Android dark duzenindeki
bos topluluk durumuna yaklastirmak. Faz 43'te tamamlanan Guncellemeler sekmesi,
bottom nav davranisi ve mevcut mobil menu erisimi korunacak.

---

## Kapsam

- [x] 1. Mevcut phone shell yapisini incele:
      - Topluluklar sekmesi panelinin mevcut markup durumunu belirle.
      - Bottom nav aktif state mekanizmasinin `communities` icin calistigini dogrula.
      - Ana sekmelerde uc nokta menu modelinin ayni kaldigini kontrol et.
- [x] 2. Topluluklar ust barini ekle:
      - Baslik: `Topluluklar`.
      - Uc nokta aksiyonu mevcut simulator menusunu acar.
      - Bu sekmede arama/kamera gibi Faz 44 disi aksiyonlar gorunmez.
- [x] 3. Bos durum illustasyonunu kur:
      - Kod tabaninda hafif SVG/CSS illustasyon kullan.
      - Merkezi gorsel 360x800 ve 390x844 viewportlarda dengeli kalir.
- [x] 4. Aciklama metinlerini ekle:
      - `Topluluklar sayesinde baglantida kalin` basligi.
      - Referans bos durum hissini veren kisa aciklama.
      - Metinler dar viewportta tasma veya overlap yaratmaz.
- [x] 5. Ornek topluluk linkini ekle:
      - Mavi link benzeri metin.
      - Ok isareti veya icon ile yon hissi.
      - Link gorunumu CTA ile karismayacak kadar ayrilir.
- [x] 6. Genis CTA davranisini ekle:
      - `Toplulugunuzu olusturun` yesil butonu.
      - CTA bottom nav ile carpismaz.
      - Light tema fallback'i okunur kalir.
- [x] 7. Testleri guncelle:
      - `tests/phone-shell.test.js` Faz 44 hiyerarsisini dogrular.
      - Topluluklar aktif bottom nav state'i dogrulanir.
      - Uc nokta menusu bu sekmeden de acilir.
      - CTA ve bos durum elementleri test edilir.
- [x] 8. Dogrulama calistir:
      - `node --check js\phone\app-shell.js`
      - `npm.cmd test -- tests\phone-shell.test.js`
      - `npm.cmd test`
      - `npm.cmd run build`
      - Mobil browser sanity: 360x800 ve 390x844 Topluluklar layout, CTA/nav overlap ve menu acilimi.

---

## Etkilenen Dosyalar

- `index.html`
- `css/phone-shell.css`
- `tests/phone-shell.test.js`

Kontrol edilen ama degismeyen:

- `js/phone/app-shell.js`

---

## Review

- `index.html` Faz 44 Topluluklar panelini icerir:
  - Hafif inline SVG bos durum illustasyonu.
  - `Topluluklar sayesinde baglantida kalin` basligi ve aciklama metni.
  - `Ornek topluluklari gor` mavi link aksiyonu.
  - `Toplulugunuzu olusturun` genis yesil CTA.
  - Browser sanity'deki eski `favicon.ico` 404'unu engelleyen inline favicon.
- `css/phone-shell.css` Topluluklar bos durum layoutunu kapsar:
  - Merkezi 360x800 ve 390x844 dengesi.
  - CTA'nin bottom nav ile carpmamasi icin panel padding ve flex yerlesimi.
  - Dark ve light tema fallback stilleri.
- `js/phone/app-shell.js` degismedi:
  - `communities` header config'i zaten `Topluluklar` basligini, arama/kamera gizlemeyi ve menu trigger'ini sagliyordu.
- `tests/phone-shell.test.js` 9 teste genisletildi:
  - Faz 44 bos durum hiyerarsisi.
  - Topluluklar aktif bottom nav state'i.
  - Header arama/kamera gizleme davranisi.
  - Topluluklar sekmesinden ayni mobil menu root'una erisim.
- Dogrulama:
  - `node --check js\phone\app-shell.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: 9 test basarili.
  - `npm.cmd test`: 10 test dosyasi, 245 test basarili.
  - `npm.cmd run build`: Vite build basarili.
  - `git diff --check`: whitespace hatasi yok.
  - Browser sanity `http://127.0.0.1:5173`:
    - 360x800 ve 390x844 viewportlarda `data-active-tab=communities`.
    - Header `Topluluklar`, arama ve kamera gizli.
    - Bos durum illustasyonu gorunur, link ve CTA dogru metinle render edildi.
    - CTA bottom nav ile carpmadi ve panel genisligi icinde kaldi.
    - Console warning/error ve 400+ HTTP response bulunmadi.
