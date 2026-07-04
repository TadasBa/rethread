# Rethread

Custom website for **Rethread** — a Lithuanian mail-in clothing repair service.
Pick your repairs, see a transparent price instantly, send the garment by
parcel locker, get it back like new.

Built as a hand-rolled **Vite + TypeScript** SPA (no UI framework), designed
around a *boro / sashiko* visual identity: panels of raw cloth and indigo sewn
together by a running stitch, with an interactive **Repair Desk** estimator as
the centerpiece. Deploys to **Cloudflare Pages** with a Pages Function for the
order form.

## Stack

- **Vite + TypeScript**, zero UI framework — a small hyperscript (`src/lib/dom.ts`)
- Hand-rolled History-API **router** (`src/router.ts`) with View Transitions
- Self-hosted fonts (Bricolage Grotesque · Hanken Grotesk · Spline Sans Mono)
- Smooth scroll via **Lenis**; journal markdown via **marked**
- Native scroll-driven animation, `IntersectionObserver`, reduced-motion aware
- **Cloudflare Pages Functions** (`functions/api/order.ts`) → email via Resend

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build        # typecheck + build to dist/ + sitemap
npm run pages:dev    # run the built site + Functions locally (Cloudflare runtime)
npm run typecheck
npm run fonts        # re-fetch/self-host webfonts (see scripts/)
```

To test the order **Function** locally:

```bash
npm run build && npm run pages:dev      # serves on :8788
curl -X POST http://127.0.0.1:8788/api/order -H 'content-type: application/json' \
  -d '{"name":"Test","email":"t@example.lt","consent":true}'
```

Without `RESEND_API_KEY` set, the function logs the request and returns `ok`
(dev stub), so the full flow is testable without secrets.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub/GitLab and create a **Pages** project from it
   (or `npx wrangler pages deploy dist`).
2. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - Functions in `functions/` deploy automatically.
3. Set **environment variables** (Settings → Environment variables):
   | Variable | Purpose |
   |---|---|
   | `RESEND_API_KEY` | API key from [resend.com](https://resend.com) |
   | `ORDER_TO_EMAIL` | inbox that receives orders, e.g. `labas@rethread.lt` |
   | `ORDER_FROM_EMAIL` | from-address on a domain verified in Resend |
4. SPA routing (`public/_redirects`) and the sitemap are handled by the build.

## Editing content

- **Prices, repairs, turnaround** → `src/content/pricing.ts` (the only file the
  owner needs to touch for the estimator). All prices are conservative "from"
  figures shown as *preliminary* — the final price is confirmed on inspection.
- **All copy** → `src/i18n/strings.ts`, kept under `strings.lt`. Adding English
  later means adding `strings.en` + a language switch — the structure is ready.
- **Journal posts** → drop a Markdown file with frontmatter into
  `src/content/journal/`. It appears automatically, newest first.
- **Legal pages** (`/privatumas`, `/salygos`, `/siuntimas`) in `src/pages/legal.ts`
  are placeholders — replace with real policy text before launch.

## Roadmap (intentionally out of v1)

- Real payments (currently "we confirm & invoice" by email)
- English localization (scaffolded, not switched on)
- Photo upload on the order form
- Persisting orders to KV/D1 + an admin view

## Project map

```
functions/api/order.ts     order endpoint (email via Resend)
src/
  main.ts                  bootstrap: chrome, router, systems
  router.ts                SPA router
  i18n/strings.ts          all copy (LT), keyed for future EN
  content/pricing.ts       estimator source of truth
  content/journal/*.md     blog posts
  components/              nav, footer, wordmark, estimator/*
  pages/                   one module per route
  lib/                     dom, store, scroll (thread spine), regions
  styles/                  tokens, base, layout, components, estimator
```
