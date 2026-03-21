# Faz 14 — Sahne Yönetimi (Kaydet / Yükle / Sil) ✅

## Tamamlanan Adımlar

### Adım 1: Storage Altyapısı ✅
- [x] `js/config.js` → `CONFIG.SCENES_KEY` eklendi (`whatsapp_simulator_scenes`)
- [x] `js/storage.js` → `sceneManager` objesi eklendi
- [x] `sceneManager.save(name)` → state.export() + isim + timestamp → scenes dizisine ekle
- [x] `sceneManager.load(id)` → scenes dizisinden bul → state.import(data)
- [x] `sceneManager.delete(id)` → scenes dizisinden sil
- [x] `sceneManager.rename(id, newName)` → sahne adını güncelle
- [x] `sceneManager.getAll()` → tüm sahneleri getir

### Adım 2: UI — Sahne Yönetimi Accordion ✅
- [x] `index.html` → Settings paneline "Sahne Yönetimi" accordion'u eklendi
- [x] İsim input + "Kaydet" butonu
- [x] `<div id="sceneList">` — dinamik render alanı

### Adım 3: App Entegrasyonu ✅
- [x] `js/app.js` → `renderSceneList()` fonksiyonu eklendi
- [x] Her sahne satırı: isim, tarih, "Yükle" butonu, "Sil" butonu
- [x] Kaydet butonu → sceneManager.save(name) → listeyi yenile
- [x] Yükle butonu → onay → sceneManager.load(id) → tam UI refresh
- [x] Sil butonu → onay → sceneManager.delete(id) → listeyi yenile
- [x] Enter ile kaydetme desteği
- [x] Boş isim kontrolü
- [x] Uygulama açılışında sahne listesi render

### Adım 4: CSS Stilleri ✅
- [x] `.scene-list` → flex column container
- [x] `.scene-item` → flex row (isim+tarih + butonlar)
- [x] `.scene-name` → text overflow ellipsis
- [x] `.scene-date` → küçük gri tarih
- [x] `.scene-actions` → buton grubu
- [x] Mevcut btn-sm, danger sınıfları kullanıldı

## Değişen Dosyalar
- `js/config.js` — SCENES_KEY eklendi
- `js/storage.js` — sceneManager objesi (save, load, delete, rename, getAll)
- `js/app.js` — renderSceneList, scene button bindings, init'e renderSceneList eklendi
- `index.html` — Sahne Yönetimi accordion UI
- `css/components.css` — scene-list, scene-item stilleri
- `ROADMAP.md` — Faz 14 tamamlandı olarak işaretlendi
- `README.md` — Mevcut durum güncellendi
