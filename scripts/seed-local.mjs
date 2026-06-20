import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "data", "catalog.generated.json");
const target = path.join(root, "data", "runtime-db.json");

const payload = JSON.parse(await fs.readFile(source, "utf8"));
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
