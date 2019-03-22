'use strict'

require('colors')

class Console {
  constructor (settings) {
    this._settings = settings
    'log,debug,info,warn,error'
      .split(',')
      .forEach(method => {
        Object.defineProperty(this, method, {
          value: Console.prototype._output.bind(this, method),
          enumerable: true
        })
      })
  }

  _output (method, ...params) {
    console.log.apply(console, params
      .map(param => {
        if (typeof param === 'string') {
          return param
        }
        if (typeof param === 'object') {
          return JSON.stringify(param)
        }
        return param.toString()
      })
      .map(text => text.gray)
    )
  }
}

module.exports = Console
