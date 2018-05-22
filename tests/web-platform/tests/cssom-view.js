const assert = require('assert')

const tests = [
  'scrollintoview.html',
  // ignore tests that require newer browser functionality
  //'scrollIntoView-smooth.html',
  //'scrollIntoView-shadow.html',
]
const {
  device,
  os_version = 'latest',
  browser: browserName = device,
  browser_version = os_version,
} = browser.desiredCapabilities

describe(`${browserName}: ${browser_version}`, function() {
  tests.forEach(testName => {
    it(testName, () => {
      browser.url(`http://localhost:3000/css/cssom-view/${testName}`)
      browser.waitForVisible('#results', 30000)
      const testResults = JSON.parse(
        browser.getHTML('#__testharness__results__', false)
      )
      testResults.tests.forEach(testResult => {
        assert.equal(testResult.message, null)
      })
    })
  })
})
