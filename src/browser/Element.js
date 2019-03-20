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
    return this._getChildren()
      .filter(node => node[$nodeType] === Node.ELEMENT_NODE &&
                        (node[$name] || '').toLowerCase() === lowerCaseName)
  }

  get innerHTML () {
    return this._toHTML()
  }

  set innerHTML (value) {
    // Very BASIC HTML parser using regexp
    const reHTMLparse = /<(\w+)|\s*(\w+)=(?:"|')([^"']+)(?:"|')|(\/>|<\/\w+>)|>/y
    const HTML_OPEN = 1
    const HTML_ATTRIBUTE_NAME = 2
    const HTML_ATTRIBUTE_VALUE = 3
    const HTML_CLOSE = 4

    this._clearChildren()
    reHTMLparse.lastIndex = 0
    let match = reHTMLparse.exec(value)
    let element = this
    while (match) {
      if (match[HTML_OPEN]) {
        element = this.appendChild(new Element(this[$window], match[HTML_OPEN]))
      } else if (match[HTML_ATTRIBUTE_NAME]) {
        element.setAttribute(match[HTML_ATTRIBUTE_NAME], match[HTML_ATTRIBUTE_VALUE])
      } else if (match[HTML_CLOSE]) {
        element = element.parentNode
      }
      match = reHTMLparse.exec(value)
    }
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

  _toHTMLClose () {
    return `</${this[$name]}>`
  }

  _toHTMLOpen () {
    const attributes = this[$attributes]
    return `</${this[$name]}${Object.keys(attributes).map(name => ` ${name}="${attributes[name]}"`).join('')}>`
  }
}

module.exports = Element
