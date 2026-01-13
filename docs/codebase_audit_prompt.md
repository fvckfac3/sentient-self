# Sentient Self Codebase Audit Prompt for OpenAI Codex

## Mission

You are tasked with performing a comprehensive audit of the Sentient Self codebase to ensure it fully complies with all PRD requirements and is production-ready. This is a critical audit for an application serving vulnerable populations.

## Context

Sentient Self is a Web2-only AI-powered personal growth and recovery application designed for recovering addicts and individuals seeking deep personal growth. The product centers around a structured conversational AI guide, deterministic therapeutic exercises, and persistent insight tracking.

**Target Users:** Recovering addicts and individuals in emotional/psychological vulnerability.
**Non-Negotiable:** Safety, privacy, and therapeutic integrity must never be compromised.

## Your Task

Conduct a systematic audit of the entire codebase against all PRD requirements located in the `/docs` directory. You must:

1. **Read and internalize ALL PRD documents** in the `/docs` directory in this order:
   - `Sentient Self – Master PRD Index.md` (read FIRST to understand precedence rules)
   - `Sentient Self – Core Systems PRD.md`
   - `Sentient Self – Experience & Access PRD.md`
   - `Sentient Self – Safety, Privacy & Control PRD.md` (HIGHEST PRECEDENCE)
   - `Sentient Self – Technical Architecture PRD.md`

2. **Verify PRD Compliance** across all dimensions

3. **Assess Functional Completeness** and production readiness

4. **Identify Critical Gaps** that would prevent safe deployment

## Audit Framework

### Phase 1: PRD Precedence & Conflict Resolution

- [ ] Verify you understand the precedence hierarchy:
  1. Safety, Privacy & Control PRD (overrides ALL)
  2. Core Systems PRD
  3. Experience & Access PRD
  4. Technical Architecture PRD
  5. Master PRD Index (index only, no override)

- [ ] Check for any conflicts between PRDs and flag them

### Phase 2: Safety, Privacy & Control Audit (CRITICAL - HIGHEST PRIORITY)

**Crisis & High-Risk Language Handling**
- [ ] Verify crisis detection is implemented server-side
- [ ] Confirm detection triggers for: suicidal intent, self-harm ideation, imminent danger
- [ ] Verify crisis banner displays correctly and non-intrusively
- [ ] Check that therapeutic exercises STOP when crisis is detected
- [ ] Verify conversation state freezes appropriately
- [ ] Confirm AI never claims to be sufficient support during crisis
- [ ] Verify AI never provides step-by-step crisis coping techniques
- [ ] Check that dismissal doesn't disable future detection

**AI Role Boundaries**
- [ ] Verify AI never presents itself as human
- [ ] Confirm AI never claims therapeutic/medical authority
- [ ] Check AI never promises recovery outcomes
- [ ] Verify AI never suggests stopping medication/treatment
- [ ] Review AI language for non-directive, supportive tone
- [ ] Confirm no moral framing in AI responses
- [ ] Verify no urgency manipulation tactics

**User Controls & Autonomy**
- [ ] Verify users can pause any exercise at any time
- [ ] Confirm users can decline any suggestion
- [ ] Check users can exit conversations freely
- [ ] Verify tone and pace preferences are modifiable
- [ ] Confirm account deletion is accessible and irreversible
- [ ] Verify data export functionality works

**Data Privacy & Retention**
- [ ] Confirm only functionally-required data is stored
- [ ] Verify no data is sold or shared with third parties
- [ ] Check message retention policy (indefinite unless deleted)
- [ ] Verify insights are stored until account deletion

**Logging & Observability Constraints**
- [ ] **CRITICAL**: Verify NO raw user message content in plaintext logs
- [ ] **CRITICAL**: Verify NO full AI prompts are logged
- [ ] **CRITICAL**: Verify NO crisis-flagged messages are logged
- [ ] Confirm only event metadata, error states, and anonymous metrics are logged

**Account Deletion & Data Export**
- [ ] Verify deletion flow: Settings → Confirmation → Queue → 30-day purge
- [ ] Confirm data export produces JSON with profile, insights, exercises
- [ ] Verify deletion is truly irreversible

### Phase 3: Core Systems Audit

**Sentient Guide Core**
- [ ] Verify conversation state machine with allowed states: IDLE, DISCOVERY, EXERCISE_SUGGESTED, EXERCISE_ACTIVE, EXERCISE_PAUSED, EXERCISE_COMPLETED
- [ ] Confirm only one exercise can be active at a time
- [ ] Verify state transitions are explicit and illegal transitions are blocked
- [ ] Check Flow A (Conversational Discovery): message persisted → AI responds → pattern detection
- [ ] Check Flow B (Exercise Suggested): AI selects exercise → card rendered → user accepts/declines
- [ ] Check Flow C (Exercise Execution): schema loaded → steps sequential → responses validated
- [ ] Verify Message Object schema compliance: id (uuid), role (user|assistant), content (string), timestamp (ISO-8601)

**User Profile & Personalization Engine**
- [ ] Verify Profile Object structure matches canonical schema
- [ ] Confirm profile loads BEFORE any AI call
- [ ] Verify profile updates apply immediately
- [ ] Check fields: userId, intent (recovery|growth|both), tone, pace, recoveryFlags, insightSummary

**Exercise Library & Schema System**
- [ ] Verify exercises are immutable, versioned schemas
- [ ] Confirm Exercise Schema compliance (id, version, title, description, framework, category, etc.)
- [ ] Check recommendedFor logic (intent, pace matching)
- [ ] Verify contraindications are respected
- [ ] Confirm step validation (required, minLength, etc.)
- [ ] Check synthesis template execution

**Progress Tracking & Insight Synthesis**
- [ ] Verify exactly one insight per completed exercise
- [ ] Confirm Insight Object schema: id, exerciseId, createdAt, synthesis, annotations
- [ ] Verify syntheses are immutable
- [ ] Check insight generation triggers on exercise completion

**Cross-System Rules**
- [ ] Verify NO exercise execution without schema validation
- [ ] Verify NO AI response without profile context
- [ ] Verify NO insight without completed exercise

### Phase 4: Experience & Access Audit

**Authentication System**
- [ ] Verify email + password authentication works
- [ ] Verify OAuth (Google) authentication works
- [ ] Confirm NO anonymous access is permitted
- [ ] Check auth states: UNAUTHENTICATED, AUTHENTICATED
- [ ] Verify auth state resolves before rendering protected screens
- [ ] Check Flow A (Signup): Landing → Get Started → Credentials → Account Creation → Onboarding
- [ ] Check Flow B (Login): Credentials → Validation → Redirect based on onboarding status
- [ ] Verify error handling: invalid credentials (inline), OAuth failure (retry), network error (blocking)

**Onboarding System**
- [ ] Verify onboarding states: NOT_STARTED, IN_PROGRESS, COMPLETED
- [ ] Confirm NO dashboard/chat access until COMPLETED
- [ ] Check Step 1: Welcome & Framing (explanation, non-clinical emphasis)
- [ ] Check Step 2: Intent Selection (recovery | growth | both)
- [ ] Check Step 3: Tone & Pace Preferences
- [ ] Check Step 4: Safety & Consent (disclaimer + required checkbox)
- [ ] Check Step 5: Completion (confirmation → dashboard)
- [ ] Verify steps must be completed in order
- [ ] Confirm resume behavior (returns to last incomplete step)

**Global Navigation Model**
- [ ] Verify navigation items: Chat, Exercises, Progress, Settings
- [ ] Confirm navigation persistent on desktop/tablet
- [ ] Check navigation disabled during active exercise (except Pause)
- [ ] Verify back navigation returns to last stable state

**Screen Hierarchy**
- [ ] Verify all screens exist: Landing, Signup/Login, Onboarding, Dashboard, Exercise Library, Exercise Detail, Progress Timeline, Insight Detail, Settings
- [ ] Confirm Dashboard loads user profile before rendering
- [ ] Check Dashboard displays Sentient Guide conversation

**Responsive Layout**
- [ ] Verify breakpoints: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- [ ] Check Mobile: single-column, bottom nav, full-screen flows
- [ ] Check Tablet/Desktop: sidebar nav, persistent chat panel

**State Persistence & Recovery**
- [ ] Verify auth session via HTTP-only cookie
- [ ] Check navigation state persisted per session
- [ ] Confirm refresh restores: last screen, active exercise

### Phase 5: Technical Architecture Audit

**Architectural Principles**
- [ ] **CRITICAL**: Verify NO Web3, blockchain, tokens, or wallets anywhere
- [ ] Confirm deterministic state transitions
- [ ] Verify separation of concerns
- [ ] Confirm server-authoritative persistence
- [ ] Verify client is NEVER source of truth
- [ ] Check AI calls are auditable but content-minimized

**Tech Stack Compliance**
- [ ] Verify React + Next.js + TypeScript frontend
- [ ] Confirm Next.js API Routes or Node.js (Express) backend
- [ ] Verify PostgreSQL database
- [ ] Confirm OpenAI API for AI provider
- [ ] Check JWT + HTTP-only cookies for auth

**Frontend Architecture**
- [ ] Verify Next.js App Router usage
- [ ] Confirm React 18+
- [ ] Check TypeScript throughout
- [ ] Verify TailwindCSS for styling
- [ ] Confirm component hierarchy matches specification

**State Management**
- [ ] Check Local State (component-level UI)
- [ ] Verify Global State (Zustand or Redux Toolkit)
- [ ] Confirm Session State (in-memory + cookie-backed)
- [ ] Verify Persistent State (server-side only)
- [ ] Confirm client state reflects server state
- [ ] Check optimistic updates only for UI
- [ ] Verify server reconciliation on mismatch

**Backend Architecture**
- [ ] Verify RESTful endpoints only
- [ ] Check all core endpoints exist: POST /auth/login, POST /auth/signup, GET /profile, PUT /profile, POST /messages, POST /exercise/start, POST /exercise/step, GET /progress, DELETE /account
- [ ] Confirm all input validation
- [ ] Verify invalid state transitions rejected
- [ ] Check schema versioning enforcement

**Database Design**
- [ ] Verify core tables exist: users, profiles, messages, exercises, exercise_sessions, insights
- [ ] Confirm all writes go through API
- [ ] Verify NO client-side persistence of sensitive data

**AI Integration**
- [ ] Verify prompts include: system role, user profile context, current state, allowed actions
- [ ] Confirm AI output validation before use
- [ ] Check timeout → retry once
- [ ] Verify failure → fallback message

**Error Handling**
- [ ] Check client: network failure (retry + message), validation error (inline feedback)
- [ ] Check server: 4xx for user errors, 5xx for system errors

**Security Requirements**
- [ ] **CRITICAL**: Verify HTTPS only
- [ ] **CRITICAL**: Confirm SQL injection prevention
- [ ] **CRITICAL**: Verify XSS protection
- [ ] **CRITICAL**: Confirm CSRF protection

**Environment & Tooling**
- [ ] Verify Node.js LTS
- [ ] Check ESLint configuration
- [ ] Check Prettier configuration
- [ ] Verify Jest/Playwright for testing
- [ ] Confirm deployment to Vercel or equivalent
- [ ] Verify environment variables for secrets (not hardcoded)

### Phase 6: Functional Completeness Assessment

**Core User Journeys**
- [ ] Test complete new user flow: signup → onboarding → first conversation → exercise suggestion → exercise completion → insight view
- [ ] Test returning user flow: login → resume conversation → access progress
- [ ] Test exercise flow: browse library → start exercise → pause → resume → complete
- [ ] Test settings flow: modify preferences → export data → request deletion

**Edge Cases & Error States**
- [ ] Test network failure during critical operations
- [ ] Test session expiration handling
- [ ] Test concurrent session handling
- [ ] Test browser refresh during various states
- [ ] Test malformed API responses
- [ ] Test AI API timeout/failure
- [ ] Test database connection failures

**Data Integrity**
- [ ] Verify no data loss on refresh
- [ ] Confirm proper transaction handling
- [ ] Check referential integrity in database
- [ ] Verify cascade deletes work properly
- [ ] Test concurrent user operations

### Phase 7: Production Readiness Assessment

**Performance**
- [ ] Check page load times (<3s for initial load)
- [ ] Verify API response times (<500ms for standard operations)
- [ ] Check database query optimization
- [ ] Verify proper caching strategies
- [ ] Test with realistic data volumes

**Monitoring & Observability**
- [ ] Verify error tracking is configured
- [ ] Check logging follows safety constraints
- [ ] Confirm metrics collection (anonymous only)
- [ ] Verify alert configuration for critical failures

**Testing Coverage**
- [ ] Check unit test coverage for core logic
- [ ] Verify integration tests for critical flows
- [ ] Confirm E2E tests for user journeys
- [ ] Check security tests (XSS, CSRF, SQL injection)

**Documentation**
- [ ] Verify README with setup instructions
- [ ] Check API documentation
- [ ] Confirm environment variable documentation
- [ ] Verify deployment documentation

## Output Format

Provide your audit results in the following structure:

```markdown
# Sentient Self Codebase Audit Report

## Executive Summary
[High-level pass/fail assessment and critical findings]

## Compliance Score
- Safety, Privacy & Control: X/Y checks passed
- Core Systems: X/Y checks passed
- Experience & Access: X/Y checks passed
- Technical Architecture: X/Y checks passed
- Functional Completeness: X/Y checks passed
- Production Readiness: X/Y checks passed

**Overall: X% compliant**

## Critical Issues (MUST FIX BEFORE DEPLOYMENT)
[Issues that violate safety requirements or could cause harm]

1. [Issue with severity, location, PRD reference]
2. ...

## High Priority Issues (SHOULD FIX BEFORE DEPLOYMENT)
[Issues that violate PRD requirements but are not safety-critical]

1. [Issue with location, PRD reference]
2. ...

## Medium Priority Issues (TECHNICAL DEBT)
[Deviations from best practices or incomplete implementations]

1. [Issue with location]
2. ...

## Positive Findings
[What's implemented well and correctly]

1. [Strength]
2. ...

## Detailed Findings by PRD Section
[Organized breakdown of all checks with pass/fail/partial status]

### Safety, Privacy & Control
- Crisis Detection: [PASS/FAIL/PARTIAL] - [Details]
- AI Boundaries: [PASS/FAIL/PARTIAL] - [Details]
...

### Core Systems
- State Machine: [PASS/FAIL/PARTIAL] - [Details]
- Profile Engine: [PASS/FAIL/PARTIAL] - [Details]
...

[Continue for all sections]

## Recommendations

### Immediate Actions (Pre-Launch)
1. [Action item]
2. ...

### Post-Launch Improvements
1. [Action item]
2. ...

## Deployment Recommendation
**[APPROVE / CONDITIONAL APPROVE / DO NOT DEPLOY]**

[Justification]
```

## Critical Reminders

1. **Safety First**: Any violation of the Safety, Privacy & Control PRD is an automatic CRITICAL issue
2. **No Assumptions**: If something is ambiguous or unclear, flag it
3. **Zero Tolerance**: For vulnerable populations, "mostly works" is not acceptable
4. **Be Thorough**: Check every requirement, every state transition, every error handler
5. **Think Like an Attacker**: Consider abuse cases and edge cases
6. **Think Like a Vulnerable User**: Consider users in distress, cognitive overload, relapse situations

## Begin Audit

Start by reading all PRD files in the `/docs` directory, then systematically work through each phase of the audit framework. Document everything you find.

Your audit could prevent harm. Take your time and be thorough.
