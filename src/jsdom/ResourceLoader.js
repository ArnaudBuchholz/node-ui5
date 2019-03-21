'use strict'

const jsdom = require('jsdom')
const resources = require('../resources')

class ResourceLoader extends jsdom.ResourceLoader {
  constructor (settings) {
    super()
    this._settings = settings
  }

  fetch (url, options) {
    const content = resources.read(this._settings, url)
    if (content) {
      return Promise.resolve(Buffer.from(content))
    }
    return null
  }
}

module.exports = ResourceLoader
