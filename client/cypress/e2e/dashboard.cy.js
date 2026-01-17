describe('Dashboard', () => {
    beforeEach(() => {
        cy.login();
    });

    it('should display stats cards', () => {
        cy.contains('Revenu du mois').should('be.visible');
        cy.contains('Produits actifs').should('be.visible');
        cy.contains('Stock bas').should('be.visible');
    });

    it('should display charts', () => {
        cy.contains('Revenus (12 mois)').should('be.visible');
        cy.contains('Top 5 produits').should('be.visible');
    });

    it('should navigate to products via sidebar', () => {
        cy.get('nav[aria-label="Menu principal"]').contains('Produits').click();
        cy.url().should('include', '/products');
    });

    it('should navigate to orders via sidebar', () => {
        cy.get('nav[aria-label="Menu principal"]').contains('Commandes').click();
        cy.url().should('include', '/orders');
    });

    it('should toggle theme', () => {
        cy.get('button[aria-label*="mode"]').click();
        cy.get('html').should('have.attr', 'data-theme');
    });
});
