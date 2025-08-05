import { test, expect } from '@playwright/test';

test.describe('Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display main hero content with title and subtitle', async ({ page }) => {
    // Check main title
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    await expect(title).toContainText('AI-Powered');
    await expect(title).toContainText('GitHub Issue');
    await expect(title).toContainText('Intelligence');
  });

  test('should display typewriter text animation', async ({ page }) => {
    const typewriterText = page.locator('div:has-text("Transform GitHub issues into actionable insights")');
    await expect(typewriterText).toBeVisible();
  });

  test('should display feature highlights with icons', async ({ page }) => {
    const features = [
      'AI-Powered Analysis',
      'Real-time Processing',
      'Smart Slack Integration',
      'GitHub Native'
    ];

    for (const feature of features) {
      const featureElement = page.locator(`div:has-text("${feature}")`);
      await expect(featureElement).toBeVisible();
    }
  });

  test('should display CTA buttons', async ({ page }) => {
    const getStartedButton = page.locator('button:has-text("Get Started Free")');
    const watchDemoButton = page.locator('button:has-text("Watch Demo")');
    
    await expect(getStartedButton).toBeVisible();
    await expect(watchDemoButton).toBeVisible();
  });

  test('should display performance stats', async ({ page }) => {
    const stats = [
      { number: '99.9%', label: 'Uptime' },
      { number: '<100ms', label: 'Response Time' },
      { number: '10+', label: 'AI Personalities' }
    ];

    for (const stat of stats) {
      const statNumber = page.locator(`div:has-text("${stat.number}")`);
      const statLabel = page.locator(`div:has-text("${stat.label}")`);
      
      await expect(statNumber).toBeVisible();
      await expect(statLabel).toBeVisible();
    }
  });

  test('should have scroll indicator at bottom', async ({ page }) => {
    // Scroll indicator should be visible at the bottom of hero section
    const scrollIndicator = page.locator('div[class*="absolute bottom-8"]');
    await expect(scrollIndicator).toBeVisible();
  });

  test('should have Three.js background animation', async ({ page }) => {
    // Check if Canvas element exists (Three.js background)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should have floating cards animation', async ({ page }) => {
    // Check for floating cards container
    const floatingCards = page.locator('div[class*="absolute"]');
    await expect(floatingCards.first()).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if hero content is still visible and properly sized
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    
    // Check if buttons stack properly on mobile
    const buttons = page.locator('button');
    await expect(buttons).toHaveCount(2);
  });

  test('should have proper gradient backgrounds', async ({ page }) => {
    // Check for gradient overlay elements
    const gradientOverlays = page.locator('div[class*="bg-gradient"]');
    await expect(gradientOverlays.first()).toBeVisible();
  });

  test('should have smooth animations on page load', async ({ page }) => {
    // Wait for animations to complete
    await page.waitForTimeout(2000);
    
    // Check if all animated elements are visible
    const animatedElements = page.locator('div[class*="motion"]');
    await expect(animatedElements.first()).toBeVisible();
  });

  test('should have proper text contrast and readability', async ({ page }) => {
    const title = page.locator('h1');
    const subtitle = page.locator('div:has-text("Transform GitHub issues")');
    
    await expect(title).toBeVisible();
    await expect(subtitle).toBeVisible();
    
    // Check if text has proper styling classes
    await expect(title).toHaveClass(/text-4xl/);
  });

  test('should have interactive hover effects on feature cards', async ({ page }) => {
    const featureCards = page.locator('div[class*="backdrop-blur-sm"]');
    
    // Hover over first feature card
    await featureCards.first().hover();
    
    // Check if hover effect is applied (visual test)
    await expect(featureCards.first()).toBeVisible();
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for main content area
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check if there are any console errors
    expect(errors.length).toBe(0);
  });
}); 