#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="$ROOT_DIR/.vercel-build"

rm -rf "$WORK_DIR" "$ROOT_DIR/.next" "$ROOT_DIR/public"
mkdir -p "$WORK_DIR"

unzip -q "$ROOT_DIR/zstudio-marketplace-source.zip" -d "$WORK_DIR"
export WORK_DIR

node <<'NODE'
const fs = require('node:fs');
const path = require('node:path');
const filePath = path.join(process.env.WORK_DIR, 'lib/catalog.ts');
let text = fs.readFileSync(filePath, 'utf8');

text = text.replace(
`async function loadRuntimeDb() {
  try {
    const raw = await fs.readFile(runtimeDbPath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.categories) && Array.isArray(parsed.products)) {
      return parsed as CatalogBundle & {
        customers: unknown[];
        orders: unknown[];
        payments: unknown[];
      };
    }
  } catch {
    const generated = await buildSourceCatalog();
    return {
      categories: generated.categories,
      products: generated.products,
      customers: [],
      orders: [],
      payments: []
    };
  }

  const generated = await buildSourceCatalog();
  return {
    categories: generated.categories,
    products: generated.products,
    customers: [],
    orders: [],
    payments: []
  };
}
`,
`type RuntimeCatalogBundle = CatalogBundle & {
  customers: unknown[];
  orders: unknown[];
  payments: unknown[];
};

async function loadRuntimeDb(): Promise<RuntimeCatalogBundle> {
  try {
    const raw = await fs.readFile(runtimeDbPath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.categories) && Array.isArray(parsed.products)) {
      return parsed as RuntimeCatalogBundle;
    }
  } catch {
    const generated = await buildSourceCatalog();
    return {
      categories: generated.categories,
      products: generated.products,
      customers: [],
      orders: [],
      payments: []
    } satisfies RuntimeCatalogBundle;
  }

  const generated = await buildSourceCatalog();
  return {
    categories: generated.categories,
    products: generated.products,
    customers: [],
    orders: [],
    payments: []
  } satisfies RuntimeCatalogBundle;
}
`);

fs.writeFileSync(filePath, text);
NODE

cd "$WORK_DIR"
npm install
npm run build

cp -R "$WORK_DIR/.next" "$ROOT_DIR/.next"
if [ -d "$WORK_DIR/public" ]; then
  cp -R "$WORK_DIR/public" "$ROOT_DIR/public"
fi
