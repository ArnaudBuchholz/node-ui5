require('colors')
const http = require('http')

process.on('unhandledRejection', error => { // Absorb
  console.log('unhandledRejection'.red, (error.message || error.toString()).gray)
})

module.exports = function ({
  window,
  files = '',
  hostname = '127.0.0.1',
  port = 8080,
  verbose = process.argv.some(param => ['--verbose', '--debug'].includes(param))
}) {
  const server = http.createServer((request, response) => {
    const start = new Date()
    if (verbose) {
      console.log('SERVE'.magenta, `${request.method} ${request.url}`.gray)
    }
    // Handle static path first
    // if file not found, forward
    /*
            // Express
            const express = require('express')
            const app = express()
            const logger = require('morgan')
            const bodyParser = require('body-parser')

            app.use(logger('dev'))
            app.use(bodyParser.text({
              type: '*-/-*'
            }))
*/
    window.jQuery.ajax({
      method: request.method,
      url: request.url,
      headers: request.headers,
      data: request.body, // Need to get them
      complete: jqXHR => {
        const status = jqXHR.status
        const responseText = jqXHR.responseText
        jqXHR.getAllResponseHeaders()
          .split('\n')
          .filter(header => header)
          .forEach(header => {
            const pos = header.indexOf(':')
            response.setHeader(header.substr(0, pos).trim(), header.substr(pos + 1).trim())
          })
        response.statusCode = status
        response.end(responseText)
        let report
        if (status.toString().startsWith(2)) {
          report = `${status} ${responseText.length}`.green
        } else {
          report = status.toString().red
        }
        report += ` ${new Date() - start} ms`.magenta
        console.log('SERVE'.magenta, `${request.method} ${request.url}`.cyan, report)
      }
    })
  })
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`.yellow)
  })
}
