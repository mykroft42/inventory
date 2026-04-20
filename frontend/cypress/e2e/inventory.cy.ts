describe('Household Inventory E2E Tests', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/')
  })

  it('should display the inventory page', () => {
    cy.contains('Inventory Items').should('be.visible')
  })

  it('should add a new inventory item', () => {
    // Navigate to add item page
    cy.contains('Add Item').click()

    // Fill out the form
    cy.get('#name').type('Test Milk')
    cy.get('#quantity').type('2')
    cy.get('#category').select('Groceries')
    cy.get('#expirationDate').type('2026-12-31')

    // Submit the form
    cy.get('button[type="submit"]').click()

    // Verify the item appears in the inventory
    cy.contains('Test Milk').should('be.visible')
    cy.contains('Groceries').should('be.visible')
    cy.contains('2').should('be.visible')
  })

  it('should update item quantity', () => {
    // Assuming there's an item with quantity > 0
    cy.get('.inventory-item').first().within(() => {
      cy.contains('Quantity:').should('be.visible')

      // Click the increase button
      cy.get('button').contains('+').click()

      // Verify quantity increased
      cy.contains('Quantity:').should('be.visible')
    })
  })

  it('should handle form validation', () => {
    cy.contains('Add Item').click()

    // Try to submit empty form
    cy.get('button[type="submit"]').click()

    // Check for validation errors
    cy.contains('Name is required').should('be.visible')
    cy.contains('Quantity must be greater than 0').should('be.visible')
    cy.contains('Category is required').should('be.visible')
  })
})