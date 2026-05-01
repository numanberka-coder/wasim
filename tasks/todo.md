# CI Fix - GitHub Actions test workflow

> Tarih: 2026-05-02
> Branch: codex/faz-35
> Kaynak: GitHub Actions job 74004708672
> Durum: Uygulaniyor

---

## Amaç

Pull request icin `Test / test (20.x)` job'inin 4 saniyede `Input required and
not supplied: filters` hatasiyla dusmesini duzeltmek. Hata
`dorny/paths-filter@v3` adiminda `filters` input'u olmadigi icin olusuyor.
Workflow gecmisinde `327810d` commit'inin yalniz `filters` alanini degil,
`setup-node`, `npm ci`, `npm test`, coverage ve artifact adimlarini da
placeholder yorumla degistirdigi goruldu.

---

## Gorevler

- [x] 1. Mevcut repo durumunu dogrula:
      - `git status --short`
      - `git branch --show-current`
      - `git remote -v`
- [x] 2. GitHub Actions job 74004708672 loglarini ve step sonucunu oku.
- [x] 3. `.github/workflows/test.yml` mevcut durumunu ve workflow gecmisini
      karsilastir.
- [x] 4. `dorny/paths-filter@v3` adimina `filters` input'unu geri ekle.
- [x] 5. Eksik test akislarini geri yukle:
      - `actions/setup-node@v4`
      - `npm ci`
      - `npm test`
      - Node 22 icin coverage
      - coverage artifact upload
- [x] 6. Workflow dosyasini yapisal olarak dogrula.
- [x] 7. Yerel dogrulama calistir:
      - `npm.cmd test`
      - `npm.cmd run build`
- [x] 8. Git diff'i kontrol et; yalniz hedef dosyalarin staged oldugundan emin
      ol.
- [ ] 9. Commit at ve branch'i GitHub'a pushla.
- [ ] 10. Remote branch SHA'sini dogrula.

---

## Kabul Kriterleri

- `dorny/paths-filter@v3` artik `filters` input'u alir.
- Workflow yeniden `npm ci`, `npm test` ve Node 22 coverage adimlarini calistirir.
- Job-level `contents: read` ve `pull-requests: read` izinleri korunur.
- Lokal test/build basarili olur.
- Commit kapsaminda `.github/workflows/test.yml` ve `tasks/todo.md` disinda
  dosya yer almaz; untracked `AGENTS.md` commit'e alinmaz.

---

## Review

- GitHub job 74004708672 step loglari okundu; `Detect coverage-relevant changes`
  adimi `Input required and not supplied: filters` hatasiyla dusuyor.
- `.github/workflows/test.yml` icinde `dorny/paths-filter@v3` adiminin
  placeholder yorumla kaldigi ve `filters` input'unun olmadigi dogrulandi.
- Workflow gecmisinde `327810d` commit'inin test adimlarini da sildigi goruldu;
  bu nedenle yalniz `filters` eklemek yerine eksik test hatti da geri yuklendi.
- `filters` altinda `code` grubu geri eklendi; JS, test, package, Vite/Vitest
  config ve workflow dosyasi coverage-relevant kabul ediliyor.
- `actions/setup-node@v4`, `npm ci`, `npm test`, Node 22 coverage ve coverage
  artifact adimlari geri getirildi.
- Sandbox icinde `npm.cmd test` ve `npm.cmd run build`, esbuild child process
  baslatirken `spawn EPERM` ile takildi; ayni komutlar izinli calistirmada
  basarili oldu.
- `npm.cmd test` sonucu: 8 test dosyasi, 217 test basarili.
- `npm.cmd run build` sonucu: Vite build basarili.
- Staged kapsam yalniz `.github/workflows/test.yml` ve `tasks/todo.md`; untracked
  `AGENTS.md` commit kapsamina alinmadi.
