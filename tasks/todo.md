# Faz 15 — Senaryo Zenginleştirici

## Konsept
Builder satır listesindeki her satırın yanına **"+"** butonu ekle. Tıklanınca mevcut form "araya ekleme" moduna geçer — satır seçilen satırın altına eklenir. Ayrıca satıra tıklayınca hızlı komut menüsü açılır (Fotoğraf, Tepki, Yazıyor, Sistem vb.).

ROADMAP notu: "Alternatif basit yol — Builder listesindeki her satırın yanına '+' butonu koymak. Mevcut form aynı şekilde çalışır, sadece 'sonuna ekle' yerine 'araya ekle' olur."

---

## Plan

### Adım 1: Satır Arası Ekleme Altyapısı (script-builder.js)
- [ ] `insertAfterIndex` değişkeni ekle (null = sonuna ekle, sayı = o index'in altına ekle)
- [ ] `addBlockFromForm()` fonksiyonunu güncelle — `insertAfterIndex` null değilse `blocks.splice(insertAfterIndex + 1, 0, block)` yap
- [ ] Ekleme sonrası `insertAfterIndex = null` sıfırla
- [ ] `setInsertMode(index)` fonksiyonu — insertAfterIndex'i set eder, formu vurgular, scroll yapar

### Adım 2: Builder Listesine "+" Butonu (script-builder.js + HTML)
- [ ] `renderBlocks()` → her `.builder-item` satırına "+" butonu ekle (sil butonunun yanına veya satırın altına)
- [ ] "+" tıklanınca `setInsertMode(index)` çağır
- [ ] Aktif insert modu varken ilgili satırı yeşil border ile vurgula
- [ ] Formda "Araya Ekle" modunu gösteren bir indicator ekle (cancelable)

### Adım 3: Hızlı Komut Menüsü (Context Menu)
- [ ] Satıra tıklanınca (summary alanına) popup menü aç
- [ ] Menü seçenekleri: sık kullanılan komutlar (📷 Fotoğraf, ⏳ Yazıyor, 😂 Tepki, ⚙️ Sistem, ➕ Katılma, 🚪 Ayrılma)
- [ ] Seçim yapılınca: `activeBuilderType` değiştir + `setInsertMode(index)` çağır + formu aç
- [ ] Menü dışına tıklayınca kapat
- [ ] Click-outside ve ESC ile kapatma

### Adım 4: CSS Stilleri (components.css)
- [ ] `.builder-item` grid'ini 4 sütuna güncelle (handle | summary | + | sil)
- [ ] `.builder-insert-btn` stili — küçük yeşil "+" butonu
- [ ] `.builder-item.insert-target` — yeşil border vurgusu
- [ ] `.builder-insert-indicator` — formda "X. satırın altına ekleniyor" bar stili
- [ ] `.builder-context-menu` — popup menü stili (position: absolute)
- [ ] `.builder-context-item` — menü satır stili

### Adım 5: Mobil Uyumluluk (responsive.css)
- [ ] Mobil overlay'de "+" butonunun touch-friendly olması (min 36px)
- [ ] Context menünün mobilde doğru pozisyonlanması
- [ ] Form indicator'ın mobilde görünmesi

### Adım 6: Test ve Doğrulama
- [ ] Normal ekleme hala çalışıyor (sonuna ekleme)
- [ ] "+" ile araya ekleme doğru pozisyona ekliyor
- [ ] Context menüden tip seçip araya ekleme çalışıyor
- [ ] Insert modu iptal edilebiliyor
- [ ] Drag-drop hala çalışıyor
- [ ] Mobilde düzgün görünüyor
- [ ] Light/dark temada uyumlu

### Adım 7: Dokümantasyon
- [ ] ROADMAP.md → Faz 15 tamamlandı olarak işaretle
- [ ] README.md → Mevcut durum güncelle
- [ ] Commit ve push

---

## Etkilenen Dosyalar
- `js/features/script-builder.js` — insertAfterIndex, setInsertMode, context menu, renderBlocks güncelleme
- `css/components.css` — builder-item grid güncelleme, context menu stilleri
- `css/responsive.css` — mobil uyumluluk
- `index.html` — insert indicator HTML (minimal)
- `ROADMAP.md` — Faz 15 tamamlandı
- `README.md` — Mevcut durum güncellendi
