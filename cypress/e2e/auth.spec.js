describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('devrait afficher la page de login', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('devrait permettre la connexion', () => {
    cy.intercept('POST', '**/api/auth/login', { fixture: 'auth-success.json' }).as('login');
    
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@login');
    cy.url().should('not.include', '/login');
  });

  it('devrait permettre la déconnexion', () => {
    cy.setAuthToken('test-token');
    cy.visit('/dashboard');
    
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('include', '/login');
  });
});

