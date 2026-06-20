import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { hasSupabaseConfig, getSupabaseAdmin } from "@/lib/supabase";
import { buildSourceCatalog } from "@/lib/catalog-source.js";

export const runtime = "nodejs";

export async function POST() {
  const runtimeDbPath = path.join(process.cwd(), "data", "runtime-db.json");
  const catalogBundle = await buildSourceCatalog();
  await fs.writeFile(
    runtimeDbPath,
    JSON.stringify(
      {
        categories: catalogBundle.categories,
        products: catalogBundle.products,
        customers: [],
        orders: [],
        payments: []
      },
      null,
      2
    ),
    "utf8"
  );

  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("payments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("customers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      const categoryIdBySlug = new Map<string, string>();

      await supabase.from("categories").upsert(
        catalogBundle.categories.map((category) => {
          const parentId = category.parentSlug ? categoryIdBySlug.get(category.parentSlug) ?? null : null;
          categoryIdBySlug.set(category.slug, category.id);
          return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            parent_id: parentId,
            sort_order: category.sortOrder,
            description: category.description,
            featured: category.featured
          };
        })
      );

      await supabase.from("products").upsert(
        catalogBundle.products.map((product) => ({
          id: product.id,
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
          is_active: product.isActive,
          featured: product.featured
        }))
      );
    }
  }

  return NextResponse.json({
    ok: true,
    categories: catalogBundle.categories.length,
    products: catalogBundle.products.length
  });
}
