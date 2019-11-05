'use strict'

let _lastTimerId = 0
const _timers = {}

function _hookSetTimer (name, api, callback, delay) {
  const callbackName = callback.name || 'anonymous'
  const timerId = ++_lastTimerId
  const timer = api(() => {
    console.log('TIMR'.magenta, `${name}(${timerId}): ${callbackName}`.gray)
    if (name !== 'timeout') {
      delete _timers[timerId]
    }
    callback()
  }, delay)
  _timers[timerId] = timer
  console.log('TIMR'.magenta, `set${name.charAt(0).toUpperCase() + name.substring(1)}(${callbackName}, ${delay}): ${timerId}`.gray)
  return timerId
}

function _hookClearTimer (name, api, timerId) {
  const timer = _timers[timerId]
  console.log('TIMR'.magenta, `clear${name.charAt(0).toUpperCase() + name.substring(1)}(${timerId})`.gray)
  api(timer)
  delete _timers[timerId]
}

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
    window.setTimeout = (callback, delay) => {
      return _hookSetTimer('timeout', setTimeout, callback, delay)
    }
    window.clearTimeout = timeoutId => {
      _hookClearTimer('timeout', clearTimeout, timeoutId)
    }
    window.setInterval = (callback, delay) => {
      return _hookSetTimer('interval', setInterval, callback, delay)
    }
    window.clearInterval = intervalId => {
      _hookClearTimer('interval', clearInterval, intervalId)
    }
  },

  inject (settings, url, content) {
    if (url.endsWith('sap-ui-core.js') || url.endsWith('sap-ui-core-dbg.js')) {
      // to document requireJS processing
      content = content.replace(/var log\s*=\s*{/, 'var log=window.__log,_log={')
    }
    content = content.replace(/debugModuleLoading/g, 'debugmoduleloading')
    return content
  }
}
