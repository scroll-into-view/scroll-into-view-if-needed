module.exports = {
  src_folders: ['tests'],
  selenium: {
    start_process: true,
    server_path: './bin/selenium.jar',
    log_path: '',
    port: 4444,
    cli_args: {
      'webdriver.chrome.driver': './bin/chromedriver',
    },
  },
  test_settings: {
    default: {
      launch_url: 'http://localhost:3000',
      selenium_port: 4444,
      selenium_host: 'localhost',
      desiredCapabilities: {
        browserName: 'chrome',
        acceptSslCerts: true,
      },
    },
  },
}
