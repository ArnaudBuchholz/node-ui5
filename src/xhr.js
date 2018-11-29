'use strict'

const gpf = require('gpf-js')
const syncRequest = require('sync-request')
const resources = require('./resources')
const $events = Symbol('events')
const $content = Symbol('content')
const $request = Symbol('request')
const $headers = Symbol('headers')

// Simple XHR hook to load resources and bypass CORS

module.exports = (settings, XMLHttpRequest) => {
  XMLHttpRequest.prototype.addEventListener = function (eventName, eventHandler) {
    if (!this[$events]) {
      this[$events] = {}
    }
    if (!this[$events][eventName]) {
      this[$events][eventName] = []
    }
    this[$events][eventName].push(eventHandler)
  }

  XMLHttpRequest.prototype.open = function (method, url, asynchronous) {
    this[$request] = {
      method,
      url,
      headers: {},
      asynchronous
    }
    if (method === 'GET') {
      this[$content] = resources.read(Object.assign({}, settings, { verbose: false }), url)
    }
  }

  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    if (this[$content] === undefined) {
      this[$request].headers[name] = value
    }
  }

  function _setResult (xhr, responseText, status) {
    if (settings.verbose) {
      const request = xhr[$request]
      let report
      if (status.toString().startsWith(2)) {
        report = `${status} ${responseText.length}`.green
      } else {
        report = status.toString().red
      }
      if (xhr[$content]) {
        report += ' sync resource'.magenta
      } else if (!request.asynchronous) {
        report += ' synchronous'.magenta
      }
      console.log('XHR'.magenta, `${request.method} ${request.url}`.cyan, report)
    }
    Object.defineProperty(xhr, 'readyState', { get: () => 4 })
    Object.defineProperty(xhr, 'responseText', { get: () => responseText || '' })
    Object.defineProperty(xhr, 'status', { get: () => status })
    if (xhr.onreadystatechange) {
      xhr.onreadystatechange()
    }
    if (xhr[$events]) {
      'readystatechange,load'
        .split(',')
        .forEach(eventName => xhr[$events][eventName]
          ? xhr[$events][eventName].forEach(eventHandler => eventHandler(xhr))
          : 0
        )
    }
  }

  XMLHttpRequest.prototype.send = function (data) {
    const content = this[$content]
    if (undefined !== content) {
      this[$headers] = {}
      _setResult(this, content || '', content !== null ? 200 : 404)
    } else {
      const request = this[$request]
      if (request.asynchronous) {
        request.data = data
        gpf.http.request(request).then(response => {
          this[$headers] = response.headers
          _setResult(this, response.responseText, response.status)
        })
      } else {
        const response = syncRequest(request.method, request.url, request.headers)
        this[$headers] = response.headers
        _setResult(this, response.body.toString(), response.statusCode)
      }
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
