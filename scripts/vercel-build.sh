#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="$ROOT_DIR/.vercel-build"
SOURCE_DIR="$WORK_DIR/zstudio-marketplace"

rm -rf "$WORK_DIR" "$ROOT_DIR/.next" "$ROOT_DIR/public"
mkdir -p "$WORK_DIR"

unzip -q "$ROOT_DIR/zstudio-marketplace-source.zip" -d "$WORK_DIR"
cd "$SOURCE_DIR"

npm install
npm run generate:data
npm run build

cp -R "$SOURCE_DIR/.next" "$ROOT_DIR/.next"
if [ -d "$SOURCE_DIR/public" ]; then
  cp -R "$SOURCE_DIR/public" "$ROOT_DIR/public"
fi
