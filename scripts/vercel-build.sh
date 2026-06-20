#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="$ROOT_DIR/.vercel-build"
SOURCE_DIR="$WORK_DIR/zstudio-marketplace"

rm -rf \
  "$WORK_DIR" \
  "$ROOT_DIR/.next" \
  "$ROOT_DIR/app" \
  "$ROOT_DIR/components" \
  "$ROOT_DIR/lib" \
  "$ROOT_DIR/public" \
  "$ROOT_DIR/styles" \
  "$ROOT_DIR/data"
mkdir -p "$WORK_DIR"

unzip -q "$ROOT_DIR/zstudio-marketplace-source.zip" -d "$WORK_DIR"

cp -R "$SOURCE_DIR/app" "$ROOT_DIR/"
cp -R "$SOURCE_DIR/components" "$ROOT_DIR/"
cp -R "$SOURCE_DIR/lib" "$ROOT_DIR/"
cp -R "$SOURCE_DIR/data" "$ROOT_DIR/"
cp -R "$SOURCE_DIR/public" "$ROOT_DIR/"
cp -R "$SOURCE_DIR/styles" "$ROOT_DIR/"
cp "$SOURCE_DIR/README.md" "$ROOT_DIR/README.md"
cp "$SOURCE_DIR/tsconfig.json" "$ROOT_DIR/tsconfig.json"
cp "$SOURCE_DIR/next.config.mjs" "$ROOT_DIR/next.config.mjs"
cp "$SOURCE_DIR/postcss.config.mjs" "$ROOT_DIR/postcss.config.mjs"
cp "$SOURCE_DIR/tailwind.config.ts" "$ROOT_DIR/tailwind.config.ts"
cp "$SOURCE_DIR/next-env.d.ts" "$ROOT_DIR/next-env.d.ts"
cp "$SOURCE_DIR/supabase_schema.sql" "$ROOT_DIR/supabase_schema.sql"
mkdir -p "$ROOT_DIR/scripts"
cp -R "$SOURCE_DIR/scripts/." "$ROOT_DIR/scripts/"

npm run generate:data
npx next build
