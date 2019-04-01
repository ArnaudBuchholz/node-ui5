'use strict'

const { defineConstants } = require('./const')

const $snapshot = Symbol('snapshot')

class XPathResult {
  constructor () {
    this[$snapshot] = []
  }

  get snapshotLength () {
    return this[$snapshot].length
  }

  snapshotItem (index) {
    return this[$snapshot][index] || null
  }
}

XPathResult.evaluate = function (xpathExpression, contextNode, namespaceResolver, resultType, result) {
}

defineConstants(XPathResult, {
  ANY_TYPE: 0,
  NUMBER_TYPE: 1,
  STRING_TYPE: 2,
  BOOLEAN_TYPE: 3,
  UNORDERED_NODE_ITERATOR_TYPE: 4,
  ORDERED_NODE_ITERATOR_TYPE: 5,
  UNORDERED_NODE_SNAPSHOT_TYPE: 6,
  ORDERED_NODE_SNAPSHOT_TYPE: 7,
  ANY_UNORDERED_NODE_TYPE: 8,
  FIRST_ORDERED_NODE_TYPE: 9
})

module.exports = XPathResult
