# Faz 36-40 - Menu UX Roadmap Devami

> Tarih: 2026-05-02
> Branch: codex/faz-35
> Kaynak: ROADMAP4.md devami / menu UX sohbeti
> Durum: Uygulaniyor

---

## Amaç

ROADMAP4.md icine mevcut Faz 28-35'in devami olarak menu deneyimini toparlayan
Faz 36-40 maddelerini eklemek. Kapsam kod implementasyonu degil; menu sirasini,
masaustu/mobil hiyerarsiyi, ortak menu modelini ve dogrulama ihtiyacini roadmap
seviyesinde netlestirmek.

---

## Görevler

- [x] 1. Mevcut repo durumunu dogrula:
      - `git status --short`
      - `git branch --show-current`
      - `git remote -v`
- [x] 2. `ROADMAP4.md` mevcut faz, icindekiler, oncelik, uygulama sirasi ve KPI
      yapisini oku.
- [x] 3. Yeni fazlari mevcut fazlarin devami olarak tasarla:
      - Faz 36: Menu Mantigi & Siralama Disiplini
      - Faz 37: Masaustu Menu & Panel Duzeni
      - Faz 38: Mobil Menu & Overlay Deneyimi
      - Faz 39: Ortak Menu Modeli & Basit/Pro Kurallari
      - Faz 40: Menu Erisilebilirligi, Test & Dogrulama
- [x] 4. `ROADMAP4.md` icindekiler bolumune Faz 36-40 maddelerini ekle.
- [x] 5. Faz 35 sonrasina Faz 36-40 detay tablolarini ekle.
- [x] 6. Oncelik Ozeti ve Uygulama Sirasi bolumlerini Faz 36-40 ile guncelle.
- [x] 7. Basari Kriterleri (KPI) bolumune menu odakli olcutleri ekle.
- [x] 8. Roadmap metnini oku ve yapisal tutarliligi dogrula.
- [x] 9. Git diff'i kontrol et; yalniz hedef dosyalarin degistiginden emin ol.
- [ ] 10. Degisiklikleri commit et ve branch'i GitHub'a pushla.

---

## Kabul Kriterleri

- `ROADMAP4.md` Faz 36-40'i mevcut Faz 28-35 formatina uyumlu sekilde icerir.
- Menu sirasinda `Hazirla -> Senaryo -> Oynat -> Cikti -> Ayarlar -> Veri
  Islemleri` mantigi acikca anlatilir.
- `Tehlikeli islemler` dili yerine kullanici dostu `Veri Islemleri` cercevesi
  kullanilir.
- Oncelik Ozeti, Uygulama Sirasi ve KPI bolumleri yeni fazlari kapsar.
- Commit kapsaminda yalniz roadmap/todo dokumantasyon degisiklikleri yer alir;
  untracked `AGENTS.md` commit'e dahil edilmez.

---

## Review

- `ROADMAP4.md` icindekiler bolumu Faz 36-40 ile genisletildi.
- Faz 35 sonrasina menu UX icin bes yeni roadmap fazi eklendi.
- Faz 36 menu mantigi ve siralama disiplinini `Hazirla -> Senaryo -> Oynat ->
  Cikti -> Ayarlar -> Veri Islemleri` akisiyle tanimladi.
- Faz 37 masaustu sol panel, ust aksiyon bar ve accordion sirasini toparlama
  hedeflerini kapsiyor.
- Faz 38 mobil uc nokta menusu, gruplu menu ve overlay deneyimini kapsiyor.
- Faz 39 ortak menu modeli ve Basit/Pro gorunurluk kurallarini merkezilestirme
  hedefini ekledi.
- Faz 40 erisilebilirlik, menu sirasi testleri ve tarayici sanity check
  gereksinimlerini ekledi.
- Oncelik Ozeti, Uygulama Sirasi ve KPI bolumleri yeni fazlari kapsayacak
  sekilde guncellendi.
- Diff kontrolunde hedef degisikliklerin `ROADMAP4.md` ve `tasks/todo.md` ile
  sinirli kaldigi, untracked `AGENTS.md` dosyasinin commit kapsamina alinmadigi
  dogrulandi.
