// Emits dist/sitemap.xml after the build. Public routes + one entry per journal
// markdown file. Run as part of `npm run build`.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ORIGIN = "https://rethread.lt";
const buildDate = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/taisymas", priority: "0.9", changefreq: "weekly" },
  { path: "/kaip-veikia", priority: "0.8", changefreq: "monthly" },
  { path: "/zurnalas", priority: "0.7", changefreq: "weekly" },
  { path: "/duk", priority: "0.7", changefreq: "monthly" },
  { path: "/apie", priority: "0.6", changefreq: "monthly" },
  { path: "/kontaktai", priority: "0.6", changefreq: "monthly" },
  { path: "/privatumas", priority: "0.3", changefreq: "yearly" },
  { path: "/salygos", priority: "0.3", changefreq: "yearly" },
  { path: "/siuntimas", priority: "0.5", changefreq: "monthly" },
];

function frontmatterValue(text, key) {
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return "";
  const line = fm[1].split("\n").find((entry) => entry.startsWith(`${key}:`));
  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}

const postFiles = (await readdir(`${ROOT}/src/content/journal`)).filter((f) => f.endsWith(".md"));
const posts = await Promise.all(
  postFiles.map(async (file) => {
    const text = await readFile(`${ROOT}/src/content/journal/${file}`, "utf8");
    return {
      path: `/zurnalas/${file.replace(/\.md$/, "")}`,
      lastmod: frontmatterValue(text, "date") || buildDate,
      priority: "0.6",
      changefreq: "monthly",
    };
  }),
);

const urls = [...staticRoutes.map((route) => ({ ...route, lastmod: buildDate })), ...posts]
  .map(
    (route) => `  <url>
    <loc>${ORIGIN}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

await writeFile(`${ROOT}/dist/sitemap.xml`, xml);
console.log(`sitemap.xml — ${staticRoutes.length + posts.length} urls`);
