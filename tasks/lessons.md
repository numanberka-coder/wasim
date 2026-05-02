# Lessons Learned

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
