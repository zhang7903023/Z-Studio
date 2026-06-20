export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-slate-400 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-white">Z-Studio</p>
          <p className="mt-2 max-w-xl leading-7">
            全球数字资源服务平台，聚焦 TikTok、Facebook、Instagram、YouTube、Gmail、跨境电商与网络资源。
          </p>
        </div>
        <div className="lg:text-right">
          <p>支持 Telegram / WhatsApp 客服接入。</p>
          <p className="mt-2">订单、支付与交付流程可连接 Supabase + Vercel。</p>
        </div>
      </div>
    </footer>
  );
}
