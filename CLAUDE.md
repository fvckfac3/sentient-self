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
- Test (Unit): `npm run test` (Currently 83/83 passing)
- Test (Coverage): `npm run test:coverage`
- E2E (Playwright): `npm run test:e2e` (Requires DB/Auth fixtures, currently deferred)
- Database: `npm run db:push`, `npm run db:seed`

## Current Status (2026-09-13)
Branch: `audit/quality-standard`
Completed: Phase 0 baseline + Phase 1 batch 1 (crisis detector hardening, next 14.2.35 upgrade, ai-controller gate heuristic split) + Phase 1 batch 2 (prisma mocks, journal API tests, auth.ts session tests, insight-service tests, billing/subscription review — found and fixed 2 HIGH bugs: client-controlled plan/price decoupling in Stripe checkout, and missing `plan` in subscription metadata causing institution subscribers to be silently downgraded to PREMIUM on renewal). See `docs/audits/2026-09-12-phase-0-baseline.md` for full detail.
Next up: Phase 1 batch 3 (crisis-detector coverage gaps: imminence-without-keywords, indirect self-harm, hopelessness phrasings, false-positive audit, escalation guard; then `.env.example` audit against `src/lib/env.ts`).
