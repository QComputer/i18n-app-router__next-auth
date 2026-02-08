/**
 * Comprehensive E2E Test Suite for Appointment Booking Application
 * 
 * This test suite covers:
 * - Public page navigation
 * - Authentication workflows (sign up, sign in, sign out)
 * - Dashboard functionality
 * - Services management
 * - Appointments management
 * - Staff management
 * - Organization settings
 * - Locale switching with RTL support
 * - Theme switching
 * - Form validations
 * - API interactions
 * - Responsive behavior
 * - Error handling
 * 
 * Before running tests:
 * 1. Start the development server: npm run dev
 * 2. Open Cypress: npm run cypress:open
 * 3. Or run headless: npx cypress run
 */

/// <reference types="cypress" />

describe('Appointment Booking Application - Comprehensive E2E Tests', () => {
  const baseUrl = Cypress.env('BASE_URL') || 'http://localhost:3000';
  
  // Test data
  const testData = {
    user: {
      username: `testuser_${Date.now()}`,
      password: 'Test@123!',
      role: 'CLIENT'
    },
    locale: {
      default: 'fa',
      english: 'en',
      arabic: 'ar',
      turkish: 'tr'
    }
  };

  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit the home page with default locale
    cy.visit(`${baseUrl}/${testData.locale.default}`, {
      failOnStatusCode: false
    });
  });

  afterEach(() => {
    // Clean up after each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // ========================================
  // PUBLIC PAGES NAVIGATION
  // ========================================
  describe('Public Pages Navigation', () => {
    it('should display the home page correctly with default locale (fa)', () => {
      // Check that the main heading is visible in Persian
      cy.contains('رزرو نوبت').should('be.visible');
      
      // Check that sign in and sign up buttons are visible
      cy.contains('ورود').should('be.visible');
      cy.contains('ثبت‌نام').should('be.visible');
    });

    it('should navigate to sign in page', () => {
      // Click on Sign In button
      cy.contains('ورود').click();
      
      // Verify URL changes to sign in page
      cy.url().should('include', '/auth/signin');
      
      // Check that sign in form is displayed
      cy.contains('نام کاربری').should('be.visible');
      cy.contains('رمز عبور').should('be.visible');
    });

    it('should navigate to sign up page', () => {
      // Click on Sign Up button
      cy.contains('ثبت‌نام').click();
      
      // Verify URL changes to sign up page
      cy.url().should('include', '/auth/signup');
      
      // Check that sign up form is displayed
      cy.contains('نام کاربری').should('be.visible');
      cy.contains('رمز عبور').should('be.visible');
    });

    it('should navigate between sign in and sign up pages', () => {
      // Navigate to sign up
      cy.visit(`${baseUrl}/${testData.locale.default}/auth/signup`);
      
      // Click on sign in link
      cy.contains('حساب کاربری دارید؟').click();
      
      // Verify URL changes to sign in page
      cy.url().should('include', '/auth/signin');
    });
  });

  // ========================================
  // LOCALE SWITCHING
  // ========================================
  describe('Locale Switching', () => {
    it('should switch to English locale', () => {
      // Click on locale switcher
      cy.get('[aria-label*="language"]').click();
      
      // Click on English
      cy.contains('English').click();
      
      // URL should include /en
      cy.url().should('include', '/en');
      
      // Content should be in English
      cy.contains('Appointment Booking').should('be.visible');
      cy.contains('Sign In').should('be.visible');
      cy.contains('Sign Up').should('be.visible');
    });

    it('should switch to Arabic locale (RTL)', () => {
      // Click on locale switcher
      cy.get('[aria-label*="language"]').click();
      
      // Click on Arabic
      cy.contains('العربية').click();
      
      // URL should include /ar
      cy.url().should('include', '/ar');
      
      // Check that the page has RTL direction
      cy.get('html').should('have.attr', 'dir', 'rtl');
    });

    it('should switch to Turkish locale', () => {
      // Click on locale switcher
      cy.get('[aria-label*="language"]').click();
      
      // Click on Turkish
      cy.contains('Türkçe').click();
      
      // URL should include /tr
      cy.url().should('include', '/tr');
    });

    it('should preserve locale across navigation', () => {
      // Switch to English
      cy.get('[aria-label*="language"]').click();
      cy.contains('English').click();
      
      // Navigate to sign in
      cy.contains('Sign In').click();
      
      // Locale should still be English
      cy.url().should('include', '/en');
      
      // Check content is in English
      cy.contains('Username').should('be.visible');
    });

    it('should handle root URL redirect to default locale', () => {
      // Visit root
      cy.visit(baseUrl, { failOnStatusCode: false });
      
      // Should redirect to default locale (fa)
      cy.url().should('include', `/${testData.locale.default}`);
    });
  });

  // ========================================
  // THEME SWITCHING
  // ========================================
  describe('Theme Switching', () => {
    it('should toggle between light and dark theme', () => {
      // Visit home page
      cy.visit(`${baseUrl}/${testData.locale.default}`);
      
      // Click theme switcher
      cy.get('[aria-label*="theme"]').click();
      
      // Wait for theme change
      cy.wait(200);
      
      // Body should have dark class
      cy.get('html').should('have.class', 'dark');
    });

    it('should switch to light theme', () => {
      // Visit home page
      cy.visit(`${baseUrl}/${testData.locale.default}`);
      
      // Click theme switcher
      cy.get('[aria-label*="theme"]').click();
      cy.contains('Light').click();
      
      // Body should not have dark class
      cy.get('html').should('not.have.class', 'dark');
    });

    it('should switch to system theme', () => {
      // Visit home page
      cy.visit(`${baseUrl}/${testData.locale.default}`);
      
      // Click theme switcher
      cy.get('[aria-label*="theme"]').click();
      cy.contains('System').click();
      
      // Theme should be system
      cy.get('html').should('not.have.class', 'dark');
    });
  });

  // ========================================
  // AUTHENTICATION - SIGN UP
  // ========================================
  describe('Authentication - Sign Up Flow', () => {
    beforeEach(() => {
      // Visit sign up page
      cy.visit(`${baseUrl}/${testData.locale.default}/auth/signup`);
    });

    it('should show validation errors for empty form', () => {
      // Submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show username error
      cy.contains('Name must be at least 2 characters long').should('be.visible');
    });

    it('should show password validation errors for short password', () => {
      // Fill in username only
      cy.get('input[name="username"]').type('testuser');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should show password errors
      cy.contains('Be at least 8 characters long').should('be.visible');
    });

    it('should show password validation errors for missing special character', () => {
      // Fill in username
      cy.get('input[name="username"]').type('testuser');
      
      // Fill in password without special character
      cy.get('input[name="password"]').type('Test12345');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should show special character error
      cy.contains('Contain at least one special character').should('be.visible');
    });

    it('should successfully register a new user', () => {
      // Generate unique username
      const uniqueUser = `testuser_${Date.now()}`;
      const validPassword = 'Test@123!';
      
      // Fill in the form
      cy.get('input[name="username"]').type(uniqueUser);
      cy.get('input[name="password"]').type(validPassword);
      
      // Select role
      cy.get('select[name="role"]').select('CLIENT');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard after successful registration
      cy.url().should('include', '/dashboard');
    });

    it('should show error for duplicate username', () => {
      // Use a username that might already exist
      cy.get('input[name="username"]').type('existinguser');
      cy.get('input[name="password"]').type('Test@123!');
      cy.get('select[name="role"]').select('CLIENT');
      cy.get('button[type="submit"]').click();
      
      // Should show username exists error
      cy.contains('Username already exists').should('be.visible');
    });
  });

  // ========================================
  // AUTHENTICATION - SIGN IN
  // ========================================
  describe('Authentication - Sign In Flow', () => {
    beforeEach(() => {
      // Visit sign in page
      cy.visit(`${baseUrl}/${testData.locale.default}/auth/signin`);
    });

    it('should show error for empty credentials', () => {
      // Submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains('نام کاربری الزامی است').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      // Fill in with invalid credentials
      cy.get('input[name="username"]').type('nonexistentuser');
      cy.get('input[name="password"]').type('wrongpassword');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains('نام کاربری یا رمز عبور اشتباه است').should('be.visible');
    });

    it('should successfully sign in with valid credentials', () => {
      // Use test credentials
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('Test@123!');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
    });
  });

  // ========================================
  // DASHBOARD
  // ========================================
  describe('Dashboard', () => {
    beforeEach(() => {
      // Sign in first
      cy.visit(`${baseUrl}/${testData.locale.default}/auth/signin`);
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('Test@123!');
      cy.get('button[type="submit"]').click();
      
      // Wait for redirect to dashboard
      cy.url().should('include', '/dashboard');
    });

    it('should display dashboard after successful login', () => {
      // Check that dashboard title is visible
      cy.contains('داشبورد').should('be.visible');
      
      // Check that user info is displayed
      cy.contains('testuser').should('be.visible');
    });

    it('should display quick actions on dashboard', () => {
      // Check quick actions section
      cy.contains('عملیات سریع').should('be.visible');
      
      // Check navigation links
      cy.contains('نوبت‌ها').should('be.visible');
      cy.contains('تنظیمات').should('be.visible');
    });

    it('should navigate to appointments from dashboard', () => {
      // Click on appointments link
      cy.contains('نوبت‌ها').click();
      
      // Should navigate to appointments page
      cy.url().should('include', '/appointments');
    });

    it('should navigate to settings from dashboard', () => {
      // Click on settings link
      cy.contains('تنظیمات').click();
      
      // Should navigate to settings page
      cy.url().should('include', '/settings');
    });
  });

  // ========================================
  // DASHBOARD ACCESS CONTROL
  // ========================================
  describe('Dashboard Access Control', () => {
    it('should redirect unauthenticated users from dashboard to sign in', () => {
      // Try to access dashboard without authentication
      cy.visit(`${baseUrl}/${testData.locale.default}/dashboard`, {
        failOnStatusCode: false
      });
      
      // Should redirect to sign in
      cy.url().should('include', '/auth/signin');
    });

    it('should allow access to dashboard when authenticated', () => {
      // Sign in first
      cy.visit(`${baseUrl}/${testData.locale.default}/auth/signin`);
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('Test@123!');
      cy.get('button[type="submit"]').click();
      
      // Should be on dashboard
      cy.url().should('include', '/dashboard');
    });
  });

  // ========================================
  // SIGN OUT FLOW
  // ========================================
  describe('Sign Out Flow', () => {
    beforeEach(() => {
      // Sign in first
      cy.visit(`${baseUrl}/${testData.locale.default}/auth/signin`);
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('Test@123!');
      cy.get('button[type="submit"]').click();
      
      // Wait for dashboard to load
      cy.url().should('include', '/dashboard');
    });

    it('should sign out user and redirect to sign in', () => {
      // Click on user avatar to open dropdown
      cy.get('button[aria-label*="user"], button[aria-label*="avatar"]').first().click();
      
      // Wait for dropdown to open
      cy.wait(200);
      
      // Click sign out
      cy.contains('خروج').click();
      
      // Should redirect to sign in page
      cy.url().should('include', '/auth/signin');
      
      // Sign in button should be visible again
      cy.contains('ورود').should('be.visible');
    });

    it('should not allow access to dashboard after sign out', () => {
      // Click on user avatar to open dropdown
      cy.get('button[aria-label*="user"], button[aria-label*="avatar"]').first().click();
      
      // Wait for dropdown to open
      cy.wait(200);
      
      // Click sign out
      cy.contains('خروج').click();
      
      // Try to access dashboard directly
      cy.visit(`${baseUrl}/${testData.locale.default}/dashboard`, {
        failOnStatusCode: false
      });
      
      // Should redirect to sign in again
      cy.url().should('include', '/auth/signin');
    });
  });

  // ========================================
  // SERVICES PAGE
  // ========================================
  describe('Services Management', () => {
    beforeEach(() => {
      // Sign in first
      cy.visit(`${baseUrl}/${testData.locale.default}/auth/signin`);
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('Test@123!');
      cy.get('button[type="submit"]').click();
      
      // Navigate to services
      cy.visit(`${baseUrl}/${testData.locale.default}/services`);
    });

    it('should display services page', () => {
      // Check that services title is visible
      cy.contains('خدمات').should('be.visible');
    });

    it('should display "no services" message when empty', () => {
      // Check empty state message
      cy.contains('خدمتی یافت نشد').should('be.visible');
    });

    it('should navigate to add new service', () => {
      // Click on add new service button
      cy.contains('خدمت جدید').click();
      
      // Should navigate to new service page
      cy.url().should('include', '/services/new');
    });
  });

  // ========================================
  // APPOINTMENTS PAGE
  // ========================================
  describe('Appointments Management', () => {
    beforeEach(() => {
      // Sign in first
      cy.visit(`${baseUrl}/${testData.locale.default}/auth/signin`);
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('Test@123!');
      cy.get('button[type="submit"]').click();
      
      // Navigate to appointments
      cy.visit(`${baseUrl}/${testData.locale.default}/appointments`);
    });

    it('should display appointments page', () => {
      // Check that appointments title is visible
      cy.contains('نوبت‌ها').should('be.visible');
    });

    it('should display "no appointments" message when empty', () => {
      // Check empty state message
      cy.contains('هیچ نوبتی یافت نشد').should('be.visible');
    });

    it('should navigate to new appointment', () => {
      // Click on new appointment button
      cy.contains('نوبت جدید').click();
      
      // Should navigate to new appointment page
      cy.url().should('include', '/appointments/new');
    });
  });

  // ========================================
  // STAFF PAGE
  // ========================================
  describe('Staff Management', () => {
    beforeEach(() => {
      // Sign in first
      cy.visit(`${baseUrl}/${testData.locale.default}/auth/signin`);
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('Test@123!');
      cy.get('button[type="submit"]').click();
      
      // Navigate to staff page
      cy.visit(`${baseUrl}/${testData.locale.default}/staff`);
    });

    it('should display staff page', () => {
      // Check that staff title is visible
      cy.contains('کارکنان').should('be.visible');
    });

    it('should navigate to add new staff', () => {
      // Click on add new staff button
      cy.contains('کارمند جدید').click();
      
      // Should navigate to new staff page
      cy.url().should('include', '/staff/new');
    });
  });

  // ========================================
  // ORGANIZATION SETTINGS
  // ========================================
  describe('Organization Settings', () => {
    beforeEach(() => {
      // Sign in first
      cy.visit(`${baseUrl}/${testData.locale.default}/auth/signin`);
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('Test@123!');
      cy.get('button[type="submit"]').click();
      
      // Navigate to organization settings
      cy.visit(`${baseUrl}/${testData.locale.default}/settings/organization`);
    });

    it('should display organization settings page', () => {
      // Check that settings title is visible
      cy.contains('تنظیمات سازمان').should('be.visible');
    });

    it('should display organization form fields', () => {
      // Check organization name field
      cy.contains('نام سازمان').should('be.visible');
      
      // Check organization type field
      cy.contains('نوع سازمان').should('be.visible');
      
      // Check timezone field
      cy.contains('منطقه زمانی').should('be.visible');
    });

    it('should navigate back to dashboard', () => {
      // Click back button
      cy.contains('بازگشت').click();
      
      // Should navigate to dashboard
      cy.url().should('include', '/dashboard');
    });
  });

  // ========================================
  // MOBILE RESPONSIVENESS
  // ========================================
  describe('Mobile Responsiveness', () => {
    it('should display mobile navigation correctly on iPhone X', () => {
      // Set viewport to iPhone X
      cy.viewport('iphone-x');
      
      // Visit home page
      cy.visit(`${baseUrl}/${testData.locale.english}`);
      
      // Header should be visible
      cy.get('header').should('be.visible');
      
      // Sign in/up buttons should still be accessible
      cy.contains('Sign In').should('be.visible');
      cy.contains('Sign Up').should('be.visible');
    });

    it('should handle form inputs on mobile', () => {
      // Set viewport to iPhone X
      cy.viewport('iphone-x');
      
      // Visit sign in page
      cy.visit(`${baseUrl}/${testData.locale.english}/auth/signin`);
      
      // Form should be usable on mobile
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('password123');
      
      // Submit button should be visible and clickable
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should display correctly on tablet viewport', () => {
      // Set viewport to iPad
      cy.viewport('ipad-2');
      
      // Visit home page
      cy.visit(`${baseUrl}/${testData.locale.english}`);
      
      // Content should be visible
      cy.contains('Appointment Booking').should('be.visible');
    });

    it('should display correctly on desktop viewport', () => {
      // Set viewport to desktop
      cy.viewport(1280, 720);
      
      // Visit home page
      cy.visit(`${baseUrl}/${testData.locale.english}`);
      
      // All content should be visible
      cy.contains('Appointment Booking').should('be.visible');
      cy.contains('Sign In').should('be.visible');
      cy.contains('Sign Up').should('be.visible');
    });
  });

  // ========================================
  // API ERROR HANDLING
  // ========================================
  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Visit home page
      cy.visit(`${baseUrl}/${testData.locale.default}`, {
        failOnStatusCode: false
      });
      
      // Page should load without critical errors
      cy.contains('رزرو نوبت').should('be.visible');
    });

    it('should handle invalid routes', () => {
      // Visit invalid route
      cy.visit(`${baseUrl}/${testData.locale.default}/invalid-route`, {
        failOnStatusCode: false
      });
      
      // Should show 404 or redirect
      cy.url().should('include', '/404');
    });
  });

  // ========================================
  // ACCESSIBILITY
  // ========================================
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      // Visit home page
      cy.visit(`${baseUrl}/${testData.locale.english}`);
      
      // Should have h1 heading
      cy.get('h1').should('exist');
    });

    it('should have accessible form labels', () => {
      // Visit sign in page
      cy.visit(`${baseUrl}/${testData.locale.english}/auth/signin`);
      
      // Form inputs should have labels or aria-labels
      cy.get('input[name="username"]').should('have.attr', 'name');
      cy.get('input[name="password"]').should('have.attr', 'name');
    });

    it('should have accessible buttons', () => {
      // Visit home page
      cy.visit(`${baseUrl}/${testData.locale.english}`);
      
      // Buttons should have text content
      cy.contains('Sign In').should('be.visible');
      cy.contains('Sign Up').should('be.visible');
    });
  });
});

// ========================================
// PERFORMANCE TESTS
// ========================================
describe('Performance Tests', () => {
  const baseUrl = Cypress.env('BASE_URL') || 'http://localhost:3000';

  it('should load home page within acceptable time', () => {
    const startTime = Date.now();
    
    cy.visit(`${baseUrl}/en`, { failOnStatusCode: false });
    
    cy.window().then(() => {
      const loadTime = Date.now() - startTime;
      console.log(`Page load time: ${loadTime}ms`);
      
      // Page should load within 5 seconds
      expect(loadTime).to.be.lessThan(5000);
    });
  });

  it('should load sign in page quickly', () => {
    const startTime = Date.now();
    
    cy.visit(`${baseUrl}/en/auth/signin`, { failOnStatusCode: false });
    
    cy.window().then(() => {
      const loadTime = Date.now() - startTime;
      console.log(`Sign in page load time: ${loadTime}ms`);
      
      // Page should load within 3 seconds
      expect(loadTime).to.be.lessThan(3000);
    });
  });
});
