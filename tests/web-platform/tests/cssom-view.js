var assert = require('assert')

const tests = [
  'scrollIntoView-shadow.html',
  'scrollIntoView-smooth.html',
  'scrollintoview.html',
]
describe('cssom-view', function() {
  tests.forEach(testName => {
    it(testName, function() {
      browser.url(`http://localhost:3000/css/cssom-view/${testName}`)
      browser.waitForExist('.fail', 1000, true)
      browser.waitForExist('#summary .pass', 1000)

      assert.equal(browser.isExisting('#summary .pass'), true)
      assert.equal(browser.isExisting('.fail'), false)
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
