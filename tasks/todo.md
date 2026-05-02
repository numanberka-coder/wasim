# Faz 40 - Menu Erisilebilirligi, Test & Dogrulama

> Tarih: 2026-05-02
> Branch: codex/faz-40
> Kaynak: ROADMAP4.md Faz 40
> Durum: Dogrulandi

---

## Amac

Faz 39 ile merkezi modele baglanan masaustu ve mobil menu davranisini
erisilebilirlik, klavye kullanimi, kapanma davranislari ve test guvencesiyle
tamamlamak. Degisiklikler menu yuzeyiyle sinirli kalacak; yeni urun akisi veya
genis UI yeniden yazimi yapilmayacak.

---

## ROADMAP4 Faz 40 Kapsami

- 40.1 Aktif durum ve ARIA:
  - Menude aktif oge, panel iliskisi, `aria-selected`/`aria-expanded` ve
    aciklayici etiketler netlestirilecek.
- 40.2 Klavye ve kapanma davranisi:
  - Tab/ok gezinmesi, Escape, backdrop ve geri tusu davranislari dogrulanacak.
- 40.3 Menu sirasi testleri:
  - Beklenen grup sirasi, Basit/Pro gorunurluk ve aksiyon eslesmeleri unit
    testlerle korunacak.
- 40.4 Tarayici sanity check:
  - Masaustu ve mobil viewport'ta menu acma, panel gecisi, cikti ve veri
    islemleri dogrulanacak.

Etkilenen dosyalar: `tests/`, `js/ui/menu-model.js`, `js/ui/mobile.js`,
`index.html`.

---

## Mevcut Tespit

- Faz 39 sonunda mobil menu runtime'da `getMobileMenuGroups()` ile merkezi
  modelden render ediliyor.
- `#headerMenuBtn` menu tetikleyicisi `aria-haspopup`, `aria-expanded`,
  `aria-controls` ve ac/kapat etiketlerini tasiyor.
- `#headerDropdown` `role="menu"` ve `data-menu-root` sozlesmesiyle modelden
  dolduruluyor.
- Masaustu tablar `getPanelMenuItems()` ile siralanip tab metadata'sini
  modelden aliyor.
- Mevcut test dosyasi `tests/menu-order.test.js`, Faz 36-39 menu sozlesmesini
  koruyan en dogal genisletme noktasi.

---

## Gorevler

- [x] 1. Aktif menu/panel ARIA sozlesmesini guclendir:
      - Masaustu tablarda aktif panel icin `aria-selected` ve gerekirse
        `aria-controls`/panel id iliskisi netlestirilir.
      - Mobil menu ogelerinde panel/aksiyon ayrimi aciklayici label ve state
        ile korunur.
- [x] 2. Klavye gezinmesini ve kapanma davranislarini toparla:
      - Mobil menu acikken Escape kapatma davranisi korunur ve test edilir.
      - Menu trigger uzerinde Enter/Space acma davranisi dogrulanir.
      - Uygunsa ok tuslariyla menu item odak sirasi eklenir veya mevcut Tab
        sirasi testle garanti edilir.
      - Backdrop ve mobil geri tusu davranislari geriye uyumlu kalir.
- [x] 3. Menu modeli ve render testlerini Faz 40 kapsamina genislet:
      - Grup sirasi, Basit/Pro gorunurluk ve action hedefleri icin regresyon
        testleri sikilastirilir.
      - ARIA state, trigger/menu iliskisi ve mobil runtime render davranisi
        unit testlerle korunur.
- [x] 4. Masaustu ve mobil manuel/browser sanity hazirligi yap:
      - Degisiklikler user-visible oldugu icin desktop ve mobile viewport
        uzerinden menu acma, panel gecisi, cikti ve veri islemleri kontrol
        edilecek.
- [x] 5. Standart dogrulama zincirini calistir:
      - Edited JS dosyalari icin `node --check`.
      - Hedefli menu testleri.
      - Full `npm.cmd test`.
      - `npm.cmd run build`.
      - Browser/HTTP sanity.

---

## Kabul Kriterleri

- Aktif masaustu panel durumu ARIA ile makine tarafindan okunabilir olur.
- Mobil menu tetikleyici, menu ve menu item iliskileri testlerle korunur.
- Escape, backdrop ve geri tusu kapanma davranislari bozulmaz.
- Basit/Pro gorunurluk ve ortak menu sirasi Faz 39 merkezi modelinden sapmaz.
- Test ve build basarili olur.
- Commit kapsaminda yalniz Faz 40 dosyalari yer alir; untracked `AGENTS.md`
  commit'e alinmaz.

---

## Review

- `js/ui/tabs.js` desktop tab state'ini tek yardimciya topladi; aktif tab
  artik `aria-selected`, `tabindex`, `aria-controls` ve panel tarafinda
  `role="tabpanel"`, `aria-hidden`, `aria-labelledby` ile senkronlaniyor.
- `js/ui/mobile.js` mobil menu gruplarina `role="group"` ve label iliskisi
  verdi; panel menu item'lari `aria-controls`, tum item'lar aciklayici
  `aria-label` tasiyor.
- Mobil menu klavye davranisi genisletildi: trigger uzerinde Enter/Space,
  menu icinde ok tuslari, Home/End ve Escape destekleniyor; Escape focus'u
  trigger'a geri tasiyor.
- `tests/menu-order.test.js` Faz 40 kapsamina genisletildi; desktop tab ARIA
  state'i, mobil runtime ARIA render'i ve klavye ac/gezin/kapat akisi
  korunuyor.
- `node --check js/ui/tabs.js`: basarili.
- `node --check js/ui/mobile.js`: basarili.
- `node --check tests/menu-order.test.js`: basarili.
- Sandbox icinde Vitest yine `spawn EPERM` verdi; yerel izinle calistirilan
  hedefli test basarili: `npm.cmd test -- tests/menu-order.test.js` -> 1
  dosya, 17 test basarili.
- `npm.cmd test`: 9 test dosyasi, 234 test basarili.
- `npm.cmd run build`: Vite build basarili.
- HTTP sanity: mevcut dev server `http://127.0.0.1:5173/` 200 dondu ve
  `data-menu-root`, `aria-expanded`, `mobileOverlay` izleri dogrulandi.
- `playwright` paketi yerelde bulunmadigi icin otomatik viewport screenshot
  alinmadi; desktop/mobil davranislar unit DOM testleri ve HTTP sanity ile
  dogrulandi.
