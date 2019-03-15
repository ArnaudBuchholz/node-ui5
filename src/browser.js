'use strict'

const url = require('url')
const path = require('path')
const resources = require('./resources')

module.exports = settings => {
  let factoryResolve
  let factoryReject

  const promise = new Promise((resolve, reject) => {
    factoryResolve = resolve
    factoryReject = reject
  })

  const resourceroots = JSON.stringify(Object.keys(settings.resourceroots).reduce((roots, root) => {
    roots[root] = resources.declare(settings.resourceroots[root])
    return roots
  }, {
    'node-ui5': resources.declare(path.join(__dirname, '../lib'))
  }))

  class Node {
    get baseURI () {
      return settings.baseURL
    }

    querySelector () {
      return null
    }
  }

  global.window = global
  window.document = new Node()
  window['sap-ui-config'] = {
    resourceRoots: {
      '': settings.bootstrapLocation
    }
  }
  window.location = new URL(settings.bootstrapLocation, settings.baseURL)
  document.scripts = []

  Promise.resolve()
    .then(() => resources.read(settings, 'resources/sap-ui-core-dbg.js' /*settings.bootstrapLocation*/))
    .then(bootstrap => {
      debugger;
      eval(bootstrap)
      // console.log(bootstrap)
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
