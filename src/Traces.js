'use strict'

const debugPrefix = '--debug:'
const noop = () => false

const DEBUG = 1
const INFO = 2
const SUCCESS = 3
const WARNING = 4
const ERROR = 5

const types = {
  boot: 'BOOT',
  console: 'CONS',
  network: 'XHRQ',
  performance: 'PERF',
  resource: 'RSRC'
}

class Traces {
  constructor (verbose, debug) {
    this._enabled = {}
    if (typeof debug === 'object') {
      Object.assign(this._enabled, debug)
    } else {
      Object.keys(types).forEach(name => {
        this._enabled[name] = WARNING
      })
    }
    verbose = verbose || process.argv.includes('--verbose')
    if (verbose) {
      this._enabled.console = DEBUG
    }
    debug = debug || process.argv.includes('--debug')
    if (debug) {
      Object.keys(types).forEach(name => {
        this._enabled[name] = DEBUG
      })
    }
    process.argv
      .filter(param => param.startsWith(debugPrefix))
      .forEach(param => {
        this._enabled[param.substring(debugPrefix.length)] = DEBUG
      }, this)
    Object.getOwnPropertyNames(Traces.prototype)
      .filter(name => name !== 'constructor' && !name.startsWith('_') && name !== 'enabled')
      .forEach(name => {
        if (!Object.prototype.hasOwnProperty.call(this._enabled, name)) {
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
    if (this._enabled[type] > level) {
      return // ignore
    }
    this._out(type, level, content)
  }

  get enabled () {
    return this._enabled
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

  // Performance related messages
  performance (text, startTime, level = INFO) {
    this._trace('performance', level, { text, status: `${new Date() - startTime}ms` })
  }

  // Enables window console messages
  console (level, ...params) {
    if (this._enabled.console > level) {
      return // ignore
    }
    const status = params.map(param => {
      if (typeof param === 'string') {
        return param
      }
      if (typeof param === 'object') {
        return JSON.stringify(param)
      }
      return param.toString()
    }).join(' ')
    this._out('console', level, { status })
  }
}

Traces.DEBUG = DEBUG
Traces.INFO = INFO
Traces.SUCCESS = SUCCESS
Traces.WARNING = WARNING
Traces.ERROR = ERROR

module.exports = Traces
