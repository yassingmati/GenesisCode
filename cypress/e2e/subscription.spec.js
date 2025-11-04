describe('Subscription Flow', () => {
  beforeEach(() => {
    cy.setAuthToken('test-token');
  });

  it('devrait afficher les plans disponibles', () => {
    cy.intercept('GET', '**/api/subscriptions/plans', { fixture: 'plans.json' }).as('getPlans');
    
    cy.visit('/subscription');
    cy.wait('@getPlans');
    
    cy.get('[data-testid="plan-card"]').should('have.length.at.least', 1);
  });

  it('devrait permettre de sélectionner un plan', () => {
    cy.intercept('GET', '**/api/subscriptions/plans', { fixture: 'plans.json' }).as('getPlans');
    cy.intercept('POST', '**/api/subscriptions/subscribe', { fixture: 'subscription-init.json' }).as('subscribe');
    
    cy.visit('/subscription');
    cy.wait('@getPlans');
    
    cy.get('[data-testid="plan-card"]').first().click();
    cy.wait('@subscribe');
    
    cy.url().should('include', 'payment');
  });
});

