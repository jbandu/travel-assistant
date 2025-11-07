# Deployment Guide - Vercel

## Prerequisites

Before deploying to Vercel, ensure you have:
1. Vercel account connected to your GitHub repository
2. Environment variables configured in Vercel dashboard

## Environment Variables

Configure these in Vercel Dashboard → Project Settings → Environment Variables:

### Required Variables:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_mXj1qakz8wdu@ep-muddy-pond-ader93vt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret (generate a strong random string)
JWT_SECRET=your-production-jwt-secret-change-this-to-random-string

# Node Environment
NODE_ENV=production

# App URL (will be your Vercel domain)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Optional Variables (for enhanced features):

```bash
# OpenAI (for real AI responses)
OPENAI_API_KEY=sk-...

# Anthropic (alternative to OpenAI)
ANTHROPIC_API_KEY=sk-ant-...

# Flight Search
AMADEUS_API_KEY=
AMADEUS_API_SECRET=

# Payment Processing
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)

1. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository: `jbandu/travel-assistant`
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables:**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all required variables from above
   - Make sure to add them for Production, Preview, and Development

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy

4. **Verify:**
   - Visit your deployment URL
   - Test login with: jbandu@gmail.com / Password@123!
   - Check Trip Planning Agent works

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Build Configuration

The project includes:
- `vercel.json` - Vercel configuration
- `next.config.ts` - Next.js standalone output mode
- `.vercelignore` - Files to exclude from deployment

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Login/logout functionality
- [ ] Trip Planning Agent responding
- [ ] Real-time stats showing on dashboard
- [ ] SSL/HTTPS enabled (automatic with Vercel)

## Database Setup

Your Neon database is already configured and seeded with admin users:
- jbandu@gmail.com / Password@123!
- arindam2808@gmail.com / Password@123!

No additional database setup needed!

## Troubleshooting

### Build Fails

**Issue:** "No Output Directory named 'public' found"
**Solution:** Ensure `vercel.json` exists with correct configuration (already added)

**Issue:** Environment variables not found
**Solution:** Add variables in Vercel Dashboard → Settings → Environment Variables

### Runtime Errors

**Issue:** Database connection fails
**Solution:**
- Verify DATABASE_URL in Vercel environment variables
- Ensure Neon database is not paused
- Check connection string format

**Issue:** Login not working
**Solution:**
- Verify JWT_SECRET is set in Vercel
- Check that cookies are enabled
- Ensure HTTPS is working (required for secure cookies)

### Performance Issues

**Issue:** Cold starts (first request slow)
**Solution:**
- Vercel Hobby plan has cold starts
- Upgrade to Pro for faster cold start performance
- Use edge functions for critical paths (future optimization)

## Monitoring

### Vercel Analytics
- Automatically enabled for all deployments
- View in Vercel Dashboard → Analytics

### Error Tracking
Add Sentry (optional):
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update NEXT_PUBLIC_APP_URL environment variable

## Continuous Deployment

Vercel automatically deploys:
- **Production:** When you push to `main` branch
- **Preview:** When you create a pull request

## Rollback

If deployment has issues:
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

## Security Notes

### Production Checklist:
- [ ] Change JWT_SECRET to strong random string (not the dev value!)
- [ ] Enable CORS restrictions if needed
- [ ] Add rate limiting (consider Vercel's Edge Middleware)
- [ ] Enable Vercel's DDoS protection
- [ ] Review authentication flows
- [ ] Test all API endpoints

### Recommended JWT_SECRET Generation:
```bash
# Generate random string
openssl rand -base64 32
```

## Scaling

Vercel automatically scales based on traffic:
- **Hobby Plan:** Up to 100GB bandwidth
- **Pro Plan:** Unlimited bandwidth, better performance
- **Enterprise:** Custom limits and SLAs

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: support@vercel.com (Pro/Enterprise)
- Community: https://github.com/vercel/vercel/discussions

---

**Ready to deploy!** 🚀

Your app is configured for seamless Vercel deployment with auto-scaling and zero-downtime updates.
