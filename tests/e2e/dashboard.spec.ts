import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jbandu@gmail.com');
    await page.fill('input[type="password"]', 'Password@123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    await expect(page.locator('text=Jayaprakash')).toBeVisible();
  });

  test('should show statistics cards', async ({ page }) => {
    // Check for stat cards
    await expect(page.locator('text=Total Trips')).toBeVisible();
    await expect(page.locator('text=Bookings')).toBeVisible();
    await expect(page.locator('text=Conversations')).toBeVisible();
    await expect(page.locator('text=Favorites')).toBeVisible();
  });

  test('should show feature cards', async ({ page }) => {
    await expect(page.locator('text=Plan Trip')).toBeVisible();
    await expect(page.locator('text=My Trips')).toBeVisible();
    await expect(page.locator('text=Search Flights')).toBeVisible();
    await expect(page.locator('text=Find Hotels')).toBeVisible();
  });

  test('should show Trip Planning Agent live banner', async ({ page }) => {
    await expect(page.locator('text=/Trip Planning Agent is Now Live/i')).toBeVisible();
    await expect(page.locator('a:has-text("Try Trip Planning Agent")')).toBeVisible();
  });

  test('Plan Trip button should navigate to trip planning', async ({ page }) => {
    await page.click('text=/Start Planning/i');
    await expect(page).toHaveURL(/\/trips\/plan/);
  });

  test('My Trips button should navigate to trips list', async ({ page }) => {
    await page.click('text=/View Trips/i');
    await expect(page).toHaveURL(/\/trips$/);
  });

  test('Coming Soon features should be disabled', async ({ page }) => {
    const searchFlights = page.locator('text=Search Flights').locator('..');
    await expect(searchFlights.locator('button:has-text("Coming Soon")')).toBeDisabled();

    const findHotels = page.locator('text=Find Hotels').locator('..');
    await expect(findHotels.locator('button:has-text("Coming Soon")')).toBeDisabled();
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Key elements should still be visible
    await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    await expect(page.locator('text=Total Trips')).toBeVisible();
  });
});
