exports.config = {
  services: ['browserstack'],
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,
  browserstackLocal: true,

  specs: ['./tests/**'],

  maxInstances: 10,
  commonCapabilities: {
    name: `${process.env.CIRCLE_JOB}-${process.env.CIRCLE_BUILD_NUM}`,
    build: process.env.CIRCLE_BRANCH,
    project: 'scroll-into-view-if-needed',
  },

  capabilities: [
    { browser: 'Safari', browser_version: '11.1' },
    { browser: 'IE', browser_version: '11.0' },
    { browser: 'firefox' },
    // @TODO investigate how to make iPhone X able to run the tests
    //{ os_version: '11.0', device: 'iPhone X' },
    // @TODO investigate why android fails on the getHTML step, even though the test itself is successful
    //{ os_version: '10.0', device: 'Google Pixel 3' },
    // Disabling the devices below as we keep hitting a limit that causes tests to completely time out alltogether
    //{ browser: 'Edge' },
    // { browser: 'firefox' },
    //{ os_version: '7.0', device: 'Samsung Galaxy S8', real_mobile: 'true' },
  ],

  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: 'http://localhost:3000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  host: 'hub.browserstack.com',

  reporters: ['dot', 'junit'],
  reporterOptions: {
    junit: {
      outputDir: './tests_output',
    },
  },
  framework: 'mocha',
}

// Code to support common capabilities
// @TODO cleanup this messy snippet with an array.map
exports.config.capabilities.forEach(function(caps) {
  for (var i in exports.config.commonCapabilities)
    caps[i] = caps[i] || exports.config.commonCapabilities[i]
})
