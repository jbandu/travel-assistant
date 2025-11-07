# Testing Guide

## Overview

The Travel Assistant uses **Playwright** for end-to-end testing, ensuring all user flows work correctly across browsers and devices.

## Test Structure

```
tests/
└── e2e/
    ├── auth.spec.ts              # Authentication tests
    ├── dashboard.spec.ts         # Dashboard functionality
    └── trip-planning-agent.spec.ts # AI agent chat tests
```

## Running Tests

### Local Development

```bash
# Run all tests (headless)
npm test

# Run tests with UI (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug specific test
npm run test:debug

# View last test report
npm run test:report
```

### Test Specific Files

```bash
# Run auth tests only
npx playwright test auth

# Run trip planning agent tests
npx playwright test trip-planning

# Run dashboard tests
npx playwright test dashboard
```

### CI/CD

Tests run automatically on:
- **Push to main/develop** - Full test suite + deploy
- **Pull requests** - Full test suite + preview deployment

## Test Coverage

### ✅ Authentication (`auth.spec.ts`)
- Redirect to login when not authenticated
- Login with valid credentials
- Error handling for invalid credentials
- Logout functionality

### ✅ Dashboard (`dashboard.spec.ts`)
- Welcome message display
- Statistics cards (Trips, Bookings, Conversations)
- Feature cards with proper states
- Navigation to Trip Planning Agent
- Navigation to Trips list
- Mobile responsiveness

### ✅ Trip Planning Agent (`trip-planning-agent.spec.ts`)
- Navigation from dashboard
- Quick start buttons functionality
- Send message and receive AI response
- Quick start auto-message
- Loading indicators
- Auto-scroll to latest message
- New conversation functionality
- Mobile responsiveness
- Back navigation

## Writing New Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Login or setup
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jbandu@gmail.com');
    await page.fill('input[type="password"]', 'Password@123!');
    await page.click('button[type="submit"]');
  });

  test('should do something', async ({ page }) => {
    // Navigate
    await page.goto('/some-page');

    // Interact
    await page.click('button');

    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use meaningful test names**
   ```typescript
   // Good
   test('should show error when email is invalid')

   // Bad
   test('test 1')
   ```

2. **Wait for elements properly**
   ```typescript
   // Good - waits automatically
   await expect(page.locator('text=Result')).toBeVisible();

   // Avoid - fragile
   await page.waitForTimeout(1000);
   ```

3. **Use data-testid for dynamic content**
   ```typescript
   // In component
   <button data-testid="submit-button">Submit</button>

   // In test
   await page.click('[data-testid="submit-button"]');
   ```

4. **Test user flows, not implementation**
   ```typescript
   // Good - tests what user does
   test('should create trip from agent conversation', async ({ page }) => {
     await page.goto('/trips/plan');
     await page.fill('textarea', 'Plan beach vacation');
     await page.click('button:has-text("Send")');
     await page.click('button:has-text("Save Trip")');
     await expect(page).toHaveURL(/\/trips\/\d+/);
   });

   // Bad - tests implementation details
   test('should call createTrip API', async ({ page }) => {
     // Testing internal API calls
   });
   ```

## Debugging Tests

### Visual Debugging

```bash
# Open Playwright Inspector
npm run test:debug

# Run specific test with inspector
npx playwright test auth --debug
```

### Screenshots and Videos

Tests automatically capture:
- **Screenshots** on failure
- **Videos** on failure (if configured)
- **Traces** on first retry

View in test report:
```bash
npm run test:report
```

## CI/CD Integration

### GitHub Actions Workflow

Located at: `.github/workflows/ci.yml`

**Runs on:**
- Push to `main` or `develop`
- Pull requests

**Steps:**
1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ Install dependencies
4. ✅ Run linter
5. ✅ Build application
6. ✅ Setup test database
7. ✅ Run Playwright tests
8. ✅ Upload test results
9. ✅ Deploy to Vercel

### Required GitHub Secrets

Configure in **Settings → Secrets and variables → Actions**:

```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

### Get Vercel Tokens

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Get org and project IDs
vercel project ls

# Generate token
# Go to: https://vercel.com/account/tokens
# Create new token with name: "GitHub Actions"
```

## Test Configuration

### `playwright.config.ts`

```typescript
{
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'Mobile Chrome', use: devices['Pixel 5'] },
  ],
}
```

## Troubleshooting

### Tests Timeout

**Issue:** Tests take longer than 30 seconds
```typescript
// Increase timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

### Element Not Found

**Issue:** `locator.click: Target closed`

**Solution:** Wait for navigation
```typescript
await Promise.all([
  page.waitForNavigation(),
  page.click('button'),
]);
```

### Database State

**Issue:** Tests fail due to existing data

**Solution:** Reset database between tests
```typescript
test.beforeEach(async () => {
  // Clear test data
  await prisma.trip.deleteMany();
  await prisma.conversation.deleteMany();
});
```

### CI Tests Pass Locally But Fail on GitHub

**Check:**
1. Environment variables set correctly
2. Database migrations run
3. Correct Node.js version
4. Dependencies installed with `npm ci`

## Performance

### Test Execution Time

Current test suite:
- **Auth tests:** ~15 seconds
- **Dashboard tests:** ~20 seconds
- **Trip Planning Agent:** ~30 seconds
- **Total:** ~65 seconds (without parallelization)

### Optimization Tips

1. **Run tests in parallel**
   ```typescript
   // In playwright.config.ts
   fullyParallel: true,
   workers: process.env.CI ? 1 : 4,
   ```

2. **Reuse authentication**
   ```typescript
   // Save auth state
   await context.storageState({ path: 'auth.json' });

   // Reuse in tests
   use: { storageState: 'auth.json' }
   ```

3. **Mock external APIs**
   ```typescript
   await page.route('**/api/external/**', route => {
     route.fulfill({ json: mockData });
   });
   ```

## Next Steps

### Add Tests For:
- [ ] Flight Search (coming soon)
- [ ] Hotel Search (coming soon)
- [ ] Booking flow
- [ ] Trip detail pages
- [ ] Profile settings

### Advanced Testing:
- [ ] Visual regression testing (Percy/Chromatic)
- [ ] Performance testing (Lighthouse CI)
- [ ] Accessibility testing (axe-playwright)
- [ ] Load testing (k6)

---

**Happy Testing!** 🧪

For questions or issues, check:
- Playwright docs: https://playwright.dev
- GitHub Issues: https://github.com/jbandu/travel-assistant/issues
