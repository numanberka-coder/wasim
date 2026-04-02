# 🎨 WhatsApp Simülatörü — UX İyileştirme Yol Haritası (ROADMAP 3)

> **Başlangıç:** 2026-04-02
> **Kapsam:** Faz 20–26 tamamlanmış proje üzerinde kullanıcı deneyimi ve arayüz iyileştirmeleri
> **Hedef:** Kullanıcı testlerinde ortaya çıkan UX sorunlarını çözmek — sezgisel, kolay öğrenilebilir arayüz

---

## 📋 İçindekiler

1. [Mevcut Durum](#mevcut-durum)
2. [Faz 27 — Grup Tabı Yeniden Yapılandırma](#-faz-27--grup-tabı-yeniden-yapılandırma)
3. [Öncelik Özeti](#öncelik-özeti)

---

## Mevcut Durum

Proje 26 faz boyunca hem özellik hem de teknik kalite açısından olgunlaşmış durumda. Ancak kullanıcı testlerinde sol panel ve senaryo syntax'ı anlaşılmaz bulundu. Blok Builder, Senaryo tabının bir alt tab'ı olarak gizli kalıyor ve yeni kullanıcılar onu keşfedemiyor. Bu yol haritası, arayüzü daha sezgisel hale getirmeye odaklanır.

| Alan | Mevcut Not | Hedef |
|------|-----------|-------|
| Sol Panel UX | C (Blok Builder gizli, 3 iç tab kafa karıştırıcı) | A- (kişi bazlı sezgisel ekleme) |
| Keşfedilebilirlik | D (yeni kullanıcı ne yapacağını bilemiyor) | B+ (tıkla → ekle → oynat akışı) |
| Senaryo Erişimi | B (mevcut ama gizli) | A- (banner ile yönlendirme) |

---

## 🧩 Faz 27 — Grup Tabı Yeniden Yapılandırma
> *Blok Builder'ı kişi bazlı sezgisel arayüze dönüştür*

**Neden?** Kullanıcı testlerinde sol panel ve senaryo syntax'ı anlaşılmaz bulundu. Blok Builder gizli kalıyor. Kişi kartına tıklayarak mesaj ekleme, çok daha doğal bir akış.

### 27.1 — Tab Yeniden Düzenleme

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 27.1.1 | **Senaryo iç tab'ından Blok Builder kaldırılır** | `index.html` — `.script-tab[data-stab="tabBuilder"]` butonu + `#tabBuilder` paneli silinir | 🔴 |
| 27.1.2 | **İç tab doğrulaması** | Senaryo + İnteraktif olarak 2 iç tab kalır, JS mantığı korunur | 🔴 |

**Etkilenen dosyalar:** `index.html` · `js/features/script-builder.js`

### 27.2 — Grup Tabı: Kişi Bazlı Satır Ekleme

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 27.2.1 | **Kişi kartı tıklama → inline expand** | Kişi kartına tıklanınca altında accordion-style panel açılır. Aynı anda sadece bir kart açık. CSS `max-height` transition. | 🔴 |
| 27.2.2 | **Mesaj tipi chip grubu** | Inline panelde 16 tip butonu: Mesaj, Yanıt, Fotoğraf, GIF, Video, Ses, Konum, Döküman, Sticker, Link, Bir Kez, Yazıyor, Tepki, Sistem, Katılma, Ayrılma | 🔴 |
| 27.2.3 | **"Kim" alanı** | Tıklanan kişi otomatik seçili, dropdown ile değiştirilebilir | 🔴 |
| 27.2.4 | **"Metin" alanı** | Textarea, tipe göre placeholder değişir; typing gibi tiplerde gizlenir | 🔴 |
| 27.2.5 | **"Satır Ekle" butonu** | Tıklanınca satır aşağıdaki Satır Listesine eklenir, panel kapanır | 🔴 |

**Etkilenen dosyalar:** `js/features/people.js` · `js/features/script-builder.js` (export edilecek fonksiyonlar) · `css/panels.css`

### 27.3 — Satır Listesi

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 27.3.1 | **Grup tabına "Satır Sırası" accordion ekleme** | `#group` paneline yeni accordion: `#groupBuilderList` | 🔴 |
| 27.3.2 | **Mevcut satır listesi mantığını taşıma** | `blocks[]`, `renderBlocks()`, drag-drop, `+`/`✖` butonları — hedef element güncellenir | 🔴 |
| 27.3.3 | **"Metne Aktar" + "Oynat" butonları** | Satır listesinin altına taşınır, Senaryo textarea'sına yazar | 🟡 |

**Etkilenen dosyalar:** `index.html` · `js/features/script-builder.js`

### 27.4 — Eski Blok Builder Temizliği

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 27.4.1 | **Builder HTML temizliği** | `#tabBuilder` paneli + iç tab butonu tamamen silinir | 🔴 |
| 27.4.2 | **Builder JS temizliği** | `setupBuilder()` içindeki Builder-only event listener'lar, `#builderScriptBox` referansları kaldırılır | 🔴 |
| 27.4.3 | **Aktar hedefi güncelleme** | `pushBlocksToBuilderTextarea()` → Senaryo textarea'sına (`#scriptBox`) yazar | 🟡 |

**Etkilenen dosyalar:** `index.html` · `js/features/script-builder.js`

### 27.5 — Senaryo Editörüne Yönlendirme Banner'ı

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 27.5.1 | **Banner ekleme** | Satır Listesi accordion'unun altına: `💡 Daha fazla kontrol için → Senaryo Editörü` | 🟢 |
| 27.5.2 | **Tıklama aksiyonu** | Tıklanınca `switchTab('script')` çağrılır | 🟢 |
| 27.5.3 | **Stil** | Muted renk, küçük font, dikkat dağıtmayan | 🟢 |

**Etkilenen dosyalar:** `index.html` · `css/panels.css`

---

## Dosya Etki Matrisi

| Dosya | Değişiklik Tipi |
|-------|----------------|
| `index.html` | Builder HTML silinir, Grup paneline satır listesi + banner eklenir, iç tab butonu silinir |
| `js/features/script-builder.js` | Refactor: builder mantığı export edilir, hedefler güncellenir, builder-only kod temizlenir |
| `js/features/people.js` | Kişi kartı tıklama → inline expand panel eklenir |
| `css/panels.css` | Inline expand panel + banner CSS |
| `js/ui/tabs.js` | Değişiklik yok (mevcut `switchTab()` kullanılır) |

---

## Uygulama Sırası

1. **27.4** → Eski Blok Builder temizliği (HTML + JS)
2. **27.1** → Tab doğrulama (iç tab butonu silindikten sonra)
3. **27.3** → Satır Listesini Grup tabına taşıma
4. **27.2** → Kişi bazlı inline satır ekleme (asıl yeni özellik)
5. **27.5** → Senaryo yönlendirme banner'ı

---

## Teknik Notlar

- Mevcut senaryo parser'ına (`script-parser.js`) **dokunulmaz** — Grup tabının ürettiği satırlar aynı formatı kullanır
- `buildLineFromForm()` DOM element'lerine doğrudan erişiyor — inline panele taşırken parametre bazlı hale getirilmeli
- Kişi kartı inline expand için CSS transition kullanılır, harici kütüphane eklenmez
- UI metinleri Türkçe, teknik terimler İngilizce

---

## Öncelik Özeti

| Faz | Kapsam | Zorluk | Etki | Bağımlılık |
|-----|--------|--------|------|------------|
| **Faz 27** | Grup Tabı Yeniden Yapılandırma | 🟡 Orta-Büyük | ⭐⭐⭐⭐⭐ | Faz 20–26 tamamlanmış olmalı |

---

> 📝 **Not:** Bu yol haritası UX iyileştirmelerine odaklanır. Yeni fazlar kullanıcı testleri ve geri bildirimler doğrultusunda eklenecektir.
