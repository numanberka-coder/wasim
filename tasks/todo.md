# Faz 37 - Masaustu Menu & Panel Duzeni

> Tarih: 2026-05-02
> Branch: codex/faz-37
> Kaynak: ROADMAP4.md Faz 37
> Durum: Dogrulandi

---

## Amac

Masaustu sol panel ve ust aksiyon barin kullanicinin uretim sirasini daha net
takip etmesini saglamak. Faz 36'da netlesen `Hazirla -> Senaryo -> Oynat ->
Cikti -> Ayarlar -> Veri Islemleri` zihinsel modeli masaustu duzene
tasinacak; teknik ve ileri seviye ogeler temel akisin onune gecmeyecek.

---

## ROADMAP4 Faz 37 Kapsami

- 37.1 Gorev odakli ana navigasyon:
  - `Grup/Senaryo/Ayarlar` yapisi kullanici dilindeki
    `Hazirla/Senaryo/Ayarlar` akisina yaklastirilir.
- 37.2 Ust aksiyon bar sadelesmesi:
  - Telefon modu + olcek, oynatma, cikti/kayit ve veri islemleri gorsel olarak
    gruplanir.
- 37.3 Accordion sirasi duzeni:
  - Grup, senaryo ve ayar panellerinde sik kullanilan bolumler yukari,
    gelismis/teknik bolumler asagi alinir.
- 37.4 Gelismis ogeleri geriye alma:
  - JSON duzenleme, manuel gonderim ve teknik ayarlar Pro/ileri kullanici
    baglaminda konumlanir.

Etkilenen dosyalar: `index.html`, `css/panels.css`, `css/layout.css`,
`js/ui/tabs.js`.

---

## Mevcut Tespit

- Sol ana sekmeler Faz 36 sonrasinda `Hazirla`, `Senaryo`, `Ayarlar` diline
  yaklasmis durumda.
- Ust aksiyon bar tek bir ikon sirasi gibi gorunuyor; telefon/olcek, cikti,
  veri islemleri ve tema aksiyonlari yalniz ince ayiraclarla ayriliyor.
- `Hazirla` panelinde `JSON Duzenle` Pro isaretli olsa da `Satir Sirasi`ndan
  once geliyor; temel uretim akisini boluyor.
- Senaryo panelinde rehber/editor/validasyon temel akisin merkezinde, interaktif
  ve debug bolumleri Pro baglaminda kalmali.
- Ayarlar panelinde tema temel, mesaj saatleri/sahne/durum cubugu/renk ve tik
  ayarlari daha ileri seviye ayarlar olarak asagi siralanmali.
- `js/ui/tabs.js` yalniz aktif sekme state'ini yonetiyor; Faz 37 icin gerekiyorsa
  tab meta veya panel hedefleri okunabilir hale getirilebilir, ama merkezi menu
  modeli Faz 39'a birakilmali.

---

## Gorevler

- [x] 1. Masaustu ana navigasyon dilini ve hedeflerini kontrol et:
      - `Hazirla`, `Senaryo`, `Ayarlar` sekmeleri Faz 37 kapsamiyla uyumlu
        kalsin.
      - Gerekirse sekmelere sade, kullanici odakli `aria-label`/title metni ekle.
- [x] 2. Ust aksiyon barini gorsel gruplara ayir:
      - Telefon modu + olcek kontrolleri bir `Gorunum` grubunda toplansin.
      - Ekran goruntusu, kaydet, yukle `Cikti` grubunda toplansin.
      - Tema `Ayarlar`, tum veriyi silme ise `Veri Islemleri` baglaminda kalsin.
      - Gruplama mevcut buton id'lerini ve JS baglantilarini bozmasin.
- [x] 3. Accordion siralarini temel akisa gore duzenle:
      - `Hazirla` panelinde satir uretimi ve kisi yonetimi teknik JSON'dan once
        gelsin.
      - `Senaryo` panelinde temel editor/yardim/validasyon yukarida, Pro veya
        debug nitelikli bolumler asagida kalsin.
      - `Ayarlar` panelinde sik kullanilan gorunum ayarlari yukarida, teknik
        ayrintilar asagida kalsin.
- [x] 4. Gelismis ogeleri geri plana al:
      - `JSON Duzenle`, manuel/teknik kontroller ve debug yuzeyleri Pro veya
        ileri kullanici baglaminda kalacak sekilde konumlandirilsin.
      - Basit Mod akisi bozulmasin.
- [x] 5. CSS'i yalniz gerekli kadar guncelle:
      - Ust aksiyon bar gruplari dar panel genisliginde tasmasin.
      - Grup basliklari/ayiraclar kucuk ve taranabilir olsun.
      - Mevcut koyu WhatsApp temasi ve panel olculeri korunur.
- [x] 6. Korumali test ekle veya mevcut testi genislet:
      - Masaustu tab sirasi ve etiketleri korunur.
      - Ust aksiyon bar gruplari beklenen sira ve action/id eslesmeleriyle
        dogrulanir.
      - `JSON Duzenle` gibi Pro/teknik bolumlerin temel akistan sonra geldigi
        test edilir.
- [x] 7. Yerel dogrulama calistir:
      - Duzenlenen JS dosyalari icin `node --check`.
      - Ilgili Vitest dosyalari.
      - `npm.cmd test`.
      - `npm.cmd run build`.
      - Masaustu tarayici/HTTP sanity check.

---

## Kabul Kriterleri

- Masaustu sol panel, kullanicinin ilk uretim akisini `Hazirla -> Senaryo ->
  Ayarlar` mantigiyla daha rahat izletir.
- Ust aksiyon bar tek bir ikon kalabaligi gibi degil, anlamli gruplar halinde
  taranir.
- Sik kullanilan accordion bolumleri yukarida; JSON, debug ve teknik ayarlar
  daha geri plandadir.
- Mevcut buton id'leri, event baglantilari, mobil menu ve Faz 36 menu sirasi
  bozulmaz.
- Test ve build basarili olur.
- Commit kapsaminda yalniz Faz 37 dosyalari yer alir; untracked `AGENTS.md`
  commit'e alinmaz.

---

## Review

- `index.html` ust aksiyon bari `view`, `output`, `settings` ve `data`
  gruplarina ayrildi; mevcut buton id'leri korunarak JS event baglantilari
  bozulmadi.
- Masaustu ana sekmelere sade `role`/`aria-label` bilgisi eklendi.
- `Hazirla` panelinde `Satir Sirasi`, teknik `JSON Duzenle` bolumunun onune
  alindi.
- Ayarlar panelinde `Tema`, onboarding/mod bolumunden hemen sonra yukariya
  tasindi; Pro/teknik mesaj saati bolumlerinden once gorunur oldu.
- `css/layout.css` icinde yalniz ust aksiyon bar grup cerceveleri icin lokal
  stiller eklendi.
- `tests/menu-order.test.js`, Faz 37 masaustu aksiyon gruplari ve accordion
  sirasi icin genisletildi.
- Sandbox icinde ilk hedefli Vitest calismasi `spawn EPERM` ile takildi; izinli
  calistirmada dogrulama tamamlandi.
- `npm.cmd test -- tests/menu-order.test.js`: 1 test dosyasi, 7 test basarili.
- `npm.cmd test`: 9 test dosyasi, 224 test basarili.
- `npm.cmd run build`: Vite build basarili.
- Dev server: `http://127.0.0.1:5174` HTTP 200 dondu. `5173` dolu oldugu icin
  Vite otomatik olarak `5174` portuna gecti.
