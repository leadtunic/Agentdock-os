#!/usr/bin/env bash
set -euo pipefail
command -v docker >/dev/null && echo "docker: ok" || echo "docker: missing"
command -v node >/dev/null && echo "node: ok" || echo "node: missing"
command -v pnpm >/dev/null && echo "pnpm: ok" || echo "pnpm: missing"
command -v python3 >/dev/null && echo "python3: ok" || echo "python3: missing"
