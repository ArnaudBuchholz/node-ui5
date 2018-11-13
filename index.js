const jsdom = require('jsdom')
const { JSDOM } = jsdom
const resources = require('./resources')

class ResourceLoader extends jsdom.ResourceLoader {
  fetch (url, options) {
    const content = resources.read(url)
    if (content) {
      return Promise.resolve(content)
    }
    return null
  }
}

let moduleResolve
// let moduleReject

const promise = new Promise((resolve, reject) => {
  moduleResolve = resolve
  // moduleReject = reject
})

// Creating a simulated browser
const browser = new JSDOM(`
    <script id="sap-ui-bootstrap"
      src="resources/sap-ui-core.js"
      data-sap-ui-libs=""
      data-sap-ui-theme=""
      data-sap-ui-compatVersion="edge"
      data-sap-ui-frameOptions='allow'
      data-sap-ui-preload="">
    </script>
    <script>
      'use strict'
      sap.ui.getCore().attachInit(function() {
        window.ready(sap)
      })
    </script>
`, {
  url: resources.baseUrl,
  referrer: resources.baseUrl,
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 10000000,
  runScripts: 'dangerously',
  resources: new ResourceLoader(),
  beforeParse: window => {
    window.ready = moduleResolve
    // Compatibility layer (see https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming/fetchStart)
    window.performance.timing = {
      navigationStart: new Date().getTime(),
      fetchStart: new Date().getTime()
    }
    // Wrap XHR
    require('./xhr')(window.XMLHttpRequest)
  }
})

module.exports = promise
