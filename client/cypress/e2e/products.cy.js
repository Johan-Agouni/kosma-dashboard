describe('Products', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/products');
    });

    it('should display products list', () => {
        cy.get('table').should('be.visible');
        cy.contains('Produit').should('be.visible');
    });

    it('should navigate to create product', () => {
        cy.contains('Nouveau produit').click();
        cy.url().should('include', '/products/new');
        cy.contains('Nouveau produit').should('be.visible');
    });

    it('should search products', () => {
        cy.get('input[placeholder*="Rechercher"]').type('Sennheiser');
        cy.wait(500);
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });
});
