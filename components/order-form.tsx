"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { Product } from "@/lib/types";

export function OrderForm({ products, initialProductId }: { products: Product[]; initialProductId?: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ orderNo?: string; error?: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Stripe跳转支付");
  const usesStripeRedirect = useMemo(() => paymentMethod.toLowerCase().includes("stripe"), [paymentMethod]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData
      });
      const raw = await response.text();
      let payload: { orderNo?: string; error?: string; [key: string]: unknown } = {};
      if (raw) {
        try {
          payload = JSON.parse(raw) as typeof payload;
        } catch {
          payload = { error: raw };
        }
      }
      if (!response.ok) throw new Error(payload?.error || raw || "提交失败");
      if (payload.redirectUrl) {
        window.location.href = String(payload.redirectUrl);
        return;
      }
      setResult({ orderNo: payload.orderNo });
      event.currentTarget.reset();
      setPaymentMethod("Stripe跳转支付");
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "提交失败" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow">
      <div className="grid gap-2 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">联系人</span>
          <input name="customerName" required className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 outline-none transition focus:border-accent" placeholder="请输入姓名或称呼" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">联系方式</span>
          <input name="contactValue" required className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 outline-none transition focus:border-accent" placeholder="Telegram / WhatsApp / Email / 手机号" />
        </label>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">联系方式类型</span>
          <select name="contactMethod" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 outline-none transition focus:border-accent">
            <option>Telegram</option>
            <option>WhatsApp</option>
            <option>Email</option>
            <option>Phone</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">商品</span>
          <select name="productId" defaultValue={initialProductId} required className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 outline-none transition focus:border-accent">
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.sku} · {product.title.slice(0, 32)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">数量</span>
          <input name="quantity" type="number" min="1" defaultValue="1" className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 outline-none transition focus:border-accent" />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-sm text-slate-300">需求备注</span>
        <textarea name="requirements" rows={4} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 outline-none transition focus:border-accent" placeholder="补充地区、用途、交付偏好等信息" />
      </label>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">支付方式</span>
          <select
            name="paymentMethod"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 outline-none transition focus:border-accent"
          >
            <option value="Stripe跳转支付">Stripe 跳转支付</option>
            <option value="微信">微信</option>
            <option value="支付宝">支付宝</option>
            <option value="USDT">USDT</option>
            <option value="银行卡">银行卡</option>
          </select>
        </label>
        {usesStripeRedirect ? (
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm leading-6 text-cyan-100">
            选择后会跳转到 Stripe 托管收款页，支付完成后自动返回本站。
          </div>
        ) : (
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">付款截图</span>
            <input name="paymentScreenshot" type="file" accept="image/*" className="rounded-2xl border border-dashed border-white/10 bg-[#09101d] px-4 py-3 text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-white" />
          </label>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-gradient-to-r from-accent to-cyan-400 px-5 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "提交中..." : usesStripeRedirect ? "去支付" : "创建订单"}
      </button>
      {result?.orderNo ? <p className="text-sm text-emerald-300">订单已创建，订单号：{result.orderNo}</p> : null}
      {result?.error ? <p className="text-sm text-rose-300">{result.error}</p> : null}
      <p className="text-xs leading-6 text-slate-500">
        {usesStripeRedirect
          ? "会先创建订单，再跳转到 Stripe 托管支付页。支付完成后会回到本站成功页。"
          : "付款后请保留截图，提交后进入审核或处理流程。系统会记录联系方式与订单状态，便于后续查询。"}
      </p>
    </form>
  );
}
