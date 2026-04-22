describe('Household Inventory E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the inventory page with a table', () => {
    cy.get('table').should('exist')
  })

  it('should show column headers', () => {
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Qty').should('be.visible')
    cy.contains('th', 'Actions').should('be.visible')
  })

  it('should add a new inventory item and show it in table row', () => {
    cy.contains('Add New Item').click()

    cy.get('#name').type('Test Milk')
    cy.get('#quantity').type('2')
    cy.get('#category').select('Groceries')
    cy.get('#expirationDate').type('2026-12-31')

    cy.get('button[type="submit"]').click()

    cy.get('table tr').contains('Test Milk').should('be.visible')
    cy.get('table tr').contains('Groceries').should('be.visible')
  })

  it('should update item quantity using + button in table row', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label*="Increase quantity"]').click()
    })
  })

  it('should delete an item and show Sonner undo toast', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label*="Remove"]').click()
    })
    cy.contains('Undo').should('be.visible')
  })

  it('should handle form validation', () => {
    cy.contains('Add New Item').click()

    cy.get('button[type="submit"]').click()

    cy.contains('Name is required').should('be.visible')
    cy.contains('Quantity must be greater than 0').should('be.visible')
    cy.contains('Category is required').should('be.visible')
  })
})
