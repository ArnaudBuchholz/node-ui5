'use strict'

const bootstrapLocator = require('./src/bootstrapLocator')
const browserFactory = require('./src/browser')
const deasync = require('deasync')

const traces = new Proxy({
  verbose: false,
  debug: false
}, {
  get: (obj, property) => {
    return obj.debug || obj[property]
  }
})

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
  traces.verbose = verbose || process.argv.some(param => param === '--verbose')
  traces.debug = debug  || process.argv.some(param => param === '--debug')
  process.argv
    .filter(param => param.startsWith('--trace:'))
    .forEach(param => traces[param.substring(8)] = true)
  let bootInProgress = true
  const promise = bootstrapLocator(bootstrapLocation)
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
