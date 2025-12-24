# 🚀 Sentient Self - Deployment Checklist

## ✅ Pre-Deployment Verification

### Code Quality
- [x] TypeScript builds without errors
- [x] All linting passes
- [x] No console errors in development
- [x] Production build successful (`npm run build`)

### Environment Variables Required

```bash
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Authentication (Required)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# AI Services (At least one required)
DEEPSEEK_API_KEY="sk-..."
OPENAI_API_KEY="sk-proj-..." # Optional
ANTHROPIC_API_KEY="..." # Optional

# Stripe (For billing features)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PREMIUM_PRICE_ID="price_..."
STRIPE_INSTITUTION_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OAuth (Optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 📋 Deployment Steps

### 1. Database Setup
```bash
# Push schema to production database
npx prisma db push

# Seed frameworks (if needed)
npx prisma db seed
```

### 2. Vercel Configuration

**Build Settings:**
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Environment Variables:**
Add all variables from `.env.example` in Vercel dashboard

### 3. Domain Setup
- [ ] Add custom domain in Vercel
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Configure DNS records

### 4. Stripe Webhook Setup
- [ ] Create webhook in Stripe dashboard
- [ ] Point to: `https://yourdomain.com/api/stripe/webhook`
- [ ] Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 🧪 Post-Deployment Testing

### Critical Flows
- [ ] User signup works
- [ ] User login works
- [ ] Session persists across refreshes
- [ ] Chat conversation creates and saves
- [ ] AI responses generate correctly
- [ ] Journal entries create and save
- [ ] Theme toggle works
- [ ] Mobile menu opens/closes
- [ ] Settings pages load

### Mobile Testing (Real Devices)
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Verify no horizontal scroll
- [ ] Check touch targets (44px minimum)
- [ ] Verify safe areas (notch, home indicator)
- [ ] Test keyboard interactions

### Payment Testing (Stripe Test Mode First)
- [ ] Free to Premium upgrade flow
- [ ] Payment success redirect
- [ ] Subscription status updates in database
- [ ] Webhook receives events
- [ ] Customer portal access

## 🔒 Security Checklist

- [ ] All API routes check authentication
- [ ] Database queries use Prisma (no raw SQL)
- [ ] Rate limiting configured (if applicable)
- [ ] CORS settings appropriate
- [ ] Environment secrets not in code
- [ ] `.env` files in `.gitignore`

## 📊 Monitoring Setup

### Recommended Tools
- [ ] Vercel Analytics (built-in)
- [ ] Sentry for error tracking
- [ ] LogRocket for session replay
- [ ] Plausible/PostHog for privacy-friendly analytics

## 🎯 Performance Targets

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1

## 📱 PWA Features (Future Enhancement)

- [ ] Add `manifest.json`
- [ ] Add service worker
- [ ] Add install prompt
- [ ] Add offline support

## 🐛 Known Issues / Limitations

- Medical disclaimer must be acknowledged before chat access
- Exercise recommendations require onboarding completion
- Analytics require Premium subscription
- Stripe test mode keys for initial testing

## 📞 Support Setup

- [ ] Support email configured: support@sentientself.com
- [ ] Help documentation available
- [ ] Crisis resources page accessible
- [ ] Privacy policy published
- [ ] Terms of service published

## 🎉 Launch Day

1. Switch Stripe to live mode
2. Update Stripe environment variables
3. Deploy to production
4. Test critical user flows
5. Monitor error logs closely
6. Announce launch 🚀

---

## Quick Commands

```bash
# Local development
npm run dev

# Type checking
npm run type-check

# Production build
npm run build

# Start production server locally
npm run start

# Database operations
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes
npx prisma generate      # Regenerate Prisma client

# View build output
npm run build -- --debug
```

## Emergency Rollback

If issues occur post-deployment:
1. Revert to previous deployment in Vercel dashboard
2. Check error logs in Vercel
3. Verify environment variables
4. Test database connectivity
5. Check API rate limits

---

**Last Updated**: 2025-12-24
**MVP Version**: 1.0.0
**Status**: ✅ Ready for Production
