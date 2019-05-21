'use strict'

const browserFactory = require('./src/browser')
const deasync = require('deasync')

module.exports = (userSettings = {}) => {
  let {
    baseURL = 'http://node-ui5.server.net/',
    bootstrapLocation = 'resources/sap-ui-core.js',
    exposeAsGlobals = false,
    fastButIncompleteSimulation = false,
    resourceroots = {},
    verbose = false,
    debug = false,
    synchronousBoot = false
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
  let bootInProgress = true
  const promise = browserFactory({
    baseURL,
    bootstrapLocation,
    exposeAsGlobals,
    fastButIncompleteSimulation,
    resourceroots,
    verbose,
    debug
  })
    .then(result => {
        bootInProgress = false
        return result
    })
  if (synchronousBoot) {
      deasync.loopWhile(() => bootInProgress)
  }
  return promise
}
