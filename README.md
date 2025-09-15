# TUSK-OS v0 (IndexedDB-first)

TUSK-OS v0 is a pure-static, local-first CRM that runs entirely in your browser. The current path uses IndexedDB as the primary data store, with first-class exports to open formats.

- Zero servers and zero build steps
- Professional dark UI, fully offline-capable
- Data stays local; export anytime to JSON, CSV, or SQLite

## Demo
- Open `tusk-os-idb/apps/start.html` directly, or serve the repo with any static server

## Features
- Entities: Leads, Accounts, Contacts, Deals, Activities
- Settings for workspace (company, currency)
- Export:
  - JSON: full database dump
  - CSV: leads table
  - SQLite: in-memory build via sql.js, downloadable `.sqlite`

## Tech
- IndexedDB (native browser storage)
- sql.js (WASM) for SQLite exports only; assets vendored under `tusk-os-idb/lib/sqljs/`
- No frameworks; simple HTML/CSS/JS

## Repo structure
- `tusk-os-idb/` – current implementation (apps + lib)
- `BackPack-v0/` – plans and research
  - `Research/Database-and-Localhost-Journey.md` – deep dive into our storage journey
- `.github/` – issue and PR templates
- `PRIVATE_REPO_SETUP.md` – how to pair with a private companion repo for data/env
- `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` – open-source essentials

## Contributing
See `CONTRIBUTING.md`. By participating, you agree to the `CODE_OF_CONDUCT.md`.

## Security
See `SECURITY.md` to report vulnerabilities.

## License
MIT © 2025 BajaLabs
