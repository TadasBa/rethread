// Emits dist/sitemap.xml after the build. Static routes + one entry per journal
// markdown file. Run as part of `npm run build`.
import { readdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ORIGIN = "https://rethread.lt";

const staticRoutes = [
  "/", "/kaip-veikia", "/taisymas", "/uzsakymas", "/zurnalas",
  "/duk", "/apie", "/kontaktai", "/privatumas", "/salygos", "/siuntimas",
];

const posts = (await readdir(`${ROOT}/src/content/journal`))
  .filter((f) => f.endsWith(".md"))
  .map((f) => `/zurnalas/${f.replace(/\.md$/, "")}`);

const urls = [...staticRoutes, ...posts]
  .map((path) => `  <url><loc>${ORIGIN}${path}</loc></url>`)
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

await writeFile(`${ROOT}/dist/sitemap.xml`, xml);
console.log(`sitemap.xml — ${staticRoutes.length + posts.length} urls`);
