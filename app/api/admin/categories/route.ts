import { NextResponse } from "next/server";
import { deleteCategory, listCategories, upsertCategory } from "@/lib/store";
import { requireAdminAccess } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json({ categories: await listCategories() });
}

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const body = await request.json();
  const category = await upsertCategory(body);
  return NextResponse.json({ category });
}

export async function PUT(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const body = await request.json();
  const category = await upsertCategory(body);
  return NextResponse.json({ category });
}

export async function DELETE(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  await deleteCategory(id);
  return NextResponse.json({ ok: true });
}
