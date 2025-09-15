# TUSK‑OS v0

Local‑first, HTML‑native apps you can double‑click and own forever. TUSK‑OS v0 ships a simple CRM built with plain HTML/CSS/JS, IndexedDB for storage, and optional export to real SQLite. No build. No server. Works offline over file://.

- Local‑first: data stored in your browser via IndexedDB
- Pure static: open `*.html` files directly, no tooling required
- Exports: JSON (full), CSV, and SQLite (via sql.js)
- Clean, responsive UI with a global header and per‑app side menu

## Quick start (no server required)

- Open `tusk-os-idb/apps/start.html` directly in your browser
- Try the other pages: `crm.html`, `accounts.html`, `contacts.html`, `deals.html`, `activities.html`, `settings.html`
- Add a few records and use Export to download JSON/CSV/SQLite backups

Optional: serve over localhost if you prefer a stable origin
- Any static server works. Example: `python3 -m http.server 1234`

## What’s inside

- Entities: Leads, Accounts, Contacts, Deals, Activities
- Workspace Settings (company, currency)
- Global Header (top) → apps; Sidebar (left) → sections for selected app (e.g., CRM → Leads/Accounts/...)
- File:// support by design; zero dependencies to run

## TUSKS Framework (HTML‑native pattern)

TUSKS is our opinionated way to build “native HTML file apps”:
- One HTML page per app section; keep JS small and focused
- IndexedDB is the primary store (see `tusk-os-idb/lib/idb.js`)
- Shared shell for layout (`lib/layout.js`) and styles (`lib/ui.css`)
- Exports handled by a small adapter (`lib/sqlite-export.js`)

See: `docs/TUSKS-FRAMEWORK.md` for principles, patterns, and examples.

## Architecture and development

- Architecture: `docs/ARCHITECTURE.md` (modules, data model, exports, UI shell)
- Development: `docs/DEVELOPMENT.md` (add a new page, CRUD patterns, dialogs, testing)
- Roadmap: `docs/ROADMAP.md`
- Vision: `docs/VISION.md` (summary; links to the full vision document)

## Repository structure

- `tusk-os-idb/` — app pages (`apps/`) and shared libs (`lib/`)
- `BackPack-v0/` — plans + in‑depth research (see Vision)
- `.github/` — issue/PR templates and CODEOWNERS
- `docs/` — architecture, framework, development, roadmap, vision summary
- `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`

## Dual‑remote workflow (optional)

Many users mirror this public repo to a private one for local tasks and experiments:

- Public: `origin` → https://github.com/bajalabs/tusks-os-v0
- Private: `private` → https://github.com/bajalabs/tusks-os-private

Push both:

```sh
git push origin main
git push private main
```

Keep secrets and machine‑specific files only in the private repo.

## Contributing

We welcome issues and PRs. Start with `CONTRIBUTING.md`. By participating, you agree to our `CODE_OF_CONDUCT.md`.

## Security

Please see `SECURITY.md` for responsible disclosure instructions.

## License

GPL‑3.0 © 2025 BajaLabs. See `LICENSE`.
