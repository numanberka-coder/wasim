# Faz 27 — Grup Tabı Yeniden Yapılandırma

> **Tarih:** 2026-04-02
> **Kapsam:** Blok Builder'ı kişi bazlı sezgisel arayüze dönüştür
> **Durum:** 🔄 Devam ediyor

---

## Görevler

### 27.4 — Eski Blok Builder Temizliği 🔴
- [ ] `#tabBuilder` paneli HTML'den silinir
- [ ] Blok Builder iç tab butonu silinir
- [ ] `setupBuilder()` Builder-only event listener'lar temizlenir
- [ ] `#builderScriptBox` referansları kaldırılır
- [ ] `pushBlocksToBuilderTextarea()` → `#scriptBox`'a yazar

### 27.1 — Tab Doğrulama 🔴
- [ ] Senaryo + İnteraktif olarak 2 iç tab kaldığı doğrulanır
- [ ] Ana tablar (Grup / Senaryo / Ayarlar) değişmez

### 27.3 — Satır Listesi Taşıma 🔴
- [ ] `#group` paneline "Satır Sırası" accordion eklenir
- [ ] `blocks[]`, `renderBlocks()`, drag-drop mantığı korunur
- [ ] Hedef element `builderList` → `groupBuilderList` güncellenir
- [ ] "Metne Aktar" + "Oynat" butonları eklenir

### 27.2 — Kişi Bazlı Inline Satır Ekleme 🔴
- [ ] Kişi kartı tıklama → inline expand panel
- [ ] 16 tip chip grubu
- [ ] "Kim" alanı (otomatik dolu)
- [ ] "Metin" alanı (tipe göre değişen)
- [ ] Dinamik alanlar (URL, süre, emoji vb.)
- [ ] "Satır Ekle" butonu

### 27.5 — Senaryo Yönlendirme Banner'ı 🟢
- [ ] Banner HTML eklenir
- [ ] `switchTab('script')` bağlanır
- [ ] Muted stil uygulanır

---

## Test
- [ ] Mevcut testler geçer (191/191)
- [ ] Satır ekleme → Senaryo formatı doğru
- [ ] Drag-drop çalışır
- [ ] Oynatma çalışır
