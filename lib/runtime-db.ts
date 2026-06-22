import { promises as fs } from "node:fs";
import path from "node:path";
import type { Category, Customer, Order, Payment, Product } from "@/lib/types";
import { buildSourceCatalog } from "@/lib/catalog-source.js";

type RuntimeDb = {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
};

const dataDir = path.join(process.cwd(), "data");
const runtimeDbPath = path.join(dataDir, "runtime-db.json");
const usePersistentRuntimeDb = !process.env.VERCEL && process.env.NODE_ENV !== "production";

declare global {
  // eslint-disable-next-line no-var
  var __zstudioRuntimeDb: RuntimeDb | undefined;
}

function getRuntimeCache() {
  return globalThis.__zstudioRuntimeDb;
}

function setRuntimeCache(db: RuntimeDb) {
  globalThis.__zstudioRuntimeDb = db;
}

export async function loadRuntimeDb(): Promise<RuntimeDb> {
  if (!usePersistentRuntimeDb) {
    const cached = getRuntimeCache();
    if (cached) return cached;
    const catalog = await buildSourceCatalog();
    const initial: RuntimeDb = {
      categories: catalog.categories,
      products: catalog.products,
      customers: [],
      orders: [],
      payments: []
    };
    setRuntimeCache(initial);
    return initial;
  }

  try {
    const raw = await fs.readFile(runtimeDbPath, "utf8");
    return JSON.parse(raw) as RuntimeDb;
  } catch {
    const catalog = await buildSourceCatalog();
    const initial: RuntimeDb = {
      categories: catalog.categories,
      products: catalog.products,
      customers: [],
      orders: [],
      payments: []
    };
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(runtimeDbPath, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

export async function saveRuntimeDb(db: RuntimeDb) {
  if (!usePersistentRuntimeDb) {
    setRuntimeCache(db);
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(runtimeDbPath, JSON.stringify(db, null, 2), "utf8");
}

