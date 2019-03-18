'use strict'

const { $settings } = require('./const')
const Node = require('./Node')

class Document extends Node {
  constructor (settings) {
    super(settings)
  }

  createElement () {
    return new Node(this[$settings])
  }

  get documentElement () {
    return new Node(this[$settings])
  }

  get scripts () {
    return []
  }
}

module.exports = Document
