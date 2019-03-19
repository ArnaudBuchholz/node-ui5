'use strict'

const Document = require('./Document')
const EventTarget = require('./EventTarget')
const LocalStorage = require('./LocalStorage')
const Node = require('./Node')
const XMLHttpRequest = require('./XMLHttpRequest')

const { $settings } = require('./const')
const $document = Symbol('document')
const $localStorage = Symbol('localStorage')
const $location = Symbol('location')
const $performance = Symbol('performance')

class Window extends EventTarget {
  get Node () {
    return Node
  }

  get URL () {
    return URL
  }

  get XMLHttpRequest () {
    const settings = this[$settings]
    return function () {
      return new XMLHttpRequest(settings)
    }
  }

  constructor (settings) {
    super()
    this[$settings] = settings
    this[$document] = new Document(this)
  }

  get clearInterval () {
    return clearInterval
  }

  get clearTimeout () {
    return clearTimeout
  }

  get document () {
    return this[$document]
  }

  get localStorage () {
    if (!this[$localStorage]) {
      this[$localStorage] = new LocalStorage()
    }
    return this[$localStorage]
  }

  set location (value) {
    this[$location] = value
  }

  get location () {
    return this[$location]
  }

  get navigator () {
    return {
      userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Chrome/22.0.1216.0 Safari/537.2',
      platform: 'Node.js'
    }
  }

  get pageXOffset () {
    return 0
  }

  get pageYOffset () {
    return 0
  }

  get parent () {
    return null
  }

  get performance () {
    if (!this[$performance]) {
      this[$performance] = {
        timing: {}
      }
    }
    return this[$performance]
  }

  get self () {
    return this
  }

  get setInterval () {
    return setInterval
  }

  get setTimeout () {
    return setTimeout
  }

  get top () {
    return this
  }
}

module.exports = Window
