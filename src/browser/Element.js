'use strict'

const Node = require('./Node')

const {
  $name,
  $nodeType,
  $window
} = require('./const')
const $attributes = Symbol('attributes')
const $style = Symbol('style')

class Element extends Node {
  constructor (window, name = undefined, nodeType = Node.ELEMENT_NODE) {
    super(window, nodeType)
    this[$attributes] = {}
    if (name) {
      this[$name] = name
    }
    this[$style] = {}
  }

  get className () {
    return this[$attributes]['class'] || ''
  }

  set className (value) {
    this[$attributes]['class'] = value
  }

  _cloneNode () {
    const clone = new Element(this[$window], this[$name], this[$nodeType])
    clone[$attributes] = { ...this[$attributes] }
    clone[$style] = this[$style]
    return clone
  }

  getAttribute (name) {
    return this[$attributes][name]
  }

  getBoundingClientRect () {
    return {
      get left () { return 0 },
      get top () { return 0 },
      get right () { return 0 },
      get bottom () { return 0 },
      get x () { return 0 },
      get y () { return 0 },
      get width () { return 0 },
      get height () { return 0 }
    }
  }

  getElementsByTagName (name) {
    const lowerCaseName = name.toLowerCase()
    return this._getAll()
      .filter(node => node[$nodeType] === Node.ELEMENT_NODE &&
                        (node[$name] || '').toLowerCase() === lowerCaseName)
  }

  querySelector () {
    return null
  }

  querySelectorAll () {
    return []
  }

  setAttribute (name, value) {
    this[$attributes][name] = value
  }

  get style () {
    return this[$style]
  }

  get tagName () {
    return this[$name]
  }
}

module.exports = Element
