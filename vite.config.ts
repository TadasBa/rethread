import { defineConfig } from "vite";

// Rethread is a client-routed SPA (History API) so the stitched "thread spine"
// can persist across view transitions. Cloudflare Pages serves the SPA fallback
// via public/_redirects. Functions live in /functions and are deployed by Pages,
// so Vite is not aware of them.
export default defineConfig({
  appType: "spa",
  build: {
    target: "es2022",
    cssTarget: "chrome111",
    modulePreload: { polyfill: false },
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});
