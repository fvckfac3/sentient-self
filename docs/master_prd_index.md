# Sentient Self – Master Product Requirements Index

**Document Type:** Authoritative Index  
**Status:** Locked (Do Not Expand)  
**Scope:** Defines structure, ownership, and interpretation rules for all Sentient Self PRDs

## 1. Purpose of This Document

This document is the single authoritative entry point for all Product Requirements Documents (PRDs) related to the Sentient Self App. Any AI coding agent, engineer, or system consuming Sentient Self requirements must read and follow this index first.

This index exists to:
- Prevent ambiguity caused by oversized or monolithic PRDs
- Clearly separate concerns across multiple documents
- Define which document governs which system behavior
- Establish precedence rules in the event of overlap

No functional requirements are defined here. All implementation details live in referenced documents.

## 2. Product Overview (High-Level Only)

**Product Name:** Sentient Self

**Product Description:** Sentient Self is a Web2-only AI-powered personal growth and recovery application designed for recovering addicts and individuals seeking deep personal growth. The product centers around a structured conversational AI guide, deterministic therapeutic exercises, and persistent insight tracking.

**Non-Goals:**
- No Web3, blockchain, tokens, or on-chain storage
- No social network or community features
- No clinical diagnosis or treatment

## 3. Target Audience (Canonical Definition)

### Primary Audience (Canonical)

1. **Recovering Addicts**
   - Individuals in early, mid, or long-term recovery
   - Includes substance and behavioral addictions
   - Requires trauma-informed, non-shaming systems

2. **Individuals Seeking Deep Personal Growth**
   - Interested in identity work, emotional regulation, and meaning-making
   - Comfortable with long-form introspection

All PRDs must assume these users as the default context.

## 4. Core Product Principles (Binding)

All features must comply with the following principles:

1. Structure over novelty
2. Safety over persuasion
3. Exercises over advice
4. Continuity over sessions
5. Agency over compliance
6. Neurobiological framing, not moral framing

Violations of these principles constitute an invalid implementation.

## 5. PRD System Structure

The Sentient Self PRD is intentionally split into multiple documents. Each document has a single responsibility.

### 5.1 Core Systems PRD

**Document Name:** Sentient Self – Core Systems PRD

**Governs:**
- Sentient Guide Core (Conversational AI)
- User Profile & Personalization Engine
- Exercise Library & Schema System
- Progress Tracking & Insight Synthesis

This document defines the essence of the product. Any implementation that deviates here is considered incorrect.

### 5.2 Experience & Access PRD

**Document Name:** Sentient Self – Experience & Access PRD

**Governs:**
- Authentication
- Onboarding
- Navigation model
- Global layout behavior
- Responsive breakpoints

This document governs how users enter and move through the system.

### 5.3 Safety, Privacy & Control PRD

**Document Name:** Sentient Self – Safety, Privacy & Control PRD

**Governs:**
- User settings
- Safety controls
- Crisis handling
- Data deletion and export
- Logging constraints

This document overrides all others in case of conflict involving user safety or privacy.

### 5.4 Technical Architecture & Implementation PRD

**Document Name:** Sentient Self – Technical Architecture PRD

**Governs:**
- Frontend stack
- Backend stack
- State management
- API contracts
- Data storage
- Error handling
- Security practices

This document governs how the system is built, not what it does.

## 6. Precedence Rules (Critical)

If two documents appear to conflict:

1. Safety, Privacy & Control PRD overrides all
2. Core Systems PRD overrides Experience & Access PRD
3. Experience & Access PRD overrides Technical Architecture PRD
4. Master PRD Index overrides nothing (index only)

An AI coding agent must resolve conflicts using this order.

## 7. Instructions to AI Coding Agents (Binding)

- Do not invent features, flows, or UI elements not specified in the PRDs
- Do not merge responsibilities across documents
- Do not reinterpret therapeutic intent
- Do not introduce Web3 elements
- Do not optimize for engagement at the expense of safety
- If a requirement is unclear, default to not implementing it.

## 8. Document Change Rules

- This index is intentionally minimal and stable
- Feature details must never be added here
- All expansions occur in their respective PRDs

---

**END OF MASTER PRD INDEX**