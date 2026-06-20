import { NextResponse } from "next/server";
import { deleteProduct, listProducts, upsertProduct } from "@/lib/store";
import { requireAdminAccess } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json({ products: await listProducts() });
}

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const body = await request.json();
  const product = await upsertProduct(body);
  return NextResponse.json({ product });
}

export async function PUT(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const body = await request.json();
  const product = await upsertProduct(body);
  return NextResponse.json({ product });
}

export async function DELETE(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
