# Faz 42 - Sohbetler Sekmesi

> Tarih: 2026-05-06
> Branch: codex/faz-42
> Kaynak: ROADMAP5 Faz 42
> Durum: Tamamlandi

---

## Amac

Telefon ana shell'inin ilk sekmesini WhatsApp Android Sohbetler gorunumune
yaklastirmak. Faz 41'de kurulan home shell, bottom nav ve chat detail gecisi
korunacak; sohbet satiri mevcut sohbet detay ekranini acmaya devam edecek.

---

## Uygulama Plani

- [x] 1. Faz 41 shell temelini tekrar dogrula:
      - `index.html` icindeki home shell/chat detail ayrimi.
      - `js/phone/app-shell.js` mevcut state ve event modeli.
      - `css/phone-shell.css` mevcut layout sinirlari.
- [x] 2. Sohbetler ust barini zenginlestir:
      - WhatsApp basligi korunur.
      - Kamera ikonu eklenir.
      - Uc nokta aksiyonu mevcut `data-mobile-menu-trigger` modelini kullanir.
- [x] 3. Arama alanini ekle:
      - Meta AI/Search benzeri yuvarlak alan.
      - Dar mobil genisliklerde tasma yapmayan sabit yukseklik.
- [x] 4. Filtre chiplerini ekle:
      - All, Unread, Groups chipleri.
      - Aktif chip gorsel ve makine tarafindan okunabilir state tasir.
      - Secim layout shift yaratmaz.
- [x] 5. Sohbet satirini gercekci hale getir:
      - Mevcut grup/avatar/son mesaj bilgisinden turetilen ana satir.
      - Bos veya eksik veri icin guvenli fallback.
      - Satira tiklamak mevcut chat detail ekranini acar.
- [x] 6. Mesaj FAB'ini ekle:
      - Sag altta WhatsApp tarzinda mesaj FAB'i.
      - Bottom nav ile carpismaz, dar viewportta tasmaz.
- [x] 7. Testleri guncelle:
      - `tests/phone-shell.test.js` Faz 42 hiyerarsisini dogrular.
      - Chat row tiklamasi chat detail'i acar.
      - Chip state'i ve fallback sohbet verisi test edilir.
- [x] 8. Dogrulama calistir:
      - `node --check js\phone\app-shell.js`
      - `npm.cmd test -- tests\phone-shell.test.js`
      - `npm.cmd test`
      - `npm.cmd run build`
      - Mobil browser sanity: home shell, chips, chat open, FAB/menu overlap.

---

## Kabul Kriterleri

- Sohbetler sekmesi referans Android gorunumundeki hiyerarsiyi tasir.
- Ana sohbet satiri bos veriyle de guvenli fallback gosterir.
- Filtre chipleri layout shift yaratmadan secilebilir.
- Sohbet satiri mevcut chat detail ekranini acar.
- Uc nokta menusu ana Sohbetler ekranindan mevcut simulator menusunu acar.
- Composer, atac, kamera ve mikrofon sadece chat detail icinde kalir.

---

## Review

- `index.html` icinde Sohbetler sekmesi WhatsApp Android hiyerarsisine
  yaklastirildi:
  - Ust barda kamera ve mevcut mobil menu tetikleyicisi korunur.
  - Meta AI/Search benzeri arama satiri eklendi.
  - All, Unread, Groups filtre chipleri eklendi.
  - Ana sohbet satiri title, avatar, son mesaj ve saat alanlariyla yenilendi.
  - Sag alt mesaj FAB'i bottom nav ustunde konumlandirildi.
- `js/phone/app-shell.js` genisletildi:
  - `CHAT_FILTERS` ve `setActiveChatFilter` eklendi.
  - Aktif chip `aria-pressed` ve `data-active-filter` ile okunabilir.
  - Sohbet satiri grup bilgisi ve son mesajdan turetilir.
  - Bos title/subtitle/messages durumlari guvenli fallback gosterir.
  - State degisince home sohbet ozeti senkron kalir.
- `css/phone-shell.css` Faz 42 layoutunu kapsar:
  - Arama alani, chipler, sohbet satiri, avatar gorseli ve FAB stilleri.
  - Light tema icin arama/chip renkleri.
  - Bottom nav ile FAB carpisma riskini azaltan sabit konum.
- `tests/phone-shell.test.js` 7 teste genisletildi:
  - Faz 42 hiyerarsisi.
  - Chat filter state'i.
  - Bos veri fallback'i.
  - Sohbet satiri tiklamasiyla detail acma.
- Dogrulama:
  - `node --check js\phone\app-shell.js`: basarili.
  - `npm.cmd test -- tests\phone-shell.test.js`: 7 test basarili.
  - `npm.cmd test`: 10 test dosyasi, 243 test basarili.
  - `npm.cmd run build`: Vite build basarili.
  - Browser sanity `http://127.0.0.1:5173`:
    - Home shell gorundu.
    - Arama, 3 chip, sohbet satiri ve FAB gorundu.
    - Home shell icinde composer bulunmadi.
    - Unread chip secimi `aria-pressed=true` ve `data-active-filter=unread` oldu.
    - Sohbet satiri chat detail'i acti; geri butonu home shell'e dondu.
    - Home shell uc nokta menusu `#headerDropdown` icinde `data-menu-root` ile acildi.
    - Console error gorulmedi.
