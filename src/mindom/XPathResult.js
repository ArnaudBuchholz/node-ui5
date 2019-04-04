'use strict'

const {
  XHTML_NAMESPACE,
  $parent,
  $window,
  defineConstants
} = require('./const')

const Element = require('./Element')
const Node = require('./Node')

const $snapshot = Symbol('snapshot')

const reXPath = /(\/\/|\.\/|\/)(@)?(?:(\w+):)?(\w+|\*)(?:\[([^\]]+)\])*|\s*(\|)\s*/y
const XPATH_LEVEL = 1
const XPATH_ATTRIBUTE = 2
const XPATH_NAMESPACE_PREFIX = 3
const XPATH_NAME = 4
const XPATH_FILTER = 5
const XPATH_OR = 6

const reFilter = /@(\w+)(?:='([^']+)')?|contains\(@(\w+),\s*'([^']+)'\)|\s+and\s+/y
const FILTER_HAS_ATTRIBUTE = 1
const FILTER_ATTRIBUTE_VALUE = 2
const FILTER_CONTAINS_ATTRIBUTE = 3
const FILTER_CONTAINS_VALUE = 4

class XPathResult {
  constructor (snapshot = []) {
    this[$snapshot] = snapshot
  }

  get snapshotLength () {
    return this[$snapshot].length
  }

  snapshotItem (index) {
    return this[$snapshot][index] || null
  }
}

function _getAttributeNodes (node) {
  return node.attributes.map(attribute => {
    const attributeNode = new Element(node[$window], attribute.name, Node.ATTRIBUTE_NODE)
    attributeNode[$parent] = node
    attributeNode.nodeValue = attribute.value
    return attributeNode
  })
}

function _processFilter (filterMatch, nodes) {
  const hasAttribute = filterMatch[FILTER_HAS_ATTRIBUTE]
  if (hasAttribute) {
    const attributeValue = filterMatch[FILTER_ATTRIBUTE_VALUE]
    if (attributeValue) {
      return nodes.filter(node => node.getAttribute(hasAttribute) === attributeValue)
    }
    return nodes.filter(node => !!node.getAttribute(hasAttribute))
  }
  if (filterMatch[FILTER_CONTAINS_ATTRIBUTE]) {
    const containsAttribute = filterMatch[FILTER_CONTAINS_ATTRIBUTE]
    const containsValue = filterMatch[FILTER_CONTAINS_VALUE]
    return nodes.filter(node => (node.getAttribute(containsAttribute) || '').includes(containsValue))
  }
  // assuming 'and'
  return nodes
}

function _processLevel (contextNode, isAnyLevel, isAttribute) {
  if (isAnyLevel) {
    return contextNode._getSelfAndAllChildren()
  }
  if (isAttribute) {
    return [contextNode]
  }
  return contextNode.childNodes
}

function _processXPath (xpathMatch, contextNodes, namespaceResolver) {
  const isAnyLevel = xpathMatch[XPATH_LEVEL] === '//'
  const isAttribute = !!xpathMatch[XPATH_ATTRIBUTE]
  const namespace = (xpathMatch[XPATH_NAMESPACE_PREFIX] && namespaceResolver(xpathMatch[XPATH_NAMESPACE_PREFIX])) || XHTML_NAMESPACE
  const name = xpathMatch[XPATH_NAME]
  if (isAnyLevel && contextNodes.root) {
    contextNodes = [contextNodes[0]._hierarchy[0]]
  }
  return contextNodes.reduce((resultNodes, contextNode) => {
    let nodes = _processLevel(contextNode, isAnyLevel, isAttribute)
    if (isAttribute) {
      nodes = nodes.reduce((attributeNodes, node) => [...attributeNodes, ..._getAttributeNodes(node)], [])
    } else {
      nodes = nodes.filter(node => node.nodeType === Node.ELEMENT_NODE)
      nodes = nodes.filter(node => node.namespaceURI === namespace)
    }
    if (name !== '*') {
      nodes = nodes.filter(node => node.localName === name)
    }
    const filter = xpathMatch[XPATH_FILTER]
    if (filter) {
      reFilter.lastIndex = 0
      let filterMatch = reFilter.exec(filter)
      while (nodes.length && filterMatch) {
        nodes = _processFilter(filterMatch, nodes)
        filterMatch = reFilter.exec(filter) // Assess and has been used
      }
    }
    return [...resultNodes, ...nodes]
  }, [])
}

XPathResult.evaluate = function (xpathExpression, contextNode, namespaceResolver, resultType, result) {
  const root = [contextNode]
  root.root = true
  let allNodes = []
  let nodes = root
  reXPath.lastIndex = 0
  let xpathMatch = reXPath.exec(xpathExpression)
  while (nodes.length && xpathMatch) {
    if (xpathMatch[XPATH_OR]) {
      allNodes = [...allNodes, ...nodes]
      nodes = root
    } else {
      nodes = _processXPath(xpathMatch, nodes, namespaceResolver)
    }
    xpathMatch = reXPath.exec(xpathExpression)
  }
  return new XPathResult([...allNodes, ...nodes])
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
