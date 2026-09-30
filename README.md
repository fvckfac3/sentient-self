<div align="center">

  <img src="./assets/sentient-self-logo.png" alt="Sentient Self Logo" width="400"/>

  # Sentient Self

  ### **UNDERSTAND YOURSELF BETTER**

  *AI journaling that learns your patterns and reflects your growth.*

  [Explore](#explore) • [Capabilities](#capabilities) • [Privacy](#privacy) • [Community](#community)

  ---

</div>

# Sentient Self - AI-Powered Therapeutic Growth Platform

Sentient Self is a conversation-first, AI-guided therapeutic self-development platform designed primarily for recovering addicts and individuals seeking deep personal growth.

# Explore {#explore}

## Getting Started

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

## Overview

Sentient Self is built on a **conversation-first** paradigm. The platform is designed around a therapeutic state machine that ensures safety, efficacy, and user autonomy at every step.

### Core Concept
- **Always start with conversation**: Natural dialogue establishes context and emotional tone
- **AI enforces therapeutic flow**: The state machine prevents jumping to exercises before the user is ready
- **User autonomy is non-negotiable**: Exercises are always optional, suggested (never imposed), and contextually appropriate

## Architecture

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

## Build Order

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

# Capabilities {#capabilities}

## Core Platform Features

### 1. Conversation-First Approach
- Always starts with natural conversation, not forms or questionnaires
- AI reflects back what the user is experiencing
- Establishes emotional safety before introducing structure
- Honors the user's pace and readiness

### 2. AI State Machine
- Enforces therapeutic flow: INIT → CONVERSATIONAL_DISCOVERY ↔ SUPPORTIVE_PROCESSING → EXERCISE_SUGGESTION → EXERCISE_FACILITATION → POST_EXERCISE_INTEGRATION
- Crisis mode overrides all other states (can be triggered anytime)
- Ensures exercises only happen when the 5-point suggestion gate is satisfied
- Prevents inappropriate therapeutic sequencing

### 3. Crisis Detection & Response
- Built-in safety with immediate resource access
- Automatic detection of suicidal ideation, self-harm intent
- Immediate transition to Crisis Mode with resource display
- No exercises or therapeutic exploration during crisis
- Clear pathways to professional help (988 Lifeline, 911)

### 4. 634 Evidence-Based Exercises
- Across 25 topics (anxiety, addiction recovery, relationships, depression, grief, etc.)
- 13 therapeutic frameworks (CBT, DBT, ACT, EMDR, Somatic, etc.)
- Structured phases with clear completion criteria
- Optional custom exercise generation (framework-bound)
- Exercise library searchable by framework, topic, and duration

### 5. Exercise Suggestion Gate (Mandatory)
Exercises can only be suggested when ALL conditions are met:
1. Concrete challenge articulated by the user
2. AI has accurately reflected the challenge  
3. User appears emotionally regulated
4. AI can explain why this structure helps
5. User hasn't recently declined exercises

This ensures exercises are contextually appropriate and never forced.

### 6. Optional Exercise Invitations
- Never forced; always user choice
- Transparent explanation of why this exercise might help
- Clear opt-out without penalty
- Exercises re-suggested later if circumstances change

### 7. Custom Exercise Generation
- Framework-bound adaptations (uses existing framework structure)
- Personalizes based on user's specific challenge and history
- Maintains therapeutic integrity (can't create novel frameworks)
- Tracks usage and efficacy

### 8. Progress Tracking & Analytics
- Completion logging with timestamps and reflections
- Progress dashboards tracking exercises, conversations, and growth metrics
- User-visible analytics (never used for AI training)
- Historical trend analysis (mood, engagement, topic focus)

### 9. Multiple AI Models
- **Free tier**: DeepSeek R1 (excellent reasoning, free)
- **Premium tier**: GPT-5.2, Claude 4.5 Opus, Gemini 3 Pro, Grok 4.1 (higher quality conversations)
- Model selection per subscription tier
- Model quality directly affects therapeutic efficacy

### 10. Responsive Design & Accessibility
- Works on all devices (mobile-first)
- Dark mode (required for therapeutic environment)
- Keyboard navigation and screen reader support
- Accessible colors and typography

### 11. Journal System
- AI-powered journal entries with analysis
- Optional AI journal analysis (premium)
- Full data export capability
- Author-only access; never used for AI training

### 12. Multi-Tier Subscription System
- **Free**: Unlimited conversational AI (DeepSeek R1), unlimited journal entries, 5 AI-guided exercises/month, basic analytics
- **Premium ($14.99/month)**: All AI models, unlimited exercises, AI journal analysis, full analytics, gamification
- **Institutional**: Per-seat billing, admin dashboard with aggregate analytics, crisis alert dispatch

# Privacy {#privacy}

## Security & Data Protection

### Crisis Handling
- Immediate detection of suicidal ideation, self-harm intent
- Automatic transition to Crisis Mode with resource display
- No exercises or therapeutic exploration during crisis
- Clear pathways to professional help
- Crisis data is archived but not analyzed (to protect user privacy)

### Data Privacy
- **Author-only access**: Only the user can view their journal entries and conversation history
- **Never used for AI training**: User data is strictly private
- **Institutional users**: Aggregate analytics only (no individual content access)
- **Full data export capability**: Users can export all personal data at any time
- **Data deletion**: Users can request complete data deletion (subject to retention requirements)

### Medical Boundaries
- Explicit "not medical care" disclaimers throughout the app
- No diagnosis or treatment claims
- Encourages professional support and therapy
- Clear escalation paths to crisis resources and healthcare providers

### Compliance & Standards
- **HIPAA considerations**: Platform designed with healthcare privacy in mind (subject to formal attestation)
- **Data sovereignty options**: Can be deployed on private infrastructure for institutional clients
- **Audit logs**: Track all user actions and system changes
- **Encryption**: All sensitive data encrypted at rest and in transit

### User Consent & Control
- Transparent about AI use and limitations
- Users can disable AI journal analysis
- Users can opt out of any data tracking
- Clear privacy policy (non-legalese version available)
- Regular privacy audits and updates

---

# Community {#community}

## Connect, Share & Grow Together

Sentient Self is more than an app—it's a community of people committed to understanding themselves better and supporting each other's growth.

### Community Resources

#### Peer Support Forums
- **Topic-based discussions**: Anxiety, addiction recovery, relationships, depression, grief, personal growth
- **Moderated spaces**: Community guidelines ensure respectful, trauma-informed conversations
- **Anonymous posting**: Share experiences without revealing identity
- **Peer recognition**: Acknowledge members who offer valuable support

#### Shared Exercises & Practices
- **Exercise library browsing**: See which exercises others found helpful
- **Community ratings**: Rate exercises' helpfulness (anonymized data)
- **Facilitation guides**: Learn how to lead others through exercises (for peer facilitators)
- **Practice groups**: Join groups practicing the same framework (e.g., "DBT Tuesday")

#### Educational Content
- **Framework deep-dives**: Learn the theory behind CBT, DBT, ACT, EMDR, etc.
- **Expert articles**: Interviews with therapists and researchers
- **Podcast library**: Audio conversations about personal growth and mental health
- **Reading list**: Curated books, papers, and resources

#### Special Interest Groups
- **Addiction recovery**: Community for people in recovery (12-step, SMART Recovery, secular recovery)
- **Grief & loss**: Support for those processing major life transitions
- **Relationship growth**: For couples and individuals working on relationship skills
- **Creativity & expression**: Art, music, journaling as therapeutic practice
- **Workplace wellness**: Professional development through therapeutic practices

#### Events & Workshops
- **Monthly webinars**: Live sessions with therapists, researchers, and community leaders
- **Writing workshops**: Group journaling and creative writing
- **Meditation circles**: Guided practice sessions (async-friendly)
- **Celebration milestones**: Acknowledge community achievements (recovery anniversaries, etc.)

#### Community Guidelines
- **Respect & inclusion**: All backgrounds, recovery paths, and experiences welcome
- **Trauma-informed**: Respect for people's different starting points and triggers
- **No medical advice**: Community provides support, not diagnosis or treatment
- **Confidentiality**: "What's shared here, stays here"
- **Moderators**: Trained volunteers maintain safe spaces

### Getting Involved

#### For Users
1. **Join the forum**: Navigate to Community → Forums in the app
2. **Introduce yourself**: Share your name (or alias) and what brought you here
3. **Browse & read**: Learn from others' experiences
4. **Contribute**: Ask questions and share your own insights
5. **Rate resources**: Help others find what works

#### For Peer Facilitators
- Complete peer facilitator training (4-week self-paced course)
- Lead a practice group or support circle
- Facilitate discussions on a topic you've worked with
- Earn recognition within the community
- Access facilitator-only resources and training

#### For Contributing Experts
- Share your expertise (therapist, researcher, lived experience)
- Contribute articles, webinars, or resource recommendations
- Participate in quarterly expert Q&A sessions
- Help shape the platform's direction

### Community Stories

**"From Struggling to Supporting"** — Anonymous member shares their 2-year journey using Sentient Self to recover from addiction, how exercises changed their approach to cravings, and how they now facilitate a recovery group.

**"DBT Changed My Life—Here's Why"** — Interview with a licensed therapist about why DBT works, how to know if it's right for you, and common misconceptions.

**"Learning to Sit With My Grief"** — Personal essay on how Somatic work and journaling helped someone process unexpected loss.

### Support & Moderation

- **Community managers**: Respond to questions and facilitate discussions
- **Crisis escalation**: Trained to connect users with 24/7 crisis resources
- **Feedback loop**: Community input shapes feature development
- **Anti-harassment**: Swift action on harmful behavior; zero tolerance for abuse

### Sharing Your Story

If you'd like to share your story with the community:
1. Reach out to community@sentientself.app
2. Share what you're comfortable making public
3. We'll work with you to write and publish your story
4. Your story helps others feel less alone

---

## Subscription Tiers

### Free Tier
- Unlimited conversational AI (DeepSeek R1)
- Unlimited journal entries
- 5 AI-guided exercises per month
- Basic analytics
- Community forum access
- **Price**: Free, forever

### Premium ($14.99/month)
- All AI models (GPT-5.2, Claude 4.5 Opus, Gemini 3 Pro, Grok 4.1)
- Unlimited exercises
- AI journal analysis
- Full analytics dashboard
- Gamification system
- Priority community support
- Ad-free experience
- **Cancel anytime**

### Institutional (Custom Pricing)
- Per-seat billing via Stripe
- Admin dashboard with aggregate analytics
- Crisis alert dispatch (with user consent)
- Seat management tools
- API access
- Custom branding
- Dedicated support
- **For**: Universities, nonprofits, treatment centers, corporate wellness programs

---

## AI State Machine

The conversation flow follows a strict state machine:

```
INIT → CONVERSATIONAL_DISCOVERY ↔ SUPPORTIVE_PROCESSING
                ↓                           ↓
       EXERCISE_SUGGESTION → EXERCISE_FACILITATION → POST_EXERCISE_INTEGRATION
                ↓                           ↓                    ↓
            CRISIS_MODE ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

**Key Rules:**
- Crisis mode overrides all other states
- Exercises require passing the 5-point suggestion gate
- User autonomy is non-negotiable
- Memory supports continuity without intrusion

---

## Exercise System

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

---

## Institutional Features

### Admin Dashboard
- Seat management and billing
- Aggregate analytics (no individual content access)
- Crisis alert notifications (with explicit user consent)
- Usage reporting and trends

### Compliance
- HIPAA considerations for institutional clients
- Data sovereignty options
- Audit logs for administrative actions

---

## Development

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

---

## Documentation References

The complete platform specification is based on these authoritative documents:
- `Sentient Self PRD v3.pdf` - Complete product requirements
- `State machine.pdf` - Conversation flow specification  
- `V3 AI Initialization prompt.pdf` - AI behavior contract
- `Database schema (prisma) - appendix b.pdf` - Data model
- `build order check list - appendix a.pdf` - Implementation sequence

---

## License

This project implements a therapeutic platform with strict safety requirements. See license file for terms.

---

## Contributing

Please review the PRD and safety requirements before contributing. All changes must maintain therapeutic integrity and safety standards.

**Questions or feedback?** Reach out to hello@sentientself.app or join us in the community forums.
