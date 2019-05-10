'use strict'

const path = require('path')

module.exports = [{
  // http/https proxy
  match: /^\/proxy\/(https?)\/(.*)/,
  url: '$1://$2',
  'unsecure-cookies': true
}, {
  // ui5 resource access
  match: /\/resources\/(.*)/,
  ui5resources: '$1'
}, {
  // mock server mapping
  match: /^(\/odata\/.*)/,
  mock: '$1'
}, {
  // mock server mapping (with a different base URL)
  match: /^\/api\/(.*)/,
  mock: '/odata/TODO_SRV/$1'
}, {
  // custom echo handler
  match: /^\/echo\/(.*)$/,
  custom: (request, response, path) => {
    response.writeHead(200, {
      'Content-Type': 'text/plain',
      'Content-Length': path.length
    })
    response.end(path)
  }
}, {
  // custom test handler to signal end of browser tests
  match: /^\/chrome\/(.*)$/,
  custom: (request, response, status) => {
    if (process.send) {
      process.send(status)
    }
    response.writeHead(200, {
      'Content-Type': 'text/plain',
      'Content-Length': 0
    })
    response.end()
  }
}, {
  // gpf.js
  match: /^\/gpf\.js$/,
  file: path.join(__dirname, '../../node_modules/gpf-js/build/gpf.js')
}, {
  // default access to index.html
  match: /^\/$/,
  file: path.join(__dirname, 'index.html')
}, {
  // mapping to file access
  match: /(.*)/,
  file: path.join(__dirname, '$1')
}]
