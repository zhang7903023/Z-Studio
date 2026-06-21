#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="$ROOT_DIR/.vercel-build"

rm -rf "$WORK_DIR" "$ROOT_DIR/.next" "$ROOT_DIR/public"
mkdir -p "$WORK_DIR"

unzip -q "$ROOT_DIR/zstudio-marketplace-source.zip" -d "$WORK_DIR"

cd "$WORK_DIR"
npm install
npm run build

cp -R "$WORK_DIR/.next" "$ROOT_DIR/.next"
if [ -d "$WORK_DIR/public" ]; then
  cp -R "$WORK_DIR/public" "$ROOT_DIR/public"
fi
