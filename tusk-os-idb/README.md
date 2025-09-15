# TUSK-OS IDB (IndexedDB-based)

Pure-static, local-first system using IndexedDB as primary storage. Exports to JSON, CSV, and SQLite (.sqlite) without any server.

- No build, no npm. Open `apps/start.html` directly.
- Works offline via file:// using only browser APIs and local assets.

## Structure
- `lib/idb.js` — IndexedDB wrapper (TuskIDB)
- `lib/sqlite-export.js` — Builds a SQLite DB in-memory using sql.js from IDB data
- `lib/ui.css` — Uses the shared UI from `tusk-os-static/lib/ui.css`
- `apps/start.html` — Dashboard + export/import
- `apps/settings.html` — Company/currency settings stored in IDB
- `apps/crm.html` — Minimal CRM for leads stored in IDB

## Data model
- DB name: `tusk-idb`
- Stores:
  - `leads`: { id (auto), name, email, status, created_at }
  - `meta`: key-value for settings

## Exports
- JSON: Full dump of all stores
- CSV: Leads table only
- SQLite: Creates `leads` table and fills it, downloadable as `tusk-idb.sqlite`

## Offline sql.js
We reuse the existing sql.js assets under `tusk-os-static/lib/sqljs`. If running via file://, ensure `sql-wasm-b64.js` is present to avoid wasm fetch CORS. The exporter will try local assets first.

