# Travel Assistant - Setup Guide

## Prerequisites

- **Node.js** 18.x or higher (for backend services)
- **Python** 3.10+ (for AI/ML components)
- **PostgreSQL** 14+ (provided via Neon)
- **Redis** 6+ (for caching and session management)
- **Git** for version control

## Database Configuration

This project uses **Neon** as the serverless PostgreSQL database.

### Connection String
Your Neon database connection string has been provided:
```
postgresql://neondb_owner:npg_mXj1qakz8wdu@ep-muddy-pond-ader93vt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/jbandu/travel-assistant.git
   cd travel-assistant
   ```

2. **Create environment configuration**
   ```bash
   cp .env.example .env
   ```

3. **Configure database connection**
   Edit `.env` and add your Neon connection string:
   ```bash
   DATABASE_URL=postgresql://neondb_owner:npg_mXj1qakz8wdu@ep-muddy-pond-ader93vt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

4. **Install dependencies**

   For Node.js backend:
   ```bash
   npm install
   ```

   For Python AI components:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   # or
   python manage.py migrate
   ```

6. **Seed initial data (optional)**
   ```bash
   npm run seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

## API Keys Setup

The following API keys are required for full functionality:

### Essential (MVP)
- **OpenAI or Anthropic API Key** - For LLM-powered agents
- **Amadeus Travel API** - For flight and hotel search
- **Stripe** - For payment processing

### Optional (Post-MVP)
- **Google Maps API** - For location services
- **Viator/GetYourGuide** - For activity bookings
- **Twilio** - For SMS notifications
- **SendGrid** - For email notifications
- **FlightAware** - For real-time flight status

### Obtaining API Keys

#### 1. OpenAI API
- Sign up at https://platform.openai.com
- Navigate to API Keys section
- Create new secret key
- Add to `.env` as `OPENAI_API_KEY`

#### 2. Anthropic API (Alternative to OpenAI)
- Sign up at https://console.anthropic.com
- Create API key
- Add to `.env` as `ANTHROPIC_API_KEY`

#### 3. Amadeus Travel API
- Register at https://developers.amadeus.com
- Create application to get API Key and Secret
- Add to `.env`:
  ```
  AMADEUS_API_KEY=your_key
  AMADEUS_API_SECRET=your_secret
  ```

#### 4. Stripe
- Sign up at https://stripe.com
- Get test API keys from Dashboard
- Add to `.env`:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```

## Database Schema Setup

### Initial Migration
The first migration will create the following core tables:
- `users` - User accounts and authentication
- `user_profiles` - Extended user preferences and Customer 360 data
- `trips` - Trip planning and itinerary data
- `bookings` - Flight, hotel, and activity bookings
- `conversations` - Chat history with AI agents
- `notifications` - User notification queue

### Running Migrations
```bash
# Check migration status
npm run migrate:status

# Run pending migrations
npm run migrate:up

# Rollback last migration (if needed)
npm run migrate:down
```

## Testing Database Connection

Test your Neon database connection:

```bash
# Using psql client
psql 'postgresql://neondb_owner:npg_mXj1qakz8wdu@ep-muddy-pond-ader93vt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# Or using Node.js test script
npm run test:db
```

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `sprint/*` - Sprint-specific branches

### Creating a Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/trip-planning-agent
```

### Commit Convention
Follow conventional commits:
```
feat: Add trip planning conversation flow
fix: Resolve booking confirmation email bug
docs: Update API documentation
test: Add unit tests for Search Agent
refactor: Optimize flight search algorithm
```

## Project Structure
```
travel-assistant/
├── backend/
│   ├── agents/           # AI agent implementations
│   │   ├── trip_planning/
│   │   ├── search_booking/
│   │   ├── experience/
│   │   ├── support/
│   │   └── customer360/
│   ├── api/              # REST API endpoints
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── frontend/
│   ├── components/       # React components
│   ├── pages/            # Next.js pages
│   ├── hooks/            # Custom React hooks
│   └── styles/           # CSS/styling
├── migrations/           # Database migrations
├── tests/                # Test suites
├── docs/                 # Documentation
├── .env.example          # Environment template
├── REQUIREMENTS.md       # Product requirements
└── README.md             # Project overview
```

## Next Steps

1. Review `REQUIREMENTS.md` for full product backlog
2. Set up your development environment
3. Configure all required API keys
4. Run the test suite to verify setup
5. Join the team Slack/Discord channel
6. Attend sprint planning meeting

## Troubleshooting

### Database Connection Issues
- Verify Neon database is active (not paused)
- Check connection string format
- Ensure SSL mode is enabled
- Verify IP whitelist settings in Neon dashboard

### API Key Issues
- Confirm API keys are valid and not expired
- Check API rate limits and quotas
- Verify environment variables are loaded correctly

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `npm run clean`
- Check Node.js version: `node --version`

## Support

- **Documentation**: See `/docs` folder
- **Issues**: https://github.com/jbandu/travel-assistant/issues
- **Email**: jayaprakash.bandu@[domain].com

---

**Ready to start building the future of travel!** 🚀
