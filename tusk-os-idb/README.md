# TUSK-OS IDB (IndexedDB-based)

Pure-static, local-first system using IndexedDB as primary storage. Exports to JSON, CSV, and SQLite (.sqlite) without any server.

- No build, no npm. Open `apps/start.html` directly.
- Works offline via file:// using only browser APIs and local assets.

## Structure
- `lib/idb.js` — IndexedDB wrapper (TuskIDB)
- `lib/sqlite-export.js` — Builds a SQLite DB in-memory using sql.js from IDB data
- `lib/ui.css` — Uses the shared UI from `tusk-os-static/lib/ui.css`
- `apps/start.html` — Dashboard + export (JSON/CSV/SQLite) and totals
- `apps/settings.html` — Company/currency settings stored in IDB
- `apps/crm.html` — Leads (extended fields)
- `apps/accounts.html` — Accounts
- `apps/contacts.html` — Contacts
- `apps/deals.html` — Deals
- `apps/activities.html` — Activities

## Data model
- DB name: `tusk-idb`
- Stores:
  - `meta`: key-value for settings
  - `leads`: { id, name, email, phone, company, source, owner, stage, tags[], notes, status, created_at }
  - `accounts`: { id, name, domain, phone, owner, notes, created_at }
  - `contacts`: { id, name, email, phone, account_id, title, owner, notes, created_at }
  - `deals`: { id, name, amount, stage, owner, account_id, close_date, notes, created_at }
  - `activities`: { id, type, subject, date, related{kind,id}, owner, notes, created_at }

## Exports
- JSON: Full dump of all stores
- CSV: Leads table (extended columns)
- SQLite: Creates `leads` table and fills it, downloadable as `tusk-idb.sqlite`

## Offline sql.js
We reuse the existing sql.js assets under `tusk-os-static/lib/sqljs`. If running via file://, ensure `sql-wasm-b64.js` is present to avoid wasm fetch CORS. The exporter will try local assets first.

