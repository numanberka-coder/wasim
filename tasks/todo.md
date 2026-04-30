# Faz 32 - Hata Mesajlari & Yardimci Geri Bildirim

> Tarih: 2026-04-30
> Branch: codex/faz-32
> Kaynak: ROADMAP4.md / Faz 32
> Durum: Tamamlandi

---

## Roadmap Ozeti

Faz 32'nin hedefi senaryo hatalarini sadece "gecersiz" diye gostermek degil,
kullanicinin hatali satiri, nedeni, duzeltme yolunu ve ornek dogru formati
tek bakista gorebilmesini saglamak.

Kapsam:
- 32.1 Satir bazli parse hatasi gosterimi
- 32.2 Ornek duzeltme onerisi
- 32.3 Yumusak dogrulama
- 32.4 Yardim paneli baglantisi

Etkilenen dosyalar:
- `js/features/script-parser.js`
- `js/ui/highlight.js`
- `js/features/player.js`
- `js/app.js`
- `index.html`
- `css/components.css`
- `tests/script-parser.test.js`

---

## Mimari Karar

- Parser tarafinda mevcut `parseScript(text)` davranisi korunacak, ancak ayni
  kaynaktan detayli sonuc almak icin yeni bir `parseScriptDetailed(text)` API'si
  eklenecek.
- Hatalar "fatal" ve "warning" olarak ayrilacak. Fatal satirlar kuyruga alinmaz;
  warning satirlarda guvenli varsayilan ile oynatma devam eder.
- Syntax highlight overlay, satir numarasina gore hata/warning satirlarini
  isaretleyebilecek sekilde genisletilecek.
- Senaryo editorunun altina kompakt bir geri bildirim paneli eklenecek.
  Panel; satir, neden, onerilen format ve Komut Yardimi'na kisa gecis sunacak.
- Mevcut buton akisi korunacak: `Yukle`, `Adim`, `Oynat` ayni kalacak; sadece
  yukleme sirasinda daha iyi geri bildirim uretilecek.

---

## Gorevler

- [x] 1. `script-parser.js` icinde komut tanimlarini merkezi hale getir.
- [x] 2. `parseScriptDetailed(text)` ekle: events + issues + summary donsun.
- [x] 3. Satir bazli fatal hatalari yakala: gecersiz komut, eksik isim, eksik URL/dosya, eksik mesaj metni.
- [x] 4. Yumusak dogrulama ekle: `@typing` sure gecersizse 800ms ile warning verip devam et.
- [x] 5. Hatalara ornek duzeltme onerisi ve yardim hedefi ekle.
- [x] 6. `player.loadScript()` icinde detayli parser sonucunu kullan.
- [x] 7. Senaryo editoru altina parse geri bildirim paneli ekle.
- [x] 8. `highlight.js` overlay'inde hatali satir/warning satiri isaretle.
- [x] 9. Komut Yardimi'na baglanti/odak aksiyonu ekle.
- [x] 10. CSS ile hata paneli, satir isaretleri ve mobil gorunumleri duzenle.
- [x] 11. Parser testlerini Faz 32 davranislariyla genislet.
- [x] 12. `npm.cmd test` ve `npm.cmd run build` ile dogrula.

---

## Kabul Kriterleri

- Gecersiz komut girildiginde kullanici hatali satiri ve dogru ornek formati gorur.
- Eksik argumanli komutlar sessizce bozuk event uretmez.
- Kritik olmayan `@typing Ahmet abc` gibi durumlarda oynatma tamamen durmaz;
  800ms varsayilaniyla devam eder ve warning gosterilir.
- Hata panelindeki yardim aksiyonu kullaniciyi Komut Yardimi bolumune goturur.
- Mevcut parser roundtrip testleri bozulmaz.
- Build ve testler gecmeden Faz 32 tamam sayilmaz.

---

## Review

- `parseScriptDetailed(text)` eklendi; parser artik events + issues + summary donduruyor.
- Gecersiz komut, eksik arguman ve eksik mesaj metni satir bazli error olarak yakalaniyor.
- `@typing Ali abc` gibi kritik olmayan hatalar 800ms varsayilanla warning olarak devam ediyor.
- Senaryo editoru altindaki geri bildirim paneli satir, hata/uyari tipi, neden, onerilen cozum ve ornek format gosteriyor.
- Syntax highlight overlay hata satirlarini kirmizi, warning satirlarini sari isaretliyor.
- `player.loadScript()` detayli parser sonucuyla calisiyor; hatali satirlari kuyruga almadan gecerli satirlari oynatabiliyor.
- Dogrulama:
  - `node --check js/features/script-parser.js`
  - `node --check js/features/player.js`
  - `node --check js/features/script-builder.js`
  - `node --check js/ui/highlight.js`
  - `npm.cmd test` -> 7 test dosyasi, 195 test gecti
  - `npm.cmd run build` -> Vite build basarili
  - Browser DOM kontrolu -> bozuk senaryoda `2 hata · 1 uyari`, 2 error highlight ve 1 warning highlight gorundu; console error yok
