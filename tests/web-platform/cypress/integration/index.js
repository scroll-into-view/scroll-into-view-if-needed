describe('web-platform-tests by w3c', function() {
  it('css/cssom-view/scrollintoview.html', () => {
    cy.visit('/')

    cy.get('#summary .pass').should('contain', '40 Pass')
  })

  it('scrollIntoView-smooth.html', () => {
    cy.visit('/smooth')
    cy.wait(500)
    cy.get('#summary .pass').should('contain', '4 Pass')
  })
})
