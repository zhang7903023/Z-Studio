import fs from "node:fs/promises";
import path from "node:path";
import { buildSourceCatalog } from "../lib/catalog-source.js";

const root = process.cwd();
const target = path.join(root, "data", "runtime-db.json");

const payload = await buildSourceCatalog();
await fs.writeFile(
  target,
  JSON.stringify(
    {
      categories: payload.categories,
      products: payload.products,
      customers: [],
      orders: [],
      payments: []
    },
    null,
    2
  ),
  "utf8"
);

console.log("Seeded local runtime database.");
