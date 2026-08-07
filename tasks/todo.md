# Mobil Üretim UX Dönüşümü — Aktif Plan

## Faz 55 Uygulama Planı

- [x] Tek öğeli mobil menü gruplarını kompaktlaştır; `Diğer` grubunu `Proje` yap
- [x] JSON ve ekran görüntüsü eylemlerini gerçek sonuçlarıyla adlandır
- [x] Oynat/Duraklat kontrollerini player state ile senkron ve erişilebilir yap
- [x] Ayarlar/Hazırla/Senaryo overlay header aksiyonlarını bağlama göre sınırla
- [x] Dekoratif sheet handle'ını kaldır ve kaydırılabilir içerik için alt fade ekle
- [x] Hedefli testler, tam test, build ve mobil tarayıcı smoke kontrolünü tamamla

## Faz 55 Review

- Tek öğeli grup başlıkları görsel olarak gizlenerek menü kısaltıldı; semantik grup etiketleri korundu.
- `Proje`, `Dışa Aktar`, `İçe Aktar` ve ekran görüntüsü sonuç metinleri gerçek işlevlerle eşleştirildi.
- Oynat/Duraklat disabled durumu player timer/paused state ile senkronlandı ve menü her açılışta tazeleniyor.
- Ayarlar header'ında playback kaldırıldı; Hazırla yalnız oynat, Senaryo oynat+sıfırla gösteriyor.
- Dekoratif drag handle kaldırıldı; kaydırılabilir menüde yalnız içerik devam ediyorsa alt fade oluşuyor.
- Doğrulama: 12 test dosyası, 279 test ve PWA build geçti; 390×844 canlı smoke kontrolünde menü metinleri, disabled state, Ayarlar bağlamı ve konsol doğrulandı.

## Faz 54 Uygulama Planı

- [x] Overlay dialog/ARIA sözleşmesini ve anlamlı ilk odağı tamamla
- [x] Focus trap, arka plan inert ve tetikleyiciye odak dönüşünü uygula
- [x] Escape, backdrop, geri düğmesi ve history back akışını tek kapatma yolunda birleştir
- [x] Panel taşıma snapshot/restore ve art arda açılışları idempotent yap
- [x] Hedefli test, tam test, build ve diff kontrolünü geçir
- [x] Commit/push/PR/merge sonrası GitHub Pages canlı smoke kontrolünü tamamla

## Faz 54 Review

- Overlay artık etiketli modal dialog; ilk odak geri düğmesinde, arka plan inert ve Tab odağı yüzey içinde kalıyor.
- Escape, backdrop, header geri düğmesi ve browser back aynı idempotent kapatma hattını kullanıyor.
- Panel parent/sibling, inline style, ARIA, aktif sınıf ve scroll durumu snapshot ile geri yükleniyor.
- Manuel kapanış kendi history kaydını temizliyor; popstate kapanışı ikinci kez history hareketi üretmiyor.
- Doğrulama: 12 test dosyası, 276 test ve PWA build geçti; 390×844 tarayıcı smoke kontrolünde odak dönüşü, inert, yatay overflow ve panel restore doğrulandı.

> Tarih: 2026-08-04 · Kaynak: `ROADMAP6.md` · Faz 53 tamamlandı.

## Dalga 1 — Doğruluk ve hızlı kazanım

- [x] Faz 53 — Baseline, mobil geometri ve safe-area
- [x] Faz 54 — Overlay, focus, history ve surface güvenilirliği
- [x] Faz 55 — Mobil menü ve bağlamsal aksiyonlar
- [ ] Dalga 1 kullanıcı değerlendirmesi: yeni 1.png–3.png karşılıklarını karşılaştır

## Dalga 2 — Görev akışları

- [x] Faz 56 — Hazırla ve kişi yönetimi akışı
  - [x] Mobilde Grup Bilgileri, Kişi Ekle, Kişi Listesi ve Mesaj Akışı bölümlerinden yalnız birini açık tut
  - [x] Boş/dolu kişi listesine göre doğru başlangıç bölümünü aç
  - [x] Yeni kişi ve mevcut kişi düzenleme aksiyonlarını bağlama göre sadeleştir
  - [x] Kişi kartlarından avatar URL gürültüsünü kaldır; düzenleme ve mesaj ekleme hedeflerini erişilebilir yap
  - [x] Kişi sayacı ve yüksek kişi sayısında arama/filtre ekle
  - [x] Mesaj ekleme sonrası Mesaj Akışı bölümüne görünür geri bildirim sağla
  - [x] Hedefli test, tam test/build ve mobil geometri sözleşmelerini tamamla
- [ ] Faz 57 — Ayarlar bilgi mimarisi
- [ ] Faz 58 — Mobil Senaryo Editörü görev akışı
- [ ] Dalga 2 kullanıcı değerlendirmesi: görev adımı ve kullanılabilirlik kontrolü

## Dalga 3 — Sağlamlaştırma

- [ ] Faz 59 — Surface konsolidasyonu, görsel cila ve release
- [ ] Full test, PWA/portable build ve üç viewport kanıt paketi

## Uygulama kararı

- Sonraki uygulanacak kapsam: Faz 57
- Her faz ayrı branch/commit
- Faz kapısı geçmeden sonraki faza ilerleme
- Ayrı mobil renderer: yalnız Faz 56–58 sonunda gerekirse

## Faz 56 Review

- Mobil Hazırla yüzeyinde dört ana görev bölümü artık birbirini dışlıyor; kişi varsa Kişi Listesi, yoksa Kişi Ekle açılıyor.
- Kişi kartları avatar URL metninden arındırıldı; büyük, klavye ile erişilebilir düzenleme hedefi ve açık “Mesaj Ekle” eylemi kazandı.
- Yeni/düzenleme formu bağlama göre başlık ve aksiyon değiştiriyor; silme yalnız düzenlemede, avatar kaldırma yalnız avatar varken gösteriliyor ve mevcut avatar kaldırma geri alınabiliyor.
- Liste başlığında kişi sayısı var; arama 10 ve üzeri kişide görünür olup 20 kişilik durumda veriyi değiştirmeden filtreliyor.
- Inline oluşturucudaki alanlar programatik etiketlendi; “Akışa Ekle” sonrasında Mesaj Akışı açılıyor ve odağı alıyor.
- Doğrulama: Faz 56 hedefli 30 test, tam pakette 12 dosya/284 test ve PWA build geçti. Yerel URL, uygulama tarayıcısının güvenlik politikasıyla engellendiği için canlı viewport turu çalıştırılamadı; 320–390 px kuralları responsive CSS ve DOM sözleşmeleriyle korundu.

## Faz 53 Review

- Overlay üst sınırı ayarlanabilir status bar yüksekliği ve safe-area ile senkronlandı.
- Overlay body alt safe-area padding'i aldı; header, oynatma ve menü kapatma hedefleri 44px oldu.
- Kompakt landscape telefon görünümü `900×500` sınırına kadar mobil sözleşmede tutuldu.
- Mobilde masaüstünden kalan `500px` telefon minimum yüksekliği kaldırıldı.
- Test: 11 dosya, 274 test geçti.
- Build: PWA üretim build'i geçti.
- Browser: `360×640`, `390×844`, `844×390`; clipping ve yatay overflow yok, status bar 0–28px ve overlay 28px'den başlıyor.

---

## Arşiv — Önceki tamamlanan görev

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
