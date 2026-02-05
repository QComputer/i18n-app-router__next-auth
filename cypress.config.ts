/**
 * Cypress Configuration
 * 
 * This configuration file sets up Cypress for end-to-end testing
 * of the Next.js appointment booking application.
 */

import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "appointment-booking",

  /**
   * Environment variables available in Cypress tests
   */
  env: {
    // Base URL for the application (defaults to localhost:3000)
    BASE_URL: "http://localhost:3000",
    
    // Test user credentials (should be set in CI or .env)
    TEST_USERNAME: "testuser",
    TEST_PASSWORD: "Test@123!",
  },

  /**
   * End-to-End Testing Configuration
   */
  e2e: {
    // Base URL for all e2e tests
    baseUrl: "http://localhost:3000",
    
    // Viewport settings for consistent testing
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Video recording settings
    video: true,
    videoCompression: 32,
    videosFolder: "cypress/videos",
    
    // Screenshot settings
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",
    
    // Test file patterns
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    
    // Support file
    supportFile: "cypress/support/e2e.ts",
    
    // Setup node event listeners
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      // For example: intercept network requests, modify responses
      
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
    
    // Default command timeout
    defaultCommandTimeout: 10000,
    
    // Increase timeout for slow network requests
    requestTimeout: 30000,
    
    // Number of retries for failed tests
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },

  /**
   * Component Testing Configuration
   */
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    
    // Component test file pattern
    specPattern: "cypress/**/*.cy.{js,jsx,ts,tsx}",
    
    supportFile: "cypress/support/component.ts",
  },

  /**
   * Configuration that applies to both e2e and component testing
   */
  includeShadowDom: true,
  
  // Scroll behavior for element interactions
  scrollBehavior: "center",
});
