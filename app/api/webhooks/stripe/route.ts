import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/store";
import { verifyStripeWebhookSignature } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");
    const verified = verifyStripeWebhookSignature(payload, signature);

    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: 400 });
    }

    const event = JSON.parse(payload) as {
      type?: string;
      data?: {
        object?: {
          metadata?: Record<string, string>;
          payment_status?: string;
          status?: string;
        };
      };
    };

    if (event.type === "checkout.session.completed") {
      const session = event.data?.object;
      const orderNo = session?.metadata?.orderNo;
      if (orderNo && session?.payment_status === "paid") {
        await updateOrderStatus(orderNo, "pending_review", "Stripe 已付款，等待人工审核", "");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Stripe webhook 处理失败"
      },
      { status: 500 }
    );
  }
}
