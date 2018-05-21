var browserstack = require('browserstack-local')

exports.config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  specs: ['./tests/**'],

  maxInstances: 10,
  commonCapabilities: {
    name: `${process.env.CIRCLE_JOB}-${process.env.CIRCLE_BUILD_NUM}`,
    build: process.env.CIRCLE_BRANCH,
    'browserstack.local': true,
    'browserstack.debug': true,
  },

  capabilities: [
    {
      browser: 'Safari',
      browser_version: '11.1',
    },
    /*
    {
      browser: 'firefox',
    },
    {
      browser: 'IE',
      browser_version: '11.0',
    },
    {
      browser: 'Edge',
    },
    {
      os_version: '11.0',
      device: 'iPhone X',
      real_mobile: 'true',
    },
    {
      os_version: '8.0',
      device: 'Google Pixel',
      real_mobile: 'true',
    },
    {
      os_version: '7.0',
      device: 'Samsung Galaxy S8',
      real_mobile: 'true',
    },
    //*/
  ],

  logLevel: 'verbose',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  host: 'hub.browserstack.com',

  reporters: ['dot', 'junit'],
  reporterOptions: {
    junit: {
      outputDir: './tests_output',
      outputFileFormat: function(opts) {
        // optional
        return `results-${opts.cid}.${opts.capabilities}.xml`
      },
    },
  },
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
  },

  // Code to start browserstack local before start of test
  onPrepare: function(config, capabilities) {
    console.log('Connecting local')
    return new Promise(function(resolve, reject) {
      exports.bs_local = new browserstack.Local()
      exports.bs_local.start({ key: exports.config.key }, function(error) {
        if (error) return reject(error)
        console.log('Connected. Now testing...')

        resolve()
      })
    })
  },

  // Code to stop browserstack local after end of test
  onComplete: function(capabilties, specs) {
    exports.bs_local.stop(function() {})
  },
}

// Code to support common capabilities
// @TODO cleanup this messy snippet with an array.map
exports.config.capabilities.forEach(function(caps) {
  for (var i in exports.config.commonCapabilities)
    caps[i] = caps[i] || exports.config.commonCapabilities[i]
})
