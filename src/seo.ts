import seoConfig from "../seo.config.json";

export interface PageSeoMeta {
  title: string;
  description: string;
  robots?: string;
}

type SeoPage = keyof typeof seoConfig.pages;

export const SITE_NAME = seoConfig.site.name;
export const SITE_ORIGIN = seoConfig.site.origin;
export const SITE_LOCALE = seoConfig.site.locale;
export const DEFAULT_IMAGE = `${SITE_ORIGIN}${seoConfig.site.image}`;
export const DEFAULT_IMAGE_ALT = seoConfig.site.imageAlt;

export function pageMeta(path: SeoPage): PageSeoMeta {
  const page = seoConfig.pages[path];
  const robots = "robots" in page && typeof page.robots === "string" ? page.robots : undefined;
  return {
    title: page.title,
    description: page.description,
    robots,
  };
}

export function documentTitle(path: string, title: string): string {
  return path === "/" ? `${SITE_NAME} — ${title}` : `${title} · ${SITE_NAME}`;
}

export function canonicalUrl(path: string): string {
  const clean = path === "/" ? "/" : path.replace(/\/+$/, "");
  return `${SITE_ORIGIN}${clean}`;
}
