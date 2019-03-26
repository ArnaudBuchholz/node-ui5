'use strict'

const Document = require('./Document')
const Element = require('./Element')

const { $window } = require('./const')

const parser = /<\?([^?]+)\?>|<((?:\w+:)?\w+)|\s*((?:\w+:)?\w+)=(?:"|')([^"']+)(?:"|')|(\/>|<\/(?:\w+:)?\w+>)|>/y
const XML_PROCESSING_INSTRUCTION = 1
const XML_OPEN_TAG = 1
const XML_ATTRIBUTE_NAME = 2
const XML_ATTRIBUTE_VALUE = 3
const XML_CLOSE_TAG = 4

const handlers = [
  undefined,

  // XML_PROCESSING_INSTRUCTION
  (current, match) => {

  },

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
  }
]

class DOMParser {
  constructor (window) {
    this[$window] = window
  }

  parseFromString (string, type) {
    let lastIndex = 0
    parser.lastIndex = 0
    const document = new Document(this[$window])
    document._clearChildren()
    let current = document
    let match = parser.exec(string)
    let result
    while (match) {
      handlers.every((handler, index) => {
        if (handler && match[index]) {
          result = handler(current, match)
          return false
        }
        return true
      })
      if (result) {
        current = result
      }
      match = parser.exec(string)
    }
    return document
  }
}

module.exports = DOMParser
