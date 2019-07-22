'use strict'

const gpf = require('gpf-js')
const deasync = require('deasync')
const EventTarget = require('./EventTarget')
const resources = require('../resources')

const { $settings } = require('./const')
const $content = Symbol('content')
const $request = Symbol('request')
const $headers = Symbol('headers')
const $withCredentials = Symbol('headers')

class XMLHttpRequest extends EventTarget {
  constructor (settings) {
    super()
    this[$settings] = settings
  }

  open (method, url, asynchronous) {
    this[$request] = {
      method,
      url,
      headers: {},
      asynchronous: asynchronous !== false
    }
    if (true || this[$settings].debug) {
      console.log('XHR'.magenta, `${method} ${url}`.gray)
    }
    if (method === 'GET') {
      this[$content] = resources.read({ ...this[$settings], verbose: false }, url)
    }
  }

  setRequestHeader (name, value) {
    if (true || this[$settings].debug) {
      console.log('XHR'.magenta, `HEADER >> ${name}: ${value}`.gray)
    }
    this[$request].headers[name] = value
  }

  _setResult (responseText, status) {
    if (this[$settings].verbose) {
      const request = this[$request]
      let report
      if (status.toString().startsWith(2)) {
        report = `${status} ${responseText.length}`.green
      } else {
        report = status.toString().red
      }
      if (this[$content]) {
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

  _debugHeaders (headers) {
    if (true || this[$settings].debug) {
      Object.keys(headers).forEach(name => {
        console.log('XHR'.magenta, `HEADER << ${name}: ${headers[name]}`.gray)
      })
    }
  }

  _debugText (type, text) {
    if (true || this[$settings].debug) {
      console.log('XHR'.magenta, `${type} (content-length: ${text.length})`.gray)
      text.split('\n').every((line, index) => {
        if (index === 6) {
          console.log('XHR'.magenta, `${type}  ...`.gray)
        } else {
          console.log('XHR'.magenta, `${type}  ${line}`.gray)
        }
        return index < 6
      })
    }
  }

  send (data) {
    let requestInProgress = true
    Promise.resolve(this[$content])
      .then(content => {
        if (null !== content) {
          return this._setResult(content || '', content !== null ? 200 : 404)
        }
        const request = this[$request]
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
      deasync.loopWhile(() => requestInProgress)
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
