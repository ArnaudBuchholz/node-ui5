'use strict'

const url = require('url')
const Window = require('./Window')

class Browser {

  constructor () {
    this._window = new Window()
  }

  eval (code) {
    // Create a secure context
    const params = ["global", "window"]
    const values = [undefined, this._window]
    const securedContext = Function.apply(null, params.concat(`with (window) { ${code} }`))
    try {
      securedContext.apply(this._window, values)
    } catch (e) {
      console.error(e)
    }
  }

  get window () {
    return this._window
  }

}

module.exports = Browser
