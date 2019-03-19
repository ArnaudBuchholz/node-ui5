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
    return new Node(this[$window], Node.DOCUMENT_FRAGMENT_NODE)
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

module.exports = Document
