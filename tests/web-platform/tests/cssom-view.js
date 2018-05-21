var assert = require('assert')

const tests = [
  'scrollintoview.html',
  'scrollIntoView-smooth.html',
  'scrollIntoView-shadow.html',
]
describe('cssom-view', function() {
  tests.forEach(testName => {
    describe(testName, function() {
      browser.url(`http://localhost:3000/css/cssom-view/${testName}`)

      browser.waitForExist('#summary', 1000)

      const testResultHtml = browser.getHTML('#__testharness__results__', false)

      try {
        const testResults = JSON.parse(testResultHtml)
        testResults.tests.forEach(testResult => {
          it(testResult.name, () => assert.equal(testResult.message, null))
        })
      } catch (err) {
        it('should not fail', () => {
          assert.equal(testResultHtml, Symbol.for('the sake of it'))
        })
      }
    })
  })
})
/*
module.exports = {
  'scrollIntoView-shadow.html': function(browser) {
    browser
      .url('http://localhost:3000/css/cssom-view/scrollIntoView-shadow.html')
      .waitForElementVisible('body', 1000)
      .assert.elementPresent('#summary .pass')
      .assert.elementNotPresent('#summary .fail')
      .end()
  },
  'scrollIntoView-smooth.html': function(browser) {
    browser
      .url('http://localhost:3000/css/cssom-view/scrollIntoView-smooth.html')
      .waitForElementVisible('body', 1000)
      .waitForElementPresent('#summary .pass', 10000)
      .assert.elementNotPresent('#summary .fail')
      .end()
  },
  'scrollintoview.html': function(browser) {
    browser
      .url('http://localhost:3000/css/cssom-view/scrollintoview.html')
      .waitForElementVisible('body', 1000)
      .assert.elementPresent('#summary .pass')
      .assert.elementNotPresent('#summary .fail')
      .end()
  },
}

//*/
