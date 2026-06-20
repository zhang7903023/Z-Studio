import { getSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase";
import type { Customer, Order, OrderStatus, Payment, Product, Category } from "@/lib/types";
import { promises as fs } from "node:fs";
import path from "node:path";
import { buildSourceCatalog } from "@/lib/catalog-source.js";
import { slugify } from "@/lib/slug";

const dataDir = path.join(process.cwd(), "data");
const runtimeDbPath = path.join(dataDir, "runtime-db.json");

type RuntimeDb = {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
};

async function ensureRuntimeDb() {
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
    await fs.writeFile(runtimeDbPath, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

async function saveRuntimeDb(db: RuntimeDb) {
  await fs.writeFile(runtimeDbPath, JSON.stringify(db, null, 2), "utf8");
}

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function makeOrderNo() {
  const stamp = Date.now().toString().slice(-8);
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `ZS${stamp}${suffix}`;
}

function toRecordCategory(category: Category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parent_slug: category.parentSlug,
    sort_order: category.sortOrder,
    description: category.description,
    featured: category.featured
  };
}

function toRecordProduct(product: Product) {
  return {
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
    featured: product.featured,
    created_at: product.createdAt,
    updated_at: product.updatedAt
  };
}

function fromRecordProduct(record: Record<string, unknown>): Product {
  return {
    id: String(record.id ?? ""),
    sku: String(record.sku ?? ""),
    title: String(record.title ?? ""),
    slug: String(record.slug ?? ""),
    mainCategory: String(record.main_category ?? ""),
    subcategory: String(record.subcategory ?? ""),
    categorySlug: String(record.category_slug ?? ""),
    priceCny: record.price_cny == null ? null : Number(record.price_cny),
    priceText: record.price_text ? String(record.price_text) : null,
    deliveryTime: String(record.delivery_time ?? ""),
    stockStatus: String(record.stock_status ?? ""),
    description: String(record.description ?? ""),
    afterSales: String(record.after_sales ?? ""),
    riskNote: String(record.risk_note ?? ""),
    sourceSheet: String(record.source_sheet ?? ""),
    sourceRow: record.source_row == null ? null : Number(record.source_row),
    rowType: String(record.row_type ?? "product"),
    isActive: Boolean(record.is_active),
    featured: Boolean(record.featured),
    createdAt: String(record.created_at ?? new Date().toISOString()),
    updatedAt: String(record.updated_at ?? new Date().toISOString())
  };
}

function fromRecordCategory(record: Record<string, unknown>): Category {
  return {
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    slug: String(record.slug ?? ""),
    parentSlug: record.parent_slug ? String(record.parent_slug) : null,
    sortOrder: Number(record.sort_order ?? 0),
    description: String(record.description ?? ""),
    featured: Boolean(record.featured)
  };
}

function fromRecordCustomer(record: Record<string, unknown>): Customer {
  return {
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    contactMethod: String(record.contact_method ?? ""),
    contactValue: String(record.contact_value ?? ""),
    telegram: record.telegram ? String(record.telegram) : undefined,
    whatsapp: record.whatsapp ? String(record.whatsapp) : undefined,
    createdAt: String(record.created_at ?? new Date().toISOString())
  };
}

function fromRecordOrder(record: Record<string, unknown>): Order {
  return {
    id: String(record.id ?? ""),
    orderNo: String(record.order_no ?? ""),
    customerId: String(record.customer_id ?? ""),
    customerName: String(record.customer_name ?? ""),
    contactMethod: String(record.contact_method ?? ""),
    contactValue: String(record.contact_value ?? ""),
    productId: String(record.product_id ?? ""),
    productTitle: String(record.product_title ?? ""),
    quantity: Number(record.quantity ?? 1),
    totalPriceCny: record.total_price_cny == null ? null : Number(record.total_price_cny),
    requirements: String(record.requirements ?? ""),
    paymentMethod: String(record.payment_method ?? ""),
    paymentScreenshotUrl: String(record.payment_screenshot_url ?? ""),
    status: String(record.status ?? "pending_review") as OrderStatus,
    adminNote: String(record.admin_note ?? ""),
    deliveryContent: String(record.delivery_content ?? ""),
    createdAt: String(record.created_at ?? new Date().toISOString()),
    updatedAt: String(record.updated_at ?? new Date().toISOString())
  };
}

function fromRecordPayment(record: Record<string, unknown>): Payment {
  return {
    id: String(record.id ?? ""),
    orderId: String(record.order_id ?? ""),
    orderNo: String(record.order_no ?? ""),
    method: String(record.method ?? ""),
    amount: record.amount == null ? null : Number(record.amount),
    screenshotUrl: String(record.screenshot_url ?? ""),
    status: String(record.status ?? "submitted"),
    createdAt: String(record.created_at ?? new Date().toISOString())
  };
}

export async function listCategories() {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const result = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
      if (!result.error) return (result.data ?? []).map((item) => fromRecordCategory(item));
    }
  }
  const db = await ensureRuntimeDb();
  return db.categories;
}

export async function listProducts() {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const result = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!result.error) return (result.data ?? []).map((item) => fromRecordProduct(item));
    }
  }
  const db = await ensureRuntimeDb();
  return db.products;
}

export async function listOrders() {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const result = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (!result.error) return (result.data ?? []).map((item) => fromRecordOrder(item));
    }
  }
  const db = await ensureRuntimeDb();
  return db.orders;
}

export async function listCustomers() {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const result = await supabase.from("customers").select("*").order("created_at", { ascending: false });
      if (!result.error) return (result.data ?? []).map((item) => fromRecordCustomer(item));
    }
  }
  const db = await ensureRuntimeDb();
  return db.customers;
}

export async function listPayments() {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const result = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      if (!result.error) return (result.data ?? []).map((item) => fromRecordPayment(item));
    }
  }
  const db = await ensureRuntimeDb();
  return db.payments;
}

export async function getProductBySlug(slug: string) {
  const products = await listProducts();
  return products.find((product) => product.slug === slug);
}

export async function getCategoryBySlug(slug: string) {
  const categories = await listCategories();
  return categories.find((category) => category.slug === slug);
}

export async function getOrderByOrderNo(orderNo: string) {
  const orders = await listOrders();
  return orders.find((order: Order) => order.orderNo === orderNo);
}

export async function createOrder(input: {
  customerName: string;
  contactMethod: string;
  contactValue: string;
  productId: string;
  productTitle: string;
  quantity: number;
  requirements: string;
  paymentMethod: string;
  paymentScreenshotUrl: string;
  totalPriceCny: number | null;
}) {
  const order = {
    id: makeId("order"),
    orderNo: makeOrderNo(),
    customerId: makeId("customer"),
    customerName: input.customerName,
    contactMethod: input.contactMethod,
    contactValue: input.contactValue,
    productId: input.productId,
    productTitle: input.productTitle,
    quantity: input.quantity,
    totalPriceCny: input.totalPriceCny,
    requirements: input.requirements,
    paymentMethod: input.paymentMethod,
    paymentScreenshotUrl: input.paymentScreenshotUrl,
    status: input.paymentScreenshotUrl ? ("pending_review" as OrderStatus) : ("pending_payment" as OrderStatus),
    adminNote: "",
    deliveryContent: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } satisfies Order;

  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const customerPayload = {
        id: order.customerId,
        name: input.customerName,
        contact_method: input.contactMethod,
        contact_value: input.contactValue
      };
      await supabase.from("customers").upsert(customerPayload, { onConflict: "contact_method,contact_value" });
      const orderPayload = {
        id: order.id,
        order_no: order.orderNo,
        customer_name: order.customerName,
        contact_method: order.contactMethod,
        contact_value: order.contactValue,
        product_id: order.productId,
        product_title: order.productTitle,
        quantity: order.quantity,
        total_price_cny: order.totalPriceCny,
        requirements: order.requirements,
        payment_method: order.paymentMethod,
        payment_screenshot_url: order.paymentScreenshotUrl,
        status: order.status,
        admin_note: order.adminNote,
        delivery_content: order.deliveryContent
      };
      await supabase.from("orders").insert(orderPayload);
      if (input.paymentScreenshotUrl) {
        await supabase.from("payments").insert({
          id: makeId("payment"),
          order_id: order.id,
          order_no: order.orderNo,
          method: order.paymentMethod,
          amount: order.totalPriceCny,
          screenshot_url: order.paymentScreenshotUrl,
          status: "submitted"
        });
      }
      return order;
    }
  }

  const db = await ensureRuntimeDb();
  db.customers = db.customers.filter(
    (customer) => !(customer.contactMethod === input.contactMethod && customer.contactValue === input.contactValue)
  );
  db.customers.unshift({
    id: order.customerId,
    name: order.customerName,
    contactMethod: order.contactMethod,
    contactValue: order.contactValue,
    createdAt: order.createdAt
  });
  db.orders.unshift(order);
  if (input.paymentScreenshotUrl) {
    db.payments.unshift({
      id: makeId("payment"),
      orderId: order.id,
      orderNo: order.orderNo,
      method: order.paymentMethod,
      amount: order.totalPriceCny,
      screenshotUrl: order.paymentScreenshotUrl,
      status: "submitted",
      createdAt: order.createdAt
    });
  }
  await saveRuntimeDb(db);
  return order;
}

export async function updateOrderStatus(orderNo: string, status: OrderStatus, adminNote = "", deliveryContent = "") {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from("orders")
        .update({
          status,
          admin_note: adminNote,
          delivery_content: deliveryContent,
          updated_at: new Date().toISOString()
        })
        .eq("order_no", orderNo);
      return true;
    }
  }

  const db = await ensureRuntimeDb();
  const order = db.orders.find((item) => item.orderNo === orderNo);
  if (!order) return false;
  order.status = status;
  order.adminNote = adminNote;
  order.deliveryContent = deliveryContent;
  order.updatedAt = new Date().toISOString();
  await saveRuntimeDb(db);
  return true;
}

export async function upsertCategory(category: Partial<Category> & { name: string; slug?: string }) {
  const payload: Category = {
    id: category.id ?? makeId("cat"),
    name: category.name,
    slug: category.slug ?? slugify(category.name),
    parentSlug: category.parentSlug ?? null,
    sortOrder: category.sortOrder ?? 0,
    description: category.description ?? "",
    featured: Boolean(category.featured)
  };

  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      let parentId: string | null = null;
      if (payload.parentSlug) {
        const categories = await listCategories();
        parentId = categories.find((item) => item.slug === payload.parentSlug)?.id ?? null;
      }
      await supabase.from("categories").upsert({
        id: payload.id,
        name: payload.name,
        slug: payload.slug,
        parent_id: parentId,
        sort_order: payload.sortOrder,
        description: payload.description,
        featured: payload.featured
      });
      return payload;
    }
  }

  const db = await ensureRuntimeDb();
  const index = db.categories.findIndex((item) => item.id === payload.id || item.slug === payload.slug);
  if (index >= 0) db.categories[index] = payload;
  else db.categories.unshift(payload);
  await saveRuntimeDb(db);
  return payload;
}

export async function upsertProduct(product: Partial<Product> & { sku: string; title: string; categorySlug?: string }) {
  const payload: Product = {
    id: product.id ?? makeId("prod"),
    sku: product.sku,
    title: product.title,
    slug: product.slug ?? slugify(product.sku),
    mainCategory: product.mainCategory ?? "",
    subcategory: product.subcategory ?? "",
    categorySlug: product.categorySlug ?? "",
    priceCny: product.priceCny ?? null,
    priceText: product.priceText ?? null,
    deliveryTime: product.deliveryTime ?? "1-24 小时内确认",
    stockStatus: product.stockStatus ?? "需确认",
    description: product.description ?? "",
    afterSales: product.afterSales ?? "",
    riskNote: product.riskNote ?? "",
    sourceSheet: product.sourceSheet ?? "",
    sourceRow: product.sourceRow ?? null,
    rowType: product.rowType ?? "product",
    isActive: product.isActive ?? true,
    featured: product.featured ?? false,
    createdAt: product.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("products").upsert({
        id: payload.id,
        sku: payload.sku,
        title: payload.title,
        slug: payload.slug,
        main_category: payload.mainCategory,
        subcategory: payload.subcategory,
        category_slug: payload.categorySlug,
        price_cny: payload.priceCny,
        price_text: payload.priceText,
        delivery_time: payload.deliveryTime,
        stock_status: payload.stockStatus,
        description: payload.description,
        after_sales: payload.afterSales,
        risk_note: payload.riskNote,
        source_sheet: payload.sourceSheet,
        source_row: payload.sourceRow,
        row_type: payload.rowType,
        is_active: payload.isActive,
        featured: payload.featured
      });
      return payload;
    }
  }

  const db = await ensureRuntimeDb();
  const index = db.products.findIndex((item) => item.id === payload.id || item.sku === payload.sku);
  if (index >= 0) db.products[index] = payload;
  else db.products.unshift(payload);
  await saveRuntimeDb(db);
  return payload;
}

export async function deleteProduct(id: string) {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("products").delete().eq("id", id);
      return true;
    }
  }

  const db = await ensureRuntimeDb();
  db.products = db.products.filter((product) => product.id !== id);
  await saveRuntimeDb(db);
  return true;
}

export async function deleteCategory(id: string) {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("categories").delete().eq("id", id);
      return true;
    }
  }

  const db = await ensureRuntimeDb();
  db.categories = db.categories.filter((category) => category.id !== id);
  await saveRuntimeDb(db);
  return true;
}
