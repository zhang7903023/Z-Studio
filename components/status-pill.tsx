import { cn } from "@/lib/helpers";

const statusMap: Record<string, string> = {
  pending_payment: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  pending_review: "bg-sky-500/15 text-sky-300 border-sky-500/20",
  processing: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  delivered: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  after_sales: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  cancelled: "bg-rose-500/15 text-rose-300 border-rose-500/20"
};

const labels: Record<string, string> = {
  pending_payment: "待付款",
  pending_review: "待审核",
  processing: "处理中",
  delivered: "已交付",
  after_sales: "售后中",
  cancelled: "已取消"
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium", statusMap[status] ?? "border-white/10 bg-white/5 text-slate-300")}>
      {labels[status] ?? status}
    </span>
  );
}
