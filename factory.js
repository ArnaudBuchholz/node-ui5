'use strict'

const browserFactory = require('./src/browser')

module.exports = (userSettings = {}) => {
  let {
    baseURL = 'http://node-ui5.server.net/',
    bootstrapLocation = 'resources/sap-ui-core.js',
    exposeAsGlobals = false,
    fastButIncompleteSimulation = false,
    resourceroots = {},
    verbose = false,
    debug = false
  } = userSettings
  process.argv.forEach(param => {
    if (param === '--verbose') {
      verbose = true
    }
    if (param === '--fast') {
      fastButIncompleteSimulation = true
    }
    if (param === '--debug') {
      verbose = true
      debug = true
    }
  })
  return browserFactory({
    baseURL,
    bootstrapLocation,
    exposeAsGlobals,
    fastButIncompleteSimulation,
    resourceroots,
    verbose,
    debug
  })
}
