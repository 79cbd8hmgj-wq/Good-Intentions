import fs from "node:fs";
import path from "node:path";

const launch = process.argv.includes("--launch");
const root = process.cwd();
const contentPath = path.join(root, "content", "site.json");
const errors = [];

if (!fs.existsSync(contentPath)) {
  errors.push("content/site.json is missing.");
} else {
  const data = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  if (!data.business?.name) errors.push("business.name is required.");
  if (!data.business?.description) errors.push("business.description is required.");
  if (!Array.isArray(data.collections) || data.collections.length === 0) errors.push("At least one collection is required.");
  if (!Array.isArray(data.products) || data.products.length === 0) errors.push("At least one product preview is required.");

  const productSlugs = data.products?.map((product) => product.slug) ?? [];
  if (new Set(productSlugs).size !== productSlugs.length) errors.push("Product slugs must be unique.");

  if (launch) {
    if (!data.commerce?.checkoutEnabled) errors.push("Launch blocked: checkout is disabled.");
    if (data.business?.publicEmail === "hello@example.com") errors.push("Launch blocked: replace the placeholder public email.");
    if (data.policies?.status !== "approved") errors.push("Launch blocked: policies are not approved.");

    const drafts = data.products?.filter((product) => product.status !== "available") ?? [];
    if (drafts.length) errors.push(`Launch blocked: ${drafts.length} products are not marked available.`);

    const missingCheckout = data.products?.filter(
      (product) => product.status === "available" && !product.checkoutUrl,
    ) ?? [];
    if (missingCheckout.length) errors.push(`Launch blocked: ${missingCheckout.length} available products have no checkout URL.`);

    const unfinished = data.products?.filter((product) =>
      [product.size, product.measurements, product.brand, product.condition, product.material].some(
        (value) => typeof value !== "string" || /TBD|pending|required before launch/i.test(value),
      ),
    ) ?? [];
    if (unfinished.length) errors.push(`Launch blocked: ${unfinished.length} products still contain placeholder details.`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

console.log(launch ? "Launch content validation passed." : "Structural content validation passed.");
