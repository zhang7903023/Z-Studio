import { createHmac, timingSafeEqual } from "node:crypto";

export function hasStripeConfig() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getSiteUrl(fallback?: string) {
  return process.env.NEXT_PUBLIC_SITE_URL || fallback || "http://localhost:3000";
}

export async function createStripeCheckoutSession(input: {
  orderNo: string;
  productTitle: string;
  quantity: number;
  unitAmountCny: number;
  successUrl: string;
  cancelUrl: string;
  customerName?: string;
  contactValue?: string;
}) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("未配置 STRIPE_SECRET_KEY");
  }

  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", input.successUrl);
  body.set("cancel_url", input.cancelUrl);
  body.set("payment_method_types[0]", "card");
  body.set("line_items[0][price_data][currency]", "cny");
  body.set("line_items[0][price_data][product_data][name]", input.productTitle);
  body.set("line_items[0][price_data][unit_amount]", String(Math.round(input.unitAmountCny * 100)));
  body.set("line_items[0][quantity]", String(Math.max(1, input.quantity)));
  body.set("metadata[orderNo]", input.orderNo);
  if (input.customerName) body.set("metadata[customerName]", input.customerName);
  if (input.contactValue) body.set("metadata[contactValue]", input.contactValue);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  const payload = (await response.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || "创建 Stripe 支付会话失败");
  }

  if (!payload.url || !payload.id) {
    throw new Error("Stripe 未返回支付地址");
  }

  return {
    id: payload.id,
    url: payload.url
  };
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("未配置 STRIPE_SECRET_KEY");
  }

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${secret}`
    }
  });

  const payload = (await response.json()) as {
    id?: string;
    payment_status?: string;
    status?: string;
    amount_total?: number;
    currency?: string;
    metadata?: Record<string, string>;
    customer_details?: { email?: string; name?: string };
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || "获取 Stripe 支付结果失败");
  }

  return payload;
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return { ok: false, error: "未配置 STRIPE_WEBHOOK_SECRET" };
  }
  if (!signatureHeader) {
    return { ok: false, error: "缺少 Stripe 签名" };
  }

  const entries = signatureHeader.split(",").map((part) => part.split("="));
  const timestamp = entries.find(([key]) => key === "t")?.[1];
  const signatures = entries.filter(([key]) => key === "v1").map(([, value]) => value).filter(Boolean);

  if (!timestamp || !signatures.length) {
    return { ok: false, error: "Stripe 签名格式不正确" };
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  const matched = signatures.some((signature) => {
    try {
      const signatureBuffer = Buffer.from(signature, "hex");
      return signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch {
      return false;
    }
  });

  if (!matched) {
    return { ok: false, error: "Stripe 签名校验失败" };
  }

  return { ok: true as const };
}
