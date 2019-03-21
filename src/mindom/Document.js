'use strict'

const Element = require('./Element')
const Node = require('./Node')

const { $window } = require('./const')

class Document extends Element {
  constructor (window, settings) {
    super(window, undefined, Node.DOCUMENT_NODE)
    // Build empty document
    const html = this.createElement('html')
    this.appendChild(html)
    const head = this.createElement('head')
    html.appendChild(head)
    const body = this.createElement('body')
    html.appendChild(body)
  }

  createComment () {
    return new Node(this[$window], Node.COMMENT_NODE)
  }

  createDocumentFragment () {
    return new Element(this[$window], undefined, Node.DOCUMENT_FRAGMENT_NODE)
  }

  createElement (name) {
    return new Element(this[$window], name)
  }

  get defaultView () {
    return this[$window]
  }

  get documentElement () {
    return this
  }

  getElementById () {
    return null
  }

  get location () {
    return this[$window].location
  }

  get nodeName () {
    return '#document'
  }

  get readyState () {
    return 'complete'
  }

  get scripts () {
    return []
  }
}

// Shortcuts to elements
[
  'body',
  'head'
].forEach(name => Object.defineProperty(Document.prototype, name, {
  get: function () {
    return this.getElementsByTagName(name)[0]
  },
  set: () => false
}))

module.exports = Document
