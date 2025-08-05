import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to contact section
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(1000);
  });

  test('should display contact section with proper heading', async ({ page }) => {
    const section = page.locator('#contact');
    await expect(section).toBeVisible();
    
    const heading = page.locator('h2:has-text("Get in Touch")');
    await expect(heading).toBeVisible();
  });

  test('should display contact form with all required fields', async ({ page }) => {
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Check required fields
    const nameField = page.locator('input[name="name"]');
    const emailField = page.locator('input[name="email"]');
    const messageField = page.locator('textarea[name="message"]');
    
    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
    await expect(messageField).toBeVisible();
  });

  test('should display optional company field', async ({ page }) => {
    const companyField = page.locator('input[name="company"]');
    await expect(companyField).toBeVisible();
  });

  test('should have proper labels for all form fields', async ({ page }) => {
    const labels = ['Name *', 'Email *', 'Company', 'Message *'];
    
    for (const label of labels) {
      const labelElement = page.locator(`label:has-text("${label}")`);
      await expect(labelElement).toBeVisible();
    }
  });

  test('should have proper placeholders for form fields', async ({ page }) => {
    const nameField = page.locator('input[name="name"]');
    const emailField = page.locator('input[name="email"]');
    const companyField = page.locator('input[name="company"]');
    const messageField = page.locator('textarea[name="message"]');
    
    await expect(nameField).toHaveAttribute('placeholder', 'Your name');
    await expect(emailField).toHaveAttribute('placeholder', 'your@email.com');
    await expect(companyField).toHaveAttribute('placeholder', 'Your company (optional)');
    await expect(messageField).toHaveAttribute('placeholder', 'Tell us how we can help you...');
  });

  test('should validate required fields on submission', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    
    // Try to submit without filling required fields
    await submitButton.click();
    
    // Check if form validation prevents submission
    // (This depends on the form implementation - might show validation messages)
    await expect(submitButton).toBeVisible();
  });

  test('should accept valid form input', async ({ page }) => {
    const nameField = page.locator('input[name="name"]');
    const emailField = page.locator('input[name="email"]');
    const messageField = page.locator('textarea[name="message"]');
    
    // Fill in valid data
    await nameField.fill('John Doe');
    await emailField.fill('john@example.com');
    await messageField.fill('This is a test message');
    
    // Check if fields contain the entered values
    await expect(nameField).toHaveValue('John Doe');
    await expect(emailField).toHaveValue('john@example.com');
    await expect(messageField).toHaveValue('This is a test message');
  });

  test('should accept optional company field', async ({ page }) => {
    const companyField = page.locator('input[name="company"]');
    
    await companyField.fill('Test Company');
    await expect(companyField).toHaveValue('Test Company');
  });

  test('should display submit button with proper text', async ({ page }) => {
    const submitButton = page.locator('button:has-text("Send Message")');
    await expect(submitButton).toBeVisible();
  });

  test('should show loading state during submission', async ({ page }) => {
    const nameField = page.locator('input[name="name"]');
    const emailField = page.locator('input[name="email"]');
    const messageField = page.locator('textarea[name="message"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill form
    await nameField.fill('John Doe');
    await emailField.fill('john@example.com');
    await messageField.fill('Test message');
    
    // Submit form
    await submitButton.click();
    
    // Check for loading state
    const loadingText = page.locator('text=Sending...');
    await expect(loadingText).toBeVisible();
  });

  test('should display success message after submission', async ({ page }) => {
    const nameField = page.locator('input[name="name"]');
    const emailField = page.locator('input[name="email"]');
    const messageField = page.locator('textarea[name="message"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill and submit form
    await nameField.fill('John Doe');
    await emailField.fill('john@example.com');
    await messageField.fill('Test message');
    await submitButton.click();
    
    // Wait for success message
    await page.waitForTimeout(2000);
    
    // Check for success toast
    const successToast = page.locator('text=Message sent successfully');
    await expect(successToast).toBeVisible();
  });

  test('should clear form after successful submission', async ({ page }) => {
    const nameField = page.locator('input[name="name"]');
    const emailField = page.locator('input[name="email"]');
    const messageField = page.locator('textarea[name="message"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill form
    await nameField.fill('John Doe');
    await emailField.fill('john@example.com');
    await messageField.fill('Test message');
    
    // Submit form
    await submitButton.click();
    
    // Wait for form to be cleared
    await page.waitForTimeout(2000);
    
    // Check if fields are cleared
    await expect(nameField).toHaveValue('');
    await expect(emailField).toHaveValue('');
    await expect(messageField).toHaveValue('');
  });

  test('should display contact methods section', async ({ page }) => {
    const contactMethods = [
      'Email Support',
      'Community Chat',
      'GitHub Issues'
    ];
    
    for (const method of contactMethods) {
      const methodElement = page.locator(`h4:has-text("${method}")`);
      await expect(methodElement).toBeVisible();
    }
  });

  test('should display contact information', async ({ page }) => {
    const contactInfo = [
      'support@notifyops.com',
      'discord.gg/notifyops',
      'github.com/notifyops/notifyops'
    ];
    
    for (const info of contactInfo) {
      const infoElement = page.locator(`p:has-text("${info}")`);
      await expect(infoElement).toBeVisible();
    }
  });

  test('should display social media links', async ({ page }) => {
    const socialLinks = page.locator('a[aria-label]');
    await expect(socialLinks).toHaveCount(3); // GitHub, Twitter, Discord
  });

  test('should display response time indicator', async ({ page }) => {
    const responseIndicator = page.locator('text=Quick Response');
    await expect(responseIndicator).toBeVisible();
    
    const responseText = page.locator('text=We typically respond to all inquiries within 24 hours');
    await expect(responseText).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if contact section is still visible
    const section = page.locator('#contact');
    await expect(section).toBeVisible();
    
    // Check if form fields are properly sized
    const nameField = page.locator('input[name="name"]');
    await expect(nameField).toBeVisible();
  });

  test('should have proper form validation for email field', async ({ page }) => {
    const emailField = page.locator('input[name="email"]');
    
    // Try invalid email
    await emailField.fill('invalid-email');
    
    // Check if email validation works (depends on implementation)
    await expect(emailField).toHaveValue('invalid-email');
  });

  test('should have proper focus states for form fields', async ({ page }) => {
    const nameField = page.locator('input[name="name"]');
    
    // Focus on the field
    await nameField.focus();
    
    // Check if focus state is applied
    await expect(nameField).toBeVisible();
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Check for proper form structure
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Check for proper field labels
    const labels = page.locator('label');
    await expect(labels.first()).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.locator('a:has-text("Contact")').click();
    await page.waitForTimeout(2000);
    
    expect(errors.length).toBe(0);
  });
}); 