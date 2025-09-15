# TUSK-OS v0 (Local-first)

This repo contains two fully client-side variants of TUSK-OS that you can run locally in your browser:

- tusk-os-static – SQLite in WebAssembly (sql.js) with localStorage persistence and a JSON fallback
- tusk-os-idb – IndexedDB-native variant with exports to JSON, CSV, and a real SQLite file

Both variants are static HTML/CSS/JS with no build step and no external server. Data persists in your browser storage under the origin you use to load the pages.

## Quick start on localhost

1. Start the simple static server (defaults to port 1234):

   ```sh
   ./scripts/serve_localhost.sh 1234
   ```

2. Open the launcher:

   - http://localhost:1234/

3. Or go directly to a variant:

   - SQLite/sql.js: http://localhost:1234/tusk-os-static/apps/start.html
   - IndexedDB: http://localhost:1234/tusk-os-idb/apps/start.html

## Notes

- The SQLite/sql.js variant works offline and can export/import a real `.sqlite` file.
- The IndexedDB variant stores data natively in the browser and can export JSON, CSV, and SQLite (via in-memory sql.js).
- Each origin keeps its own storage. When switching between `file://` and `http://localhost:1234`, consider exporting/importing to migrate data if needed.

## Repo structure

- `tusk-os-static/` – Original static app using sql.js (with embedded WASM for file://) and a local JSON fallback
- `tusk-os-idb/` – New IndexedDB-based variant with extended CRM entities and exports
- `scripts/serve_localhost.sh` – One-liner static server using Python
- `index.html` – Launcher page linking to both variants

---

MIT © 2025 BajaLabs
