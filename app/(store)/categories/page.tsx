import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { filterProducts, getCatalogBundle, getTopLevelCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const { categories, products } = await getCatalogBundle();
  const filtered = filterProducts(products, {
    q: params.q,
    category: params.category,
    sort: params.sort,
    activeOnly: true
  });
  const topCategories = getTopLevelCategories(categories);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">商品分类页</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-white">分类筛选、搜索与排序</h1>
        </div>
        <form className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3 lg:w-[52rem]" action="/categories" method="get">
          <input name="q" defaultValue={params.q} placeholder="搜索商品、SKU、描述..." className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 outline-none" />
          <select name="category" defaultValue={params.category ?? "all"} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 outline-none">
            <option value="all">全部分类</option>
            {topCategories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <select name="sort" defaultValue={params.sort ?? "featured"} className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 outline-none">
            <option value="featured">热门优先</option>
            <option value="price-asc">价格从低到高</option>
            <option value="price-desc">价格从高到低</option>
            <option value="title">名称排序</option>
          </select>
        </form>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/categories" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          全部
        </Link>
        {topCategories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!filtered.length ? (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">没有找到匹配商品，请调整筛选条件。</div>
      ) : null}
    </div>
  );
}
