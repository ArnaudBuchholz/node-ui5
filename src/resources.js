'use strict'

require('colors')
const fs = require('fs')
const gpf = require('gpf-js')
const debug = require('./debug')
const { promisify } = require('util')
const Traces = require('./Traces')

const accessAsync = promisify(fs.access)
const readFileAsync = promisify(fs.readFile)

const RESOURCE_ROOT_PREFIX = '/_/'

function inject (settings, url, content) {
  if (settings.traces.enabled.ui5) {
    return debug.inject(settings, url, content)
  }
  return content
}

function sendFile (settings, url, filePath) {
  return accessAsync(filePath, fs.constants.R_OK)
    .then(() => readFileAsync(filePath))
    .then(buffer => buffer.toString())
    .then(content => {
      settings.traces.resource(url, content.length.toString(), Traces.SUCCESS)
      return inject(settings, url, content)
    })
    .catch(reason => {
      settings.traces.resource(url, reason.toString(), Traces.ERROR)
      return ''
    })
}

async function sendUrl (settings, url) {
  const response = await gpf.http.get(url)
  if (response.status.toString().startsWith('2')) {
    settings.traces.resource(url, `${response.status} ${response.responseText.length}`, Traces.SUCCESS)
    return inject(settings, url, response.responseText)
  } else {
    settings.traces.resource(url, response.status.toString(), Traces.ERROR)
    return ''
  }
}

module.exports = {

  declare: (settings, resourceroot) => {
    if (resourceroot.startsWith('http')) {
      return resourceroot
    }
    const resPrefix = settings.baseURL + RESOURCE_ROOT_PREFIX
    if (resourceroot.startsWith(settings.bootstrap.base)) {
        return resPrefix + 'resources' + resourceroot.substring(settings.bootstrap.base.length)
    }
    return resPrefix + resourceroot.replace(/\\/g, '/')
  },

  read: (settings, url) => {
    if (url.startsWith(settings.bootstrap.base)) {
      return sendUrl(settings, url)
    }
    const resPrefix = settings.baseURL + RESOURCE_ROOT_PREFIX
    if (url.startsWith(resPrefix)) {
      let filePath = decodeURIComponent(url.substring(resPrefix.length))
      if (filePath.endsWith('-dbg.js') && filePath.includes('/node-ui5/lib/')) {
        filePath = filePath.replace(/-dbg\.js$/, '.js')
      }
      if (filePath.startsWith('resources/')) {
          return sendFile(settings, url, settings.bootstrap.base + filePath.substring(9))
      }
      return sendFile(settings, url, filePath)
    }
    return null
  }

}
