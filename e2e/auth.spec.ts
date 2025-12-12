/**
 * E2E Tests for Authentication Pages
 * NEXO v2.0 - Day 9
 * 
 * Uses data-testid selectors for language-independent testing
 */

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('should display login form with all elements', async ({ page }) => {
    // Logo
    await expect(page.getByText('NEXO').first()).toBeVisible();
    
    // Form elements
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
    await expect(page.getByTestId('login-register-link')).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.getByTestId('login-submit').click();
    
    // Wait for validation error to appear
    await expect(
      page.getByTestId('login-email-error').or(page.locator('text=/required|requerido/i').first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid email format', async ({ page }) => {
    const emailInput = page.getByTestId('login-email');
    await emailInput.fill('notanemail');
    await emailInput.blur();
    await page.getByTestId('login-submit').click();
    
    // Wait for form validation
    await page.waitForTimeout(500);
    
    await expect(
      page.getByTestId('login-email-error').or(page.locator('text=/invalid|inválido|email/i').first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show error for short password', async ({ page }) => {
    await page.getByTestId('login-email').fill('test@example.com');
    await page.getByTestId('login-password').fill('12345');
    await page.getByTestId('login-submit').click();
    
    await expect(
      page.getByTestId('login-password-error').or(page.locator('text=/6 char|6 caract/i').first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to register page via link', async ({ page }) => {
    await page.getByTestId('login-register-link').click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('should have proper form accessibility', async ({ page }) => {
    const emailInput = page.getByTestId('login-email');
    const passwordInput = page.getByTestId('login-password');
    
    // Check inputs have proper attributes
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(emailInput).toHaveAttribute('autocomplete', 'email');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });
});

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
  });

  test('should display register form with all elements', async ({ page }) => {
    // Logo
    await expect(page.getByText('NEXO').first()).toBeVisible();
    
    // Form elements
    await expect(page.getByTestId('register-display-name')).toBeVisible();
    await expect(page.getByTestId('register-email')).toBeVisible();
    await expect(page.getByTestId('register-password')).toBeVisible();
    await expect(page.getByTestId('register-confirm-password')).toBeVisible();
    await expect(page.getByTestId('register-submit')).toBeVisible();
    await expect(page.getByTestId('register-login-link')).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.getByTestId('register-submit').click();
    
    // Wait for validation error to appear
    await expect(
      page.getByTestId('register-email-error').or(page.locator('text=/required|requerido/i').first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.getByTestId('register-email').fill('newuser@example.com');
    await page.getByTestId('register-password').fill('password123');
    await page.getByTestId('register-confirm-password').fill('differentpass');
    await page.getByTestId('register-submit').click();
    
    await expect(
      page.getByTestId('register-confirm-password-error').or(page.locator('text=/match|coinciden/i').first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to login page via link', async ({ page }) => {
    await page.getByTestId('register-login-link').click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should have proper form accessibility', async ({ page }) => {
    const emailInput = page.getByTestId('register-email');
    const passwordInput = page.getByTestId('register-password');
    const confirmInput = page.getByTestId('register-confirm-password');
    
    // Check inputs have proper attributes
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(confirmInput).toHaveAttribute('type', 'password');
  });
});
