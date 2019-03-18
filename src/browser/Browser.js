'use strict'

const Window = require('./Window')

const { $window } = require('./const')

class Browser {
  constructor (settings) {
    this[$window] = new Window(settings)
    this[$window].location = new URL(settings.baseURL)
  }

  eval (code) {
    // Create a secure context
    const window = this[$window]
    const params = ['window', 'global', 'require']
    const values = [window]
    const securedContext = Function.apply(null, params.concat(`with (window) { ${code} }`))
    try {
      debugger
      securedContext.apply(window, values)
    } catch (e) {
      console.error(e)
    }
  }

  get window () {
    return this[$window]
  }
}

module.exports = Browser
