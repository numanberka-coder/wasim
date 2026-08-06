# Lessons Learned

## Doğrulamayı tekrarlayarak token ve zaman harcama
- **Hata:** Faz 53 yayınında aynı sonucu gereğinden fazla farklı yoldan tekrar doğrulayıp süreci uzattım.
- **Kural:** Her kabul kriteri için tek güçlü kanıt seç; hedefli test, bir tam test/build turu ve tek canlı deploy smoke kontrolü yeterliyse aynı sonucu yeniden ölçme.

## GitHub yayınında mevcut bağlantıyı önce kontrol et
- **Hata:** GitHub CLI bulunmayınca, repo için hazır GitHub uygulaması ve doğrudan `git push` erişimini kontrol etmeden kullanıcıdan CLI kurulumu istendi.
- **Kural:** Önce GitHub connector araçlarını, remote push yetkisini ve workflow erişimini doğrula. Erişilebilir connector varken kullanıcıya gereksiz CLI kurulumu yükleme.

## 1. Plan onayi ZORUNLU - scope kucuk olsa bile
- **Hata:** Faz 19'da "kucuk scope" diye plani sunmadan implementasyona gectim.
- **Kural:** CLAUDE.md acik: "Onay almadan implementasyona baslama - once plan sun".
- **Duzeltme:** Her fazda plan yaz, kullaniciya sun, onay al, sonra kodla.
- **Istisna yok:** Scope buyuklugu bu kurali gecersiz kilmaz.

## 2. Mobil overlay katmanlarini pointer ile dogrula
- **Hata:** Faz 40 sonrasinda bottom sheet gorunuyordu ama backdrop, header
  stacking context'i ustunden pointer event'leri yutuyordu.
- **Kural:** Mobil menuler icin sadece DOM/ARIA testi yetmez; z-index,
  pointer ve scroll davranisi gercek browser viewport'unda dogrulanmali.
- **Duzeltme:** Menu acikken sheet'in stacking context'i backdrop'un uzerine
  cikarilmali; overlay scroll alanlarinda flex icin `min-height: 0`
  unutulmamali.

## 3. Ikon polish referans ekranla karsilastirilmali
- **Hata:** Faz 47 ortak ikon sisteminde yeni sohbet ve arama ikonlari
  teknik olarak tutarliydi ama WhatsApp referansindaki dolu/sade ikon diline
  benzemiyordu; Material/Iconify adaylari da referans ekrandaki WhatsApp
  hissinden uzak kaldi.
- **Kural:** Mobil UI ikon degisikliklerinde sadece ortak SVG sozlesmesi ve
  test yeterli degil; kullanicinin verdigi referans ekranla bicim, agirlik,
  renk ve olcu karsilastirilmali. Kritik WhatsApp benzeri ikonlarda once
  referans odakli custom stroke silhouette denenmeli; kullanici net SVG
  kaynagi verdiyse daha fazla tahmin yerine once bu kaynak temizlenip
  entegre edilmeli.
- **Duzeltme:** FAB ve kritik sekme ikonlari icin referans goruntudeki
  silhouette once ayarlanacak, sonra DOM/CSS testleriyle sozlesme korunacak.

## 5. `[hidden]` özniteliği `display:grid/flex` ile ezilir
- **Hata:** `syncPhoneHomeHeader` sekme-başına `button.hidden` ayarlıyordu ama
  `.phone-home-icon-btn { display: grid }` UA `[hidden]{display:none}` kuralını
  (eşit specificity, sonra gelen kazanır) eziyordu → kamera/arama her sekmede göründü.
- **Kural:** `[hidden]` ile gizlenecek elemanlara `display` veren bir kural varsa,
  mutlaka `.selector[hidden]{display:none}` override'ı ekle. JS'in `.hidden=true`
  yazması, CSS layout testleri olmadan (jsdom) yakalanmaz; canlı `getComputedStyle`
  ile doğrula.

## 6. UI metinleri doğru Türkçe karakterlerle yazılmalı
- **Hata:** Telefon shell ve editor metinleri ASCII-only kalmıştı (`Guncellemeler`,
  `Hizli`, `Cevapsiz`, `dun`, `Yildiz`...). Kullanıcı tüm sekmelerde eksik Türkçe
  karakter bildirdi.
- **Kural:** README "UI metinleri Türkçe" diyor — string'lerde ş/ı/ğ/ü/ö/ç/İ doğru
  kullanılmalı. Test assertion'ları da gerçek metinle eşleşmeli; ASCII placeholder
  bırakma. Yeni metin eklerken Türkçe karakter taraması yap.

## 4. Dolgu ikonlar optik olcekle dengelenmeli
- **Hata:** Kullanici tarafindan verilen dolu SVG ikonlar dogru aileye yaklasti
  ama ayni piksel kutusunda chat header kamerasi kucuk, telefonu buyuk;
  yeni sohbet ve yeni arama FAB zeminleri de fazla kalin/parlak gorundu.
- **Kural:** Dolu SVG ikonlarda ayni `width/height` degeri optik esitlik
  anlamina gelmez. Kamera/video, telefon ve arti ikonlari icin host bazli
  olcek; FAB'lerde de zemin boyutu, radius, golge ve marka yesili birlikte
  referans ekrana gore ayarlanmali.
- **Duzeltme:** Kritik FAB ve chat header ikonlari icin genel ikon sozlesmesi
  korunacak, ama sorunlu `data-phone-icon` hedeflerine ozel olcu verilecek.
