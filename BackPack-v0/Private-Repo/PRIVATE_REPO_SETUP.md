# Private companion repository

For user data, backups, and environment files, use a separate PRIVATE repository. This keeps the public repo clean and safe.

## Why

- Prevent sensitive files (env, tokens, personal data) from being committed publicly
- Allow personal workflows and tasks without leaking machine-specific details

## Recommended layout

- Public repo (this one): source code and docs
- Private repo (you create): data and local-only config

Suggested structure for the private repo:

```
private/
  .env                  # environment values (if needed)
  backups/              # JSON/CSV/SQLite exports
  data/                 # local data dumps
  tasks/                # personal VS Code tasks
```

## Local multi-root workspace

Create a VS Code workspace that opens both repos together:

1. In VS Code, File → Add Folder to Workspace…
2. Add this public repo
3. Add your private repo folder
4. File → Save Workspace As… e.g. `tusk-os.code-workspace`

Example `tusk-os.code-workspace` (save at your user home, not committed):

```jsonc
{
  "folders": [
    { "path": "path/to/tusks-os-v0" },
    { "path": "path/to/tusks-os-private" }
  ]
}
```

## Git hygiene in public repo

- `.gitignore` excludes: `.env*`, `private/`, `backups/`, `data/`, and `.vscode/` except safe files
- Avoid committing `tasks.json` with IPs or machine-specific paths

## GitHub hygiene

- Use branch protection on `main`
- Require PR reviews for public repo changes
- Never store secrets in issues or PRs

## Optional: symlink convenience

If you want the public app to see private files locally:

- Create symlinks in your workspace (not committed) pointing to `../tusks-os-private/private/...`

## Backups

Store export files (JSON/CSV/SQLite) under `private/backups/` in your private repo to keep data separate from code.
