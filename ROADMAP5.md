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
9. [Faz 47 - Ikon Sistemi & Chat Header Polish](#faz-47---ikon-sistemi--chat-header-polish)
10. [Faz 48 - Kalici Telefon Verisi & Bottom Sheet Editor Altyapisi](#faz-48---kalici-telefon-verisi--bottom-sheet-editor-altyapisi)
11. [Faz 49 - Coklu Sohbetler & Yeni Sohbet Olusturma](#faz-49---coklu-sohbetler--yeni-sohbet-olusturma)
12. [Faz 50 - Guncellemeler Duzenleme Akisi](#faz-50---guncellemeler-duzenleme-akisi)
13. [Faz 51 - Topluluk Duzenleme Akisi](#faz-51---topluluk-duzenleme-akisi)
14. [Faz 52 - Aramalar Duzenleme Akisi](#faz-52---aramalar-duzenleme-akisi)
15. [Uygulama Sirasi](#uygulama-sirasi)
16. [Basari Kriterleri](#basari-kriterleri)

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
- Telefon + mobil UI ikonlari ortak SVG sistemi kullanmalidir.
- Ana sekme duzenlemeleri telefon ici bottom sheet ile yapilmalidir.
- Kullanicinin duzenledigi ana sekme verileri kalici olmalidir.
- Coklu sohbet destegi mevcut uretim paneli, oynatma ve screenshot akislarini bozmamalidir.
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

## Faz 47 - Ikon Sistemi & Chat Header Polish

> *Telefon + mobil UI ikonlari tek bir gorsel dilde toparlanmali; sohbet geri butonu artefact uretmemeli.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 47.1 | Ortak ikon sozlesmesi | Telefon header, bottom nav, FAB, composer, mobile menu ve edit sheet ikonlari ortak SVG diline tasinir | Kirmizi |
| 47.2 | Header ikon polish | Ana shell ve sohbet detay header ikonlari boyut, stroke/fill ve hizalama acisindan eslenir | Kirmizi |
| 47.3 | Chat geri butonu | Sohbet icindeki geri butonu acik yesil kare artefact uretmeyecek sekilde transparent ve dokunulabilir hale getirilir | Kirmizi |
| 47.4 | FAB ve composer ikonlari | Mesaj, arama, kalem, kamera, atac, mikrofon ve gonder ikonlari ayni ailede gorunur | Sari |
| 47.5 | Tema kontrasti | Dark/light tema ve custom header renklerinde ikon kontrasti korunur | Kirmizi |

**Etkilenen dosyalar:** `index.html` - `js/ui/menu-model.js` - `js/phone/app-shell.js` - `css/phone.css` - `css/phone-shell.css` - `tests/phone-shell.test.js`

**Kabul kriterleri:**

- Telefon + mobil UI ikonlari tutarli SVG sistemiyle render edilir.
- Sohbet geri butonu 360x800 ve 390x844 viewportlarda kare/yesil artefact gostermez.
- Header, bottom nav, FAB ve composer ikonlari tasma veya hizalama kaymasi yaratmaz.
- Dark/light temada ve custom header renklerinde okunabilir kontrast korunur.

---

## Faz 48 - Kalici Telefon Verisi & Bottom Sheet Editor Altyapisi

> *Ana sekme duzenlemeleri telefon icinde bottom sheet ile yapilmali ve kalici state'e yazilmalidir.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 48.1 | Kalici state modeli | `conversations` ve `phoneShellContent` alanlari state/export/import/reset akisina eklenir | Kirmizi |
| 48.2 | Geriye donuk fallback | Eski kayitlar `group` ve `messages` verisinden tek default sohbet ve default sekme icerigi uretir | Kirmizi |
| 48.3 | Bottom sheet altyapisi | Telefon icinde acilan, kapanan, kaydeden ve backdrop kullanan ortak editor sheet kurulur | Kirmizi |
| 48.4 | Form sozlesmesi | Sheet formlari baslik, aciklama, kaydet, iptal ve hata durumlarini ortak modelle kullanir | Sari |
| 48.5 | Z-index/pointer kontrolu | Sheet, mevcut mobile menu ve chat detail yuzeyleriyle pointer cakismasi yaratmaz | Kirmizi |

**Etkilenen dosyalar:** `index.html` - `js/state.js` - `js/phone/app-shell.js` - `js/phone/home-editors.js` (yeni) - `css/phone-shell.css` - `tests/state.test.js` - `tests/phone-shell.test.js`

**Kabul kriterleri:**

- Bottom sheet ac/kapat/kaydet davranisi test edilebilir ve klavye ile ulasilabilir.
- `state.export()` ve `state.import()` yeni telefon verilerini korur.
- Eski localStorage/export dosyalari bozulmadan acilir ve default veriye tamamlanir.
- Sheet acikken bottom nav, FAB ve mobile menu pointer davranisi bozulmaz.

---

## Faz 49 - Coklu Sohbetler & Yeni Sohbet Olusturma

> *Sohbetler sekmesinden yeni sohbet eklenebilmeli; her sohbet kendi mesaj gecmisini korumali.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 49.1 | Coklu sohbet listesi | Sohbetler sekmesi `conversations.items` listesinden satir uretir | Kirmizi |
| 49.2 | Aktif sohbet senkronu | Secilen sohbet mevcut chat detail motoruna, `group`, `messages` ve `messageSeq` mirror'u uzerinden baglanir | Kirmizi |
| 49.3 | Yeni sohbet sheet'i | Mesaj FAB'i sohbet adi, alt bilgi, avatar URL ve ilk mesaj alanlariyla bottom sheet acar | Kirmizi |
| 49.4 | Sohbet secme | Home listesinde satira tiklamak once aktif sohbeti kaydeder, sonra hedef sohbeti chat detail olarak acar | Kirmizi |
| 49.5 | Bos/fallback durumlari | Hic sohbet yoksa guvenli default sohbet uretir; gecersiz veri uygulamayi kirmadan temizlenir | Sari |

**Etkilenen dosyalar:** `index.html` - `js/state.js` - `js/phone/app-shell.js` - `js/phone/home-editors.js` - `css/phone-shell.css` - `tests/state.test.js` - `tests/phone-shell.test.js`

**Kabul kriterleri:**

- Yeni sohbet kaydedilince Sohbetler listesine eklenir ve secilebilir olur.
- Her sohbet kendi mesaj gecmisini, avatarini, basligini ve son mesaj ozetini korur.
- Player, manuel composer, screenshot ve chat detail mevcut aktif sohbet uzerinden calismaya devam eder.
- Export/import ve sahne kaydet/yukle coklu sohbet verisini korur.

---

## Faz 50 - Guncellemeler Duzenleme Akisi

> *Guncellemeler sekmesindeki kalem ikonu, durum ve kanal iceriklerini kalici olarak duzenletmelidir.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 50.1 | Kalem aksiyonu | `phoneUpdatesEditFab` ortak bottom sheet editorunu acacak sekilde baglanir | Kirmizi |
| 50.2 | Durumum editoru | Durum basligi, yardimci metin ve durum zamani/metni duzenlenebilir olur | Kirmizi |
| 50.3 | Son guncellemeler | En az iki son guncelleme satiri isim, zaman ve avatar bas harfiyle duzenlenir | Sari |
| 50.4 | Kanal metinleri | Kanal aciklamasi ve CTA metinleri kalici icerikten render edilir | Sari |
| 50.5 | Kalicilik | Duzenlenen guncellemeler localStorage, export/import ve sahne kaydinda korunur | Kirmizi |

**Etkilenen dosyalar:** `index.html` - `js/state.js` - `js/phone/app-shell.js` - `js/phone/home-editors.js` - `css/phone-shell.css` - `tests/phone-shell.test.js`

**Kabul kriterleri:**

- Kalem ikonuna tiklayinca Guncellemeler editor sheet'i acilir.
- Kaydedilen durum ve kanal metinleri sekmede hemen gorunur.
- Sayfa yenileme, export/import ve sahne yukleme sonrasi guncellemeler korunur.
- FAB'lar bottom nav ile carpismaz.

---

## Faz 51 - Topluluk Duzenleme Akisi

> *Topluluk CTA'si, sohbet benzeri ama islevsel olmayan topluluk gorunumunu duzenletmelidir.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 51.1 | CTA aksiyonu | `Toplulugunuzu olusturun` butonu ortak bottom sheet editorunu acacak sekilde baglanir | Kirmizi |
| 51.2 | Sohbet benzeri gorunum | Topluluk editoru baslik, aciklama, ornek link ve CTA metnini sohbet benzeri yuzeyde duzenletir | Kirmizi |
| 51.3 | Islev siniri | Topluluk icin gercek mesajlasma, katilimci yonetimi veya bildirim mantigi eklenmez | Kirmizi |
| 51.4 | Bos durum renderi | Bos durum illustasyonu ve metinleri kalici `phoneShellContent.communities` verisinden render edilir | Sari |
| 51.5 | Layout guvencesi | CTA ve editor sheet 360x800 ve 390x844 viewportlarda bottom nav ile carpismaz | Kirmizi |

**Etkilenen dosyalar:** `index.html` - `js/state.js` - `js/phone/app-shell.js` - `js/phone/home-editors.js` - `css/phone-shell.css` - `tests/phone-shell.test.js`

**Kabul kriterleri:**

- Topluluk CTA'si editor sheet acar ve kaydetme sonrasi sekme metinlerini gunceller.
- Duzenlenen topluluk gorunumu kalici olarak saklanir.
- Topluluk gorunumu sohbet hissine yaklasir ama gercek sohbet motoruna baglanmaz.
- CTA, link ve bottom nav arasinda overlap olmaz.

---

## Faz 52 - Aramalar Duzenleme Akisi

> *Aramalar sekmesi, ust arama ikonundan acilan editorle kalici olarak duzenlenebilmelidir.*

| # | Iyilestirme | Detay | Oncelik |
|---|---|---|---|
| 52.1 | Arama ikon aksiyonu | Aramalar sekmesindeyken ust `Ara` butonu arama listesi editor sheet'ini acar | Kirmizi |
| 52.2 | Arama satiri editoru | Isim, tarih/metin, yon, cagri tipi ve avatar bas harfleri duzenlenebilir olur | Kirmizi |
| 52.3 | Liste renderi | Son aramalar listesi `phoneShellContent.calls` verisinden uretilir | Kirmizi |
| 52.4 | Ikon uyumu | Telefon/video ve yon ikonlari Faz 47 ortak ikon sistemiyle ayni gorunur | Sari |
| 52.5 | Kalicilik | Arama listesi localStorage, export/import ve sahne kaydinda korunur | Kirmizi |

**Etkilenen dosyalar:** `index.html` - `js/state.js` - `js/phone/app-shell.js` - `js/phone/home-editors.js` - `css/phone-shell.css` - `tests/phone-shell.test.js`

**Kabul kriterleri:**

- Aramalar sekmesindeki ust arama ikonuna tiklamak editor sheet acar.
- Kaydedilen arama listesi sekmede hemen gorunur ve yenileme sonrasi korunur.
- FAB, satir aksiyon ikonlari ve bottom nav dar viewportlarda carpismaz.
- Full test, build ve mobil browser sanity basarili olur.

---

## Uygulama Sirasi

1. **Faz 41** - Shell ve navigasyon zemini.
2. **Faz 42** - Sohbetler sekmesi ve chat detail gecisi.
3. **Faz 43** - Guncellemeler sekmesi.
4. **Faz 44** - Topluluklar sekmesi.
5. **Faz 45** - Aramalar sekmesi.
6. **Faz 46** - Mobil polish, test ve gorsel dogrulama.
7. **Faz 47** - Ikon sistemi ve chat header polish.
8. **Faz 48** - Kalici telefon verisi ve bottom sheet editor altyapisi.
9. **Faz 49** - Coklu sohbetler ve yeni sohbet olusturma.
10. **Faz 50** - Guncellemeler duzenleme akisi.
11. **Faz 51** - Topluluk duzenleme akisi.
12. **Faz 52** - Aramalar duzenleme akisi.

Her faz ayri branch/commit olarak uygulanabilir. Faz 41 tamamlanmadan sonraki sekme fazlarina baslanmamalidir; cunku home shell, bottom nav ve chat detail ayrimi sonraki tum sekmelerin temelidir. Faz 48 tamamlanmadan Faz 49-52 duzenleme akislarina baslanmamalidir; cunku kalici state ve bottom sheet altyapisi bu fazlarin ortak temelidir.

---

## Basari Kriterleri

- Mobil ilk acilista WhatsApp Android benzeri ana sekme arayuzu gorulur.
- Kullanici Sohbetler sekmesinden mevcut simulator sohbet detayina gecip geri donebilir.
- Ana sekmelerde simulatorun uc nokta ayarlar/calisma menusu erisilebilir olur.
- Composer ve medya ikonlari sadece sohbet detay ekraninda kalir.
- Bottom nav, FAB'lar ve scroll alanlari mobil viewportlarda birbiriyle carpismaz.
- Telefon + mobil UI ikonlari tutarli, temiz ve WhatsApp Android hissine yakin gorunur.
- Sohbet geri butonu dark/light temada artefact veya okunurluk sorunu yaratmaz.
- Kullanici Sohbetler sekmesinden birden fazla sohbet olusturabilir, secebilir ve her sohbetin mesaj gecmisi korunur.
- Guncellemeler, Topluluklar ve Aramalar sekmeleri telefon ici bottom sheet ile duzenlenebilir.
- Ana sekme duzenlemeleri localStorage, export/import ve sahne kaydet/yukle akislarinda korunur.
- 360x800 ve 390x844 mobil viewportlarda edit sheet, menu, bottom nav ve FAB'lar pointer/overlap sorunu yaratmaz.
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
8. Docs-only roadmap guncellemelerinde `git diff -- ROADMAP5.md`, markdown baslik/anchor kontrolu ve `git diff --check` yeterlidir.
