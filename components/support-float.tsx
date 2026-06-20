export function SupportFloat() {
  const telegram = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/zstudio_support";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/0000000000";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      <a
        href={telegram}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-white/10 bg-[#1C2233]/90 px-4 py-3 text-sm font-medium text-white shadow-glow transition hover:scale-[1.02]"
      >
        Telegram
      </a>
      <a
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-emerald-400/20 bg-emerald-500/20 px-4 py-3 text-sm font-medium text-white transition hover:scale-[1.02]"
      >
        WhatsApp
      </a>
    </div>
  );
}
