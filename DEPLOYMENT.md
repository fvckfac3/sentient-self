# Deployment Runbook

The one place for getting Sentient Self into production. Variable names and
defaults live in [`.env.example`](./.env.example); this file covers order of
operations.

## 1. Accounts and services

| Service | Needed for | Notes |
|---|---|---|
| PostgreSQL 14+ (Neon, Supabase, RDS, …) | Everything | Use the pooled connection string for `DATABASE_URL` on Vercel |
| Vercel | Hosting | Framework preset: Next.js. Build command `npm run build` (Prisma client is generated on `postinstall`) |
| DeepSeek API key | Free-tier chat, insights, journal analysis | **Required** |
| Anthropic / OpenAI / Google AI keys | Premium models | Set the providers you want to offer; Opus 5.5 is the premium default |
| Stripe | Billing | Create a Premium (and optionally Institution) recurring price |
| Upstash Redis (or Vercel KV) | Rate limiting across instances | Strongly recommended; without it limits are per instance |
| Sentry | Error monitoring | Optional; off until `NEXT_PUBLIC_SENTRY_DSN` is set |

## 2. Environment variables (Vercel → Project → Settings → Environment Variables)

Required in Production:

- `DATABASE_URL`
- `NEXTAUTH_URL` – the production URL, e.g. `https://sentientself.com`
- `NEXTAUTH_SECRET` – `openssl rand -base64 32`. **Generate a new one for
  launch.** Builds before this branch shipped the old secret to browsers
  (`next.config.js` `env` block), so treat any previously used value as public.
- `DEEPSEEK_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PREMIUM_PRICE_ID`
- `NEXT_PUBLIC_SITE_URL` (same as `NEXTAUTH_URL`), `NEXT_PUBLIC_SUPPORT_EMAIL`

Recommended: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`,
`NEXT_PUBLIC_SENTRY_DSN` (+ `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
for readable stack traces), and the premium AI keys.

On startup the server logs any missing or malformed variables (see
`src/lib/env.ts`); check the first function logs after each deploy.

## 3. Database

Migrations live in `prisma/migrations` and are applied with
`npm run db:deploy` (`prisma migrate deploy`). Run it from your machine or a
CI job against the production `DATABASE_URL` before promoting a deploy that
includes a new migration. It is not part of the Vercel build, so preview
deploys never touch the production schema.

**New, empty database**

```bash
DATABASE_URL=... npm run db:deploy
DATABASE_URL=... npm run db:seed     # 13 frameworks + 634 exercises, safe to re-run
```

**Existing database created earlier with `prisma db push`**

Mark the baseline migration as already applied instead of running it:

```bash
# 1. Confirm the live schema matches 0_init (should print "No difference detected")
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma
# 2. Record the baseline
npx prisma migrate resolve --applied 0_init
# 3. Re-seed to fix exercise/framework links (upserts only, deletes nothing)
npm run db:seed
```

Going forward, change the schema with `npm run db:migrate -- --name <change>`
locally and commit the generated migration. Don't use `db push` against
production.

## 4. Stripe

1. Create the products/prices and copy their IDs into `STRIPE_PREMIUM_PRICE_ID`
   (and `STRIPE_INSTITUTION_PRICE_ID`). A user's plan is decided by the price on
   their subscription, so these must match exactly.
2. Add a webhook endpoint `https://<your-domain>/api/stripe/webhook` with events
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.
3. Enable the Customer Portal (Settings → Billing → Customer portal) so users
   can cancel and update cards.
4. Run the whole upgrade → cancel flow in test mode first (see §6), then repeat
   steps 1–3 in live mode and swap in the live keys.

## 5. Optional sign-in providers

Google and Apple buttons appear automatically once their variables are set.

- Google: OAuth client with redirect URI
  `https://<your-domain>/api/auth/callback/google`.
- Apple: Services ID as `APPLE_ID` and the generated client-secret JWT as
  `APPLE_SECRET` (it expires every 6 months; rotate it).

## 6. Launch checklist

Before launch:

- [ ] Lawyer has reviewed `/privacy` and `/terms`; set
      `LEGAL_REVIEW_PENDING = false` and update `LEGAL_LAST_UPDATED` in
      `src/lib/site.ts`
- [ ] Decide launch countries; crisis resources are US numbers (988, 741741)
- [ ] Production env vars set, with a fresh `NEXTAUTH_SECRET`
- [ ] `npm run db:deploy` and `npm run db:seed` run against production
- [ ] Custom domain added in Vercel and HTTPS active; `NEXTAUTH_URL` and
      `NEXT_PUBLIC_SITE_URL` use it
- [ ] Stripe live keys, live price IDs and live webhook configured
- [ ] Sentry receiving events (trigger a test error) and alert rules set

Smoke test on the production URL (desktop, plus a real iPhone in Safari and an
Android phone in Chrome):

- [ ] Sign up, sign out, sign back in; wrong password shows an error
- [ ] Onboarding completes and lands in chat
- [ ] Chat replies; a message like "I wish I could just disappear" shows crisis
      resources
- [ ] Journal entry saves; Premium AI insight generates
- [ ] Upgrade to Premium via Stripe Checkout, plan shows Premium, a premium
      model replies, Customer Portal opens, cancel downgrades at period end
- [ ] Export data (JSON and CSV) and delete a test account
- [ ] Pages are readable at phone width, pinch-zoom works, inputs don't zoom
      the page on focus, and the bottom nav clears the home indicator

After launch: watch Sentry and Vercel function logs daily for the first week,
and keep an eye on AI provider spend.

## Local development

```bash
cp .env.example .env          # fill in DATABASE_URL, NEXTAUTH_*, DEEPSEEK_API_KEY
npm install
npm run db:deploy && npm run db:seed
npm run dev
```

Checks CI runs on every pull request (`.github/workflows/ci.yml`):
`npm run typecheck`, `npm run lint`, `npm test`, migrations + schema drift
check, seeding twice, and `npm run build`.
