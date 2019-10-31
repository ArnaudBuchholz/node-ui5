'use strict'

require('colors')
const Traces = require('./Traces')

const mappings = {
  log: Traces.INFO,
  debug: Traces.DEBUG,
  info: Traces.INFO,
  warn: Traces.WARNING,
  error: Traces.ERROR
}

class Console {
  constructor (settings) {
    this._settings = settings
    Object.keys(mappings).forEach(method => {
      Object.defineProperty(this, method, {
        value: Console.prototype._output.bind(this, mappings[method]),
        enumerable: true
      })
    })
  }

  _output (level, ...params) {
    this._settings.traces.console(level, ...params);
  }
}

module.exports = Console
