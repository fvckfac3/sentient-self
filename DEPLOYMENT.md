# Deployment Guide

## 🚀 Production Deployment

### Prerequisites

1. **Database**: PostgreSQL 14+ instance
2. **Node.js**: Version 18+ 
3. **Environment Variables**: All required vars from `.env.example`
4. **Domain**: For OAuth callbacks and production URLs

### Environment Variables Setup

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/sentient_self"

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secure-random-string"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
APPLE_ID="your-apple-id"
APPLE_TEAM_ID="your-apple-team-id"
APPLE_PRIVATE_KEY="your-apple-private-key"
APPLE_KEY_ID="your-apple-key-id"

# Stripe
STRIPE_SECRET_KEY="sk_live_your-live-key"
STRIPE_PUBLISHABLE_KEY="pk_live_your-live-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# AI APIs
DEEPSEEK_API_KEY="your-deepseek-key"
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
GOOGLE_AI_API_KEY="your-google-ai-key"
GROK_API_KEY="your-grok-key"
```

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy to Vercel**
```bash
vercel --prod
```

3. **Set Environment Variables**
- Go to Vercel dashboard → Project → Settings → Environment Variables
- Add all variables from your `.env` file

4. **Configure Database**
```bash
# Run database migration
npx prisma migrate deploy

# Seed exercises data
npx prisma db seed
```

### Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Build and Run**
```bash
docker build -t sentient-self .
docker run -p 3000:3000 --env-file .env sentient-self
```

### Manual Server Deployment

1. **Install dependencies**
```bash
npm ci --production
```

2. **Setup database**
```bash
npx prisma migrate deploy
npx prisma db seed
```

3. **Build application**
```bash
npm run build
```

4. **Start production server**
```bash
npm start
```

## 🔧 Configuration

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`

#### Apple OAuth
1. Go to [Apple Developer](https://developer.apple.com)
2. Register your app identifier
3. Create Services ID for Sign in with Apple
4. Configure domain and return URLs
5. Generate private key and note Key ID

### Stripe Configuration

1. **Create Products**
```bash
# Premium subscription
stripe products create --name "Premium Plan" --type service

# Set up price
stripe prices create --product prod_xxx --unit-amount 1499 --currency usd --recurring interval=month
```

2. **Configure Webhooks**
- Endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Events: `customer.subscription.created`, `customer.subscription.deleted`, `invoice.payment_succeeded`

### AI API Keys

1. **DeepSeek**: [DeepSeek Platform](https://platform.deepseek.com)
2. **OpenAI**: [OpenAI Platform](https://platform.openai.com)
3. **Anthropic**: [Anthropic Console](https://console.anthropic.com)
4. **Google AI**: [Google AI Studio](https://makersuite.google.com)
5. **Grok**: [xAI Console](https://console.x.ai)

## 🛡️ Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables secured (not in source code)
- [ ] Database connection encrypted
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Crisis detection monitoring enabled
- [ ] Backup strategy implemented

## 📊 Monitoring

### Health Checks
- Database connectivity: `/api/health/db`
- AI services: `/api/health/ai`
- Overall status: `/api/health`

### Metrics to Monitor
- Response times for AI endpoints
- Database query performance
- Crisis detection trigger rates
- User session durations
- Exercise completion rates

## 🔄 Updates

### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name your-migration-name

# Deploy to production
npx prisma migrate deploy
```

### Exercise Data Updates
```bash
# Update exercises from JSON files
npm run db:seed
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database exists

2. **OAuth Failures**
   - Verify redirect URIs match exactly
   - Check client ID/secret configuration
   - Ensure proper domain setup

3. **AI API Errors**
   - Validate API keys
   - Check rate limits
   - Monitor error logs

4. **Prisma Issues**
   - Run `npx prisma generate` after schema changes
   - Clear `.next` cache if needed
   - Verify database schema matches Prisma schema

### Emergency Procedures

1. **Crisis System Failure**
   - Enable maintenance mode
   - Display static crisis resources
   - Alert development team

2. **Database Outage**
   - Switch to read-only mode
   - Display cached crisis resources
   - Prevent new user registrations

3. **AI Service Outage**
   - Fallback to basic text responses
   - Display maintenance message
   - Enable human handoff if available

## 📝 Compliance

### HIPAA (For Institutional Clients)
- Implement audit logging
- Encrypt data at rest and in transit
- Business Associate Agreements
- Regular security assessments

### GDPR
- User consent management
- Data export functionality
- Right to deletion
- Privacy policy updates

### Crisis Response Compliance
- 24/7 monitoring of crisis detection
- Immediate resource display
- No therapeutic advice during crisis
- Clear medical disclaimers