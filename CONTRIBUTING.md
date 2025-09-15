# Contributing to TUSK-OS v0

Thanks for taking the time to contribute!

## Ways to contribute
- Report bugs (use the issue template)
- Propose features (use the feature request template)
- Improve docs
- Submit PRs for code enhancements, tests, or tooling

## Project setup
This is a pure static project; no build tools are required.

- Open `tusk-os-idb/apps/start.html` directly (file://) or serve the repo with any static server
- Recommended: use a localhost static server to benefit from a stable origin

## Branches
- `main`: IndexedDB-first implementation (current path)
- `wasm`: static sql.js variant lineage
- `localhost`: launcher and script for local server

## Guidelines
- Keep changes small and focused
- Include a short description in commits
- Add or update documentation as needed
- Avoid introducing dependencies unless strictly necessary

## Code style
- Keep HTML/CSS/JS simple and readable
- Prefer DOMContentLoaded over inline scripts
- Use async/await and small helper functions

## PRs
- Include steps to test
- Mention any breaking changes
- Add screenshots for UI changes

Thanks again for helping make TUSK-OS better!
