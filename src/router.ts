/* ============================================================================
   Hand-rolled History-API router for a vanilla SPA.
   - Compiles ":param" patterns to regex.
   - Intercepts internal link clicks.
   - Updates <title> + meta per route, manages focus + scroll for a11y.
   - Uses the View Transitions API where available (respects reduced motion).
   ========================================================================== */

export interface RouteContext {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
}

export interface RouteMeta {
  title: string;
  description: string;
}

export interface Route {
  pattern: string;
  render: (ctx: RouteContext) => HTMLElement | Promise<HTMLElement>;
  meta: (ctx: RouteContext) => RouteMeta;
}

interface CompiledRoute extends Route {
  regex: RegExp;
  keys: string[];
}

const SITE = "Rethread";

function compile(pattern: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = [];
  const source = pattern
    .replace(/\/+$/, "")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    // ":" is not escaped above, so match the plain ":param" token here.
    .replace(/:([\w]+)/g, (_m, key: string) => {
      keys.push(key);
      return "([^/]+)";
    });
  return { regex: new RegExp(`^${source || "/"}/?$`), keys };
}

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export class Router {
  private routes: CompiledRoute[] = [];
  private notFound!: Route;
  private outlet!: HTMLElement;
  private onChange?: (path: string) => void;

  add(route: Route): this {
    this.routes.push({ ...route, ...compile(route.pattern) });
    return this;
  }

  setNotFound(route: Route): this {
    this.notFound = route;
    return this;
  }

  onRouteChange(fn: (path: string) => void): this {
    this.onChange = fn;
    return this;
  }

  start(outlet: HTMLElement): void {
    this.outlet = outlet;
    document.addEventListener("click", this.onClick);
    window.addEventListener("popstate", () => this.resolve(location.pathname + location.search));
    this.resolve(location.pathname + location.search);
  }

  navigate(to: string, opts: { replace?: boolean } = {}): void {
    const url = new URL(to, location.origin);
    if (url.origin !== location.origin) {
      window.location.href = to;
      return;
    }
    const full = url.pathname + url.search;
    if (full === location.pathname + location.search && !opts.replace) return;
    history[opts.replace ? "replaceState" : "pushState"]({}, "", full);
    this.resolve(full);
  }

  private onClick = (e: MouseEvent): void => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const anchor = (e.target as Element).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    if (anchor.getAttribute("rel")?.includes("external")) return;
    const url = new URL(href, location.origin);
    if (url.origin !== location.origin) return;
    e.preventDefault();
    if (url.pathname === location.pathname && url.hash) {
      this.scrollToHash(url.hash);
      history.pushState({}, "", url.pathname + url.search + url.hash);
      return;
    }
    this.navigate(url.pathname + url.search);
  };

  private match(path: string): { route: Route; ctx: RouteContext } {
    const [pathname, search = ""] = path.split("?");
    const clean = pathname.replace(/\/+$/, "") || "/";
    for (const route of this.routes) {
      const m = route.regex.exec(clean);
      if (m) {
        const params: Record<string, string> = {};
        route.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        return { route, ctx: { path: clean, params, query: new URLSearchParams(search) } };
      }
    }
    return { route: this.notFound, ctx: { path: clean, params: {}, query: new URLSearchParams(search) } };
  }

  private async resolve(path: string): Promise<void> {
    const { route, ctx } = this.match(path);
    const meta = route.meta(ctx);
    document.title = ctx.path === "/" ? `${SITE} — ${meta.title}` : `${meta.title} · ${SITE}`;
    setMeta("description", meta.description);
    setMeta("og:title", document.title, "property");
    setMeta("og:description", meta.description, "property");
    setMeta("og:url", location.origin + ctx.path, "property");
    setCanonical(location.origin + ctx.path);

    const view = await route.render(ctx);
    const swap = (): void => {
      this.outlet.replaceChildren(view);
      this.onChange?.(ctx.path);
    };

    const vtApi = document as unknown as {
      startViewTransition?: (cb: () => void) => { updateCallbackDone: Promise<void> };
    };
    if (vtApi.startViewTransition && !prefersReducedMotion()) {
      // Run afterRender only once the DOM swap callback has actually applied,
      // otherwise reveal-scanning would run against the previous view.
      const transition = vtApi.startViewTransition(swap);
      transition.updateCallbackDone.finally(() => this.afterRender(ctx));
    } else {
      swap();
      this.afterRender(ctx);
    }
  }

  private afterRender(ctx: RouteContext): void {
    const hash = location.hash;
    if (hash) {
      requestAnimationFrame(() => this.scrollToHash(hash));
    } else {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "auto" });
    }
    // Move focus to the main region heading for screen-reader users.
    const focusTarget = this.outlet.querySelector<HTMLElement>("[data-autofocus], h1");
    if (focusTarget) {
      focusTarget.setAttribute("tabindex", "-1");
      focusTarget.focus({ preventScroll: true });
    }
    document.dispatchEvent(new CustomEvent("route:rendered", { detail: ctx }));
  }

  private scrollToHash(hash: string): void {
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name"): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}
