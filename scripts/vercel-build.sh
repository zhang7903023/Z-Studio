#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="$ROOT_DIR/.vercel-build"
ARCHIVE_PATH="$ROOT_DIR/zstudio-marketplace-source.zip"

rm -rf "$WORK_DIR" "$ROOT_DIR/.next" "$ROOT_DIR/public"
mkdir -p "$WORK_DIR"

unzip -q "$ARCHIVE_PATH" -d "$WORK_DIR/unpacked"
cp -R "$WORK_DIR/unpacked"/* "$ROOT_DIR"/

cd "$ROOT_DIR"
./node_modules/.bin/next build
