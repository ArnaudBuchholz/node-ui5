'use strict'

const fs = require('fs')
const util = require('util')
const gpf = require('gpf-js')
const Traces = require('./traces')

const statAsync = util.promisify(fs.stat)

const UI5_CDN = {
  open: 'https://openui5.hana.ondemand.com',
  sap: 'https://ui5.sap.com'
}

function cdn (flavor, version, debug) {
  return gpf.http.get(`${UI5_CDN[flavor]}/neo-app.json`)
    .then(response => JSON.parse(response.responseText).routes)
    .then(routes => {
      if (version === 'latest') {
        return routes[0]
      }
      return routes.filter(route => route.target.version === version)[0]
    })
    .then(route => {
      if (!route) {
        throw new Error('version not found')
      }
      if (debug) {
        return `${UI5_CDN[flavor]}${route.path}/resources/sap-ui-core-dbg.js`
      }
      return `${UI5_CDN[flavor]}${route.path}/resources/sap-ui-core.js`
    })
}

const LOCAL_DIST = './dist/resources/sap-ui-core.js'

function locateLocal () {
  return statAsync(LOCAL_DIST)
    .then(() => LOCAL_DIST)
}

const WEB_LOCATION = /^https?:\/\//

const UI5_LOCATOR = /(open|sap)ui5@(latest|\d\.\d+\.\d+)(\/debug)?/

function locate (bootstrapLocation) {
  if (!bootstrapLocation) {
    return locateLocal().catch(() => cdn('open', 'latest'))
  }
  if (WEB_LOCATION.exec(bootstrapLocation)) {
    return Promise.resolve(bootstrapLocation)
  }
  const match = UI5_LOCATOR.exec(bootstrapLocation)
  if (match) {
    return cdn(match[1], match[2], match[3])
  }
  return statAsync(bootstrapLocation)
    .then(stat => {
      if (stat.isDirectory()) {
        throw new Error('invalid path')
      }
      return bootstrapLocation
    })
}

module.exports = function (traces, bootstrapLocation) {
  traces.boot(`<< '${bootstrapLocation}'`)
  return locate(bootstrapLocation)
    .then(resolvedLocation => {
      traces.boot(`>> '${resolvedLocation}'`, Traces.SUCCESS)
      return resolvedLocation
    }, reason => {
      traces.boot(reason.toString(), Traces.ERROR)
      throw reason
    })
}
