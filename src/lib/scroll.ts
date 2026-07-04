/* ============================================================================
   Scroll system
   - The thread spine: a running stitch pinned to the page edge that "sews"
     itself as you scroll (scroll progress). It is the site's signature.
   - Reveal: elements tagged [data-reveal] fade/rise in on first view.
   Both respect prefers-reduced-motion.
   ========================================================================== */

import { h } from "./dom";

const reduced = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initSpine(): void {
  const spine = h(
    "div.spine",
    { "aria-hidden": "true" },
    h("div.spine__track"),
    h("div.spine__fill"),
    h("div.spine__needle"),
  );
  document.body.appendChild(spine);
  const view = document.getElementById("view");
  let railTop = 172;

  const isHomePath = (path = location.pathname): boolean =>
    (path.replace(/\/+$/, "") || "/") === "/";

  const syncVisibility = (path = location.pathname): boolean => {
    const visible = isHomePath(path);
    spine.classList.toggle("is-hidden", !visible);
    return visible;
  };

  // Align the rail's start with the first eyebrow/heading of the current page.
  const measureTop = (): void => {
    if (!syncVisibility()) return;
    const el = view?.querySelector<HTMLElement>(".eyebrow, .hero__title, .pagehead__title, h1");
    if (el) {
      railTop = Math.max(92, Math.round(el.getBoundingClientRect().top));
      spine.style.setProperty("--spine-top", `${railTop}px`);
    }
  };

  let ticking = false;
  const update = (): void => {
    if (!syncVisibility()) {
      ticking = false;
      return;
    }
    // Progress runs from the top of the page to the start of the footer — the
    // spine completes at the last content section, not in the footer.
    const footer = document.querySelector(".footer");
    const footerRect = footer?.getBoundingClientRect();
    const footerTop = footerRect
      ? footerRect.top + window.scrollY
      : document.documentElement.scrollHeight;
    const max = Math.max(1, footerTop - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / max));
    spine.style.setProperty("--progress", progress.toFixed(4));
    // The rail stays visible at all times; instead of hiding it, we shorten its
    // bottom so it never draws over the footer once the footer is on screen.
    const defaultBottom = window.innerHeight * 0.16;
    const overlap = footerRect ? window.innerHeight - footerRect.top + 24 : 0;
    const minVisibleRail = 88;
    const maxBottom = Math.max(defaultBottom, window.innerHeight - railTop - minVisibleRail);
    const bottom = Math.min(maxBottom, Math.max(defaultBottom, overlap));
    spine.style.setProperty("--spine-bottom", `${Math.round(bottom)}px`);
    ticking = false;
  };
  const onScroll = (): void => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // Recompute after each route render (heading position + page height change).
  document.addEventListener("route:rendered", (event) =>
    requestAnimationFrame(() => {
      const path = event instanceof CustomEvent ? event.detail?.path : location.pathname;
      if (!syncVisibility(path)) return;
      measureTop();
      update();
    }),
  );
  syncVisibility();
  measureTop();
  update();
}

let revealObserver: IntersectionObserver | null = null;

function ensureObserver(): IntersectionObserver | null {
  if (reduced()) return null;
  if (revealObserver) return revealObserver;
  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver?.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
  );
  return revealObserver;
}

/** (Re)scan the outlet for reveal targets. Call after each route render. */
export function scanReveals(root: ParentNode = document): void {
  const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
  const obs = ensureObserver();
  targets.forEach((el, i) => {
    if (!obs) {
      el.classList.add("is-in");
      return;
    }
    // Stagger siblings that share a group for an orchestrated reveal.
    const delay = el.dataset.revealDelay ?? String((i % 6) * 60);
    el.style.setProperty("--reveal-delay", `${delay}ms`);
    obs.observe(el);
  });
}
