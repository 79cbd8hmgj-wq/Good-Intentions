import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const fallbackSite = "https://good-intentions.pages.dev";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const site = (env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || fallbackSite)
    .trim()
    .replace(/\/$/, "");

  return {
    site,
    output: "static",
  };
});
