import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[type="email"]', 'jbandu@gmail.com');
    await page.fill('input[type="password"]', 'Password@123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Should show user name
    await expect(page.locator('text=Jayaprakash')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/Invalid email or password/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jbandu@gmail.com');
    await page.fill('input[type="password"]', 'Password@123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Logout
    await page.click('button:has-text("Logout")');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
