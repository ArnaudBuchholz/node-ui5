require('colors')

const EventEmitter = require('events')
const gpf = require('gpf-js')
const http = require('http')
const https = require('https')

process.on('unhandledRejection', error => { // Absorb
  console.log('unhandledRejection'.red, (error.message || error.toString()).gray)
})

function log (request, response, responseText) {
  const status = response.statusCode.toString()
  let report
  if (status.startsWith(2)) {
    report = `${status} ${responseText.length}`.green
  } else {
    report = status.red
  }
  report += ` ${new Date() - request.start} ms`.magenta
  console.log('SERVE'.magenta, `${request.method} ${request.url}`.cyan, report)
}

function getUrlHandler (url) {
  if (url.startsWith('https')) {
    return https
  }
  return http
}

function redirectToUrl (request, url, response) {
  const handler = getUrlHandler(url)
  const {
    method
    headers
  } = request
  delete headers.host
  const redirectedRequest = handler.request(url, { method, headers }, redirectedResponse => {

  })
  if (request.data) {
      redirectedRequest.write(request.data)
  }
  redirectedRequest.end()
  // gpf.http.request({...request, url})
  //   .then(httpResponse => {
  //     Object.keys(httpResponse.headers).forEach(key => {
  //       response.setHeader(key, httpResponse.headers[key])
  //     })
  //     response.statusCode = httpResponse.status;
  //     const responseText = httpResponse.responseText
  //     response.end(responseText)
  //     log(request, response, responseText)
  //   })
}

function forwardToAjax (window, request, response) {
  window.jQuery.ajax({
    method: request.method,
    url: request.url,
    headers: request.headers,
    data: request.data, // Need to get them
    complete: jqXHR => {
      jqXHR.getAllResponseHeaders()
        .split('\n')
        .filter(header => header)
        .forEach(header => {
          const pos = header.indexOf(':')
          response.setHeader(header.substr(0, pos).trim(), header.substr(pos + 1).trim())
        })
      response.statusCode = jqXHR.status
      const responseText = jqXHR.responseText
      response.end(responseText)
      log(request, response, responseText)
    }
  })
}

module.exports = function ({
  window,
  redirect = [],
  hostname = '127.0.0.1',
  port = 8080,
  verbose = process.argv.some(param => ['--verbose', '--debug'].includes(param))
}) {
  const eventEmitter = new EventEmitter()
  const server = http.createServer((request, response) => {
    request.start = new Date()
    if (verbose) {
      console.log('SERVE'.magenta, `${request.method} ${request.url}`.gray)
    }
    const dataChunks = []
    request.on('data', chunk => dataChunks.push(chunk.toString()))
    request.on('end', () => {
      if (dataChunks.length) {
        request.data = dataChunks.join('')
      }
      if (redirect.every(pattern => {
        const match = pattern.match.exec(request.url)
        if (match) {
          const url = pattern.url.replace(/\$1/g, match[1])
          if (verbose) {
            console.log('SERVE'.magenta, `${request.url} => ${url}`.gray)
            redirectToUrl(request, url, response)
          }
          return false
        }
        return true
      })) {
        forwardToAjax(window, request, response);
      }
    })
  })
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`.yellow)
    eventEmitter.emit('ready')
  })
  return eventEmitter
}
