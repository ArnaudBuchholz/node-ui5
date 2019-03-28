'use strict'

const ClassList = require('./ClassList')
const Node = require('./Node')

const {
  $dataset,
  $name,
  $nodeType,
  $window
} = require('./const')
const $attributes = Symbol('attributes')
const $classList = Symbol('classList')
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

  get attributes () {
    const attributes = this[$attributes]
    return Object.keys(attributes).map(name => {
      return {
        name,
        value: attributes[name]
      }
    })
  }

  get classList () {
    if (!this[$classList]) {
      this[$classList] = new ClassList(this[$window], this)
    }
    return this[$classList]
  }

  get className () {
    return this.getAttribute('class') || ''
  }

  set className (value) {
    this.setAttribute('class', value)
  }

  _cloneNode () {
    const clone = new Element(this[$window], this[$name], this[$nodeType])
    clone[$attributes] = { ...this[$attributes] }
    clone[$style] = this[$style]
    return clone
  }

  get dataset () {
    if (!this[$dataset]) {
      this[$dataset] = new Proxy({}, {
        get: (obj, name) => this.getAttribute('data-' + name),
        set: (obj, name, value) => {
          this.setAttribute('data-' + name, value)
          return true
        }
      })
    }
    return this[$dataset]
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
    return this._getSelfAndAllChildren()
      .filter(node => node[$nodeType] === Node.ELEMENT_NODE &&
                        (node[$name] || '').toLowerCase() === lowerCaseName)
  }

  get innerHTML () {
    return this.childNodes
      .map(node => node._toHTML())
      .join('')
  }

  set innerHTML (value) {
    this._clearChildren()
    if (value) {
      const window = this[$window]
      const parser = new window.DOMParser(window)
      const document = parser.parseFromString(value, 'text/html')
      this.appendChild(document.firstChild)
    }
  }

  querySelector (selector) {
    if (selector === 'SCRIPT[src][id=sap-ui-bootstrap]') {
      return this._getSelfAndAllChildren()
        .filter(node => node[$nodeType] === Node.ELEMENT_NODE &&
                        node.getAttribute('src') &&
                        node.id === 'sap-ui-bootstrap')[0] || null
    }
    return null
  }

  querySelectorAll () {
    return []
  }

  setAttribute (name, value) {
    this[$attributes][name] = value.toString()
  }

  get style () {
    return this[$style]
  }

  get tagName () {
    return this[$name]
  }

  get textContent () {
    return this._getSelfAndAllChildren()
      .filter(node => node[$nodeType] === Node.TEXT_NODE)
      .map(node => node.nodeValue)
      .join('')
  }

  set textContent (value) {
    this._clearChildren()
    if (value) {
      const text = new Node(this[$window], Node.TEXT_NODE)
      text.nodeValue = value
      this.appendChild(text)
    }
  }

  _toHTMLClose () {
    return `</${this[$name]}>`
  }

  _toHTMLOpen () {
    const attributes = this[$attributes]
    return `<${this[$name]}${Object.keys(attributes).map(name => ` ${name}="${attributes[name]}"`).join('')}>`
  }
}

// Map some attributes directly as properties
[
  'href',
  'id'
].forEach(name => {
  Object.defineProperty(Element.prototype, name, {
    get: function () {
      return this.getAttribute(name)
    },
    set: function (value) {
      this.setAttribute(name, value)
    }
  })
})

module.exports = Element
