# Sentient Self - AI-Powered Therapeutic Growth Platform

Sentient Self is a conversation-first, AI-guided therapeutic self-development platform designed primarily for recovering addicts and individuals seeking deep personal growth.

## 🌟 Features

### Core Platform
- **Conversation-First Approach**: Always starts with natural conversation
- **AI State Machine**: Enforces therapeutic flow and safety protocols
- **Crisis Detection**: Built-in safety with immediate resource access
- **Exercise Suggestion Gate**: Ensures exercises are contextually appropriate
- **Multiple AI Models**: DeepSeek R1 (free), premium models for subscribers

### Therapeutic System
- **634 Evidence-Based Exercises** across 25 topics and 13 frameworks
- **Optional Exercise Invitations**: Never forced, always user choice
- **Custom Exercise Generation**: Framework-bound adaptations
- **Progress Tracking**: Completion logging and reflection requirements

### Safety & Support
- **Crisis Mode Override**: Immediate transition to safety resources
- **Medical Disclaimers**: Clear boundaries on what the platform provides
- **US Crisis Resources**: 988 Lifeline, 911 emergency access
- **Trauma-Informed Care**: Honors trauma before meaning-making

### User Experience
- **Onboarding Assessment**: Establishes user baseline profile
- **Responsive Design**: Works on all devices
- **Dark Mode**: Required for therapeutic environment
- **Journal System**: With AI analysis (premium)
- **Analytics Dashboard**: Track progress and trends

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: Zustand with persistence
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth with Google/Apple OAuth + credentials
- **Payments**: Stripe subscriptions and invoicing

### Key Components
- **AI Controller**: Manages conversation state machine and exercise gates
- **Crisis Detection**: Pattern-based safety monitoring
- **Exercise Engine**: Facilitates structured therapeutic work
- **Memory System**: Contextual continuity without intrusion

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables (see `.env.example`)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository>
cd sentient-self
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Fill in your database URL, API keys, etc.
```

3. **Set up database**
```bash
npm run db:push
npm run db:seed
```

4. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📋 Build Order

The application follows the authoritative build order from Appendix A:

1. ✅ **Phase 0**: Repository & tooling setup
2. ✅ **Phase 1**: Database & state foundations  
3. ✅ **Phase 2**: Authentication & billing
4. ✅ **Phase 3**: Onboarding flow
5. ✅ **Phase 4**: AI controller (most critical)
6. ✅ **Phase 5**: Exercise system
7. 🔄 **Phase 6**: Journal system (in progress)
8. ⏳ **Phase 7**: Analytics & gamification
9. ⏳ **Phase 8**: Institutional admin

## 🔐 Security & Safety

### Crisis Handling
- Immediate detection of suicidal ideation, self-harm intent
- Automatic transition to Crisis Mode with resource display
- No exercises or therapeutic exploration during crisis
- Clear pathways to professional help

### Data Privacy
- Author-only access to journal entries
- Never used for AI training
- Institutional users: aggregate analytics only
- Full data export capability

### Medical Boundaries
- Explicit "not medical care" disclaimers
- No diagnosis or treatment claims
- Encourages professional support

## 🎯 Subscription Tiers

### Free Tier
- Unlimited conversational AI (DeepSeek R1)
- Unlimited journal entries
- 5 AI-guided exercises per month
- Basic analytics

### Premium ($14.99/month)
- All AI models (GPT-5.2, Claude 4.5 Opus, Gemini 3 Pro, Grok 4.1)
- Unlimited exercises
- AI journal analysis
- Full analytics dashboard
- Gamification system

### Institutional
- Per-seat billing via Stripe
- Admin dashboard with aggregate analytics
- Crisis alert dispatch (with user consent)
- Seat management tools

## 🧠 AI State Machine

The conversation flow follows a strict state machine:

```
INIT → CONVERSATIONAL_DISCOVERY ⟷ SUPPORTIVE_PROCESSING
                ↓                           ↓
       EXERCISE_SUGGESTION → EXERCISE_FACILITATION → POST_EXERCISE_INTEGRATION
                ↓                           ↓                    ↓
            CRISIS_MODE ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

**Key Rules:**
- Crisis mode overrides all other states
- Exercises require passing the 5-point suggestion gate
- User autonomy is non-negotiable
- Memory supports continuity without intrusion

## 📚 Exercise System

### Framework Integration
- 13 therapeutic frameworks (CBT, DBT, ACT, etc.)
- 25 topics (anxiety, addiction recovery, relationships, etc.)  
- 634 total exercises with structured phases
- Custom exercises must follow existing framework patterns

### Suggestion Gate (Mandatory)
Exercises can only be suggested when ALL conditions are met:
1. Concrete challenge articulated
2. AI has accurately reflected the challenge  
3. User appears emotionally regulated
4. AI can explain why structure helps
5. User hasn't recently declined exercises

## 🏥 Institutional Features

### Admin Dashboard
- Seat management and billing
- Aggregate analytics (no individual content access)
- Crisis alert notifications (with explicit user consent)
- Usage reporting and trends

### Compliance
- HIPAA considerations for institutional clients
- Data sovereignty options
- Audit logs for administrative actions

## 🛠️ Development

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed exercise data
```

### Key Directories
```
src/
├── app/             # Next.js App Router pages
├── components/      # React components
│   ├── ui/          # Base UI components
│   ├── chat/        # Chat interface
│   ├── exercises/   # Exercise system
│   └── onboarding/  # Onboarding flow
├── lib/             # Utilities and services
├── store/           # Zustand state management
└── types/           # TypeScript definitions
```

## 📖 Documentation References

The complete platform specification is based on these authoritative documents:
- `Sentient Self PRD v3.pdf` - Complete product requirements
- `State machine.pdf` - Conversation flow specification  
- `V3 AI Initialization prompt.pdf` - AI behavior contract
- `Database schema (prisma) - appendix b.pdf` - Data model
- `build order check list - appendix a.pdf` - Implementation sequence

## ⚖️ License

This project implements a therapeutic platform with strict safety requirements. See license file for terms.

## 🤝 Contributing

Please review the PRD and safety requirements before contributing. All changes must maintain therapeutic integrity and safety standards.