/**
 * Authentication Workflow Tests
 * 
 * This test suite covers:
 * - Public page navigation
 * - Sign up flow
 * - Sign in flow
 * - Dashboard access control
 * - Sign out functionality
 * - Locale switching
 * 
 * Before running tests:
 * 1. Start the development server: npm run dev
 * 2. Open Cypress: npm run cypress:open
 */

/// <reference types="cypress" />

describe("Authentication Workflow", () => {
  /**
   * Base URL configuration
   * Uses environment variable or default to localhost
   */
  const baseUrl = Cypress.env("BASE_URL") || "http://localhost:3000";
  const defaultLocale = "fa";

  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit the home page
    cy.visit(`${baseUrl}/${defaultLocale}`);
  });

  describe("Public Pages Navigation", () => {
    it("should display the home page correctly", () => {
      // Check that the main heading is visible
      cy.contains("Appointment Booking").should("be.visible");
      
      // Check that sign in and sign up buttons are visible
      cy.contains("Sign In").should("be.visible");
      cy.contains("Sign Up").should("be.visible");
    });

    it("should navigate to sign in page", () => {
      // Click on Sign In button
      cy.contains("Sign In").click();
      
      // Verify URL changes to sign in page
      cy.url().should("include", "/auth/signin");
      
      // Check that sign in form is displayed
      cy.contains("Sign in to your account").should("be.visible");
    });

    it("should navigate to sign up page", () => {
      // Click on Sign Up button
      cy.contains("Sign Up").click();
      
      // Verify URL changes to sign up page
      cy.url().should("include", "/auth/signup");
      
      // Check that sign up form is displayed
      cy.contains("Create your account").should("be.visible");
    });

    it("should navigate to sign in page from sign up", () => {
      // Navigate to sign up
      cy.visit(`${baseUrl}/${defaultLocale}/auth/signup`);
      
      // Click on sign in link
      cy.contains("Sign in").click();
      
      // Verify URL changes to sign in page
      cy.url().should("include", "/auth/signin");
    });

    it("should navigate to sign up page from sign in", () => {
      // Navigate to sign in
      cy.visit(`${baseUrl}/${defaultLocale}/auth/signin`);
      
      // Click on sign up link
      cy.contains("Create an account").click();
      
      // Verify URL changes to sign up page
      cy.url().should("include", "/auth/signup");
    });
  });

  describe("Locale Switching", () => {
    it("should redirect root to default locale (fa)", () => {
      // Visit root
      cy.visit(baseUrl);
      
      // Should redirect to default locale
      cy.url().should("include", `/${defaultLocale}`);
    });

    it("should switch to English locale", () => {
      // Click on locale switcher
      cy.get('[aria-label="Toggle language"]').click();
      
      // Click on English
      cy.contains("English").click();
      
      // URL should include /en
      cy.url().should("include", "/en");
      
      // Content should be in English
      cy.contains("Appointment Booking").should("be.visible");
    });

    it("should switch to Turkish locale", () => {
      // Click on locale switcher
      cy.get('[aria-label="Toggle language"]').click();
      
      // Click on Turkish
      cy.contains("Türkçe").click();
      
      // URL should include /tr
      cy.url().should("include", "/tr");
    });

    it("should preserve locale across navigation", () => {
      // Switch to English
      cy.get('[aria-label="Toggle language"]').click();
      cy.contains("English").click();
      
      // Navigate to sign in
      cy.contains("Sign In").click();
      
      // Locale should still be English
      cy.url().should("include", "/en");
    });
  });

  describe("Sign Up Flow", () => {
    beforeEach(() => {
      // Visit sign up page
      cy.visit(`${baseUrl}/${defaultLocale}/auth/signup`);
    });

    it("should show validation errors for empty form", () => {
      // Submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show username error
      cy.contains("Name must be at least 2 characters long").should("be.visible");
    });

    it("should show password validation errors", () => {
      // Fill in username only
      cy.get('input[name="username"]').type("testuser");
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should show password errors
      cy.contains("Be at least 8 characters long").should("be.visible");
    });

    it("should successfully register a new user", () => {
      // Generate unique username
      const uniqueUser = `testuser_${Date.now()}`;
      const validPassword = "Test@123!";
      
      // Fill in the form
      cy.get('input[name="username"]').type(uniqueUser);
      cy.get('input[name="password"]').type(validPassword);
      
      // Select role
      cy.get('select[name="role"]').select("CLIENT");
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard after successful registration
      cy.url().should("include", "/dashboard");
    });

    it("should show error for existing username", () => {
      // Use a username that might already exist
      cy.get('input[name="username"]').type("existinguser");
      cy.get('input[name="password"]').type("Test@123!");
      cy.get('button[type="submit"]').click();
      
      // Should show username exists error
      cy.contains("Username already exists").should("be.visible");
    });
  });

  describe("Sign In Flow", () => {
    beforeEach(() => {
      // Visit sign in page
      cy.visit(`${baseUrl}/${defaultLocale}/auth/signin`);
    });

    it("should show error for empty credentials", () => {
      // Submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains("Invalid username or password").should("be.visible");
    });

    it("should show error for invalid credentials", () => {
      // Fill in with invalid credentials
      cy.get('input[name="username"]').type("nonexistentuser");
      cy.get('input[name="password"]').type("wrongpassword");
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains("Invalid username or password").should("be.visible");
    });

    it("should successfully sign in with valid credentials", () => {
      // Use credentials from fixtures or environment
      const username = Cypress.env("TEST_USERNAME") || "testuser";
      const password = Cypress.env("TEST_PASSWORD") || "Test@123!";
      
      // Fill in credentials
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="password"]').type(password);
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should("include", "/dashboard");
    });
  });

  describe("Dashboard Access Control", () => {
    it("should redirect unauthenticated users from dashboard to sign in", () => {
      // Try to access dashboard without authentication
      cy.visit(`${baseUrl}/${defaultLocale}/dashboard`);
      
      // Should redirect to sign in
      cy.url().should("include", "/auth/signin");
    });

    it("should allow access to dashboard when authenticated", () => {
      // Sign in first
      const username = Cypress.env("TEST_USERNAME") || "testuser";
      const password = Cypress.env("TEST_PASSWORD") || "Test@123!";
      
      // Sign in
      cy.visit(`${baseUrl}/${defaultLocale}/auth/signin`);
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      
      // Should be on dashboard
      cy.url().should("include", "/dashboard");
      
      // Should see user info
      cy.contains(username).should("be.visible");
    });
  });

  describe("Sign Out Flow", () => {
    beforeEach(() => {
      // Sign in first
      const username = Cypress.env("TEST_USERNAME") || "testuser";
      const password = Cypress.env("TEST_PASSWORD") || "Test@123!";
      
      cy.visit(`${baseUrl}/${defaultLocale}/auth/signin`);
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      
      // Wait for dashboard to load
      cy.url().should("include", "/dashboard");
    });

    it("should sign out user and redirect to sign in", () => {
      // Click sign out button
      cy.contains("Sign Out").click();
      
      // Should redirect to sign in page
      cy.url().should("include", "/auth/signin");
      
      // Sign in button should be visible again
      cy.contains("Sign In").should("be.visible");
    });

    it("should not allow access to dashboard after sign out", () => {
      // Sign out first
      cy.contains("Sign Out").click();
      
      // Try to access dashboard directly
      cy.visit(`${baseUrl}/${defaultLocale}/dashboard`);
      
      // Should redirect to sign in again
      cy.url().should("include", "/auth/signin");
    });
  });

  describe("Theme Switching", () => {
    it("should toggle between light and dark theme", () => {
      // Initial state should have system/light theme
      cy.visit(`${baseUrl}/${defaultLocale}`);
      
      // Click theme switcher
      cy.get('[data-theme-toggle]').click();
      
      // Body should have dark class
      cy.get("html").should("have.class", "dark");
    });
  });
});

describe("User Registration and Login E2E Test", () => {
  const baseUrl = Cypress.env("BASE_URL") || "http://localhost:3000";
  const locale = "en";
  
  /**
   * Test user credentials
   * These should be unique for each test run
   */
  const testUser = {
    username: `e2e_test_${Date.now()}`,
    password: "Test@123!",
    role: "CLIENT"
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should complete full registration and login flow", () => {
    // Step 1: Visit home page
    cy.visit(`${baseUrl}/${locale}`);
    cy.contains("Appointment Booking").should("be.visible");
    
    // Step 2: Navigate to sign up
    cy.contains("Sign Up").click();
    cy.url().should("include", "/auth/signup");
    
    // Step 3: Fill registration form
    cy.get('input[name="username"]').type(testUser.username);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('select[name="role"]').select(testUser.role);
    
    // Step 4: Submit registration
    cy.get('button[type="submit"]').click();
    
    // Step 5: Verify redirect to dashboard
    cy.url().should("include", "/dashboard");
    cy.contains(testUser.username).should("be.visible");
    
    // Step 6: Verify user avatar is displayed in navbar
    cy.get("header").find("button").should("be.visible");
    
    // Step 7: Sign out
    cy.contains("Sign Out").click();
    
    // Step 8: Verify redirected to sign in
    cy.url().should("include", "/auth/signin");
    
    // Step 9: Login with newly created credentials
    cy.get('input[name="username"]').type(testUser.username);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Step 10: Verify successful login
    cy.url().should("include", "/dashboard");
    cy.contains(testUser.username).should("be.visible");
    
    // Step 11: Clean up - sign out
    cy.contains("Sign Out").click();
  });
});

describe("Mobile Responsiveness", () => {
  const baseUrl = Cypress.env("BASE_URL") || "http://localhost:3000";
  const locale = "en";

  beforeEach(() => {
    cy.viewport("iphone-x");
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should display mobile navigation correctly", () => {
    cy.visit(`${baseUrl}/${locale}`);
    
    // Header should be visible
    cy.get("header").should("be.visible");
    
    // Sign in/up buttons should still be accessible
    cy.contains("Sign In").should("be.visible");
    cy.contains("Sign Up").should("be.visible");
  });

  it("should handle form inputs on mobile", () => {
    cy.visit(`${baseUrl}/${locale}/auth/signin`);
    
    // Form should be usable on mobile
    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    
    // Submit button should be visible and clickable
    cy.get('button[type="submit"]').should("be.visible");
  });
});
