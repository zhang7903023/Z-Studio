import { NextResponse } from "next/server";
import { listCustomers } from "@/lib/store";
import { requireAdminAccess } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json({ customers: await listCustomers() });
}
