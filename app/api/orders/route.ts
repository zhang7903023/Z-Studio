import { NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/store";
import { getCatalogBundle } from "@/lib/catalog";
import { savePaymentScreenshot } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNo = url.searchParams.get("orderNo");
  const contactValue = url.searchParams.get("contactValue");
  const orders = await listOrders();
  const order =
    orders.find((item) => item.orderNo === orderNo) ||
    orders.find((item) => item.contactValue === contactValue);

  if (!order) {
    return NextResponse.json({ error: "未找到订单" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const productId = String(formData.get("productId") || "");
  const customerName = String(formData.get("customerName") || "");
  const contactMethod = String(formData.get("contactMethod") || "Telegram");
  const contactValue = String(formData.get("contactValue") || "");
  const quantity = Number(formData.get("quantity") || 1);
  const requirements = String(formData.get("requirements") || "");
  const paymentMethod = String(formData.get("paymentMethod") || "USDT");
  const screenshot = formData.get("paymentScreenshot");

  const { products } = await getCatalogBundle();
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return NextResponse.json({ error: "请选择有效商品" }, { status: 400 });
  }

  const paymentScreenshotUrl =
    screenshot instanceof File ? await savePaymentScreenshot(screenshot, product.sku) : "";

  const order = await createOrder({
    customerName,
    contactMethod,
    contactValue,
    productId: product.id,
    productTitle: product.title,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    requirements,
    paymentMethod,
    paymentScreenshotUrl,
    totalPriceCny: typeof product.priceCny === "number" ? product.priceCny * (Number.isFinite(quantity) && quantity > 0 ? quantity : 1) : null
  });

  return NextResponse.json({ ok: true, orderNo: order.orderNo, order });
}
