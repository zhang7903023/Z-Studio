import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalogBundle, findProductBySlug, getTopLevelCategories } from "@/lib/catalog";
import { formatCurrency } from "@/lib/helpers";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getCatalogBundle();
  const product = findProductBySlug(products, slug);

  if (!product) {
    return { title: "商品详情" };
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description
    }
  };
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { categories, products } = await getCatalogBundle();
  const product = findProductBySlug(products, slug);
  if (!product) notFound();
  const category = categories.find((item) => item.slug === product.categorySlug);
  const mainCategory = getTopLevelCategories(categories).find((item) => item.slug === slugify(product.mainCategory));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">商品详情</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-white">{product.title}</h1>
            <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-400">
              <span className="rounded-full border border-white/10 px-3 py-1">{product.sku}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">{product.mainCategory}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">{product.subcategory}</span>
              {category ? <span className="rounded-full border border-white/10 px-3 py-1">{category.name}</span> : null}
            </div>
            <p className="mt-6 max-w-3xl leading-8 text-slate-300">{product.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">商品介绍</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                该商品来自已整理的资源目录，页面仅展示结构化信息，方便筛选、咨询和人工审核。
              </p>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">交付时间</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{product.deliveryTime}</p>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">售后说明</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{product.afterSales}</p>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">风险提示</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{product.riskNote}</p>
            </section>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-[#090e19]/85 p-8 shadow-glow">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">价格与状态</p>
            <div className="mt-3 flex items-end gap-3">
              <p className="font-display text-4xl font-semibold text-white">{formatCurrency(product.priceCny)}</p>
              {product.priceText && !product.priceCny ? <p className="pb-1 text-sm text-slate-400">{product.priceText}</p> : null}
            </div>
            <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>库存状态</span>
                <span>{product.stockStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>交付方式</span>
                <span>人工审核</span>
              </div>
              <div className="flex items-center justify-between">
                <span>所属分类</span>
                <span>{mainCategory?.name || product.mainCategory}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Link href={`/order?product=${product.slug}`} className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-[#050816]">
                立即下单
              </Link>
              <Link href="/categories" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm text-slate-200">
                返回商品分类
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-amber-400/20 bg-amber-500/10 p-6 text-sm leading-7 text-amber-100">
            请确认业务用途符合当地法规、平台政策与合规要求。资源类商品请先咨询交付条件，再完成订单。
          </div>
        </aside>
      </div>
    </div>
  );
}
