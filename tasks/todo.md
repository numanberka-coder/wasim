# Telefon Home Shell — Düzeltmeler, Eksik Akışlar & Türkçe Sweep

> Tarih: 2026-06-09 · Branch: codex/final-polish · AGENTS.md kapsam dışı · toast yok.

## Faz 1 — Hızlı/düşük risk ✅
- [x] A1. Placeholder → "Ara".
- [x] B1. Kamera/arama `[hidden]` CSS fix — kamera artık yalnız Sohbetler'de (canlı doğrulandı).
- [x] F. Türkçe sweep (app-shell.js, state.js, home-editors.js, index.html) + 12 test assertion'ı.
- [x] D. Alt-nav aktif pill (yumuşak yeşil, ~58×30, animasyonlu).
- [x] B3. `updates` ikonu segmentli halka + dolu merkez (WhatsApp status) + test.
- [x] C2. Shortcut ikon optik dengeleme (phone ↑, keypad ↓, star ↑).
- 269 test geçti, build OK, canlı 4 sekme doğrulandı.

## Faz 2 — Akışlar ✅
- [x] A2. Sohbet sil — `state.removeConversation` + uzun-bas/sağ-tık+onay (suppressChatOpen). 3 yeni state testi. Canlı: sağ-tıkla silindi.
- [x] C3. Arama avatar — `calls.items.avatarUrl/avatarDataUrl` + `resolveAvatarForName` (sohbet/kişi eşleşmesi). Editöre `avatar` alanı. Canlı: URL + otomatik eşleme foto gösteriyor.
- [x] B2. Durum tam ekle/sil + foto — editor `list` (tekrarlı satır) + `avatar` alan tipi; `phoneShellContent` normalizasyonu değişken-uzunluk + foto/avatar koruyacak şekilde yeniden yazıldı; render limiti 2→8. Test: 3. durum ekleme + persist.

## Doğrulama ✅
- [x] node --check OK · 272 test geçti · vite build OK · canlı 4 sekme + akışlar doğrulandı.

---
## Review

**Faz 1:** Türkçe sweep (app-shell/state/home-editors/index.html), kök kamera bug'ı
(`.phone-home-icon-btn[hidden]` override), alt-nav pill WhatsApp tonunda, `updates`
ikonu segmentli halka, shortcut optik dengeleme, placeholder. 12 test assertion'ı güncellendi.

**Faz 2:** Sohbet silme jesti, arama avatar + kişiye/sohbete otomatik eşleme, durum
ekle/sil+foto akışı (yeni `list`/`avatar` editor alan tipleri, kalıcı). State
normalizasyonu değişken-uzunluk listeleri ve foto/avatar verisini export/import'ta korur.

**Doğrulama:** 272/272 test, build OK, canlı tarayıcıda tüm akışlar teyit edildi
(sağ-tık sil, URL+otomatik avatar, kamera sekme-bazlı, Türkçe metinler). `AGENTS.md` dokunulmadı.
