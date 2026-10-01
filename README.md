# Admin Dashboard · Local CRM

A usable, single-browser CRM for companies, contacts and Kanban tasks. It runs entirely in the browser; no backend, paid API or API key is needed.

## Run

Use Node.js 24 (or a supported version from `package.json`).

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Demo credentials are `michael@dundermifflin.com` / `demo demo`. This is a local demo gate, **not secure authentication**. Never enter a real password. Logout closes the demo session and preserves the CRM workspace.

## What works

- Create, edit, search and delete companies and contacts
- Current company names/options are shared with contacts and deal snapshots
- Company deletion is blocked while contacts or deals still reference it
- Create, edit, delete, assign and move tasks between Kanban stages; drag handles and the edit form's Stage selector provide pointer and keyboard alternatives
- Companies, contacts, tasks and stage changes survive route changes and reloads
- Dashboard counts, company revenue, deal values and recent activity come from the same workspace
- Global search opens matching companies, contacts and tasks, including on the current route
- Mobile navigation and scrollable task columns, labelled controls, focus-managed dialogs, Escape/Cancel and focus restoration
- JSON backup/export with fully validated, confirmation-gated restore; invalid files leave working data untouched
- Damaged browser storage is preserved before recovery; previous and damaged snapshots can be downloaded from Settings

The initial companies, contacts, tasks and deals are examples. Deals are read-only sample records, not a live sales pipeline. No growth percentages or external notifications are fabricated. Revenue is the sum of company revenue records, rather than a count of won deals.

## Data and privacy

The versioned workspace is stored under `admin-dashboard-workspace-v1` in this browser's localStorage, separately from the demo gate. It is scoped to the browser/origin. Export backups before clearing site data or changing devices. Use one active editing tab; this app does not provide multi-user or concurrent-tab conflict resolution.

Settings exports companies, contacts, tasks, sample deals and the latest 200 activity records. Backups must be version 1, at most 5 MiB, with valid fields, unique IDs, known owners/stages, finite non-negative money, valid dates, safe http/https URLs and intact company references. Edits that would exceed the portable backup limit are rejected. A quota or disabled-storage error retains session changes and displays a warning so they can be exported.

Confirmed import preserves the current saved snapshot as a downloadable previous-workspace copy. Explicit damaged-storage recovery preserves the original bytes as a downloadable damaged-data copy. These recovery copies are local too; browser-data clearing removes them. Large imports may fail if the browser has insufficient space for both the new workspace and its recovery copy; the current data remains unchanged.

There is no server authentication, encryption, account isolation, cloud sync, deployment to existing production, or authorization system. Don't store sensitive customer information on a shared or untrusted device. A separately hosted review demo starts with its own origin-local sample data.

## Verify

```sh
npm run check
npx playwright install chromium
npm run test:e2e
npm audit
```

`check` runs application/config/browser-test TypeScript, warning-free ESLint, the full unit/integration suite and the production build. Browser tests cover CRUD and relationships, reload persistence, real pointer drops onto cards, search/counts, backup round-trip/cancel/rejection, recovery-copy downloads, damaged storage, wrong demo credentials, mobile dialog/navigation and logout. GitHub Actions runs these same checks and stores browser results/screenshots.

For an existing compatible Chromium executable, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/absolute/path/to/chromium`. The QA configuration keeps Chromium sandboxing enabled.

```sh
npm run build
npm run preview
```

Serve `dist/` with an HTTP server that supports SPA fallback to `index.html`; opening it through `file://` is not supported. Screenshots and verification details are in [docs/QA_REPORT.md](docs/QA_REPORT.md).
