Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.wait(1000); // Attendre la redirection
});

Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage();
  cy.visit('/');
});

Cypress.Commands.add('setAuthToken', (token) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({ _id: 'test-user-id', email: 'test@example.com' }));
});

Cypress.Commands.add('visitWithAuth', (url, token = 'test-token') => {
  cy.setAuthToken(token);
  cy.visit(url);
});

