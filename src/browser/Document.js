'use strict'

const Node = require('./Node')

class Document extends Node {

  createElement () {
    return new Node()
  }

  get documentElement () {
    return new Node()
  }

  get scripts () {
    return []
  }

}

module.exports = Document
