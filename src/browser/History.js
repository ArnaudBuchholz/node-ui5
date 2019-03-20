'use strict'

const { $window } = require('./const')

class History {
  constructor (window) {
    this[$window] = window
  }

  get length () {
    return 1
  }

  pushState () {
  }

  replaceState () {
  }
}

module.exports = History
