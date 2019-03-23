'use strict'

module.exports = {

  configure (settings, window) {
    var debugBoot = window.document.createElement('script')
    debugBoot.textContent = `
    window.__log = {
      debug: console.debug.bind(console),
      info: console.info.bind(console),
      warning: console.warn.bind(console),
      error: console.error.bind(console),
      isLoggable: function () { return true }
    }`
    window.document.documentElement.appendChild(debugBoot)
  },

  inject (settings, url, content) {
    if (url.endsWith('sap-ui-core.js') || url.endsWith('sap-ui-core-dbg.js')) {
      // to document requireJS processing
      return content.replace(/var log\s*=\s*{/, 'var log=window.__log,_log={')
    }
    return content
  }
}
