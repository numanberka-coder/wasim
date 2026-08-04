# WhatsApp Simulator — ROADMAP 6

> **Başlangıç:** 2026-08-04  
> **Kapsam:** Mobil üretim menüsü, tam ekran paneller, Hazırla, Ayarlar ve Senaryo Editörü UX dönüşümü  
> **Hedef:** Mevcut işlevleri ve masaüstü akışlarını bozmadan mobil deneyimi özellik listesinden görev odaklı bir üretim akışına dönüştürmek.

---

## 1. Ürün Teşhisi

Görsel dil tutarlı ve kullanılabilir bir temele sahip. Ana sorun renk veya komponent kalitesi değil; masaüstü panel yapısının mobil tam ekran yüzeye doğrudan taşınması nedeniyle mobilde uzun formlar, fazla akordeon, bağlam dışı aksiyonlar ve zayıf görev yönlendirmesi oluşmasıdır.

Bu roadmap şu hedef akışı esas alır:

1. Grup veya konuşmayı hazırla.
2. Katılımcıları ekle.
3. Mesaj akışını oluştur ve sırala.
4. Önizle veya oynat.
5. Ekran görüntüsü al, paylaş ya da projeyi dışa aktar.

## 2. Uygulama İlkeleri

- Her faz ayrı commit ve ayrı görsel doğrulama ile teslim edilir.
- Önce davranış güvenilirliği, sonra bilgi mimarisi, en son görsel cila yapılır.
- Mevcut action kimlikleri, state anahtarları ve import/export formatı zorunlu olmadıkça değiştirilmez.
- Masaüstü davranışı her fazda regresyon kapsamındadır.
- Ayrı mobil renderer baştan zorunlu tutulmaz. Önce düşük riskli düzenlemelerle UX hipotezi doğrulanır.
- Her faz sonunda üç viewport kanıtı alınır: `360×640`, `390×844`, `844×390`.
- Her fazın sonunda devam, revize veya geri al kararı verilir.

## 3. Kapsam Dışı

- Mesaj parser söz diziminin değiştirilmesi
- State şemasının veya JSON dışa aktarma formatının yeniden tasarlanması
- Telefon önizlemesinin WhatsApp görsel dilinin baştan çizilmesi
- İlk fazlarda bütün modal ve panellerin tek seferde yeniden yazılması
- Doğrulanmış bir ihtiyaç oluşmadan ikinci bir mobil DOM ağacı/duplicate ID düzeni kurulması

---

## ✅ Faz 53 — Baseline, Mobil Geometri ve Safe-area

### Amaç

Mevcut davranışı ölçülebilir biçimde kilitlemek ve Ayarlar/Hazırla başlığının status bar altında kesilmesini düzeltmek.

### Kapsam

- Mevcut mobil menü, overlay, phone editor ve modal davranışları için başlangıç smoke kaydı
- Tam ekran overlay ile sahte status bar/safe-area geometrisinin düzeltilmesi
- Header sabitken yalnız içerik gövdesinin kayması
- Header, geri ve kapatma hedeflerinin en az `44×44px` olması
- Portre ve landscape overflow kontrolü

### Muhtemel dosyalar

- `css/responsive.css`
- `css/phone.css`
- `index.html`
- `tests/menu-order.test.js`
- `tests/phone-shell.test.js`

### Kapsam dışı

- Menü metinleri ve grupları
- Panel içerik sırası
- Focus/history mimarisinin yeniden yazılması

### Kabul kriterleri

- `360×640`, `390×844` ve landscape görünümde başlık ile geri düğmesi tamamen görünür.
- Son kontrol erişilebilir; yatay scroll oluşmaz.
- Gerçek mobil düzen ve masaüstü telefon önizlemesi aynı geometri sözleşmesini korur.
- Home, chat, bottom navigation ve phone editor katmanları bozulmaz.
- Mevcut testler, hedef testler ve build geçer.

### Çıkış kapısı

Üç viewportta önce/sonra ekran görüntüsü onaylanmadan Faz 54 başlamaz.

---

## Faz 54 — Overlay, Focus, History ve Surface Güvenilirliği

### Amaç

Tam ekran mobil paneli görsel bir `div` olmaktan çıkarıp güvenilir ve erişilebilir bir uygulama yüzeyi yapmak.

### Kapsam

- `role="dialog"`, `aria-modal`, başlık ilişkisi ve açık/kapalı ARIA durumu
- Açılışta anlamlı odağa geçiş; kapanışta tetikleyiciye odak dönüşü
- Focus trap ve arka plan `inert` yönetimi
- Escape, backdrop, geri düğmesi ve browser/Android back için tek kapanış hattı
- Overlay açma işleminin idempotent olması; ikinci panel açılışında orphan panel oluşmaması
- Taşınan panelin parent, sibling, display, ARIA, inline style ve scroll durumunun eksiksiz geri yüklenmesi
- Manuel kapanıştan sonra hayalet history kaydı kalmaması

### Muhtemel dosyalar

- `index.html`
- `js/ui/mobile.js`
- `css/responsive.css`
- `tests/menu-order.test.js`
- Yeni `tests/mobile-surfaces.test.js`

### Kapsam dışı

- Panel içeriklerinin yeniden tasarlanması
- Bütün modal türlerinin aynı fazda ortak yöneticide birleştirilmesi

### Kabul kriterleri

- Yalnız klavyeyle overlay açılabilir, gezilebilir ve kapatılabilir.
- Tab odağı açık overlay dışına kaçmaz.
- Kapanıştan sonra odak doğru menü tetikleyicisindedir.
- Escape, backdrop, geri düğmesi ve history back aynı yüzeyi yalnız bir kez kapatır.
- `open → close → open` ve art arda farklı panel açma senaryoları stale state üretmez.
- Uzun panelde scroll ve sanal klavye sonrası son eylem erişilebilir kalır.

### Çıkış kapısı

Focus, history veya panel restore regresyonu varsa yeni UX değişikliğine geçilmez; bu faz yerinde düzeltilir.

---

## Faz 55 — Mobil Menü ve Bağlamsal Aksiyonlar

### Amaç

Mobil komuta merkezini daha kısa, anlaşılır ve player durumuna duyarlı hâle getirmek.

### Kapsam

- Tek öğeli grup başlıklarının kompaktlaştırılması
- `Diğer` adının `Proje` olarak değiştirilmesi
- `Kaydet/Yükle` yerine `Dışa Aktar/İçe Aktar`
- Ekran görüntüsü açıklamasının gerçek Kopyala/Paylaş/İndir akışını anlatması
- Oynat/Duraklat kontrolünün player durumuna göre toggle veya disabled state kullanması
- Panel bazlı header aksiyonları: Ayarlar’da playback yok; Hazırla’da yalnız ilgili önizleme; Senaryo’da gerekli kontroller
- Sheet kaydırılabiliyorsa alt fade/scroll işareti
- Gerçek swipe davranışı eklenmeyecekse dekoratif drag handle’ın kaldırılması
- Simple/Pro modda gizli hedeflere yönlendiren CTA’ların düzeltilmesi

### Muhtemel dosyalar

- `js/ui/menu-model.js`
- `js/ui/mobile.js`
- `index.html`
- `css/responsive.css`
- `tests/menu-order.test.js`

### Korunacak sözleşmeler

- Menü action kimlikleri
- Masaüstü workflow menüsü
- Arrow, Home, End, Enter, Space ve Escape navigasyonu
- Home ve chat içindeki iki menü tetikleyicisinin aynı modeli kullanması

### Kabul kriterleri

- Bütün temel eylemler üç viewportta erişilebilir.
- JSON işlemleri autosave ile karıştırılmayacak şekilde adlandırılmıştır.
- Oynat/Duraklat durumu player state ile senkrondur.
- Ayarlar header’ında bağlam dışı oynatma aksiyonu yoktur.
- Menü yeniden açıldığında stale aktif/disabled state kalmaz.
- Simple ve Pro görünürlük kuralları tutarlıdır.

### Çıkış kapısı

Bu faz sonunda kullanıcıya yeni 1.png karşılığı gösterilir. Menü yapısı onaylanmadan Hazırla ve Ayarlar içerikleri yeniden sıralanmaz.

---

## Faz 56 — Hazırla ve Kişi Yönetimi Akışı

### Amaç

Uzun form dokümanı hissini Grup → Katılımcılar → Mesaj Akışı görev zincirine dönüştürmek.

### Kapsam

- Mobilde aynı anda varsayılan olarak yalnız bir ana bölümün açık olması
- Kişi yoksa `Kişi Ekle`, kişi varsa `Kişi Listesi` başlangıç durumu
- `+ Satır` yerine `Mesaj Ekle` veya `Akışa Ekle`
- Kişi kartlarından avatar URL gürültüsünün kaldırılması
- Kart tıklamasının gerçek edit davranışı kazanması veya yanlış pointer affordance’ının kaldırılması
- `Sil` eyleminin yalnız mevcut kişi düzenlenirken görünmesi
- `Avatar Sil` eyleminin yalnız avatar varken görünmesi; confirm veya geri al sözleşmesi
- Form aksiyonlarının yeni kişi ve mevcut kişi durumuna göre ayrılması
- Liste başlığında kişi sayısı; yüksek sayıda arama/filtre
- Mesaj eklendikten sonra akışa geçiş veya `Akışta gör` geri bildirimi
- Programatik label, hata ve accessible-name bağlantılarının tamamlanması

### Muhtemel dosyalar

- `index.html`
- `js/features/people.js`
- `js/ui/validation.js`
- `css/panels.css`
- `css/components.css`
- `css/responsive.css`
- İlgili state ve UI testleri

### Kapsam dışı

- People state şemasının değiştirilmesi
- Avatar depolama biçiminin değiştirilmesi
- Script builder komut formatının değiştirilmesi

### Kabul kriterleri

- İlk açılışta dört açık akordeon görünmez.
- Yeni kişi ekleme ve mevcut kişiyi düzenleme en fazla iki ana navigasyon adımıdır.
- `320px` genişlikte eylemler taşmaz; kritik hedefler en az `44×44px` olur.
- Boş, 5 kişilik ve 20 kişilik listeler kullanılabilir kalır.
- Yalnız touch ve yalnız klavye ile kişi oluşturulup mesaj akışına eklenebilir.
- Kişi silme, yeniden adlandırma, `Sen` seçimi ve avatar işlemleri regresyonsuz çalışır.

### Çıkış kapısı

Yeni 3.png karşılığı ile eski ekran yan yana değerlendirilir. Görev adımı azalmadıysa görsel cila yapılmadan akış tekrar ele alınır.

---

## Faz 57 — Ayarlar Bilgi Mimarisi

### Amaç

Ayarları teknik DOM sırasından çıkarıp kullanıcının aradığı kavramsal gruplara ayırmak.

### Hedef gruplar

- **Görünüm:** tema, tipografi, duvar kâğıdı, başlık ve balon renkleri
- **Mesaj Davranışı:** tik durumu, mesaj saatleri, durum çubuğu
- **Proje ve Veri:** sahneler, kullanım özeti ve ilgili proje kontrolleri
- **Yardım:** arayüz modu ve rehberi yeniden göster

### Kapsam

- `Dark/Light` metinlerinin `Koyu/Açık` yapılması
- Aynı anda yalnız bir ayar akordeonunun açık olması veya kategori navigasyonu
- Onboarding hedeflerinin buton görünümünden tamamlandı/bekliyor listesine dönüştürülmesi
- Tema seçiminin ARIA state ile ifade edilmesi
- Label/control ve validation bağlantılarının tamamlanması
- Otomatik uygulama/kayıt davranışının açıkça belirtilmesi

### Muhtemel dosyalar

- `index.html`
- `js/app.js`
- `css/components.css`
- `css/responsive.css`
- `tests/state.test.js`
- `tests/menu-order.test.js`

### Korunacak sözleşmeler

- Mevcut ayar ID’leri ve state anahtarları
- Import sonrası form doldurma
- Dark/light ve Simple/Pro davranışı
- Typography ve wallpaper’ın telefon önizlemesine uygulanması

### Kabul kriterleri

- Her ayar en fazla kategori + kontrol olmak üzere iki anlamlı seviye altındadır.
- Tema ilk viewport içinde bulunabilir.
- Sahneler ve analitik görünüm ayarları arasında yer almaz.
- Kullanıcı yalnız klavye veya touch ile ayar değiştirip geri dönebilir.
- Değişiklik reload sonrasında korunur.
- Yeni 2.png karşılığında header kırpılması, bağlam dışı aksiyon ve gereksiz çerçeve katmanı yoktur.

### Çıkış kapısı

Ayar bulma görevi üç örnek üzerinden doğrulanır: tema değiştir, mesaj saatini kapat, rehberi yeniden göster.

---

## Faz 58 — Mobil Senaryo Editörü Görev Akışı

### Amaç

Mobil senaryo editörünü teknik metin alanı merkezli bir panelden mesaj akışı merkezli bir üretim aracına dönüştürmek.

### Hedef akış

1. Mesaj akışını gör.
2. `+ Mesaj Ekle` ile kişi ve içerik seç.
3. Mesajı düzenle veya sil.
4. Yalnız `Sırala` modunda sürükleme tutamaçlarını göster.
5. Önizle, oynat, duraklat veya sıfırla.
6. Hatalı satırı anlaşılır biçimde bul ve düzelt.

### Kapsam

- Mobilde sticky `+ Mesaj Ekle` ana eylemi
- Kişi seçimini kısa bir picker/sheet üzerinden yapma
- Mesaj kartlarında düşük ağırlıklı düzenle/sil eylemleri
- Silme sonrası geri al
- Reorder modunun normal düzenleme görünümünden ayrılması
- Parser hataları için özet ve ilgili satıra odak
- Editör iç tab state’inin overlay kapat/aç sırasında korunması
- Oynatma state’inin görünür ve erişilebilir biçimde duyurulması

### Muhtemel dosyalar

- `index.html`
- `js/features/script-builder.js`
- `js/features/script-parser.js`
- `js/features/player.js`
- `js/ui/mobile.js`
- `css/panels.css`
- `css/responsive.css`
- `tests/script-parser.test.js`
- `tests/player.test.js`
- Yeni mobil senaryo akışı testleri

### Kapsam dışı

- Script formatının değiştirilmesi
- Desktop editörün kaldırılması
- İlk iterasyonda tam WYSIWYG mobil renderer zorunluluğu

### Kabul kriterleri

- Geçerli bir senaryo mobilde sıfırdan oluşturulup oynatılabilir.
- Hatalı satır bulunup düzeltilebilir; hata yalnız renkle anlatılmaz.
- Uzun senaryoda ana ekleme ve oynatma eylemleri erişilebilir kalır.
- Overlay kapanıp yeniden açıldığında içerik ve aktif editör sekmesi kaybolmaz.
- Hazırla ekranından aktarılan mesajlar editörde doğru görünür.
- Parser, player ve interactive-engine regresyon testleri geçer.

### Çıkış kapısı

Bir kısa ve bir uzun örnek senaryo mobilde baştan sona oluşturulup oynatılmadan Faz 59 başlamaz.

---

## Faz 59 — Surface Konsolidasyonu, Görsel Cila ve Release

### Amaç

Doğrulanmış davranışları ortak bir yüzey koordinasyonuna taşımak; tekrarları azaltmak ve release kalitesinde cihaz regresyonu yapmak.

### Mimari kapsam

- Yeni `SurfaceManager`: aktif surface/stack, backdrop sahipliği, focus, inert, Escape, scroll lock ve history adapter
- İlk adaptör olarak full mobile overlay
- Sonra ayrı değişikliklerle mobile action sheet, phone editor, generic modal ve onboarding
- DOM taşıma devam edecekse güvenli `PanelPortal`: parent/sibling/style/scroll snapshot ve idempotent restore
- Panel başlığı, header/footer aksiyonları, Simple/Pro ve varsayılan disclosure için metadata-driven model
- Responsive CSS tekrarlarının konsolidasyonu ve z-index tokenları

### Önemli sınır

Ayrı mobil renderer yalnız Faz 56–58 sonunda mevcut DOM taşıma yaklaşımı doğrulanmış UX’i engelliyorsa açılır. Gerekirse göç sırası `Ayarlar → Hazırla → Senaryo` olur. Bu karar ayrı bir roadmap maddesi veya alt faz olarak alınır; Faz 59’un zorunlu teslimi değildir.

### Görsel ve erişilebilirlik cilası

- Yeşilin yalnız primary, seçili ve başarılı durumlarda baskın olması
- Açık akordeon border/ikon ağırlığının azaltılması
- Görünür focus halkaları
- Küçük metin ve `Sen` rozeti kontrastının AA seviyesine getirilmesi
- Reduced motion, yüksek kontrast ve `%200` zoom kontrolü
- Dark/light, Simple/Pro, boş/dolu liste durumları

### Kabul kriterleri

- Aynı anda yüzey sahipliği belirsiz iki backdrop/modal kalmaz.
- Kritik akış iki kez art arda çalıştırıldığında stale state oluşmaz.
- `360×640`, `390×844` ve landscape tam görev turu geçer.
- Home → Menü → Hazırla → Senaryo → Ayarlar → Phone editor → Confirm → Screenshot turu hatasızdır.
- Kritik/major erişilebilirlik bulgusu kalmaz.
- Full test, coverage, PWA build ve portable build geçer.
- Console error, network 404, clipping, focus escape ve yatay scroll yoktur.

---

## 4. Teslim Dalgaları

| Dalga | Fazlar | Kullanıcıya görünür sonuç | Risk |
|---|---|---|---|
| **Dalga 1 — Doğruluk ve hızlı kazanım** | 53–55 | Kırpılmayan header, güvenilir geri/focus, sade menü | Düşük–Orta |
| **Dalga 2 — Görev akışları** | 56–58 | Daha kısa Hazırla/Ayarlar ve mesaj merkezli editör | Orta |
| **Dalga 3 — Sağlamlaştırma** | 59 | Ortak surface sözleşmesi, cila ve release kanıtı | Orta–Yüksek |

Önerilen ilk deneme Dalga 1’dir. Bu dalga kullanıcıya görünür iyileştirme sağlar fakat state şeması veya senaryo motoruna dokunmaz; dolayısıyla geri alma maliyeti düşüktür.

## 5. Her Fazın Kanıt Paketi

1. İlgili hedef test çıktısı
2. Full `npm.cmd test`
3. `npm.cmd run build`
4. `git diff --check`
5. `360×640`, `390×844`, `844×390` ekran görüntüleri
6. Touch ve yalnız klavye smoke akışı
7. Focus, accessible name/role/state ve son kontrole erişim kontrolü
8. Console error ve yatay overflow kontrolü

Faz 59’da ek olarak coverage, PWA build, portable build, reduced-motion, high-contrast ve `%200` zoom doğrulaması zorunludur.

## 6. Commit ve Geri Alma Stratejisi

- Her faz kendi `codex/faz-XX-*` branch’inde uygulanır.
- Davranış testi ile kullanıcı görünümü mümkünse ayrı commitlerde tutulur.
- Focus/history düzeltmesi ile bilgi mimarisi aynı committe karıştırılmaz.
- Faz 56 ve Faz 57 paralel düşünülebilir; aynı committe birleştirilmez.
- Faz kapısı geçmezse sonraki faza ilerlemek yerine yalnız ilgili faz geri alınır veya revize edilir.
- Kullanıcının çalışma ağacındaki ilişkisiz dosyalar stage edilmez.

## 7. Başarı Ölçütleri

- Başlık veya geri kontrolü hiçbir hedef viewportta kırpılmaz.
- Mobil menüde temel bir eyleme ulaşmak için gereksiz kategori taraması azalır.
- Yeni kullanıcı kişi ekleyip ilk mesajı mevcut akıştan daha az ana adımla oluşturur.
- Ayarlar içinde tema, mesaj saati ve rehber görevleri doğrudan bulunabilir.
- Senaryo editöründe ana odak mesaj akışıdır; teknik komut bilgisi temel akış için zorunlu değildir.
- Açık yüzeylerde focus kaybı, hayalet history adımı veya pointer çakışması oluşmaz.
- Masaüstü üretim paneli, import/export, oynatma ve screenshot davranışları korunur.
