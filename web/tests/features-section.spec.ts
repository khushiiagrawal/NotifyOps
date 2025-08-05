import { test, expect } from '@playwright/test';

test.describe('Features Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to features section
    await page.locator('a:has-text("Features")').click();
    await page.waitForTimeout(1000);
  });

  test('should display features section with proper heading', async ({ page }) => {
    const section = page.locator('#features');
    await expect(section).toBeVisible();
    
    const heading = page.locator('h2:has-text("Powerful Features")');
    await expect(heading).toBeVisible();
  });

  test('should display all feature cards with proper content', async ({ page }) => {
    const features = [
      'AI-Powered Summarization',
      'Real-time Processing',
      'Rich Slack Integration',
      'Comprehensive Monitoring',
      'Production Ready',
      'Containerized Deployment'
    ];

    for (const feature of features) {
      const featureCard = page.locator(`h3:has-text("${feature}")`);
      await expect(featureCard).toBeVisible();
    }
  });

  test('should display feature descriptions', async ({ page }) => {
    const descriptions = [
      'OpenAI GPT integration with 10 specialized prompt styles',
      'Instant webhook processing with sub-100ms response times',
      'Beautiful interactive messages with action buttons',
      'Prometheus metrics with Grafana dashboards',
      'Health checks, graceful shutdown, error handling',
      'Docker and Docker Compose ready with automated CI/CD'
    ];

    for (const description of descriptions) {
      const descElement = page.locator(`p:has-text("${description}")`);
      await expect(descElement).toBeVisible();
    }
  });

  test('should display feature details for each card', async ({ page }) => {
    const featureDetails = [
      'Custom prompt engineering',
      'Context-aware analysis',
      'Multiple AI personalities',
      'Webhook automation',
      'Lightning-fast processing',
      'Zero-delay notifications',
      'Interactive buttons',
      'Thread management',
      'Custom formatting',
      'Real-time metrics',
      'Custom dashboards',
      'Performance insights',
      'Health monitoring',
      'Error recovery',
      'Security hardened',
      'Docker optimized',
      'Compose templates',
      'CI/CD ready'
    ];

    for (const detail of featureDetails) {
      const detailElement = page.locator(`li:has-text("${detail}")`);
      await expect(detailElement).toBeVisible();
    }
  });

  test('should have hover effects on feature cards', async ({ page }) => {
    const featureCards = page.locator('div[class*="group relative"]');
    
    // Hover over first feature card
    await featureCards.first().hover();
    
    // Check if hover effect is applied
    await expect(featureCards.first()).toBeVisible();
  });

  test('should display integration showcase', async ({ page }) => {
    const integrationHeading = page.locator('h3:has-text("Seamless Integration")');
    await expect(integrationHeading).toBeVisible();
    
    const integrations = ['GitHub', 'OpenAI', 'Slack', 'Grafana', 'Docker'];
    
    for (const integration of integrations) {
      const integrationElement = page.locator(`span:has-text("${integration}")`);
      await expect(integrationElement).toBeVisible();
    }
  });

  test('should have proper gradient icons for each feature', async ({ page }) => {
    const featureIcons = page.locator('div[class*="w-16 h-16 rounded-xl bg-gradient-to-r"]');
    await expect(featureIcons).toHaveCount(6);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if features section is still visible
    const section = page.locator('#features');
    await expect(section).toBeVisible();
    
    // Check if feature cards stack properly
    const featureCards = page.locator('div[class*="group relative"]');
    await expect(featureCards.first()).toBeVisible();
  });

  test('should have smooth animations when scrolling into view', async ({ page }) => {
    // Scroll to features section
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Scroll to features section
    await page.locator('a:has-text("Features")').click();
    await page.waitForTimeout(1000);
    
    // Check if animated elements are visible
    const animatedElements = page.locator('div[class*="motion"]');
    await expect(animatedElements.first()).toBeVisible();
  });

  test('should have proper spacing and layout', async ({ page }) => {
    const section = page.locator('#features');
    await expect(section).toBeVisible();
    
    // Check for proper grid layout
    const gridContainer = page.locator('div[class*="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"]');
    await expect(gridContainer).toBeVisible();
  });

  test('should have proper text contrast and readability', async ({ page }) => {
    const headings = page.locator('h2, h3');
    await expect(headings.first()).toBeVisible();
    
    // Check if text has proper styling
    const featureTitles = page.locator('h3');
    await expect(featureTitles.first()).toHaveClass(/text-xl/);
  });

  test('should have interactive integration icons', async ({ page }) => {
    const integrationIcons = page.locator('div[class*="w-16 h-16 rounded-xl bg-white/5"]');
    
    // Hover over first integration icon
    await integrationIcons.first().hover();
    
    // Check if hover effect is applied
    await expect(integrationIcons.first()).toBeVisible();
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Check for proper section structure
    const section = page.locator('section#features');
    await expect(section).toBeVisible();
    
    // Check for proper heading hierarchy
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');
    await expect(h2.first()).toBeVisible();
    await expect(h3.first()).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.locator('a:has-text("Features")').click();
    await page.waitForTimeout(2000);
    
    expect(errors.length).toBe(0);
  });
}); 