# Pro Mod — Tüm Özellikleri Test Senaryosu

Bu dosya, uygulamadaki tüm senaryo komutlarını ve telefon shell özelliklerini tek
seferde denemek için hazırlanmıştır.

## A) Senaryo betiği (kopyala → yapıştır)

**Nasıl:** Pro Mod → **Senaryo** sekmesi → aşağıdaki betiği `Senaryonuzu buraya yazın`
kutusuna yapıştır → **Yükle** → **Oynat**. (Önce üstteki **Hedef sohbet** seçicisinden
hangi sohbete akacağını seç.)

```text
@add Ayşe
@add Mehmet
@add Zeynep

@system Grup açıklaması güncellendi
Ayşe: Selam ekip! 👋 Yeni kampanya için toplanalım mı?
@typing Mehmet 900
Mehmet: Merhaba Ayşe, ben hazırım.
@typing Zeynep 1100
Zeynep > Ayşe: Bence harika fikir, hemen başlayalım.
@reaction Mehmet 👍 Zeynep

@typing Ayşe 800
@photo Ayşe "https://picsum.photos/seed/kampanya/600/400" "Kampanya görseli taslağı"
@typing Mehmet 700
Mehmet: Görsel çok iyi olmuş 🔥
@reaction Zeynep ❤️ Ayşe

@typing Zeynep 900
@voice Zeynep 14s "Sesli not"
@typing Ayşe 700
@gif Ayşe "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" "Hadi başlayalım!"

@typing Mehmet 1000
@location Mehmet "Ofis - Toplantı Odası" "Levent, İstanbul"
@typing Ayşe 800
@document Ayşe "kampanya_brief.pdf" "1.4 MB · PDF"

@typing Zeynep 700
@link Zeynep "Kampanya Sunumu" "https://example.com/sunum" "https://picsum.photos/seed/link/200/200"
@typing Mehmet 600
@sticker Mehmet 🎉

@video Ayşe "https://www.w3schools.com/html/mov_bbb.mp4" "Tanıtım videosu önizlemesi"
@typing Zeynep 800
@viewonce Zeynep photo
Zeynep: Bir kez görüntülenebilir gönderdim 👀

@typing Me 700
Me: Süpersiniz, ben de buradayım. Tik durumlarını test ediyorum 👇
@sent
Me: Bu mesaj yalnızca gönderildi (tek gri tik).
@delivered
Me: Bu mesaj iletildi (çift gri tik).
@read
Me: Bu mesaj okundu (mavi çift tik).

@leave Zeynep
@typing Ayşe 700
Ayşe > Me: Toplantı bitti, herkese teşekkürler! 🙌
@reaction Mehmet 😂 Ayşe
```

### Betiğin kapsadığı komutlar
- Mesaj: `Kişi: metin` · Yanıt: `Kişi > Hedef: metin`
- `@add` / `@leave` (katılma/ayrılma sistem mesajı otomatik)
- `@system` (özel sistem mesajı)
- `@typing` (yazıyor göstergesi)
- `@reaction` (emoji tepki)
- Medya: `@photo` `@gif` `@video` `@voice` `@location` `@document` `@link` `@sticker` `@viewonce`
- Tik durumu: `@sent` / `@delivered` / `@read` (sonraki giden mesajlara uygulanır)

> **Not:** `@photo/@gif/@video/@link` dış URL kullanıyor; internet yoksa görseller
> kutu olarak görünebilir. Çevrimdışı test için Senaryo'daki **"Medya ekle"** yardımcısıyla
> dosya seçip otomatik `data:` olarak ekleyebilirsin.

---

## B) Telefon shell + UI özellik kontrol listesi (manuel)

Betikle ilgisi olmayan, elle denenecek özellikler:

**Hedef sohbet & modlar**
- [ ] **Hazırla** panelindeki *Hedef sohbet* seçicisi Basit ve Pro modda görünüyor.
- [ ] Seçiciden **➕ Yeni sohbet** ile yeni grup oluştur; betiği ona oynat → mesajlar o sohbete akıyor.
- [ ] Sohbet değiştirince *Grup Bilgileri* formu + telefon header'ı o sohbeti yansıtıyor.
- [ ] Telefonun **Sohbetler** sekmesinden başka sohbete dokununca masaüstü seçici/form senkron kalıyor.

**Sohbetler sekmesi**
- [ ] Arama kutusu "Ara"; filtre çipleri **Tümü / Okunmamış / Gruplar** (Türkçe).
- [ ] Bir sohbete **uzun bas** (mobil) veya **sağ-tık** (masaüstü) → onayla → sohbet siliniyor.
- [ ] Üst barda yalnızca **kamera + üç nokta** var.

**Güncellemeler sekmesi**
- [ ] Üst barda **arama + üç nokta** (kamera yok).
- [ ] Alt-nav "Güncellemeler" ikonu halkalı (WhatsApp status) ve aktif pill ikona **simetrik**.
- [ ] Kalem (✏️) FAB → editörde **durum ekle/sil** + **foto** yükleme; kaydet → listede görünüyor, sayfa yenileyince kalıcı.

**Topluluklar sekmesi**
- [ ] Metinler Türkçe; **Topluluğunuzu oluşturun** → editör açılıyor, kaydetme kalıcı.

**Aramalar sekmesi**
- [ ] Üst barda **arama + üç nokta** (kamera yok); *Hızlı aksiyonlar*, *Tuş takımı* Türkçe.
- [ ] Üst arama ikonu → editörde arama satırlarına **foto** ekle; isim bir kişi/sohbetle eşleşirse avatar **otomatik** geliyor.
- [ ] Yön/metinler Türkçe: *Cevapsız, bugün* · *Giden, dün* · *Gelen, salı*.

**Görsel & tipografi**
- [ ] **Ayarlar → Tipografi**: Yazı Boyutu / Satır Aralığı / Balon Dolgu kaydırıcıları mesaj balonlarını gerçekten değiştiriyor.
- [ ] Masaüstü panel butonları emoji yerine tutarlı **SVG ikon**.
- [ ] Üst bardan **Ekran Al** → PNG export çalışıyor.

**Alt-nav (tüm sekmeler)**
- [ ] Aktif sekme pill'i ikonun etrafında dikey/yatay **simetrik**, yumuşak yeşil tonda.
