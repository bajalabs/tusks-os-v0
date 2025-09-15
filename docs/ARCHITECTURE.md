# Architecture

TUSK‑OS v0 is a pure static, local‑first app suite. This document describes the module layout, storage model, and UI shell.

## Modules

- `tusk-os-idb/apps/` — individual HTML pages for each app/view
- `tusk-os-idb/lib/idb.js` — IndexedDB access layer with entity‑level helpers and exports
- `tusk-os-idb/lib/layout.js` — shared app shell: global header + per‑app sidebar
- `tusk-os-idb/lib/ui.css` — dark theme + responsive grid shell
- `tusk-os-idb/lib/sqlite-export.js` — builds SQLite exports using sql.js on demand
- `tusk-os-idb/lib/sqljs/` — vendored sql.js assets (wasm, js) for file:// compatibility

## Data Storage

Primary store: IndexedDB. Stores created lazily on upgrade:

- leads: indexes by_created, by_name, by_email, by_company, by_owner, by_stage
- accounts: indexes by_created, by_name, by_domain, by_owner
- contacts: indexes by_created, by_name, by_email, by_account, by_owner
- deals: indexes by_created, by_name, by_stage, by_owner, by_account
- activities: indexes by_created, by_type, by_owner, by_related
- meta: generic key/value (settings under key `settings`)

IDB helper exposes:
- ready(), get/save settings
- add/list for each entity
- counts per store
- exportJSON(), exportCSV()

## SQLite Export

- Export path uses sql.js (WebAssembly SQLite) loaded only when needed
- A new in‑memory DB is constructed with appropriate tables and inserts
- The resulting `.sqlite` Blob is offered for download
- Assets are vendored locally and referenced relatively for file://

## UI Shell

- Header across the top for global navigation (apps)
- Sidebar on the left for the active app’s sections
- Content area is the remaining grid cell
- Mobile: sidebar overlays beneath header; toggled by hamburger

Layout is initialized per page:

```js
TuskLayout.initLayout({
  activeMain: 'crm',
  side: [
    { label: 'Leads', href: 'crm.html' },
    { label: 'Accounts', href: 'accounts.html' },
    // ...
  ]
});
```

If `side` is omitted, sensible defaults are provided (e.g., CRM sections).

## Security and Privacy

- No network is required to run; all data remains in the browser
- Exports produce portable artifacts (JSON/CSV/SQLite)
- No analytics or third‑party calls by default

## Branching Strategy (context)

- main: IndexedDB‑first implementation (this)
- wasm: historical static sql.js prototype
- localhost: optional local server launcher and helpers

Private companion repo may exist for local workflows; keep secrets out of public.
