# Local Testing Guide - Run GitHub Actions Locally

This guide shows you how to run the same tests that GitHub Actions runs, but on your local machine **before** committing code.

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Method 1: Using the Local CI Script](#method-1-using-the-local-ci-script-recommended)
3. [Method 2: Using `act` Tool](#method-2-using-act-tool-exact-github-actions-replication)
4. [Method 3: Individual Test Commands](#method-3-individual-test-commands)
5. [Troubleshooting](#troubleshooting)

---

## Quick Start

The fastest way to run all CI checks:

```bash
# Make the script executable (one time only)
chmod +x scripts/run-ci-locally.sh

# Run all CI checks
bash scripts/run-ci-locally.sh
```

---

## Method 1: Using the Local CI Script (Recommended)

We've created a script that mirrors the GitHub Actions workflow.

### Features
- ✅ Runs all the same steps as GitHub Actions
- ✅ Uses your local Neon database
- ✅ Tests against your local development server
- ✅ Colored output for easy reading
- ✅ Automatic cleanup

### Usage

```bash
# One-time setup: Make executable
chmod +x scripts/run-ci-locally.sh

# Run the full CI pipeline
bash scripts/run-ci-locally.sh
```

### What it runs:
1. ✓ Install dependencies (`npm ci`)
2. ✓ Generate Prisma Client
3. ✓ Run linter
4. ✓ TypeScript type checking
5. ✓ Database schema push
6. ✓ Seed database
7. ✓ Install Playwright browsers
8. ✓ Run integration tests
9. ✓ Run E2E tests (against localhost:3001)

---

## Method 2: Using `act` Tool (Exact GitHub Actions Replication)

`act` allows you to run GitHub Actions workflows locally using Docker.

### Installation

**macOS:**
```bash
brew install act
```

**Linux:**
```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

**Windows (WSL):**
```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
```

### Usage

```bash
# Run the entire workflow
act push

# Run only the test job
act -j test

# Run with specific secrets
act -s ANTHROPIC_API_KEY=your-key-here

# Dry run (see what would run)
act -n
```

### Create `.actrc` config file (optional)

Create a file `.actrc` in your project root:

```bash
# .actrc
-P ubuntu-latest=catthehacker/ubuntu:act-latest
--secret-file .env
```

This tells `act` to:
- Use a specific Docker image
- Load secrets from your `.env` file

---

## Method 3: Individual Test Commands

Run tests step-by-step to debug specific issues.

### 1. Linting
```bash
npm run lint
```

### 2. Type Checking
```bash
npx tsc --noEmit
```

### 3. Database Setup
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed test data
npm run db:seed
```

### 4. Integration Tests
```bash
# Run API integration tests
npm run test:integration
```

### 5. E2E Tests (Playwright)

**Option A: Headless Mode (CI-like)**
```bash
# Make sure dev server is running on localhost:3001
npm run dev  # In one terminal

# Run E2E tests in another terminal
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001 npm test
```

**Option B: Interactive UI Mode**
```bash
npm run test:ui
```

**Option C: Headed Mode (See browser)**
```bash
npm run test:headed
```

**Option D: Debug Mode**
```bash
npm run test:debug
```

### 6. View Test Reports
```bash
npm run test:report
```

---

## Pre-commit Checklist

Before committing code, run these commands:

```bash
# 1. Lint your code
npm run lint

# 2. Type check
npx tsc --noEmit

# 3. Run integration tests
npm run test:integration

# 4. Run E2E tests (dev server must be running)
npm test
```

**Or run everything at once:**
```bash
bash scripts/run-ci-locally.sh
```

---

## NPM Scripts Reference

These are all the test-related scripts in `package.json`:

```json
{
  "scripts": {
    // Linting
    "lint": "next lint",

    // Testing
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report",
    "test:integration": "tsx test-api-integrations.ts",

    // Database
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

---

## Environment Variables

Tests need certain environment variables. They're loaded from `.env`:

```bash
# Required for tests
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
AMADEUS_API_KEY=...
AMADEUS_API_SECRET=...
# ... etc
```

GitHub Actions has these as **secrets**, but locally they come from your `.env` file.

---

## Troubleshooting

### Issue: "Playwright browsers not found"
```bash
# Install Playwright browsers
npx playwright install --with-deps chromium
```

### Issue: "Cannot connect to database"
Check your `DATABASE_URL` in `.env` is correct.

### Issue: "Port 3001 already in use"
```bash
# Kill the process using port 3001
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm run dev
```

### Issue: "Tests fail but CI passes"
Make sure you're testing against the same URL:
```bash
# CI tests against Vercel deployment
PLAYWRIGHT_TEST_BASE_URL=https://travel-assistant-eight.vercel.app npm test

# Local tests against dev server
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001 npm test
```

### Issue: "Integration tests fail with 401"
API keys might be missing or incorrect in `.env`

---

## Continuous Integration Workflow

Here's what happens when you push to GitHub:

```
1. Code pushed to GitHub
   ↓
2. GitHub Actions triggered
   ↓
3. Ubuntu VM spins up
   ↓
4. PostgreSQL service starts
   ↓
5. Dependencies installed (npm ci)
   ↓
6. Prisma Client generated
   ↓
7. Linting runs
   ↓
8. Playwright browsers installed
   ↓
9. Test database setup & seeded
   ↓
10. Integration tests run
   ↓
11. E2E tests run (against Vercel deployment)
   ↓
12. Test reports uploaded as artifacts
   ↓
13. ✅ Build succeeds or ❌ fails
```

By running `scripts/run-ci-locally.sh`, you replicate steps 5-11 locally.

---

## Advanced: Docker-based Testing

If you want an environment identical to GitHub Actions:

### Create `docker-compose.test.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 10s
      timeout: 5s
      retries: 5

  test-runner:
    build: .
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/test_db
    command: npm test
```

### Run with Docker:
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

---

## Best Practices

1. **Always run tests locally before pushing**
   ```bash
   bash scripts/run-ci-locally.sh && git push
   ```

2. **Set up a pre-commit hook** (optional)
   Create `.git/hooks/pre-commit`:
   ```bash
   #!/bin/bash
   npm run lint || exit 1
   npx tsc --noEmit || exit 1
   ```

3. **Use `act` for final verification**
   ```bash
   act -j test  # Runs exactly like GitHub Actions
   ```

4. **Check test reports**
   ```bash
   npm run test:report  # View Playwright HTML report
   ```

---

## Summary

**Quick daily use:**
```bash
# Run everything
bash scripts/run-ci-locally.sh
```

**Exact GitHub Actions replication:**
```bash
# One-time install
brew install act  # or curl install

# Run
act push
```

**Individual debugging:**
```bash
npm run lint
npm run test:integration
npm run test:ui  # Interactive E2E
```

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [`act` Documentation](https://github.com/nektos/act)
- [Playwright Documentation](https://playwright.dev)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Happy Testing! 🧪**
