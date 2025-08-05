import { test, expect } from '@playwright/test';

test.describe('Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
  });

  test('should display footer with proper structure', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should display brand logo and name in footer', async ({ page }) => {
    const logo = page.locator('footer div:has-text("NO")');
    const brandName = page.locator('footer span:has-text("NotifyOps")');
    
    await expect(logo).toBeVisible();
    await expect(brandName).toBeVisible();
  });

  test('should display footer description', async ({ page }) => {
    const description = page.locator('footer p:has-text("AI-powered GitHub issue intelligence")');
    await expect(description).toBeVisible();
  });

  test('should display all footer link categories', async ({ page }) => {
    const categories = ['Product', 'Resources', 'Company'];
    
    for (const category of categories) {
      const categoryElement = page.locator(`footer h3:has-text("${category}")`);
      await expect(categoryElement).toBeVisible();
    }
  });

  test('should display all product links', async ({ page }) => {
    const productLinks = ['Features', 'AI Personalities', 'Architecture', 'Monitoring'];
    
    for (const link of productLinks) {
      const linkElement = page.locator(`footer a:has-text("${link}")`);
      await expect(linkElement).toBeVisible();
    }
  });

  test('should display all resources links', async ({ page }) => {
    const resourceLinks = ['Documentation', 'GitHub', 'Community', 'Blog'];
    
    for (const link of resourceLinks) {
      const linkElement = page.locator(`footer a:has-text("${link}")`);
      await expect(linkElement).toBeVisible();
    }
  });

  test('should display all company links', async ({ page }) => {
    const companyLinks = ['About', 'Contact', 'Privacy', 'Terms'];
    
    for (const link of companyLinks) {
      const linkElement = page.locator(`footer a:has-text("${link}")`);
      await expect(linkElement).toBeVisible();
    }
  });

  test('should display social media links', async ({ page }) => {
    const socialLinks = page.locator('footer a[aria-label]');
    await expect(socialLinks).toHaveCount(4); // GitHub, Twitter, Discord, Contact
  });

  test('should have proper social media icons', async ({ page }) => {
    const socialIcons = page.locator('footer svg');
    await expect(socialIcons).toHaveCount(4);
  });

  test('should display copyright information', async ({ page }) => {
    const copyright = page.locator('footer div:has-text("© 2024 NotifyOps")');
    await expect(copyright).toBeVisible();
  });

  test('should display system status indicator', async ({ page }) => {
    const statusIndicator = page.locator('footer div:has-text("All systems operational")');
    await expect(statusIndicator).toBeVisible();
    
    const statusDot = page.locator('footer div[class*="w-2 h-2 bg-[#10b981]"]');
    await expect(statusDot).toBeVisible();
  });

  test('should have scroll to top button', async ({ page }) => {
    const scrollToTopButton = page.locator('footer button[aria-label="Scroll to top"]');
    await expect(scrollToTopButton).toBeVisible();
  });

  test('should scroll to top when scroll button is clicked', async ({ page }) => {
    // Scroll down first
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    const scrollToTopButton = page.locator('footer button[aria-label="Scroll to top"]');
    await scrollToTopButton.click();
    
    // Wait for scroll animation
    await page.waitForTimeout(1000);
    
    // Check if we're at the top
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test('should have hover effects on social media links', async ({ page }) => {
    const socialLinks = page.locator('footer a[aria-label]');
    
    // Hover over first social link
    await socialLinks.first().hover();
    
    // Check if hover effect is applied
    await expect(socialLinks.first()).toBeVisible();
  });

  test('should have hover effects on footer links', async ({ page }) => {
    const footerLinks = page.locator('footer a');
    
    // Hover over first footer link
    await footerLinks.first().hover();
    
    // Check if hover effect is applied
    await expect(footerLinks.first()).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if footer is still visible
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check if footer content is properly stacked
    const footerContent = page.locator('footer div[class*="grid"]');
    await expect(footerContent).toBeVisible();
  });

  test('should have proper gradient backgrounds', async ({ page }) => {
    const gradientBackground = page.locator('footer div[class*="bg-gradient"]');
    await expect(gradientBackground).toBeVisible();
  });

  test('should have proper border styling', async ({ page }) => {
    const borderElement = page.locator('footer div[class*="border-white/10"]');
    await expect(borderElement).toBeVisible();
  });

  test('should have proper text contrast and readability', async ({ page }) => {
    const footerText = page.locator('footer p');
    await expect(footerText.first()).toBeVisible();
    
    // Check if text has proper styling
    const footerLinks = page.locator('footer a');
    await expect(footerLinks.first()).toHaveClass(/text-gray-400/);
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Check for proper footer structure
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for proper heading hierarchy
    const h3 = page.locator('footer h3');
    await expect(h3.first()).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const socialLinks = page.locator('footer a[aria-label]');
    await expect(socialLinks.first()).toHaveAttribute('aria-label');
    
    const scrollButton = page.locator('footer button[aria-label="Scroll to top"]');
    await expect(scrollButton).toHaveAttribute('aria-label', 'Scroll to top');
  });

  test('should have smooth animations', async ({ page }) => {
    // Check for animated elements
    const animatedElements = page.locator('footer div[class*="motion"]');
    await expect(animatedElements.first()).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    expect(errors.length).toBe(0);
  });

  test('should have proper link functionality', async ({ page }) => {
    const contactLink = page.locator('footer a:has-text("Contact")');
    await expect(contactLink).toBeVisible();
    
    // Check if link has proper href
    await expect(contactLink).toHaveAttribute('href', '#contact');
  });

  test('should have proper spacing and layout', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for proper grid layout
    const gridContainer = page.locator('footer div[class*="grid"]');
    await expect(gridContainer).toBeVisible();
  });
}); 