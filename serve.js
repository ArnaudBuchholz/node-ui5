require('colors')
const http = require('http')

// Will happen because of missing annotations
process.on('unhandledRejection', error => {
  console.log('unhandledRejection'.red, (error.message || error.toString()).gray)
  console.log(error)
})

module.exports = function ({
  window,
  files = '',
  hostname = '127.0.0.1',
  port = 8080
}) {
  const server = http.createServer((request, response) => {
    console.log('SERVE'.magenta, `${request.method} ${request.url}`.gray)
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
        jqXHR.getAllResponseHeaders()
          .split('\n')
          .filter(header => header)
          .forEach(header => {
            const pos = header.indexOf(':')
            response.setHeader(header.substr(0, pos).trim(), header.substr(pos + 1).trim())
          })
        response.setStatus(jqXHR.status)
        response.send(jqXHR.responseText)
      }
    })
  })
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`.yellow)
  })
}
