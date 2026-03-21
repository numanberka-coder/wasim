# Faz 24 — Performans Optimizasyonu

> **Tarih:** 2026-03-21
> **Kapsam:** Message virtualization, rebuildChat optimizasyonu, CSS bölme, lazy loading, rAF geçişi, timer temizleme
> **Durum:** 🔄 Plan aşamasında

---

## Analiz Özeti

Mevcut performans darboğazları:
1. `rebuildChat()` her çağrıda tüm DOM'u silip yeniden oluşturuyor (messages.js:972)
2. `clearChat()` innerHTML ile tüm chat'i sıfırlıyor (messages.js:966)
3. Tick status değişikliğinde full rebuild (app.js:423)
4. Voice mesaj animasyonu `setInterval` ile 80ms'de DOM manipülasyonu yapıyor
5. phone.css 1712 satır — tek monolitik dosya
6. Header avatar lazy loading yok (mesaj fotoğraflarında zaten `loading="lazy"` var)

---

## Görevler

### 24.1 — Message Virtualization 🔴
> IntersectionObserver ile sadece görünür mesajları render et

- [ ] `js/ui/virtual-scroller.js` modülü oluştur
- [ ] IntersectionObserver ile viewport'a giren/çıkan mesajları takip et
- [ ] Viewport dışındaki mesajları placeholder div'le değiştir (yükseklik koruma)
- [ ] Scroll pozisyonu koruması (yukarı scroll'da eski mesajlar render edilsin)
- [ ] `addMessage()` ile entegrasyon — yeni mesaj eklendiğinde otomatik scroll
- [ ] 100+ mesaj senaryosunda test et
- [ ] Mevcut testleri güncelle

### 24.2 — rebuildChat() Optimizasyonu 🔴
> Tema değişiminde full DOM rebuild yerine minimal güncelleme

- [ ] Tema değişikliğinde CSS class swap yeterli mi analiz et (zaten `.light` class kullanılıyor)
- [ ] Tick status değişikliğinde sadece ilgili mesajları güncelle (full rebuild yerine)
- [ ] `updateMessageTicks(status)` fonksiyonu — sadece tick ikonlarını günceller
- [ ] `rebuildChat()` çağrı noktalarını minimize et
- [ ] DocumentFragment kullanarak batch DOM insert

### 24.3 — phone.css Bölme 🟡
> 1712 satırlık dosyayı mantıksal modüllere ayır

- [ ] `css/phone-container.css` — Phone çerçeve (satır 5-131, ~126 satır)
- [ ] `css/phone-statusbar.css` — Status bar (satır 147-302, ~155 satır)
- [ ] `css/phone-header.css` — Chat header (satır 304-406, ~102 satır)
- [ ] `css/phone-messages.css` — Mesaj balonları (satır 452-993, ~541 satır)
- [ ] `css/phone-composer.css` — Chat input (satır 1074-1185, ~111 satır)
- [ ] `css/phone-media.css` — Medya tipleri (satır 1186-1483, ~297 satır)
- [ ] `css/phone-light.css` — Light tema override'ları (satır 1484-1712, ~228 satır)
- [ ] `css/phone.css` → barrel import dosyası (tüm parçaları @import ile toplar)
- [ ] Vite build'de doğru merge edildiğini doğrula

### 24.4 — Avatar Lazy Loading 🟡
> Grup fotoğrafı ve mesaj avatarları için lazy loading

- [ ] Header avatar'da `loading="lazy"` ekle (header.js:62, 75)
- [ ] Grup üye avatarlarında lazy loading
- [ ] Avatar yükleme hatalarında graceful fallback (zaten var, doğrula)

### 24.5 — Wallpaper Lazy Loading 🟡
> Duvar kağıdı arka planda yüklensin

- [ ] Custom image wallpaper için `Image()` ile preload pattern
- [ ] Preload tamamlanınca CSS variable güncelle
- [ ] Default wallpaper (SVG pattern) zaten inline — dokunma
- [ ] Geçiş animasyonu (opacity fade-in)

### 24.6 — requestAnimationFrame Kullanımı 🟢
> Voice animasyonlarında setTimeout/setInterval → rAF geçişi

- [ ] Voice playback animasyonunda `setInterval(fn, 80)` → `requestAnimationFrame` loop
- [ ] CSS animation alternatifi değerlendir (bar animasyonu için)
- [ ] Player tick'te rAF kullanımı değerlendir

### 24.7 — Timer Temizleme Sistemi 🟢
> Orphan timer'ları önle, AbortController pattern

- [ ] `TimerManager` utility — register/cleanup pattern
- [ ] Voice timer'ları clearChat'te temizle
- [ ] Status bar interval'i destroy'da temizle
- [ ] Player timer'ları reset'te temizle (zaten var, doğrula)
- [ ] AbortController ile event listener cleanup

---

## Uygulama Sırası

1. **24.2** — rebuildChat optimizasyonu (en büyük performans kazancı, diğerlerinin temeli)
2. **24.3** — CSS bölme (bağımsız, risk düşük)
3. **24.7** — Timer temizleme (24.1 ve 24.6 için altyapı)
4. **24.6** — rAF geçişi (timer temizleme üzerine inşa)
5. **24.4** — Avatar lazy loading (küçük, bağımsız)
6. **24.5** — Wallpaper lazy loading (küçük, bağımsız)
7. **24.1** — Message virtualization (en karmaşık, son sıraya — diğer optimizasyonlar hazır olunca)

---

## Notlar

- Mevcut 191 test PASS durumunda — her adımda testler korunmalı
- `npm run build` her adımda çalışmalı
- phone.css bölme sırasında Vite CSS processing doğrulanmalı
- Virtualization, player.js ile dikkatli entegrasyon gerektirir (oynatma sırasında scroll)
