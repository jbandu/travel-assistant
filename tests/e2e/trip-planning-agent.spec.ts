import { test, expect } from '@playwright/test';

test.describe('Trip Planning Agent', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jbandu@gmail.com');
    await page.fill('input[type="password"]', 'Password@123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to trip planning agent from dashboard', async ({ page }) => {
    // Click on Plan Trip button
    await page.click('text=/Plan Trip|Start Planning/i');

    // Should navigate to trip planning page
    await expect(page).toHaveURL(/\/trips\/plan/);

    // Should show chat interface
    await expect(page.locator('text=Trip Planning Agent')).toBeVisible();
  });

  test('should show quick start buttons', async ({ page }) => {
    await page.goto('/trips/plan');

    // Check for quick start buttons
    await expect(page.locator('text=Beach Vacation')).toBeVisible();
    await expect(page.locator('text=Budget Travel')).toBeVisible();
    await expect(page.locator('text=Adventure Travel')).toBeVisible();
    await expect(page.locator('text=Cultural Experience')).toBeVisible();
  });

  test('should send message and receive AI response', async ({ page }) => {
    await page.goto('/trips/plan');

    // Type message
    const input = page.locator('textarea[placeholder*="Describe your ideal trip"]');
    await input.fill('I want to plan a beach vacation with a budget of $2000');

    // Send message
    await page.click('button:has(svg)'); // Send button with icon

    // Wait for AI response
    await expect(page.locator('text=/Lisbon|Bangkok|Mexico City|beach|budget/i')).toBeVisible({ timeout: 10000 });

    // Check that message was added to chat
    await expect(page.locator('text=I want to plan a beach vacation')).toBeVisible();
  });

  test('should use quick start button to send message', async ({ page }) => {
    await page.goto('/trips/plan');

    // Click quick start button
    await page.click('text=Beach Vacation');

    // Message should be sent automatically
    await expect(page.locator('text=/I want to plan a beach vacation/i')).toBeVisible();

    // Wait for AI response
    await expect(page.locator('.bg-gray-100, .dark\\:bg-gray-700').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show loading indicator while AI processes', async ({ page }) => {
    await page.goto('/trips/plan');

    // Send message
    const input = page.locator('textarea');
    await input.fill('Suggest adventure destinations');
    await page.click('button[type="submit"], button:has(svg)');

    // Should show loading animation (bouncing dots)
    await expect(page.locator('.animate-bounce').first()).toBeVisible();
  });

  test('should scroll to bottom when new messages arrive', async ({ page }) => {
    await page.goto('/trips/plan');

    // Send multiple messages
    const input = page.locator('textarea');

    await input.fill('First message');
    await page.click('button:has(svg)');
    await page.waitForTimeout(2000);

    await input.fill('Second message');
    await page.click('button:has(svg)');
    await page.waitForTimeout(2000);

    // Last message should be visible (scrolled to bottom)
    await expect(page.locator('text=Second message')).toBeInViewport();
  });

  test('should allow starting new conversation', async ({ page }) => {
    await page.goto('/trips/plan');

    // Send a message
    await page.locator('textarea').fill('Test message');
    await page.click('button:has(svg)');
    await page.waitForTimeout(2000);

    // Click New Chat button
    await page.click('button:has-text("New Chat")');

    // Chat should be cleared
    await expect(page.locator('text=Test message')).not.toBeVisible();

    // Should show quick start buttons again
    await expect(page.locator('text=Beach Vacation')).toBeVisible();
  });

  test('should have mobile-responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/trips/plan');

    // Elements should be visible on mobile
    await expect(page.locator('text=Trip Planning Agent')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('button:has(svg)')).toBeVisible();
  });

  test('should navigate back to dashboard', async ({ page }) => {
    await page.goto('/trips/plan');

    // Click back button
    await page.click('svg[viewBox="0 0 24 24"]').first(); // Back arrow

    // Should return to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
