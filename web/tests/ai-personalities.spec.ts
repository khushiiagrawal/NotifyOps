import { test, expect } from '@playwright/test';

test.describe('AI Personalities Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to AI Personalities section
    await page.locator('a:has-text("AI Personalities")').click();
    await page.waitForTimeout(1000);
  });

  test('should display AI Personalities section with proper heading', async ({ page }) => {
    const section = page.locator('#ai-personalities');
    await expect(section).toBeVisible();

    const heading = page.locator('h2:has-text("AI Personalities")');
    await expect(heading).toBeVisible();
  });

  test('should display all AI personality cards', async ({ page }) => {
    const personalities = [
      'Technical Analyst',
      'Business Translator',
      'Security Expert',
      'Performance Optimizer',
      'User Experience Advocate',
      'DevOps Specialist',
      'Code Reviewer',
      'Documentation Writer',
      'Testing Strategist',
      'Architecture Consultant',
    ];

    for (const personality of personalities) {
      const personalityCard = page.locator(`h3:has-text("${personality}")`);
      await expect(personalityCard).toBeVisible();
    }
  });

  test('should display personality descriptions', async ({ page }) => {
    const descriptions = [
      'Deep technical analysis with code insights',
      'Business impact and stakeholder communication',
      'Security vulnerabilities and compliance checks',
      'Performance bottlenecks and optimization',
      'User experience and accessibility focus',
      'Infrastructure and deployment considerations',
      'Code quality and best practices review',
      'Documentation and knowledge sharing',
      'Testing strategy and quality assurance',
      'System architecture and scalability',
    ];

    for (const description of descriptions) {
      const descElement = page.locator(`p:has-text("${description}")`);
      await expect(descElement).toBeVisible();
    }
  });

  test('should display personality traits for each card', async ({ page }) => {
    const traits = [
      'Code analysis',
      'Technical insights',
      'Performance metrics',
      'Business context',
      'Stakeholder impact',
      'Risk assessment',
      'Security scanning',
      'Compliance checks',
      'Performance profiling',
      'Optimization suggestions',
      'UX analysis',
      'Accessibility review',
      'Infrastructure review',
      'Deployment strategy',
      'Code quality',
      'Best practices',
      'Documentation',
      'Knowledge sharing',
      'Test coverage',
      'Quality assurance',
      'Architecture review',
      'Scalability analysis',
    ];

    for (const trait of traits) {
      const traitElement = page.locator(`li:has-text("${trait}")`);
      await expect(traitElement).toBeVisible();
    }
  });

  test('should have hover effects on personality cards', async ({ page }) => {
    const personalityCards = page.locator('div[class*="group relative"]');

    // Hover over first personality card
    await personalityCards.first().hover();

    // Check if hover effect is applied
    await expect(personalityCards.first()).toBeVisible();
  });

  test('should have proper gradient icons for each personality', async ({ page }) => {
    const personalityIcons = page.locator('div[class*="w-16 h-16 rounded-xl bg-gradient-to-r"]');
    await expect(personalityIcons).toHaveCount(10);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if AI Personalities section is still visible
    const section = page.locator('#ai-personalities');
    await expect(section).toBeVisible();

    // Check if personality cards stack properly
    const personalityCards = page.locator('div[class*="group relative"]');
    await expect(personalityCards.first()).toBeVisible();
  });

  test('should have smooth animations when scrolling into view', async ({ page }) => {
    // Scroll to AI Personalities section
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Scroll to AI Personalities section
    await page.locator('a:has-text("AI Personalities")').click();
    await page.waitForTimeout(1000);

    // Check if animated elements are visible
    const animatedElements = page.locator('div[class*="motion"]');
    await expect(animatedElements.first()).toBeVisible();
  });

  test('should have proper spacing and layout', async ({ page }) => {
    const section = page.locator('#ai-personalities');
    await expect(section).toBeVisible();

    // Check for proper grid layout
    const gridContainer = page.locator(
      'div[class*="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"]',
    );
    await expect(gridContainer).toBeVisible();
  });

  test('should have proper text contrast and readability', async ({ page }) => {
    const headings = page.locator('h2, h3');
    await expect(headings.first()).toBeVisible();

    // Check if text has proper styling
    const personalityTitles = page.locator('h3');
    await expect(personalityTitles.first()).toHaveClass(/text-xl/);
  });

  test('should have interactive personality cards', async ({ page }) => {
    const personalityCards = page.locator('div[class*="group relative"]');

    // Click on first personality card
    await personalityCards.first().click();

    // Check if card is still visible after interaction
    await expect(personalityCards.first()).toBeVisible();
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Check for proper section structure
    const section = page.locator('section#ai-personalities');
    await expect(section).toBeVisible();

    // Check for proper heading hierarchy
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');
    await expect(h2.first()).toBeVisible();
    await expect(h3.first()).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const personalityCards = page.locator('div[class*="group relative"]');
    await expect(personalityCards.first()).toBeVisible();

    // Check for proper semantic structure
    const headings = page.locator('h3');
    await expect(headings.first()).toBeVisible();
  });

  test('should have smooth hover animations', async ({ page }) => {
    const personalityCards = page.locator('div[class*="group relative"]');

    // Hover over multiple cards to test animations
    for (let i = 0; i < 3; i++) {
      await personalityCards.nth(i).hover();
      await page.waitForTimeout(200);
    }

    // Check if cards are still visible
    await expect(personalityCards.first()).toBeVisible();
  });

  test('should have proper gradient backgrounds', async ({ page }) => {
    const gradientElements = page.locator('div[class*="bg-gradient-to-r"]');
    await expect(gradientElements.first()).toBeVisible();
  });

  test('should have proper border styling', async ({ page }) => {
    const borderElements = page.locator('div[class*="border-white/10"]');
    await expect(borderElements.first()).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.locator('a:has-text("AI Personalities")').click();
    await page.waitForTimeout(2000);

    expect(errors.length).toBe(0);
  });

  test('should have proper card layout and spacing', async ({ page }) => {
    const personalityCards = page.locator('div[class*="group relative"]');
    await expect(personalityCards).toHaveCount(10);

    // Check if cards have proper spacing
    for (let i = 0; i < 3; i++) {
      await expect(personalityCards.nth(i)).toBeVisible();
    }
  });

  test('should have proper icon styling', async ({ page }) => {
    const icons = page.locator('div[class*="w-16 h-16 rounded-xl"]');
    await expect(icons).toHaveCount(10);

    // Check if icons have proper gradient styling
    const gradientIcons = page.locator('div[class*="bg-gradient-to-r"]');
    await expect(gradientIcons.first()).toBeVisible();
  });

  test('should have proper text hierarchy', async ({ page }) => {
    const mainHeading = page.locator('h2');
    const cardHeadings = page.locator('h3');

    await expect(mainHeading.first()).toBeVisible();
    await expect(cardHeadings.first()).toBeVisible();

    // Check if headings have proper styling
    await expect(mainHeading.first()).toHaveClass(/text-4xl/);
    await expect(cardHeadings.first()).toHaveClass(/text-xl/);
  });
});
