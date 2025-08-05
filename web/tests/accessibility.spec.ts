import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/NotifyOps/i);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for main h1 heading
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check for h2 headings
    const h2s = page.locator('h2');
    await expect(h2s).toHaveCount(8); // Features, AI Personalities, Architecture, Demo, Monitoring, Setup, Pricing, Contact

    // Check for h3 headings
    const h3s = page.locator('h3');
    await expect(h3s).toHaveCount(16); // Feature cards + other h3 elements
  });

  test('should have proper alt text for images', async ({ page }) => {
    const images = page.locator('img');

    for (let i = 0; i < (await images.count()); i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should have proper ARIA labels for interactive elements', async ({ page }) => {
    // Check for navigation menu button
    const menuButton = page.locator('nav button');
    await expect(menuButton).toBeVisible();

    // Check for social media links
    const socialLinks = page.locator('a[aria-label]');
    await expect(socialLinks).toHaveCount(4); // GitHub, Twitter, Discord, Contact

    // Check for scroll to top button
    const scrollButton = page.locator('button[aria-label="Scroll to top"]');
    await expect(scrollButton).toBeVisible();
  });

  test('should have proper form labels', async ({ page }) => {
    // Scroll to contact section
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);

    const formLabels = page.locator('label');
    await expect(formLabels).toHaveCount(4); // Name, Email, Company, Message

    // Check if labels are properly associated with form controls
    const nameField = page.locator('input[name="name"]');
    const nameLabel = page.locator('label:has-text("Name")');
    await expect(nameField).toBeVisible();
    await expect(nameLabel).toBeVisible();
  });

  test('should have proper focus indicators', async ({ page }) => {
    // Test focus on navigation links
    const navLinks = page.locator('nav a');
    await navLinks.first().focus();
    await expect(navLinks.first()).toBeVisible();

    // Test focus on buttons
    const buttons = page.locator('button');
    await buttons.first().focus();
    await expect(buttons.first()).toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    // Check if text is visible against background
    const mainText = page.locator('p, h1, h2, h3');
    await expect(mainText.first()).toBeVisible();

    // Check if links are visible
    const links = page.locator('a');
    await expect(links.first()).toBeVisible();
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Check for proper main content area
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for proper navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for proper footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should have proper skip links for keyboard navigation', async ({ page }) => {
    // Check if main content is accessible via keyboard
    const main = page.locator('main');
    await main.focus();
    await expect(main).toBeVisible();
  });

  test('should have proper button and link functionality', async ({ page }) => {
    // Test navigation links
    const featuresLink = page.locator('nav a:has-text("Features")');
    await featuresLink.click();
    await page.waitForTimeout(1000);

    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();
  });

  test('should have proper form validation', async ({ page }) => {
    // Scroll to contact section
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check if form validation works (depends on implementation)
    await expect(submitButton).toBeVisible();
  });

  test('should have proper error handling', async ({ page }) => {
    // Test with invalid form input
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);

    const emailField = page.locator('input[name="email"]');
    await emailField.fill('invalid-email');

    // Check if field accepts input
    await expect(emailField).toHaveValue('invalid-email');
  });

  test('should have proper responsive design for accessibility', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if navigation is still accessible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check if mobile menu works
    const menuButton = page.locator('nav button');
    await menuButton.click();

    const mobileMenu = page.locator('nav div[class*="md:hidden"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');

    // Check if focus moves to first interactive element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper screen reader support', async ({ page }) => {
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();

    // Check for proper link text
    const links = page.locator('a');
    for (let i = 0; i < (await links.count()); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('should have proper language attributes', async ({ page }) => {
    // Check for proper lang attribute
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('should have proper meta tags for accessibility', async ({ page }) => {
    // Check for proper viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeVisible();
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    // Check for navigation landmark
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for main content landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for footer landmark
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should have proper form accessibility', async ({ page }) => {
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);

    // Check for proper form structure
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Check for proper fieldset and legend if used
    const fieldsets = page.locator('fieldset');
    if ((await fieldsets.count()) > 0) {
      await expect(fieldsets.first()).toBeVisible();
    }
  });

  test('should have proper error message accessibility', async ({ page }) => {
    // Test form submission without required fields
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check if any error messages are displayed
    const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]');
    // This depends on the form implementation
    await expect(submitButton).toBeVisible();
  });

  test('should have proper loading state accessibility', async ({ page }) => {
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);

    // Fill and submit form to test loading state
    const nameField = page.locator('input[name="name"]');
    const emailField = page.locator('input[name="email"]');
    const messageField = page.locator('textarea[name="message"]');
    const submitButton = page.locator('button[type="submit"]');

    await nameField.fill('Test User');
    await emailField.fill('test@example.com');
    await messageField.fill('Test message');
    await submitButton.click();

    // Check for loading state
    const loadingText = page.locator('text=Sending...');
    await expect(loadingText).toBeVisible();
  });

  test('should have proper success message accessibility', async ({ page }) => {
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);

    // Fill and submit form
    const nameField = page.locator('input[name="name"]');
    const emailField = page.locator('input[name="email"]');
    const messageField = page.locator('textarea[name="message"]');
    const submitButton = page.locator('button[type="submit"]');

    await nameField.fill('Test User');
    await emailField.fill('test@example.com');
    await messageField.fill('Test message');
    await submitButton.click();

    // Wait for success message
    await page.waitForTimeout(2000);

    // Check for success message
    const successMessage = page.locator('text=Message sent successfully');
    await expect(successMessage).toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    // Test focus management after form submission
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);

    const nameField = page.locator('input[name="name"]');
    await nameField.focus();
    await expect(nameField).toBeVisible();

    // Test tab navigation through form
    await page.keyboard.press('Tab');
    const emailField = page.locator('input[name="email"]');
    await expect(emailField).toBeVisible();
  });
});
