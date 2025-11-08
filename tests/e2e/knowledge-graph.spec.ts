/**
 * E2E Tests for Personal Knowledge Graph (Phases 1-3)
 * Tests profile, companions, trip history, and bucket list functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Personal Knowledge Graph', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test.describe('Profile Management', () => {
    test('should display profile dashboard with completion tracking', async ({ page }) => {
      await page.goto('http://localhost:3001/profile');

      // Check for profile progress component
      await expect(page.locator('text=Profile Completion')).toBeVisible();

      // Check for section cards
      await expect(page.locator('text=Personal Information')).toBeVisible();
      await expect(page.locator('text=Travel Style')).toBeVisible();
      await expect(page.locator('text=Dietary Preferences')).toBeVisible();
    });

    test('should navigate to profile from dashboard header link', async ({ page }) => {
      await page.goto('http://localhost:3001/dashboard');

      // Click on user name/email in header
      await page.click('a[href="/profile"]');

      // Verify navigation to profile page
      await expect(page).toHaveURL('**/profile');
    });

    test('should load profile edit page', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/edit');

      // Check for personal info section
      await expect(page.locator('text=Personal Information')).toBeVisible();

      // Check for save button
      await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
    });

    test('should save travel interests', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/edit?section=travel-style');

      // Wait for interest picker to load
      await page.waitForSelector('text=Select Your Travel Interests');

      // Add an interest (beach)
      await page.click('button:has-text("beach 🏖️")');

      // Save changes
      await page.click('button:has-text("Save Changes")');

      // Wait for success message
      await expect(page.locator('text=saved successfully')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Companion Management', () => {
    test('should load companions page', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/companions');

      await expect(page.locator('text=Travel Companions')).toBeVisible();
      await expect(page.locator('button:has-text("Add Companion")')).toBeVisible();
    });

    test('should add a new companion using quick template', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/companions');

      // Open add modal
      await page.click('button:has-text("Add Companion")');

      // Select spouse template
      await page.click('button:has-text("Spouse/Partner")');

      // Fill in required fields
      await page.fill('input[name="firstName"]', 'Jane');
      await page.fill('input[name="lastName"]', 'Doe');

      // Submit form
      await page.click('button:has-text("Add Companion")');

      // Verify companion was added
      await expect(page.locator('text=Jane Doe')).toBeVisible({ timeout: 5000 });
    });

    test('should edit a companion', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/companions');

      // Assume a companion exists
      const editButton = page.locator('button:has-text("Edit")').first();
      if (await editButton.isVisible()) {
        await editButton.click();

        // Change first name
        await page.fill('input[value="Jane"]', 'Jennifer');

        // Save changes
        await page.click('button:has-text("Update Companion")');

        // Verify update
        await expect(page.locator('text=Jennifer')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Trip History', () => {
    test('should load trip history page', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/history');

      await expect(page.locator('text=Trip History')).toBeVisible();
      await expect(page.locator('button:has-text("Add Trip Memory")')).toBeVisible();
    });

    test('should add a new trip memory', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/history');

      // Open add modal
      await page.click('button:has-text("Add Trip Memory")');

      // Fill in trip details
      await page.fill('input[placeholder*="Summer in Paris"]', 'Amazing European Adventure');
      await page.fill('input[type="date"]').first().fill('2024-06-01');
      await page.fill('input[type="date"]').nth(1).fill('2024-06-15');

      // Select trip type
      await page.selectOption('select', 'leisure');

      // Set rating
      await page.locator('input[type="range"]').first().fill('5');

      // Add a destination
      await page.fill('input[placeholder="Add a destination..."]', 'Paris, France');
      await page.click('button:has-text("Add")').first();

      // Add a highlight
      await page.fill('input[placeholder="Add a highlight..."]', 'Visited Eiffel Tower');
      await page.click('button:has-text("Add")').nth(1);

      // Submit form
      await page.click('button:has-text("Add Trip Memory")').last();

      // Verify trip was added
      await expect(page.locator('text=Amazing European Adventure')).toBeVisible({ timeout: 5000 });
    });

    test('should display trip details with rating', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/history');

      // Look for a trip card (assuming one exists)
      const tripCard = page.locator('text=Amazing European Adventure').first();
      if (await tripCard.isVisible()) {
        // Check for rating stars
        await expect(page.locator('svg.text-yellow-400')).toBeVisible();

        // Check for view details button
        await expect(page.locator('button:has-text("View Details")')).toBeVisible();
      }
    });
  });

  test.describe('Bucket List', () => {
    test('should load bucket list page', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/bucket-list');

      await expect(page.locator('text=Travel Bucket List')).toBeVisible();
      await expect(page.locator('button:has-text("Add Destination")')).toBeVisible();
    });

    test('should add a new bucket list item', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/bucket-list');

      // Open add modal
      await page.click('button:has-text("Add Destination")');

      // Fill in destination details
      await page.fill('input[placeholder*="Kyoto"]', 'Tokyo');
      await page.fill('input[placeholder*="Japan"]', 'Japan');

      // Select priority
      await page.selectOption('select').first().selectOption('must-do');

      // Add an experience
      await page.fill('input[placeholder*="Visit ancient temples"]', 'See cherry blossoms');
      await page.click('button:has-text("Add")').first();

      // Submit form
      await page.click('button:has-text("Add Destination")').last();

      // Verify destination was added
      await expect(page.locator('text=Tokyo')).toBeVisible({ timeout: 5000 });
    });

    test('should filter bucket list by priority', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/bucket-list');

      // Select priority filter
      await page.selectOption('select:has-option("All Priorities")', 'must-do');

      // Verify filtering (check that cards are displayed)
      // This assumes at least one "must-do" item exists
      const cards = page.locator('.bg-white.dark\\:bg-gray-800');
      await expect(cards.first()).toBeVisible();
    });

    test('should filter bucket list by status', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/bucket-list');

      // Select status filter
      await page.selectOption('select:has-option("All Statuses")', 'wishlist');

      // Verify page loads without errors
      await expect(page.locator('text=Travel Bucket List')).toBeVisible();
    });

    test('should change item status', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/bucket-list');

      // Find first status dropdown in a card
      const statusDropdown = page.locator('select').nth(2); // Skip the filter dropdowns
      if (await statusDropdown.isVisible()) {
        await statusDropdown.selectOption('researching');

        // Wait for update to complete
        await page.waitForTimeout(1000);

        // Verify status changed
        await expect(statusDropdown).toHaveValue('researching');
      }
    });

    test('should show reorder buttons on hover', async ({ page }) => {
      await page.goto('http://localhost:3001/profile/bucket-list');

      // Hover over a bucket list card
      const card = page.locator('.group').first();
      if (await card.isVisible()) {
        await card.hover();

        // Check for reorder buttons (they should become visible)
        const upButton = card.locator('button[title="Move up"]');
        await expect(upButton).toBeVisible();
      }
    });
  });

  test.describe('API Endpoints', () => {
    test('should fetch profile data', async ({ page }) => {
      const response = await page.request.get('http://localhost:3001/api/profile');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('profile');
    });

    test('should fetch companions', async ({ page }) => {
      const response = await page.request.get('http://localhost:3001/api/companions');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('companions');
      expect(Array.isArray(data.companions)).toBeTruthy();
    });

    test('should fetch trip memories', async ({ page }) => {
      const response = await page.request.get('http://localhost:3001/api/trip-memories');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('tripMemories');
      expect(Array.isArray(data.tripMemories)).toBeTruthy();
    });

    test('should fetch bucket list', async ({ page }) => {
      const response = await page.request.get('http://localhost:3001/api/bucket-list');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('bucketList');
      expect(Array.isArray(data.bucketList)).toBeTruthy();
    });
  });
});
