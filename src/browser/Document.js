'use strict'

const { $settings, $window } = require('./const')
const Node = require('./Node')

class Document extends Node {
  constructor (window, settings) {
    super(window, settings, Node.DOCUMENT_NODE)
  }

  createDocumentFragment () {
    return new Node(this[$window], this[$settings], Node.DOCUMENT_FRAGMENT_NODE)
  }

  createElement () {
    return new Node(this[$window], this[$settings], Node.ELEMENT_NODE)
  }

  get documentElement () {
    return this
  }

  get location () {
    return this[$window].location
  }

  get readyState () {
    return "complete"
  }

  get scripts () {
    return []
  }
}

module.exports = Document
