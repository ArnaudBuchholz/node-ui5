const gpf = require('gpf-js')
const resources = require('./resources')
const $events = Symbol('events')
const $content = Symbol('content')
const $request = Symbol('request')
const $headers = Symbol('headers')

// Simple XHR hook to load resources and bypass CORS
module.exports = XMLHttpRequest => {
  XMLHttpRequest.prototype.addEventListener = function (eventName, eventHandler) {
    if (!this[$events]) {
      this[$events] = {}
    }
    if (!this[$events][eventName]) {
      this[$events][eventName] = []
    }
    this[$events][eventName].push(eventHandler)
  }

  XMLHttpRequest.prototype.open = function (method, url, synchronous) {
    if (method === 'GET') {
      this[$content] = resources.read(url)
    }
    if (this[$content] === undefined) {
      this[$request] = {
        method,
        url,
        headers: {}
      }
    }
  }

  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    if (this[$content] === undefined) {
      this[$request].headers[name] = value
    }
  }

  function _setResult (xhr, responseText, status) {
    Object.defineProperty(xhr, 'readyState', { get: () => 4 })
    Object.defineProperty(xhr, 'responseText', { get: () => responseText || '' })
    Object.defineProperty(xhr, 'status', { get: () => status })
    if (xhr.onreadystatechange) {
      xhr.onreadystatechange()
    }
    'readystatechange,load'
      .split(',')
      .forEach(eventName => xhr[$events][eventName]
        ? xhr[$events][eventName].forEach(eventHandler => eventHandler(xhr))
        : 0
      )
  }

  XMLHttpRequest.prototype.send = function (data) {
    const content = this[$content]
    if (undefined !== content) {
      this[$headers] = {}
      _setResult(this, content || '', content !== null ? 200 : 404)
    } else {
      this[$request].data = data
      gpf.http.request(this[$request]).then(response => {
        this[$headers] = response.headers
        _setResult(this, response.responseText, response.status)
      })
    }
  }

  XMLHttpRequest.prototype.getAllResponseHeaders = function () {
    return Object.keys(this[$headers]).reduce((list, name) => {
      list.push(name + ': ' + this[$headers][name])
      return list
    }, []).join('\r\n')
  }

  XMLHttpRequest.prototype.getResponseHeader = function (name) {
    return this[$headers][name] || null
  }
}
