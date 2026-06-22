"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { formatCurrency } from "@/lib/helpers";
import { StatusPill } from "@/components/status-pill";
import type { Category, Order, OrderStatus, Product } from "@/lib/types";
import { ADMIN_ACCESS_HEADER } from "@/lib/admin-access";

type Payload = {
  categories: Category[];
  products: Product[];
  orders: Order[];
};

const orderStatuses: OrderStatus[] = [
  "pending_payment",
  "pending_review",
  "processing",
  "delivered",
  "after_sales",
  "cancelled"
];

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "请求失败");
  return data as T;
}

function withAdminHeader(init: RequestInit | undefined, accessKey: string) {
  const headers = new Headers(init?.headers);
  if (accessKey) headers.set(ADMIN_ACCESS_HEADER, accessKey);
  return { ...init, headers };
}

export function AdminConsole({ requiresAccessKey }: { requiresAccessKey: boolean }) {
  const [data, setData] = useState<Payload>({ categories: [], products: [], orders: [] });
  const [message, setMessage] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [unlockValue, setUnlockValue] = useState("");
  const [ready, setReady] = useState(!requiresAccessKey);
  const [loading, setLoading] = useState(!requiresAccessKey);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  async function refresh(nextAccessKey = accessKey) {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        fetchJson<{ products: Product[] }>("/api/admin/products", withAdminHeader(undefined, nextAccessKey)),
        fetchJson<{ categories: Category[] }>("/api/admin/categories", withAdminHeader(undefined, nextAccessKey)),
        fetchJson<{ orders: Order[] }>("/api/admin/orders", withAdminHeader(undefined, nextAccessKey))
      ]);

      setData({
        products: productsRes.products,
        categories: categoriesRes.categories,
        orders: ordersRes.orders
      });
      setReady(true);
      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const stored = window.sessionStorage.getItem("zstudio-admin-key") || "";
    if (!requiresAccessKey) {
      void refresh("");
      return;
    }
    if (stored) {
      setAccessKey(stored);
      void refresh(stored);
    } else {
      setReady(false);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresAccessKey]);

  const canUseAdmin = useMemo(() => ready && (!requiresAccessKey || Boolean(accessKey)), [accessKey, ready, requiresAccessKey]);

  async function unlock() {
    const nextAccessKey = unlockValue.trim();
    if (!nextAccessKey) return;
    window.sessionStorage.setItem("zstudio-admin-key", nextAccessKey);
    setAccessKey(nextAccessKey);
    setLoading(true);
    try {
      await refresh(nextAccessKey);
    } catch (error) {
      window.sessionStorage.removeItem("zstudio-admin-key");
      setAccessKey("");
      setReady(false);
      setMessage(error instanceof Error ? error.message : "解锁失败");
    }
  }

  function clearAccess() {
    window.sessionStorage.removeItem("zstudio-admin-key");
    setAccessKey("");
    setUnlockValue("");
    setReady(false);
    setData({ categories: [], products: [], orders: [] });
  }

  async function handleCreateCategory(formData: FormData) {
    await fetchJson(
      "/api/admin/categories",
      withAdminHeader(
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: String(formData.get("name") || ""),
            slug: String(formData.get("slug") || ""),
            parentSlug: String(formData.get("parentSlug") || "") || null,
            sortOrder: Number(formData.get("sortOrder") || 0),
            description: String(formData.get("description") || ""),
            featured: Boolean(formData.get("featured"))
          })
        },
        accessKey
      )
    );
    setMessage("分类已保存");
    await refresh();
  }

  async function handleCreateProduct(formData: FormData) {
    await fetchJson(
      "/api/admin/products",
      withAdminHeader(
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sku: String(formData.get("sku") || ""),
            title: String(formData.get("title") || ""),
            slug: String(formData.get("slug") || ""),
            mainCategory: String(formData.get("mainCategory") || ""),
            subcategory: String(formData.get("subcategory") || ""),
            categorySlug: String(formData.get("categorySlug") || ""),
            priceCny: formData.get("priceCny") ? Number(formData.get("priceCny")) : null,
            priceText: String(formData.get("priceText") || ""),
            deliveryTime: String(formData.get("deliveryTime") || ""),
            stockStatus: String(formData.get("stockStatus") || ""),
            description: String(formData.get("description") || ""),
            afterSales: String(formData.get("afterSales") || ""),
            riskNote: String(formData.get("riskNote") || ""),
            isActive: Boolean(formData.get("isActive")),
            featured: Boolean(formData.get("featured"))
          })
        },
        accessKey
      )
    );
    setMessage("商品已保存");
    await refresh();
  }

  async function handleUpdateOrder(orderNo: string, status: OrderStatus, adminNote: string, deliveryContent: string) {
    await fetchJson(
      "/api/admin/orders",
      withAdminHeader(
        {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ orderNo, status, adminNote, deliveryContent })
        },
        accessKey
      )
    );
    setMessage("订单已更新");
    await refresh();
  }

  async function handleDeleteProduct(id: string) {
    await fetchJson(`/api/admin/products?id=${encodeURIComponent(id)}`, withAdminHeader({ method: "DELETE" }, accessKey));
    setMessage("商品已删除");
    await refresh();
  }

  async function handleDeleteCategory(id: string) {
    await fetchJson(`/api/admin/categories?id=${encodeURIComponent(id)}`, withAdminHeader({ method: "DELETE" }, accessKey));
    setMessage("分类已删除");
    await refresh();
  }

  async function saveProductEdit(event: FormData) {
    if (!editingProduct) return;
    setSavingEdit(true);
    try {
      await fetchJson(
        "/api/admin/products",
        withAdminHeader(
          {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              ...editingProduct,
              sku: String(event.get("sku") || editingProduct.sku).trim(),
              title: String(event.get("title") || editingProduct.title).trim() || editingProduct.title,
              slug: String(event.get("slug") || editingProduct.slug).trim() || editingProduct.slug,
              mainCategory: String(event.get("mainCategory") || editingProduct.mainCategory).trim(),
              subcategory: String(event.get("subcategory") || editingProduct.subcategory).trim(),
              categorySlug: String(event.get("categorySlug") || editingProduct.categorySlug).trim(),
              priceCny: String(event.get("priceCny") || "").trim() ? Number(event.get("priceCny")) : null,
              priceText: String(event.get("priceText") || "").trim() || null,
              deliveryTime: String(event.get("deliveryTime") || editingProduct.deliveryTime).trim(),
              stockStatus: String(event.get("stockStatus") || editingProduct.stockStatus).trim(),
              description: String(event.get("description") || "").trim(),
              afterSales: String(event.get("afterSales") || "").trim(),
              riskNote: String(event.get("riskNote") || "").trim(),
              isActive: event.get("isActive") === "on",
              featured: event.get("featured") === "on"
            })
          },
          accessKey
        )
      );
      setMessage("商品已更新");
      setEditingProduct(null);
      await refresh();
    } finally {
      setSavingEdit(false);
    }
  }

  async function saveCategoryEdit(event: FormData) {
    if (!editingCategory) return;
    setSavingEdit(true);
    try {
      await fetchJson(
        "/api/admin/categories",
        withAdminHeader(
          {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              ...editingCategory,
              name: String(event.get("name") || editingCategory.name).trim() || editingCategory.name,
              slug: String(event.get("slug") || editingCategory.slug).trim() || editingCategory.slug,
              parentSlug: String(event.get("parentSlug") || "").trim() || null,
              sortOrder: Number(event.get("sortOrder") || 0),
              description: String(event.get("description") || "").trim(),
              featured: event.get("featured") === "on"
            })
          },
          accessKey
        )
      );
      setMessage("分类已更新");
      setEditingCategory(null);
      await refresh();
    } finally {
      setSavingEdit(false);
    }
  }

  async function saveQuickProduct(product: Product, patch: Partial<Product>) {
    setSavingEdit(true);
    try {
      await fetchJson(
        "/api/admin/products",
        withAdminHeader(
          {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              ...product,
              ...patch
            })
          },
          accessKey
        )
      );
      setMessage("商品已更新");
      await refresh();
    } finally {
      setSavingEdit(false);
    }
  }

  if (!canUseAdmin) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">后台访问</h2>
        <p className="mt-2 text-sm text-slate-400">请输入后台访问码后再加载商品、分类和订单数据。</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={unlockValue}
            onChange={(event) => setUnlockValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void unlock();
              }
            }}
            placeholder="后台访问码"
            className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-sm"
          />
          <button onClick={() => void unlock()} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#050816]">
            解锁后台
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">如果没有设置 `ADMIN_ACCESS_KEY`，这里会自动开放。</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {message ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}

      {requiresAccessKey ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <span>当前已进入后台管理</span>
          <button onClick={clearAccess} className="text-slate-400 transition hover:text-white">
            退出访问
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">新增分类</h2>
          <form
            className="mt-4 grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleCreateCategory(new FormData(event.currentTarget));
              event.currentTarget.reset();
            }}
          >
            <input name="name" placeholder="分类名称" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            <input name="slug" placeholder="slug，可留空" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            <input name="parentSlug" placeholder="父级 slug，可留空" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            <textarea name="description" placeholder="分类描述" rows={3} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="sortOrder" type="number" defaultValue={0} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-sm text-slate-300">
                <input name="featured" type="checkbox" /> 设为推荐
              </label>
            </div>
            <button className="rounded-2xl bg-white px-4 py-3 font-semibold text-[#050816]">保存分类</button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">新增商品</h2>
          <form
            className="mt-4 grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleCreateProduct(new FormData(event.currentTarget));
              event.currentTarget.reset();
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="sku" placeholder="SKU" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
              <input name="title" placeholder="商品标题" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="slug" placeholder="slug，可留空" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
              <input name="categorySlug" placeholder="分类 slug" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="mainCategory" placeholder="主分类" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
              <input name="subcategory" placeholder="子分类" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="priceCny" type="number" placeholder="价格数值" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
              <input name="priceText" placeholder="价格文本" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="deliveryTime" placeholder="交付时间" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
              <input name="stockStatus" placeholder="库存状态" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            </div>
            <textarea name="description" placeholder="商品介绍" rows={3} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            <textarea name="afterSales" placeholder="售后说明" rows={2} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            <textarea name="riskNote" placeholder="风险提示" rows={2} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-sm text-slate-300">
                <input name="isActive" type="checkbox" defaultChecked /> 上架
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-sm text-slate-300">
                <input name="featured" type="checkbox" /> 推荐
              </label>
            </div>
            <button className="rounded-2xl bg-white px-4 py-3 font-semibold text-[#050816]">保存商品</button>
          </form>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">商品管理</h2>
          <p className="mt-2 text-sm text-slate-400">点商品卡片右侧的“修改”可以编辑完整商品信息；下方可直接快速改价。</p>
          <div className="mt-4 space-y-3 max-h-[560px] overflow-auto pr-1">
            {loading ? <p className="text-sm text-slate-400">加载中…</p> : null}
            {data.products.map((product) => (
              <div key={product.id} className="rounded-2xl border border-white/10 bg-[#09101d] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-400">{product.sku}</p>
                    <p className="mt-1 text-sm text-white">{product.title}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {product.mainCategory} / {product.subcategory}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">{product.priceText || formatCurrency(product.priceCny)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">{formatCurrency(product.priceCny)}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-end gap-3 text-xs">
                      <button onClick={() => setEditingProduct(product)} className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 font-medium text-cyan-200">
                        修改
                      </button>
                      <button onClick={() => void handleDeleteProduct(product.id)} className="rounded-full border border-rose-400/30 px-3 py-1 font-medium text-rose-300">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
                <QuickProductInlineEditor
                  product={product}
                  busy={savingEdit}
                  onSave={async (patch) => {
                    await saveQuickProduct(product, patch);
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">分类管理</h2>
          <p className="mt-2 text-sm text-slate-400">点右侧“修改”可编辑分类名称、slug、排序和描述。</p>
          <div className="mt-4 space-y-3 max-h-[560px] overflow-auto pr-1">
            {data.categories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-white/10 bg-[#09101d] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{category.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{category.slug}</p>
                    <p className="mt-1 text-xs text-slate-500">{category.description || "暂无描述"}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <button onClick={() => setEditingCategory(category)} className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 font-medium text-cyan-200">
                      修改
                    </button>
                    <button onClick={() => void handleDeleteCategory(category.id)} className="rounded-full border border-rose-400/30 px-3 py-1 font-medium text-rose-300">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">订单管理</h2>
        <div className="mt-4 space-y-4">
          {data.orders.map((order) => (
            <OrderEditor key={order.id} order={order} onSave={handleUpdateOrder} />
          ))}
        </div>
      </section>

      {editingProduct ? (
        <EditSheet
          title="编辑商品"
          onClose={() => setEditingProduct(null)}
          loading={savingEdit}
          onSubmit={async (formData) => {
            await saveProductEdit(formData);
          }}
          submitLabel="保存商品"
        >
          <EditProductFields product={editingProduct} />
        </EditSheet>
      ) : null}

      {editingCategory ? (
        <EditSheet
          title="编辑分类"
          onClose={() => setEditingCategory(null)}
          loading={savingEdit}
          onSubmit={async (formData) => {
            await saveCategoryEdit(formData);
          }}
          submitLabel="保存分类"
        >
          <EditCategoryFields category={editingCategory} />
        </EditSheet>
      ) : null}
    </div>
  );
}

function EditSheet({
  title,
  children,
  loading,
  submitLabel,
  onClose,
  onSubmit
}: {
  title: string;
  children: ReactNode;
  loading: boolean;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#060b14] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-1 text-xs text-slate-400">修改后点击保存即可同步到后台列表</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
            关闭
          </button>
        </div>
        <form
          className="max-h-[80vh] overflow-auto px-5 py-5"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit(new FormData(event.currentTarget));
          }}
        >
          <div className="grid gap-4">{children}</div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button disabled={loading} className="rounded-2xl bg-white px-5 py-3 font-semibold text-[#050816] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "保存中…" : submitLabel}
            </button>
            <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-300">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditProductFields({ product }: { product: Product }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="sku" defaultValue={product.sku} placeholder="SKU" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
        <input name="title" defaultValue={product.title} placeholder="商品标题" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="slug" defaultValue={product.slug} placeholder="slug" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
        <input name="categorySlug" defaultValue={product.categorySlug} placeholder="分类 slug" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="mainCategory" defaultValue={product.mainCategory} placeholder="主分类" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
        <input name="subcategory" defaultValue={product.subcategory} placeholder="子分类" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="priceCny"
          type="number"
          defaultValue={product.priceCny ?? ""}
          placeholder="价格数值"
          className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3"
        />
        <input name="priceText" defaultValue={product.priceText ?? ""} placeholder="价格文本" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="deliveryTime"
          defaultValue={product.deliveryTime}
          placeholder="交付时间"
          className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3"
        />
        <input
          name="stockStatus"
          defaultValue={product.stockStatus}
          placeholder="库存状态"
          className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3"
        />
      </div>
      <textarea name="description" defaultValue={product.description} placeholder="商品介绍" rows={4} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
      <textarea name="afterSales" defaultValue={product.afterSales} placeholder="售后说明" rows={3} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
      <textarea name="riskNote" defaultValue={product.riskNote} placeholder="风险提示" rows={3} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-sm text-slate-300">
          <input name="isActive" type="checkbox" defaultChecked={product.isActive} /> 上架
        </label>
        <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-sm text-slate-300">
          <input name="featured" type="checkbox" defaultChecked={product.featured} /> 推荐
        </label>
      </div>
    </>
  );
}

function EditCategoryFields({ category }: { category: Category }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" defaultValue={category.name} placeholder="分类名称" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
        <input name="slug" defaultValue={category.slug} placeholder="slug" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="parentSlug" defaultValue={category.parentSlug ?? ""} placeholder="父级 slug" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
        <input name="sortOrder" type="number" defaultValue={category.sortOrder} placeholder="排序" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
      </div>
      <textarea name="description" defaultValue={category.description} placeholder="分类描述" rows={4} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3" />
      <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-sm text-slate-300">
        <input name="featured" type="checkbox" defaultChecked={category.featured} /> 设为推荐分类
      </label>
    </>
  );
}

function QuickProductInlineEditor({
  product,
  busy,
  onSave
}: {
  product: Product;
  busy: boolean;
  onSave: (patch: Partial<Product>) => Promise<void>;
}) {
  const [priceText, setPriceText] = useState(product.priceText ?? "");
  const [priceCny, setPriceCny] = useState(product.priceCny?.toString() ?? "");
  const [isActive, setIsActive] = useState(product.isActive);
  const [featured, setFeatured] = useState(product.featured);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPriceText(product.priceText ?? "");
    setPriceCny(product.priceCny?.toString() ?? "");
    setIsActive(product.isActive);
    setFeatured(product.featured);
  }, [product]);

  return (
    <form
      className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-[#0d1525] p-3 sm:grid-cols-[1fr_1fr_auto]"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
          await onSave({
            priceText: priceText.trim() || null,
            priceCny: priceCny.trim() ? Number(priceCny) : null,
            isActive,
            featured
          });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="sm:col-span-3">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">快速改价</p>
      </div>
      <label className="grid gap-1 text-xs text-slate-400">
        价格文本
        <input
          value={priceText}
          onChange={(event) => setPriceText(event.target.value)}
          placeholder="例如：￥299 / 询价"
          className="rounded-xl border border-white/10 bg-[#09101d] px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="grid gap-1 text-xs text-slate-400">
        价格数值
        <input
          value={priceCny}
          onChange={(event) => setPriceCny(event.target.value)}
          placeholder="数字价格"
          type="number"
          className="rounded-xl border border-white/10 bg-[#09101d] px-3 py-2 text-sm text-white"
        />
      </label>
      <div className="flex items-end gap-2">
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#09101d] px-3 py-2 text-xs text-slate-300">
          <input checked={isActive} onChange={(event) => setIsActive(event.target.checked)} type="checkbox" />
          上架
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#09101d] px-3 py-2 text-xs text-slate-300">
          <input checked={featured} onChange={(event) => setFeatured(event.target.checked)} type="checkbox" />
          推荐
        </label>
        <button
          disabled={submitting || busy}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#050816] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting || busy ? "保存中…" : "快速保存"}
        </button>
      </div>
    </form>
  );
}

function OrderEditor({
  order,
  onSave
}: {
  order: Order;
  onSave: (orderNo: string, status: OrderStatus, adminNote: string, deliveryContent: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [adminNote, setAdminNote] = useState(order.adminNote);
  const [deliveryContent, setDeliveryContent] = useState(order.deliveryContent);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#09101d] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{order.orderNo}</p>
          <p className="mt-1 text-sm text-white">{order.productTitle}</p>
        </div>
        <StatusPill status={status} />
      </div>
      <div className="mt-4 grid gap-3">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
          className="rounded-2xl border border-white/10 bg-[#0f1627] px-4 py-3 text-sm"
        >
          {orderStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <textarea
          value={adminNote}
          onChange={(event) => setAdminNote(event.target.value)}
          rows={2}
          placeholder="后台备注"
          className="rounded-2xl border border-white/10 bg-[#0f1627] px-4 py-3 text-sm"
        />
        <textarea
          value={deliveryContent}
          onChange={(event) => setDeliveryContent(event.target.value)}
          rows={2}
          placeholder="交付内容"
          className="rounded-2xl border border-white/10 bg-[#0f1627] px-4 py-3 text-sm"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={() => onSave(order.orderNo, status, adminNote, deliveryContent)} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#050816]">
          保存订单
        </button>
        <p className="text-xs text-slate-500">
          {order.contactMethod} · {order.contactValue}
        </p>
      </div>
    </div>
  );
}
