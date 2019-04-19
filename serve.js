require('colors')

const EventEmitter = require('events')
const http = require('http')
const https = require('https')

process.on('unhandledRejection', error => { // Absorb
  console.log('unhandledRejection'.red, (error.message || error.toString()).gray)
})

function log (request, response, responseLength) {
  const status = response.statusCode.toString()
  let report
  if (status.startsWith(2)) {
    report = `${status} ${responseLength}`.green
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
    method,
    headers
  } = request
  delete headers.host
  const redirectedRequest = handler.request(url, { method, headers }, redirectedResponse => {
    Object.keys(redirectedResponse.headers).forEach(key => {
      response.setHeader(key, redirectedResponse.headers[key])
    })
    response.statusCode = redirectedResponse.statusCode
    let responseLength = 0
    redirectedResponse.on('data', chunk => {
      response.write(chunk)
      responseLength += chunk.length
    })
    redirectedResponse.on('end', () => {
      response.end()
      log(request, response, responseLength)
    })
  })
  request.on('data', chunk => redirectedRequest.write(chunk))
  request.on('end', () => {
    redirectedRequest.end()
  })
}

function forwardToAjax (window, request, response) {
  const dataChunks = []
  request.on('data', chunk => dataChunks.push(chunk.toString()))
  request.on('end', () => {
    if (dataChunks.length) {
      request.data = dataChunks.join('')
    }
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
        log(request, response, responseText.length)
      }
    })
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
    if (redirect.every(pattern => {
      const match = pattern.match.exec(request.url)
      if (match) {
        let url = pattern.url
        for (let capturingGroupIndex = match.length; capturingGroupIndex > 0; --capturingGroupIndex) {
          url = url.replace(new RegExp(`\\$${capturingGroupIndex}`, 'g'), match[capturingGroupIndex])
        }
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
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`.yellow)
    eventEmitter.emit('ready')
  })
  return eventEmitter
}
