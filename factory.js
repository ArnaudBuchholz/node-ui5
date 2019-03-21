'use strict'

const browserFactory = require('./src/browser')

module.exports = (userSettings = {}) => {
  const {
    baseURL = 'http://node-ui5.server.net/',
    bootstrapLocation = 'resources/sap-ui-core.js',
    exposeAsGlobals = false,
    fastButIncompleteSimulation = false,
    resourceroots = {},
    verbose = false
  } = userSettings
  return browserFactory({
    baseURL,
    bootstrapLocation,
    exposeAsGlobals,
    fastButIncompleteSimulation,
    resourceroots,
    verbose
  })
}
