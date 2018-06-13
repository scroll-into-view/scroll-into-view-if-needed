describe('ScrollLogicalPosition: block', function() {
  before(function() {
    cy.visit('/block')
  })

  const simplePositions = ['start', 'center', 'end']
  context('one scrollbox', () => {
    simplePositions.forEach(position => {
      it(`should align to ${position} correctly`, () => {
        cy.get(`#${position}`).click()
        cy.wait(200)
        cy.get('.test-assertion').should('have.class', 'test-pass')
        cy.wait(200)
      })
    })
  })
})
