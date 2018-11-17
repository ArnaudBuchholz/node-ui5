'use strict'

const jsdom = require('jsdom')
const { JSDOM } = jsdom
const resources = require('./resources')
const $browser = Symbol('browser')

class ResourceLoader extends jsdom.ResourceLoader {
  fetch (url, options) {
    const content = resources.read(this._settings, url)
    if (content) {
      return Promise.resolve(content)
    }
    return null
  }

  constructor (settings) {
    super()
    this._settings = settings
  }
}

module.exports = settings => {
  let factoryResolve
  let factoryReject

  const promise = new Promise((resolve, reject) => {
    factoryResolve = resolve
    factoryReject = reject
  })

  // Creating a simulated browser
  const browser = new JSDOM(`
    <script id="sap-ui-bootstrap"
      src="${settings.bootstrapLocation}"
      data-sap-ui-libs=""
      data-sap-ui-theme=""
      data-sap-ui-compatVersion="edge"
      data-sap-ui-frameOptions='allow'
      data-sap-ui-preload="">
    </script>
    <script>
      'use strict'
      if (typeof sap !== 'undefined') {
        sap.ui.getCore().attachInit(function() {
          window.__factory__.resolve(sap)
        })
      } else {
        window.__factory__.reject(new Error('Invalid bootstrap'))
      }
    </script>
  `, {
    url: settings.baseURL,
    referrer: settings.baseURL,
    contentType: 'text/html',
    includeNodeLocations: true,
    storageQuota: 10000000,
    runScripts: 'dangerously',
    resources: new ResourceLoader(settings),
    beforeParse: window => {
      // Inject factory hooks
      window.__factory__ = {
        resolve: sap => {
          sap[$browser] = browser
          factoryResolve(sap)
        },
        reject: reason => {
          factoryReject(reason)
        }
      }
      // Controlling traces
      window.console = {}
      'dir,error,info,log,warn'.split(',').forEach(name => {
        window.console[name] = (...args) => {
          if (settings.verbose) {
            console[name](...args)
          }
        }
      })
      // Compatibility layer (see https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming/fetchStart)
      window.performance.timing = {
        navigationStart: new Date().getTime(),
        fetchStart: new Date().getTime()
      }
      // Wrap XHR
      require('./xhr')(settings, window.XMLHttpRequest)
    }
  })

  return promise
}
