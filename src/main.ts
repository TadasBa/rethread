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

const app = document.getElementById("app") as HTMLElement;

const view = h("main.view#view", { role: "main", tabindex: "-1" });
app.append(buildNav(), h("div#main", {}, view), buildFooter());

const router = new Router();
router
  .add({ pattern: "/", render: renderHome, meta: () => ({ title: "drabužių taisymas paštu", description: "Pasirinkite taisymus, sužinokite kainą iškart, atsiųskite paštomatu ir atgaukite drabužį kaip naują. Visoje Lietuvoje, per 3–7 darbo dienas." }) })
  .add({ pattern: "/kaip-veikia", render: renderHow, meta: () => ({ title: "Kaip veikia", description: "Nuo taisymo sąrašo iki grąžinto drabužio — visas kelias per penkis žingsnius." }) })
  .add({ pattern: "/taisymas", render: renderEstimator, meta: () => ({ title: "Taisymo skaičiuoklė", description: "Pasirinkite drabužį ir taisymus — kainą ir terminą matysite iškart." }) })
  .add({ pattern: "/uzsakymas", render: renderOrder, meta: () => ({ title: "Užsakymo užklausa", description: "Palikite kontaktus — atsiųsime patvirtinimą ir siuntimo instrukcijas per vieną darbo dieną." }) })
  .add({ pattern: "/zurnalas", render: renderJournal, meta: () => ({ title: "Žurnalas", description: "Apie taisymą, priežiūrą ir ilgesnį drabužių gyvenimą." }) })
  .add({ pattern: "/zurnalas/:slug", render: renderJournalPost, meta: () => ({ title: "Žurnalas", description: "Rethread žurnalas." }) })
  .add({ pattern: "/apie", render: renderAbout, meta: () => ({ title: "Apie mus", description: "Komanda, tikinti, kad drabužio istorija neturi baigtis dėl vieno sutrūkusio siūlo." }) })
  .add({ pattern: "/kontaktai", render: renderContact, meta: () => ({ title: "Kontaktai", description: "Klausimai apie taisymą? Rašykite labas@rethread.lt — atsakome per dieną." }) })
  .add({ pattern: "/duk", render: renderFaq, meta: () => ({ title: "Dažni klausimai", description: "Kainos, siuntimas, terminai ir garantija — atsakymai vienoje vietoje." }) })
  .add({ pattern: "/privatumas", render: (c) => renderLegal("privacy", c), meta: () => ({ title: "Privatumo politika", description: "Kaip tvarkome jūsų duomenis." }) })
  .add({ pattern: "/salygos", render: (c) => renderLegal("terms", c), meta: () => ({ title: "Paslaugų sąlygos", description: "Rethread paslaugų teikimo sąlygos." }) })
  .add({ pattern: "/siuntimas", render: (c) => renderLegal("shipping", c), meta: () => ({ title: "Siuntimas ir grąžinimas", description: "Kaip vyksta siuntimas ir grąžinimas." }) })
  .setNotFound({ pattern: "*", render: renderNotFound, meta: () => ({ title: "Puslapis nerastas", description: "Šio puslapio nėra." }) })
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
