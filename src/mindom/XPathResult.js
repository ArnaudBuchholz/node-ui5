'use strict'

const {
  XHTML_NAMESPACE,
  defineConstants
} = require('./const')
const Node = require('./Node')

const $snapshot = Symbol('snapshot')

const reXPath = /(\/\/|\.\/|\/)(@)?(?:(\w+):)?(\w+|\*)(?:\[([^\]]+)\])*/
const XPATH_LEVEL = 1
const XPATH_ATTRIBUTE = 2
const XPATH_NAMESPACE_PREFIX = 3
const XPATH_NAME = 4
const XPATH_FILTER = 5

const reFilter = /@(\w+)|contains\(@(\w+),\s*'([^']+)'\)/
const FILTER_HAS_ATTRIBUTE = 1
const FILTER_CONTAINS_ATTRIBUTE = 2
const FILTER_CONTAINS_VALUE = 3

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
  const newResult = new XPathResult()

  reXPath.lastIndex = 0
  let xpathMatch = reXPath.exec(xpathExpression)
  let root = true
  let nodes

  if (xpathMatch) {
    const anyLevel = xpathMatch[XPATH_LEVEL] === '//'
    const isAttribute = !!xpathMatch[XPATH_ATTRIBUTE]
    const namespace = (xpathMatch[XPATH_NAMESPACE_PREFIX] && namespaceResolver(xpathMatch[XPATH_NAMESPACE_PREFIX])) || XHTML_NAMESPACE
    const name = xpathMatch[XPATH_NAME]

    if (anyLevel && root) {
      nodes = contextNode._hierarchy[0]._getSelfAndAllChildren()
    } else if (anyLevel) {
      nodes = contextNode._getSelfAndAllChildren()
    } else {
      nodes = contextNode.childNodes
    }
    if (isAttribute) {
      // Use reduce to convert to attributes

    } else {
      nodes = nodes.filter(node => node.nodeType === Node.ELEMENT_NODE)
    }
    nodes = nodes.filter(node => node.namespaceURI === namespace)
    if (name !== '*') {
      nodes = nodes.filter(node => node.localName === name)
    }

    const filter = xpathMatch[XPATH_FILTER]
    if (filter) {
      reFilter.lastIndex = 0
      let filterMatch = reFilter.exec(filter)
      if (filterMatch) {
        const hasAttribute = filterMatch[FILTER_HAS_ATTRIBUTE]
        if (hasAttribute) {
          nodes = nodes.filter(node => !!node.getAttribute(hasAttribute))
        } else {
          const containsAttribute = filterMatch[FILTER_CONTAINS_ATTRIBUTE]
          const containsValue = filterMatch[FILTER_CONTAINS_VALUE]
          nodes = nodes.filter(node => (node.getAttribute(containsAttribute) || '').includes(containsValue))
        }
      }
      // Loop ?
    }
    // Loop ?
    newResult[$snapshot] = nodes
  }

  return newResult
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
