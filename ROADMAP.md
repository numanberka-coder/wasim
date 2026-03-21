# 📱 WhatsApp Simülatörü — Yol Haritası

> **Proje Hedefi:** Sosyal medya içerik üretimi için olabildiğince gerçekçi bir WhatsApp görünümü elde etmek.

---

## 📋 İçindekiler

1. [Mevcut Durum](#mevcut-durum)
2. [Tamamlanan Fazlar](#tamamlanan-fazlar)
3. [Gelecek Fazlar](#gelecek-fazlar)
   - [Faz 11 — Light Mod](#-faz-11--light-mod)
   - [Faz 12 — Bubble Renk Ayarı](#-faz-12--bubble-renk-ayarı)
   - [Faz 13 — Tik Ayrımı](#-faz-13--tik-ayrımı)
   - [Faz 14 — Sahne Yönetimi](#-faz-14--sahne-yönetimi)
   - [Faz 15 — Senaryo Zenginleştirici](#-faz-15--senaryo-zenginleştirici)
   - [Faz 16 — Tab Öğreticileri](#-faz-16--tab-öğreticileri)
   - [Faz 17 — Autocomplete](#-faz-17--autocomplete)
   - [Faz 18 — Syntax Highlighting](#-faz-18--syntax-highlighting)
   - [Faz 19 — Mobil Komut Yardımı](#-faz-19--mobil-komut-yardımı)
4. [Öncelik Özeti](#öncelik-özeti)

---

## Mevcut Durum

Proje Faz 1–10 arası tamamlanmış durumda. Modüler dosya yapısı, state yönetimi, senaryo parser, oynatma motoru, 16 mesaj tipi, koşullu mesajlaşma, mobil altyapı, responsive düzen, 3 bağımsız tab (Senaryo / İnteraktif / Blok Builder), PNG export, sadece telefon modu ve header renk ayarı mevcut.

---

## Tamamlanan Fazlar

| Faz | Kapsam | Durum |
|---|---|---|
| **Faz 1** | Status bar, header, font, punch-hole kamera | ✅ |
| **Faz 2** | Balon kalitesi, gruplama, SVG kuyruk | ✅ |
| **Faz 3** | Wallpaper, telefon kasası, atmosfer | ✅ |
| **Faz 4** | Konum, döküman, sticker, link, viewonce | ✅ |
| **Faz 5** | Mesaj animasyonları, typing, ses oynatma | ✅ |
| **Faz 6** | PNG export, sadece telefon modu, ölçek kontrolü | ✅ |
| **Faz 7** | Koşullu mesajlaşma, interaktif mod | ✅ |
| **Faz 8** | Mobil altyapı, responsive, 3 nokta menü | ✅ |
| **Faz 9** | Mobil editör — buton bazlı, format uyumlu | ✅ |
| **Faz 10** | Header renk, mobil overlay ince ayar, 3 tab bağımsızlaştırma, Builder trigger desteği, floating toolbar | ✅ |
| **Faz 11** | Light mod — tema geçişi, light wallpaper, meta renk uyumu | ✅ |
| **Faz 12** | Bubble renk ayarı — giden/gelen balon renk özelleştirme | ✅ |
| **Faz 13** | Tik ayrımı — gönderildi/iletildi/okundu mesaj durumu kontrolü | ✅ |
| **Faz 14** | Sahne yönetimi — kaydet, yükle, sil, sahneler arası geçiş | ✅ |
| **Faz 15** | Senaryo zenginleştirici — araya ekleme, hızlı komut menüsü, insert modu | ✅ |
| **Faz 16** | Tab öğreticileri — collapsible rehberler, ilk açılış davranışı, 1-1 sohbet ipucu | ✅ |
| **Faz 17** | Autocomplete — @ komut tamamlama, kişi adı önerisi, parametre ipucu | ✅ |

---

## Gelecek Fazlar

---

### 🌗 Faz 11 — Light Mod
> *WhatsApp'ın beyaz teması — içerik üreticileri hedef kitleye göre ikisini de kullanır*

Tek butonla dark ↔ light geçiş. CSS variable swap ile tüm renkler değişir.

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 11.1 | **Light renk paleti** | Header `#008069`, beyaz balonlar, yeşilimsi giden balonlar, açık metin renkleri | 🔴 |
| 11.2 | **Tema geçiş butonu** | Grup Ayarları + action-bar'a toggle | 🔴 |
| 11.3 | **Light wallpaper** | Bej tonlu WhatsApp doodle pattern | 🟡 |
| 11.4 | **Hardcoded renk temizliği** | CSS'te variable'a bağlanmamış renkleri tarama | 🟡 |
| 11.5 | **Meta renk uyumu** | Saat, tik, day divider, sistem mesajı açık temada okunur olmalı | 🔴 |

**Etkilenen dosyalar:** `variables.css` · `phone.css` · `config.js` · `state.js` · `app.js` · `index.html`

---

### 🎨 Faz 12 — Bubble Renk Ayarı
> *Giden/gelen balon renklerini özelleştirme — dark mod içinde bile farklı tonlar*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 12.1 | **Giden balon rengi** | Color picker → `--wa-bubble-out` override | 🔴 |
| 12.2 | **Gelen balon rengi** | Color picker → `--wa-bubble-in` override | 🟡 |
| 12.3 | **Kuyruk renk senkronu** | Balon rengi değişince kuyruk SVG/border rengi de değişmeli | 🔴 |
| 12.4 | **Varsayılana dön** | Tek butonla orijinal renklere geri dön | 🟢 |

**Etkilenen dosyalar:** `phone.css` · `config.js` · `state.js` · `app.js` · `index.html`

**Not:** Light mod ile birlikte yapılırsa daha verimli — renk sistemi zaten variable tabanlıysa bubble rengi de kolayca geçer.

---

### ✅ Faz 13 — Tik Ayrımı
> *Gönderildi / İletildi / Okundu — mesaj durumu kontrolü*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 13.1 | **Tek gri tik** | Gönderildi durumu — SVG tek tik, gri renk | 🟡 |
| 13.2 | **Çift gri tik** | İletildi durumu — SVG çift tik, gri renk | 🟡 |
| 13.3 | **Çift mavi tik** | Okundu durumu — mevcut hali (varsayılan) | ✅ |
| 13.4 | **Senaryo syntax** | `@delivered`, `@read` gibi komutlarla mesaj bazlı kontrol | 🟡 |
| 13.5 | **Varsayılan durum** | Ayarlardan "tüm mesajlar okundu/iletildi/gönderildi" seçimi | 🟢 |

**Etkilenen dosyalar:** `messages.js` · `phone.css` · `script-parser.js` · `config.js`

---

### 🎬 Faz 14 — Sahne Yönetimi
> *Birden fazla senaryo kaydet, yükle, aralarında geç*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 14.1 | **Sahne kaydet** | Mevcut durumu isimli sahne olarak localStorage'a kaydet | 🔴 |
| 14.2 | **Sahne listesi** | Kaydedilmiş sahneleri listele, tıkla → yükle | 🔴 |
| 14.3 | **Sahne sil** | Listeden sahne kaldır | 🟡 |
| 14.4 | **Sahne adlandırma** | Kaydetme anında isim verme | 🟡 |
| 14.5 | **Hızlı geçiş** | Dropdown veya kısayol ile sahneler arası geçiş | 🟢 |

**Etkilenen dosyalar:** `storage.js` · `app.js` · `index.html` · `components.css`

**Not:** Mevcut JSON export/import zaten var, sahne yönetimi bunun üstüne inşa edilir.

---

### 🪄 Faz 15 — Senaryo Zenginleştirici
> *Düz metin yapıştır, satırlara tıklayarak interaktif komutlar ekle*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 15.1 | **Satır listesi görünümü** | Textarea içeriği satır bazlı listeye dökülür | 🔴 |
| 15.2 | **Satır context menü** | Bir satıra tıkla → "🎯 Trigger Ekle", "📷 Fotoğraf Ekle", "😂 Tepki Ver" | 🔴 |
| 15.3 | **Araya insert** | Yeni komut satırı seçilen satırın altına eklenir | 🔴 |
| 15.4 | **Mini form** | Seçime göre trigger kelimeleri, emoji, URL vs. formu açılır | 🟡 |
| 15.5 | **Arka plan syntax üretimi** | Eklenen komutlar otomatik senaryo formatına dönüşür | 🟡 |

**Etkilenen dosyalar:** `script-builder.js` · `index.html` · `components.css` · `responsive.css`

**Not:** Alternatif basit yol — Builder listesindeki her satırın yanına **"+"** butonu koymak. Mevcut form aynı şekilde çalışır, sadece "sonuna ekle" yerine "araya ekle" olur.

---

### 📖 Faz 16 — Tab Öğreticileri
> *Her tab'a collapsible "Nasıl Kullanılır?" rehberi*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 16.1 | **📝 Senaryo rehberi** | Syntax örnekleri, komut listesi, hız/jitter açıklaması | 🟡 |
| 16.2 | **🎮 İnteraktif rehberi** | Blok syntax'ı, trigger kuralları, adım adım akış | 🟡 |
| 16.3 | **🧩 Builder rehberi** | Trigger ayarları, satır ekleme, metne aktarma, oynatma akışı | 🟡 |
| 16.4 | **İlk açılış davranışı** | İlk ziyarette rehber açık, sonra hatırlar (localStorage) | 🟢 |
| 16.5 | **1-1 sohbet ipucu** | "Tek kişi ekle, grup adını kişi adı yap, alt başlığa 'son görülme' yaz" | 🟢 |

**Etkilenen dosyalar:** `index.html` · `components.css`

**Not:** Scope küçük — 3 tab'a birer collapsible callout/accordion. CSS altyapısı zaten mevcut.

---

### ⚡ Faz 17 — Autocomplete
> *Senaryo yazımını hızlandıran en etkili özellik*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 17.1 | **@ komut tamamlama** | `@` yazınca dropdown açılır: `@photo`, `@typing`, `@reaction`... | 🔴 |
| 17.2 | **Kişi adı tamamlama** | Satır başında `Ah` yazınca `Ahmet` önerisi | 🔴 |
| 17.3 | **Dropdown UI** | Textarea üzerinde konum bazlı popup, ok tuşları + Enter ile seç | 🟡 |
| 17.4 | **Parametre ipucu** | `@photo` seçilince: `@photo Kim "URL" "açıklama"` şeklinde ghost text | 🟢 |

**Etkilenen dosyalar:** `script-builder.js` · `index.html` · `components.css` · `responsive.css`

**Not:** Komut listesi ve kişi listesi zaten mevcut. Textarea'ya dropdown overlay bağlamak ana iş.

---

### 🎨 Faz 18 — Syntax Highlighting
> *Senaryo editöründe komutlar, kişi adları ve string'ler renkli*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 18.1 | **Renk şeması** | `@komut` kırmızı, `Kişi:` mavi, `"string"` yeşil, `#blok` turuncu | 🔴 |
| 18.2 | **Overlay tekniği** | Gerçek textarea şeffaf, arkasında renkli `<pre>` overlay | 🔴 |
| 18.3 | **Scroll senkronu** | Textarea ve overlay kaydırma eşleşmesi | 🟡 |
| 18.4 | **Performans** | Büyük senaryolarda debounce + requestAnimationFrame | 🟢 |

**Etkilenen dosyalar:** Yeni modül `js/ui/highlight.js` · `components.css` · `index.html`

**Not:** Teknik olarak en zor kısım overlay + textarea senkronu. Alternatif: `contenteditable` div — ama undo/redo ve cursor yönetimi karmaşık.

---

### 📋 Faz 19 — Mobil Komut Yardımı
> *Long-press ile kopyalama — mobilde senaryo yazımını kolaylaştırır*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 19.1 | **Long-press kopyalama** | Komut yardımı listesindeki her satıra uzun bas → clipboard'a kopyala | 🟡 |
| 19.2 | **"Kopyalandı!" toast** | Kopyalama sonrası kısa bildirim | 🟡 |
| 19.3 | **Tap highlight** | Kopyalanan satır kısa süre vurgulanır | 🟢 |

**Etkilenen dosyalar:** `mobile.js` · `index.html` · `components.css`

**Not:** Yarım saatlik iş. `navigator.clipboard.writeText()` + mevcut toast sistemi.

---

## Öncelik Özeti

| Faz | Kapsam | Zorluk | Etki |
|---|---|---|---|
| **Faz 11** | Light mod | 🔴 Büyük | ⭐⭐⭐⭐⭐ |
| **Faz 12** | Bubble renk ayarı | 🟡 Orta | ⭐⭐⭐ |
| **Faz 13** | Tik ayrımı | 🟡 Orta | ⭐⭐ |
| **Faz 14** | Sahne yönetimi | 🟡 Orta | ⭐⭐⭐ |
| **Faz 15** | Senaryo zenginleştirici | 🔴 Büyük | ⭐⭐⭐⭐ |
| **Faz 16** | Tab öğreticileri | 🟢 Küçük | ⭐⭐⭐⭐ |
| **Faz 17** | Autocomplete | 🟡 Orta | ⭐⭐⭐⭐⭐ |
| **Faz 18** | Syntax highlighting | 🔴 Büyük | ⭐⭐⭐⭐ |
| **Faz 19** | Mobil komut yardımı | 🟢 Küçük | ⭐⭐ |

---

> 💡 **Önerilen sıralama:**
> 1. **Faz 16** (Tab öğreticileri) — Küçük scope, kullanıcı deneyimini hemen iyileştirir
> 2. **Faz 19** (Mobil komut yardımı) — Küçük scope, mobil deneyimi tamamlar
> 3. **Faz 17** (Autocomplete) — Senaryo yazımında en büyük hız artışı
> 4. **Faz 12** (Bubble renk ayarı) — Light mod'a hazırlık, bağımsız değer
> 5. **Faz 11** (Light mod) — En büyük görsel etki, bubble renk altyapısıyla birlikte
> 6. **Faz 18** (Syntax highlighting) — Autocomplete ile birlikte editörü profesyonel seviyeye çıkarır
> 7. **Faz 13** (Tik ayrımı) — İnce detay ama gerçekçilik artırır
> 8. **Faz 14** (Sahne yönetimi) — Nice to have, JSON export zaten iş görüyor
> 9. **Faz 15** (Senaryo zenginleştirici) — En büyük scope, öğreticiler + autocomplete varsa ihtiyaç azalır
