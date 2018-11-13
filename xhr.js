const http = require('http')
const https = require('https')
const resources = require('./resources')
const $events = Symbol('events')
const $content = Symbol('content')

// Simple XHR hook to handle local files (it can't be done with sinon / nise or it conflicts with OpenUI5's one)
module.exports = XMLHttpRequest => {
  const {
    addEventListener,
    open,
    setRequestHeader,
    send
  } = XMLHttpRequest.prototype

  XMLHttpRequest.prototype.addEventListener = function (eventName, eventHandler) {
    if (!this[$events]) {
      this[$events] = {}
    }
    if (!this[$events][eventName]) {
      this[$events][eventName] = []
    }
    this[$events][eventName].push(eventHandler)
    return addEventListener.apply(this, arguments)
  }

  XMLHttpRequest.prototype.open = function (method, url, synchronous) {
    if (method === 'GET') {
      this[$content] = resources.read(url)
    }
    if (this[$content] === undefined) {
      // Re-implement XHR to bypass CORS
      const service = url.startsWith('https') ? https : http

      return open.apply(this, arguments)
    }
  }

  XMLHttpRequest.prototype.setRequestHeader = function () {
    if (undefined === this[$content]) {
      setRequestHeader.apply(this, arguments)
    }
  }

  XMLHttpRequest.prototype.send = function () {
    const content = this[$content]
    if (undefined !== content) {
      Object.defineProperty(this, 'readyState', { get: () => 4 })
      Object.defineProperty(this, 'responseText', { get: () => content || '' })
      Object.defineProperty(this, 'status', { get: () => content !== null ? 200 : 404 })
      if (this.onreadystatechange) {
        this.onreadystatechange()
      }
      'readystatechange,load'
        .split(',')
        .forEach(eventName => this[$events][eventName]
          ? this[$events][eventName].forEach(eventHandler => eventHandler(this))
          : 0
        )
      return
    }
    send.apply(this, arguments)
  }
}
