# Faz 20 — Güvenlik & Stabilite

> **Tarih:** 2026-03-21
> **Kapsam:** XSS düzeltmesi, hata koruması, console.log temizliği, Logger utility

---

## Görevler

### 20.1 — header.js onerror XSS düzeltmesi 🔴
- [ ] `js/phone/header.js:64` — `onerror="..."` inline handler → `addEventListener('error', ...)` geçişi
- **Sorun:** `onerror` attribute string interpolation ile XSS riski
- **Çözüm:** `<img>` elementi `createElement` ile oluşturulacak, `onerror` yerine `img.addEventListener('error', ...)` kullanılacak

### 20.2 — Script parser try-catch 🔴
- [ ] `parseScript()` (satır 21-37) — for döngüsünü try-catch ile sar, bozuk satır skip edilsin
- [ ] `parseLine()` (satır 99-298) — tüm fonksiyon body'sini try-catch, hata durumunda `null` dön
- **Sorun:** Bozuk girdi crash yapabilir
- **Çözüm:** Her iki fonksiyona try-catch ekle, hata durumunda graceful fallback

### 20.3 — populateFormFields() hata koruması 🔴
- [ ] `app.js:94-160` — Tüm fonksiyon body'sini try-catch ile sar
- [ ] Eksik state değerleri için optional chaining veya fallback
- **Sorun:** Eksik DOM elementi veya state alanı crash yapabilir
- **Çözüm:** try-catch + `settings.chatLineHeight?.toFixed?.(2)` gibi güvenli erişim

### 20.4 — renderMessage() / buildMessageRow() hata koruması 🟡
- [ ] `messages.js:180` — `buildMessageRow()` fonksiyonunda per-message try-catch
- [ ] Hatalı mesaj render edilemezse sessiz geç, diğer mesajlar etkilenmesin
- **Sorun:** Tek bozuk mesaj tüm chat'i kırabilir
- **Çözüm:** try-catch wrapper ile error boundary mantığı

### 20.5 — console.log temizliği 🟡
- [ ] 17 console.log → `Logger` utility'ye geçiş (20.6 ile birlikte)
- **Dosyalar:**
  - `app.js` (2), `storage.js` (7), `interactive-engine.js` (3)
  - `player.js` (1), `statusbar.js` (1), `accordion.js` (1), `forms.js` (1), `tabs.js` (1)

### 20.6 — Yapısal Logger utility 🟢
- [ ] `js/utils.js` içine basit `Logger` objesi ekle
- [ ] `Logger.info()`, `Logger.warn()`, `Logger.error()`, `Logger.debug()`
- [ ] `Logger.DEBUG` flag — `false` iken sessiz, `true` iken verbose
- [ ] URL param `?debug=true` ile aktifleştirilebilir
- [ ] Tüm 17 console.log'u `Logger.info()` ile değiştir

---

## Etkilenen Dosyalar
- `js/phone/header.js` — XSS fix
- `js/features/script-parser.js` — try-catch
- `js/app.js` — try-catch
- `js/phone/messages.js` — try-catch
- `js/utils.js` — Logger utility
- `js/storage.js` — console.log → Logger
- `js/features/interactive-engine.js` — console.log → Logger
- `js/features/player.js` — console.log → Logger
- `js/phone/statusbar.js` — console.log → Logger
- `js/ui/accordion.js` — console.log → Logger
- `js/ui/forms.js` — console.log → Logger
- `js/ui/tabs.js` — console.log → Logger

---

## Uygulama Sırası
1. **20.6** Logger utility → diğer görevler buna bağımlı
2. **20.1** XSS fix (en kritik güvenlik)
3. **20.2** Script parser try-catch
4. **20.3** populateFormFields try-catch
5. **20.4** buildMessageRow try-catch
6. **20.5** console.log → Logger geçişi (tüm dosyalar)
