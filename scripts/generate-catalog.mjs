import fs from "node:fs/promises";
import path from "node:path";
import { buildSourceCatalog } from "../lib/catalog-source.js";

const root = process.cwd();
const dataDir = path.join(root, "data");
const outputPath = path.join(dataDir, "catalog.generated.json");
const runtimeDbPath = path.join(dataDir, "runtime-db.json");

const bundle = await buildSourceCatalog();

await fs.writeFile(outputPath, JSON.stringify(bundle, null, 2), "utf8");
await fs.writeFile(
  runtimeDbPath,
  JSON.stringify(
    {
      categories: bundle.categories,
      products: bundle.products,
      customers: [],
      orders: [],
      payments: []
    },
    null,
    2
  ),
  "utf8"
);

console.log(`Generated ${bundle.categories.length} categories and ${bundle.products.length} products.`);
