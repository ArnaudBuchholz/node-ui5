'use strict'

const url = require('url')
const Document = require('./Document')
const EventTarget = require('./EventTarget')
const Node = require('./Node')
const XMLHttpRequest = require('./XMLHttpRequest')

const { $settings } = require('./const')
const $document = Symbol('document')
const $location = Symbol('location')

class Window {
  get Node () {
    return Node
  }

  get URL () {
    return URL
  }

  get XMLHttpRequest () {
    const settings = this[$setings]
    return function () {
      return new XMLHttpRequest(settings)
    }
  }

  constructor (settings) {
    this[$settings] = settings
    this[$document] = new Document(settings)
  }

  get document () {
    return this[$document]
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

  get parent () {
    return null
  }

  get self () {
    return this
  }

  get top () {
    return this
  }
}

EventTarget.mixin(Window)

module.exports = Window
