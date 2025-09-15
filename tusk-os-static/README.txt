TUSK-OS Static v0 (no server)
1) Open apps/start.html by double-clicking in Finder (file:// URL).
2) Use Settings to set company/currency (stored locally).
3) Use CRM to add leads. Data is SQLite (sql.js) persisted in localStorage.
4) Optional: Export DB to a real tusk.sqlite and Import later.

Notes:
- This runs offline except it loads sql.js from a CDN. If you need fully offline, download sql.js locally and update lib/db.js `locateFile`.
- Browsers keep storage per browser/profile. Clearing site data clears the DB.
