# Development Guide

This guide explains how to add or modify pages, use the storage helpers, and test locally.

## Prerequisites

- A modern browser (Chrome, Edge, Firefox, Safari)
- No Node/npm required. Optional: a static server if you prefer http:// over file://

## Run

- Double‑click `tusk-os-idb/apps/start.html`
- Navigate using the header (top) and sidebar (left)

Optional: serve locally
- `python3 -m http.server 1234` (then open http://localhost:1234/tusk-os-idb/apps/start.html)

## Add a new app page

1) Create an HTML file in `tusk-os-idb/apps/` (copy an existing one as a starting point)
2) Include the shared libs:

```html
<link rel="stylesheet" href="../lib/ui.css" />
<script src="../lib/layout.js"></script>
<script src="../lib/idb.js"></script>
```

3) Initialize the layout and storage in a small inline script:

```html
<script>
  document.addEventListener('DOMContentLoaded', async () => {
    TuskLayout.initLayout({ activeMain: 'crm' });
    await TuskIDB.ready();
    // Your app logic here
  });
</script>
```

4) Add page content using the `.content` grid area (cards, lists, forms)

## CRUD with `TuskIDB`

- `await TuskIDB.addLead({ name, email, ... })`
- `const leads = await TuskIDB.listLeads()`
- Similar methods exist for `accounts`, `contacts`, `deals`, `activities`
- Settings:
  - `const s = await TuskIDB.getSettings()`
  - `await TuskIDB.saveSettings({ company: 'Acme', currency: 'USD' })`

## Exports

- JSON: `await TuskIDB.exportJSON()` → Blob
- CSV (leads): `await TuskIDB.exportCSV()` → Blob
- SQLite: see `lib/sqlite-export.js` for in‑page invocation and UI wiring

To trigger a download:

```js
function downloadBlob(blob, filename){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
```

## Style and UI

- Use the provided CSS classes/components in `lib/ui.css`
- Keep inline styles minimal; prefer utility classes and simple structure
- Ensure pages set `activeMain` correctly so the header highlights the current app

## Testing tips

- Use small, deterministic data inputs
- Inspect IndexedDB via DevTools → Application → IndexedDB
- Check mobile behavior: sidebar toggle, viewport widths, long content

## Contribution Workflow

- Small PRs; keep changes scoped to one concern
- No secrets in the public repo; use a private companion repo for experiments
- Follow the code of conduct and security policy
