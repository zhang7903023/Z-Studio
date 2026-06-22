import { StatusPill } from "@/components/status-pill";
import { getOrderByOrderNo, listOrders } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function TrackPage({
  searchParams
}: {
  searchParams?: Promise<{ orderNo?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const currentOrder = params.orderNo ? await getOrderByOrderNo(params.orderNo) : null;
  const recentOrders = (await listOrders()).slice(0, 10);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">订单状态查询</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-white">按订单号查询进度</h1>
          <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]" action="/track" method="get">
            <input
              name="orderNo"
              defaultValue={params.orderNo}
              placeholder="输入订单号，例如 ZS12345678"
              className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 outline-none"
            />
            <button className="rounded-2xl bg-white px-5 py-3 font-semibold text-[#050816]">查询</button>
          </form>
          {currentOrder ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-[#090e19] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">订单号</p>
                  <p className="mt-1 text-xl font-semibold text-white">{currentOrder.orderNo}</p>
                </div>
                <StatusPill status={currentOrder.status} />
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-300">
                <div className="flex justify-between gap-3 border-b border-white/10 pb-3">
                  <span>商品</span>
                  <span>{currentOrder.productTitle}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-white/10 pb-3">
                  <span>支付方式</span>
                  <span>{currentOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-white/10 pb-3">
                  <span>订单金额</span>
                  <span>{typeof currentOrder.totalPriceCny === "number" ? `¥${currentOrder.totalPriceCny.toFixed(2)}` : "待确认"}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-white/10 pb-3">
                  <span>联系方式</span>
                  <span>{currentOrder.contactMethod} · {currentOrder.contactValue}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>备注</span>
                  <span>{currentOrder.requirements || "无"}</span>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="text-xl font-semibold text-white">最近订单</h2>
          <div className="mt-5 space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/10 bg-[#09101d] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">{order.orderNo}</p>
                    <p className="mt-1 text-sm text-white">{order.productTitle}</p>
                  </div>
                  <StatusPill status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
