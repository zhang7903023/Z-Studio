import catalogBundle from "@/data/catalog.generated.json";
import type { CatalogBundle, Category, Product } from "@/lib/types";
import { hasSupabaseConfig, getSupabaseAdmin } from "@/lib/supabase";
import { slugify } from "@/lib/slug";
import { promises as fs } from "node:fs";
import path from "node:path";

const generated = catalogBundle as CatalogBundle;
const dataDir = path.join(process.cwd(), "data");
const runtimeDbPath = path.join(dataDir, "runtime-db.json");

export function getGeneratedCatalog() {
  return generated;
}

type RuntimeCatalogBundle = CatalogBundle & {
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
    // fall through to generated bundle
  }

  return {
    categories: generated.categories,
    products: generated.products,
    customers: [],
    orders: [],
    payments: []
  } satisfies RuntimeCatalogBundle;
}

async function saveRuntimeDb(payload: {
  categories: Category[];
  products: Product[];
  customers: unknown[];
  orders: unknown[];
  payments: unknown[];
}) {
  await fs.writeFile(runtimeDbPath, JSON.stringify(payload, null, 2), "utf8");
}

export async function getCatalogBundle() {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const [categoriesResult, productsResult] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("products").select("*").order("created_at", { ascending: false })
      ]);

      if (!categoriesResult.error && !productsResult.error) {
        const categoriesData = categoriesResult.data ?? [];
        const productsData = productsResult.data ?? [];
        if (categoriesData.length > 0 || productsData.length > 0) {
          return {
            categories: categoriesData.map(normalizeCategory),
            products: productsData.map(normalizeProduct)
          } satisfies CatalogBundle;
        }
      }
    }
  }

  const runtime = await loadRuntimeDb();
  return {
    categories: runtime.categories,
    products: runtime.products
  } satisfies CatalogBundle;
}

function normalizeCategory(category: Record<string, unknown>): Category {
  return {
    id: String(category.id ?? ""),
    name: String(category.name ?? ""),
    slug: String(category.slug ?? ""),
    parentSlug: category.parent_slug ? String(category.parent_slug) : null,
    sortOrder: Number(category.sort_order ?? 0),
    description: String(category.description ?? ""),
    featured: Boolean(category.featured)
  };
}

function normalizeProduct(product: Record<string, unknown>): Product {
  return {
    id: String(product.id ?? ""),
    sku: String(product.sku ?? ""),
    title: String(product.title ?? ""),
    slug: String(product.slug ?? ""),
    mainCategory: String(product.main_category ?? ""),
    subcategory: String(product.subcategory ?? ""),
    categorySlug: String(product.category_slug ?? ""),
    priceCny: product.price_cny == null ? null : Number(product.price_cny),
    priceText: product.price_text ? String(product.price_text) : null,
    deliveryTime: String(product.delivery_time ?? ""),
    stockStatus: String(product.stock_status ?? ""),
    description: String(product.description ?? ""),
    afterSales: String(product.after_sales ?? ""),
    riskNote: String(product.risk_note ?? ""),
    sourceSheet: String(product.source_sheet ?? ""),
    sourceRow: product.source_row == null ? null : Number(product.source_row),
    rowType: String(product.row_type ?? "product"),
    isActive: Boolean(product.is_active),
    featured: Boolean(product.featured),
    createdAt: String(product.created_at ?? new Date().toISOString()),
    updatedAt: String(product.updated_at ?? new Date().toISOString())
  };
}

export function getTopLevelCategories(categories: Category[]) {
  return categories.filter((category) => !category.parentSlug);
}

export function getChildCategories(categories: Category[], parentSlug?: string | null) {
  return categories.filter((category) => category.parentSlug === parentSlug);
}

export function findCategoryBySlug(categories: Category[], slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function findProductBySlug(products: Product[], slug: string) {
  return products.find((product) => product.slug === slug);
}

export function productDisplayPrice(product: Product) {
  if (typeof product.priceCny === "number") return product.priceCny;
  const parsed = Number(product.priceText?.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function matchesQuery(product: Product, query: string) {
  if (!query) return true;
  const value = query.toLowerCase();
  return [product.title, product.sku, product.mainCategory, product.subcategory, product.description]
    .join(" ")
    .toLowerCase()
    .includes(value);
}

export function filterProducts(
  products: Product[],
  filters: { q?: string; category?: string; sort?: string; activeOnly?: boolean }
) {
  let items = [...products];

  if (filters.activeOnly !== false) {
    items = items.filter((product) => product.isActive);
  }
  if (filters.category && filters.category !== "all") {
    items = items.filter(
      (product) =>
        product.categorySlug === filters.category ||
        slugify(product.mainCategory) === filters.category ||
        slugify(`${product.mainCategory}-${product.subcategory}`) === filters.category
    );
  }
  if (filters.q) {
    items = items.filter((product) => matchesQuery(product, filters.q ?? ""));
  }

  const sort = filters.sort ?? "featured";
  if (sort === "price-asc") {
    items.sort(
      (a, b) =>
        (productDisplayPrice(a) ?? Number.MAX_SAFE_INTEGER) -
        (productDisplayPrice(b) ?? Number.MAX_SAFE_INTEGER)
    );
  } else if (sort === "price-desc") {
    items.sort((a, b) => (productDisplayPrice(b) ?? -1) - (productDisplayPrice(a) ?? -1));
  } else if (sort === "title") {
    items.sort((a, b) => a.title.localeCompare(b.title, "zh-Hans"));
  } else {
    items.sort((a, b) => Number(b.featured) - Number(a.featured) || b.updatedAt.localeCompare(a.updatedAt));
  }

  return items;
}

export async function persistCatalogBundle(bundle: CatalogBundle) {
  const runtime = await loadRuntimeDb();
  await saveRuntimeDb({
    ...runtime,
    categories: bundle.categories,
    products: bundle.products
  });
}
