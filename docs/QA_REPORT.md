# Local CRM verification

Verified on 2026-10-01 in the cloud Linux workspace with Node 24.19.0 and sandboxed headless Chromium 153. The tested source was the complete formatted draft change, not the old main branch.

## Results

- Application, Vite/Vitest configuration and browser-test TypeScript: passed
- ESLint with zero warnings allowed: passed
- Unit/integration suite: **73 tests passed across 11 files**
- Production build: passed
- Headless browser suite: **8 scenarios passed**
- `npm audit`: **0 vulnerabilities**
- `git diff --check`: passed
- Independent code review: four identified edge cases were reproduced in failing tests, fixed, and rechecked; all 23 focused review-regression tests passed

## Browser coverage

1. Company/contact create, edit and delete; association updates; navigation/reload persistence; linked-company delete protection
2. Task creation, assignment, due date, edit, Stage-select move and deletion; actual pointer drag onto a card in another column; persisted stage after reload
3. Global search on the current route; empty results; live dashboard totals and workspace activity
4. JSON download/upload round-trip; invalid-file rejection; canceled restore; valid empty restore; download of the retained previous snapshot
5. Damaged browser storage preserved until explicit recovery; retained original bytes and successful reload
6. 390 × 844 mobile navigation; dialog focus containment, Escape/Cancel, focus restoration, Back navigation and absence of document-wide horizontal overflow
7. 1440 × 960 desktop review screenshots across the five routes; logout and direct-route demo-gate redirect
8. Wrong demo credentials keep the form mounted, retain input and show a readable error

Unit/integration regressions additionally cover known IDs and links, duplicate record IDs, whitespace names, invalid email/status/date/money/URLs, maximum-length activity text, oversized mutation rejection, a 490-task portable export near the backup limit, quota-failure session edits and recovery copies. Drag boundary tests cover colliding numeric task/stage IDs and canceled/invalid drops. Dialog tests cover keyboard Tab cycling, focus restoration and body scroll restoration.

## Screenshots

- [Desktop dashboard](qa/desktop-dashboard.png)
- [Desktop companies](qa/desktop-companies.png)
- [Desktop contacts](qa/desktop-contacts.png)
- [Desktop tasks](qa/desktop-tasks.png)
- [Desktop settings](qa/desktop-settings.png)
- [Mobile dashboard](qa/mobile-dashboard.png)
- [Mobile company dialog](qa/mobile-company-dialog.png)

## Boundaries

This is a local CRM, not a secure server-backed or multi-user application. Deal records are clearly labelled read-only examples. It stores the latest 200 activity entries and supports backups up to 5 MiB. Recovery-copy writes can be refused when browser storage is full; the working snapshot is preserved and the error is shown. Use one active editing tab; concurrent-tab conflict resolution is not provided. Persisted application data is not encrypted.

Keyboard stage changes are tested through the edit form; browser drag geometry is tested with the pointer. dnd-kit keyboard sensor wiring is unit-tested. The production build emits a non-blocking bundle-size advisory (approximately 199 kB gzip JavaScript), not a failed check. GitHub Actions status must be checked against the exact published head commit separately from these local results.
