const assert = require('assert')

const tests = [
  'css/cssom-view/scrollintoview.html',
  // ignore tests that require newer browser functionality
  //'css/cssom-view/scrollIntoView-smooth.html',
  //'css/cssom-view/scrollIntoView-shadow.html',
  'custom/borders.html',
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
      browser.url(`/${testName}`)
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
