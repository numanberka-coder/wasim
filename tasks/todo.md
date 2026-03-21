# Faz 14 — Sahne Yönetimi (Birden fazla senaryo kaydet, yükle, geç)

## Plan

### Adım 1: Storage Altyapısı — `js/storage.js`
- [ ] Yeni localStorage key: `whatsapp_simulator_scenes` (mevcut state'ten bağımsız)
- [ ] `storage.saveScene(name)` → `state.export()` + isim + timestamp → scenes dizisine ekle
- [ ] `storage.loadScene(id)` → scenes dizisinden bul → `state.import(data)` çağır
- [ ] `storage.deleteScene(id)` → scenes dizisinden sil
- [ ] `storage.getScenes()` → kayıtlı sahnelerin listesi (id, name, timestamp)
- [ ] `storage.renameScene(id, newName)` → sahne adını güncelle
- [ ] Scene ID: `Date.now()` timestamp yeterli (unique)

### Adım 2: UI — `index.html`
- [ ] Settings tab'ına (veya Group tab'ına) "Sahne Yönetimi" accordion'u ekle
- [ ] Kaydet: İsim input + "Kaydet" butonu
- [ ] Sahne listesi: `<div id="scene-list">` — dinamik render
- [ ] Her sahne satırı: isim, tarih, "Yükle" butonu, "Sil" butonu

### Adım 3: App Entegrasyonu — `js/app.js`
- [ ] Sahne kaydet butonu → `storage.saveScene(name)` → listeyi yenile
- [ ] Sahne yükle butonu → `storage.loadScene(id)` → mevcut import refresh akışı
- [ ] Sahne sil butonu → onay → `storage.deleteScene(id)` → listeyi yenile
- [ ] `renderSceneList()` fonksiyonu → sahne listesini DOM'a render et
- [ ] Uygulama açılışında sahne listesini render et

### Adım 4: CSS — `css/components.css`
- [ ] `.scene-item` satır stili (isim + tarih + butonlar)
- [ ] `.scene-list` container stili
- [ ] Mevcut btn-sm, danger, secondary sınıflarını kullan

### Adım 5: Test & Doğrulama
- [ ] Sahne kaydet → listede görünüyor mu?
- [ ] Sahne yükle → tüm state doğru restore ediliyor mu?
- [ ] Sahne sil → listeden kalkıyor mu?
- [ ] Boş isim kontrolü
- [ ] Light/dark tema uyumu
- [ ] Mobil responsive uyumu
- [ ] Export/import ile çakışma yok mu?

## Değişecek Dosyalar
- `js/storage.js` — Scene CRUD fonksiyonları
- `js/app.js` — Scene UI binding + renderSceneList
- `index.html` — Sahne Yönetimi accordion UI
- `css/components.css` — Scene list stilleri
- `ROADMAP.md` — Faz 14 tamamlandı olarak işaretlenecek
- `README.md` — Mevcut durum güncellenecek
