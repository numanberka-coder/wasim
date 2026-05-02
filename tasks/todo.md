# Faz 38 - Mobil Menu & Overlay Deneyimi

> Tarih: 2026-05-02
> Branch: codex/faz-38
> Kaynak: ROADMAP4.md Faz 38
> Durum: Dogrulandi

---

## Amac

Mobil uc nokta menusunu dar bir dropdown listesinden daha rahat taranan,
dokunmatik dostu bir calisma kapisina yaklastirmak. Faz 36-37'de netlesen
`Hazirla -> Senaryo -> Oynat -> Cikti -> Ayarlar -> Veri Islemleri` zihinsel
modeli mobilde korunacak; mevcut panel DOM tasima yaklasimi bozulmayacak.

---

## ROADMAP4 Faz 38 Kapsami

- 38.1 Gruplu mobil menu:
  - Uc nokta menusu Hazirla, Senaryo, Oynat, Cikti, Ayarlar ve Veri Islemleri
    gruplarina ayrilir.
- 38.2 Dokunmatik dostu sunum:
  - Uzun dropdown yerine daha rahat taranan gruplu menu veya bottom-sheet
    yaklasimi degerlendirilir.
- 38.3 Masaustuyle ayni zihinsel model:
  - Mobil sira ve isimlendirme masaustuyle uyumlu tutulur.
- 38.4 Overlay tasima davranisini koruma:
  - Mevcut panel DOM tasima yaklasimi korunur; buyuk form yapilari yeniden
    yazilmaz.

Etkilenen dosyalar: `index.html`, `js/ui/mobile.js`, `css/responsive.css`.

---

## Mevcut Tespit

- `#headerDropdown` Faz 36 sonrasinda zaten dogru grup sirasi ve aksiyonlara
  sahip, ancak halen kucuk, sag ustten acilan klasik dropdown gibi davraniyor.
- Mobil panel overlay'i `openMobileOverlay()` ile ilgili panel DOM node'unu
  `#mobileOverlayBody` icine tasiyor ve kapanista eski yerine geri koyuyor.
  Bu davranis korunmali.
- `js/ui/mobile.js` menuyu yalniz `is-open` class'i ile acar/kapatir; menu acikken
  beden/backdrop veya accessibility state'i su an sinirli.
- `css/responsive.css` menu icin 232px dropdown tasarimi kullaniyor. Faz 38 icin
  mobil viewport'ta menu, dokunmatik bottom-sheet hissi veren daha genis ve
  gruplu bir yuzeye donusmeli.
- `tests/menu-order.test.js` grup sirasi ve aksiyon ayrimini koruyor; Faz 38 icin
  mobil sunum siniflari/ARIA ve overlay tasima sozlesmesi testle korunabilir.

---

## Gorevler

- [x] 1. Mobil menu yapisini zenginlestir:
      - `#headerDropdown` icine mobil menu basligi veya taranabilir context
        ekle.
      - Mevcut `data-action` degerleri korunur.
      - Grup sirasi `Hazirla -> Senaryo -> Oynat -> Cikti -> Ayarlar -> Veri
        Islemleri` olarak kalir.
- [x] 2. Mobil menu ac/kapat davranisini guclendir:
      - Menu acikken tetikleyicide `aria-expanded` guncellensin.
      - Menu acikken dokunmatik kullanimi kolaylastiran state class'lari
        yonetilsin.
      - Mevcut disari tiklama ve resize kapanma davranisi bozulmasin.
- [x] 3. Dokunmatik dostu bottom-sheet sunumu ekle:
      - Sadece mobil viewport'ta menu sag ust dropdown yerine ekran altindan
        yukselen genis bir panel gibi gorunsun.
      - Grup basliklari, item bosluklari ve tehlikeli aksiyon ayrimi daha rahat
        taranir hale gelsin.
      - Kucuk ekran ve landscape durumunda tasma olmadan scroll calissin.
- [x] 4. Overlay DOM tasima sozlesmesini koru:
      - `PANEL_MAP`, `openMobileOverlay()` ve `closeMobileOverlay()` panel
        tasima yaklasimi yeniden yazilmayacak.
      - Gerekirse sadece daha acik state/ARIA ve temizlik adimlari eklenecek.
- [x] 5. Korumali testleri genislet:
      - Mobil menu yapisinin Faz 38 siniflari/ARIA isaretleri beklenen sekilde
        bulundugu test edilsin.
      - Panel aksiyonlarinin `group`, `scriptEditor`, `settings` olarak DOM
        tasima modeline bagli kaldigi test edilsin.
      - Faz 36-37 menu sirasi testleri korunur.
- [x] 6. Yerel dogrulama calistir:
      - `node --check js/ui/mobile.js`.
      - `npm.cmd test -- tests/menu-order.test.js`.
      - `npm.cmd test`.
      - `npm.cmd run build`.
      - Mobil viewport HTTP/browser sanity check.

---

## Kabul Kriterleri

- Mobil uc nokta menusu, tek kolon dar dropdown yerine dokunmatik dostu gruplu
  bir panel/bottom-sheet gibi kullanilir.
- Mobil menu sirasi ve isimleri masaustu zihinsel modeliyle uyumludur.
- Panel acan menu item'lari mevcut overlay DOM tasima davranisini kullanmaya
  devam eder.
- Veri silme gibi riskli aksiyonlar mobilde gorsel olarak ayrik ve net kalir.
- Test ve build basarili olur.
- Commit kapsaminda yalniz Faz 38 dosyalari yer alir; untracked `AGENTS.md`
  commit'e alinmaz.

---

## Review

- `index.html` mobil uc nokta tetikleyicisine `role`, `tabindex`,
  `aria-haspopup`, `aria-expanded` ve `aria-controls` eklendi.
- `#headerDropdown`, `mobile-action-sheet` roluyle mobil calisma menusu olarak
  isaretlendi; mevcut grup sirasi ve `data-action` sozlesmesi korundu.
- `js/ui/mobile.js` menu ac/kapat durumunda `aria-expanded`, tetikleyici etiketi,
  body state class'i ve menu backdrop state'ini yonetir hale geldi.
- Backdrop tiklamasi artik aktif mobil yuzeye gore menu veya panel overlay'ini
  kapatiyor.
- `openMobileOverlay()` mevcut panel DOM tasima modelini koruyor; yalniz menu
  backdrop state'ini temizleyerek panel overlay state'ine geciyor.
- `css/responsive.css` mobil viewport'ta menuyu alt kisimdan yukselen,
  dokunmatik dostu gruplu bottom-sheet gibi gosteriyor; kucuk ekran ve landscape
  tasma durumlari icin scroll/grid duzenleri eklendi.
- Light theme icin yeni menu grup/handle renkleri eklendi.
- `tests/menu-order.test.js`, Faz 38 mobil action-sheet isaretleri ve panel
  aksiyonlarinin overlay tasima sozlesmesine bagli kalmasi icin genisletildi.
- `node --check js/ui/mobile.js`: basarili.
- `git diff --check`: yalniz mevcut CRLF uyarilari, whitespace hatasi yok.
- Sandbox icinde hedefli Vitest `spawn EPERM` verdi; izinli calistirmada
  dogrulama tamamlandi.
- `npm.cmd test -- tests/menu-order.test.js`: 1 test dosyasi, 9 test basarili.
- `npm.cmd test`: 9 test dosyasi, 226 test basarili.
- `npm.cmd run build`: Vite build basarili.
- Dev server HTTP sanity: `http://127.0.0.1:5173/` 200 dondu.
- Browser sanity: menuyu acinca `aria-expanded=true` ve
  `mobile-action-sheet is-open` geldi; `Hazirla` aksiyonu menuyu kapatip `#group`
  panelini `#mobileOverlayBody` icine tasidi.
