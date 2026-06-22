import { OrderForm } from "@/components/order-form";
import { filterProducts, getCatalogBundle } from "@/lib/catalog";
import { hasStripeConfig } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  searchParams
}: {
  searchParams?: Promise<{ product?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const { products } = await getCatalogBundle();
  const stripeEnabled = hasStripeConfig();
  const selectableProducts = filterProducts(products, { activeOnly: true }).slice(0, 120);
  const initialProduct = params.product
    ? selectableProducts.find((product) => product.slug === params.product)?.id
    : selectableProducts[0]?.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">下单系统</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-white">创建订单并上传付款截图</h1>
            <p className="mt-4 max-w-2xl leading-8 text-slate-300">
              完整记录商品、联系方式、备注和支付信息，适合人工审核收款与后续交付。
            </p>
          </div>
          <OrderForm products={selectableProducts} initialProductId={initialProduct} stripeEnabled={stripeEnabled} />
        </section>
        <aside className="space-y-4">
          {!stripeEnabled ? (
            <div className="rounded-[2rem] border border-amber-400/20 bg-amber-500/10 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Stripe 未启用</p>
              <h2 className="mt-2 text-xl font-semibold text-white">当前先用微信人工收款</h2>
              <p className="mt-3 text-sm leading-7 text-amber-50/90">
                如果要真正跳转收款，需要在 Vercel 环境变量里补上 `STRIPE_SECRET_KEY` 和 `STRIPE_WEBHOOK_SECRET`。没配置前，这里会自动切回人工收款，不影响下单。
              </p>
            </div>
          ) : null}
          <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">微信收款</p>
            <h2 className="mt-2 text-xl font-semibold text-white">推荐使用微信支付</h2>
            <p className="mt-3 text-sm leading-7 text-emerald-50/90">
              扫码后完成付款，再回到页面上传付款截图。系统会把订单先标记为待审核，方便你和后台核对。
            </p>
            <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white p-4">
              <img
                src="/payments/wechat-qr.jpg"
                alt="微信收款码"
                className="h-auto w-full rounded-2xl object-cover"
              />
            </div>
            <p className="mt-4 text-xs leading-6 text-emerald-100/80">
              如果你想换二维码，直接替换 `public/payments/wechat-qr.jpg` 即可。
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">下单流程</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <li>1. 选择商品并填写联系方式。</li>
              <li>2. 上传付款截图，进入待审核状态。</li>
              <li>3. 后台确认后进入处理中或已交付状态。</li>
              <li>4. 可在订单查询页随时跟踪进度。</li>
            </ol>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">客服入口</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">如需确认库存、交付规则或补充资料，请点击页面右下角 Telegram 或 WhatsApp 按钮。</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
