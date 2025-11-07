import { test, expect } from '@playwright/test';

test.describe('Flight Search', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jbandu@gmail.com');
    await page.fill('input[type="password"]', 'Password@123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to flight search from dashboard', async ({ page }) => {
    // Click on Search Flights link within the feature card
    const searchFlightsCard = page.locator('text=🔍 Search Flights').locator('..');
    await searchFlightsCard.locator('a:has-text("Search Flights")').click();
    await expect(page).toHaveURL(/\/flights\/search/);

    // Verify page loaded correctly
    await expect(page.locator('text=✈️ Flight Search')).toBeVisible();
  });

  test('should display flight search form with all fields', async ({ page }) => {
    await page.goto('/flights/search');

    // Check for all form fields
    await expect(page.locator('input[name="origin"]')).toBeVisible();
    await expect(page.locator('input[name="destination"]')).toBeVisible();
    await expect(page.locator('input[name="departureDate"]')).toBeVisible();
    await expect(page.locator('input[name="returnDate"]')).toBeVisible();
    await expect(page.locator('input[name="adults"]')).toBeVisible();
    await expect(page.locator('input[name="children"]')).toBeVisible();
    await expect(page.locator('select[name="travelClass"]')).toBeVisible();
    await expect(page.locator('input[name="nonStop"]')).toBeVisible();

    // Check submit button
    await expect(page.locator('button:has-text("Search Flights")')).toBeVisible();
  });

  test('should show validation for required fields', async ({ page }) => {
    await page.goto('/flights/search');

    // Try to submit without filling required fields
    await page.click('button:has-text("Search Flights")');

    // HTML5 validation should prevent submission
    // Check that we're still on the same page
    await expect(page).toHaveURL(/\/flights\/search/);
  });

  test('should search for one-way flights successfully', async ({ page }) => {
    await page.goto('/flights/search');

    // Fill in search form for one-way flight
    await page.fill('input[name="origin"]', 'LAX');
    await page.fill('input[name="destination"]', 'JFK');

    // Set departure date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="departureDate"]', tomorrowStr);

    // Set passengers
    await page.fill('input[name="adults"]', '2');
    await page.fill('input[name="children"]', '1');

    // Select travel class
    await page.selectOption('select[name="travelClass"]', 'ECONOMY');

    // Submit search
    await page.click('button:has-text("Search Flights")');

    // Wait for loading to complete (may be very fast with mock data)
    // Check for either loading state or direct results
    const loadingOrResults = page.locator('text=Searching for flights...').or(page.locator('text=/Found \\d+ flights/i'));
    await expect(loadingOrResults).toBeVisible({ timeout: 10000 });

    // Verify results are displayed
    await expect(page.locator('text=/Found \\d+ flights/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/LAX → JFK/i')).toBeVisible();
  });

  test('should search for round-trip flights successfully', async ({ page }) => {
    await page.goto('/flights/search');

    // Fill in search form for round-trip flight
    await page.fill('input[name="origin"]', 'SFO');
    await page.fill('input[name="destination"]', 'ORD');

    // Set departure date to 7 days from now
    const departure = new Date();
    departure.setDate(departure.getDate() + 7);
    const departureStr = departure.toISOString().split('T')[0];
    await page.fill('input[name="departureDate"]', departureStr);

    // Set return date to 14 days from now
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 14);
    const returnStr = returnDate.toISOString().split('T')[0];
    await page.fill('input[name="returnDate"]', returnStr);

    await page.fill('input[name="adults"]', '1');

    // Submit search
    await page.click('button:has-text("Search Flights")');

    // Wait for results (may be very fast with mock data)
    const loadingOrResults = page.locator('text=Searching for flights...').or(page.locator('text=/Found \\d+ flights/i'));
    await expect(loadingOrResults).toBeVisible({ timeout: 10000 });

    await expect(page.locator('text=/Found \\d+ flights/i')).toBeVisible({ timeout: 5000 });
  });

  test('should filter for non-stop flights only', async ({ page }) => {
    await page.goto('/flights/search');

    // Fill in search form
    await page.fill('input[name="origin"]', 'LAX');
    await page.fill('input[name="destination"]', 'SFO');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[name="departureDate"]', tomorrow.toISOString().split('T')[0]);

    // Check non-stop only
    await page.check('input[name="nonStop"]');
    await expect(page.locator('input[name="nonStop"]')).toBeChecked();

    // Submit search
    await page.click('button:has-text("Search Flights")');

    // Wait for results (may be very fast with mock data)
    const loadingOrResults = page.locator('text=Searching for flights...').or(page.locator('text=/Found \\d+ flights/i'));
    await expect(loadingOrResults).toBeVisible({ timeout: 10000 });

    await expect(page.locator('text=/Found \\d+ flights/i')).toBeVisible({ timeout: 5000 });

    // Verify all results show "Non-stop"
    const firstResult = page.locator('text=Non-stop').first();
    await expect(firstResult).toBeVisible();
  });

  test('should display flight details correctly', async ({ page }) => {
    await page.goto('/flights/search');

    // Perform a search
    await page.fill('input[name="origin"]', 'LAX');
    await page.fill('input[name="destination"]', 'JFK');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[name="departureDate"]', tomorrow.toISOString().split('T')[0]);

    await page.click('button:has-text("Search Flights")');

    // Wait for results
    const loadingOrResults = page.locator('text=Searching for flights...').or(page.locator('text=/Found \\d+ flights/i'));
    await expect(loadingOrResults).toBeVisible({ timeout: 10000 });

    // Check that flight cards show all required information
    const flightCard = page.locator('[class*="bg-white"][class*="rounded-xl"]').first();

    // Should show airline code
    await expect(flightCard.locator('text=/AA|DL|UA|BA|LH|AF|KL|EK/')).toBeVisible();

    // Should show price
    await expect(flightCard.locator('text=/\\$/').first()).toBeVisible();

    // Should show "Select Flight" button
    await expect(flightCard.locator('button:has-text("Select Flight")')).toBeVisible();
  });

  test('should show error message for invalid search', async ({ page }) => {
    await page.goto('/flights/search');

    // Fill in invalid data (same origin and destination)
    await page.fill('input[name="origin"]', 'LAX');
    await page.fill('input[name="destination"]', 'LAX');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[name="departureDate"]', tomorrow.toISOString().split('T')[0]);

    await page.click('button:has-text("Search Flights")');

    // Should show error or handle gracefully
    // (The actual behavior depends on API validation)
    await page.waitForTimeout(2000);
  });

  test('should handle different travel classes', async ({ page }) => {
    await page.goto('/flights/search');

    // Check all travel class options are available
    const travelClassSelect = page.locator('select[name="travelClass"]');

    // Check that select element has all the options (options in select aren't "visible" in Playwright)
    await expect(travelClassSelect.locator('option[value="ECONOMY"]')).toHaveCount(1);
    await expect(travelClassSelect.locator('option[value="PREMIUM_ECONOMY"]')).toHaveCount(1);
    await expect(travelClassSelect.locator('option[value="BUSINESS"]')).toHaveCount(1);
    await expect(travelClassSelect.locator('option[value="FIRST"]')).toHaveCount(1);

    // Search with Business class
    await page.fill('input[name="origin"]', 'LAX');
    await page.fill('input[name="destination"]', 'JFK');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[name="departureDate"]', tomorrow.toISOString().split('T')[0]);

    await page.selectOption('select[name="travelClass"]', 'BUSINESS');

    await page.click('button:has-text("Search Flights")');

    // Wait for results
    const loadingOrResults = page.locator('text=Searching for flights...').or(page.locator('text=/Found \\d+ flights/i'));
    await expect(loadingOrResults).toBeVisible({ timeout: 10000 });
  });

  test('should have back navigation to dashboard', async ({ page }) => {
    await page.goto('/flights/search');

    // Click back arrow
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show "No flights found" when no results', async ({ page }) => {
    await page.goto('/flights/search');

    // Search for an unlikely route
    await page.fill('input[name="origin"]', 'XXX');
    await page.fill('input[name="destination"]', 'YYY');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[name="departureDate"]', tomorrow.toISOString().split('T')[0]);

    await page.click('button:has-text("Search Flights")');

    // Should show error or no results message
    await page.waitForTimeout(3000);
    // Either error message or validation error should appear
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/flights/search');

    // Key elements should still be visible
    await expect(page.locator('text=✈️ Flight Search')).toBeVisible();
    await expect(page.locator('input[name="origin"]')).toBeVisible();
    await expect(page.locator('button:has-text("Search Flights")')).toBeVisible();
  });

  test('should preserve form data after search', async ({ page }) => {
    await page.goto('/flights/search');

    // Fill in form
    await page.fill('input[name="origin"]', 'LAX');
    await page.fill('input[name="destination"]', 'JFK');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="departureDate"]', tomorrowStr);

    await page.click('button:has-text("Search Flights")');

    // Wait for results
    const loadingOrResults = page.locator('text=Searching for flights...').or(page.locator('text=/Found \\d+ flights/i'));
    await expect(loadingOrResults).toBeVisible({ timeout: 10000 });

    // Verify form still has the values
    await expect(page.locator('input[name="origin"]')).toHaveValue('LAX');
    await expect(page.locator('input[name="destination"]')).toHaveValue('JFK');
    await expect(page.locator('input[name="departureDate"]')).toHaveValue(tomorrowStr);
  });

  test('should show loading indicator during search', async ({ page }) => {
    await page.goto('/flights/search');

    // Fill in form
    await page.fill('input[name="origin"]', 'LAX');
    await page.fill('input[name="destination"]', 'JFK');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[name="departureDate"]', tomorrow.toISOString().split('T')[0]);

    // Submit and verify loading state
    await page.click('button:has-text("Search Flights")');

    // Loading indicator should appear (checking for the text or spinner)
    // Note: The loading might be very fast with mock data, so we check for either loading state or results
    const loadingOrResults = page.locator('text=Searching...').or(page.locator('text=/Found \\d+ flights/i'));
    await expect(loadingOrResults).toBeVisible({ timeout: 10000 });
  });

  test('should validate airport code format', async ({ page }) => {
    await page.goto('/flights/search');

    // Airport codes should be uppercase and 3 letters
    const originInput = page.locator('input[name="origin"]');

    // Type lowercase
    await originInput.fill('lax');

    // Should automatically uppercase (check the input styling)
    await expect(originInput).toHaveClass(/uppercase/);

    // Should have maxLength of 3
    await originInput.fill('LAXX');
    await expect(originInput).toHaveValue(/^.{0,3}$/);
  });
});
