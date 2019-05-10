'use strict'

require('colors')
const EventEmitter = require('events')
const fs = require('fs')
const http = require('http')
const https = require('https')
const mime = require('mime')
const path = require('path')
const resources = require('./src/resources')

const { $settings } = require('./src/mindom/const')

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

function error (request, response, { status = 500, message = '' }) {
  const content = `An error occurred while processing ${request.method} ${request.url}: ${message}`
  const length = content.length
  response.writeHead(status, {
    'Content-Type': mime.getType('text'),
    'Content-Length': length
  })
  response.end(content)
  log(request, response, length)
}

function getUrlHandler (url) {
  if (url.startsWith('https')) {
    return https
  }
  return http
}

function redirectToFile (request, filePath, response) {
  fs.stat(filePath, (err, stat) => {
    if (err || stat.isDirectory()) {
      error(request, response, { status: 404, message: 'Not found' })
    } else {
      response.writeHead(200, {
        'Content-Type': mime.getType(path.extname(filePath)) || mime.getType('bin'),
        'Content-Length': stat.size
      })
      fs.createReadStream(filePath)
        .on('end', () => log(request, response, stat.size))
        .pipe(response)
    }
  })
}

function redirectToMock (request, url, response) {
  const dataChunks = []
  request
    .on('data', chunk => dataChunks.push(chunk.toString()))
    .on('end', () => {
      if (dataChunks.length) {
        request.data = dataChunks.join('')
      }
      request.window.jQuery.ajax({
        method: request.method,
        url,
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

function redirectToUI5resource (request, resPath, response) {
  const settings = request.window[$settings]
  const content = resources.read(settings, `resources/${resPath}`)
  response.writeHead(200, {
    'Content-Type': mime.getType(path.extname(resPath)) || mime.getType('bin'),
    'Content-Length': content.length
  })
  response.end(content)
  log(request, response, content.length)
}

function unsecureCookies (headers) {
  ['Set-Cookie', 'set-cookie'].forEach(name => {
    if (headers[name]) {
      headers[name] = headers[name].map(cookie => cookie.replace(/\s*secure;/i, ''))
    }
  })
}

function redirectToUrl (request, url, response) {
  const handler = getUrlHandler(url)
  const {
    method,
    headers
  } = request
  delete headers.host // Some websites rely on the host header
  const redirectedRequest = handler.request(url, { method, headers }, redirectedResponse => {
    if (request.mapping['unsecure-cookies']) {
      unsecureCookies(redirectedResponse.headers)
    }
    response.writeHead(redirectedResponse.statusCode, redirectedResponse.headers)
    redirectedResponse
      .on('end', () => log(request, response, redirectedResponse.headers['content-length'] || 0))
      .pipe(response)
  })
  redirectedRequest.on('error', err => error(request, response, { message: err.toString() }))
  request
    .on('data', chunk => redirectedRequest.write(chunk))
    .on('end', () => redirectedRequest.end())
}

const typeHandlers = {
  file: redirectToFile,
  mock: redirectToMock,
  ui5resources: redirectToUI5resource,
  url: redirectToUrl,
  custom: null
}

const types = Object.keys(typeHandlers)

module.exports = function ({
  hostname = '127.0.0.1',
  port = 8080,
  mappings = [],
  ssl,
  verbose = process.argv.some(param => ['--verbose', '--debug'].includes(param)),
  window
}) {
  const eventEmitter = new EventEmitter()
  const requestHandler = (request, response) => {
    request.start = new Date()
    request.window = window
    if (verbose) {
      console.log('SERVE'.magenta, `${request.method} ${request.url}`.gray)
    }
    if (mappings.every(mapping => {
      const match = mapping.match.exec(request.url)
      if (match) {
        request.mapping = mapping
        let redirect
        let type
        if (types.every(member => {
          type = member
          redirect = mapping[member]
          return !redirect
        })) {
          error(request, response, { message: 'invalid mapping' })
          return false
        }
        if (type === 'custom') {
          if (verbose) {
            console.log('SERVE'.magenta, `${request.url} => ${type}`.gray)
          }
          redirect(request, response, ...[].slice.call(match, 1))
          response.on('finish', () => log(request, response, -1))
          return false
        }
        for (let capturingGroupIndex = match.length; capturingGroupIndex > 0; --capturingGroupIndex) {
          redirect = redirect.replace(new RegExp(`\\$${capturingGroupIndex}`, 'g'), match[capturingGroupIndex])
        }
        if (verbose) {
          console.log('SERVE'.magenta, `${request.url} => ${type} ${redirect}`.gray)
        }
        typeHandlers[type](request, redirect, response)
        return false
      }
      return true
    })) {
      error(request, response, { message: 'not mapped' })
    }
  }
  let protocol
  let server
  if (ssl) {
    protocol = 'https'
    server = https.createServer({
      key: fs.readFileSync(ssl.key),
      cert: fs.readFileSync(ssl.cert)
    }, requestHandler)
  } else {
    protocol = 'http'
    server = http.createServer(requestHandler)
  }
  server.listen(port, hostname, () => {
    console.log(`Server running at ${protocol}://${hostname}:${port}/`.yellow)
    eventEmitter.emit('ready')
  })
  return eventEmitter
}
