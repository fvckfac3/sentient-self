# Sentient Self – Core Systems Product Requirements Document (PRD)

**Status:** Authoritative · Build-Ready  
**Governed by:** Sentient Self – Master PRD Index

## 1. Purpose of This Document

This document defines the core experiential and functional systems that make Sentient Self distinct.

These systems together form the therapeutic, reflective, and growth-oriented engine of the application.

Any implementation that deviates from the specifications in this document is considered incorrect, regardless of UI polish or technical performance.

## 2. Systems Covered

This PRD governs the following systems in full:

1. Sentient Guide Core (Conversational AI + Exercise Orchestration)
2. User Profile & Personalization Engine
3. Exercise Library & Schema System
4. Progress Tracking & Insight Synthesis

These systems are interdependent and must be implemented as a cohesive unit.

## 3. System 1: Sentient Guide Core

### 3.1 System Purpose

The Sentient Guide Core is the primary interface through which users interact with the app. It combines conversational AI, pattern detection, and deterministic exercise orchestration to guide users through structured self-work over time.

The system prioritizes psychological safety, continuity, and depth over novelty or entertainment.

### 3.2 Plain-Language Explanation

The Sentient Guide feels like a grounded, attentive guide that listens first and intervenes intentionally. It does not rush to solutions. When appropriate, it offers structured exercises and then walks the user through them one step at a time, remembering what matters across sessions.

### 3.3 Scope Boundaries

**In Scope:**
- Free-form conversation
- Pattern detection
- Exercise suggestion
- Exercise facilitation
- Session continuity

**Out of Scope:**
- Medical advice
- Crisis counseling beyond referral
- Unstructured motivational coaching

### 3.4 Conversation State Machine

**Allowed States:**
- IDLE
- DISCOVERY
- EXERCISE_SUGGESTED
- EXERCISE_ACTIVE
- EXERCISE_PAUSED
- EXERCISE_COMPLETED

**Rules:**
- Only one exercise may be active at a time
- State transitions must be explicit
- Illegal transitions must be blocked

### 3.5 User Flows (Deterministic)

**Flow A: Conversational Discovery**
1. User sends message
2. Message persisted
3. AI responds
4. Pattern detection runs

**Flow B: Exercise Suggested**
1. AI selects exercise ID
2. Suggestion card rendered
3. User accepts or declines

**Flow C: Exercise Execution**
1. Schema loaded
2. Steps executed sequentially
3. Responses validated and saved

### 3.6 Data Contracts (Core)

**Message Object**
```json
{
  "id": "uuid",
  "role": "user|assistant",
  "content": "string",
  "timestamp": "ISO-8601"
}
```

## 4. System 2: User Profile & Personalization Engine

### 4.1 System Purpose

This system maintains a persistent model of user intent, preferences, recovery sensitivity, and interaction history to personalize all AI behavior and content delivery.

### 4.2 Profile Object (Canonical)

```json
{
  "userId": "uuid",
  "intent": "recovery|growth|both",
  "tone": "compassionate|direct|balanced",
  "pace": "gentle|structured|intensive",
  "recoveryFlags": {
    "substance": true,
    "trauma": true
  },
  "insightSummary": "string"
}
```

**Rules:**
- Profile must load before any AI call
- Profile updates apply immediately

## 5. System 3: Exercise Library & Schema System

### 5.1 System Purpose

Defines all exercises as immutable, versioned schemas executed deterministically by the Sentient Guide.

### 5.2 Exercise Schema (Canonical)

```json
{
  "id": "string",
  "version": "string",
  "title": "string",
  "description": "string",
  "framework": "string",
  "category": ["string"],
  "recoveryRelevant": true,
  "recommendedFor": {
    "intent": ["recovery", "growth", "both"],
    "pace": ["gentle", "structured", "intensive"]
  },
  "contraindications": ["string"],
  "estimatedDurationMinutes": 15,
  "steps": [
    {
      "stepId": "string",
      "prompt": "string",
      "inputType": "text|scale|choice",
      "validation": {
        "required": true,
        "minLength": 10
      }
    }
  ],
  "synthesisTemplate": "string"
}
```

## 6. System 4: Progress Tracking & Insight Synthesis

### 6.1 System Purpose

Transforms completed exercises into durable insight objects that reinforce continuity and reflection without gamification.

### 6.2 Insight Object (Canonical)

```json
{
  "id": "uuid",
  "exerciseId": "string",
  "createdAt": "ISO-8601",
  "synthesis": "string",
  "annotations": ["string"]
}
```

**Rules:**
- Exactly one insight per completed exercise
- Syntheses are immutable

## 7. Cross-System Rules (Critical)

- No exercise execution without schema validation
- No AI response without profile context
- No insight without completed exercise

## 8. Acceptance Criteria (Core Systems)

- Conversational continuity across sessions
- Deterministic exercise execution
- Persistent personalization
- Durable progress history

---

**END OF CORE SYSTEMS PRD**