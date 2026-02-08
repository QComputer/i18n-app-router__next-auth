// Cypress custom commands
// Note: These are loaded at runtime by Cypress, not during Next.js build

// Theme switching command
const switchThemeCommand = (theme: string) => {
  cy.get('[aria-label*="theme"]').click();
  cy.contains(theme.charAt(0).toUpperCase() + theme.slice(1)).click();
};

// Locale switching command
const switchLocaleCommand = (locale: string) => {
  cy.get('[aria-label*="language"]').click();
  const localeNames: Record<string, string> = {
    en: 'English',
    fa: 'فارسی',
    ar: 'العربية',
    tr: 'Türkçe',
  };
  cy.contains(localeNames[locale] || locale).click();
};

// Login command
const loginCommand = (username: string, password: string) => {
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
};

// Signup command
const signupCommand = (username: string, password: string, role: string) => {
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('select[name="role"]').select(role);
  cy.get('button[type="submit"]').click();
};

// Signout command
const signoutCommand = () => {
  cy.get('button[aria-haspopup="menu"]').first().click();
  cy.wait(200);
  cy.contains('Sign Out').click();
};

// Export for module usage
export {
  switchThemeCommand,
  switchLocaleCommand,
  loginCommand,
  signupCommand,
  signoutCommand
};
