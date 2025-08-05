import { test, expect } from '@playwright/test';

test.describe('NotifyOps Frontend - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with proper title and meta tags', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/NotifyOps/i);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toBeVisible();

    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeVisible();
  });

  test('should display main navigation and hero section', async ({ page }) => {
    // Check navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check hero section
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText('AI-Powered');
  });

  test('should have all main sections visible', async ({ page }) => {
    const sections = [
      'features',
      'ai-personalities',
      'architecture',
      'demo',
      'monitoring',
      'setup',
      'pricing',
      'contact',
    ];

    for (const section of sections) {
      const sectionElement = page.locator(`#${section}`);
      await expect(sectionElement).toBeVisible();
    }
  });

  test('should have working navigation links', async ({ page }) => {
    const navLinks = [
      'Features',
      'AI Personalities',
      'Architecture',
      'Demo',
      'Monitoring',
      'Setup',
      'Pricing',
    ];

    for (const link of navLinks) {
      const navLink = page.locator(`nav a:has-text("${link}")`);
      await expect(navLink).toBeVisible();

      // Test navigation
      await navLink.click();
      await page.waitForTimeout(500);

      const section = page.locator(`#${link.toLowerCase().replace(' ', '-')}`);
      await expect(section).toBeVisible();
    }
  });

  test('should have responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile menu button is visible
    const menuButton = page.locator('nav button');
    await expect(menuButton).toBeVisible();

    // Test mobile menu
    await menuButton.click();
    const mobileMenu = page.locator('nav div[class*="md:hidden"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('should have working contact form', async ({ page }) => {
    // Navigate to contact section
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);

    // Check form fields
    const nameField = page.locator('input[name="name"]');
    const emailField = page.locator('input[name="email"]');
    const messageField = page.locator('textarea[name="message"]');

    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
    await expect(messageField).toBeVisible();

    // Test form submission
    await nameField.fill('Test User');
    await emailField.fill('test@example.com');
    await messageField.fill('Test message');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for success message
    await page.waitForTimeout(2000);
    const successMessage = page.locator('text=Message sent successfully');
    await expect(successMessage).toBeVisible();
  });

  test('should have proper footer with links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check footer links
    const footerLinks = page.locator('footer a');
    await expect(footerLinks).toHaveCount(12); // Product, Resources, Company links

    // Check social media links
    const socialLinks = page.locator('footer a[aria-label]');
    await expect(socialLinks).toHaveCount(4);
  });

  test('should have proper animations and interactions', async ({ page }) => {
    // Wait for animations to load
    await page.waitForTimeout(2000);

    // Check for animated elements
    const animatedElements = page.locator('div[class*="motion"]');
    await expect(animatedElements.first()).toBeVisible();

    // Test hover effects
    const interactiveElements = page.locator('div[class*="group"], button');
    await interactiveElements.first().hover();
    await expect(interactiveElements.first()).toBeVisible();
  });

  test('should have proper Three.js background', async ({ page }) => {
    // Wait for Three.js to load
    await page.waitForTimeout(2000);

    // Check for Canvas element
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should have no JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have no JavaScript errors
    expect(errors.length).toBe(0);
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    const h2s = page.locator('h2');

    await expect(h1).toBeVisible();
    await expect(h2s).toHaveCount(8);

    // Check for proper ARIA labels
    const ariaLabels = page.locator('[aria-label]');
    await expect(ariaLabels).toHaveCount(4); // Social media links + scroll button

    // Check for proper lang attribute
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('should have proper performance characteristics', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within reasonable time
    expect(loadTime).toBeLessThan(5000);

    // Check if main content is visible quickly
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should have proper SEO elements', async ({ page }) => {
    // Check for proper meta tags
    const metaDescription = page.locator('meta[name="description"]');
    const metaKeywords = page.locator('meta[name="keywords"]');
    const ogTitle = page.locator('meta[property="og:title"]');
    const twitterCard = page.locator('meta[name="twitter:card"]');

    await expect(metaDescription).toBeVisible();
    await expect(metaKeywords).toBeVisible();
    await expect(ogTitle).toBeVisible();
    await expect(twitterCard).toBeVisible();
  });

  test('should have proper cross-browser compatibility', async ({ page }) => {
    // Test basic functionality across different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 }, // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check if main content is still visible
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();

      // Check if navigation is accessible
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    }
  });
});
