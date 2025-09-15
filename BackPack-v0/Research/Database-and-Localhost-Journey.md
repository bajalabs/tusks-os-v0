# TUSK-OS v0: Database and Localhost Journey

This document captures the research, decisions, and iterations taken to build a robust, local-first CRM that runs entirely in the browser.

## Goals
- Pure-static HTML/CSS/JS, no servers or build steps required
- Local-first persistence with real backup/export options
- Professional UI/UX across Start, CRM, Settings, and extended entities
- Resilient offline experience for both file:// and http(s) contexts

## Phases

### Phase 1: Static SQLite (sql.js) with localStorage persistence
- Used sql.js (SQLite in WebAssembly) to run a full SQL database in the browser
- Persisted the SQLite DB image to localStorage as base64
- Implemented apps: Start, CRM, Settings
- Added Export/Import of a real `.sqlite` file

Pros:
- True SQL semantics; portable `.sqlite` backups

Cons:
- sql.js WASM fetch fails under `file://` due to CORS; needs workarounds

### Phase 2: UI modernization
- Introduced a shared dark UI (cards, header/nav, buttons, modals, toasts)
- Aligned pages around a consistent layout and design system

### Phase 3: Reliability and fallback
- Added a robust local JSON fallback if sql.js fails to initialize
- UI became mode-aware (SQLite vs local JSON)
- Export/import aligned with the active mode

### Phase 4: Fully offline sql.js for file://
- Embedded the `sql-wasm.wasm` as base64 (`sql-wasm-b64.js`) and passed `wasmBinary` to `initSqlJs`
- Preferred local assets with CDN fallback; remained file:// friendly

### Phase 5: Settings reliability
- Ensured DOMContentLoaded correctness and fixed settings save logic

### Phase 6: Migration utility
- Implemented migration from local JSON fallback to SQLite when WASM becomes available
- Added a UI banner/button on Start to trigger migration

### Phase 7: Parallel IndexedDB system (IDB)
- Built a separate variant using native IndexedDB as the primary store
- Stores: leads, accounts, contacts, deals, activities, meta
- Exports: JSON (full), CSV (leads), SQLite (via sql.js in-memory build)
- Apps: Start (totals), CRM (leads), Settings, Accounts, Contacts, Deals, Activities

Pros:
- No wasm dependency for regular operations
- Native, reliable browser persistence

### Phase 8: Knowledge, design, and localhost
- Documented differences between cookies/localStorage/IndexedDB, file:// constraints, and backup strategies
- Added a simple localhost static server script for a stable origin; enabled secure-context features

## Branch strategy
- main: IDB-first system (current path)
- wasm: static sql.js variant (pre-IDB lineage)
- localhost: launcher, server script, and docs around running under http(s)

## Current architecture (IDB)
- IndexedDB schema with versioned upgrades
- Wrapper (`lib/idb.js`) exposing async APIs for each entity
- UI pages using shared `lib/ui.css`
- SQLite exporter uses vendored sql.js assets under `lib/sqljs/`

## Lessons learned
- For `file://`, embed wasm or avoid it (IDB)
- IndexedDB is the best default for local-first apps; export bridges to open formats
- Origins matter: switching between file:// and http:// produces different storage; offer migration/export/import

## Next steps
- Import flows for IDB (JSON/CSV/SQLite)
- Filters/search and entity linking across pages
- Optional OPFS-based SQLite (sqlite3.wasm) if we pursue localhost-only mode later
- Automated tests for data APIs and export functions
