# API Setup Guide - Quick Start

This guide helps you quickly set up all necessary API keys for the Travel Assistant platform.

## 📋 Quick Checklist

### Phase 1: Critical APIs (Week 1-2) - START HERE

#### LLM Providers (Required for AI features)
- [ ] **Anthropic Claude** - https://console.anthropic.com/
  - Sign up → Settings → API Keys → Create Key
  - Copy `ANTHROPIC_API_KEY`

- [ ] **OpenAI** - https://platform.openai.com/
  - Sign up → API Keys → Create new secret key
  - Copy `OPENAI_API_KEY`

- [ ] **Google AI (Gemini)** - https://makersuite.google.com/app/apikey
  - Sign in with Google → Get API Key
  - Copy `GOOGLE_AI_API_KEY`

#### Maps & Location
- [ ] **Mapbox** - https://account.mapbox.com/
  - Sign up → Access Tokens → Create a token
  - Copy `MAPBOX_ACCESS_TOKEN`
  - Use same token for `NEXT_PUBLIC_MAPBOX_TOKEN`

- [ ] **Google Maps** - https://console.cloud.google.com/
  - Create project → Enable APIs:
    - Maps JavaScript API
    - Places API
    - Geocoding API
    - Directions API
  - Credentials → Create API Key
  - Copy `GOOGLE_MAPS_API_KEY`

#### Weather
- [ ] **OpenWeather** - https://openweathermap.org/api
  - Sign up → API keys → Generate key
  - Copy `OPENWEATHER_API_KEY`

#### Images
- [ ] **Unsplash** - https://unsplash.com/developers
  - Register as developer → New Application
  - Copy Access Key → `UNSPLASH_ACCESS_KEY`

#### Email
- [ ] **Resend** - https://resend.com/
  - Sign up → API Keys → Create API Key
  - Copy `RESEND_API_KEY`

### Phase 2: Payments (Week 3-4)

- [ ] **Stripe** - https://dashboard.stripe.com/
  - Sign up → Developers → API keys
  - Test mode: Copy both keys
    - `STRIPE_SECRET_KEY` (sk_test_...)
    - `STRIPE_PUBLISHABLE_KEY` (pk_test_...)
  - Webhooks → Add endpoint → Copy `STRIPE_WEBHOOK_SECRET`

### Phase 3: Enhanced Features (Month 2)

- [ ] **Twilio** - https://www.twilio.com/console
  - Sign up → Get Trial Phone Number
  - Copy Account SID → `TWILIO_ACCOUNT_SID`
  - Copy Auth Token → `TWILIO_AUTH_TOKEN`
  - Copy Phone Number → `TWILIO_PHONE_NUMBER`

### Phase 4: Monitoring (Month 3+)

- [ ] **Sentry** - https://sentry.io/
  - Create project → Settings → Client Keys (DSN)
  - Copy `SENTRY_DSN`

- [ ] **PostHog** - https://posthog.com/
  - Sign up → Project settings → Project API Key
  - Copy `POSTHOG_API_KEY`

---

## 🚀 Automated Setup Script

You can use this bash script to quickly validate your environment setup:

```bash
#!/bin/bash
# api-check.sh - Check which API keys are configured

echo "Checking API Configuration..."
echo "=================================="

check_key() {
  local key_name=$1
  local key_value=${!key_name}

  if [ -n "$key_value" ] && [ "$key_value" != "" ]; then
    echo "✅ $key_name - Configured"
  else
    echo "❌ $key_name - Missing"
  fi
}

# Phase 1: Critical
echo -e "\nPHASE 1: CRITICAL"
check_key "ANTHROPIC_API_KEY"
check_key "OPENAI_API_KEY"
check_key "GOOGLE_AI_API_KEY"
check_key "MAPBOX_ACCESS_TOKEN"
check_key "GOOGLE_MAPS_API_KEY"
check_key "OPENWEATHER_API_KEY"
check_key "UNSPLASH_ACCESS_KEY"
check_key "RESEND_API_KEY"

# Phase 2: High Priority
echo -e "\nPHASE 2: HIGH PRIORITY"
check_key "STRIPE_SECRET_KEY"
check_key "STRIPE_PUBLISHABLE_KEY"

# Phase 3: Medium Priority
echo -e "\nPHASE 3: MEDIUM PRIORITY"
check_key "TWILIO_ACCOUNT_SID"
check_key "TWILIO_AUTH_TOKEN"
check_key "BOOKING_COM_API_KEY"
check_key "VIATOR_API_KEY"

# Phase 4: Optional
echo -e "\nPHASE 4: OPTIONAL"
check_key "SENTRY_DSN"
check_key "POSTHOG_API_KEY"
check_key "PINECONE_API_KEY"

echo -e "\n=================================="
echo "Setup check complete!"
```

Run it with:
```bash
chmod +x api-check.sh
source .env && ./api-check.sh
```

---

## 💰 Cost Calculator

Use this to estimate your monthly API costs:

| Service | Free Tier | Paid Tier | Expected Cost (MVP) |
|---------|-----------|-----------|---------------------|
| **Anthropic Claude** | - | $15/1M tokens | $50-100/month |
| **OpenAI** | - | $10/1M tokens | $30-50/month |
| **Google AI (Gemini)** | Yes | $7/1M tokens | $0-20/month |
| **Mapbox** | 50k req/month | $5/1k after | $0 (within free) |
| **Google Maps** | $200 credit | Pay per use | $0 (within free) |
| **OpenWeather** | 1k calls/day | $40/month | $0 (within free) |
| **Unsplash** | 50 req/hour | Free | $0 |
| **Resend** | 100/day | $20/month | $0-20/month |
| **Stripe** | - | 2.9% + $0.30 | Per transaction |
| **Twilio SMS** | Trial credit | $0.0075/SMS | $20-40/month |
| **Sentry** | 5k errors | $26/month | $0 (within free) |
| **PostHog** | 1M events | $0.00031/event | $0 (within free) |
| **TOTAL** | | | **$100-200/month** |

---

## 🔐 Security Best Practices

### 1. Environment Variables
```bash
# NEVER commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### 2. Separate Test/Production Keys
Always use test mode keys for development:
- Stripe: `sk_test_...` not `sk_live_...`
- Amadeus: Use test environment

### 3. Key Rotation
Rotate keys every 90 days for production:
```bash
# Keep a key rotation schedule
# Date: 2025-02-01 - Rotated STRIPE_SECRET_KEY
# Date: 2025-05-01 - Rotated ANTHROPIC_API_KEY
```

### 4. Vercel Environment Variables
For production deployment on Vercel:

```bash
# Add each variable via CLI
vercel env add ANTHROPIC_API_KEY production
vercel env add OPENAI_API_KEY production
# ... repeat for all keys
```

Or via dashboard: Project Settings → Environment Variables

### 5. API Key Scopes
When creating keys, use minimal scopes:
- ✅ Read-only where possible
- ✅ Specific endpoint access only
- ❌ Avoid admin/full access

---

## 📝 Development Workflow

### 1. Initial Setup (Day 1)
```bash
# Copy example file
cp .env.example .env

# Get Phase 1 Critical APIs
# - Anthropic
# - OpenAI
# - Mapbox
# - OpenWeather
# - Unsplash
# - Resend

# Test the app
npm run dev
```

### 2. Week 1: Build Core Features
- Multi-model LLM router
- Weather integration
- Map visualization
- Email notifications

### 3. Week 2: Add Payments
- Set up Stripe test mode
- Implement payment flow
- Test with test cards

### 4. Week 3-4: Enhanced Features
- Add Twilio SMS
- Expand travel APIs
- Add monitoring

---

## 🐛 Troubleshooting

### Common Issues

#### "API Key Invalid"
- Check if key is correctly copied (no extra spaces)
- Verify key is for correct environment (test vs production)
- Check if key has been activated (some APIs require email verification)

#### "Rate Limit Exceeded"
- Check your free tier limits
- Implement caching to reduce API calls
- Consider upgrading to paid tier

#### "CORS Error" (Frontend APIs)
- Ensure you're using `NEXT_PUBLIC_` prefix for client-side keys
- Add your domain to API's allowed origins
- Use API routes for server-side calls

#### "Webhook Failed"
- Verify webhook URL is publicly accessible
- Check webhook signature validation
- Use ngrok for local testing: `ngrok http 3000`

---

## 📞 Support

### Getting Help

1. **API Documentation**: Each API has comprehensive docs (links in .env.example)
2. **GitHub Issues**: Use the issues we created in GITHUB_ISSUES.md
3. **Community**:
   - Stack Overflow for technical questions
   - API-specific Discord/Slack communities

### API-Specific Support

| API | Support Channel |
|-----|----------------|
| Anthropic | support@anthropic.com |
| OpenAI | https://help.openai.com/ |
| Stripe | https://support.stripe.com/ |
| Mapbox | https://support.mapbox.com/ |
| Twilio | https://support.twilio.com/ |
| Resend | support@resend.com |

---

## ✅ Pre-Launch Checklist

Before going to production:

- [ ] All Phase 1 APIs configured
- [ ] Stripe in test mode working
- [ ] Email deliverability tested (not landing in spam)
- [ ] Error tracking configured (Sentry)
- [ ] Analytics working (PostHog)
- [ ] API rate limiting implemented
- [ ] Webhook endpoints secured
- [ ] Environment variables in Vercel
- [ ] Production domain configured
- [ ] SSL certificates active
- [ ] Database backups enabled

---

## 📊 Monitoring Your API Usage

Create a simple dashboard to track API usage:

```typescript
// lib/monitoring/api-usage.ts
export async function trackAPIUsage(service: string, endpoint: string, cost: number) {
  await prisma.apiUsage.create({
    data: {
      service,
      endpoint,
      cost,
      timestamp: new Date(),
    },
  });
}

// Generate monthly report
export async function getMonthlyAPIReport() {
  const usage = await prisma.apiUsage.groupBy({
    by: ['service'],
    _sum: { cost: true },
    _count: true,
    where: {
      timestamp: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  return usage;
}
```

---

**Questions?** Check `GITHUB_ISSUES.md` for detailed implementation guides or open a GitHub issue!
