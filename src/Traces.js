'use strict'

const debugPrefix = '--debug:'
const noop = () => false

const INFO = Symbol('info')
const ERROR = Symbol('error')
const SUCCESS = Symbol('success')

const levels = {}

class Traces {

  constructor (verbose, debug) {
    this._enabled = {}
    if (typeof debug === "object") {
      Object.assign(this._enabled, debug)
    }
    if (verbose || process.argv.some(param => param === '--verbose')) {
      this._enabled.console = true
      this._enabled.network = true
      this._enabled.resource = true
    }
    this._debug = debug === true || process.argv.some(param => param === '--debug')
    process.argv
      .filter(param => param.startsWith(debugPrefix))
      .forEach(param => this._enabled[param.substring(debugPrefix.length)] = true, this)
    Object.getOwnPropertyNames(Traces.prototype)
      .filter(name => name !== 'constructor' && !name.startsWith('_'))
      .forEach(name => {
      if (!this._debug && !this._enabled[name]) {
        this[name] = noop
      }
    }, this)
  }

  _out (type, ...parts) {
    const level = parts.pop()
    const status = parts.pop()
    let coloredStatus
    let api
    if (level === ERROR) {
      coloredStatus = status.red
      api = console.error
    } else {
      api = console.log
      if (level === SUCCESS) {
        coloredStatus = status.green
      } else {
        coloredStatus = status.gray
      }
    }
    if (parts.length) {
      api(type.magenta, parts.join(' ').gray, coloredStatus)
    } else {
      api(type.magenta, coloredStatus)
    }
  }

  // Bootstrap related messages
  boot (message, level = INFO) {
    this._out('BOOT', message, level)
  }

  resource (url, status, level) {
    this._out('RSRC', url, status, level)
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
