# Stripe Checkout foundation

This project uses **Stripe-hosted Checkout Sessions** created by a Cloudflare Pages Function. Card details never pass through the Good Intentions website.

## What this patch adds

- Server-side creation of one-item Stripe Checkout Sessions
- U.S. shipping-address collection
- A Stripe Shipping Rate attached to every session
- A 30-minute Checkout Session expiration
- Success, cancellation, and error pages
- Server-side payment-status verification after Stripe redirects the customer back
- Test-only support for trying draft items with a Stripe test key

Checkout remains disabled in `content/site.json`.

## Required Cloudflare secrets and variables

Add these separately for the **Preview** and **Production** environments in Cloudflare Pages:

| Name | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe secret API key. Use `sk_test_...` in Preview and `sk_live_...` only after launch approval. |
| `STRIPE_SHIPPING_RATE_ID` | Stripe Shipping Rate ID, such as `shr_...`. Create separate test and live rates. |
| `CHECKOUT_SITE_URL` | Exact site origin used for success and cancellation redirects. |
| `STRIPE_TEST_MODE_ALLOW_DRAFTS` | Optional Preview-only value of `true`. It is ignored unless the Stripe key begins with `sk_test_`. |

Never add a Stripe secret key to `content/site.json`, browser JavaScript, or a public environment variable.

## Stripe Dashboard setup

1. Create or finish Sage's Stripe account.
2. Stay in **test mode** while developing.
3. Create a standard U.S. Shipping Rate and copy its `shr_...` ID.
4. Configure the Good Intentions business name, logo, brand color, support details, receipt settings, and statement descriptor.
5. Review the payment methods enabled in the Stripe Dashboard. The code intentionally does not hard-code card-only checkout.
6. Add the test secret key and test Shipping Rate to the Cloudflare Preview environment.

## Local Cloudflare Pages test

1. Copy `.dev.vars.example` to `.dev.vars`.
2. Replace the placeholder values with a Stripe test key and test Shipping Rate.
3. Build the site:

```bash
npm run build
```

4. Start the static build and Pages Functions together:

```bash
npx wrangler pages dev dist
```

5. Open the local URL shown by Wrangler. With `STRIPE_TEST_MODE_ALLOW_DRAFTS=true`, a direct POST to `/api/checkout` can test a draft product while `checkoutEnabled` remains false.

The normal product buttons remain disabled until a product is marked `available` and `commerce.checkoutEnabled` is true. That prevents the public preview from accidentally taking payments.

## Enabling a real product later

For each product:

1. Replace every placeholder photo and product detail.
2. Confirm the final price.
3. Set `quantity` to `1` only when the item is physically available.
4. Set `status` to `available`.
5. Approve the store policies and replace the placeholder business email.
6. Configure the production Stripe key, live Shipping Rate, and production site URL.
7. Keep `STRIPE_TEST_MODE_ALLOW_DRAFTS` absent or false in production.
8. Set `commerce.checkoutEnabled` to `true` only after the inventory/webhook phase is complete.

## Important remaining limitation

This patch creates secure payment sessions, but it does **not** reserve a one-of-one item while someone is on Stripe and it does not mark the item sold after payment. Two customers could theoretically open separate Checkout Sessions for the same item.

Before live checkout is enabled, the next payment patch must add:

- Persistent inventory and order records, preferably in Cloudflare D1
- A short inventory reservation when Checkout starts
- A Stripe webhook that verifies `checkout.session.completed`
- Idempotent fulfillment logic
- Automatic sold-state updates
- Reservation release after cancellation or expiration

Do not enable production checkout before those safeguards are implemented.

## Tax note

`automaticTaxEnabled` is false by default. Do not turn it on as a substitute for deciding where the business is registered and required to collect tax. Confirm the business's tax obligations, then configure Stripe Tax and registrations accordingly.
