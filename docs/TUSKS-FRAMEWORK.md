# TUSKS Framework (HTML‑native, file://‑first)

TUSKS is a lightweight approach to building apps that run as plain HTML files. No bundlers. No servers. Just disciplined structure, small modules, and browser‑native storage. The goal is longevity and ownership: double‑click today, double‑click in 20 years.

## Principles

- HTML‑native: ship .html pages that work over file://
- Local‑first: IndexedDB primary; exports to open formats (JSON/CSV/SQLite)
- Small modules: each lib solves one problem and stays framework‑free
- Progressive: graceful behavior on older browsers; no hard deps to run
- Clear shell: global header for apps, sidebar for sections, content stays simple

## Patterns

- Pages: one HTML per app area, each bootstrapping its own JS (minimal globals)
- Storage: `lib/idb.js` exposes CRUD helpers per entity and exports
- Shell: `lib/layout.js` adds header + sidebar; `lib/ui.css` styles the shell
- Exports: `lib/sqlite-export.js` loads sql.js lazily and builds a .sqlite in memory
- Namespacing: expose a single global `TuskIDB` and `TuskLayout`

## File:// Compatibility

- Use relative paths for all assets
- Avoid fetch() to remote origins unless optional; prefer inline templates
- sql.js assets are vendored locally; loaded only when export is used
- No service workers required; offline by default

## UX Conventions

- Top header = main app switcher (Home, Business, Marketing, CRM, Docs, Ops, Accounting, Legal, Notes, Settings)
- Left sidebar = sections for the active app (e.g., CRM → Leads/Accounts/Contacts/Deals/Activities)
- Mobile: hamburger toggles the sidebar; overlay begins below header height

## Example

Minimal bootstrapping in a page:

```html
<link rel="stylesheet" href="../lib/ui.css" />
<script src="../lib/layout.js"></script>
<script src="../lib/idb.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", async () => {
    TuskLayout.initLayout({ activeMain: "crm" });
    await TuskIDB.ready();
    const leads = await TuskIDB.listLeads();
    // render leads...
  });
</script>
```

## Data Model (v0)

- leads(id, name, email, phone, company, source, owner, stage, tags[], notes, status, created_at)
- accounts(id, name, domain, phone, owner, notes, created_at)
- contacts(id, name, email, phone, account_id, title, owner, notes, created_at)
- deals(id, name, amount, stage, owner, account_id, close_date, notes, created_at)
- activities(id, type, subject, date, related, owner, notes, created_at)
- settings stored in `meta` store under key `settings`

## Exports

- JSON: full DB dump (all stores + settings)
- CSV: leads only (v0) with safe escaping
- SQLite: uses sql.js; tables mirrored from the IDB model, rows inserted in memory and then downloaded

## Testing and Debugging

- Open Developer Tools → Application → IndexedDB to inspect data
- Use the CSV/JSON export for quick sanity checks
- Prefer small, composable functions; keep DOM access explicit

## Why not a framework?

Frameworks are great, but here we optimize for longevity, zero‑install, and transparency. HTML/JS/CSS will outlive most stacks, and the browser is the runtime. TUSKS keeps moving parts to a minimum so your data and UI keep working.
