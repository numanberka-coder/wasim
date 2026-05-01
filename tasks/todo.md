# Faz 35 - Interaktif Mod Akilli Eslestirme

> Tarih: 2026-05-01
> Branch: codex/faz-35
> Kaynak: ROADMAP4.md / Faz 35
> Durum: Tamamlandi

---

## Roadmap Ozeti

Faz 35, interaktif modun yalnizca exact trigger eslesmesine bagli kalmasini
azaltmayi hedefler. Kullanici mesaji trigger'i birebir yazmasa bile, contains
modu, alias/synonym gruplari ve basit skor tabanli fallback ile en yakin blok
bulunabilmeli. Yaratici tarafinda hangi trigger'in neden eslestigini gormek
icin kompakt bir debug gorunumu eklenmeli.

Kapsam:
- 35.1 Contains eslesme modu
- 35.2 Alias/synonym destegi
- 35.3 Skor tabanli fallback
- 35.4 Debug gorunumu

Etkilenen dosyalar:
- `js/features/interactive-engine.js`
- `index.html`
- `css/components.css`
- `tests/interactive-engine.test.js` veya mevcut test yapisina uygun yeni test

---

## Mevcut Durum

- `interactive-engine.js` icinde `findMatchingBlock(userInput)` su anda sadece
  trim + lowercase exact match yapiyor.
- `trigger:` satiri virgulle ayrilmis liste olarak parse ediliyor ve blokta
  `triggers` dizisi saklaniyor.
- `#default` / `trigger: *` fallback zaten var; eslesme bulunamazsa default blok
  donuyor.
- `index.html` interaktif rehber, senaryo textarea, ac/kapat, demo yukle,
  sifirla ve aktif badge alanlarini iceriyor.
- `getInteractiveSummary()` yalnizca blok ve trigger listesini HTML string
  olarak donduruyor; aktif eslesme nedeni veya son eslesme debug bilgisi yok.
- Test klasorunde interaktif motor icin ayrilmis test dosyasi henuz gorunmuyor.

---

## Mimari Karar

- Eslesme mantigi motor icinde saf fonksiyonlara ayrilacak; UI sadece ayarlari
  okuyup debug sonucunu gosterecek.
- Varsayilan davranis korunacak: exact match ilk sirada ve en guvenilir yol
  olacak.
- Contains ve skor fallback opsiyonel tutulacak; kullanici acmadan exact match
  davranisi bozulmayacak.
- Alias/synonym destegi ilk asamada script syntax'ina hafif ve geriye uyumlu bir
  ek olarak tasarlanacak:
  - `alias: kargo, teslimat, paket nerede`
  - Bu satir blok trigger'larina ek niyet ifadeleri olarak dahil edilecek.
- Skorlama basit ve acik olacak: exact > contains > token overlap. Agir NLP veya
  yeni paket eklenmeyecek.
- Debug gorunumu yalnizca yaraticiya bilgi verecek; telefon mesaj deneyimini
  degistirmeyecek.

---

## Gorevler

- [x] 1. `interactive-engine.js` icinde eslesme ayarlari ve son eslesme debug
      state'i icin kucuk bir yapi ekle.
- [x] 2. `parseBlockBody()` icine geriye uyumlu `alias:` satiri destegi ekle;
      bos/tekrarli alias degerlerini temizle.
- [x] 3. Eslesme algoritmasini saf yardimci fonksiyonlara bol:
      - normalize input
      - exact match
      - contains match
      - token overlap score
      - en iyi adayi secme
- [x] 4. Default block fallback davranisini koru; birden fazla aday varsa
      deterministik siralama kullan.
- [x] 5. `index.html` interaktif kontrol alanina kompakt ayarlar ekle:
      - contains eslesme toggle
      - skor fallback toggle
      - debug gorunumu toggle
- [x] 6. `interactiveInfo` icine son eslesme debug paneli ekle:
      - kullanici girdisi
      - eslesen blok
      - eslesme tipi
      - eslesen trigger/alias
      - skor veya fallback notu
- [x] 7. `css/components.css` icinde ayar satirlari ve debug panelini mevcut
      panel diliyle uyumlu, mobilde tasmasiz hale getir.
- [x] 8. Interaktif motor icin test ekle veya uygun mevcut test dosyasini
      genislet:
      - exact match once gelir
      - contains opsiyon kapaliyken calismaz
      - contains opsiyon acikken calisir
      - alias parse edilir ve eslesir
      - token fallback en iyi adayi secer
      - default fallback korunur
- [x] 9. Dogrulama:
      - `node --check js/features/interactive-engine.js`
      - `node --check js/app.js`
      - `npm.cmd test -- tests/interactive-engine.test.js`
      - `npm.cmd test`
      - `npm.cmd run build`
      - Gerekirse dev server/browser sanity check

---

## Kabul Kriterleri

- Exact match mevcut davranisi geriye uyumlu sekilde calisir.
- Contains ve skor fallback kullanici tarafindan acilip kapatilabilir.
- Alias/synonym satirlari bloklara ek niyet ifadesi olarak dahil olur.
- Eslesme bulunamazsa mevcut `#default` fallback akisi bozulmaz.
- Debug paneli son eslesmenin neden secildigini acik ve kisa gosterir.
- Yeni davranislar testlerle kanitlanir; tum testler ve build basarili olmadan
  Faz 35 tamam sayilmaz.

---

## Elegance Check

- Daha agir bir cozum olarak NLP, fuzzy search paketi veya global state
  genisletmesi eklemek mumkun; ancak Faz 35 icin en zarif yol, mevcut blok
  modelini kucuk alias alani ve saf eslesme fonksiyonlariyla genisletmek.
- Eslesme sirasi acik ve deterministik kalmali; debug paneli bu karari
  kullaniciya anlatmali.
- Telefon deneyimi degil, yaratici kontrolu iyilestirilmeli.

---

## Review

- `codex/faz-35` branch'i `codex/faz-34` uzerinden olusturuldu.
- ROADMAP.md, ROADMAP2.md, ROADMAP3.md ve ROADMAP4.md basliklari tarandi.
- Faz 35 gereksinimleri ROADMAP4.md icinden cikarildi.
- Mevcut interaktif motor incelendi; exact match disinda eslesme yok.
- Uygulama plani onaylandi ve implementasyona baslandi.
- `interactive-engine.js` icinde exact, contains ve token score eslesmeleri saf
  yardimci fonksiyonlara ayrildi.
- `alias:` satiri parse destegi eklendi; alias degerleri trigger'lardan ayri
  saklanip eslesme adaylarina dahil edildi.
- Eslesme secimi exact > contains > score sirasi, skor, terim uzunlugu ve blok
  sirasi ile deterministik hale getirildi.
- Interaktif mod kontrollerine contains, skor fallback ve debug toggle eklendi.
- Son eslesme debug paneli eklendi; girdi, blok, tip ve skor/terim bilgisini
  gosteriyor.
- `script-parser.js` interaktif `alias:` satirlarini normal script parse
  akisinda atlayacak sekilde guncellendi.
- `tests/interactive-engine.test.js` eklendi; 10 yeni test exact, contains,
  alias, skor fallback ve default fallback davranislarini kapsiyor.
- Hedefli dogrulama:
  - `node --check js/features/interactive-engine.js`
  - `node --check js/features/script-parser.js`
  - `node --check js/app.js`
  - `npm.cmd test -- tests/interactive-engine.test.js tests/script-parser.test.js` -> 73 test gecti
- Final dogrulama:
  - `npm.cmd test` -> 8 test dosyasi, 217 test gecti
  - `npm.cmd run build` -> Vite build basarili
  - `http://127.0.0.1:5174/` -> HTTP 200
  - Canli sayfada `interactiveContainsMatch`, `interactiveMatchDebug` ve alias
    syntax referansi gorundu.
