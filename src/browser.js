'use strict'

const path = require('path')
const resources = require('./resources')
const Browser = require('./browser/Browser')

module.exports = settings => {
  let factoryResolve
  let factoryReject

  const promise = new Promise((resolve, reject) => {
    factoryResolve = resolve
    factoryReject = reject
  })

  const resourceroots = Object.keys(settings.resourceroots).reduce((roots, root) => {
    roots[root] = resources.declare(settings.resourceroots[root])
    return roots
  }, {
    'node-ui5': resources.declare(path.join(__dirname, '../lib'))
  })

  const browser = new Browser(settings)
  browser.window['sap-ui-config'] = {
    resourceRoots: {
      '': settings.baseURL + 'resources/', // TODO needs to be adapted depending on settings
      ...resourceroots
    }
  }

  Promise.resolve()
    .then(() => resources.read(settings, settings.bootstrapLocation))
    .then(bootstrap => {
      browser.window.eval(bootstrap)
    })
  //
  // // Creating a simulated browser
  // const browser = new JSDOM(`
  //   <script id="sap-ui-bootstrap"
  //     src="${settings.bootstrapLocation}"
  //     data-sap-ui-libs=""
  //     data-sap-ui-theme=""
  //     data-sap-ui-compatVersion="edge"
  //     data-sap-ui-frameOptions='allow'
  //     data-sap-ui-preload=""
  //     data-sap-ui-resourceroots='${resourceroots}'>
  //   </script>
  //   <script>
  //     'use strict'
  //     if (typeof sap !== 'undefined') {
  //       sap.ui.getCore().attachInit(function() {
  //         window.__factory__.resolve(sap)
  //       })
  //     } else {
  //       window.__factory__.reject(new Error('Invalid bootstrap'))
  //     }
  //   </script>
  // `, {
  //   url: settings.baseURL,
  //   referrer: settings.baseURL,
  //   contentType: 'text/html',
  //   includeNodeLocations: true,
  //   storageQuota: 10000000,
  //   runScripts: 'dangerously',
  //   resources: new ResourceLoader(settings),
  //   beforeParse: window => {
  //     // Inject factory hooks
  //     window.__factory__ = {
  //       resolve: sap => {
  //         if (settings.exposeAsGlobals) {
  //           global.browser = browser
  //           global.window = window
  //           global.sap = sap
  //         }
  //         factoryResolve({ browser, window, sap })
  //       },
  //       reject: reason => {
  //         factoryReject(reason)
  //       }
  //     }
  //     // Controlling traces
  //     window.console = {}
  //     'dir,error,info,log,warn'.split(',').forEach(name => {
  //       window.console[name] = (...args) => {
  //         if (settings.verbose) {
  //           console[name](...args)
  //         }
  //       }
  //     })
  //     // Compatibility layer (see https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming/fetchStart)
  //     window.performance.timing = {
  //       navigationStart: new Date().getTime(),
  //       fetchStart: new Date().getTime()
  //     }
  //     // Wrap XHR
  //     require('./xhr')(settings, window.XMLHttpRequest)
  //   }
  // })

  return promise
}
