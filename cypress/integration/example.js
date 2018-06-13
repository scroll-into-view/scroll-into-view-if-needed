describe('Basic Functionality', function() {
  beforeEach(function() {
    // Visiting our app before each test removes any state build up from
    // previous tests. Visiting acts as if we closed a tab and opened a fresh one
    cy.visit('/')

    // Setup observers and set dataset values for test convenience
    cy.window().then(win => {
      const { IntersectionObserver, document, scrollIntoViewIfNeeded } = win

      var options = {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }

      var observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
          entry.target.dataset.visibility =
            entry.intersectionRatio >= 1 ? 'visible' : 'hidden'
        })
      }, options)
      observer.observe(document.querySelector('#instance1 > li:nth-child(21)'))
      document.querySelectorAll('button').forEach(button => {
        button.dataset.nth = parseInt(button.value, 10) + 1
        const parent = button.closest('div')
        const item = parent.querySelector(`li:nth-child(${button.dataset.nth})`)
        item.dataset.visibility = 'hidden'
        observer.observe(item)
      })
    })
  })
  it('should scroll the list correctly', function() {
    cy.get('#list1 button').each(function($el, index, $list) {
      cy.wrap($el).click({ force: true })
      const key = $el.data('nth')
      cy.wait(300)
      cy.get(`#list1 li:nth-child(${key})`).should(
        'have.data',
        'visibility',
        'visible'
      )
    })
  })
  it('should not scroll beyond boundary', function() {
    cy.get('#list2').scrollIntoView()
    cy.get('#list2 button:last').click({ force: true })
    cy.wait(300)
    cy.get(`#list2 li:first`).should('have.data', 'visibility', 'hidden')
    cy.get(`#list2 li:last`).should('have.data', 'visibility', 'visible')
  })
  it('should scroll the last list correctly', function() {
    cy.get('#list3 button').each(function($el, index, $list) {
      cy.wrap($el).click({ force: true })
      const key = $el.data('nth')
      cy.get(`#list3 li:nth-child(${key})`).should(
        'have.data',
        'visibility',
        'visible'
      )
    })
  })
})
