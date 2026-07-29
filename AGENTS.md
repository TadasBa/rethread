# AGENTS.md

## Project

Rethread is a Lithuanian clothing-repair service.

- Vite + strict TypeScript SPA
- Hand-written DOM helpers and router
- Cloudflare Pages + Pages Functions
- Resend for order emails
- Playwright for end-to-end tests

This is not a React project.

## Key files

- `src/` — frontend application
- `src/i18n/strings.ts` — user-facing text
- `src/pages/legal.ts` — legal and shipping content
- `shared/pricing-data.json` — canonical repair prices
- `shared/pricing.ts` — shared pricing logic
- `functions/api/order.ts` — order endpoint
- `functions/lib/order-core.ts` — validation and trusted order calculation
- `scripts/*.test.mjs` — unit tests
- `tests/e2e/` — Playwright tests

## Commands

```bash
npm ci
npm run dev
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
npm run check
npm run pages:dev
```

Run `npm run check` before completing code changes.

## Rules

- Never trust prices or totals sent by the browser.
- Calculate prices from `shared/pricing-data.json`.
- Validate all external input at runtime.
- Escape user content before adding it to HTML emails.
- Do not bypass Turnstile in production.
- Do not log customer payloads, photos, tokens, or secrets.
- Do not hardcode secrets or real customer data.
- Keep frontend and server pricing based on the same shared source.
- Preserve strict TypeScript settings.
- Keep Cloudflare Functions compatible with the Cloudflare runtime.
- Do not change legal text, pricing, public payloads, or deployment behaviour without explicit requirements.
- Do not add React, Tailwind, a database, or new production dependencies without approval.
- Avoid unrelated refactors and formatting changes.
- Prefer existing patterns and small focused diffs.
- Do not weaken tests just to make them pass.
- Do not deploy, push to `main`, or change secrets unless explicitly requested.

## Workflow

For non-trivial tasks:

1. Inspect the relevant flow before editing.
2. State assumptions and a short plan.
3. Implement the smallest complete change.
4. Add or update tests for behaviour and failure cases.
5. Review the final diff.
6. Run focused checks, then `npm run check`.

Ask before proceeding when requirements involving pricing, payments, legal text, customer data, security, or deployment are unclear.

## Git

Use Conventional Commits when a commit is requested:

- `feat(order): add status tracking`
- `fix(pricing): reject invalid repair combinations`
- `test(order): cover oversized uploads`
- `docs(agent): update repository instructions`

Do not commit, amend, rebase, force-push, or open a pull request unless asked.

## Final response

Report:

- what changed
- checks run
- remaining risks or assumptions

Never claim a check passed unless it was run.