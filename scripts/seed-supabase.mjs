import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { buildSourceCatalog } from "../lib/catalog-source.js";

const catalog = await buildSourceCatalog();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const categoriesBySlug = new Map();
const topLevel = catalog.categories.filter((category) => !category.parentSlug);
const children = catalog.categories.filter((category) => category.parentSlug);

const parentRows = topLevel.map((category) => ({
  id: randomUUID(),
  name: category.name,
  slug: category.slug,
  parent_id: null,
  sort_order: category.sortOrder ?? 0,
  description: category.description ?? "",
  featured: Boolean(category.featured)
}));

let result = await supabase.from("categories").upsert(parentRows, { onConflict: "slug" });
if (result.error) throw result.error;
for (const row of parentRows) categoriesBySlug.set(row.slug, row.id);

const childRows = children.map((category) => ({
  id: randomUUID(),
  name: category.name,
  slug: category.slug,
  parent_id: categoriesBySlug.get(category.parentSlug) ?? null,
  sort_order: category.sortOrder ?? 0,
  description: category.description ?? "",
  featured: Boolean(category.featured)
}));

result = await supabase.from("categories").upsert(childRows, { onConflict: "slug" });
if (result.error) throw result.error;
for (const row of childRows) categoriesBySlug.set(row.slug, row.id);

const productRows = catalog.products.map((product) => ({
  id: randomUUID(),
  sku: product.sku,
  title: product.title,
  slug: product.slug,
  main_category: product.mainCategory,
  subcategory: product.subcategory,
  category_slug: product.categorySlug,
  price_cny: product.priceCny,
  price_text: product.priceText,
  delivery_time: product.deliveryTime,
  stock_status: product.stockStatus,
  description: product.description,
  after_sales: product.afterSales,
  risk_note: product.riskNote,
  source_sheet: product.sourceSheet,
  source_row: product.sourceRow,
  row_type: product.rowType,
  is_active: Boolean(product.isActive),
  featured: Boolean(product.featured)
}));

result = await supabase.from("products").upsert(productRows, { onConflict: "sku" });
if (result.error) throw result.error;

console.log(`Seeded ${parentRows.length + childRows.length} categories and ${productRows.length} products.`);
