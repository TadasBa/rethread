/* ============================================================================
   Bootstrap — assemble persistent chrome, register routes, start systems.
   ========================================================================== */

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/estimator.css";

import Lenis from "lenis";
import { Router } from "./router";
import { buildNav, setActiveNav } from "./components/nav";
import { buildFooter } from "./components/footer";
import { h } from "./lib/dom";
import { initSpine, scanReveals } from "./lib/scroll";
import { markDarkRegions } from "./lib/regions";

import { renderHome } from "./pages/home";
import { renderHow } from "./pages/how";
import { renderEstimator } from "./pages/estimator";
import { renderOrder } from "./pages/order";
import { renderJournal, renderJournalPost } from "./pages/journal";
import { renderAbout } from "./pages/about";
import { renderContact } from "./pages/contact";
import { renderFaq } from "./pages/faq";
import { renderLegal } from "./pages/legal";
import { renderNotFound } from "./pages/notfound";
import { postBySlug } from "./content/journal";
import { pageMeta } from "./seo";

const app = document.getElementById("app") as HTMLElement;
document.documentElement.dataset.app = "rethread";

const view = h("main.view#view", { role: "main", tabindex: "-1" });
app.append(buildNav(), h("div#main", {}, view), buildFooter());

const router = new Router();
router
  .add({ pattern: "/", render: renderHome, meta: () => pageMeta("/") })
  .add({ pattern: "/kaip-tai-veikia", render: renderHow, meta: () => pageMeta("/kaip-tai-veikia") })
  .add({ pattern: "/taisymas", render: renderEstimator, meta: () => pageMeta("/taisymas") })
  .add({ pattern: "/uzsakymas", render: renderOrder, meta: () => pageMeta("/uzsakymas") })
  .add({ pattern: "/zurnalas", render: renderJournal, meta: () => pageMeta("/zurnalas") })
  .add({ pattern: "/zurnalas/:slug", render: renderJournalPost, meta: (ctx) => {
    const post = postBySlug(ctx.params.slug);
    return post
      ? { title: post.title, description: post.excerpt || "Rethread žurnalas apie drabužių taisymą ir priežiūrą.", type: "article" }
      : { title: "Žurnalas", description: "Rethread žurnalas.", robots: "noindex, nofollow" };
  } })
  .add({ pattern: "/apie", render: renderAbout, meta: () => pageMeta("/apie") })
  .add({ pattern: "/kontaktai", render: renderContact, meta: () => pageMeta("/kontaktai") })
  .add({ pattern: "/duk", render: renderFaq, meta: () => pageMeta("/duk") })
  .add({ pattern: "/privatumo-politika", render: (c) => renderLegal("privacy", c), meta: () => pageMeta("/privatumo-politika") })
  .add({ pattern: "/taisykles", render: (c) => renderLegal("terms", c), meta: () => pageMeta("/taisykles") })
  .add({ pattern: "/pristatymas-ir-grazinimas", render: (c) => renderLegal("shipping", c), meta: () => pageMeta("/pristatymas-ir-grazinimas") })
  .add({ pattern: "/garantija", render: (c) => renderLegal("guarantee", c), meta: () => pageMeta("/garantija") })
  .setNotFound({ pattern: "*", render: renderNotFound, meta: () => ({ title: "Puslapis nerastas", description: "Šio puslapio nėra.", robots: "noindex, nofollow" }) })
  .onRouteChange((path) => {
    setActiveNav(path);
  });

// After each render, scan for reveals and mark indigo regions for the spine.
// Registered BEFORE start() so the very first render is scanned too.
document.addEventListener("route:rendered", () => {
  scanReveals(view);
  markDarkRegions(view);
});

router.start(view);

// Systems -------------------------------------------------------------------
initSpine();

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduced) {
  const lenis = new Lenis({ duration: 1.05, wheelMultiplier: 1, lerp: 0.12 });
  const raf = (time: number): void => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

// Condense nav after a little scroll.
const onScroll = (): void => {
  document.body.classList.toggle("is-scrolled", window.scrollY > 12);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
