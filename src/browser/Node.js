'use strict'

const EventTarget = require('./EventTarget')

let _baseURI

class Node {

  addEventListener () {
  }

  get baseURI () {
    return _baseURI
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

Object.defineProperty(Node, 'baseURI', {
  get () {
    return _baseURI
  },
  set (value) {
    _baseURI = value
  }
})

EventTarget.mixin(Node)

module.exports = Node
