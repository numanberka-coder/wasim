# Faz 13 — Tik Ayrımı (Gönderildi / İletildi / Okundu)

## Strateji
`createTickSVG(status)` zaten 3 durumu destekliyor (`sent`, `delivered`, `read`) ama her zaman `true` (read) ile çağrılıyor.
Yapılacaklar:
1. State'e `defaultTickStatus` ekle (varsayılan: `read`)
2. Mesaj objesine `tickStatus` alanı ekle — per-message override
3. Senaryo syntax'ına `@sent`, `@delivered`, `@read` komutları ekle — sonraki mesajları etkiler
4. Settings UI'a tik durumu seçici accordion ekle
5. `buildMessageRow`'da mesajın `tickStatus` bilgisini `createTickSVG`'ye ilet

---

## Adımlar

### Adım 1: Config & State Altyapısı
- [ ] `js/config.js` → `DEFAULT_STATE`'e `tickStatus: 'read'` ekle
- [ ] `js/state.js` → `settings`'e `tickStatus` ekle
- [ ] `js/state.js` → `reset()`'e `tickStatus: 'read'` ekle

### Adım 2: Mesaj Objesine tickStatus Desteği
- [ ] `js/state.js` → `addMessage()` → mesaj objesine `tickStatus` alanı ekle
- [ ] `js/state.js` → `import()` → mesaj import'unda `tickStatus` alanını koru
- [ ] `js/phone/messages.js` → `addMessage()` fonksiyonuna `tickStatus` parametresi ekle
- [ ] `js/phone/messages.js` → `buildMessageRow()` → `createTickSVG(true)` yerine mesajın `tickStatus` bilgisini kullan

### Adım 3: Senaryo Syntax — @sent, @delivered, @read
- [ ] `js/features/script-parser.js` → `parseLine()` → `@sent`, `@delivered`, `@read` komutlarını parse et
- [ ] `js/features/script-parser.js` → `isValidCommand()` → yeni komutları ekle
- [ ] `js/features/script-parser.js` → `eventsToScript()` → yeni event tipini script'e geri çevir
- [ ] `EventType`'a `TICK_STATUS: 'tick_status'` ekle

### Adım 4: Player — Tik Durumu Akışı
- [ ] `js/features/player.js` → `handleEvent()` → `TICK_STATUS` event'ini yakala
- [ ] Player'da aktif `tickStatus` state'ini tut → sonraki mesajlara uygula
- [ ] `handleMessageEvent()` → mesajı eklerken aktif `tickStatus` bilgisini geç

### Adım 5: Settings UI — Varsayılan Tik Durumu
- [ ] `index.html` → Ayarlar paneline "Tik Durumu" accordion ekle
  - 3 radio/buton: Gönderildi (tek gri), İletildi (çift gri), Okundu (çift mavi)
- [ ] `js/app.js` → UI event binding + form populate
- [ ] Varsayılan tik durumu değişince mevcut mesajların tikleri güncellenmeli

### Adım 6: Export/Import & Sıfırlama Uyumu
- [ ] JSON export/import'ta `tickStatus` dahil olmalı (hem settings hem mesaj bazlı)
- [ ] "Sıfırla" butonu tik durumunu da sıfırlamalı

### Adım 7: Test & Doğrulama
- [ ] Varsayılan tik durumu ayardan değişiyor mu
- [ ] `@sent` komutu sonraki mesajlarda tek gri tik gösteriyor mu
- [ ] `@delivered` komutu sonraki mesajlarda çift gri tik gösteriyor mu
- [ ] `@read` komutu sonraki mesajlarda çift mavi tik gösteriyor mu
- [ ] Light/dark temada tik renkleri doğru mu
- [ ] Export/import tik durumunu koruyor mu
