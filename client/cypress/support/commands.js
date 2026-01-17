/**
 * Commande Cypress custom — login via API.
 *
 * Plutot que de passer par le formulaire a chaque test,
 * on appelle directement l'endpoint /auth/login et on
 * stocke les tokens dans le localStorage.
 */
Cypress.Commands.add('login', (email = 'admin@kosma.dev', password = 'Admin123!') => {
    cy.request({
        method: 'POST',
        url: 'http://localhost:5000/api/v1/auth/login',
        body: { email, password },
    }).then(({ body }) => {
        window.localStorage.setItem('accessToken', body.data.accessToken);
        window.localStorage.setItem('refreshToken', body.data.refreshToken);
        cy.visit('/');
    });
});
