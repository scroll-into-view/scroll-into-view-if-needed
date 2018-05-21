var assert = require('assert')

const tests = [
  'scrollintoview.html',
  'scrollIntoView-smooth.html',
  'scrollIntoView-shadow.html',
]
describe('cssom-view', function() {
  tests.forEach(testName => {
    it(testName, function() {
      browser.url(`http://localhost:3000/css/cssom-view/${testName}`)
      browser.waitForExist('.fail', 1000, true)
      browser.waitForExist('#summary .pass', 1000)

      const testResults = JSON.parse(
        browser.getHTML('#__testharness__results__', false)
      )
      testResults.tests.forEach(testResult => {
        assert.equal(testResult.message, null)
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
