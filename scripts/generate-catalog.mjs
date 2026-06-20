import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const dataDir = path.join(root, "data");
const catalogCsvPath = path.join(dataDir, "product_catalog.csv");
const mappingPath = path.join(dataDir, "category_mapping.json");
const rawGroupedPath = path.join(dataDir, "raw_excel_grouped.json");
const outputPath = path.join(dataDir, "catalog.generated.json");
const runtimeDbPath = path.join(dataDir, "runtime-db.json");

const categoryAlias = new Map([
  ["TikTok专区", "TikTok"],
  ["Facebook专区", "Facebook"],
  ["Instagram专区", "Instagram"],
  ["X专区", "X/Twitter"],
  ["Google专区", "Google"],
  ["电商专区", "跨境电商"],
  ["通讯专区", "通讯"],
  ["账号资源", "账号资源"],
  ["IP资源", "IP资源"],
  ["认证服务", "认证服务"],
  ["增长服务", "增长服务"],
  ["规则说明", "规则说明"],
  ["风控审核通过", "风控审核通过"]
]);

const parentMeta = [
  ["TikTok", "TikTok 店铺、账号、广告与橱窗资源"],
  ["Facebook", "Facebook 账号、BM、蓝V与广告资源"],
  ["Instagram", "Instagram / Threads 账号资源"],
  ["YouTube", "YouTube 频道与账号资源"],
  ["Gmail", "Gmail 与邮箱资源"],
  ["跨境电商", "跨境平台店铺与买家号"],
  ["通讯", "流量卡、注册卡与号码资源"],
  ["IP资源", "原生住宅 IP 与网络资源"],
  ["X/Twitter", "X / Twitter 账号资源"],
  ["认证服务", "蓝V与身份认证服务"],
  ["增长服务", "内容增长与互动服务"],
  ["Google", "Google Ads 与投放资源"],
  ["账号资源", "账号、工具与混合资源"],
  ["规则说明", "使用说明与注意事项"]
];

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function parsePrice(value) {
  const text = String(value ?? "").trim();
  if (!text) return { priceCny: null, priceText: null };
  const match = text.replace(/[,，]/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) return { priceCny: null, priceText: text };
  const numeric = Number(match[0]);
  return Number.isFinite(numeric)
    ? { priceCny: numeric, priceText: text }
    : { priceCny: null, priceText: text };
}

function parseCsv(input) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      current = "";
      continue;
    }
    current += char;
  }

  if (current.length || row.length) {
    row.push(current);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  return rows;
}

function normalizeSheetName(value, fallback) {
  return String(value || fallback || "")
    .replace(/^["']+|["']+$/g, "")
    .trim();
}

function makeId(prefix, input) {
  return `${prefix}_${crypto.createHash("sha1").update(String(input)).digest("hex").slice(0, 12)}`;
}

function pickSummary(title, sheet, stock) {
  const parts = [title, sheet, stock].filter(Boolean);
  return `Z-Studio 精选数字资源，适合资源采购与业务搭建。${parts.join(" · ")}`;
}

function deriveDelivery(row) {
  return row.delivery_time?.trim() || "1-24 小时内确认";
}

function deriveAfterSales(row) {
  return row.after_sales?.trim() || "下单后按商品说明进行交付，售后以订单备注为准。";
}

function deriveRisk(row) {
  return row.risk_note?.trim() || "请确保用途符合当地法律法规及平台规则。";
}

const [csv, mappingJson, rawJson] = await Promise.all([
  fs.readFile(catalogCsvPath, "utf8"),
  fs.readFile(mappingPath, "utf8"),
  fs.readFile(rawGroupedPath, "utf8")
]);

const mappings = JSON.parse(mappingJson);
const rawGrouped = JSON.parse(rawJson);
const rows = parseCsv(csv.replace(/^\uFEFF/, ""));
const headers = rows.shift().map((cell) => cell.trim());
const products = [];
const categories = new Map();

for (const [name, description] of parentMeta) {
  categories.set(name, {
    id: makeId("cat", name),
    name,
    slug: slugify(name),
    parentSlug: null,
    sortOrder: parentMeta.findIndex((item) => item[0] === name),
    description,
    featured: true
  });
}

for (const item of mappings) {
  const parentName = categoryAlias.get(item.main_category) || item.main_category || "其他";
  const parentSlug = slugify(parentName);
  const childName = item.subcategory || item.main_category || "未分类";
  const childSlug = slugify(`${parentName}-${childName}`);

  if (!categories.has(parentName)) {
    categories.set(parentName, {
      id: makeId("cat", parentName),
      name: parentName,
      slug: parentSlug,
      parentSlug: null,
      sortOrder: categories.size,
      description: `${parentName} 相关资源`,
      featured: false
    });
  }

  if (!categories.has(childName)) {
    categories.set(childName, {
      id: makeId("cat", childSlug),
      name: childName,
      slug: childSlug,
      parentSlug,
      sortOrder: 0,
      description: `${parentName} / ${childName}`,
      featured: false
    });
  }
}

const headerIndex = Object.fromEntries(headers.map((key, index) => [key, index]));

for (const row of rows) {
  const record = Object.fromEntries(headers.map((key) => [key, row[headerIndex[key]] ?? ""]));
  const sku = String(record.sku || "").trim();
  const title = String(record.title || "").trim();
  if (!sku || !title) continue;

  const mainCategory = categoryAlias.get(record.main_category) || record.main_category || "其他";
  const subcategory = String(record.subcategory || "未分类").trim() || "未分类";
  const categorySlug = slugify(`${mainCategory}-${subcategory}`);
  const parsedPrice = parsePrice(record.price_cny);
  const rowType = String(record.row_type || "product").trim();

  const detail = pickSummary(title, record.source_sheet, record.stock_status);
  const product = {
    id: makeId("prod", sku),
    sku,
    title,
    slug: sku.toLowerCase(),
    mainCategory,
    subcategory,
    categorySlug,
    priceCny: parsedPrice.priceCny,
    priceText: parsedPrice.priceText,
    deliveryTime: deriveDelivery(record),
    stockStatus: String(record.stock_status || "需确认").trim() || "需确认",
    description: `${detail} ${record.raw_text?.trim() ? `｜${record.raw_text.trim()}` : ""}`.trim(),
    afterSales: deriveAfterSales(record),
    riskNote: deriveRisk(record),
    sourceSheet: String(record.source_sheet || "").trim(),
    sourceRow: record.source_row ? Number(record.source_row) : null,
    rowType,
    isActive: rowType === "product",
    featured:
      /店铺|账号|BM|蓝V|Gmail|YouTube|TikTok/i.test(title) ||
      ["TikTok", "Facebook", "Instagram", "YouTube", "Gmail"].includes(mainCategory),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  products.push(product);
}

const bundle = {
  categories: Array.from(categories.values()).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "zh-Hans")),
  products
};

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
console.log(`Raw sheets loaded: ${Object.keys(rawGrouped).length}`);
