import { NextResponse } from "next/server";
import { ADMIN_ACCESS_HEADER } from "@/lib/admin-access";

export { ADMIN_ACCESS_HEADER };

export function hasAdminAccessKey() {
  return Boolean(process.env.ADMIN_ACCESS_KEY && process.env.ADMIN_ACCESS_KEY !== "change-me");
}

export function isAdminRequestAuthorized(request: Request) {
  if (!hasAdminAccessKey()) return true;
  return request.headers.get(ADMIN_ACCESS_HEADER) === process.env.ADMIN_ACCESS_KEY;
}

export function requireAdminAccess(request: Request) {
  if (isAdminRequestAuthorized(request)) return null;
  return NextResponse.json({ error: "未授权访问" }, { status: 401 });
}
