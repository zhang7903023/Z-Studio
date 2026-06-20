import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/helpers";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">
          {product.sku}
        </span>
        {product.featured ? (
          <span className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-medium text-accent-soft">热门</span>
        ) : null}
      </div>
      <h3 className="mt-4 line-clamp-2 text-lg font-semibold text-white">{product.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{product.description}</p>
      <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
        <div>
          <p className="text-xs text-slate-500">参考价格</p>
          <p className="text-lg font-semibold text-white">
            {formatCurrency(product.priceCny)}
            {!product.priceCny && product.priceText ? <span className="ml-2 text-sm font-normal text-slate-400">{product.priceText}</span> : null}
          </p>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>{product.deliveryTime || "1-24小时"}</p>
          <p className="mt-1">{product.stockStatus}</p>
        </div>
      </div>
    </Link>
  );
}
