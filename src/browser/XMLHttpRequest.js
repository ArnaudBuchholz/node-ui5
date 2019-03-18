'use strict'

const gpf = require('gpf-js')
const deasync = require('deasync')
const EventTarget = require('./EventTarget')
const resources = require('../resources')

const { $settings } = require('./const')
const $content = Symbol('content')
const $request = Symbol('request')
const $headers = Symbol('headers')

class XMLHttpRequest {
  constructor (settings) {
    this[$settings] = settings
  }

  open (method, url, asynchronous) {
    this[$request] = {
      method,
      url,
      headers: {},
      asynchronous: asynchronous !== false
    }
    if (method === 'GET') {
      this[$content] = resources.read(Object.assign({}, this[$settings], { verbose: false }), url)
    }
  }

  setRequestHeader (name, value) {
    this[$request].headers[name] = value
  }

  _setResult (responseText, status) {
    if (this[$settings].verbose) {
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
    Object.defineProperty(this, 'readyState', { get: () => 4 })
    Object.defineProperty(this, 'responseText', { get: () => responseText || '' })
    Object.defineProperty(this, 'status', { get: () => status })
    this.dispatchEvent({ type: 'readystatechange' })
    this.dispatchEvent({ type: 'load' })
  }

  send (data) {
    const content = this[$content]
    if (undefined !== content) {
      this[$headers] = {}
      this._setResult(content || '', content !== null ? 200 : 404)
    } else {
      const request = this[$request]
      request.data = data
      let requestInProgress = true
      gpf.http.request(request).then(response => {
        this[$headers] = response.headers
        this._setResult(response.responseText, response.status)
        requestInProgress = false
      })
      if (!request.asynchronous) {
        deasync.loopWhile(() => requestInProgress)
      }
    }
  }

  getAllResponseHeaders () {
    return Object.keys(this[$headers]).reduce((list, name) => {
      list.push(name + ': ' + this[$headers][name])
      return list
    }, []).join('\r\n')
  }

  getResponseHeader (name) {
    return this[$headers][name] || null
  }
}

EventTarget.mixin(XMLHttpRequest)

module.exports = XMLHttpRequest
