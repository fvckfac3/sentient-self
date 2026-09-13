# Sentient Self

## Project Overview
Next.js 14.2 (App Router) + TypeScript + Prisma/Postgres codebase for a therapeutic journaling and AI exercise facilitation product. 

## Quality Standard & Rules
- **Safety/Privacy PRD overrides all other requirements.** 
- **CRITICAL / Launch-blocking:** Crisis detection (must never miss passive ideation), no plaintext message logging, no AI claiming therapeutic authority.
- Code must build without errors (`npm run build`) and lint clean (`npm run lint`).
- Two failed fix attempts = `/clear` and re-approach.

## Testing & Commands
- Dev Server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint` (Currently 0 errors, 2 warnings)
- Test (Unit): `npm run test` (Currently 98/98 passing)
- Test (Coverage): `npm run test:coverage`
- E2E (Playwright): `npm run test:e2e` (Requires DB/Auth fixtures, currently deferred)
- Database: `npm run db:push`, `npm run db:seed`

## Current Status (2026-09-13)
Branch: `audit/quality-standard`
Completed: Phase 0 baseline + Phase 1 batch 1 + Phase 1 batch 2 (see prior notes) + Phase 1 batch 3:
- **CRITICAL fix:** `ai-controller.ts` was logging `crisisCheck.triggers` (raw matched substrings of the user's message) via `console.log` on every crisis/safety-check detection — a plaintext-message-logging violation of the launch-blocking Safety/Privacy rule. Replaced with a trigger *count* in both log sites.
- Crisis-detector coverage: added 15 tests (21 → 36) for imminence-without-obvious-keywords, hopelessness variants, an intentional false-positive audit (negation/metaphor — documented as accepted trade-offs, not fixed), and an escalation-guard regression suite for severity precedence. Also fixed two real detection gaps surfaced while writing these tests: self-harm patterns required the literal word "myself" (missed "cutting my arms" style phrasing) and the imminent-danger "have a `<weapon>` ready" pattern didn't allow the article "a/an". Both widened with matching regression tests.
- `.env.example` / `env.ts` reconciliation: `env.ts` was validating `GOOGLE_AI_API_KEY`, a name no code reads — `@ai-sdk/google` (see `src/lib/models.ts`) needs `GOOGLE_GENERATIVE_AI_API_KEY`, which `.env.example` already had right. Fixed `env.ts` to match reality (Gemini models were silently unauthenticated before this). Also added `STRIPE_PREMIUM_PRICE_ID`/`STRIPE_INSTITUTION_PRICE_ID` to the schema (read by `stripe.ts` but previously unvalidated), and added the missing `DEEPSEEK_API_KEY`/`GROK_API_KEY`/Stripe price vars to `.env.example` while dropping the unused `MISTRAL_API_KEY` entry (no Mistral provider exists in the codebase).

Next up: no batch defined yet — decide next priority (remaining PRD areas: institutional admin surface is billing-only/not feature-complete per PRD 02; `.env.example` GROK_API_KEY is validated but has no wired provider, aspirational only).
