describe("w3c's web platform tests", function() {
  it('implements css/cssom-view/scrollintoview.html correctly', () => {
    cy.visit('/')

    cy.get('#summary .pass').should('contain', '40 Pass')
  })
})
