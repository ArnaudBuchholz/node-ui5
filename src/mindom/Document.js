'use strict'

const Element = require('./Element')
const Node = require('./Node')
const XPathResult = require('./XPathResult')

const resources = require('../resources')

const { $nodeType, $settings, $window } = require('./const')
const $scripts = Symbol('scripts')
const $scriptLoading = Symbol('scriptLoading')

class Document extends Element {
  constructor (window, settings) {
    super(window, undefined, Node.DOCUMENT_NODE)
    this[$scripts] = []
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

  evaluate (xpathExpression, contextNode, namespaceResolver, resultType, result) {
    return XPathResult.evaluate(xpathExpression, contextNode, namespaceResolver, resultType, result)
  }

  getElementById (id) {
    return this._getSelfAndAllChildren().filter(node => node[$nodeType] === Node.ELEMENT_NODE && node.id === id)[0] || null
  }

  get hidden () {
    return true
  }

  get implementation () {
    return {
      createHTMLDocument: () => {
        return new Document(this[$window], this[$settings])
      }
    }
  }

  get location () {
    return this[$window].location
  }

  get nodeName () {
    return '#document'
  }

  _onNewChild (node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'script') {
      this[$scripts].push(node)
      this._processScripts()
    }
  }

  _processScripts () {
    const script = this[$scripts][0]
    if (script[$scriptLoading]) {
      return
    }
    script[$scriptLoading] = true
    Promise.resolve()
      .then(() => {
        const src = script.getAttribute('src')
        if (src) {
          return Promise.resolve()
            .then(() => resources.read(this[$window][$settings], src))
            .then(content => {
              script.textContent = content
            })
        }
      })
      .then(() => {
        const content = script.textContent
        this[$window].eval(content)
        this[$scripts].shift()
        script.dispatchEvent({ type: 'load' })
        if (this[$scripts].length) {
          this._processScripts()
        }
      })
  }

  get readyState () {
    return 'complete'
  }

  get scripts () {
    return []
  }

  write (html) {
    const document = new Document(this[$window])
    document._clearChildren()
    document._onNewChild = () => {}
    const parser = new this[$window].DOMParser()
    parser._parseHTMLFromString(document, html)
    const node = document.childNodes[0]
    this.appendChild(document.childNodes[0])
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
