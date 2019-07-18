'use strict'

const bootstrapLocator = require('./src/bootstrapLocator')
const browserFactory = require('./src/browser')
const deasync = require('deasync')

module.exports = (userSettings = {}) => {
  let {
    baseURL = 'http://node-ui5.server.net/',
    bootstrapLocation = '',
    bootstrapCache = '',
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
  const promise = bootstrapLocator(bootstrapLocation)
    .then(resolvedLocation => browserFactory({
      baseURL,
      bootstrapLocation: resolvedLocation,
      exposeAsGlobals,
      fastButIncompleteSimulation,
      resourceroots,
      verbose,
      debug
    }))
    .then(result => {
      bootInProgress = false
      return result
    })
    .catch(reason => {
      bootInProgress = false
      return Promise.reject(reason)
    })
  if (synchronousBoot) {
    deasync.loopWhile(() => bootInProgress)
  }
  return promise
}
