# Good Intentions website direction

## Positioning

Good Intentions is a founder-led online thrift boutique where customers can discover one-of-one secondhand pieces, themed collections, style bundles, personal styling, and in-person events.

## Confirmed decisions

- Visitors should be able to browse and buy clothing, request style bundles, arrange personal styling, find events, submit donations, learn about the brand, and contact Sage.
- Sage prefers customers to purchase directly through the website.
- The website should avoid a monthly hosting or ecommerce-platform bill when practical.
- Normal website orders ship within the United States.
- Local handoffs are limited to prearranged in-person events.
- Products are generally posted over time rather than only through formal collection drops.
- Style bundles and personal styling are handled through direct communication.
- Donations begin with photographs and are accepted or declined before shipping or meetup.
- Swaps, trades, and offers may continue through direct communication.

## Brand interpretation

Core descriptors: 2000s, hipster, good vibes, free-spirited, dreamy, colorful, nostalgic, music-inspired, and community-oriented.

The stable website identity uses a deep plum foundation, warm cream typography, saturated gradient orbs, and editorial fashion composition. Individual collections can introduce their own palettes and moods without rebuilding the site.

## Collection references interpreted from Instagram

- Shakira Collection: Y2K performance styling, metallic details, belts, skirts, and bold going-out pieces.
- A Midsummer Night's Dream: earthy fairy energy, floral texture, lace, and dreamy layers.
- Zara Larsson Collection: saturated pop color, playful Y2K silhouettes, and statement pieces.
- Whimsigoth and related drops: celestial, witchy, romantic, and alternative styling.

## Information architecture

- Home
- Shop
- Product detail routes
- Style bundles
- Personal styling
- Events
- Donate
- About
- Policies

## Checkout direction

The static foundation is prepared for secure per-product Stripe Payment Links. This keeps hosting compatible with the Cloudflare Pages free tier while allowing customers to buy directly from the website. Stripe processing fees still apply to successful sales.

Most pieces are expected to be one-of-one. The initial workflow requires Sage to disable the payment link and mark an item sold after purchase. If volume grows, a later phase should add server-side inventory validation and an authenticated product-management interface.

## Launch phases

1. Astro foundation and owner-editable content
2. Original publication-approved photos and real inventory details
3. Approved store and custom-service policies
4. Stripe account and per-product payment links
5. Cloudflare Pages deployment
6. Later inventory dashboard or CMS if product volume requires it
