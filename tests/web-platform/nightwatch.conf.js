const config = {
  src_folders: ['tests'],
  selenium: {
    start_process: false,
    host: 'hub-cloud.browserstack.com',
    port: 80,
  },
  test_settings: {
    default: {
      desiredCapabilities: {
        build: 'nightwatch-browserstack',
        'browserstack.user':
          process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
        'browserstack.key':
          process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
        'browserstack.debug': true,
        browser: 'chrome',
      },
    },
  },
}

// Code to copy seleniumhost/port into test settings
for (let i in config.test_settings) {
  config.test_settings[i].selenium_host = config.selenium.host
  config.test_settings[i].selenium_port = config.selenium.port
}

module.exports = config
