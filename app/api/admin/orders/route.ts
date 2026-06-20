import { NextResponse } from "next/server";
import { listOrders, updateOrderStatus } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { requireAdminAccess } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json({ orders: await listOrders() });
}

export async function PUT(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const body = await request.json();
  const orderNo = String(body.orderNo || "");
  const status = String(body.status || "pending_review") as OrderStatus;
  const adminNote = String(body.adminNote || "");
  const deliveryContent = String(body.deliveryContent || "");
  await updateOrderStatus(orderNo, status, adminNote, deliveryContent);
  return NextResponse.json({ ok: true });
}
