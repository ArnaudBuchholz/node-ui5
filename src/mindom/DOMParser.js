'use strict'

const Document = require('./Document')
const Element = require('./Element')
const Node = require('./Node')

const { $window } = require('./const')

const parser = /<\?([^?]+)\?>|<((?:\w+:)?\w+)|\s*((?:\w+:)?\w+)=(?:"|')([^"']+)(?:"|')|(\s*\/>|<\/(?:\w+:)?\w+>)|<!--([^-]*)-->|([^</>]+)|>/y
// const XML_PROCESSING_INSTRUCTION = 1
const XML_OPEN_TAG = 2
const XML_ATTRIBUTE_NAME = 3
const XML_ATTRIBUTE_VALUE = 4
// const XML_CLOSE_TAG = 5
const XML_COMMENT = 6
const XML_TEXT = 7

const handlers = [
  undefined,

  // XML_PROCESSING_INSTRUCTION
  undefined,

  // XML_OPEN_TAG
  (current, match) => {
    return current.appendChild(new Element(current[$window], match[XML_OPEN_TAG]))
  },

  // XML_ATTRIBUTE_NAME
  (current, match) => {
    current.setAttribute(match[XML_ATTRIBUTE_NAME], match[XML_ATTRIBUTE_VALUE])
  },

  // XML_ATTRIBUTE_VALUE
  undefined,

  // XML_CLOSE_TAG
  (current, match) => {
    return current.parentNode
  },

  // XML_COMMENT
  (current, match) => {
    const text = match[XML_COMMENT].trim() // ignore xml:space
    if (text.length) {
      const node = new Node(current[$window], Node.COMMENT_NODE)
      node.nodeValue = text
      current.appendChild(node)
    }
  },

  // XML_TEXT
  (current, match) => {
    const text = match[XML_TEXT].trim() // ignore xml:space
    if (text.length) {
      const node = new Node(current[$window], Node.TEXT_NODE)
      node.nodeValue = text
      current.appendChild(node)
    }
  }
]

class DOMParser {
  constructor (window) {
    this[$window] = window
  }

  parseFromString (string, type) {
    parser.lastIndex = 0
    const document = new Document(this[$window])
    document._clearChildren()
    let current = document
    let match = parser.exec(string)
    while (match) {
      let newCurrent
      if (!handlers.every((handler, index) => {
        if (handler && match[index]) {
          newCurrent = handler(current, match)
          return false
        }
        return true
      }) && newCurrent) {
        current = newCurrent
      }
      match = parser.exec(string)
    }
    return document
  }
}

module.exports = DOMParser
