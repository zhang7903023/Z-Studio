import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { filterProducts, findCategoryBySlug, getCatalogBundle } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getCatalogBundle();
  const category = findCategoryBySlug(categories, slug);

  if (!category) {
    return { title: "商品分类" };
  }

  return {
    title: `${category.name} 分类`,
    description: category.description,
    openGraph: {
      title: `${category.name} 分类 | Z-Studio`,
      description: category.description
    }
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ q?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const paramsSearch = (await searchParams) ?? {};
  const { categories, products } = await getCatalogBundle();
  const category = findCategoryBySlug(categories, slug);
  if (!category) notFound();

  const filtered = filterProducts(products, {
    q: paramsSearch.q,
    category: category.slug,
    sort: paramsSearch.sort,
    activeOnly: true
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">分类页面</p>
        <h1 className="font-display text-4xl font-semibold text-white">{category.name}</h1>
        <p className="max-w-3xl text-slate-300">{category.description}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/categories" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            返回全部分类
          </Link>
          <Link href="/order" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#050816]">
            立即下单
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
