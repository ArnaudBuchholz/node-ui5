'use strict'

require('colors')
const debug = require('./debug')
const path = require('path')
const resources = require('./resources')

module.exports = async function (settings) {
  let promiseResolve
  let promiseReject
  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve
    promiseReject = reject
  })

  const resourceroots = Object.keys(settings.resourceroots).reduce((roots, root) => {
    roots[root] = resources.declare(settings.resourceroots[root])
    return roots
  }, {
    'node-ui5': resources.declare(path.join(__dirname, '../lib'))
  })

  let selector
  let window
  if (settings.fastButIncompleteSimulation) {
    selector = 'mindom'
  } else {
    selector = 'jsdom'
  }
  const start = new Date()
  window = require(`./${selector}/factory`)(settings)
  if (settings.debug) {
    console.log(`Loaded '${selector}' implementation: ${new Date() - start}ms`.gray)
  }

  // Inject factory hooks
  window.__factory__ = {
    resolve: sap => {
      if (settings.exposeAsGlobals) {
        global.window = window
        global.sap = sap
      }
      if (settings.debug) {
        console.log(`UI5 loading time: ${new Date() - start}ms`.gray)
      }
      promiseResolve({ window, sap })
    },
    reject: reason => {
      promiseReject(reason)
    }
  }

  if (settings.debug) {
    debug.configure(settings, window)
  }

  // Create the UI5 bootstrap node
  var ui5Boot = window.document.createElement('script')
  ui5Boot.id = 'sap-ui-bootstrap'
  ui5Boot.setAttribute('src', settings.bootstrapLocation)
  ui5Boot.setAttribute('data-sap-ui-compatVersion', 'edge')
  ui5Boot.setAttribute('data-sap-ui-frameOptions', 'allow')
  ui5Boot.setAttribute('data-sap-ui-resourceroots', JSON.stringify(resourceroots))
  if (settings.debug) {
    ui5Boot.setAttribute('data-sap-ui-logLevel', '6')
    ui5Boot.setAttribute('data-sap-ui-xx-debugModuleLoading', 'true')
    window['sap-ui-config'] = {
      'xx-debugrendering': true
    }
  }
  window.document.documentElement.appendChild(ui5Boot)

  // Create the custom bootstrap node (& tweak theme loading detection)
  var customBoot = window.document.createElement('script')
  customBoot.textContent = `
  document.getElementById('sap-ui-theme-sap.ui.core').setAttribute('data-sap-ui-ready', 'true')
  if (typeof sap !== 'undefined') {
    sap.ui.getCore().attachInit(function() {
      window.__factory__.resolve(sap)
    })
  } else {
    window.__factory__.reject(new Error('Invalid bootstrap'))
  }`
  window.document.documentElement.appendChild(customBoot)

  return promise
}
