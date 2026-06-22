import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PayCancelPage({
  searchParams
}: {
  searchParams?: Promise<{ orderNo?: string }>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-14 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">支付取消</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-white">你刚才取消了支付</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-300">
          {params.orderNo
            ? `订单 ${params.orderNo} 已保留，你可以回到订单页继续支付，或回到后台查看状态。`
            : "你可以重新返回订单页继续支付。"}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/order" className="rounded-2xl bg-white px-5 py-3 font-semibold text-[#050816]">
            重新下单
          </Link>
          <Link href="/track" className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-white">
            查订单
          </Link>
        </div>
      </div>
    </div>
  );
}
