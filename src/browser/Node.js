'use strict'

const { $settings } = require('./const')
const EventTarget = require('./EventTarget')

class Node {
  constructor (settings) {
    this[$settings] = settings
  }

  get baseURI () {
    return $settings.baseURL
  }

  get className () {
    return this._className || ''
  }

  set className (value) {
    this._className = value
  }

  querySelector () {
    return null
  }
}

EventTarget.mixin(Node)

module.exports = Node
