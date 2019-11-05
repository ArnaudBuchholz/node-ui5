'use strict'

const gpf = require('gpf-js')
const deasync = require('deasync')
const EventTarget = require('./EventTarget')
const resources = require('../resources')
const Traces = require('../Traces')

const { $settings } = require('./const')
const $content = Symbol('content')
const $request = Symbol('request')
const $headers = Symbol('headers')
const $withCredentials = Symbol('withCredentials')

let _lastId = 0

class XMLHttpRequest extends EventTarget {
  constructor (settings) {
    super()
    this[$settings] = settings
  }

  _trace (text, status = '', level = Traces.INFO) {
    this[$settings].traces.network(this[$request].id, text, status, level)
  }

  open (method, url, asynchronous) {
    this[$request] = {
      id: ++_lastId,
      method,
      url,
      headers: {},
      asynchronous: asynchronous !== false
    }
    this._trace(`${method} ${url}`)
    if (method === 'GET') {
      this[$content] = resources.read({ ...this[$settings], verbose: false }, url)
    }
  }

  setRequestHeader (name, value) {
    this._trace(`HEADER >> ${name}: ${value}`)
    this[$request].headers[name] = value
  }

  _setResult (responseText, status) {
    const request = this[$request]
    let traceStatus
    let traceLevel
    if (status.toString().startsWith(2)) {
      traceStatus = `${status} ${responseText.length}`
      traceLevel = Traces.SUCCESS
    } else {
      traceStatus = status.toString()
      traceLevel = Traces.ERROR
    }
    this._trace(`${request.method} ${request.url}`, traceStatus, traceLevel)
    Object.defineProperty(this, 'readyState', { get: () => 4 })
    Object.defineProperty(this, 'responseText', { get: () => responseText || '' })
    Object.defineProperty(this, 'status', { get: () => status })
    this.dispatchEvent({ type: 'readystatechange' })
    this.dispatchEvent({ type: 'load' })
  }

  _debugHeaders (headers) {
    Object.keys(headers).forEach(name => this._trace(`HEADER << ${name}: ${headers[name]}`), this)
  }

  _debugText (type, text) {
    this._trace(`${type} (content-length: ${text.length})`)
    const lines = text.split('\n')
    lines.slice(0, 6).forEach(line => this._trace(`${type}  ${line}`), this)
    if (lines.length > 5) {
      this._trace(`${type}  ...`)
    }
  }

  send (data) {
    const request = this[$request]
    let requestInProgress = true
    Promise.resolve(this[$content])
      .then(content => {
        if (content !== null) {
          return this._setResult(content || '', content ? 200 : 404)
        }
        if (!request.url.startsWith('http')) {
          // No way to handle this request
          return this._setResult('', 501)
        }
        request.data = data
        if (data) {
          this._debugText('REQUEST >>', data)
        }
        return gpf.http.request(request).then(response => {
          this[$headers] = response.headers
          this._debugHeaders(response.headers)
          this._debugText('RESPONSE <<', response.responseText)
          this._setResult(response.responseText, response.status)
        })
      })
      .finally(() => {
        requestInProgress = false
      })
    if (!request.asynchronous) {
      this._trace(`${request.method} ${request.url}`, 'sync send')
      deasync.loopWhile(() => requestInProgress)
    } else {
      this._trace(`${request.method} ${request.url}`, 'async send')
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

  get withCredentials () {
    return this[$withCredentials]
  }

  set withCredentials (value) {
    this[$withCredentials] = value
  }
}

XMLHttpRequest.prototype[$headers] = {}
XMLHttpRequest.prototype[$withCredentials] = false

module.exports = XMLHttpRequest
