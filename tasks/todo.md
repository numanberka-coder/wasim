# Faz 11 — Light Mod Uygulama Planı

## Strateji
`.phone.light` CSS sınıfı ile CSS variable override yapılacak. Mevcut dark mod varsayılan kalacak.
Toggle butonu ile `light` sınıfı eklenip kaldırılacak. Hardcoded renkler önce variable'a bağlanacak,
sonra light tema alternatifleri tanımlanacak.

---

## Adımlar

### Adım 1: Hardcoded Renk Temizliği (11.4) — Temel
- [ ] `phone.css`'teki hardcoded renkleri CSS variable'larına bağla:
  - `.msg-bubble.in` background → `var(--wa-bubble-in)`
  - `.msg-bubble.in::before` border → `var(--wa-bubble-in)`
  - `.msg-bubble.out` background → `var(--wa-bubble-out)`
  - `.msg-bubble.out::before` border → `var(--wa-bubble-out)`
  - `.typing-bubble` background → `var(--wa-bubble-in)`
  - `.day-divider span` background/color → yeni variable'lar
  - `.system-msg span` background/color → yeni variable'lar
  - `.msg-reaction` background → yeni variable
  - `.msg-location-info` background → variable
  - `.msg-link-body` background → variable
  - `.composer-pill` background → variable
  - `.msg-meta` color → variable
  - `.msg-reply-snippet` color → variable
  - Home indicator (`.phone::after`) rengi

### Adım 2: Light Renk Paleti (11.1) — CSS
- [ ] `variables.css`'e veya `phone.css`'e `.phone.light` scope'lu override'lar ekle:
  - `--wa-bg: #efeae2` (WhatsApp light arka plan)
  - `--wa-header: #008069` (WhatsApp light header yeşili)
  - `--wa-panel: #ffffff`
  - `--wa-input-bg: #ffffff`
  - `--wa-bubble-out: #d9fdd3` (açık yeşil giden balon)
  - `--wa-bubble-in: #ffffff` (beyaz gelen balon)
  - `--wa-bubble-meta: #667781`
  - `--wa-text: #111b21` (koyu metin)
  - `--wa-text-secondary: #667781`
  - `--wa-icon: #54656f`
  - `--wa-divider: #e9edef`
  - `--wa-check-blue: #53bdeb` (aynı kalır)
  - Status bar text rengi
  - Day divider, system msg renkleri

### Adım 3: Light Wallpaper (11.3)
- [ ] `WALLPAPER_PRESETS`'e `light-default` ekle (bej tonlu doodle pattern)
- [ ] Tema geçişinde wallpaper otomatik değişsin

### Adım 4: Tema Geçiş Butonu & State (11.2)
- [ ] `config.js` → `DEFAULT_STATE`'e `theme: 'dark'` ekle
- [ ] `state.js` → settings'e `theme` ekle
- [ ] `header.js`'e `applyTheme(theme)` fonksiyonu ekle
- [ ] `index.html`'e Header Rengi accordion'unun yanına tema toggle butonu ekle
- [ ] `app.js`'e toggle event binding ekle

### Adım 5: Meta Renk Uyumu (11.5)
- [ ] Light modda saat, tik, day divider, sistem mesajı okunur olmalı
- [ ] Telefon kasası (box-shadow) ve yan tuşlar light'ta uyumlu olmalı
- [ ] Header typing status rengi light'ta uyumlu
- [ ] Home indicator rengi light'ta koyu olmalı

### Adım 6: Test & Doğrulama
- [ ] Dark mod bozulmadı mı kontrol et
- [ ] Toggle çalışıyor mu
- [ ] Export/Import tema bilgisini koruyor mu
- [ ] Sıfırla butonu temayı da sıfırlıyor mu
