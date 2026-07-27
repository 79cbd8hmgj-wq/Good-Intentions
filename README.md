# Good Intentions — Website Foundation

Astro + TypeScript foundation for a founder-led secondhand clothing storefront. This repository follows the same staged approach used for LRL Photography: owner-editable content, reusable layouts, static Cloudflare Pages hosting, launch validation, and customer-facing features enabled only after the required business information is ready.

## Current direction

- Direct purchasing through the website is the intended checkout flow.
- Hosting targets the Cloudflare Pages free tier.
- Checkout uses Stripe-hosted Checkout Sessions created by Cloudflare Pages Functions.
- Checkout is intentionally disabled until real products, measurements, policies, shipping information, inventory safeguards, and Stripe production settings are approved.
- Website orders are shipping-only within the United States.
- Local handoffs are limited to prearranged in-person events.
- Style bundles and personal styling are arranged through direct communication with Sage.
- Clothing donations begin with photographs and require acceptance before shipping or meetup.

## Runtime

Use Node.js `22.22.2`.

```bash
nvm use
npm install
npm run verify:content
npm run dev
```

Before merging a development patch:

```bash
npm run check
npm run build
npm run verify:content
```

`npm run verify:launch` is expected to fail during the foundation stage. It blocks launch while checkout is disabled, policies are drafts, the public email is a placeholder, products contain draft details, or inventory is not ready.

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22.22.2`
- Build environment variable: `PUBLIC_SITE_URL=https://your-production-url`
- Runtime secret: `STRIPE_SECRET_KEY`
- Runtime variable or secret: `STRIPE_SHIPPING_RATE_ID`
- Runtime variable: `CHECKOUT_SITE_URL`

Cloudflare automatically deploys the routes under `functions/` as Pages Functions.

## Owner-editable content

The working business information, catalog model, collections, services, events, and policies are stored in `content/site.json` rather than being scattered throughout page templates.

`npm run generate:checkout` creates a limited server-side product catalog under `functions/_generated/`. It contains only the fields required to validate a Checkout Session and is regenerated before development, checking, and production builds.

## Current routes

- `/`
- `/shop`
- `/shop/[slug]`
- `/style-bundles`
- `/personal-styling`
- `/events`
- `/donate`
- `/about`
- `/policies`
- `/checkout/success`
- `/checkout/cancelled`
- `/checkout/error`
- `POST /api/checkout`
- `GET /api/checkout-status`

## Visual assets

The current foundation uses code-native gradient artwork instead of copying Instagram screenshots into the public repository. The supplied photos and posts informed the brand interpretation, collection descriptions, catalog examples, service structure, and event direction. Original publication-approved product and founder photography should replace the temporary artwork before launch.

## Checkout workflow

The product model includes `quantity`, `status`, and a server-validated price. Browser code never decides the amount charged.

When a product is ready:

1. Add original photos and confirm every product detail.
2. Set the item status to `available` and quantity to `1`.
3. Confirm the shipping rate, policies, and Stripe test configuration.
4. Test the hosted Checkout Session through a Cloudflare preview deployment.
5. Add persistent inventory reservations and Stripe webhook fulfillment.
6. Configure live Stripe and Cloudflare secrets.
7. Set `commerce.checkoutEnabled` to `true` only after the launch checks pass.

The current patch deliberately stops before live inventory locking. See `docs/STRIPE-CHECKOUT.md` for setup, testing, and the remaining safety work.

## Remaining launch inputs

- Original logo and publication-approved photographs
- Public business email
- Real product names, prices, sizes, measurements, brands, materials, flaws, and shipping weights
- Current style-bundle options and pricing
- Final personal-styling scope and pricing language
- Confirmed event dates and venues
- Approved return, exchange, cancellation, lost-package, and custom-service policies
- Verified Stripe account and production shipping rate
- Persistent one-of-one inventory reservations and webhook fulfillment
- Production URL or custom domain

See `docs/WEBSITE_DIRECTION.md` for the current business and creative direction.
