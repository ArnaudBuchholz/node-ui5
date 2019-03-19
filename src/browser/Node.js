'use strict'

const EventTarget = require('./EventTarget')

const {
  $name,
  $nodeType,
  $settings,
  $window
} = require('./const')
const $childNodes = Symbol('childNodes')
const $parent = Symbol('parent')

class Node extends EventTarget {
  constructor (window, nodeType) {
    super()
    this[$window] = window
    this[$nodeType] = nodeType
    this[$childNodes] = []
  }

  appendChild (node) {
    node[$parent] = this
    this[$childNodes].push(node)
    return node
  }

  get baseURI () {
    return this[$window][$settings].baseURL
  }

  get childNodes () {
    return this[$childNodes]
  }

  _cloneNode () {
    const clone = new Node(this[$window], this[$nodeType])
    clone[$name] = this[$name]
    return clone
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

  get localName () {
    return this[$name]
  }

  get nodeName () {
    return this[$name]
  }

  get nodeType () {
    return this[$nodeType]
  }

  get ownerDocument () {
    return this[$window].document
  }

  get parentNode () {
    return this[$parent] || null
  }

  removeChild (node) {
    const pos = this[$childNodes].indexOf(node)
    if (pos !== -1) {
      this[$childNodes].splice(pos, 1)
    }
  }
}

function defineConstants (constants) {
  Object.keys(constants).forEach(name => {
    Object.defineProperty(Node, name, {
      value: constants[name],
      writable: false
    })
  })
}

// Node types
defineConstants({
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11
})

// Document position mask
defineConstants({
  DOCUMENT_POSITION_DISCONNECTED: 1,
  DOCUMENT_POSITION_PRECEDING: 2,
  DOCUMENT_POSITION_FOLLOWING: 4,
  DOCUMENT_POSITION_CONTAINS: 8,
  DOCUMENT_POSITION_CONTAINED_BY: 16,
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32
})

module.exports = Node
