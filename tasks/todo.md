# Faz 15 — Senaryo Zenginleştirici ✅

## Tamamlanan Adımlar

### Adım 1: Satır Arası Ekleme Altyapısı ✅
- [x] `insertAfterIndex` değişkeni eklendi (null = sonuna ekle, sayı = o index'in altına ekle)
- [x] `addBlockFromForm()` güncellendi — insertAfterIndex varsa `blocks.splice(insertAfterIndex + 1, 0, block)`
- [x] Ekleme sonrası `clearInsertMode()` ile sıfırlama
- [x] `setInsertMode(index)` — insertAfterIndex set, render, indicator güncelle, forma scroll
- [x] `clearInsertMode()` — insertAfterIndex null, indicator gizle
- [x] `renderInsertIndicator()` — "X. satırın altına eklenecek" bilgi barı

### Adım 2: Builder Listesine "+" Butonu ✅
- [x] `renderBlocks()` → her `.builder-item`'a "+" butonu eklendi (4 sütunlu grid)
- [x] "+" tıklanınca `setInsertMode(index)` çağrılıyor
- [x] Aktif insert modu → ilgili satır yeşil border ile vurgulanıyor (`.insert-target`)
- [x] Insert indicator cancel butonu ile iptal edilebiliyor

### Adım 3: Hızlı Komut Menüsü (Context Menu) ✅
- [x] Satır summary alanına tıklanınca popup menü açılıyor
- [x] 8 sık kullanılan komut: Mesaj, Fotoğraf, Yazıyor, Tepki, Ses, Sistem, Sticker, Yanıt
- [x] Seçim → activeBuilderType değişir + setInsertMode(index) çağrılır + form açılır
- [x] Click-outside ve ESC ile kapatma
- [x] Ekran taşma kontrolü (bottom/right overflow)

### Adım 4: CSS Stilleri ✅
- [x] `.builder-item` grid → 4 sütun (handle | summary | + | sil)
- [x] `.builder-insert-btn` — yeşil "+" butonu
- [x] `.builder-item.insert-target` — yeşil border vurgusu
- [x] `.builder-insert-indicator` — bilgi barı + iptal butonu
- [x] `.builder-context-menu` — fixed pozisyonlu popup, animasyonlu
- [x] `.builder-context-item` — hover efektli menü satırları

### Adım 5: Mobil Uyumluluk ✅
- [x] Insert butonu min 36px touch target
- [x] Context menü genişletilmiş padding (mobil)
- [x] Context item min-height 40px touch-friendly
- [x] Insert indicator mobilde görünür

### Adım 6: Edge Case Korumaları ✅
- [x] `removeBlock()` → silinen block insert target ise clearInsertMode()
- [x] `removeBlock()` → silinen block öncesindeyse insertAfterIndex--
- [x] `moveBlock()` → sürükle-bırak sonrası clearInsertMode()
- [x] `clearBtn` (Satırları Temizle) → clearInsertMode()

## Değişen Dosyalar
- `js/features/script-builder.js` — insertAfterIndex, setInsertMode, clearInsertMode, renderInsertIndicator, showContextMenu, closeContextMenu, renderBlocks güncelleme, removeBlock/moveBlock edge case koruması
- `css/components.css` — builder-item 4 sütun grid, insert-btn, insert-target, insert-indicator, context-menu stilleri
- `css/responsive.css` — mobil uyumluluk (touch target, padding)
- `ROADMAP.md` — Faz 15 tamamlandı olarak işaretlendi
- `README.md` — Mevcut durum güncellendi (1-15)
