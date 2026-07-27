# Good Intentions — Website Foundation

Astro + TypeScript foundation for a founder-led secondhand clothing storefront. This repository follows the same staged approach used for LRL Photography: owner-editable content, reusable layouts, static Cloudflare Pages hosting, launch validation, and customer-facing features enabled only after the required business information is ready.

## Current direction

- Direct purchasing through the website is the intended checkout flow.
- Hosting targets the Cloudflare Pages free tier.
- The initial checkout adapter is designed around per-product Stripe Payment Links, avoiding a monthly ecommerce-platform bill. Stripe transaction fees still apply to successful card payments.
- Checkout is intentionally disabled until real products, measurements, policies, shipping information, and payment links are approved.
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

`npm run verify:launch` is expected to fail during the foundation stage. It blocks launch while checkout is disabled, policies are drafts, the public email is a placeholder, products contain draft details, or secure payment links are missing.

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22.22.2`
- Environment variable: `PUBLIC_SITE_URL=https://your-production-url`

## Owner-editable content

The working business information, catalog model, collections, services, events, and policies are stored in `content/site.json` rather than being scattered throughout page templates.

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

## Visual assets

The current foundation uses code-native gradient artwork instead of copying Instagram screenshots into the public repository. The supplied photos and posts informed the brand interpretation, collection descriptions, catalog examples, service structure, and event direction. Original publication-approved product and founder photography should replace the temporary artwork before launch.

## Checkout workflow

The product model includes `quantity`, `status`, and `checkoutUrl`.

To activate a product:

1. Add original photos and confirm the real product details.
2. Create a secure Stripe Payment Link for that one item.
3. Set the product status to `available` and quantity to `1`.
4. Add the Payment Link to `checkoutUrl`.
5. After a sale, disable the Stripe link and mark the product sold.

This manual approach is suitable for a small one-of-one catalog. A later phase can add server-side inventory validation and an authenticated management interface if sales volume makes manual updates impractical.

## Remaining launch inputs

- Original logo and publication-approved photographs
- Public business email
- Real product names, prices, sizes, measurements, brands, materials, flaws, and shipping weights
- Current style-bundle options and pricing
- Final personal-styling scope and pricing language
- Confirmed event dates and venues
- Approved return, exchange, cancellation, lost-package, and custom-service policies
- Stripe account and payment links
- Production URL or custom domain

See `docs/WEBSITE_DIRECTION.md` for the current business and creative direction.
