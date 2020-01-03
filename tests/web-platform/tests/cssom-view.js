const assert = require('assert')

const tests = [
  'css/cssom-view/scrollintoview',
  // ignore tests that require newer browser functionality
  //'css/cssom-view/scrollIntoView-smooth.html',
  //'css/cssom-view/scrollIntoView-shadow.html',
  'custom/borders',
]
console.log('MARK')
console.log(browser.capabilities)
const {
  platform,
  platformName = platform,
  platformVersion = '',
  deviceManufacturer = '',
  deviceModel = '',
  version,
  browserName = '',
} = browser.capabilities

const funName = `${platformName} ${platformVersion} ${deviceManufacturer} ${deviceModel} ${browserName} ${version}`.replace(
  '  ',
  ' '
)

describe(funName, function() {
  tests.forEach(testName => {
    it(testName, async () => {
      await browser.url(`/${testName}`)
      const wrapper = await $('#results')
      await wrapper.waitForDisplayed(5000)
      const results = await $('#__testharness__results__')
      await results.waitForExist(3000)
      const testResults = JSON.parse(await results.getHTML(false))
      testResults.tests.forEach(testResult => {
        assert.strictEqual(testResult.message, null)
      })
    })
  })
})
