const shared = {
  projectName: 'scroll-into-view-if-needed',
  buildName: process.env.CIRCLE_BRANCH,
  sessionName: `${process.env.CIRCLE_JOB}-${process.env.CIRCLE_BUILD_NUM}`,
  local: 'true',
  userName: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  consoleLogs: 'error',
}

exports.config = {
  user: shared.userName,
  key: shared.accessKey,
  services: [['browserstack', { browserstackLocal: true }]],

  specs: ['./tests/**'],

  maxInstances: 10,

  capabilities: [
    // Generated using https://www.browserstack.com/automate/capabilities?tag=selenium-4
    {
      browserName: 'Safari',
      browserVersion: '11.1',
      'bstack:options': {
        ...shared,
        seleniumVersion: '3.5.2',
        os: 'OS X',
        osVersion: 'High Sierra',
      },
    },
    {
      browserName: 'IE',
      browserVersion: '11.0',
      'bstack:options': {
        ...shared,
        seleniumVersion: '3.5.2',
        os: 'Windows',
        osVersion: '10',
      },
    },
    {
      browserName: 'Firefox',
      browserVersion: 'latest',
      'bstack:options': {
        ...shared,
        seleniumVersion: '3.10.0',
        os: 'Windows',
        osVersion: '10',
      },
    },
    // @TODO investigate how to make iPhone X able to run the tests
    {
      browserName: 'iPhone',
      'bstack:options': {
        ...shared,
        osVersion: '11',
        deviceName: 'iPhone 8 Plus',
        realMobile: 'true',
      },
    },
    {
      browserName: 'Android',
      'bstack:options': {
        ...shared,
        osVersion: '10.0',
        deviceName: 'Google Pixel 3',
        realMobile: 'true',
      },
    },
    // Disabling the devices below as we keep hitting a limit that causes tests to completely time out alltogether
    /*
    {
      browserName: 'Chrome',
      browserVersion: 'latest',
      'bstack:options': {
        ...shared,
        os: 'Windows',
        osVersion: '10',
        seleniumVersion: '3.14.0',
      },
    },
    {
      browserName: 'Safari',
      browserVersion: 'latest',
      'bstack:options': {
        ...shared,
        os: 'OS X',
        osVersion: 'Big Sur',
        seleniumVersion: '3.14.0',
      },
    },
    {
      browserName: 'Android',
      'bstack:options': {
        ...shared,
        osVersion: '7.0',
        deviceName: 'Samsung Galaxy S8',
        realMobile: 'true',
      },
    },
    //*/
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
