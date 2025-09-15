TUSK-OS Static v0 (no server)
1) Open apps/start.html by double-clicking in Finder (file:// URL).
2) Use Settings to set company/currency (stored locally).
3) Use CRM to add leads. Data is SQLite (sql.js) persisted in localStorage.
4) Optional: Export DB to a real tusk.sqlite and Import later.

Notes:
- This runs offline except it loads sql.js from a CDN. If you need fully offline, download sql.js locally and update lib/db.js `locateFile`.
- Browsers keep storage per browser/profile. Clearing site data clears the DB.

FALLBACK MODE (no SQLite available)
----------------------------------
If the browser blocks WASM over file:// or the sql.js CDN can’t load, the app automatically falls back to a localStorage-only database. The UI will show “Local storage (fallback)”. In this mode:
- Data still persists locally (per browser profile) via localStorage.
- Export produces a JSON backup: tusk-local-backup.json
- Import accepts this JSON backup to restore your data.

Tip: when you later run with SQLite enabled (e.g., serve over http or bundle sql.js locally), you can import/export as a real tusk.sqlite again.
