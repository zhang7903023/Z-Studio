import { NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/store";
import { getCatalogBundle, productDisplayPrice } from "@/lib/catalog";
import { savePaymentScreenshot } from "@/lib/uploads";
import { createStripeCheckoutSession, getSiteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
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
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "查询订单失败"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const unitPriceCny = productDisplayPrice(product);
    const totalPriceCny =
      typeof unitPriceCny === "number" ? unitPriceCny * (Number.isFinite(quantity) && quantity > 0 ? quantity : 1) : null;

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
      totalPriceCny
    });

    if (paymentMethod.toLowerCase().includes("stripe")) {
      if (typeof unitPriceCny !== "number") {
        return NextResponse.json({ error: "该商品暂无可用于 Stripe 的固定价格，请先在后台补充价格。" }, { status: 400 });
      }

      const siteUrl = getSiteUrl(new URL(request.url).origin);
      const session = await createStripeCheckoutSession({
        orderNo: order.orderNo,
        productTitle: `${product.title} × ${order.quantity}`,
        quantity: order.quantity,
        unitAmountCny: unitPriceCny,
        successUrl: `${siteUrl}/pay/success?orderNo=${encodeURIComponent(order.orderNo)}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${siteUrl}/pay/cancel?orderNo=${encodeURIComponent(order.orderNo)}`,
        customerName: order.customerName,
        contactValue: order.contactValue
      });

      return NextResponse.json({
        ok: true,
        orderNo: order.orderNo,
        order,
        redirectUrl: session.url
      });
    }

    return NextResponse.json({ ok: true, orderNo: order.orderNo, order });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "创建订单失败"
      },
      { status: 500 }
    );
  }
}
