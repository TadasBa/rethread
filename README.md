# Rethread

Custom website for **Rethread**, a Lithuanian mail-in clothing repair service.

## Stack

- Vite + TypeScript SPA
- Hand-written DOM helpers and router
- CSS variables with scoped component styles
- Cloudflare Pages + Pages Functions
- Resend-ready order email endpoint

## Commands

```bash
npm install
npm run dev
npm run check
npm run pages:dev
```

## Content

- Main copy: `src/i18n/strings.ts`
- Fixed service prices: `src/content/pricing.ts`
- Legal/shipping pages: `src/pages/legal.ts`
- Journal posts: `src/content/journal/*.md`
- Order Function: `functions/api/order.ts`

## Deployment

Cloudflare Pages:

```txt
Build command: npm run build
Output directory: dist
Project name: rethread
```

GitHub Actions:

- `CI` checks pull requests and non-main branches.
- `Deploy to Cloudflare Pages` checks and deploys `main`.

Required GitHub secrets:

```txt
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

Set email variables in Cloudflare Pages when email is enabled:

```txt
RESEND_API_KEY
ORDER_TO_EMAIL=business@rethread.lt
ORDER_FROM_EMAIL=Rethread <uzsakymai@rethread.lt>
```

Without `RESEND_API_KEY`, `/api/order` logs locally and returns `ok` for testing.
