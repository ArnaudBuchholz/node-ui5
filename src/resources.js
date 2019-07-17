'use strict'

require('colors')
const fs = require('fs')
const path = require('path')
const gpf = require('gpf-js')
const debug = require('./debug')
const RESOURCE_ROOT_PREFIX = '/_/'

function trace (settings, url, status) {
  if (settings.verbose) {
    console.log('RES'.magenta, url.cyan, status)
  }
}

function inject (settings, url, content) {
  if (settings.debug) {
    return debug.inject(settings, url, content)
  }
  return content
}

function sendFile (settings, url, filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK)
    const content = fs.readFileSync(filePath).toString()
    trace(settings, url, content.length.toString().green)
    return inject(settings, url, content)
  } catch (e) {
    trace(settings, url, e.toString().red)
  }
  return null // resource but not found
}

function sendUrl (settings, url) {
  return gpf.http.get(url).then(response => {
    if (response.status.toString().startsWith('2')) {
      trace(settings, url, `${response.status} ${response.responseText.length}`.green)
      return inject(settings, url, response.responseText)
    } else {
      trace(settings, url, `${response.status}`.red)
      return ''
    }
  })
}

module.exports = {

  declare: (settings, resourceroot) => {
    if (resourceroot.startsWith('http')) {
      return resourceroot
    }
    return settings.baseURL + RESOURCE_ROOT_PREFIX + resourceroot
  },

  read: (settings, url) => {
    const isHttpUrl = url.startsWith('http')
    if (isHttpUrl && url === settings.bootstrapLocation) {
      return sendUrl(settings, url)
    }
    const sResourceRoot = settings.baseURL + RESOURCE_ROOT_PREFIX
    if (url.startsWith(sResourceRoot)) {
      return sendFile(settings, url, url.substring(sResourceRoot.length))
    }
    const dirname = path.dirname(settings.bootstrapLocation)
    if (!isHttpUrl && url.startsWith(dirname)) {
      return sendFile(settings, url, url)
    }
    const reResource = new RegExp(`^(?:${settings.baseURL})?\bresources/(.*)$`)
    const match = reResource.exec(url)
    if (!match) {
      return
    }
    if (url.endsWith('css')) {
      trace(settings, url, 'css'.green)
      return '/* style must not be empty */'
    }
    return sendFile(settings, url, path.join(dirname, '..', match[1]))
  }

}
