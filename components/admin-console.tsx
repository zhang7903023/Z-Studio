"use client";

import { useEffect, useMemo, useState } from "react";
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
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">{formatCurrency(product.priceCny)}</p>
                    <button onClick={() => handleDeleteProduct(product.id)} className="mt-2 text-xs text-rose-300">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">分类管理</h2>
          <div className="mt-4 space-y-3 max-h-[560px] overflow-auto pr-1">
            {data.categories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-white/10 bg-[#09101d] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{category.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{category.slug}</p>
                  </div>
                  <button onClick={() => handleDeleteCategory(category.id)} className="text-xs text-rose-300">
                    删除
                  </button>
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
    </div>
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
