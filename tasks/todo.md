# Faz 39 - Ortak Menu Modeli & Basit/Pro Kurallari

> Tarih: 2026-05-02
> Branch: codex/faz-39
> Kaynak: ROADMAP4.md Faz 39
> Durum: Dogrulandi

---

## Amac

Masaustu ve mobil menu tanimlarinin tekrar dagilmasini engellemek icin menu
ogelerini tek bir merkezi modelden beslemek. Basit Mod temel uretim akisini
gostermeli; Pro ogeler ayni zihinsel sira icinde kontrollu bicimde acilmali.

---

## ROADMAP4 Faz 39 Kapsami

- 39.1 Merkezi menu tanimi:
  - Menu ogeleri `id`, baslik, grup, aksiyon tipi, hedef ve gorunurluk
    bilgisiyle tek modelden beslenecek.
- 39.2 Masaustu/mobil ortak kaynak:
  - Mobil ve masaustu menuler ayni siralama ve adlandirmayi kullanacak.
- 39.3 Basit/Pro gorunurluk kurali:
  - Basit Mod temel uretim akisini gosterir.
  - Pro ogeler ayni siranin icinde kontrollu acilir.
- 39.4 Aksiyon handler tekrarini azaltma:
  - Oynat, duraklat, kaydet, yukle, ekran al gibi aksiyonlar kopyalanmadan
    cagrilacak.

Etkilenen dosyalar: `js/ui/menu-model.js` (yeni), `js/ui/mobile.js`,
`js/ui/tabs.js`, `index.html`.

---

## Mevcut Tespit

- Faz 36-38 sonrasi menu sirasi urun akisini izliyor:
  `Hazirla -> Senaryo -> Oynat -> Cikti -> Ayarlar -> Veri Islemleri`.
- `index.html` icindeki `#headerDropdown` mobil menuyu markup uzerinden
  tanimliyor; `js/ui/mobile.js` bu markup uzerindeki `data-action` degerlerini
  dinliyor.
- Masaustu panel gecisleri `js/ui/tabs.js` icinde sabit tab id listesiyle
  yonetiliyor.
- Faz 39 icin hedef, buyuk DOM yeniden yazimi degil; mevcut menu yuzeylerini
  merkezi veri modeliyle uyumlu hale getirip gorunurluk ve aksiyon sozlesmesini
  test edilebilir yapmak.

---

## Gorevler

- [x] 1. Merkezi menu modelini ekle:
      - `js/ui/menu-model.js` icinde grup sirasi, panel/action ayrimi,
        menu item idleri, basliklari, hedefleri ve mode gorunurlugu tanimlanir.
      - Model, DOM bagimliligi olmadan test edilebilir saf yardimci fonksiyonlar
        sunar.
- [x] 2. Mobil menuyu modelden besle:
      - `js/ui/mobile.js`, mobil menu gruplarini modelden render eder.
      - Mevcut action degerleri ve overlay DOM tasima sozlesmesi korunur.
      - Faz 38 bottom-sheet sunumu korunur.
- [x] 3. Masaustu tab/menu sozlesmesini modele bagla:
      - `js/ui/tabs.js`, tab sirasini modelden turetir.
      - Hazirla/Senaryo/Ayarlar ana panel gecisleri mevcut davranisini korur.
- [x] 4. Basit/Pro gorunurluk kuralini merkezilestir:
      - Basit modda temel uretim akisi kalir.
      - Pro ogeler model uzerinden ayristirilir ve ayni siradaki yeri korunur.
      - Mevcut UI toggle veya state ile uyumlu uygulanir; yoksa model
        varsayilani Pro seklinde geriye uyumlu kalir.
- [x] 5. Aksiyon handler tekrarini azalt:
      - Mobil action dispatch, modeldeki action tipine/target'a gore tek
        yardimci uzerinden calisir.
      - Panel acma, oynatma, cikti ve veri islemleri icin mevcut id/handler
        sozlesmesi bozulmaz.
- [x] 6. Korumali test ve dogrulama ekle:
      - Menu modeli sirasi, Basit/Pro filtreleri ve action hedefleri test edilir.
      - Mevcut menu-order testleri yeni modelle uyumlu hale getirilir.
      - `node --check` edited JS dosyalari, hedefli test, full test, build ve
        browser/HTTP sanity calistirilir.

---

## Kabul Kriterleri

- Mobil ve masaustu menu sirasi tek merkezi kaynaktan dogrulanabilir.
- Basit/Pro gorunurluk karari kod icinde daginik kosullara yayilmaz.
- Faz 38 mobil bottom-sheet ve overlay DOM tasima davranisi bozulmaz.
- Panel/aksiyon handlerlari geriye uyumlu `data-action` sozlesmesini korur.
- Test ve build basarili olur.
- Commit kapsaminda yalniz Faz 39 dosyalari yer alir; untracked `AGENTS.md`
  commit'e alinmaz.

---

## Review

- `js/ui/menu-model.js` eklendi; grup sirasi, action/panel hedefleri,
  Basit/Pro gorunurluk ve desktop action group sozlesmesi merkezi modele
  tasindi.
- `index.html` mobil menu item kopyasindan arindirildi; `#headerDropdown`
  artik runtime'da modelden doldurulan `data-menu-root` tasiyor.
- `index.html` icinde Pro kabul edilen script tab ve veri islemleri grubu
  `data-mode="pro"` ile isaretlendi.
- `js/ui/mobile.js` mobil action sheet'i `getMobileMenuGroups()` ile render
  ediyor; panel overlay tasima davranisi modeldeki `panelKey`/`target`
  sozlesmesine baglandi.
- `js/ui/mobile.js` action dispatch'i once merkezi modelden item buluyor,
  sonra panel/playback/output/data hedeflerini mevcut handlerlarla calistiriyor.
- `js/ui/tabs.js` desktop tab metadata, label, order ve Pro mode isaretini
  `getPanelMenuItems()` uzerinden senkronluyor.
- `js/app.js` app mode normalize islemini menu modeliyle ortaklastirdi ve mode
  degisiminde mobil menunun tekrar render edilmesi icin `wa-menu-mode-change`
  event'i yayinliyor.
- `tests/menu-order.test.js`, menu sirasi ve aksiyon ayrimini static HTML
  yerine merkezi modelden dogrular hale geldi; ayrica mobil action sheet'in
  runtime render davranisi Basit/Pro modda test edildi.
- `node --check js/ui/menu-model.js`: basarili.
- `node --check js/ui/mobile.js`: basarili.
- `node --check js/ui/tabs.js`: basarili.
- `node --check js/app.js`: basarili.
- `node --check tests/menu-order.test.js`: basarili.
- Sandbox icinde Vitest `spawn EPERM` verdi; yerel izinle calistirilan
  hedefli test basarili: `npm.cmd test -- tests/menu-order.test.js` -> 1 dosya,
  14 test basarili.
- `npm.cmd test`: 9 test dosyasi, 231 test basarili.
- `npm.cmd run build`: Vite build basarili.
- HTTP sanity: `http://127.0.0.1:5173/` 200 dondu ve `data-menu-root=True`
  dogrulandi; dev server kapatildi.
- `git diff --check`: whitespace hatasi yok; yalniz mevcut CRLF uyarilari
  goruldu.
