var assert = require('assert')
const tryer = require('tryer')

const tests = [
  'scrollintoview.html',
  'scrollIntoView-smooth.html',
  'scrollIntoView-shadow.html',
]
describe('cssom-view', function() {
  tests.forEach(testName => {
    describe(testName, function() {
      browser.url(`http://localhost:3000/css/cssom-view/${testName}`)

      let testResults

      tryer({
        action: () => {
          testResults.tests.forEach(testResult => {
            it(testResult.name, () => assert.equal(testResult.message, null))
          })
        },
        when: () => {
          try {
            browser.waitForVisible('#results', 10000)
            browser.waitForText('#__testharness__results__', 10000)
            testResults = JSON.parse(
              browser.getHTML('#__testharness__results__', false)
            )
            return true
          } catch (err) {
            return false
          }
        },
        interval: 1000,
        limit: 10,
        fail() {
          throw new Error('failed to run tests')
        },
      })
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
