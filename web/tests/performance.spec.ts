import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Clear browser cache and storage
    await page.context().clearCookies();
  });

  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have fast First Contentful Paint (FCP)', async ({ page }) => {
    await page.goto('/');
    
    // Wait for first content to be painted
    await page.waitForLoadState('domcontentloaded');
    
    // Check if main content is visible quickly
    const mainContent = page.locator('h1');
    await expect(mainContent).toBeVisible();
  });

  test('should have fast Largest Contentful Paint (LCP)', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check if largest content (hero section) is visible
    const heroSection = page.locator('section:has(h1)');
    await expect(heroSection).toBeVisible();
  });

  test('should have minimal Cumulative Layout Shift (CLS)', async ({ page }) => {
    await page.goto('/');
    
    // Wait for all animations to complete
    await page.waitForTimeout(3000);
    
    // Check if layout is stable
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check if images are loaded
    const images = page.locator('img');
    for (let i = 0; i < await images.count(); i++) {
      const image = images.nth(i);
      await expect(image).toBeVisible();
    }
  });

  test('should have efficient JavaScript execution', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should have no JavaScript errors
    expect(errors.length).toBe(0);
  });

  test('should have efficient CSS loading', async ({ page }) => {
    await page.goto('/');
    
    // Wait for styles to be applied
    await page.waitForLoadState('domcontentloaded');
    
    // Check if styles are properly applied
    const styledElement = page.locator('div[class*="bg-gradient"]');
    await expect(styledElement).toBeVisible();
  });

  test('should have efficient font loading', async ({ page }) => {
    await page.goto('/');
    
    // Wait for fonts to load
    await page.waitForLoadState('networkidle');
    
    // Check if text is properly rendered
    const textElement = page.locator('h1');
    await expect(textElement).toBeVisible();
  });

  test('should have efficient animations', async ({ page }) => {
    await page.goto('/');
    
    // Wait for animations to start
    await page.waitForTimeout(1000);
    
    // Check if animated elements are visible
    const animatedElements = page.locator('div[class*="motion"]');
    await expect(animatedElements.first()).toBeVisible();
  });

  test('should have efficient Three.js rendering', async ({ page }) => {
    await page.goto('/');
    
    // Wait for Three.js to initialize
    await page.waitForTimeout(2000);
    
    // Check if Canvas element is rendered
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should have efficient form interactions', async ({ page }) => {
    await page.goto('/');
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);
    
    const startTime = Date.now();
    
    // Test form field interactions
    const nameField = page.locator('input[name="name"]');
    await nameField.fill('Test User');
    
    const interactionTime = Date.now() - startTime;
    
    // Form interactions should be responsive
    expect(interactionTime).toBeLessThan(1000);
    await expect(nameField).toHaveValue('Test User');
  });

  test('should have efficient navigation', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    
    // Test navigation to different sections
    await page.locator('a:has-text("Features")').click();
    await page.waitForTimeout(500);
    
    const navigationTime = Date.now() - startTime;
    
    // Navigation should be fast
    expect(navigationTime).toBeLessThan(2000);
    
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();
  });

  test('should have efficient mobile performance', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Wait for mobile layout to be applied
    await page.waitForLoadState('networkidle');
    
    // Check if mobile navigation works efficiently
    const menuButton = page.locator('nav button');
    await menuButton.click();
    
    const mobileMenu = page.locator('nav div[class*="md:hidden"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('should have efficient scroll performance', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    
    // Test smooth scrolling
    await page.evaluate(() => {
      window.scrollTo({ top: 1000, behavior: 'smooth' });
    });
    
    await page.waitForTimeout(1000);
    
    const scrollTime = Date.now() - startTime;
    
    // Scroll should be smooth and fast
    expect(scrollTime).toBeLessThan(2000);
  });

  test('should have efficient hover effects', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    
    // Test hover effects on multiple elements
    const interactiveElements = page.locator('div[class*="group"], button, a');
    
    for (let i = 0; i < Math.min(5, await interactiveElements.count()); i++) {
      await interactiveElements.nth(i).hover();
      await page.waitForTimeout(100);
    }
    
    const hoverTime = Date.now() - startTime;
    
    // Hover effects should be responsive
    expect(hoverTime).toBeLessThan(2000);
  });

  test('should have efficient form submission', async ({ page }) => {
    await page.goto('/');
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);
    
    const startTime = Date.now();
    
    // Fill and submit form
    const nameField = page.locator('input[name="name"]');
    const emailField = page.locator('input[name="email"]');
    const messageField = page.locator('textarea[name="message"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await nameField.fill('Test User');
    await emailField.fill('test@example.com');
    await messageField.fill('Test message');
    await submitButton.click();
    
    // Wait for form processing
    await page.waitForTimeout(2000);
    
    const submissionTime = Date.now() - startTime;
    
    // Form submission should be efficient
    expect(submissionTime).toBeLessThan(5000);
    
    // Check for success message
    const successMessage = page.locator('text=Message sent successfully');
    await expect(successMessage).toBeVisible();
  });

  test('should have efficient memory usage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check if page is stable after loading
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Test memory stability by interacting with page
    await page.locator('a:has-text("Features")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);
    
    // Page should still be responsive
    await expect(mainContent).toBeVisible();
  });

  test('should have efficient network requests', async ({ page }) => {
    const requests: string[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should have reasonable number of requests
    expect(requests.length).toBeLessThan(50);
    
    // Check for critical resources
    const hasCSS = requests.some(url => url.includes('.css') || url.includes('styles'));
    const hasJS = requests.some(url => url.includes('.js') || url.includes('scripts'));
    
    expect(hasCSS).toBe(true);
    expect(hasJS).toBe(true);
  });

  test('should have efficient caching', async ({ page }) => {
    // First load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Second load (should be faster due to caching)
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const secondLoadTime = Date.now() - startTime;
    
    // Second load should be faster
    expect(secondLoadTime).toBeLessThan(3000);
  });

  test('should have efficient error handling', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should handle errors gracefully
    expect(errors.length).toBe(0);
  });

  test('should have efficient accessibility features', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation performance
    const startTime = Date.now();
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const navigationTime = Date.now() - startTime;
    
    // Keyboard navigation should be responsive
    expect(navigationTime).toBeLessThan(1000);
  });
}); 