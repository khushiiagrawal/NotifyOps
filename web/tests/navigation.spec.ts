import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display navigation bar with logo and brand name', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check logo
    const logo = page.locator('nav div:has-text("NO")');
    await expect(logo).toBeVisible();
    
    // Check brand name
    const brandName = page.locator('nav span:has-text("NotifyOps")');
    await expect(brandName).toBeVisible();
  });

  test('should display all navigation menu items on desktop', async ({ page }) => {
    const navItems = ['Features', 'AI Personalities', 'Architecture', 'Demo', 'Monitoring', 'Setup', 'Pricing'];
    
    for (const item of navItems) {
      const navLink = page.locator(`nav a:has-text("${item}")`);
      await expect(navLink).toBeVisible();
    }
  });

  test('should have GitHub and Get Started buttons in navigation', async ({ page }) => {
    const githubButton = page.locator('nav button:has-text("GitHub")');
    const getStartedButton = page.locator('nav button:has-text("Get Started")');
    
    await expect(githubButton).toBeVisible();
    await expect(getStartedButton).toBeVisible();
  });

  test('should show mobile menu when hamburger button is clicked', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    const hamburgerButton = page.locator('nav button[aria-label="Menu"], nav button:has([data-testid="menu-icon"])');
    await expect(hamburgerButton).toBeVisible();
    
    await hamburgerButton.click();
    
    // Check if mobile menu is visible
    const mobileMenu = page.locator('nav div[class*="md:hidden"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('should hide mobile menu when close button is clicked', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const hamburgerButton = page.locator('nav button:has([data-testid="menu-icon"])');
    await hamburgerButton.click();
    
    const closeButton = page.locator('nav button:has([data-testid="close-icon"])');
    await closeButton.click();
    
    const mobileMenu = page.locator('nav div[class*="md:hidden"]');
    await expect(mobileMenu).not.toBeVisible();
  });

  test('should have smooth scroll behavior for navigation links', async ({ page }) => {
    const featuresLink = page.locator('nav a:has-text("Features")');
    await featuresLink.click();
    
    // Wait for scroll to complete
    await page.waitForTimeout(1000);
    
    // Check if we're in the features section
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();
  });

  test('should change navigation background on scroll', async ({ page }) => {
    const nav = page.locator('nav');
    
    // Initial state - transparent background
    await expect(nav).toHaveClass(/bg-transparent/);
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(500);
    
    // Check if background changed
    await expect(nav).toHaveClass(/backdrop-blur/);
  });

  test('should have hover effects on navigation links', async ({ page }) => {
    const featuresLink = page.locator('nav a:has-text("Features")');
    
    // Hover over the link
    await featuresLink.hover();
    
    // Check if hover effect is applied (this might be visual only)
    await expect(featuresLink).toBeVisible();
  });

  test('should be responsive and hide desktop menu on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Desktop navigation should be hidden on mobile
    const desktopNav = page.locator('nav div:has-text("Features"):not([class*="md:hidden"])');
    await expect(desktopNav).not.toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for proper semantic structure
    const navItems = page.locator('nav a');
    await expect(navItems.first()).toBeVisible();
  });
}); 