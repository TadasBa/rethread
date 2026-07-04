/* Žurnalas — list + individual post. */
import { h } from "../lib/dom";
import { S } from "../i18n/strings";
import type { RouteContext } from "../router";
import { pageHead } from "./_helpers";
import { renderNotFound } from "./notfound";
import { POSTS, postBySlug, formatDate } from "../content/journal/index";

export function renderJournal(): HTMLElement {
  const list = h(
    "div.journal__list",
    {},
    ...POSTS.map((p, i) =>
      h(
        "a.jcard",
        { href: `/zurnalas/${p.slug}`, "data-reveal": true, "data-reveal-delay": String(i * 70) },
        h("div.jcard__meta", {},
          h("span.jcard__date.spec", {}, formatDate(p.date)),
          h("span.jcard__mins.spec", {}, `${p.minutes} ${S.journal.minutes}`),
        ),
        h("h2.jcard__title", {}, p.title),
        h("p.jcard__excerpt", {}, p.excerpt),
        h("span.jcard__more.link-stitch", {}, S.journal.readMore),
      ),
    ),
  );

  return h(
    "div.page.page-journal",
    {},
    h("section.panel.panel--raw", {},
      h("div.shell", {},
        pageHead({ title: S.journal.title, lead: S.journal.lead }),
        list,
      ),
    ),
  );
}

export function renderJournalPost(ctx: RouteContext): HTMLElement {
  const post = postBySlug(ctx.params.slug);
  if (!post) return renderNotFound();

  // Keep the document title in sync (router meta is generic for this pattern).
  document.title = `${post.title} · Rethread`;

  return h(
    "div.page.page-post",
    {},
    h("section.panel.panel--raw", {},
      h("article.shell-narrow.post", {},
        h("a.post__back.link-stitch", { href: "/zurnalas" }, "← ", S.journal.backToList),
        h("div.post__meta", {},
          h("span.spec", {}, formatDate(post.date)),
          h("span.spec", {}, `${post.minutes} ${S.journal.minutes}`),
        ),
        h("h1.post__title.d2", { "data-autofocus": true }, post.title),
        h("div.post__body.prose", { html: post.html }),
        h("div.post__foot", {},
          h("a.btn.btn--accent", { href: "/taisymas" }, S.hero.ctaPrimary),
        ),
      ),
    ),
  );
}
