/* ============================================================================
   Journal loader — reads the .md files at build time (Vite glob), parses simple
   frontmatter and renders the body with `marked`. Posts sort newest-first.
   ========================================================================== */

import { marked } from "marked";

export interface Post {
  slug: string;
  title: string;
  date: string; // ISO
  excerpt: string;
  minutes: number;
  html: string;
}

marked.setOptions({ gfm: true, breaks: false });

const raw = import.meta.glob("./*.md", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;

function parse(path: string, text: string): Post {
  const slug = path.replace(/^\.\//, "").replace(/\.md$/, "");
  const fm = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta: Record<string, string> = {};
  let bodyMd = text;
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx > -1) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
    bodyMd = fm[2];
  }
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "",
    excerpt: meta.excerpt ?? "",
    minutes: Number(meta.minutes ?? "3"),
    html: marked.parse(bodyMd) as string,
  };
}

export const POSTS: Post[] = Object.entries(raw)
  .map(([path, text]) => parse(path, text))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const postBySlug = (slug: string): Post | undefined =>
  POSTS.find((p) => p.slug === slug);

export function formatDate(iso: string): string {
  if (!iso) return "";
  const months = [
    "sausio", "vasario", "kovo", "balandžio", "gegužės", "birželio",
    "liepos", "rugpjūčio", "rugsėjo", "spalio", "lapkričio", "gruodžio",
  ];
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()} m. ${months[d.getMonth()]} ${d.getDate()} d.`;
}
