describe('Course Access Flow', () => {
  beforeEach(() => {
    cy.setAuthToken('test-token');
  });

  it('devrait vérifier l\'accès à un parcours', () => {
    cy.intercept('GET', '**/api/access/check*', { 
      fixture: 'access-granted.json' 
    }).as('checkAccess');
    
    cy.visit('/courses/test-path-id');
    cy.wait('@checkAccess');
    
    cy.get('[data-testid="course-content"]').should('be.visible');
  });

  it('devrait afficher un message de verrouillage si pas d\'accès', () => {
    cy.intercept('GET', '**/api/access/check*', { 
      statusCode: 403,
      body: { success: false, access: { hasAccess: false, reason: 'no_access' } }
    }).as('checkAccess');
    
    cy.visit('/courses/test-path-id');
    cy.wait('@checkAccess');
    
    cy.get('[data-testid="locked-message"]').should('be.visible');
  });

  it('devrait permettre d\'accéder au premier niveau gratuit', () => {
    cy.intercept('GET', '**/api/access/check*', { 
      fixture: 'access-free.json' 
    }).as('checkAccess');
    
    cy.visit('/courses/test-path-id/level/first-level-id');
    cy.wait('@checkAccess');
    
    cy.get('[data-testid="level-content"]').should('be.visible');
  });
});

