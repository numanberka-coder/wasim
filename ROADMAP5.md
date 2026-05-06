# WhatsApp Simulator - ROADMAP 5

> **Baslangic:** 2026-05-06
> **Kapsam:** WhatsApp Android benzeri mobil ana arayuz yenilemesi
> **Hedef:** Mevcut uretim aracini bozmadan, telefon onizlemesini mobilde WhatsApp gibi acilan bir ana uygulama deneyimine tasimak.

---

## Icindekiler

1. [Mevcut Durum](#mevcut-durum)
2. [Tasarim Ilkeleri](#tasarim-ilkeleri)
3. [Faz 41 - Ana Kabuk & Navigasyon](#faz-41---ana-kabuk--navigasyon)
4. [Faz 42 - Sohbetler Sekmesi](#faz-42---sohbetler-sekmesi)
5. [Faz 43 - Guncellemeler Sekmesi](#faz-43---guncellemeler-sekmesi)
6. [Faz 44 - Topluluklar Sekmesi](#faz-44---topluluklar-sekmesi)
7. [Faz 45 - Aramalar Sekmesi](#faz-45---aramalar-sekmesi)
8. [Faz 46 - Mobil Polish, Test & Gorsel Dogrulama](#faz-46---mobil-polish-test--gorsel-dogrulama)
9. [Uygulama Sirasi](#uygulama-sirasi)
10. [Basari Kriterleri](#basari-kriterleri)

---

## Mevcut Durum

ROADMAP4 sonunda simulatorun uretim paneli, mobil calisma menusu, Basit/Pro kurallari ve menu erisilebilirligi toparlandi. Telefon onizlemesi ise hala dogrudan tek bir sohbet detay ekranindan basliyor. Bu roadmap ile telefon onizlemesi, WhatsApp Android ana uygulama kabuguna benzer bir yapida acilacak; mevcut sohbet motoru, mesaj balonlari, ekran goruntusu alma ve uretim panelleri korunacak.

| Alan | Mevcut Not | Hedef |
|---|---|---|
| Mobil ilk gorunum | Tek sohbet ekrani | WhatsApp ana sekme kabugu |
| Sekme deneyimi | Yok | Sohbetler, Guncellemeler, Topluluklar, Aramalar |
| Simulator ayarlarina erisim | Sohbet header uc nokta | Ana sekmelerde ve sohbet detayinda ayni menu |
| Composer / atac / kamera | Sohbet detayinda mevcut | Sadece sohbet detayinda kalir |
| Masaustu etkisi | Uretim paneli odakli | Opsiyonel, mevcut panel bozulmaz |

---

## Tasarim Ilkeleri

- Mobil Android gorunum birincil hedeftir; masaustu polish bu roadmap icin ikincildir.
- Ana ekran kabugu WhatsApp hissi vermeli, ama mevcut simulator islevleri kaybolmamalidir.
- Uc nokta butonu her ana sekmede simulatorun mevcut mobil ayarlar/calisma menusunu acmalidir.
- Emoji, atac, kamera, mesaj inputu ve mikrofon yalnizca sohbet detay ekraninda bulunmalidir.
- Sekmeler birbirinden kucuk ve dogrulanabilir fazlarla eklenmelidir.
- Her faz `tasks/todo.md` uzerinden takip edilmeli; `AGENTS.md` commit kapsaminda tutulmamalidir.

---

## Faz 41 - Ana Kabuk & Navigasyon

> *Telefon onizlemesi once WhatsApp ana uygulama kabugunu gostermeli; sohbet detayi bunun icinden acilmali.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 41.1 | Home shell / chat detail ayrimi | `.phone` icinde ana sekme kabugu ve mevcut sohbet detay ekrani ayri yuzeylere bolunur | Kirmizi |
| 41.2 | Alt nav iskeleti | Sohbetler, Guncellemeler, Topluluklar, Aramalar sekmeleri eklenir | Kirmizi |
| 41.3 | Uc nokta menu baglantisi | Ana sekmelerdeki uc nokta mevcut simulator mobil menusunu acar | Kirmizi |
| 41.4 | Composer siniri | Composer, emoji, atac, kamera ve mikrofon sadece sohbet detayinda gorunur | Kirmizi |
| 41.5 | Geri donus davranisi | Sohbet detayindan ana kabuga donus netlestirilir | Sari |

**Etkilenen dosyalar:** `index.html` - `js/phone/app-shell.js` (yeni) - `js/app.js` - `css/phone-shell.css` (yeni) - `tests/phone-shell.test.js` (yeni)

**Kabul kriterleri:**

- Mobilde ilk ekran ana shell olarak acilir.
- Bottom nav dort sekmeyi gosterir ve aktif sekme makine tarafindan okunabilir durumdadir.
- Sohbet detayina gecince mevcut mesaj motoru ve composer calismaya devam eder.
- Ana shell icinde composer/atac/kamera gorunmez.
- Uc nokta butonu mevcut `data-menu-root` menusuyle ayni modeli kullanir.

---

## Faz 42 - Sohbetler Sekmesi

> *Ana giris ekrani WhatsApp Android Sohbetler gorunumune yaklasmali.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 42.1 | Sohbetler ust bari | WhatsApp basligi, kamera ikonu ve uc nokta aksiyonu eklenir | Kirmizi |
| 42.2 | Arama alani | Meta AI/Search benzeri yuvarlak arama alani eklenir | Sari |
| 42.3 | Filtre chipleri | All, Unread, Groups chipleri eklenir; aktif chip gorsel olarak ayrilir | Sari |
| 42.4 | Sohbet listesi | Mevcut grup/avatar/son mesaj bilgisinden ana sohbet satiri uretilir | Kirmizi |
| 42.5 | Detay acma | Ana sohbet satirina tiklayinca mevcut sohbet detay ekrani acilir | Kirmizi |
| 42.6 | Mesaj FAB | Sag altta WhatsApp tarzinda mesaj FAB'i gosterilir | Sari |

**Etkilenen dosyalar:** `index.html` - `js/phone/app-shell.js` - `css/phone-shell.css` - `tests/phone-shell.test.js`

**Kabul kriterleri:**

- Sohbetler sekmesi referans Android gorunumundeki hiyerarsiyi tasir.
- Ana sohbet satiri bos veriyle de guvenli fallback gosterir.
- Filtre chipleri layout shift yaratmadan secilebilir.
- Sohbet satiri mevcut chat detail ekranini acar.

---

## Faz 43 - Guncellemeler Sekmesi

> *Durumlar ve kanallar, referans gorseldeki Android dark duzene benzemeli.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 43.1 | Guncellemeler ust bari | Baslik, arama ikonu ve uc nokta aksiyonu eklenir | Kirmizi |
| 43.2 | Durum bolumu | Durum ekle satiri ve 24 saat sonra kaybolur metni eklenir | Kirmizi |
| 43.3 | Son guncellemeler | Gercekci iki durum satiri gosterilir; statik/derived veri yeterlidir | Sari |
| 43.4 | Kanallar bolumu | Aciklama metni, kesfet ve kanal olustur outline butonlari eklenir | Sari |
| 43.5 | Cift FAB | Kalem ve kamera FAB'lari referans konumda gosterilir | Sari |

**Etkilenen dosyalar:** `index.html` - `js/phone/app-shell.js` - `css/phone-shell.css` - `tests/phone-shell.test.js`

**Kabul kriterleri:**

- Guncellemeler sekmesi scroll edilebilir ve bottom nav ile carpismaz.
- Iki FAB bottom nav uzerinde kalir, 360px genislikte tasma yapmaz.
- Uc nokta menusu bu sekmeden de simulator menusunu acar.

---

## Faz 44 - Topluluklar Sekmesi

> *Bos topluluk durumu, referans gorseldeki merkezi anlatimi tasimali.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 44.1 | Topluluklar ust bari | Baslik ve uc nokta aksiyonu eklenir | Kirmizi |
| 44.2 | Bos durum illustasyonu | Kod tabaninda hafif SVG/CSS illustasyon ile merkezi gorsel kurulur | Sari |
| 44.3 | Aciklama metinleri | Topluluklar sayesinde baglantida kalin basligi ve aciklama eklenir | Kirmizi |
| 44.4 | Ornek topluluk linki | Mavi link benzeri metin ve ok isareti eklenir | Sari |
| 44.5 | Genis CTA | Altta `Toplulugunuzu olusturun` yesil butonu eklenir | Kirmizi |

**Etkilenen dosyalar:** `index.html` - `js/phone/app-shell.js` - `css/phone-shell.css` - `tests/phone-shell.test.js`

**Kabul kriterleri:**

- Bos durum 360x800 ve 390x844 viewportlarda dengeli ortalanir.
- CTA bottom nav ile carpismaz.
- Aktif bottom nav state'i Topluluklar sekmesinde dogru gorunur.

---

## Faz 45 - Aramalar Sekmesi

> *Aramalar sekmesi hizli aksiyonlar ve son aramalar listesiyle gercekci durmali.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 45.1 | Aramalar ust bari | Baslik, arama ikonu ve uc nokta aksiyonu eklenir | Kirmizi |
| 45.2 | Hizli aksiyonlar | Ara, Planla, Tus takimi, Favoriler kisa yol daireleri eklenir | Sari |
| 45.3 | Son aramalar listesi | Gercekci avatar, isim, tarih ve yon bilgisiyle liste gosterilir | Kirmizi |
| 45.4 | Sag aksiyon ikonlari | Satirlarda video veya telefon ikonu gosterilir | Sari |
| 45.5 | Cagri FAB | Sag altta yesil yeni arama FAB'i eklenir | Sari |

**Etkilenen dosyalar:** `index.html` - `js/phone/app-shell.js` - `css/phone-shell.css` - `tests/phone-shell.test.js`

**Kabul kriterleri:**

- Hizli aksiyonlar dar ekranda esit aralikli ve okunur kalir.
- Son aramalar listesi bottom nav altina tasmaz; scroll davranisi dogrudur.
- Arama sekmesinin FAB'i bottom nav ve liste ikonlariyla carpismaz.

---

## Faz 46 - Mobil Polish, Test & Gorsel Dogrulama

> *Ana kabuk guzel gorunmeli, ama asil onemlisi mobilde kirilmadan calismali.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 46.1 | Mobil viewport kontrolu | 360x800 ve 390x844 viewportlarda tum sekmeler kontrol edilir | Kirmizi |
| 46.2 | Menu z-index/pointer kontrolu | Uc nokta menusu ana sekmelerde ve sohbet detayinda gercek tiklamayla dogrulanir | Kirmizi |
| 46.3 | Bottom nav/FAB polish | Aktif kapsul, ikon boyutu, scroll padding ve FAB konumlari son kez duzeltilir | Kirmizi |
| 46.4 | Regression testleri | Menu, shell ve mevcut mesaj motoru testleri birlikte calistirilir | Kirmizi |
| 46.5 | Build ve sanity | Full test, build ve HTTP/browser sanity tamamlanir | Kirmizi |

**Etkilenen dosyalar:** `css/phone-shell.css` - `css/responsive.css` - `js/phone/app-shell.js` - `tests/phone-shell.test.js`

**Kabul kriterleri:**

- Mobilde Sohbetler, Guncellemeler, Topluluklar, Aramalar ve sohbet detay ekrani overlap olmadan gorunur.
- Uc nokta menusu onceki mobil overlay pointer sorununu tekrar etmez.
- Full test ve build basarili olur.
- Ekran goruntusu alma akisi mevcut telefon preview uzerinden calismaya devam eder.

---

## Uygulama Sirasi

1. **Faz 41** - Shell ve navigasyon zemini.
2. **Faz 42** - Sohbetler sekmesi ve chat detail gecisi.
3. **Faz 43** - Guncellemeler sekmesi.
4. **Faz 44** - Topluluklar sekmesi.
5. **Faz 45** - Aramalar sekmesi.
6. **Faz 46** - Mobil polish, test ve gorsel dogrulama.

Her faz ayri branch/commit olarak uygulanabilir. Faz 41 tamamlanmadan sonraki sekme fazlarina baslanmamalidir; cunku home shell, bottom nav ve chat detail ayrimi sonraki tum sekmelerin temelidir.

---

## Basari Kriterleri

- Mobil ilk acilista WhatsApp Android benzeri ana sekme arayuzu gorulur.
- Kullanici Sohbetler sekmesinden mevcut simulator sohbet detayina gecip geri donebilir.
- Ana sekmelerde simulatorun uc nokta ayarlar/calisma menusu erisilebilir olur.
- Composer ve medya ikonlari sadece sohbet detay ekraninda kalir.
- Bottom nav, FAB'lar ve scroll alanlari mobil viewportlarda birbiriyle carpismaz.
- Mevcut uretim paneli, oynatma, screenshot, kaydet/yukle ve Basit/Pro menu davranislari korunur.

---

## Standart Faz Akisi

Her ROADMAP5 fazinda:

1. `tasks/todo.md` ilgili faz icin yenilenir.
2. Degisiklik sadece faz kapsamindaki dosyalarda tutulur.
3. `AGENTS.md` commit kapsaminda tutulmaz.
4. Hedefli `node --check` calistirilir.
5. Ilgili test dosyasi calistirilir.
6. Full `npm.cmd test` ve `npm.cmd run build` calistirilir.
7. User-visible fazlarda mobil browser sanity yapilir.

