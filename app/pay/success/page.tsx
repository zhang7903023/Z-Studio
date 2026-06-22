import Link from "next/link";
import { getOrderByOrderNo, updateOrderStatus } from "@/lib/store";
import { hasStripeConfig, retrieveStripeCheckoutSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function PaySuccessPage({
  searchParams
}: {
  searchParams?: Promise<{ orderNo?: string; session_id?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const order = params.orderNo ? await getOrderByOrderNo(params.orderNo) : null;
  let session = null as Awaited<ReturnType<typeof retrieveStripeCheckoutSession>> | null;
  if (params.session_id && hasStripeConfig()) {
    try {
      session = await retrieveStripeCheckoutSession(params.session_id);
    } catch {
      session = null;
    }
  }
  const isPaid = session?.payment_status === "paid" || session?.status === "complete";
  const orderNo = order?.orderNo || session?.metadata?.orderNo || params.orderNo || "";
  const shouldPromoteOrder = Boolean(orderNo && isPaid);

  if (shouldPromoteOrder) {
    await updateOrderStatus(orderNo, "pending_review", "Stripe 已付款，等待人工审核", "");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center px-4 py-14 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">支付成功</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-white">{isPaid ? "已完成 Stripe 支付" : "已收到支付返回"}</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-300">
          {order
            ? `订单 ${order.orderNo} 已创建。${isPaid ? "我们已确认支付状态，并已进入待审核。" : "如果 Stripe 还在处理，稍后刷新即可。"}`
            : "你的支付会话已返回本站，可以继续查看订单状态。"}
        </p>

        <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-[#09101d] p-6 text-left sm:grid-cols-2">
          <Info label="订单号" value={order?.orderNo || params.orderNo || orderNo || "—"} />
          <Info label="支付状态" value={isPaid ? "已支付" : session?.payment_status || "待确认"} />
          <Info label="商品" value={order?.productTitle || "—"} />
          <Info label="支付金额" value={typeof session?.amount_total === "number" ? `¥${(session.amount_total / 100).toFixed(2)}` : "—"} />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/track" className="rounded-2xl bg-white px-5 py-3 font-semibold text-[#050816]">
            去查订单
          </Link>
          <Link href="/" className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-white">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
