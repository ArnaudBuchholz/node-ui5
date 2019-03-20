'use strict'

const Window = require('./Window')

const { $window } = require('./const')

class Browser {
  constructor (settings) {
    this[$window] = new Window(settings)
    this[$window].location = new URL(settings.baseURL)
  }

  get window () {
    return this[$window]
  }
}

module.exports = Browser
