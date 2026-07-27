const STRIPE_API_VERSION = "2026-02-25.clover";
const STORE_ID = "good-intentions";

type CheckoutEnv = {
  STRIPE_SECRET_KEY?: string;
};

type PagesContext<Env> = {
  request: Request;
  env: Env;
};

type StripeCheckoutSession = {
  id?: string;
  status?: string | null;
  payment_status?: string;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string> | null;
  error?: {
    message?: string;
    type?: string;
  };
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function onRequestGet({ request, env }: PagesContext<CheckoutEnv>): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "Checkout status is not configured." }, 503);
  }

  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim() ?? "";
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return json({ error: "Invalid checkout session." }, 400);
  }

  const stripeResponse = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Stripe-Version": STRIPE_API_VERSION,
      },
    },
  );

  const session = (await stripeResponse.json()) as StripeCheckoutSession;
  if (!stripeResponse.ok) {
    console.error("Stripe Checkout Session lookup failed", {
      status: stripeResponse.status,
      type: session.error?.type,
      message: session.error?.message,
    });
    return json({ error: "Checkout status could not be verified." }, 502);
  }

  if (session.metadata?.store !== STORE_ID) {
    return json({ error: "Checkout session does not belong to this store." }, 403);
  }

  return json({
    sessionId: session.id,
    status: session.status,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    currency: session.currency,
    productSlug: session.metadata?.product_slug ?? null,
  });
}

export function onRequest(): Response {
  return new Response("Method not allowed", {
    status: 405,
    headers: { Allow: "GET" },
  });
}
