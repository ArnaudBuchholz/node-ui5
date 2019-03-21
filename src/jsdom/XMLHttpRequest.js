'use strict'

const MinDomXMLHttpRequest = require('../mindom/XMLHttpRequest')

module.exports = function (settings) {
  return class XMLHttpRequest extends MinDomXMLHttpRequest {
    constructor () {
      super(settings)
    }
  }
}
