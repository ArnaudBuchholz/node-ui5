'use strict'

const url = require('url')
const Window = require('./Window')

const $window = Symbol('window')

class Browser {
  constructor (settings) {
    this[$window] = new Window(settings)
    this[$window].location = new URL(settings.baseURL)
  }

  eval (code) {
    // Create a secure context
    const params = ['global', 'window']
    const values = [undefined, this._window]
    const securedContext = Function.apply(null, params.concat(`with (window) { ${code} }`))
    try {
      securedContext.apply(this._window, values)
    } catch (e) {
      console.error(e)
    }
  }

  get window () {
    return this[$window]
  }
}

module.exports = Browser
