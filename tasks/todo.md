# Faz 36 - Menu Mantigi & Siralama Disiplini

> Tarih: 2026-05-02
> Branch: codex/faz-36
> Kaynak: ROADMAP4.md Faz 36
> Durum: Dogrulandi

---

## Amac

Menunun kullanici is akisini anlatmasini saglamak: `Hazirla -> Senaryo ->
Oynat -> Cikti -> Ayarlar -> Veri Islemleri`. Panel acan ogeler, oynatma
aksiyonlari, cikti/kayit aksiyonlari ve veri islemleri ayni sira ve ayni
anlamla gorunmeli. Oynatma reset'i ile tum veriyi silme akisi birbirine
karismamali.

---

## Mevcut Tespit

- ROADMAP4 Faz 36, Faz 37/38/39 icin temel olacak mantik ve siralama standardi.
- Masaustu sol panelde yalniz `Grup -> Senaryo -> Ayarlar` sekmeleri var; bu
  Faz 36 sirasindaki `Hazirla -> Senaryo -> Ayarlar` kismina denk geliyor.
- Ust aksiyon cubugunda kaydet/yukle/tum veriyi sil ikonlari var; `Sifirla`
  basligi tum veri silme anlamiyla karisabiliyor.
- Telefon uc nokta menusunde panel, oynatma, cikti/kayit ve veri silme
  aksiyonlari var; gruplar boluculerle ayrilmis ama grup basligi yok.
- Mobil overlay basliginda `Oynat` ve oynatma reset'i var; bu reset dogru olarak
  oynatma baglaminda kalmali.

---

## Gorevler

- [x] 1. Ana menu dilini standartlastir:
      - `Grup & Kisiler` kullanici dilinde `Hazirla` olarak gorunsun.
      - Panel basliklari ve mobil overlay basligi ayni dili kullansin.
- [x] 2. Telefon uc nokta menusunu Faz 36 sirasina gore grupla:
      - `Hazirla`
      - `Senaryo`
      - `Oynat`
      - `Cikti`
      - `Ayarlar`
      - `Veri Islemleri`
- [x] 3. Aksiyon agirligini netlestir:
      - Panel acan ogeler panel gruplarinda kalsin.
      - `Oynat`, `Duraklat`, oynatma `Sifirla` ayni `Oynat` grubunda kalsin.
      - `Ekran Goruntusu`, `Kaydet`, `Yukle` cikti/veri dosyasi akisinda
        gruplansin.
- [x] 4. Veri islemleri dilini yumusat:
      - Tum veri silme akisi `Tehlikeli islemler` diliyle degil `Veri
        Islemleri` / `Dikkat Gerektirenler` cercevesiyle sunulsun.
      - Tum veri silme butonu onayli ve ayri kalsin.
- [x] 5. Sifirla anlamini ayir:
      - Oynatma reset'i `Sifirla` olarak kalabilir.
      - Tum veriyi silen aksiyon `Tum Veriyi Sil` veya daha acik bir metinle
        kalmali; ust aksiyon cubugundaki title karisikligi giderilmeli.
- [x] 6. CSS'i yalniz gereken kadar guncelle:
      - Grup basliklari ve boluculer mobil menude okunabilir olsun.
      - Kucuk ekranlarda metinler tasmasin.
- [x] 7. Korumali test ekle:
      - Menu grup sirasi ve kritik action eslesmeleri testle dogrulansin.
      - `Sifirla` ile `Tum Veriyi Sil` ayrimi testte gorunsun.
- [x] 8. Yerel dogrulama calistir:
      - `npm.cmd test`
      - `npm.cmd run build`
      - Gerekirse mobil/desktop tarayici sanity kontrolu

---

## Kabul Kriterleri

- Header menu, Faz 36 sirasini bozmadan okunur grup basliklariyla acilir.
- `Hazirla`, `Senaryo`, `Oynat`, `Cikti`, `Ayarlar`, `Veri Islemleri` dili
  ayni mantikla kullanilir.
- Oynatma reset'i tum veri silme akisiyle karismaz.
- Tum veri silme islemi ayri ve onayli kalir.
- Test ve build basarili olur.
- Commit kapsaminda yalniz Faz 36 dosyalari yer alir; untracked `AGENTS.md`
  commit'e alinmaz.

---

## Review

- `index.html` sol ana sekme dili `Hazirla` olarak guncellendi.
- Telefon uc nokta menusu Faz 36 sirasina gore baslikli gruplara ayrildi:
  `Hazirla`, `Senaryo`, `Oynat`, `Cikti`, `Ayarlar`, `Veri Islemleri`.
- Oynatma reset'i `Oynatmayi Sifirla` metniyle `Oynat` grubunda tutuldu.
- Tum veri silme akisi `Veri Islemleri` grubunda ayri, onayli ve acik metinli
  kaldi.
- Ust aksiyon cubugundaki tum veri silme butonunun title/aria-label metni
  `Tum Veriyi Sil` olarak netlestirildi.
- `css/responsive.css` icinde yalniz header dropdown grup basligi ve kucuk ekran
  genisligi icin lokal stiller eklendi.
- `tests/menu-order.test.js` eklendi; menu grup sirasi, action eslesmeleri ve
  reset/veri silme ayrimi testle korunuyor.
- Sandbox icinde ilk `npm.cmd test` ve Vite dev server denemesi `spawn EPERM`
  nedeniyle takildi; izinli calistirmada dogrulama tamamlandi.
- `npm.cmd test`: 9 test dosyasi, 221 test basarili.
- `npm.cmd run build`: Vite build basarili.
- Dev server: `http://127.0.0.1:5173` HTTP 200 dondu.
