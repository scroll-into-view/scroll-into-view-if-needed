describe('css/cssom-view', () => {
  // @TODO maybe there is a dynamic way to generate a list over tests

  const tests = ['scrollintoview.html', 'scrollIntoView-smooth.html']
  tests.forEach(test => {
    it(`implements ${test} correctly`, () => {
      cy.visit(`/css/cssom-view/${test}`)

      cy.get('#summary .pass').should('exist')
      cy.get('#summary .fail').should('not.exist')
    })
  })
})
