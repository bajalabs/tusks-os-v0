# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TUSK-OS v0 is a pure-static, local-first CRM that runs entirely in the browser using IndexedDB as primary storage. Zero servers, zero build steps - works directly via file:// or any static server.

## Development Commands

**Serve locally:**
```bash
python3 -m http.server 1234 --bind 127.0.0.1
```

**VS Code task available:** "Serve: localhost:1234" (Ctrl+Shift+P → Tasks: Run Task)

**Entry point:** Open `tusk-os-idb/apps/start.html` directly or serve at root

## Architecture

### Core Components

- **Storage Layer:** `tusk-os-idb/lib/idb.js` - IndexedDB wrapper (TuskIDB) with schema versioning
- **Export Engine:** `tusk-os-idb/lib/sqlite-export.js` - Creates SQLite files from IDB data using sql.js
- **UI Framework:** `tusk-os-idb/lib/ui.css` - Shared dark theme for all pages
- **SQL.js Assets:** `tusk-os-idb/lib/sqljs/` - Vendored WASM SQLite for offline exports

### Database Schema

**Database:** `tusk-idb` (IndexedDB)

**Object Stores:**
- `meta` - Key-value settings storage
- `leads` - Lead management with indexes on created_at, name, email, company, owner, stage
- `accounts` - Account data with indexes on created_at, name, domain, owner
- `contacts` - Contact records with indexes on created_at, name, email, account_id, owner
- `deals` - Deal pipeline with indexes on created_at, stage, account_id, owner
- `activities` - Activity tracking with indexes on created_at, type, related entities

### Application Pages

All pages follow consistent navigation pattern and share UI components:

- `start.html` - Dashboard with export functionality (JSON/CSV/SQLite) and entity counts
- `crm.html` - Lead management with extended fields and filtering
- `accounts.html` - Account management interface
- `contacts.html` - Contact management with account relationships
- `deals.html` - Deal pipeline management
- `activities.html` - Activity logging and tracking
- `settings.html` - Company/currency configuration stored in IDB

### Export System

**Three export formats:**
1. **JSON** - Complete database dump of all stores
2. **CSV** - Leads table export with extended columns
3. **SQLite** - In-memory SQLite database built from IDB data, downloadable as .sqlite file

**Offline capability:** sql.js assets vendored locally with base64 WASM embedding for file:// compatibility

## Key Patterns

### Database Operations
- All IDB operations use async/await through TuskIDB wrapper
- Schema upgrades handled in `openDB()` with version bumping
- Indexes created safely with existence checks during upgrades

### UI Consistency
- All pages use shared `ui.css` with consistent card/header/nav patterns
- Navigation state management via active class on current page
- Modal/toast systems for user feedback

### File:// Compatibility
- Local asset preference over CDN for offline operation
- Base64-embedded WASM assets prevent CORS issues
- SQL.js fallback chain: embedded → local → CDN

## Project Structure

```
tusk-os-idb/           # Main implementation
  apps/                # HTML application pages
  lib/                 # Core libraries and assets
    sqljs/            # Vendored sql.js with WASM
BackPack-v0/          # Planning and research documents
  Research/           # Architecture decision records
  Plans/              # Implementation plans
.vscode/              # VS Code configuration with serve task
.github/              # Issue/PR templates and CODEOWNERS
```

## Branch Strategy

- `main` - IndexedDB-first implementation (current)
- `wasm` - Static sql.js variant lineage
- `localhost` - Local server launcher/scripts

## Important Constraints

- **No build system** - Keep pure HTML/CSS/JS for maximum simplicity
- **No dependencies** - Avoid npm packages; vendor assets when needed
- **File:// compatibility** - Ensure offline operation without server
- **Static-first** - All functionality must work as static files
- **Local-first** - Data stays in browser; exports enable portability

## Testing Approach

Manual testing via browser since no build system. Test both file:// and localhost contexts to ensure cross-environment compatibility.