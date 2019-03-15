'use strict'

const Document = require('./Document')
const EventTarget = require('./EventTarget')
const Node = require('./Node')

class Window {

  constructor () {
    this._document = new Document()
  }

  get document () {
    return this._document
  }

  set location (value) {
    Node.baseURI = value.toString()
    this._location = value
  }

  get location () {
    return this._location
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
