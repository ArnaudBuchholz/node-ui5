'use strict'

const browserFactory = require('./src/browser')

module.exports = (userSettings = {}) => {
  const {
    baseURL = 'http://node-ui5.server.net/',
    bootstrapLocation = 'resources/sap-ui-core.js',
    verbose = false
  } = userSettings
  return browserFactory({
    baseURL,
    bootstrapLocation,
    verbose
  })
}
