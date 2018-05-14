const selenium = require('selenium-download')

selenium.ensure(__dirname + '/bin', function(error) {
  if (error) console.error(error.stack)
  process.exit(0)
})
