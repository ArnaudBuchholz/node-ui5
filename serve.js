'use strict'

const reserve = require('../reserve/serve')
const log = require('../reserve/log')

process.on('unhandledRejection', error => { // Absorb
  console.log('unhandledRejection'.red, (error.message || error.toString()).gray)
})

module.exports = function ({
  hostname = '127.0.0.1',
  port = 8080,
  mappings = [],
  ssl,
  verbose = process.argv.some(param => ['--verbose', '--debug'].includes(param)),
  window
}) {
  return log(reserve({
    handlers: {
      mock: {
        schema: {},
        redirect: ({ mapping, redirect, request, response }) => new Promise(resolve => {
          const dataChunks = []
          request
            .on('data', chunk => dataChunks.push(chunk.toString()))
            .on('end', () => {
              let data
              if (dataChunks.length) {
                data = dataChunks.join('')
              }
              window.jQuery.ajax({
                method: request.method,
                url: redirect,
                headers: request.headers,
                data: data,
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
                  resolve()
                }
              })
            })
        })
      }
    },
    hostname,
    port,
    ssl,
    mappings
  }), verbose)
}
