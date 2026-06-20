import { AdminConsole } from "@/components/admin-console";
import { hasAdminAccessKey } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">后台管理</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-white">商品、分类、订单、客户统一管理</h1>
        <p className="mt-4 max-w-3xl leading-8 text-slate-300">
          当前后台已经可以直接新增、删除和更新数据。先把核心业务跑通，通知系统后面再接。
        </p>
      </div>

      <div className="mt-8">
        <AdminConsole requiresAccessKey={hasAdminAccessKey()} />
      </div>
    </div>
  );
}
