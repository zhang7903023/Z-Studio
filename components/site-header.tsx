import Link from "next/link";

const nav: Array<{ href: "/categories" | "/order" | "/track" | "/admin"; label: string }> = [
  { href: "/categories", label: "商品分类" },
  { href: "/order", label: "下单系统" },
  { href: "/track", label: "订单查询" },
  { href: "/admin", label: "后台管理" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-glow">
            <span className="text-sm font-semibold tracking-[0.25em] text-accent">Z</span>
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-wide">Z-Studio</p>
            <p className="text-xs text-slate-400">Global Digital Resource Platform</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
