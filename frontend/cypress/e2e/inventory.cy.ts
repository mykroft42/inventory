describe('Household Inventory E2E Tests', () => {
  before(() => {
    // Seed one item so tests that need a populated table always have data
    cy.request({
      method: 'POST',
      url: 'http://localhost:5007/api/inventory',
      body: { name: 'E2E Seeded Item', quantity: 5 },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    })
  })

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
    cy.get('#quick-add-name').type('Cypress Test Milk')
    cy.get('#quick-add-qty').clear().type('3')
    cy.get('button[type="submit"]').click()
    cy.get('#quick-add-name').should('have.value', '')
    cy.visit('/inventory')
    cy.get('table tr').contains('Cypress Test Milk').should('be.visible')
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
    cy.get('#quick-add-qty').clear()
    cy.get('button[type="submit"]').click()
    cy.contains('Name is required').should('be.visible')
    cy.contains('Quantity must be a non-negative number').should('be.visible')
  })

  it('should show Expired badge for item with past expiration date', () => {
    // Backend rejects past dates, so seed via API with today's date.
    // new Date("YYYY-MM-DD") parses as UTC midnight, which is <= Date.now(), so the frontend marks it Expired.
    const today = new Date().toISOString().split('T')[0]
    cy.request({
      method: 'POST',
      url: 'http://localhost:5007/api/inventory',
      body: { name: 'Cypress Expired Item', quantity: 1, expirationDate: today },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    })
    cy.visit('/inventory')
    cy.get('table tr').contains('Cypress Expired Item').closest('tr').contains('Expired').should('be.visible')
  })

  it('should dim row when item quantity is set to zero', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:5007/api/inventory',
      body: { name: `Low Stock ${Date.now()}`, quantity: 1 },
      headers: { 'Content-Type': 'application/json' },
    }).then(({ body }) => {
      cy.reload()
      cy.get(`[data-testid="inventory-row-${body.id}"]`).within(() => {
        cy.get('button[aria-label*="Decrease quantity"]').click()
      })
      cy.get(`[data-testid="inventory-row-${body.id}"]`).should('have.class', 'text-muted-foreground')
    })
  })
})
