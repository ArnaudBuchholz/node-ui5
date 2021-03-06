'use strict'

require('colors')
const debug = require('./debug')
const path = require('path')
const resources = require('./resources')
const Traces = require('./traces')

module.exports = async function (settings) {
  let promiseResolve
  let promiseReject
  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve
    promiseReject = reject
  })

  const resourceroots = Object.keys(settings.resourceroots).reduce((roots, root) => {
    roots[root] = resources.declare(settings, settings.resourceroots[root])
    return roots
  }, {
    'node-ui5': resources.declare(settings, path.join(__dirname, '../lib'))
  })

  let selector
  if (settings.fastButIncompleteSimulation) {
    selector = 'mindom'
  } else {
    selector = 'jsdom'
    try {
      require('jsdom')
    } catch (e) {
      settings.traces.boot('jsdom not detected, switching to fast implementation', Traces.INFO)
      selector = 'mindom'
    }
  }
  const start = new Date()
  const window = require(`./${selector}/factory`)(settings)
  settings.traces.performance(`Loaded '${selector}' implementation`, start)

  // Inject factory hooks
  window.__factory__ = {
    resolve: sap => {
      if (settings.exposeAsGlobals) {
        global.window = window
        global.sap = sap
      }
      settings.traces.performance('UI5 loading time', start)
      promiseResolve({ window, sap })
    },
    reject: reason => {
      promiseReject(reason)
    }
  }

  if (settings.traces.enabled.ui5) {
    debug.configure(settings, window)
  }

  // Create the UI5 bootstrap node
  var ui5Boot = window.document.createElement('script')
  ui5Boot.id = 'sap-ui-bootstrap'
  ui5Boot.setAttribute('src', resources.declare(settings, settings.bootstrap.location))
  ui5Boot.setAttribute('data-sap-ui-compatVersion', 'edge')
  ui5Boot.setAttribute('data-sap-ui-async', 'true')
  ui5Boot.setAttribute('data-sap-ui-frameOptions', 'allow')
  ui5Boot.setAttribute('data-sap-ui-resourceroots', JSON.stringify(resourceroots))
  if (settings.traces.enabled.ui5) {
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
(function () {
  var start = new Date()
  function waitForSap () {
    if (typeof sap === 'undefined' || !sap.ui || !sap.ui.getCore) {
      if (new Date() - start < 5000) {
        setTimeout(waitForSap, 100)
      } else {
        window.__factory__.reject(new Error('Invalid bootstrap'))
      }
    } else {
      sap.ui.getCore().attachInit(function() {
        var uiCoreTheme = document.getElementById('sap-ui-theme-sap.ui.core')
        if (uiCoreTheme) {
          uiCoreTheme.setAttribute('data-sap-ui-ready', 'true')
        }
        window.__factory__.resolve(sap)
      })
    }
  }
  waitForSap()
}())
`
  window.document.documentElement.appendChild(customBoot)

  return promise
}
