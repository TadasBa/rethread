// Generates route-specific HTML metadata + sitemap after Vite writes dist/.
// This keeps the SPA visually unchanged while giving crawlers and social bots
// stable HTML titles, descriptions, canonicals, Open Graph tags, and JSON-LD.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(ROOT, "dist");
const config = JSON.parse(await readFile(join(ROOT, "seo.config.json"), "utf8"));
const baseHtml = await readFile(join(DIST, "index.html"), "utf8");
const buildDate = new Date().toISOString().slice(0, 10);

const { site } = config;
const orgId = `${site.origin}/#organization`;
const websiteId = `${site.origin}/#website`;
const serviceId = `${site.origin}/#clothing-repair-service`;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absolute(path) {
  if (path.startsWith("http")) return path;
  return `${site.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function normalizePath(path) {
  if (path === "/") return "/";
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

function pageUrl(path) {
  return `${site.origin}${normalizePath(path) === "/" ? "/" : normalizePath(path)}`;
}

function pageTitle(path, page) {
  return normalizePath(path) === "/" ? `${site.name} — ${page.title}` : `${page.title} · ${site.name}`;
}

function frontmatterValue(text, key) {
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return "";
  const line = fm[1].split("\n").find((entry) => entry.startsWith(`${key}:`));
  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}

function breadcrumb(path, page) {
  const clean = normalizePath(path);
  if (clean === "/") return null;

  const items = [
    { name: "Rethread", item: pageUrl("/") },
  ];

  if (clean.startsWith("/zurnalas/")) {
    items.push({ name: "Žurnalas", item: pageUrl("/zurnalas") });
  }

  items.push({ name: page.title, item: pageUrl(clean) });

  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl(clean)}#breadcrumb`,
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

function organizationSchema() {
  return {
    "@type": "ProfessionalService",
    "@id": orgId,
    name: site.name,
    url: site.origin,
    logo: absolute("/favicon.svg"),
    image: absolute(site.image),
    email: site.email,
    telephone: site.phone,
    areaServed: {
      "@type": "Country",
      name: "Lithuania",
    },
    priceRange: "10-30 EUR",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.email,
      telephone: site.phone,
      areaServed: "LT",
      availableLanguage: ["lt"],
    },
  };
}

function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    name: site.name,
    url: site.origin,
    inLanguage: site.hreflang,
    publisher: { "@id": orgId },
  };
}

function serviceSchema() {
  return {
    "@type": "Service",
    "@id": serviceId,
    name: "Drabužių taisymas paštu",
    serviceType: "Clothing repair",
    description: config.pages["/"].description,
    provider: { "@id": orgId },
    areaServed: {
      "@type": "Country",
      name: "Lithuania",
    },
    offers: {
      "@type": "AggregateOffer",
      url: pageUrl("/taisymas"),
      priceCurrency: "EUR",
      lowPrice: "10",
      highPrice: "30",
      availability: "https://schema.org/InStock",
    },
  };
}

function faqSchema() {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl("/duk")}#faq`,
    mainEntity: config.faq.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.a,
      },
    })),
  };
}

function webPageSchema(path, page) {
  const url = pageUrl(path);
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: pageTitle(path, page),
    description: page.description,
    inLanguage: site.hreflang,
    isPartOf: { "@id": websiteId },
    publisher: { "@id": orgId },
  };
}

function articleSchema(path, page) {
  const url = pageUrl(path);
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: page.title,
    description: page.description,
    datePublished: page.date,
    dateModified: page.date,
    image: [absolute(site.image)],
    author: { "@id": orgId },
    publisher: { "@id": orgId },
    mainEntityOfPage: { "@id": `${url}#webpage` },
    inLanguage: site.hreflang,
  };
}

function structuredData(path, page) {
  const graph = [organizationSchema(), websiteSchema(), webPageSchema(path, page)];

  if (page.schema?.includes("service")) graph.push(serviceSchema());
  if (page.schema?.includes("faq")) graph.push(faqSchema());
  if (page.kind === "article") graph.push(articleSchema(path, page));

  const crumbs = breadcrumb(path, page);
  if (crumbs) graph.push(crumbs);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function seoBlock(path, page) {
  const url = pageUrl(path);
  const title = pageTitle(path, page);
  const robots = page.robots || "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const type = page.kind === "article" ? "article" : "website";
  const jsonLd = JSON.stringify(structuredData(path, page)).replace(/</g, "\\u003c");

  return `<!-- SEO:start -->
    <meta name="theme-color" content="${escapeHtml(site.themeColor)}" />
    <meta name="color-scheme" content="light" />
    <meta name="robots" content="${escapeHtml(robots)}" />
    <meta name="application-name" content="${escapeHtml(site.name)}" />
    <meta name="apple-mobile-web-app-title" content="${escapeHtml(site.name)}" />
    <meta name="author" content="${escapeHtml(site.name)}" />
    <meta name="geo.region" content="LT" />
    <meta name="geo.placename" content="Lithuania" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <link rel="alternate" hreflang="${escapeHtml(site.hreflang)}" href="${escapeHtml(url)}" />
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(url)}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="${type}" />
    <meta property="og:locale" content="${escapeHtml(site.locale)}" />
    <meta property="og:site_name" content="${escapeHtml(site.name)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(absolute(site.image))}" />
    <meta property="og:image:alt" content="${escapeHtml(site.imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${escapeHtml(absolute(site.image))}" />
    <script type="application/ld+json">${jsonLd}</script>
    <!-- SEO:end -->`;
}

function withSeo(path, page) {
  return baseHtml.replace(
    /<!-- SEO:start -->[\s\S]*?<!-- SEO:end -->/,
    seoBlock(path, page),
  );
}

async function writeRoute(path, page) {
  const clean = normalizePath(path);
  const html = withSeo(clean, page);
  const outFile = clean === "/"
    ? join(DIST, "index.html")
    : join(DIST, clean.slice(1), "index.html");

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, html);
}

async function journalRoutes() {
  const dir = join(ROOT, "src/content/journal");
  const files = (await readdir(dir)).filter((file) => file.endsWith(".md"));

  return Promise.all(files.map(async (file) => {
    const text = await readFile(join(dir, file), "utf8");
    const slug = file.replace(/\.md$/, "");
    return {
      path: `/zurnalas/${slug}`,
      page: {
        title: frontmatterValue(text, "title") || slug,
        description: frontmatterValue(text, "excerpt") || "Rethread žurnalas apie drabužių taisymą ir priežiūrą.",
        date: frontmatterValue(text, "date") || buildDate,
        changefreq: "monthly",
        priority: "0.6",
        kind: "article",
        schema: ["breadcrumb"],
      },
    };
  }));
}

function sitemap(routes) {
  const urls = routes
    .filter(({ page }) => page.includeInSitemap !== false && !String(page.robots || "").includes("noindex"))
    .map(({ path, page }) => `  <url>
    <loc>${pageUrl(path)}</loc>
    <lastmod>${page.date || buildDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const staticRoutes = Object.entries(config.pages).map(([path, page]) => ({ path, page }));
const routes = [...staticRoutes, ...(await journalRoutes())];

for (const route of routes) {
  await writeRoute(route.path, route.page);
}

await writeFile(join(DIST, "sitemap.xml"), sitemap(routes));
console.log(`seo html — ${routes.length} route entries`);
console.log(`sitemap.xml — ${routes.filter(({ page }) => page.includeInSitemap !== false && !String(page.robots || "").includes("noindex")).length} urls`);
