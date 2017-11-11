console.log(window)
describe('Basic Functionality', function() {
  beforeEach(function() {
    // Visiting our app before each test removes any state build up from
    // previous tests. Visiting acts as if we closed a tab and opened a fresh one
    cy.visit('/')

    cy.window().then(win => {
      const { IntersectionObserver, document, scrollIntoViewIfNeeded } = win
      var options = {
        root: null,
        rootMargin: '0px',
        threshold: [0, 1.0],
      }

      var observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
          console.log(
            entry.intersectionRatio,
            entry.isIntersecting,
            entry.target
          )
          entry.target.dataset.visibility = entry.isIntersecting
            ? 'visible'
            : 'hidden'
        })
      }, options)
      observer.observe(document.querySelector('#instance1 > li:nth-child(21)'))
      document.querySelectorAll('button').forEach(button => console.log(button))

      console.log('cypress calling', scrollIntoViewIfNeeded)
    })
  })
  it('scrolls node into view', function() {
    cy.get('#instance1 li:last').should('not.have.prop', 'scrollTop', 1)
    cy
      .get('#list1 button')
      .last()
      .click({ force: true })

    //cy.get('#list1').should('have.scrollTop', 10)
  })
})
