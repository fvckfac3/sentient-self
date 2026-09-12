# Phase 0 Baseline — Sentient Self Audit

**Date:** 2026-09-12
**Status:** Complete. All gates now green after remediation of build blockers.
**Commit range:** baseline taken at `4f23e14` ("finished w/ phase 7 -- 95% complete") + fixes on `audit/quality-standard` branch.

## Verified gate results (after fixes below)

| Gate | Command | Baseline | After fixes |
|---|---|---|---|
| Build | `next build` | **FAIL** (3 blockers) | PASS (34/34 pages) |
| Lint | `next lint` | 28 errors, 2 warnings | 0 errors, 2 warnings |
| Unit tests | `jest` | 1 failed / 8 passed (of 9), e2e file miscollected | 9/9 passed |
| E2E | `playwright test` | not runnable (browsers + auth setup missing) | not runnable — deferred |
| Coverage | `jest --coverage` | ~7% overall lib; crisis-detector 89.8% stmts | unchanged — Phase 1 target |

Note: `DEPLOYMENT_CHECKLIST.md` claims "TypeScript builds without errors." That was false at baseline.

## Build blockers found and fixed

1. **Missing type augmentation + dead session field** (HIGH, functional bug): `src/app/settings/ai/page.tsx` reads `session.user.preferredModel`, which existed in the Prisma schema (`preferredModel`, default `"deepseek-chat"`) but was absent from `src/types/next-auth.d.ts` (build error) **and** never populated by the session callback in `src/lib/auth.ts` (silent feature bug — model preference would never surface from session). Fixed both: added the field to Session/User interfaces and `session.user.preferredModel = fullUser.preferredModel` in the callback.
2. **AI SDK v5 API drift** (MEDIUM): `src/lib/insight-service.ts` used `maxTokens` (v4 name); SDK is v5.0.116 where it's `maxOutputTokens`. Fixed. Also removed a duplicated import that would have failed `verbatimModuleSyntax`-adjacent checks.
3. **Stripe module-scope throw** (HIGH, deployment risk): `src/lib/stripe.ts` threw at import time when `STRIPE_SECRET_KEY` was unset, which crashed `next build` page-data collection for `/api/stripe/checkout` — meaning **any environment without the secret cannot even build**, and any future preview deploy fails opaquely. Fixed with lazy `getStripe()`; route handlers now call it. `stripe.ts` had 3 consumers (checkout, portal, webhook routes); all updated.
4. **Playwright/Jest test collision** (LOW): `tests/e2e.spec.ts` matched Jest's `testMatch` and failed under Jest with `Class extends value undefined`. Added `testPathIgnorePatterns: ['/tests/']` to `jest.config.js`; also installed missing test devDependencies (`jest`, `jest-environment-jsdom`, `@playwright/test`, `@testing-library/*`, `@types/jest`) which were referenced in configs but absent from `package.json` — meaning **no one had run the test suites from a clean install**.

## Safety-critical test failure found and fixed

**Crisis detector missed passive ideation** (CRITICAL for this product): `detectCrisis('I wish I could just disappear')` returned `severity: 'none'` because the MEDIUM pattern `wish I (wasn't here|didn't exist|could disappear)` breaks on the word "just". In a mental-health app, a missed passive-ideation signal is the highest-severity defect class in the codebase. Fixed the pattern to allow `(?:just\s+)?` and added a second passive-ideation pattern (`want to disappear`, `disappear forever/for good`). Test suite now passes. **Phase 1 must expand this significantly** — see gaps below.

## Known lint debt (recorded, not blocking)

- 2 × `react-hooks/exhaustive-deps` warnings: `src/app/progress/[id]/page.tsx:56` (missing `fetchInsight`), `src/components/journal/journal-list.tsx:89` (missing `fetchEntries`). Deferred to Phase 1 — the correct fix needs intent (useCallback vs. inline), not mechanical suppression.
- No `.eslintrc.json` existed at baseline; added `next/core-web-vitals` (standard Next.js config).

## Crisis detector coverage gaps (Phase 1 priority)

Current detector is regex-only, English-only, and misses common phrasings. Known untested/likely-missed cases to address in Phase 1:
- Imminence without keywords: "I took the pills", "I'm standing on the edge", "goodbye everyone"
- Indirect self-harm: "I deserve the pain", "I don't deserve to eat"
- Hopelessness phrasings not in HIGH_PATTERNS: "what's the point of anything", "I give up on everything"
- False-positive risk audit: current LOW pattern `\b(alone|isolated|no one understands)\b` will fire on benign text like "I felt alone this weekend" — severity may be miscalibrated (LOW is fine, but combined with other phrases could stack incorrectly).
- No escalation guard: repeated low-severity messages across a conversation never compound. Consider session-level severity tracking.
- 988 (US) is the referenced hotline — verify presentation and any other locale handling when institutional tier lands.

## Environment/dependency notes

- `next@14.1.0` has a known security vulnerability (npm deprecation warning) → Phase 1 remediation item: upgrade to latest 14.x patched release, or evaluate 15.x. This is security-relevant for a health-adjacent product handling sensitive journals.
- E2E suite not runnable: `playwright.config.ts` exists, tests exist (`tests/e2e.spec.ts` — auth + onboarding flows), but browsers not installed and no auth test fixture. Deferred to Phase 3 (pre-ship).
- `.env.example` is incomplete relative to `src/lib/env.ts` expectations — audit in Phase 1.
- Prisma: schema present, `prisma generate` runs clean. No migration state checked (no local DB provisioned in this environment).

## What was NOT verified

- Runtime behavior (no dev server, no DB, no real API keys) — all fixes are type/lint/test-verified, not smoke-tested against live providers.
- E2E flows entirely unverified.
- Prisma migrations and seed integrity.
- Whether `fullUser.preferredModel` propagation survives NextAuth's JWT strategy serialization (type-checked only).

## Next: Phase 1 quality standard

Gate order for every Phase 1 remediation batch: `next lint` (0 errors) → `next build` → `jest` → targeted coverage bump for the file touched. Quality bar defined in `docs/codebase_audit_prompt.md` (tiers: CRITICAL/HIGH/MEDIUM/LOW). Start batch 1 with: crisis-detector hardening, next upgrade, env.ts audit, then the `ai-controller.ts` (769-line, 0% coverage) split.

## Phase 1 progress — batch 1 complete (2026-09-12)

| Item | Result |
|---|---|
| Crisis-detector hardening | Curly-apostrophe normalization (mobile keyboards), `end it all`, `take my life`, `wanna die`, `wish I (was/were) dead`, `never wake up`, `vanish/fade away` patterns; 12 new tests incl. imminence + false-positive guards. 21/21 pass. |
| Next.js upgrade | 14.1.0 → 14.2.35 (patched line incl. middleware-bypass CVE-2025-29927). Build clean. |
| env.ts audit | Verified: validation correctly skipped during build, required vars enforced at runtime. No changes needed. |
| ai-controller split | `src/lib/ai/exercise-gate.ts` extracted (gate heuristics: challenge detection, regulation check, challenge typing, keyword extraction). 33 unit tests, gate module at 100% stmts/branches. Controller delegates. |

Next batch: journal-service + prisma mocks, session-mgmt auth tests, insight-service tests, then billing/subscription code review.
