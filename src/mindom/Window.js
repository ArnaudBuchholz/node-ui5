'use strict'

const DOMParser = require('./DOMParser')
const EventTarget = require('./EventTarget')
const Node = require('./Node')
const XMLHttpRequest = require('./XMLHttpRequest')

const { $settings } = require('./const')
const $console = Symbol('console')
const $document = Symbol('document')
const $history = Symbol('history')
const $localStorage = Symbol('localStorage')
const $location = Symbol('location')
const $performance = Symbol('performance')

class Window extends EventTarget {
  get DOMParser () {
    return DOMParser
  }

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
    this.location = new URL(settings.baseURL)
  }

  get clearInterval () {
    return clearInterval
  }

  get clearTimeout () {
    return clearTimeout
  }

  eval (code) {
    // Create a secure context
    const params = ['window', 'global', 'require']
    const securedContext = Function.apply(null, params.concat(`with (window) {\n${code}\n}`))
    try {
      securedContext.call(this, this)
    } catch (e) {
      console.error(e)
    }
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

// Members allocated when requested
[{
  name: 'console',
  symbol: $console,
  Class: require('./Console')
}, {
  name: 'document',
  symbol: $document,
  Class: require('./Document')
}, {
  name: 'history',
  symbol: $history,
  Class: require('./History')
}, {
  name: 'localStorage',
  symbol: $localStorage,
  Class: require('./LocalStorage')

}].forEach(member => {
  Object.defineProperty(Window.prototype, member.name, {
    get: function () {
      if (!this[member.symbol]) {
        this[member.symbol] = new member.Class(this)
      }
      return this[member.symbol]
    },
    set: () => false
  })
})

module.exports = Window
