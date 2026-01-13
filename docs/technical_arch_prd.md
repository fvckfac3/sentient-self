# Sentient Self – Technical Architecture & Implementation PRD

**Status:** Authoritative · Build-Ready · Web2 Only  
**Governed by:** Sentient Self – Master PRD Index

## 1. Purpose of This Document

This document defines how Sentient Self is built at a technical level. It specifies the Web2-only architecture, frontend and backend stacks, state flow patterns, API contracts, storage strategy, error handling, and security constraints.

**This PRD must be followed exactly. Engineering creativity is permitted only where explicitly allowed.**

## 2. Architectural Principles (Binding)

- Web2-only implementation (no blockchain, tokens, wallets)
- Deterministic state transitions
- Explicit separation of concerns
- Server-authoritative persistence
- Client is never a source of truth
- AI calls are auditable but content-minimized

## 3. High-Level System Architecture

### 3.1 Components

- **Client:** React + Next.js (TypeScript)
- **API Layer:** Next.js API Routes or Node.js (Express)
- **Database:** PostgreSQL
- **AI Provider:** OpenAI API
- **Auth:** JWT + HTTP-only cookies

### 3.2 Data Flow Overview

1. User action in UI
2. Client dispatches action
3. API validates + persists
4. AI called if required
5. Response normalized
6. Client renders state

## 4. Frontend Architecture

### 4.1 Frameworks

- Next.js (App Router)
- React 18+
- TypeScript
- TailwindCSS

### 4.2 Component Hierarchy

**Page-Level Components**
- /login
- /onboarding
- /dashboard
- /chat
- /exercises
- /progress
- /settings

**Feature-Level Components**
- ChatWindow
- ExerciseRunner
- InsightTimeline
- ProfileEditor

**Shared UI Components**
- Button
- Modal
- Input
- Toast
- Banner

### 4.3 Layout Components

- AuthLayout
- AppShell
- MobileLayout

## 5. State Management

### 5.1 State Layers

- **Local State:** Component-level UI state
- **Global State:** Zustand or Redux Toolkit
- **Session State:** In-memory + cookie-backed
- **Persistent State:** Server-side only

### 5.2 State Flow Rules

- Client state reflects server state
- Optimistic updates allowed only for UI
- Server reconciliation required on mismatch

## 6. Backend Architecture

### 6.1 API Design

RESTful endpoints only.

**Core Endpoints**
- `POST /auth/login`
- `POST /auth/signup`
- `GET /profile`
- `PUT /profile`
- `POST /messages`
- `POST /exercise/start`
- `POST /exercise/step`
- `GET /progress`
- `DELETE /account`

### 6.2 API Rules

- Validate all input
- Reject invalid state transitions
- Enforce schema versioning

## 7. Database Design

### 7.1 Tables (Core)

- users
- profiles
- messages
- exercises
- exercise_sessions
- insights

### 7.2 Storage Rules

- All writes go through API
- No client-side persistence of sensitive data

## 8. AI Integration

### 8.1 Prompt Construction

AI prompts must include:
- System role
- User profile context
- Current state
- Allowed actions

AI output must be validated before use.

### 8.2 Failure Handling

- Timeout → retry once
- Failure → fallback message

## 9. Error Handling

### 9.1 Client Errors

- Network failure → retry + message
- Validation error → inline feedback

### 9.2 Server Errors

- 4xx for user errors
- 5xx for system errors

## 10. Security Requirements

- HTTPS only
- SQL injection prevention
- XSS protection
- CSRF protection

## 11. Environment & Tooling

### 11.1 Development

- Node.js LTS
- ESLint
- Prettier
- Jest / Playwright

### 11.2 Deployment

- Vercel or equivalent
- Environment variables for secrets

## 12. Acceptance Criteria (Technical)

- Stateless client
- Server-authoritative data
- No Web3 dependencies
- Secure AI integration
- Deterministic behavior

---

**END OF TECHNICAL ARCHITECTURE PRD**