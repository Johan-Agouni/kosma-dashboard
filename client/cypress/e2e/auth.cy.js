describe('Authentication', () => {
    it('should display login page', () => {
        cy.visit('/login');
        cy.contains('Kosma').should('be.visible');
        cy.contains('Connectez-vous').should('be.visible');
    });

    it('should login with valid credentials', () => {
        cy.login();
        cy.contains('Bonjour').should('be.visible');
    });

    it('should show error with invalid credentials', () => {
        cy.visit('/login');
        cy.get('input[type="email"]').type('wrong@test.com');
        cy.get('input[type="password"]').type('WrongPass1');
        cy.get('button[type="submit"]').click();
        // Le toast react-hot-toast utilise role="status"
        cy.get('[role="status"]', { timeout: 10000 }).should('exist');
    });

    it('should redirect unauthenticated user to login', () => {
        cy.visit('/');
        cy.url().should('include', '/login');
    });
});
