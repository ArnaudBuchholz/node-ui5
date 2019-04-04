'use strict'

const EventTarget = require('./EventTarget')

const {
  $nodeType,
  $settings,
  $window,
  defineConstants
} = require('./const')
const $childNodes = Symbol('childNodes')
const $nodeValue = Symbol('nodeValue')
const $parent = Symbol('parent')

class Node extends EventTarget {
  constructor (window, nodeType) {
    super()
    this[$window] = window
    this[$nodeType] = nodeType
    this._clearChildren()
  }

  appendChild (node) {
    node[$parent] = this
    this[$childNodes].push(node)
    this._onNewChild(node)
    return node
  }

  get baseURI () {
    return this[$window][$settings].baseURL
  }

  get childNodes () {
    return this[$childNodes]
  }

  _clearChildren () {
    this[$childNodes] = []
  }

  _cloneNode () {
    return new Node(this[$window], this[$nodeType])
  }

  cloneNode (deep) {
    const clone = this._cloneNode()
    if (deep) {
      this[$childNodes].forEach(child => clone[$childNodes].push(child.cloneNode(true)))
    }
    return clone
  }

  compareDocumentPosition (otherNode) {
    // Check only for disconnected
    if (!this.parentNode || !otherNode.parentNode) {
      return Node.DOCUMENT_POSITION_DISCONNECTED
    }
    return 0
  }

  get firstChild () {
    const length = this[$childNodes].length
    if (length) {
      return this[$childNodes][0]
    }
    return null
  }

  _getSelfAndAllChildren () {
    return this[$childNodes].reduce((result, child) => [...result, ...child._getSelfAndAllChildren()], [this])
  }

  get _hierarchy () {
    const hierarchy = []
    let node = this
    while (node) {
      hierarchy.unshift(node)
      node = node[$parent]
    }
    return hierarchy
  }

  insertBefore (node, refNode) {
    node[$parent] = this
    const pos = this[$childNodes].indexOf(refNode)
    this[$childNodes].splice(pos, 0, node)
  }

  get lastChild () {
    const length = this[$childNodes].length
    if (length) {
      return this[$childNodes][length - 1]
    }
    return null
  }

  get nextSibling () {
    const parent = this[$parent]
    if (parent) {
      const parentChildren = parent[$childNodes]
      const pos = parentChildren.indexOf(this) + 1
      if (pos && pos < parentChildren.length) {
        return parentChildren[pos]
      }
    }
    return null
  }

  get nodeType () {
    return this[$nodeType]
  }

  _hasValue () {
    return [Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(this[$nodeType])
  }

  get nodeValue () {
    if (this._hasValue()) {
      return this[$nodeValue] || ''
    }
    return null
  }

  set nodeValue (value) {
    if (this._hasValue()) {
      this[$nodeValue] = value
    }
  }

  _onNewChild (node) {
    if (this[$parent]) {
      this[$parent]._onNewChild(node)
    }
  }

  get ownerDocument () {
    return this[$window].document
  }

  get parentNode () {
    return this[$parent] || null
  }

  get previousSibling () {
    const parent = this[$parent]
    if (parent) {
      const parentChildren = parent[$childNodes]
      const pos = parentChildren.indexOf(this) - 1
      if (pos >= 0) {
        return parentChildren[pos]
      }
    }
    return null
  }

  removeChild (node) {
    const pos = this[$childNodes].indexOf(node)
    if (pos !== -1) {
      this[$childNodes].splice(pos, 1)
    }
  }

  _toHTML () {
    if (this[$nodeType] === Node.COMMENT_NODE) {
      return `<!--${this[$nodeValue]}-->`
    }
    if (this._hasValue()) {
      return this[$nodeValue]
    }
    return [
      this._toHTMLOpen(),
      ...this[$childNodes].map(node => node._toHTML()),
      this._toHTMLClose()
    ].join('')
  }

  _toHTMLClose () {}

  _toHTMLOpen () {}
}

// Node types
defineConstants(Node, {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11
})

// Document position mask
defineConstants(Node, {
  DOCUMENT_POSITION_DISCONNECTED: 1,
  DOCUMENT_POSITION_PRECEDING: 2,
  DOCUMENT_POSITION_FOLLOWING: 4,
  DOCUMENT_POSITION_CONTAINS: 8,
  DOCUMENT_POSITION_CONTAINED_BY: 16,
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32
})

module.exports = Node
