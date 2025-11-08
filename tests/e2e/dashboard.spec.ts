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
    await expect(page.locator('text=Jayaprakash').first()).toBeVisible();
  });

  test('should show statistics cards', async ({ page }) => {
    // Check for stat cards - use more specific selectors to avoid strict mode violations
    await expect(page.locator('text=Total Trips').first()).toBeVisible();
    await expect(page.locator('p.uppercase:has-text("Bookings")')).toBeVisible();
    await expect(page.locator('text=Conversations').first()).toBeVisible();
    await expect(page.locator('text=Favorites').first()).toBeVisible();
  });

  test('should show feature cards', async ({ page }) => {
    await expect(page.locator('text=Plan Trip').first()).toBeVisible();
    await expect(page.locator('text=My Trips').first()).toBeVisible();
    await expect(page.locator('text=Search Flights').first()).toBeVisible();
    await expect(page.locator('text=Find Hotels').first()).toBeVisible();
  });

  test('should show new features live banner', async ({ page }) => {
    await expect(page.locator('text=/New Features Now Live/i')).toBeVisible();
    await expect(page.locator('a:has-text("Plan Trip")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Search Flights")').first()).toBeVisible();
  });

  test('Plan Trip button should navigate to trip planning', async ({ page }) => {
    // Use specific link selector to avoid clicking banner button
    await page.click('a[href="/trips/plan"]:has-text("Start Planning")');
    await expect(page).toHaveURL(/\/trips\/plan/);
  });

  test('My Trips button should navigate to trips list', async ({ page }) => {
    await page.click('a[href="/trips"]:has-text("View Trips")');
    await expect(page).toHaveURL(/\/trips$/);
  });

  test('Search Flights button should navigate to flight search', async ({ page }) => {
    // Click feature card, not banner - use more specific selector
    await page.locator('a[href="/flights/search"]:has-text("Search Flights")').first().click();
    await expect(page).toHaveURL(/\/flights\/search/);
  });

  test('Coming Soon features should be disabled', async ({ page }) => {
    // Only Local Experiences should have "Coming Soon" - Find Hotels is now active
    const localExperiences = page.locator('text=Local Experiences').locator('..');
    await expect(localExperiences.locator('button:has-text("Coming Soon")')).toBeDisabled();
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Key elements should still be visible
    await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    await expect(page.locator('text=Total Trips')).toBeVisible();
  });
});
