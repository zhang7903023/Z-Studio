#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="$ROOT_DIR/.vercel-build"
SOURCE_DIR="$WORK_DIR/source"
ARCHIVE_PATH="$ROOT_DIR/zstudio-marketplace-source.zip"

rm -rf "$WORK_DIR" "$ROOT_DIR/.next" "$ROOT_DIR/public"
mkdir -p "$WORK_DIR"

unzip -q "$ARCHIVE_PATH" -d "$SOURCE_DIR"

cd "$SOURCE_DIR"
npm install
npm run build

cp -R "$SOURCE_DIR/.next" "$ROOT_DIR/.next"
if [ -d "$SOURCE_DIR/public" ]; then
  cp -R "$SOURCE_DIR/public" "$ROOT_DIR/public"
fi
