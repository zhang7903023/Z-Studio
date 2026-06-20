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

rsync -a "$SOURCE_DIR/app/" "$ROOT_DIR/app/"
rsync -a "$SOURCE_DIR/components/" "$ROOT_DIR/components/"
rsync -a "$SOURCE_DIR/lib/" "$ROOT_DIR/lib/"
rsync -a "$SOURCE_DIR/data/" "$ROOT_DIR/data/"
rsync -a "$SOURCE_DIR/public/" "$ROOT_DIR/public/"
rsync -a "$SOURCE_DIR/styles/" "$ROOT_DIR/styles/"
cp "$SOURCE_DIR/README.md" "$ROOT_DIR/README.md"
cp "$SOURCE_DIR/tsconfig.json" "$ROOT_DIR/tsconfig.json"
cp "$SOURCE_DIR/next.config.mjs" "$ROOT_DIR/next.config.mjs"
cp "$SOURCE_DIR/postcss.config.mjs" "$ROOT_DIR/postcss.config.mjs"
cp "$SOURCE_DIR/tailwind.config.ts" "$ROOT_DIR/tailwind.config.ts"
cp "$SOURCE_DIR/next-env.d.ts" "$ROOT_DIR/next-env.d.ts"
cp "$SOURCE_DIR/supabase_schema.sql" "$ROOT_DIR/supabase_schema.sql"
rsync -a "$SOURCE_DIR/scripts/" "$ROOT_DIR/scripts/"

npm run generate:data
npm run build
