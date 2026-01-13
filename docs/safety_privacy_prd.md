# Sentient Self – Safety, Privacy & Control Product Requirements Document (PRD)

**Status:** Authoritative · Overrides All Other PRDs Where Applicable  
**Governed by:** Sentient Self – Master PRD Index

## 1. Purpose of This Document

This document defines all user safety, privacy protections, and control mechanisms within the Sentient Self application. It exists to ensure that vulnerable users are protected, that personal data is handled responsibly, and that the AI system never oversteps its role.

**In any conflict, this PRD takes precedence over all others.**

## 2. Design Assumptions (Binding)

All safety decisions assume:
- Users may be in psychological distress
- Users may relapse or regress
- Users may anthropomorphize the AI
- Users may disengage suddenly and return later

Safety must be structural, not advisory.

## 3. Safety Domains Covered

This PRD governs:

1. Crisis & High-Risk Language Handling
2. AI Role Boundaries
3. User Controls & Autonomy
4. Data Privacy & Retention
5. Logging & Observability Constraints
6. Account Deletion & Data Export

## 4. Crisis & High-Risk Language Handling

### 4.1 Purpose

The system must detect and respond safely to language indicating self-harm, suicidal ideation, or imminent danger, without positioning the AI as a replacement for professional help.

### 4.2 Detection Rules

The AI model must flag messages containing:
- Explicit suicidal intent
- Self-harm ideation
- Statements of imminent danger

Detection occurs server-side before response delivery.

### 4.3 Response Behavior

**When flagged:**
- Display a non-intrusive crisis resource banner
- Provide region-agnostic emergency guidance
- Maintain calm, non-alarmist tone
- Do not continue therapeutic exercises

**The AI must never:**
- Claim to be sufficient support
- Provide step-by-step coping techniques for crisis
- Discourage external help

### 4.4 State Changes

- Conversation state is frozen
- User may dismiss banner manually
- Dismissal does not remove future detection

## 5. AI Role Boundaries

### 5.1 Explicit Constraints

The AI must never:
- Present itself as human
- Claim therapeutic or medical authority
- Make promises of recovery
- Suggest stopping medication or treatment

### 5.2 Language Rules

- Use supportive, non-directive language
- Avoid moral framing
- Avoid urgency manipulation

## 6. User Controls & Autonomy

### 6.1 User-Accessible Controls

Users must be able to:
- Pause any exercise
- Decline any suggestion
- Exit conversations freely
- Modify tone and pace preferences

### 6.2 Irrevocable Controls

Users must be able to:
- Request full account deletion
- Export their data

These actions require confirmation but must not be blocked.

## 7. Data Privacy & Retention

### 7.1 Data Minimization

- Only data required for function is stored
- No data sold or shared

### 7.2 Retention Rules

- Messages stored indefinitely unless deleted
- Insights stored until account deletion

## 8. Logging & Observability Constraints

### 8.1 Prohibited Logging

The system must never log:
- Raw user message content in plaintext logs
- Full AI prompts
- Crisis-flagged messages

### 8.2 Permitted Logging

- Event metadata
- Error states
- Anonymous usage metrics

## 9. Account Deletion & Data Export

### 9.1 Deletion Flow

1. User initiates deletion in Settings
2. Confirmation required
3. Backend queues deletion job
4. All user data purged within 30 days

### 9.2 Data Export

- User can request JSON export
- Includes profile, insights, exercises

## 10. Acceptance Criteria (Safety & Privacy)

- Crisis language always triggers banner
- AI never claims authority
- Users retain full agency
- No prohibited data logged
- Account deletion is irreversible

---

**END OF SAFETY, PRIVACY & CONTROL PRD**