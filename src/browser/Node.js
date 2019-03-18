'use strict'

const EventTarget = require('./EventTarget')

const { $settings, $window } = require('./const')
const $attributes = Symbol('attributes')
const $childNodes = Symbol('childNodes')
const $nodeType = Symbol('nodeType')
const $style = Symbol('style')

class Node extends EventTarget {
  constructor (window, settings, nodeType) {
    super()
    this[$window] = window
    this[$settings] = settings
    this[$nodeType] = nodeType
    this[$attributes] = {}
    this[$childNodes] = []
    this[$style] = {}
  }

  appendChild (node) {
    this[$childNodes].push(node)
    return node
  }

  get baseURI () {
    return this[$settings].baseURL
  }

  get childNodes () {
    return this[$childNodes]
  }

  get className () {
    return this._className || ''
  }

  cloneNode (deep) {
    const clone = new Node(this[$window], this[$settings], this[$nodeType])
    clone[$attributes] = {...this[$attributes]}
    if (deep) {
      this[$childNodes].forEach(child => clone[$childNodes].push(child.cloneNode(true)))
    }
    return clone
  }

  set className (value) {
    this._className = value
  }

  get firstChild () {
      const length = this[$childNodes].length
      if (length) {
          return this[$childNodes][0]
      }
      return null
  }

  getAttribute (name) {
      if (name === "className") {
        return this.className
      }
      return this[$attributes][name]
  }

  getElementsByTagName () {
      return []
  }

  insertBefore (node, refNode) {
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

  get nodeType () {
    return this[$nodeType]
  }

  get ownerDocument () {
    return this[$window].document
  }

  querySelector () {
    return null
  }

  querySelectorAll () {
      return []
  }

  removeChild (node) {
    const pos = this[$childNodes].indexOf(node)
    if (pos !== -1) {
        this[$childNodes].splice(pos, 1)
    }
  }

  setAttribute (name, value) {
    this[$attributes][name] = value
  }

  get style () {
      return this[$style]
  }
}

const nodeTypes = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11
}

Object.keys(nodeTypes).forEach(name => {
  Object.defineProperty(Node, name, {
    value: nodeTypes[name],
    writable: false
  })
})

module.exports = Node
