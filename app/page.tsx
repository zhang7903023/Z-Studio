import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck, Users } from "lucide-react";
import { getCatalogBundle, getTopLevelCategories, filterProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { formatCurrency } from "@/lib/helpers";

export default async function HomePage() {
  const { categories, products } = await getCatalogBundle();
  const featuredCategories = getTopLevelCategories(categories).slice(0, 8);
  const featuredProducts = filterProducts(products, { activeOnly: true }).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-hero-grid px-6 py-14 shadow-glow sm:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-300">
              Z-Studio · Global Digital Resource Platform
            </span>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
              为全球业务搭建一站式数字资源商城。
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              科技极简风、多类别资源聚合、订单审核、付款截图上传、状态查询与后台管理，一套系统覆盖资源展示到交付。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/categories" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#050816] transition hover:opacity-90">
                浏览商品
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/order" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                立即下单
              </Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-[#090e19]/80 p-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "商品总数", value: `${products.length}+` },
                { label: "核心分类", value: `${featuredCategories.length}` },
                { label: "订单流程", value: "在线提交" },
                { label: "客服接入", value: "Telegram / WhatsApp" }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                风险提示与售后说明默认展示
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Truck className="h-4 w-4 text-cyan-300" />
                下单后可追踪审核与交付状态
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Users className="h-4 w-4 text-violet-300" />
                支持客户联系方式与历史订单管理
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Sparkles className="h-4 w-4 text-amber-300" />
                SEO、Sitemap、OpenGraph 已预置
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">核心分类</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white">快速进入主营业务</h2>
          </div>
          <Link href="/categories" className="text-sm text-slate-400 hover:text-white">
            查看全部
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/5"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Category</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{category.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">服务说明</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">中性展示，清晰交付</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <p>我们把商品信息结构化展示为价格、交付时间、售后与风险提示，方便用户在同一页面完成决策。</p>
            <p>订单系统预留付款截图上传、联系方式记录与状态追踪，便于人工审核与交付协作。</p>
            <p>后台管理可承载商品、分类、客户和订单信息，适合与 Supabase 和 Vercel 部署衔接。</p>
          </div>
        </div>
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">热门服务</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-white">精选商品入口</h2>
            </div>
            <div className="text-sm text-slate-400">{featuredProducts.length} items</div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {featuredProducts.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
