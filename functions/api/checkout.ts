import { checkoutCatalog, checkoutSettings } from "../_generated/catalog";

const STRIPE_API_VERSION = "2026-02-25.clover";
const STORE_ID = "good-intentions";

type CheckoutEnv = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_SHIPPING_RATE_ID?: string;
  CHECKOUT_SITE_URL?: string;
  STRIPE_TEST_MODE_ALLOW_DRAFTS?: string;
};

type PagesContext<Env> = {
  request: Request;
  env: Env;
};

type StripeCheckoutSession = {
  id?: string;
  url?: string | null;
  error?: {
    message?: string;
    type?: string;
  };
};

function redirectToError(siteOrigin: string, reason: string): Response {
  const url = new URL("/checkout/error", siteOrigin);
  url.searchParams.set("reason", reason);
  return Response.redirect(url.toString(), 303);
}

function resolveSiteOrigin(request: Request, configuredUrl?: string): string {
  const fallback = new URL(request.url).origin;
  if (!configuredUrl?.trim()) return fallback;

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return fallback;
  }
}

function isSameOriginRequest(request: Request, siteOrigin: string): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === siteOrigin;
  } catch {
    return false;
  }
}

function isTestDraftOverride(env: CheckoutEnv): boolean {
  return (
    env.STRIPE_TEST_MODE_ALLOW_DRAFTS === "true" &&
    Boolean(env.STRIPE_SECRET_KEY?.startsWith("sk_test_"))
  );
}

export async function onRequestPost({ request, env }: PagesContext<CheckoutEnv>): Promise<Response> {
  const siteOrigin = resolveSiteOrigin(request, env.CHECKOUT_SITE_URL);

  if (!isSameOriginRequest(request, siteOrigin)) {
    return redirectToError(siteOrigin, "invalid-request");
  }

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_SHIPPING_RATE_ID) {
    return redirectToError(siteOrigin, "configuration");
  }

  const testDraftOverride = isTestDraftOverride(env);

  if (!checkoutSettings.checkoutEnabled && !testDraftOverride) {
    return redirectToError(siteOrigin, "not-ready");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirectToError(siteOrigin, "invalid-request");
  }

  const slug = String(form.get("productSlug") ?? "").trim();
  const product = checkoutCatalog[slug as keyof typeof checkoutCatalog];

  if (!product) {
    return redirectToError(siteOrigin, "missing-item");
  }

  if ((product.status !== "available" || product.quantity !== 1) && !testDraftOverride) {
    return redirectToError(siteOrigin, "unavailable");
  }

  const successUrl = new URL("/checkout/success", siteOrigin);
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

  const cancelUrl = new URL(`/shop/${encodeURIComponent(product.slug)}`, siteOrigin);
  cancelUrl.searchParams.set("checkout", "cancelled");

  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("submit_type", "pay");
  body.set("success_url", successUrl.toString());
  body.set("cancel_url", cancelUrl.toString());
  body.set("client_reference_id", product.slug);
  body.set("expires_at", String(Math.floor(Date.now() / 1000) + checkoutSettings.sessionExpiryMinutes * 60));
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", product.currency);
  body.set("line_items[0][price_data][unit_amount]", String(product.unitAmount));
  body.set("line_items[0][price_data][product_data][name]", product.name);
  body.set("line_items[0][price_data][product_data][metadata][product_slug]", product.slug);
  body.set("metadata[store]", STORE_ID);
  body.set("metadata[product_slug]", product.slug);
  body.set("payment_intent_data[metadata][store]", STORE_ID);
  body.set("payment_intent_data[metadata][product_slug]", product.slug);
  body.set("shipping_address_collection[allowed_countries][0]", checkoutSettings.shippingCountries[0] ?? "US");
  body.set("shipping_options[0][shipping_rate]", env.STRIPE_SHIPPING_RATE_ID);

  if (checkoutSettings.automaticTaxEnabled) {
    body.set("automatic_tax[enabled]", "true");
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": crypto.randomUUID(),
      "Stripe-Version": STRIPE_API_VERSION,
    },
    body,
  });

  const session = (await stripeResponse.json()) as StripeCheckoutSession;

  if (!stripeResponse.ok || !session.url) {
    console.error("Stripe Checkout Session creation failed", {
      status: stripeResponse.status,
      type: session.error?.type,
      message: session.error?.message,
      productSlug: product.slug,
    });
    return redirectToError(siteOrigin, "stripe");
  }

  return Response.redirect(session.url, 303);
}

export function onRequest(): Response {
  return new Response("Method not allowed", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
