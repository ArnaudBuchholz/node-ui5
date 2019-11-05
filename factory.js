'use strict'

const bootstrapLocator = require('./src/bootstrapLocator')
const browserFactory = require('./src/browser')
const deasync = require('deasync')
const Traces = require('./src/Traces')

module.exports = (userSettings = {}) => {
  const {
    baseURL = 'http://node-ui5.server.net/',
    bootstrapLocation = '',
    bootstrapCache = '',
    exposeAsGlobals = false,
    fastButIncompleteSimulation = process.argv.includes('--fast'),
    resourceroots = {},
    verbose = false,
    debug = false, // Might be an object
    synchronousBoot = false
  } = userSettings
  const traces = new Traces(verbose, debug)
  let bootInProgress = true
  const promise = bootstrapLocator(traces, bootstrapLocation)
    .then(resolvedLocation => browserFactory({
      baseURL,
      bootstrap: {
        location: resolvedLocation,
        base: resolvedLocation.match(/^(.*\/)/)[1],
        cache: bootstrapCache
      },
      exposeAsGlobals,
      fastButIncompleteSimulation,
      resourceroots,
      traces
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
