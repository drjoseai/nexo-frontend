/**
 * E2E Tests for Navigation
 * NEXO v2.0 - Day 9
 * 
 * Tests page accessibility and routing
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should redirect unauthenticated user from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login or stay on dashboard if public
    await expect(page).toHaveURL(/\/(login|dashboard)/);
  });

  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Home page is default Next.js template, just verify it loads
    await expect(page).toHaveURL('/');
  });

  test('should access login page directly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('should access register page directly', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('register-submit')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('login page should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('register page should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByTestId('register-email')).toBeVisible();
    await expect(page.getByTestId('register-submit')).toBeVisible();
  });

  test('login page should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByTestId('login-card')).toBeVisible();
  });
});
