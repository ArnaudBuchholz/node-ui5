'use strict'

const debugPrefix = '--debug:'
const noop = () => false

const INFO = 0
const ERROR = 1
const SUCCESS = 2

const NO_INFO = 1

const types = {
  boot: 'BOOT',
  resource: 'RSRC',
  network: 'XHRQ'
}

class Traces {
  constructor (verbose, debug) {
    this._enabled = {}
    if (typeof debug === 'object') {
      Object.assign(this._enabled, debug)
    }
    if (verbose || process.argv.some(param => param === '--verbose')) {
      this._enabled.console = true
      this._enabled.network = NO_INFO
      this._enabled.resource = NO_INFO
    }
    this._debug = debug === true || process.argv.some(param => param === '--debug')
    process.argv
      .filter(param => param.startsWith(debugPrefix))
      .forEach(param => {
        this._enabled[param.substring(debugPrefix.length)] = true
      }, this)
    Object.getOwnPropertyNames(Traces.prototype)
      .filter(name => name !== 'constructor' && !name.startsWith('_'))
      .forEach(name => {
        if (!this._debug && !this._enabled[name]) {
          this[name] = noop
        }
      }, this)
  }

  _computeApiAndColoredStatus (level, status) {
    if (level === ERROR) {
      return {
        api: console.error,
        coloredStatus: status.red
      }
    }
    let coloredStatus
    if (level === SUCCESS) {
      coloredStatus = status.green
    } else {
      coloredStatus = status.gray
    }
    return {
      api: console.log,
      coloredStatus
    }
  }

  _out (type, level, { text, status }) {
    const traceType = types[type]
    const { api, coloredStatus } = this._computeApiAndColoredStatus(level, status)
    if (text) {
      api(traceType.magenta, text.gray, coloredStatus)
    } else {
      api(traceType.magenta, coloredStatus)
    }
  }

  _trace (type, level, content) {
    if (this._enabled[type] === NO_INFO && level === INFO) {
      return // ignore
    }
    this._out(type, level, content)
  }

  // Bootstrap related messages
  boot (message, level = INFO) {
    this._trace('boot', level, { status: message })
  }

  // Resource handling
  resource (url, status, level) {
    this._trace('resource', level, { text: url, status })
  }

  // Network (XHR) handling
  network (id, text, status = '', level = INFO) {
    this._trace('network', level, { text: `[${id}] ${text}`, status })
  }

  // Enables window console messages
  console () {
    return true
  }
}

Traces.INFO = INFO
Traces.ERROR = ERROR
Traces.SUCCESS = SUCCESS

module.exports = Traces
