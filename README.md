# WhatsApp Simulator

Tarayici tabanli WhatsApp simulatoru. Sosyal medya icerik uretimi, egitim, destek, satis ve topluluk senaryolari icin gercekci WhatsApp gorunumu saglar. Senaryo yazilir, telefon simulatorunde oynatilir ve PNG export alinabilir.

Son guncelleme: 2026-04-27  
Roadmap kapsami: Faz 27 sonrasi urunlesme, onboarding, kesfedilebilirlik ve kullanim kolayligi

## Kimler Icin?

- Kod bilmeden konusma senaryosu hazirlamak isteyen icerik ureticileri.
- Egitim, destek, satis veya topluluk akisini hizlica gostermek isteyen ekipler.
- Script tabanli akisi kullanabilen ama daha gorunur, yonlendirici ve guvenilir bir arayuz isteyen ileri kullanicilar.

## Mevcut Durum

Faz 1-26 tamamlandi. Proje production-ready gorsel kaliteye yakindir ve Faz 27 sonrasi yol haritasi urunlesme, onboarding ve kullanici basarisina odaklanir.

- Faz 22: Build Sistemi - Vite + ES modules gecisi, tek bundle.
- Faz 23: Test Altyapisi - Vitest + unit testler, CI entegrasyonu, coverage raporu.
- Faz 24: Performans - Message virtualization, rAF animasyon, CSS modulleme, lazy loading.
- Faz 25: Erisilebilirlik - WCAG AA uyumu, aria-label, heading hiyerarsisi, keyboard navigation.
- Faz 26: innerHTML Temizligi - DOM API gecisi ve XSS riskini azaltma.

## Ilk 5 Dakika Hedefi

Kullanicinin ilk oturumda su basariya ulasmasi hedeflenir:

1. Bir kisi eklemek.
2. Bir konusma satiri eklemek.
3. Senaryoyu oynatip sonucu telefonda gormek.

## Hizli Baslangic

### 1. Kisi Ekle

Konusmada yer alacak kisileri olusturun. Her kisi icin ad, gorsel kimlik ve mesaj yonu gibi temel bilgileri belirleyin.

Ornek:

- Ahmet: musteri
- Destek: isletme

### 2. Satir Ekle

Konusma akisina mesaj, yaziyor gostergesi veya bekleme gibi satirlar ekleyin.

Ornek script satirlari:

```text
Ahmet: Merhaba, siparisim nerede?
@typing Destek 800
Destek: Merhaba Ahmet, hemen kontrol ediyorum.
```

### 3. Oynat

Senaryoyu oynatin ve telefon onizlemesinde sonucu kontrol edin. Ilk basarili denemeden sonra PNG export veya daha gelismis uretim akislarina gecebilirsiniz.

## Dosya Haritasi

| Dosya | Sorumluluk |
|---|---|
| `index.html` | Ana giris noktasi ve uygulama kabugu. |
| `js/app.js` | Ana uygulama state'i ve koordinasyon. |
| `js/player.js` | Senaryo oynatma motoru. |
| `js/features/conditional-parser.js` | Interaktif mod parser mantigi. |
| `js/features/conditional-engine.js` | Trigger eslestirme motoru. |
| `js/features/script-builder.js` | Blok Builder UI ve script uretimi. |
| `js/features/autocomplete.js` | Senaryo editoru otomatik tamamlama. |
| `js/ui/highlight.js` | Syntax highlighting overlay motoru. |
| `js/ui/` | Header, mesaj render, status bar ve ortak UI parcalari. |
| `js/ui/virtual-scroller.js` | Message virtualization, IntersectionObserver tabanli gorunurluk yonetimi. |
| `css/phone.css` | Telefon simulatoru stilleri. |
| `css/variables.css` | Global CSS degiskenleri. |
| `css/responsive.css` | Mobil ve responsive layout. |
| `css/components.css` | Ortak UI bilesenleri. |
| `tasks/` | Plan, faz notlari ve lessons dosyalari. |
| `ROADMAP4.md` | Faz 28-35 urunlesme ve onboarding yol haritasi. |

## Nerede Ne Var?

- Urunlesme hedefleri ve faz sirasi: `ROADMAP4.md`
- Ilk kullanim rehberi: Bu README icindeki `Hizli Baslangic` bolumu
- Moduller ve sorumluluklar: Bu README icindeki `Dosya Haritasi` bolumu
- Yaygin script hatalari: Bu README icindeki `Sik Yapilan Hatalar` bolumu

## Script Soz Dizimi

Temel konusma satiri:

```text
Kisi: Mesaj metni
```

Yaziyor gostergesi:

```text
@typing Kisi sure_ms
```

Bekleme:

```text
@wait sure_ms
```

Ornek:

```text
Ahmet: Merhaba
@typing Destek 800
Destek: Size nasil yardimci olabilirim?
@wait 500
Ahmet: Siparisimi kontrol etmek istiyorum.
```

## Sik Yapilan Hatalar

| Yanlis | Dogru | Aciklama |
|---|---|---|
| `Ahmet Merhaba` | `Ahmet: Merhaba` | Mesaj satirinda kisi adindan sonra `:` kullanilmalidir. |
| `@typing 800 Ahmet` | `@typing Ahmet 800` | Yaziyor komutunda sira: komut, kisi, sure. |
| `@wait Ahmet 500` | `@wait 500` | Bekleme komutu kisi adi almaz, yalnizca sure alir. |
| `Destek:` | `Destek: Merhaba, nasil yardimci olabilirim?` | Bos mesaj kullaniciya anlamli sonuc uretmez. |

### Hata Kontrol Listesi

- Kisi adi daha once tanimlandi mi?
- Mesaj satirinda `Kisi: Mesaj` bicimi kullanildi mi?
- Komutlarda sure milisaniye olarak yazildi mi?
- `@typing` satirinda kisi adi ve sure dogru sirada mi?

## Calisma Kurallari

- UI metinleri ve yorumlar Turkce, teknik terimler Ingilizce olabilir.
- Onay almadan implementasyona baslama; once plan sun.
- Her fazi zip olarak arsivle.
- Toast bildirimi ekleme; ekran kaydi gercekciligini bozabilir.

## Faz 28 Kapsami

Bu README, ROADMAP4 icindeki Faz 28 maddelerini karsilamak icin guncellendi:

- 28.1 README dosya haritasini gercek modul adlariyla guncelleme.
- 28.2 Hizli baslangic bolumu ekleme.
- 28.3 Kapsam, hedef kullanici ve son guncelleme netligi.
- 28.4 Sik yapilan hatalar bolumu.

## Sonraki Fazlar

1. Faz 29: Onboarding ve Basit/Pro mod.
2. Faz 30: Sablon galerisi ve tek tik demo.
3. Faz 31: Script yazmadan uretim akisini one alma.
4. Faz 32: Cozum odakli hata geri bildirimi.
