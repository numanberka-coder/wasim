# 📱 WhatsApp Simülatörü — Görsel Gerçekçilik Yol Haritası

> **Proje Hedefi:** Sosyal medya içerik üretimi için olabildiğince gerçekçi bir WhatsApp görünümü elde etmek.

---

## 📋 İçindekiler

1. [Mevcut Durum Analizi](#mevcut-durum-analizi)
2. [Tespit Edilen Sorunlar](#tespit-edilen-sorunlar)
3. [Yol Haritası](#yol-haritası)
   - [Faz 1 — Temel Görsel Doğruluk](#-faz-1--temel-görsel-doğruluk)
   - [Faz 2 — Mesaj Balonu Kalitesi](#-faz-2--mesaj-balonu-kalitesi)
   - [Faz 3 — Wallpaper & Atmosfer](#-faz-3--wallpaper--atmosfer)
   - [Faz 4 — Medya & Özel Mesaj Tipleri](#-faz-4--medya--özel-mesaj-tipleri)
   - [Faz 5 — Animasyon & Canlılık](#-faz-5--animasyon--canlılık)
   - [Faz 6 — Export & Prodüksiyon](#-faz-6--export--prodüksiyon)
   - [Faz 7 — Koşullu Mesajlaşma](#-faz-7--koşullu-mesajlaşma)
   - [Faz 8 — Mobil Altyapı & Responsive](#-faz-8--mobil-altyapı--responsive)
   - [Faz 9 — Mobil Editör](#-faz-9--mobil-editör)
4. [Öncelik Özeti](#öncelik-özeti)

---

## Mevcut Durum Analizi

Proje; modüler dosya yapısı (`src/`), build scripti (`build.sh`), state yönetimi, senaryo parser, oynatma motoru ve temel mesaj tipleri (metin, fotoğraf, gif, video, ses) gibi sağlam bir altyapıya sahip. Görsel olarak doğru yönde ancak birkaç kritik detay gerçekçiliği zedeliyor.

---

## Tespit Edilen Sorunlar

### 🔴 Kritik — İlk Bakışta Fark Edilir

| # | Sorun | Açıklama |
|---|---|---|
| K1 | **Status Bar ikonları yanlış** | Mobil sinyal ikonu yerine WiFi çubukları kullanılmış; operatör adı ve 5G/4G göstergesi yok |
| K2 | **Header'da arama ikonları eksik** | Gerçek WhatsApp'ta 📹 video ve 📞 sesli arama ikonları var, simülatörde yok |
| K3 | **Ardışık mesajlar gerçekçi değil** | Aynı kişiden arka arkaya gelen mesajlarda her birinde avatar gösteriliyor; gerçekte sadece son mesajda görünür ve köşe radiusları değişir |
| K4 | **Balon kuyruğu (tail) köşeli** | CSS `border-trick` kullanımı kırık/köşeli görünüme neden oluyor; gerçek WhatsApp SVG tabanlı yumuşak kuyruk kullanır |

### 🟡 Önemli — Dikkatli Bakıldığında Fark Edilir

| # | Sorun | Açıklama |
|---|---|---|
| O1 | **Punch-hole kamera yok** | `160px × 30px` geniş notch yerine modern Android'lerde küçük yuvarlak delik var |
| O2 | **Alt Home Indicator yok** | Modern telefonlarda ekran altındaki ince beyaz çizgi hiç gösterilmiyor |
| O3 | **Çift tik (✓✓) gerçek değil** | Text/CSS ile simüle ediliyor; gerçek WhatsApp tik oranı ve kalınlığı farklı |
| O4 | **Giden balon rengi eski** | `#075e54 → #055245` gradient eski WhatsApp rengi; güncel dark mod `#005c4b` düz renk |

### 🟢 İnce Detaylar — Fotoğraf Çekiminde Fark Yaratır

| # | Sorun | Açıklama |
|---|---|---|
| D1 | **Roboto font eksik** | `-apple-system` kullanılıyor; Android hissi için Roboto şart |
| D2 | **Wallpaper pattern sade** | Gerçek WhatsApp dark mod wallpaper subtle texture barındırır |
| D3 | **Güvenli alan (safe-area) yok** | `env(safe-area-inset-bottom)` eklenmesi iOS görünümü için gerekli |
| D4 | **Mesaj saat + tik pozisyonu** | Metin üzerine yatarak entegre olması gerekir |

---

## Yol Haritası

---

### 🔴 Faz 1 — Temel Görsel Doğruluk
> *"İlk bakışta WhatsApp mı bu?" sorusunun cevabı evet olmalı*

| # | İyileştirme | Etkilenen Dosyalar | Öncelik |
|---|---|---|---|
| 1.1 | **Status Bar** — Sinyal çubukları, 5G/4G göstergesi, operatör adı eklenmesi | `phone.css` · `statusbar.js` · `body.html` | 🔴 |
| 1.2 | **Header ikonları** — Video 📹 ve sesli arama 📞 SVG ikonları | `body.html` · `phone.css` | 🔴 |
| 1.3 | **Punch-hole kamera** — Geniş dikdörtgen notch → küçük yuvarlak delik | `phone.css` | 🔴 |
| 1.4 | **Alt Home Indicator** — Ekran altı beyaz ince çizgi | `phone.css` · `body.html` | 🟡 |
| 1.5 | **Roboto font** — Google Fonts CDN üzerinden yükleme | `variables.css` | 🟡 |

**Beklenen sonuç:** Yan yana koyulduğunda gerçek WhatsApp ekran görüntüsüyle karıştırılabilir.

---

### 🟠 Faz 2 — Mesaj Balonu Kalitesi
> *En çok ekran görüntüsüne giren alan — en yüksek görsel etki*

| # | İyileştirme | Etkilenen Dosyalar | Öncelik |
|---|---|---|---|
| 2.1 | **Ardışık mesaj gruplama** — Aynı kişinin art arda mesajlarında avatar sadece sonda, köşe radius dinamik | `messages.js` · `phone.css` | 🔴 |
| 2.2 | **SVG Balon Kuyruğu** — CSS border trick → yumuşak, gerçekçi WhatsApp kuyruğu | `phone.css` | 🔴 |
| 2.3 | **Giden balon rengi** — Güncel dark mod rengi `#005c4b` (gradient kaldırılır) | `variables.css` · `phone.css` | 🟡 |
| 2.4 | **Çift Tik SVG** — Text/CSS → gerçek WhatsApp oranlarında tik ikonu | `phone.css` · `messages.js` | 🟡 |
| 2.5 | **Mesaj meta pozisyonu** — Saat + tik'in balon içine entegre, metin üzerine yatması | `phone.css` | 🟢 |

**Beklenen sonuç:** Balonlar pixel-perfect WhatsApp hissini verir.

---

### 🟡 Faz 3 — Wallpaper & Atmosfer
> *Arka planın "doğru hissettirmesi"*

| # | İyileştirme | Etkilenen Dosyalar | Öncelik |
|---|---|---|---|
| 3.1 | **Dark mod wallpaper** — Gerçek WhatsApp texture pattern (SVG tabanlı, subtle) | `config.js` · `wallpaper.js` | 🟡 |
| 3.2 | **Telefon kasası detayları** — Yan tuş kabartıları, gölge derinliği, cam yansıma efekti | `phone.css` | 🟡 |
| 3.3 | **Güvenli alan (safe-area)** — `env(safe-area-inset-bottom)` iOS uyumu | `phone.css` | 🟡 |
| 3.4 | **Day divider stili ince ayarı** — Köşe radius + arka plan opaklık kalibrasyonu | `phone.css` | 🟢 |

**Beklenen sonuç:** Ekranın tamamı WhatsApp uygulamasından alınmış gibi durur.

---

### 🟢 Faz 4 — Medya & Özel Mesaj Tipleri
> *İçerik zenginliği ve senaryo çeşitliliği*

| # | İyileştirme | Etkilenen Dosyalar | Öncelik |
|---|---|---|---|
| 4.1 | **Konum mesajı** — Harita önizleme kartı (yer adı + koordinat görünümü) | `messages.js` · `phone.css` | 🟡 |
| 4.2 | **Döküman mesajı** — PDF/dosya kartı (dosya ikonu + isim + boyut) | `messages.js` · `phone.css` | 🟡 |
| 4.3 | **Sticker mesajı** — Şeffaf arka plan, balon çerçevesi yok | `messages.js` · `phone.css` | 🟢 |
| 4.4 | **Link önizleme** — URL içeren mesajlarda sayfa başlığı + thumbnail kartı | `messages.js` · `phone.css` | 🟢 |
| 4.5 | **Bir kez görüntüle** — 👁️ simgeli özel medya balonu | `messages.js` · `phone.css` | 🟢 |

**Beklenen sonuç:** Gerçek konuşmalarda karşılaşılan tüm mesaj tipleri karşılanır.

---

### 🔵 Faz 5 — Animasyon & Canlılık
> *Video kayıtları ve ekran hareketleri için*

| # | İyileştirme | Etkilenen Dosyalar | Öncelik |
|---|---|---|---|
| 5.1 | **Mesaj giriş animasyonu** — Mevcut `msgPop`'u yön bazlı hale getirme (gelen soldan, giden sağdan) | `phone.css` | 🟡 |
| 5.2 | **Yazıyor indikatörü** — Kişi başına ayrı, oynatma sırasında dinamik göster/gizle | `messages.js` · `player.js` | 🟡 |
| 5.3 | **Sesli mesaj simülasyonu** — Oynatma animasyonu, ilerleme çubuğu hareketi | `messages.js` · `phone.css` | 🟢 |
| 5.4 | **Reaction micro-animasyon** — Emoji ekleme/kaldırma sırasında scale + fade | `phone.css` | 🟢 |

**Beklenen sonuç:** Ekran kayıtları canlı ve akışkan görünür.

---

### ⚫ Faz 6 — Export & Prodüksiyon
> *İçerik üretim iş akışını hızlandırmak*

| # | İyileştirme | Etkilenen Dosyalar | Öncelik |
|---|---|---|---|
| 6.1 | **PNG Export** — `html2canvas` ile tek tıkla yüksek kaliteli ekran görüntüsü | `app.js` · `body.html` | 🔴 |
| 6.2 | **Sadece telefon modu** — Sol panel gizlenir, sadece telefon ekranda kalır | `app.js` · `phone.css` | 🔴 |
| 6.3 | **Ölçek kontrolü** — `%75 / %100 / %125` export boyutu seçeneği | `app.js` | 🟡 |
| 6.4 | **Senaryo JSON import/export** — Hazır senaryoları kaydet ve paylaş | `app.js` · `storage.js` | 🟡 |

**Beklenen sonuç:** Senaryo → export süreci tek tıka iner.

---

### 🟣 Faz 7 — Koşullu Mesajlaşma
> *"Kullanıcı bir şey yazdığında karakter otomatik cevap versin"*

Simülatöre interaktif bir katman ekler: kullanıcı belirli bir anahtar kelime/cümle gönderdiğinde, o tetikleyiciye bağlı önceden yazılmış bir mesaj bloğu otomatik oynatılır. Sosyal medya içerik üretimini etkileşimli demo formatına taşır.

#### Syntax Tasarımı

```
#blok_adi
trigger: kelime1, kelime2, hey
---
Ahmet | 14:02 | Merhaba! Nasıl yardımcı olabilirim?
Ahmet | 14:03 | @photo https://örnek.com/resim.jpg

#default
trigger: *
---
Ahmet | 14:05 | Bunu anlayamadım, tekrar yazar mısın?
```

**Kurallar:**
- `#blok_adi` — blok tanımlayıcısı, benzersiz olmalı
- `trigger:` — virgülle ayrılmış tetikleyici listesi; birden fazla trigger aynı bloğa bağlanabilir
- `trigger: *` — varsayılan blok; hiçbir trigger eşleşmezse bu oynatılır
- `---` — trigger tanımı ile mesaj içeriği arasındaki ayraç
- Blok içinde tüm mesaj tipleri desteklenir (`@photo`, `@voice`, `@gif`, `@location` vb.)
- Büyük/küçük harf duyarsız eşleştirme

| # | İyileştirme | Etkilenen Dosyalar | Öncelik |
|---|---|---|---|
| 7.1 | **Blok parser** — `#blok`, `trigger:`, `---` syntax'ını parse eden modül | `parser.js` | 🔴 |
| 7.2 | **Trigger eşleştirme motoru** — Kullanıcı girdisini trigger listesiyle karşılaştırma (fuzzy değil, exact + case-insensitive) | `engine.js` | 🔴 |
| 7.3 | **Çoklu trigger desteği** — Birden fazla keyword aynı bloğa yönlendirebilsin | `parser.js` · `engine.js` | 🔴 |
| 7.4 | **Default blok** — Eşleşme yoksa `trigger: *` bloğunu otomatik oynat | `engine.js` | 🟡 |
| 7.5 | **Medya komutları blok içinde** — `@photo`, `@voice`, `@gif` vb. blok içinde de çalışsın | `messages.js` · `engine.js` | 🟡 |
| 7.6 | **Kullanıcı girdi arayüzü** — Telefon alt kısmında WhatsApp tarzı input alanı; sadece interaktif modda görünür | `body.html` · `phone.css` | 🔴 |
| 7.7 | **Mod geçişi** — Normal senaryo modu ↔ interaktif mod arası geçiş | `app.js` · `body.html` | 🟡 |

**Beklenen sonuç:** Kullanıcı tetikleyici kelimeyi yazınca karakter gerçek zamanlı cevap verir; demo ve içerik üretimi için güçlü bir etkileşim katmanı oluşur.

---

### 🔵 Faz 8 — Mobil Altyapı & Responsive
> *"Proje mobil tarayıcıda açılır açılmaz düzgün görünsün ve çalışsın"*

Sol panel kaldırılır, tüm kontroller 3 nokta dropdown menüsüne taşınır. Telefon simülatörü ekrana sığacak şekilde otomatik ölçeklenir. Masaüstü editörü mobilde ayrı bir view olarak açılır — textarea korunur ama mobil için optimize edilir.

| # | İyileştirme | Etkilenen Dosyalar | Öncelik |
|---|---|---|---|
| 8.1 | **Responsive layout** — Mobilde sol panel kalkar, telefon simülatörü tam ekran olur | `css/responsive.css` · `css/layout.css` | 🔴 |
| 8.2 | **3 nokta dropdown menü** — Senaryo editörü, karakter yönetimi, ayarlar, export, oynat/durdur/sıfırla | `js/ui/` · `css/components.css` | 🔴 |
| 8.3 | **Telefon önizleme ölçekleme** — Simülatör viewport'a sığacak şekilde otomatik `scale` | `css/phone.css` · `css/responsive.css` | 🔴 |
| 8.4 | **Senaryo editörü view geçişi** — 3 noktadan "Senaryo Editörü" seçilince ayrı view açılır, geri butonu ile dönülür | `js/app.js` · `css/responsive.css` | 🔴 |
| 8.5 | **Sanal klavye yönetimi** — Klavye açılınca layout kayması önlenir (`dvh` birimi, `visualViewport` API) | `css/responsive.css` · `js/app.js` | 🟡 |
| 8.6 | **iOS safe-area uyumu** — `env(safe-area-inset-*)` tüm kenarlarda uygulanır | `css/responsive.css` | 🟡 |
| 8.7 | **Touch-friendly dokunma hedefleri** — Buton ve kontrollerin minimum 44px dokunma alanı | `css/components.css` · `css/responsive.css` | 🟡 |

**Beklenen sonuç:** Proje mobil tarayıcıda açılınca telefon simülatörü ekrana oturur, tüm kontrollere 3 nokta menüsünden erişilir, senaryo yazılıp export alınabilir.

---

### 🟣 Faz 9 — Mobil Editör
> *"Textarea yerine mobil doğasına uygun, buton bazlı bir editör"*

Masaüstündeki textarea editörü mobilde kullanışsızdır. Faz 9 bu sorunu kökten çözer: buton bazlı, form odaklı, mevcut senaryo formatıyla tam uyumlu yeni bir editör arayüzü inşa edilir. Arka planda üretilen metin masaüstüyle birebir aynıdır — iki platform arasında senaryo taşınabilir.

| # | İyileştirme | Etkilenen Dosyalar | Öncelik |
|---|---|---|---|
| 9.1 | **Mesaj ekle formu** — Kişi seçici + mesaj textarea + gönder; arka planda `Kişi: Mesaj` satırı üretir | `js/features/mobile-editor.js` · `css/responsive.css` | 🔴 |
| 9.2 | **Komut seçici** — `@typing`, `@photo`, `@voice`, `@reaction` vb. butonlarla parametreli satır ekler | `js/features/mobile-editor.js` | 🔴 |
| 9.3 | **Satır listesi** — Mevcut senaryo satırları listede görünür; kaydırarak gez, sil, yukarı/aşağı taşı | `js/features/mobile-editor.js` · `css/responsive.css` | 🔴 |
| 9.4 | **Hazır şablonlar** — Tek dokunuşla sık kullanılan satır blokları ekler | `js/config.js` · `js/features/mobile-editor.js` | 🟡 |
| 9.5 | **Format uyumu** — Mobil editörün ürettiği metin masaüstü parser'ıyla birebir uyumlu | `js/features/mobile-editor.js` | 🔴 |
| 9.6 | **Senkronizasyon** — Masaüstü textarea ↔ mobil liste anlık senkron | `js/app.js` · `js/features/mobile-editor.js` | 🟡 |

**Beklenen sonuç:** Mobil kullanıcı textarea görmez; form ve butonlarla senaryo kurar, masaüstüyle aynı kalitede çıktı üretir.

---

## Öncelik Özeti

| Faz | Kapsam | Görsel Etki | Durum |
|---|---|---|---|
| **Faz 1** | Status bar, header, font, kamera | ⭐⭐⭐⭐⭐ | ✅ Tamamlandı |
| **Faz 2** | Balon kalitesi, gruplama, kuyruk | ⭐⭐⭐⭐⭐ | ✅ Tamamlandı |
| **Faz 3** | Atmosfer, wallpaper, kasa | ⭐⭐⭐⭐ | ✅ Tamamlandı |
| **Faz 4** | Medya ve mesaj tipleri | ⭐⭐⭐ | ✅ Tamamlandı |
| **Faz 5** | Animasyon ve canlılık | ⭐⭐⭐ | ✅ Tamamlandı |
| **Faz 6** | Export ve prodüksiyon | ⭐⭐⭐⭐ | ✅ Tamamlandı |
| **Faz 7** | Koşullu mesajlaşma, interaktif mod | ⭐⭐⭐⭐⭐ | ✅ Tamamlandı |
| **Faz 8** | Mobil altyapı, responsive, 3 nokta menü | ⭐⭐⭐⭐ | 🟥 Başlanmadı |
| **Faz 9** | Mobil editör — buton bazlı, format uyumlu | ⭐⭐⭐⭐ | 🟥 Başlanmadı |

---

> 💡 **Not:** Faz 1–7 tamamlandı. Faz 8 projeyi mobil tarayıcıda kullanılabilir hale getirir. Faz 9 mobil deneyimi masaüstüyle eşit seviyeye taşır — senaryo üretimi artık cihazdan bağımsız olur.# wasim
