# Sentient Self – Experience & Access Product Requirements Document (PRD)

**Status:** Authoritative · Build-Ready  
**Governed by:** Sentient Self – Master PRD Index

## 1. Purpose of This Document

This document defines how users enter, move through, and experience the Sentient Self application. It governs authentication, onboarding, navigation, screen hierarchy, and responsive behavior.

This PRD ensures that users are never dropped into the system without context, that all core systems are accessed intentionally, and that the experience remains predictable, safe, and calm across devices.

## 2. Systems Covered

This PRD governs the following systems:

1. Authentication
2. Onboarding
3. Global Navigation Model
4. Screen Hierarchy & Page Contracts
5. Responsive Layout Behavior

This document does not define therapeutic logic or AI behavior. Those are governed by the Core Systems PRD.

## 3. Target User Context (Binding)

All experience decisions assume:
- Users may be emotionally vulnerable
- Users may have cognitive fatigue
- Users may return after long gaps

Design must favor clarity, containment, and orientation over speed or density.

## 4. Authentication System

### 4.1 Purpose

Authentication establishes user identity, session continuity, and data ownership. No anonymous access is permitted.

### 4.2 Supported Methods

- Email + password
- OAuth (Google)

No other authentication methods are permitted in v1.

### 4.3 Auth States

- UNAUTHENTICATED
- AUTHENTICATED

Auth state must be resolved before rendering any protected screen.

### 4.4 User Flows

**Flow A: New User Signup**
1. User lands on Landing Page
2. Clicks "Get Started"
3. Selects signup method
4. Enters credentials
5. Backend creates account
6. Auth state = AUTHENTICATED
7. Redirect to onboarding

**Flow B: Returning User Login**
1. User submits credentials
2. Session validated
3. Redirect based on onboarding status

### 4.5 Error Handling

- Invalid credentials → inline error
- OAuth failure → retry option
- Network error → blocking error state

## 5. Onboarding System

### 5.1 Purpose

Onboarding prepares users emotionally and contextually before interacting with the Sentient Guide. Completion is mandatory.

### 5.2 Onboarding States

- NOT_STARTED
- IN_PROGRESS
- COMPLETED

Users may not access the dashboard or chat until onboarding is COMPLETED.

### 5.3 Onboarding Steps (Canonical)

**Step 1: Welcome & Framing**
- Explain what the app is and is not
- Emphasize non-clinical nature

**Step 2: Intent Selection**
- Recovery
- Personal growth
- Both

**Step 3: Tone & Pace Preferences**
- Tone selector
- Pace selector

**Step 4: Safety & Consent**
- Explicit disclaimer
- Required consent checkbox

**Step 5: Completion**
- Confirmation
- Transition to dashboard

Steps must be completed in order.

### 5.4 Resume Behavior

On refresh or exit, onboarding resumes at last incomplete step.

## 6. Global Navigation Model

### 6.1 Navigation Structure

Primary navigation items:
- Chat (Sentient Guide)
- Exercises
- Progress
- Settings

Navigation is persistent across desktop and tablet.

### 6.2 Navigation Rules

- Navigation disabled during active exercise (except Pause)
- Back navigation returns to last stable state

## 7. Screen Hierarchy & Page Contracts

### 7.1 Screen List

1. Landing
2. Signup/Login
3. Onboarding (multi-step)
4. Dashboard (Chat default)
5. Exercise Library
6. Exercise Detail
7. Progress Timeline
8. Insight Detail
9. Settings

### 7.2 Dashboard (Chat Screen)

- Primary screen after onboarding
- Must load user profile before rendering
- Displays Sentient Guide conversation

## 8. Responsive Layout Behavior

### 8.1 Breakpoints

- **Mobile:** <768px
- **Tablet:** 768–1024px
- **Desktop:** >1024px

### 8.2 Behavior by Device

**Mobile:**
- Single-column layout
- Bottom navigation
- Full-screen flows

**Tablet/Desktop:**
- Sidebar navigation
- Persistent chat panel

## 9. State Persistence & Recovery

- Auth session persisted via HTTP-only cookie
- Navigation state persisted per session
- On refresh:
  - Restore last screen
  - Restore active exercise if applicable

## 10. Acceptance Criteria (Experience & Access)

- No access without authentication
- No chat access without onboarding completion
- Navigation behavior consistent across devices
- No loss of session on refresh

---

**END OF EXPERIENCE & ACCESS PRD**