# Rethread

Custom website for **Rethread**, a Lithuanian mail-in clothing repair service.

- Production: <https://rethread.lt>
- Development: <https://dev.rethread.lt>

## Stack

- Vite + TypeScript SPA
- Hand-written DOM helpers and router
- CSS variables with scoped component styles
- Cloudflare Pages + Pages Functions
- Resend order email endpoint

## Commands

```bash
npm install
npm run dev
npm test
npm run check
npm run pages:dev
```

## Content

- Main copy: `src/i18n/strings.ts`
- Fixed service prices: `shared/pricing-data.json`
- Legal/shipping pages: `src/pages/legal.ts`
- Journal posts: `src/content/journal/*.md`
- Order Function: `functions/api/order.ts`

## Deployment

Cloudflare Pages builds `dist` with `npm run build`.

- `dev` branch deploys to <https://dev.rethread.lt>
- `main` branch deploys to <https://rethread.lt>
- Pull requests and feature branches run checks only

GitHub Actions requires these repository secrets:

```env
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
VITE_TURNSTILE_SITE_KEY
```

Cloudflare Pages environment variables:

```env
RESEND_API_KEY
ORDER_TO_EMAIL
ORDER_FROM_EMAIL
TURNSTILE_SECRET_KEY
```