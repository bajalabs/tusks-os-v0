#!/usr/bin/env bash
set -euo pipefail

PORT=${1:-1234}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "Serving $ROOT_DIR at http://localhost:$PORT" >&2
python3 -m http.server "$PORT" --bind 127.0.0.1
