#!/bin/bash
# Run CI/CD Tests Locally
# This script mimics the GitHub Actions workflow (.github/workflows/ci.yml)
# Run: bash scripts/run-ci-locally.sh

set -e  # Exit on error

echo "🚀 Running CI/CD Pipeline Locally..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check dependencies
echo -e "${YELLOW}📦 Step 1: Installing dependencies...${NC}"
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Generate Prisma Client
echo -e "${YELLOW}🔧 Step 2: Generating Prisma Client...${NC}"
npm run db:generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# Step 3: Run linter
echo -e "${YELLOW}🔍 Step 3: Running linter...${NC}"
npm run lint
echo -e "${GREEN}✓ Linting passed${NC}"
echo ""

# Step 4: Type check (optional but recommended)
echo -e "${YELLOW}📝 Step 4: Type checking...${NC}"
npx tsc --noEmit
echo -e "${GREEN}✓ Type check passed${NC}"
echo ""

# Step 5: Database setup (using your existing Neon database)
echo -e "${YELLOW}💾 Step 5: Setting up database...${NC}"
npm run db:push
echo -e "${GREEN}✓ Database schema pushed${NC}"
echo ""

# Step 6: Seed database
echo -e "${YELLOW}🌱 Step 6: Seeding database...${NC}"
npm run db:seed
echo -e "${GREEN}✓ Database seeded${NC}"
echo ""

# Step 7: Install Playwright browsers (if not already installed)
echo -e "${YELLOW}🎭 Step 7: Installing Playwright browsers...${NC}"
npx playwright install --with-deps chromium
echo -e "${GREEN}✓ Playwright browsers installed${NC}"
echo ""

# Step 8: Run integration tests
echo -e "${YELLOW}🧪 Step 8: Running API integration tests...${NC}"
npm run test:integration
echo -e "${GREEN}✓ Integration tests passed${NC}"
echo ""

# Step 9: Run E2E tests
echo -e "${YELLOW}🎭 Step 9: Running E2E tests...${NC}"
echo -e "${YELLOW}   Testing against localhost:3001...${NC}"

# Check if dev server is running
if ! curl -s http://localhost:3001 > /dev/null; then
    echo -e "${RED}⚠️  Dev server not running on localhost:3001${NC}"
    echo -e "${YELLOW}   Starting dev server in background...${NC}"
    npm run dev &
    DEV_SERVER_PID=$!
    sleep 5
    CLEANUP_SERVER=true
else
    echo -e "${GREEN}   Dev server already running${NC}"
    CLEANUP_SERVER=false
fi

# Run E2E tests against local server
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001 npm test

echo -e "${GREEN}✓ E2E tests passed${NC}"
echo ""

# Cleanup: Kill dev server if we started it
if [ "$CLEANUP_SERVER" = true ]; then
    echo -e "${YELLOW}🧹 Cleaning up: Stopping dev server...${NC}"
    kill $DEV_SERVER_PID 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}🎉 All CI/CD checks passed successfully!${NC}"
echo -e "${GREEN}✅ Your code is ready to commit and push!${NC}"
