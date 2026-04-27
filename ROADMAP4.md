# 🚀 WhatsApp Simülatörü — Product & Onboarding Yol Haritası (ROADMAP 4)

> **Başlangıç:** 2026-04-27  
> **Kapsam:** Faz 27 sonrası ürünleşme, onboarding, keşfedilebilirlik ve kullanım kolaylığı  
> **Hedef:** Kod bilmeyen kullanıcıların ilk 5 dakikada başarıya ulaşması + mevcut güçlü özelliklerin daha görünür ve kullanılabilir hale gelmesi

---

## 📋 İçindekiler

1. [Mevcut Durum](#mevcut-durum)
2. [Faz 28 — Dokümantasyon & Güven](#-faz-28--dokümantasyon--güven)
3. [Faz 29 — Onboarding & Basit Mod](#-faz-29--onboarding--basit-mod)
4. [Faz 30 — Şablon Galerisi & Tek Tık Demo](#-faz-30--şablon-galerisi--tek-tık-demo)
5. [Faz 31 — Script Yazmadan Üretim Akışı](#-faz-31--script-yazmadan-üretim-akışı)
6. [Faz 32 — Hata Mesajları & Yardımcı Geri Bildirim](#-faz-32--hata-mesajları--yardımcı-geri-bildirim)
7. [Faz 33 — Sahne Yönetimi UX İyileştirmeleri](#-faz-33--sahne-yönetimi-ux-iyileştirmeleri)
8. [Faz 34 — Ölçümleme (Analytics) & Karar Desteği](#-faz-34--ölçümleme-analytics--karar-desteği)
9. [Faz 35 — İnteraktif Mod Akıllı Eşleştirme (Opsiyonel)](#-faz-35--i̇nteraktif-mod-akıllı-eşleştirme-opsiyonel)
10. [Öncelik Özeti](#öncelik-özeti)
11. [Uygulama Sırası](#uygulama-sırası)

---

## Mevcut Durum

Proje teknik açıdan olgun: modüler mimari, test altyapısı, performans optimizasyonları ve zengin özellik seti mevcut. Ancak kullanıcı deneyimi tarafında özellikle teknik bilgisi olmayan kullanıcılar için öğrenme eğrisi hâlâ yüksek. Bu roadmap, yeni özellikten çok **ürünü daha sezgisel ve hızlı öğrenilebilir** hale getirmeyi amaçlar.

| Alan | Mevcut Not | Hedef |
|---|---|---|
| İlk Kullanım Deneyimi | C | A- |
| Keşfedilebilirlik | C- | A- |
| Dokümantasyon Tutarlılığı | C | A |
| Script Yazmadan Üretim | B- | A |
| Hata Geri Bildirimi | C | A- |
| Ürün Karar Verisi | D | B+ |

---

## 🧾 Faz 28 — Dokümantasyon & Güven
> *Kullanıcı ilk temasta “bu proje düzenli ve güvenilir” hissini almalı*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 28.1 | **README dosya haritasını güncelleme** | Kod tabanındaki gerçek modül adları ve yolları ile birebir eşleme | 🔴 |
| 28.2 | **README hızlı başlangıç bölümü** | “3 adımda ilk senaryo” (kişi ekle → satır ekle → oynat) | 🔴 |
| 28.3 | **Kapsam + sürüm notu netliği** | “Kimler için?” + “Nerede ne var?” + son güncelleme tarihi | 🟡 |
| 28.4 | **Sık yapılan hatalar bölümü** | Script sözdizimi örnekleri, yanlış/doğru kullanım karşılaştırması | 🟡 |

**Etkilenen dosyalar:** `README.md`

---

## 🧭 Faz 29 — Onboarding & Basit Mod
> *Teknik olmayan kullanıcı için ilk 5 dakika kritik*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 29.1 | **Açılış onboarding akışı** | 3 adımlı mini rehber (overlay veya guided tooltip) | 🔴 |
| 29.2 | **Basit Mod / Pro Mod anahtarı** | Basit modda yalnızca temel kontroller görünür | 🔴 |
| 29.3 | **İlk başarı hedefi** | “İlk mesajı oynat” ve “ilk ekran görüntüsünü al” görevleri | 🟡 |
| 29.4 | **Onboarding tekrar açma** | Ayarlardan “rehberi tekrar göster” seçeneği | 🟢 |

**Etkilenen dosyalar:** `index.html` · `js/app.js` · `js/ui/forms.js` · `css/components.css`

---

## 🧩 Faz 30 — Şablon Galerisi & Tek Tık Demo
> *Boş ekran korkusunu kaldır, kullanıcıyı başarıya hızlı taşı*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 30.1 | **Hazır Senaryo Galerisi** | Kart yapısı: E-ticaret, Destek, Eğitim, Sohbet, Topluluk | 🔴 |
| 30.2 | **Tek tıkla yükle + oynat** | Kullanıcı tek aksiyonla sonucu görsün | 🔴 |
| 30.3 | **Şablon açıklamaları** | “Bu şablon ne üretir?” kısa açıklama + zorluk seviyesi | 🟡 |
| 30.4 | **Favori şablonlar** | Kullanıcının en sık kullandığı şablonları sabitleme | 🟢 |

**Etkilenen dosyalar:** `js/config.js` · `index.html` · `js/features/script-builder.js` · `css/panels.css`

---

## 🧱 Faz 31 — Script Yazmadan Üretim Akışı
> *Form tabanlı içerik üretimi varsayılan akışa taşınır*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 31.1 | **Satır Sırası bölümünü öne alma** | Grup panelinde daha görünür konum + açıklama metni | 🔴 |
| 31.2 | **Hızlı satır ekleme** | Kişi kartından direkt mesaj tipi seçip satır ekleme | 🔴 |
| 31.3 | **Canlı önizleme ipuçları** | Eklenen satırın telefona etkisini anında gösteren mikro yönlendirme | 🟡 |
| 31.4 | **Toplu senaryoya aktarma iyileştirmesi** | “Aktar + Oynat” birleşik hızlı aksiyon | 🟢 |

**Etkilenen dosyalar:** `index.html` · `js/features/people.js` · `js/features/script-builder.js` · `css/panels.css`

---

## 🛟 Faz 32 — Hata Mesajları & Yardımcı Geri Bildirim
> *Hata metni değil, çözüm önerisi göster*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 32.1 | **Satır bazlı parse hatası gösterimi** | Hatalı satırı işaretle, neden + nasıl düzeltilir göster | 🔴 |
| 32.2 | **Örnek düzeltme önerisi** | Örn: `@typing Ahmet 800` formatını otomatik öner | 🔴 |
| 32.3 | **Yumuşak doğrulama** | Kritik olmayan hatalarda oynatmayı tamamen engelleme | 🟡 |
| 32.4 | **Yardım paneli bağlantısı** | Hata türüne göre ilgili yardım bölümüne yönlendirme | 🟢 |

**Etkilenen dosyalar:** `js/features/script-parser.js` · `js/ui/highlight.js` · `js/app.js` · `css/components.css`

---

## 🎬 Faz 33 — Sahne Yönetimi UX İyileştirmeleri
> *Sahneler var, şimdi kullanımını hızlandır*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 33.1 | **Son 5 sahne kısa erişim** | Hızlı geri dönüş menüsü | 🔴 |
| 33.2 | **Son sahneyi geri yükle** | Uygulama açılışında isteğe bağlı son sahne önerisi | 🟡 |
| 33.3 | **Sahne etiketi/kategori** | Örn: “Reklam”, “Eğitim”, “Müşteri Destek” | 🟡 |
| 33.4 | **Sahne arama** | İsimle hızlı filtreleme | 🟢 |

**Etkilenen dosyalar:** `js/storage.js` · `index.html` · `css/panels.css` · `js/app.js`

---

## 📈 Faz 34 — Ölçümleme (Analytics) & Karar Desteği
> *Hangi özellik gerçekten değer üretiyor, veriyle gör*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 34.1 | **Anonim olay takibi altyapısı** | ekran al, oynat, şablon seç, sahne kaydet gibi event’ler | 🟡 |
| 34.2 | **Yerel metrik paneli** | Son 7 gün kullanım özeti (opsiyonel, local) | 🟢 |
| 34.3 | **Düşme noktası tespiti** | Kullanıcı onboarding’in hangi adımında bırakıyor analizi | 🟡 |
| 34.4 | **Roadmap geri besleme döngüsü** | Toplanan veriye göre faz önceliklerini güncelleme | 🟢 |

**Etkilenen dosyalar:** `js/app.js` · `js/storage.js` · `index.html` (opsiyonel panel)

---

## 🎮 Faz 35 — İnteraktif Mod Akıllı Eşleştirme (Opsiyonel)
> *Exact match dışında daha doğal eşleşme*

| # | İyileştirme | Detay | Öncelik |
|---|---|---|---|
| 35.1 | **Contains eşleşme modu** | Tam eşleşme dışında içerir tabanlı eşleşme opsiyonu | 🟡 |
| 35.2 | **Alias/synonym desteği** | “kargo”, “teslimat”, “paket nerede” gibi gruplama | 🟡 |
| 35.3 | **Skor tabanlı fallback** | Birden fazla eşleşmede en yakın niyeti seç | 🟢 |
| 35.4 | **Debug görünümü** | Hangi tetikleyici eşleşti kullanıcıya/yaratıcıya göster | 🟢 |

**Etkilenen dosyalar:** `js/features/interactive-engine.js` · `index.html` · `css/components.css`

---

## Öncelik Özeti

| Faz | Kapsam | Zorluk | Etki | Bağımlılık |
|---|---|---|---|---|
| **Faz 28** | Dokümantasyon & Güven | 🟢 Küçük | ⭐⭐⭐⭐ | Yok |
| **Faz 29** | Onboarding & Basit Mod | 🟡 Orta | ⭐⭐⭐⭐⭐ | Faz 28 sonrası ideal |
| **Faz 30** | Şablon Galerisi & Tek Tık Demo | 🟡 Orta | ⭐⭐⭐⭐⭐ | Faz 29 ile paralel |
| **Faz 31** | Script Yazmadan Üretim | 🟡 Orta-Büyük | ⭐⭐⭐⭐⭐ | Faz 27 tamam olmalı |
| **Faz 32** | Hata Mesajı UX | 🟡 Orta | ⭐⭐⭐⭐ | Faz 30/31 sonrası ideal |
| **Faz 33** | Sahne UX | 🟢/🟡 Küçük-Orta | ⭐⭐⭐ | Faz 29 sonrası |
| **Faz 34** | Ölçümleme | 🟡 Orta | ⭐⭐⭐⭐ | Faz 29 sonrası |
| **Faz 35** | İnteraktif Akıllı Eşleşme | 🟡 Orta | ⭐⭐⭐ | Opsiyonel |

---

## Uygulama Sırası

1. **Faz 28** — README düzeltme + hızlı başlangıç
2. **Faz 29** — onboarding + Basit/Pro mod
3. **Faz 30** — şablon galerisi + tek tık demo
4. **Faz 31** — script yazmadan üretim akışını öne alma
5. **Faz 32** — çözüm odaklı hata geri bildirimleri
6. **Faz 33** — sahne yönetimi UX hızlandırmaları
7. **Faz 34** — analytics ve karar döngüsü
8. **Faz 35** — interaktif akıllı eşleştirme (opsiyonel)

---

## Başarı Kriterleri (KPI)

- İlk kullanımda “ilk başarılı oynatma” oranı ↑
- İlk 5 dakikada “ekran görüntüsü alma” oranı ↑
- Onboarding terk oranı ↓
- Şablon kullanım oranı ↑
- Hata sonrası başarıya dönüş oranı ↑

---

> 📝 **Not:** Bu roadmap, teknik kapasiteyi artırmaktan çok kullanıcı başarısını ve keşfedilebilirliği artırmayı hedefler. Yeni faz öncelikleri, Faz 34 ölçüm sonuçlarına göre güncellenmelidir.
