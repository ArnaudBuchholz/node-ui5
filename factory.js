'use strict'

const browserFactory = require('./src/browser')

module.exports = (userSettings = {}) => {
  let {
    baseURL = 'http://node-ui5.server.net/',
    bootstrapLocation = 'resources/sap-ui-core.js',
    exposeAsGlobals = false,
    fastButIncompleteSimulation = false,
    resourceroots = {},
    verbose = false
  } = userSettings
  process.argv.forEach(param => {
    if (param === '--verbose') {
      verbose = true
    }
    if (param === '--fast') {
      fastButIncompleteSimulation = true
    }
  })
  return browserFactory({
    baseURL,
    bootstrapLocation,
    exposeAsGlobals,
    fastButIncompleteSimulation,
    resourceroots,
    verbose
  })
}
